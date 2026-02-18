<?php

namespace Database\Seeders;

use App\Models\Message;
use App\Models\Conversation;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class MessageSeeder extends Seeder
{
    public function run(): void
    {
        $companyUsers = User::where('type', 'company')->get();
        
        foreach ($companyUsers as $companyUser) {
            $allUsers = User::where('created_by', $companyUser->id)->get();
            $allUsers->push($companyUser); // Include company user
            
            if ($allUsers->count() < 2) {
                continue;
            }
            
            // Create 2-3 direct messages per company
            $messageCount = rand(8, 10);
            $priorities = ['low', 'normal', 'high', 'urgent'];
            $statuses = ['active', 'inactive'];
            
            $subjects = [
                'Case Update Required',
                'Client Meeting Scheduled',
                'Document Review Request',
                'Deadline Reminder',
                'Legal Research Update',
                'Court Filing Notification'
            ];
            
            $contents = [
                'Please review the attached case documents and provide your feedback.',
                'Client meeting has been scheduled for next week. Please confirm your availability.',
                'Document review is required for the upcoming case. Please prioritize this task.',
                'Reminder: Important deadline approaching. Please ensure all tasks are completed.',
                'Legal research has been updated with new findings. Please review.',
                'Court filing has been submitted successfully. Confirmation received.'
            ];
            
            for ($i = 1; $i <= $messageCount; $i++) {
                $sender = $allUsers->random();
                $recipient = $allUsers->where('id', '!=', $sender->id)->random();
                
                // Create direct conversation
                $conversation = null;
                try {
                    $conversation = Conversation::firstOrCreate([
                        'company_id' => $companyUser->id,
                        'type' => 'direct',
                        'participants' => [$sender->id, $recipient->id],
                        'created_by' => $companyUser->id
                    ], [
                        'title' => null,
                        'last_message_at' => now(),
                    ]);
                } catch (\Exception $e) {
                    continue;
                }
                
                $messageData = [
                    'message_id' => null, // Auto-generated
                    'company_id' => $companyUser->id,
                    'sender_id' => $sender->id,
                    'recipient_id' => $recipient->id,
                    'conversation_id' => $conversation->id,
                    'subject' => $subjects[($companyUser->id + $i - 1) % count($subjects)],
                    'content' => $contents[($companyUser->id + $i - 1) % count($contents)] . ' Message #' . $i . ' for ' . $companyUser->name . '.',
                    'message_type' => 'direct',
                    'priority' => $priorities[rand(0, count($priorities) - 1)],
                    'is_read' => rand(1, 10) > 3, // 70% chance read
                    'read_at' => rand(1, 10) > 3 ? now()->subMinutes(rand(1, 1440)) : null,
                    'attachments' => null,
                    'case_id' => null,
                    'status' => $statuses[rand(0, count($statuses) - 1)],
                    'created_by' => $companyUser->id,
                ];
                
                Message::firstOrCreate([
                    'subject' => $messageData['subject'],
                    'sender_id' => $messageData['sender_id'],
                    'recipient_id' => $messageData['recipient_id'],
                    'created_by' => $companyUser->id
                ], $messageData);
            }
        }
    }
}