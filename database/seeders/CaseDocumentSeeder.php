<?php

namespace Database\Seeders;

use App\Models\CaseDocument;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CaseDocumentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $companyUsers = User::where('type', 'company')->get();
        
        foreach ($companyUsers as $companyUser) {
            // Get document types for this company
            $documentTypes = \App\Models\DocumentType::where('created_by', $companyUser->id)->pluck('id')->toArray();
            
            // Create default document type if none exists
            if (empty($documentTypes)) {
                $defaultDocType = \App\Models\DocumentType::create([
                    'name' => 'General Document',
                    'description' => 'General document type',
                    'color' => '#3B82F6',
                    'status' => 'active',
                    'created_by' => $companyUser->id
                ]);
                $documentTypes = [$defaultDocType->id];
            }
            
            // Get cases for this company
            $cases = \App\Models\CaseModel::where('created_by', $companyUser->id)->get();
            if ($cases->isEmpty()) continue;
            
            // Get team members for this company
            $teamMembers = User::where('created_by', $companyUser->id)
                ->where('type', 'team_member')
                ->where('status', 'active')
                ->get();
            
            // All users who can create documents (company + team members)
            $allUsers = collect([$companyUser])->merge($teamMembers);
            
            foreach ($cases as $case) {
                $demoImages = [
                    'DemoMedia/a-advocate-saas-pic.png',
                    'DemoMedia/b-advocate-saas-pic.png',
                    'DemoMedia/c-advocate-saas-pic.png',
                    'DemoMedia/client-advocate-saas-pic.png',
                    'DemoMedia/d-advocate-saas-pic.png',
                    'DemoMedia/e-advocate-saas-pic.png',
                    'DemoMedia/f-advocate-saas-pic.png',
                    'DemoMedia/g-advocate-saas-pic.png',
                    'DemoMedia/h-advocate-saas-pic.png',
                    'DemoMedia/i-advocate-saas-pic.png',
                    'DemoMedia/j-advocate-saas-pic.png',
                    'DemoMedia/k-advocate-saas-pic.png',
                ];
                
                $documentTemplates = [
                    [
                        'document_name' => 'Client Service Agreement',
                        'file_path' => $demoImages[array_rand($demoImages)],
                        'description' => 'Initial client service agreement and terms of representation.',
                        'confidentiality' => 'confidential',
                    ],
                    [
                        'document_name' => 'Evidence Collection',
                        'file_path' => $demoImages[array_rand($demoImages)],
                        'description' => 'Photographic and documentary evidence collected for the case.',
                        'confidentiality' => 'privileged',
                    ],
                    [
                        'document_name' => 'Court Filing Documents',
                        'file_path' => $demoImages[array_rand($demoImages)],
                        'description' => 'Official court filing documents and motions.',
                        'confidentiality' => 'public',
                    ],
                    [
                        'document_name' => 'Legal Research Report',
                        'file_path' => $demoImages[array_rand($demoImages)],
                        'description' => 'Research on relevant case law and legal precedents.',
                        'confidentiality' => 'confidential',
                    ],
                    [
                        'document_name' => 'Witness Statements',
                        'file_path' => $demoImages[array_rand($demoImages)],
                        'description' => 'Sworn statements from key witnesses.',
                        'confidentiality' => 'privileged',
                    ],
                    [
                        'document_name' => 'Financial Records',
                        'file_path' => $demoImages[array_rand($demoImages)],
                        'description' => 'Financial documentation and records.',
                        'confidentiality' => 'confidential',
                    ],
                    [
                        'document_name' => 'Correspondence',
                        'file_path' => $demoImages[array_rand($demoImages)],
                        'description' => 'Client and opposing party correspondence.',
                        'confidentiality' => 'confidential',
                    ],
                ];
                
                // Create 2-3 documents per case
                $documentCount = rand(4, 6);
                $documentsToCreate = collect($documentTemplates)->random($documentCount);
                
                foreach ($documentsToCreate as $index => $docData) {
                    // Randomly assign creator from company or team members
                    $creator = $allUsers->random();
                    
                    CaseDocument::create([
                        ...$docData,
                        'case_id' => $case->id,
                        'document_type_id' => $documentTypes[array_rand($documentTypes)],
                        'document_date' => now()->subDays(rand(1, 30)),
                        'status' => 'active',
                        'created_by' => $creator->id,
                    ]);
                }
            }
        }
    }
}