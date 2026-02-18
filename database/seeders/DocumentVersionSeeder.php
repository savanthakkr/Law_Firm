<?php

namespace Database\Seeders;

use App\Models\Document;
use App\Models\DocumentVersion;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DocumentVersionSeeder extends Seeder
{
    public function run(): void
    {
        $companyUsers = User::where('type', 'company')->get();
        
        foreach ($companyUsers as $companyUser) {
            $documents = Document::where('created_by', $companyUser->id)->get();
            
            if ($documents->count() > 0) {
                // Create 2-3 document versions per company
                $versionCount = rand(8, 10);
                $changeDescriptions = [
                    'Initial version',
                    'Updated legal terms and conditions',
                    'Revised client information section',
                    'Final review and corrections',
                    'Added new clauses and provisions',
                    'Formatting and style improvements'
                ];
                
                for ($i = 1; $i <= $versionCount; $i++) {
                    $document = $documents->random();
                    $versionNumber = '1.' . ($i - 1);
                    
                    DocumentVersion::firstOrCreate([
                        'document_id' => $document->id,
                        'version_number' => $versionNumber
                    ], [
                        'document_id' => $document->id,
                        'version_number' => $versionNumber,
                        'file_path' => str_replace('.pdf', '_v' . $versionNumber . '.pdf', $document->file_path),
                        'changes_description' => $changeDescriptions[($companyUser->id + $i - 1) % count($changeDescriptions)],
                        'is_current' => $i === $versionCount, // Last version is current
                        'created_by' => $companyUser->id,
                    ]);
                }
            }
        }
    }
}