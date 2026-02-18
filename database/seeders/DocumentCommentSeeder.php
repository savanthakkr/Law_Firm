<?php

namespace Database\Seeders;

use App\Models\Document;
use App\Models\DocumentComment;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DocumentCommentSeeder extends Seeder
{
    public function run(): void
    {
        $companyUsers = User::where('type', 'company')->get();
        
        foreach ($companyUsers as $companyUser) {
            $documents = Document::where('created_by', $companyUser->id)->get();
            
            if ($documents->count() > 0) {
                // Create 2-3 document comments per company
                $commentCount = rand(8, 10);
                $commentTexts = [
                    'Please review the terms in section 3',
                    'This looks good, approved for final version',
                    'Need to update the client information',
                    'Consider revising the payment terms',
                    'Legal review completed successfully',
                    'Minor formatting issues need correction',
                    'Content approved for client distribution',
                    'Requires additional legal clauses'
                ];
                
                for ($i = 1; $i <= $commentCount; $i++) {
                    $document = $documents->random();
                    $commentText = $commentTexts[($companyUser->id + $i - 1) % count($commentTexts)];
                    
                    DocumentComment::firstOrCreate([
                        'document_id' => $document->id,
                        'comment_text' => $commentText,
                        'created_by' => $companyUser->id
                    ], [
                        'document_id' => $document->id,
                        'comment_text' => $commentText,
                        'is_resolved' => rand(1, 10) > 6, // 40% chance resolved
                        'created_by' => $companyUser->id,
                    ]);
                }
            }
        }
    }
}