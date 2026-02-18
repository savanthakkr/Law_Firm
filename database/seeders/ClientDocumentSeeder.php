<?php

namespace Database\Seeders;

use App\Models\Client;
use App\Models\ClientDocument;
use App\Models\DocumentType;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ClientDocumentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get company users
        $companyUsers = User::where('type', 'company')->get();
        
        foreach ($companyUsers as $companyUser) {
            // Get clients for this company
            $clients = Client::where('created_by', $companyUser->id)->get();
            
            // Get document types for this specific company
            $documentTypes = DocumentType::where('created_by', $companyUser->id)
                ->where('status', 'active')
                ->pluck('id')
                ->toArray();
            
            if ($clients->count() > 0 && !empty($documentTypes)) {
                $documentNames = [
                    'Client Agreement.pdf',
                    'ID_Copy.jpg', 
                    'Financial_Statement.xlsx',
                    'Power_of_Attorney.pdf',
                    'Medical_Records.pdf',
                    'Insurance_Policy.pdf',
                    'Contract_Copy.pdf',
                    'Tax_Documents.pdf',
                    'Bank_Statements.pdf',
                    'Employment_Records.pdf',
                    'Property_Deed.pdf',
                    'Correspondence.pdf'
                ];
                
                $descriptions = [
                    'Signed client service agreement',
                    'Copy of government issued ID',
                    'Client financial statement for case assessment',
                    'Legal power of attorney document',
                    'Medical records for personal injury case',
                    'Insurance policy documentation',
                    'Contract copy for dispute resolution',
                    'Tax documentation for financial review',
                    'Bank statements for financial verification',
                    'Employment records and documentation',
                    'Property ownership documentation',
                    'Client correspondence and communications'
                ];
                
                // Create 3-5 documents per client
                foreach ($clients as $client) {
                    $documentCount = rand(3, 5);
                    $selectedDocs = collect($documentNames)->random($documentCount);
                    
                    foreach ($selectedDocs as $index => $docName) {
                        $docIndex = array_search($docName, $documentNames);
                        
                        $docData = [
                            'client_id' => $client->id,
                            'document_name' => $docName,
                            'file_path' => '/storage/documents/' . strtolower(str_replace([' ', '.'], ['_', '_'], $docName)) . '_' . $client->id . '_' . ($index + 1),
                            'document_type_id' => $documentTypes[($index) % count($documentTypes)],
                            'description' => $descriptions[$docIndex],
                            'status' => rand(1, 10) > 9 ? 'archived' : 'active', // 10% chance archived
                            'created_by' => $companyUser->id,
                        ];
                        
                        ClientDocument::firstOrCreate([
                            'document_name' => $docData['document_name'],
                            'client_id' => $docData['client_id'],
                            'created_by' => $companyUser->id
                        ], $docData);
                    }
                }
            }
        }
    }
}