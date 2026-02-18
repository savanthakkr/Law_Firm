<?php

namespace Database\Seeders;

use App\Models\ResearchSource;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ResearchSourceSeeder extends Seeder
{
    public function run(): void
    {
        $companyUsers = User::where('type', 'company')->get();
        
        foreach ($companyUsers as $companyUser) {
            // Create 2-3 research sources per company
            $sourceCount = rand(8, 10);
            $availableSources = [
                [
                    'source_name' => 'Westlaw',
                    'source_type' => 'database',
                    'description' => 'Comprehensive legal research database',
                    'url' => 'https://westlaw.com',
                    'access_info' => 'Subscription-based legal database with case law, statutes, and secondary sources',
                    'credentials' => ['username' => 'user', 'subscription_type' => 'premium'],
                    'status' => 'active',
                ],
                [
                    'source_name' => 'LexisNexis',
                    'source_type' => 'database',
                    'description' => 'Legal research platform',
                    'url' => 'https://lexisnexis.com',
                    'access_info' => 'Premium legal research service',
                    'credentials' => ['username' => 'user', 'subscription_type' => 'professional'],
                    'status' => 'active',
                ],
                [
                    'source_name' => 'Google Scholar',
                    'source_type' => 'case_law',
                    'description' => 'Free case law search engine',
                    'url' => 'https://scholar.google.com',
                    'access_info' => 'Free access to case law and legal opinions',
                    'credentials' => null,
                    'status' => 'active',
                ],
                [
                    'source_name' => 'Justia',
                    'source_type' => 'case_law',
                    'description' => 'Free legal information and case law',
                    'url' => 'https://justia.com',
                    'access_info' => 'Free legal resources and case law database',
                    'credentials' => null,
                    'status' => 'active',
                ],
                [
                    'source_name' => 'Legal Information Institute',
                    'source_type' => 'statutory',
                    'description' => 'Cornell Law School legal database',
                    'url' => 'https://law.cornell.edu',
                    'access_info' => 'Free access to federal and state statutes',
                    'credentials' => null,
                    'status' => 'active',
                ],
                [
                    'source_name' => 'Bloomberg Law',
                    'source_type' => 'database',
                    'description' => 'Legal research and business intelligence',
                    'url' => 'https://pro.bloomberglaw.com',
                    'access_info' => 'Premium legal and business research platform',
                    'credentials' => ['username' => 'user', 'subscription_type' => 'enterprise'],
                    'status' => 'active',
                ],
                [
                    'source_name' => 'HeinOnline',
                    'source_type' => 'secondary',
                    'description' => 'Legal journals and historical documents',
                    'url' => 'https://heinonline.org',
                    'access_info' => 'Academic legal research database',
                    'credentials' => ['username' => 'user', 'institution' => 'law_firm'],
                    'status' => 'active',
                ],
                [
                    'source_name' => 'Fastcase',
                    'source_type' => 'case_law',
                    'description' => 'Legal research platform with case law',
                    'url' => 'https://fastcase.com',
                    'access_info' => 'Affordable legal research service',
                    'credentials' => ['username' => 'user', 'subscription_type' => 'basic'],
                    'status' => 'active',
                ],
                [
                    'source_name' => 'Casetext',
                    'source_type' => 'database',
                    'description' => 'AI-powered legal research platform',
                    'url' => 'https://casetext.com',
                    'access_info' => 'Modern legal research with AI assistance',
                    'credentials' => ['username' => 'user', 'subscription_type' => 'professional'],
                    'status' => 'active',
                ],
                [
                    'source_name' => 'Law Library',
                    'source_type' => 'secondary',
                    'description' => 'Physical law library resources',
                    'url' => null,
                    'access_info' => 'Local law library with books and journals',
                    'credentials' => ['library_card' => 'active'],
                    'status' => 'active',
                ],
            ];
            
            // Randomly select research sources for this company
            $selectedSources = collect($availableSources)->random($sourceCount);
            
            foreach ($selectedSources as $sourceData) {
                ResearchSource::firstOrCreate([
                    'source_name' => $sourceData['source_name'],
                    'created_by' => $companyUser->id
                ], [
                    'source_type' => $sourceData['source_type'],
                    'description' => $sourceData['description'],
                    'url' => $sourceData['url'],
                    'access_info' => $sourceData['access_info'],
                    'credentials' => $sourceData['credentials'],
                    'status' => $sourceData['status'],
                    'created_by' => $companyUser->id,
                ]);
            }
        }
    }
}