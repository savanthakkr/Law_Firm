<?php

namespace Database\Seeders;

use App\Models\DocumentType;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DocumentTypeSeeder extends Seeder
{
    public function run(): void
    {
        $companyUsers = User::where('type', 'company')->get();

        foreach ($companyUsers as $companyUser) {
            // Create 2-3 document types per company
            $documentTypeCount = rand(8, 10);
            $availableDocumentTypes = [
                ['name' => 'Contract', 'description' => 'Legal contracts and agreements', 'color' => '#10B981'],
                ['name' => 'Evidence', 'description' => 'Evidence documents', 'color' => '#F59E0B'],
                ['name' => 'Correspondence', 'description' => 'Letters and communications', 'color' => '#3B82F6'],
                ['name' => 'Court Filing', 'description' => 'Court filed documents', 'color' => '#EF4444'],
                ['name' => 'Research', 'description' => 'Research and analysis documents', 'color' => '#8B5CF6'],
                ['name' => 'Client Records', 'description' => 'Client personal and financial records', 'color' => '#059669'],
                ['name' => 'Legal Brief', 'description' => 'Legal briefs and memorandums', 'color' => '#DC2626'],
                ['name' => 'Other', 'description' => 'Other document types', 'color' => '#6B7280'],
                ['name' => 'Invoice', 'description' => 'Billing and invoice documents', 'color' => '#F97316'],
                ['name' => 'Affidavit', 'description' => 'Sworn statements and affidavits', 'color' => '#84CC16'],
                ['name' => 'Discovery', 'description' => 'Discovery and deposition documents', 'color' => '#06B6D4'],
            ];

            // Randomly select document types for this company
            $selectedTypes = collect($availableDocumentTypes)->random($documentTypeCount);
            
            foreach ($selectedTypes as $type) {
                DocumentType::firstOrCreate([
                    'name' => $type['name'],
                    'created_by' => $companyUser->id
                ], [
                    'description' => $type['description'],
                    'color' => $type['color'],
                    'status' => 'active',
                    'created_by' => $companyUser->id
                ]);
            }
        }
    }
}
