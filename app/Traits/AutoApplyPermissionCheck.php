<?php

namespace App\Traits;

use Spatie\Permission\Exceptions\PermissionDoesNotExist;
use Illuminate\Support\Facades\Schema;

trait AutoApplyPermissionCheck
{
    /**
     * Apply permission check to a model query
     *
     * @param string $modelClass The fully qualified model class name
     * @return \Illuminate\Database\Eloquent\Builder
     */
    protected function queryWithPermission($modelClass)
    {
        return $modelClass::withPermissionCheck();
    }

    /**
     * Apply permission scope to the query based on user's permissions
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @param string $module The module name (e.g., 'roles', 'permissions')
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function applyPermissionScope($query, $module)
    {
        // Skip permission check if no authenticated user (e.g., in console commands)
        if (!auth()->check()) {
            return $query;
        }

        // Normalize module name to use hyphens (permissions use hyphen format)
        $module = str_replace('_', '-', $module);

        $user = auth()->user();

        // Check if user is superadmin - they can see everything
        if ($user->hasRole(['superadmin'])) {
            return $query;
        }

        // For company users, show only their created records
        if ($user->hasRole(['company'])) {
            if (get_class($query->getModel()) === 'App\Models\CaseNote') {
                $teamMemberIds = \App\Models\User::where('created_by', $user->id)->where('type', 'team_member')->pluck('id')->toArray();
                $allowedCreators = array_merge([$user->id], $teamMemberIds);
                return $query->whereIn('created_by', $allowedCreators);
            }
            if (Schema::hasColumn($query->getModel()->getTable(), 'created_by')) {
                return $query->where('created_by', $user->id);
            }
        }
        // For clients, apply client-specific filtering
        if ($user->hasRole(['client'])) {
            return $this->applyClientFiltering($query, $user);
        }

        // For team members, apply role-based filtering
        if ($user->hasRole(['team_member']) || $user->type === 'team_member' || strpos($user->type, 'team-member') !== false) {
            return $this->applyTeamMemberFiltering($query, $user);
        }

        try {
            if ($user->hasPermissionTo("manage-own-{$module}")) {
                if (Schema::hasColumn($query->getModel()->getTable(), 'created_by')) {
                    return $query->where('created_by', $user->id);
                }
                return $query;
            }
            // If user has permission to list all items, return the query without filtering
            if ($user->hasPermissionTo("manage-any-{$module}") ||  $user->hasPermissionTo("manage-{$module}")) {
                if (Schema::hasColumn($query->getModel()->getTable(), 'created_by')) {
                    return $query->whereIn('created_by', getCompanyAndUsersId());
                }
            }
        } catch (PermissionDoesNotExist $e) {
            if ($user->hasPermissionTo("view-{$module}")) {
                // Default to showing only own records if they have view permission
                if (Schema::hasColumn($query->getModel()->getTable(), 'created_by')) {
                    return $query->where('created_by', $user->id);
                }
                return $query;
            }
        }

        // try {
        //     // If user has permission to list only their own items, filter by created_by
        //     if ($user->hasPermissionTo("manage-own-{$module}")) {
        //         if (Schema::hasColumn($query->getModel()->getTable(), 'created_by')) {
        //             return $query->where('created_by', $user->id);
        //         }
        //         return $query;
        //     }
        // } catch (PermissionDoesNotExist $e) {
        //     // Permission doesn't exist, check for view permission instead
        //     if ($user->hasPermissionTo("view-{$module}")) {
        //         // Default to showing only own records if they have view permission
        //         if (Schema::hasColumn($query->getModel()->getTable(), 'created_by')) {
        //             return $query->where('created_by', $user->id);
        //         }
        //         return $query;
        //     }
        // }

        // If user doesn't have any relevant permissions, return no results
        return $query;
    }

    /**
     * Apply team member specific filtering based on model type
     */
    private function applyTeamMemberFiltering($query, $user)
    {
        $modelClass = get_class($query->getModel());

        switch ($modelClass) {
            // Core modules
            case 'App\Models\Task':
                return $query->where(function ($q) use ($user) {
                    $q->where('assigned_to', $user->id)
                        ->orWhereHas('case.teamMembers', function ($subQ) use ($user) {
                            $subQ->where('user_id', $user->id);
                        });
                });

            case 'App\Models\CalendarEvent':
            case 'App\Models\Event':
                return $query->where(function ($q) use ($user) {
                    $q->where('created_by', $user->id)
                        ->orWhere('assigned_to', $user->id)
                        ->orWhereHas('attendees', function ($subQ) use ($user) {
                            $subQ->where('user_id', $user->id);
                        });
                });
            case 'App\Models\TimeEntry':
                return $query->where(function ($q) use ($user) {
                    $q->where('user_id', $user->id)
                        ->orWhereHas('case.teamMembers', function ($subQ) use ($user) {
                            $subQ->where('user_id', $user->id);
                        });
                });

            case 'App\Models\CaseModel':
                return $query->whereHas('teamMembers', function ($q) use ($user) {
                    $q->where('user_id', $user->id);
                });

                // Case related modules
            case 'App\Models\CaseDocument':
                return $query->whereHas('case.teamMembers', function ($q) use ($user) {
                    $q->where('user_id', $user->id);
                });

            case 'App\Models\CaseNote':
                $companyId = $user->created_by;
                $teamMemberIds = \App\Models\User::where('created_by', $companyId)->where('type', 'team_member')->pluck('id')->toArray();
                $allowedCreators = array_merge([$companyId], $teamMemberIds);
                return $query->whereIn('created_by', $allowedCreators);

            case 'App\Models\CaseTimeline':
                return $query->whereHas('case.teamMembers', function ($q) use ($user) {
                    $q->where('user_id', $user->id);
                });

                // Client related modules
            case 'App\Models\Client':
                return $query->whereHas('cases.teamMembers', function ($q) use ($user) {
                    $q->where('user_id', $user->id);
                });

            case 'App\Models\ClientDocument':
            case 'App\Models\ClientBillingInfo':
                return $query->whereHas('client.cases.teamMembers', function ($q) use ($user) {
                    $q->where('user_id', $user->id);
                });


                // Document related modules
            case 'App\Models\Document':
                $companyId = $user->created_by;
                return $query->where(function ($q) use ($user, $companyId) {
                    $q->where('created_by', $companyId)
                        ->orWhereExists(function ($subQuery) use ($user) {
                            $subQuery->select('id')
                                ->from('document_permissions')
                                ->whereColumn('document_permissions.document_id', 'documents.id')
                                ->where('document_permissions.user_id', $user->id)
                                ->where(function ($expQuery) {
                                    $expQuery->whereNull('expires_at')
                                        ->orWhere('expires_at', '>', now());
                                });
                        });
                });

            case 'App\Models\DocumentComment':
                $companyId = $user->created_by;
                return $query->whereHas('document', function ($q) use ($user, $companyId) {
                    $q->where(function ($subQ) use ($user, $companyId) {
                        $subQ->where('created_by', $companyId)
                            ->orWhereExists(function ($subQuery) use ($user) {
                                $subQuery->select('id')
                                    ->from('document_permissions')
                                    ->whereColumn('document_permissions.document_id', 'documents.id')
                                    ->where('document_permissions.user_id', $user->id)
                                    ->where(function ($expQuery) {
                                        $expQuery->whereNull('expires_at')
                                            ->orWhere('expires_at', '>', now());
                                    });
                            });
                    });
                });

            case 'App\Models\DocumentPermission':
                return $query->where('user_id', $user->id)
                    ->where(function ($q) {
                        $q->whereNull('expires_at')
                            ->orWhere('expires_at', '>', now());
                    });

                // Billing module (view only)
            case 'App\Models\BillingRate':
                return $query->where('created_by', createdBy());

                // Court related
            case 'App\Models\Hearing':
                return $query->whereHas('case.teamMembers', function ($q) use ($user) {
                    $q->where('user_id', $user->id);
                });

                // Research modules
            case 'App\Models\ResearchProject':
                return $query->whereHas('case.teamMembers', function ($q) use ($user) {
                    $q->where('user_id', $user->id);
                });

            case 'App\Models\KnowledgeArticle':
                // For team members, get the company ID that created them
                $companyId = $user->created_by;
                return $query->where('status', 'published')
                    ->where('is_public', 1)
                    ->where('created_by', $companyId);

            case 'App\Models\LegalPrecedent':
                $companyId = $user->created_by;
                return $query->where('created_by', $companyId);

            case 'App\Models\HearingNotification':
                return $query->whereHas('hearing.case.teamMembers', function ($q) use ($user) {
                    $q->where('user_id', $user->id);
                });

                // Communication
            case 'App\Models\Message':
                $companyId = $user->created_by;
                return $query->where(function ($q) use ($user, $companyId) {
                    $q->where('sender_id', $user->id)
                        ->orWhere('recipient_id', $user->id)
                        ->orWhere('company_id', $companyId);
                });

            case 'App\Models\Conversation':
                $companyId = $user->created_by;
                return $query->where(function ($q) use ($user, $companyId) {
                    $q->whereJsonContains('participants', $user->id)
                        ->orWhere('company_id', $companyId);
                });

            case 'App\Models\User':
                return $query->where('created_by', $user->created_by);

            default:
                // For other models, show only user's created records or company records
                if (Schema::hasColumn($query->getModel()->getTable(), 'created_by')) {
                    return $query->where('created_by', createdBy());
                }
                return $query;
        }
    }

    /**
     * Apply client specific filtering
     */
    private function applyClientFiltering($query, $user)
    {
        $client = \App\Models\Client::where('email', $user->email)->first();
        if (!$client) return $query->whereRaw('1 = 0'); // No access if no client record

        $modelClass = get_class($query->getModel());

        switch ($modelClass) {
            case 'App\Models\CaseModel':
                return $query->where('client_id', $client->id);

            case 'App\Models\CaseDocument':
                return $query->whereHas('case', function ($q) use ($client) {
                    $q->where('client_id', $client->id);
                });

            case 'App\Models\CaseNote':
                $companyId = $client->created_by;
                $teamMemberIds = \App\Models\User::where('created_by', $companyId)->where('type', 'team_member')->pluck('id')->toArray();
                $allowedCreators = array_merge([$companyId], $teamMemberIds);
                $clientCaseIds = \App\Models\CaseModel::where('client_id', $client->id)->pluck('id')->toArray();
                
                return $query->where('is_private', 0)
                    ->whereIn('created_by', $allowedCreators)
                    ->where(function ($q) use ($clientCaseIds) {
                        foreach ($clientCaseIds as $caseId) {
                            $q->orWhereJsonContains('case_ids', (string)$caseId);
                        }
                    });
                
            case 'App\Models\CaseTimeline':
                return $query->whereHas('case', function ($q) use ($client) {
                    $q->where('client_id', $client->id);
                });

            case 'App\Models\ClientDocument':
            case 'App\Models\ClientBillingInfo':
                return $query->where('client_id', $client->id);

            case 'App\Models\ClientBillingCurrency':
                return $query->where('created_by', $client->created_by);

            case 'App\Models\Hearing':
                return $query->whereHas('case', function ($q) use ($client) {
                    $q->where('client_id', $client->id);
                });

            case 'App\Models\TimeEntry':
                return $query->where(function ($q) use ($client) {
                    $q->where('client_id', $client->id)
                        ->orWhereHas('case', function ($subQ) use ($client) {
                            $subQ->where('client_id', $client->id);
                        });
                });

            case 'App\Models\Expense':
                return $query->withoutGlobalScope('company')
                    ->where('created_by', $client->created_by)
                    ->whereExists(function ($subQuery) use ($client) {
                        $subQuery->select('id')
                            ->from('cases')
                            ->whereColumn('cases.id', 'expenses.case_id')
                            ->where('cases.client_id', $client->id);
                    });

            case 'App\Models\Invoice':
                return $query->where('client_id', $client->id);

            case 'App\Models\Payment':
                return $query->whereHas('invoice', function ($q) use ($client) {
                    $q->where('client_id', $client->id);
                });

            case 'App\Models\Message':
                return $query->where(function ($q) use ($user) {
                    $q->where('sender_id', $user->id)->orWhere('recipient_id', $user->id);
                });

            case 'App\Models\Conversation':
                return $query->where('company_id', $client->created_by)
                    ->whereJsonContains('participants', $user->id);

            case 'App\Models\KnowledgeArticle':
                return $query->where('status', 'published')
                    ->where('is_public', 1)
                    ->where('created_by', $client->created_by);

            case 'App\Models\LegalPrecedent':
                return $query->where('status', true);

            case 'App\Models\Document':
                return $query->where(function ($q) use ($user, $client) {
                    $q->where('created_by', $client->created_by)
                        ->whereExists(function ($subQuery) use ($user) {
                            $subQuery->select('id')
                                ->from('document_permissions')
                                ->whereColumn('document_permissions.document_id', 'documents.id')
                                ->where('document_permissions.user_id', $user->id)
                                ->where(function ($expQuery) {
                                    $expQuery->whereNull('expires_at')
                                        ->orWhere('expires_at', '>', now());
                                });
                        });
                });

            case 'App\Models\DocumentComment':
                return $query->whereHas('document', function ($q) use ($user, $client) {
                    $q->where('created_by', $client->created_by)
                        ->whereExists(function ($subQuery) use ($user) {
                            $subQuery->select('id')
                                ->from('document_permissions')
                                ->whereColumn('document_permissions.document_id', 'documents.id')
                                ->where('document_permissions.user_id', $user->id)
                                ->where(function ($expQuery) {
                                    $expQuery->whereNull('expires_at')
                                        ->orWhere('expires_at', '>', now());
                                });
                        });
                });

            case 'App\Models\CalendarEvent':
            case 'App\Models\Event':
                return $query->where(function ($q) use ($client) {
                    $q->where('client_id', $client->id)
                        ->orWhereHas('case', function ($subQ) use ($client) {
                            $subQ->where('client_id', $client->id);
                        });
                });

            default:
                return $query->where('created_by', createdBy());
        }
    }
}
