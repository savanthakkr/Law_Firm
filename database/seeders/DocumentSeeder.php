<?php

namespace Database\Seeders;

use App\Models\Document;
use App\Models\DocumentCategory;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DocumentSeeder extends Seeder
{
    public function run(): void
    {
        $companyUsers = User::where('type', 'company')->get();
        
        foreach ($companyUsers as $companyUser) {
            $categories = DocumentCategory::where('created_by', $companyUser->id)->get();
            
            if ($categories->count() > 0) {
                // Create 2-3 documents per company
                $documentCount = rand(8, 10);
                $documentNames = [
                    'Client Agreement Template',
                    'Legal Brief - Case Study',
                    'Evidence Documentation',
                    'Contract Review Document',
                    'Court Filing Motion',
                    'Research Memorandum',
                    'Settlement Agreement',
                    'Discovery Response'
                ];
                
                $descriptions = [
                    'Standard client service agreement template',
                    'Legal brief for ongoing case',
                    'Compiled evidence for case documentation',
                    'Contract review and analysis document',
                    'Court filing motion and supporting documents',
                    'Legal research memorandum',
                    'Settlement agreement documentation',
                    'Discovery response and exhibits'
                ];
                
                $statuses = ['draft', 'review', 'final', 'archived'];
                $confidentialities = ['public', 'internal', 'confidential', 'restricted'];
                
                for ($i = 1; $i <= $documentCount; $i++) {
                    $documentData = [
                        'name' => $documentNames[($companyUser->id + $i - 1) % count($documentNames)],
                        'description' => $descriptions[($companyUser->id + $i - 1) % count($descriptions)] . ' for ' . $companyUser->name . '.',
                        'category_id' => $categories->random()->id,
                        'file_path' => '/storage/documents/' . strtolower(str_replace([' ', '-'], ['_', '_'], $documentNames[($companyUser->id + $i - 1) % count($documentNames)])) . '_' . $companyUser->id . '_' . $i . '.pdf',
                        'status' => $statuses[rand(0, count($statuses) - 1)],
                        'confidentiality' => $confidentialities[rand(0, count($confidentialities) - 1)],
                        'tags' => ['document', 'legal', 'case_' . $i],
                        'created_by' => $companyUser->id,
                    ];
                    
                    $document = Document::firstOrCreate([
                        'name' => $documentData['name'],
                        'created_by' => $companyUser->id
                    ], $documentData);
                    
                    // Create document permissions for client users
                    $clientUsers = User::where('created_by', $companyUser->id)
                        ->where('type', 'client')
                        ->take(2) // Limit to 2 clients for performance
                        ->get();
                    
                    foreach ($clientUsers as $clientUser) {
                        \App\Models\DocumentPermission::firstOrCreate([
                            'document_id' => $document->id,
                            'user_id' => $clientUser->id
                        ], [
                            'permission_type' => 'view',
                            'expires_at' => null,
                            'created_by' => $companyUser->id
                        ]);
                    }
                }
            }
        }
    }
}