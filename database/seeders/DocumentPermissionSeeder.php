<?php

namespace Database\Seeders;

use App\Models\Document;
use App\Models\DocumentPermission;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DocumentPermissionSeeder extends Seeder
{
    public function run(): void
    {
        $companyUsers = User::where('type', 'company')->get();
        
        foreach ($companyUsers as $companyUser) {
            $documents = Document::where('created_by', $companyUser->id)->get();
            $users = User::where('created_by', $companyUser->id)->get();
            
            if ($documents->count() > 0 && $users->count() > 0) {
                // Create 2-3 document permissions per company
                $permissionCount = rand(4, 6);
                $permissionTypes = ['view', 'edit', 'download', 'comment'];
                
                for ($i = 1; $i <= $permissionCount; $i++) {
                    $document = $documents->random();
                    $user = $users->random();
                    $permissionType = $permissionTypes[rand(0, count($permissionTypes) - 1)];
                    
                    DocumentPermission::firstOrCreate([
                        'document_id' => $document->id,
                        'user_id' => $user->id,
                        'permission_type' => $permissionType,
                        'created_by' => $companyUser->id
                    ], [
                        'document_id' => $document->id,
                        'user_id' => $user->id,
                        'permission_type' => $permissionType,
                        'expires_at' => rand(1, 10) > 7 ? now()->addMonths(rand(3, 12)) : null, // 30% chance of expiration
                        'created_by' => $companyUser->id
                    ]);
                }
            }
        }
    }
}