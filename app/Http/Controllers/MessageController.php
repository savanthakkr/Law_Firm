<?php

namespace App\Http\Controllers;

use App\Models\Message;
use App\Models\Conversation;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MessageController extends Controller
{
    public function index(Request $request)
    {
        $query = Conversation::withPermissionCheck()
            ->with(['messages' => function($q) {
                $q->with('sender')->orderBy('created_at', 'desc');
            }, 'case']);

        if ($request->has('search') && !empty($request->search)) {
            $query->where(function ($q) use ($request) {
                $q->where('title', 'like', '%' . $request->search . '%')
                    ->orWhereHas('messages', function ($msgQuery) use ($request) {
                        $msgQuery->where('content', 'like', '%' . $request->search . '%');
                    })
                    ->orWhereExists(function ($subQuery) use ($request) {
                        $subQuery->select(\DB::raw(1))
                            ->from('users')
                            ->whereRaw('JSON_CONTAINS(conversations.participants, CAST(users.id as JSON))')
                            ->where('users.name', 'like', '%' . $request->search . '%');
                    });
            });
        }

        if ($request->has('type') && $request->type !== 'all') {
            $query->where('type', $request->type);
        }

        $conversations = $query->orderBy('last_message_at', 'desc')
            ->paginate($request->per_page ?? 15);

        // Add receiver data and latest message for each conversation
        $conversations->getCollection()->transform(function ($conversation) {
            if ($conversation->type === 'direct') {
                $receiverId = collect($conversation->participants)
                    ->first(fn($id) => $id !== auth()->id());
                if ($receiverId) {
                    $conversation->receiver = User::find($receiverId);
                }
            }
            // Set latest message for display (first message is latest due to desc order)
            $conversation->latest_message = $conversation->messages->take(1)->toArray();
            // Keep messages in descending order for conversation list
            return $conversation;
        });

        // Get users who already have conversations with auth user
        $existingConversationUserIds = Conversation::where('company_id', createdBy())
            ->whereJsonContains('participants', auth()->id())
            ->where('type', 'direct')
            ->get('participants')
            ->flatMap(function ($conversation) {
                return collect($conversation->participants)->filter(fn($id) => $id !== auth()->id());
            })
            ->unique()
            ->values()
            ->toArray();

        // Get users based on role
        if (auth()->user()->hasRole('client')) {
            // For clients, show only the company user who created them
            $client = \App\Models\Client::where('email', auth()->user()->email)->first();
            $users = User::where('id', $client->created_by)
                ->where('status', 'active')
                ->whereNotIn('id', $existingConversationUserIds)
                ->get(['id', 'name', 'email'])
                ->map(function($user) {
                    return [
                        'id' => $user->id,
                        'name' => $user->name,
                        'email' => $user->email,
                        'type' => 'user'
                    ];
                });
        } else {
            // For other users, use permission check
            $users = User::withPermissionCheck()
                ->where('status', 'active')
                ->where('id', '!=', auth()->id())
                ->whereNotIn('id', $existingConversationUserIds)
                ->get(['id', 'name', 'email'])
                ->map(function($user) {
                    return [
                        'id' => $user->id,
                        'name' => $user->name,
                        'email' => $user->email,
                        'type' => 'user'
                    ];
                });
        }

        // Get clients based on role (exclude those who already have user accounts)
        $clients = collect();
        if (auth()->user()->hasRole('company')) {
            $existingUserEmails = $users->pluck('email')->toArray();
            $clients = \App\Models\Client::where('created_by', createdBy())
                ->where('status', 'active')
                ->whereNotIn('email', $existingUserEmails)
                ->whereNotIn('id', $existingConversationUserIds)
                ->get(['id', 'name', 'email'])
                ->map(function($client) {
                    return [
                        'id' => $client->id,
                        'name' => $client->name . ' (Client)',
                        'email' => $client->email,
                        'type' => 'client'
                    ];
                });
        } elseif (auth()->user()->hasRole('team_member')) {
            $existingUserEmails = $users->pluck('email')->toArray();
            $clients = \App\Models\Client::whereHas('cases.teamMembers', function($q) {
                    $q->where('user_id', auth()->id());
                })
                ->where('status', 'active')
                ->whereNotIn('email', $existingUserEmails)
                ->whereNotIn('id', $existingConversationUserIds)
                ->get(['id', 'name', 'email'])
                ->map(function($client) {
                    return [
                        'id' => $client->id,
                        'name' => $client->name . ' (Client)',
                        'email' => $client->email,
                        'type' => 'client'
                    ];
                });
        }

        // Combine users and clients
        $users = $users->concat($clients)->sortBy('name')->values();

        return Inertia::render('communication/messages/index', [
            'conversations' => $conversations,
            'users' => $users,
            'filters' => $request->all(['search', 'type', 'per_page']),
        ]);
    }

    public function show(Request $request, $conversationId)
    {
        $conversation = Conversation::withPermissionCheck()
            ->with(['case'])
            ->where('id', $conversationId)
            ->first();

        if (!$conversation) {
            return redirect()->route('messages.index')->with('error', 'Conversation not found.');
        }

        $messages = Message::withPermissionCheck()
            ->with(['sender'])
            ->where('conversation_id', $conversationId)
            ->orderBy('created_at', 'asc')
            ->paginate($request->per_page ?? 50);

        // Mark messages as read
        Message::where('conversation_id', $conversationId)
            ->where('recipient_id', auth()->id())
            ->where('is_read', false)
            ->update(['is_read' => true, 'read_at' => now()]);

        return Inertia::render('communication/messages/show', [
            'conversation' => $conversation,
            'messages' => $messages,
            'filters' => $request->all(['per_page']),
        ]);
    }

    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'recipient_id' => 'required_without:conversation_id|integer',
                'conversation_id' => 'required_without:recipient_id|exists:conversations,id',
                'subject' => 'nullable|string|max:255',
                'content' => 'required|string',
                'priority' => 'nullable|in:low,normal,high,urgent',
                'case_id' => 'nullable|exists:cases,id'
            ]);

            $companyId = createdBy() ?: auth()->user()->created_by ?: auth()->id();
            
            $validated['company_id'] = $companyId;
            $validated['sender_id'] = auth()->id();
            $validated['message_type'] = 'direct';
            $validated['priority'] = $validated['priority'] ?? 'normal';
            $validated['created_by'] = $companyId;

            // Create or find conversation
            if (!isset($validated['conversation_id'])) {
                $conversation = Conversation::create([
                    'company_id' => $companyId,
                    'type' => 'direct',
                    'participants' => [auth()->id(), (int)$validated['recipient_id']],
                    'case_id' => $validated['case_id'] ?? null,
                    'last_message_at' => now(),
                    'created_by' => $companyId
                ]);
                $validated['conversation_id'] = $conversation->id;
            } else {
                Conversation::where('id', $validated['conversation_id'])
                    ->update(['last_message_at' => now()]);
            }

            Message::create($validated);

            return redirect()->back()->with('success', 'Message sent successfully.');
        } catch (\Exception $e) {
            \Log::error('Message creation failed: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Failed to send message: ' . $e->getMessage());
        }
    }

    public function getUnreadCount()
    {
        $count = Message::withPermissionCheck()
            ->where('recipient_id', auth()->id())
            ->where('is_read', false)
            ->count();

        return response()->json(['count' => $count]);
    }

    public function getRecentMessages()
    {
        $messages = Message::withPermissionCheck()
            ->with(['sender', 'conversation'])
            ->where('recipient_id', auth()->id())
            ->where('is_read', false)
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        return response()->json(['messages' => $messages]);
    }

    public function getUserDetails($userId)
    {
        $user = User::with(['roles', 'creator'])->findOrFail($userId);
        
        // Get client data if user is a client
        $client = null;
        if ($user->type === 'client') {
            $client = \App\Models\Client::where('email', $user->email)->first();
        }
        
        // Get cases related to this user
        $cases = collect();
        if ($client) {
            $cases = \App\Models\CaseModel::where('client_id', $client->id)
                ->with(['caseStatus', 'caseType'])
                ->get();
        } elseif ($user->hasRole('team_member')) {
            $cases = \App\Models\CaseModel::whereHas('teamMembers', function($q) use ($user) {
                $q->where('user_id', $user->id);
            })->with(['caseStatus', 'caseType'])->get();
        }
        
        return response()->json([
            'user' => array_merge($user->toArray(), [
                'client' => $client,
                'cases' => $cases
            ])
        ]);
    }

    public function destroy($conversationId)
    {
        try {
            $conversation = Conversation::withPermissionCheck()
                ->where('id', $conversationId)
                ->first();

            if (!$conversation) {
                return redirect()->back()->with('error', 'Conversation not found.');
            }

            // Delete all messages in the conversation
            Message::where('conversation_id', $conversationId)->delete();

            // Delete the conversation
            $conversation->delete();

            return redirect()->back()->with('success', 'Conversation deleted successfully.');
        } catch (\Exception $e) {
            \Log::error('Conversation deletion failed: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Failed to delete conversation.');
        }
    }
}