<?php

namespace Database\Seeders;

use App\Models\KnowledgeArticle;
use App\Models\ResearchCategory;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class KnowledgeArticleSeeder extends Seeder
{
    public function run(): void
    {
        $companyUsers = User::where('type', 'company')->get();
        
        foreach ($companyUsers as $companyUser) {
            $categories = ResearchCategory::where('created_by', $companyUser->id)->get();
            
            // Create 2-3 knowledge articles per company
            $articleCount = rand(8, 10);
            $availableArticles = [
                [
                    'title' => 'Contract Formation Elements',
                    'content' => 'A valid contract requires four essential elements: offer, acceptance, consideration, and mutual assent. This article explores each element in detail with case law examples and practical applications.',
                    'tags' => ['contract', 'formation', 'elements', 'offer', 'acceptance'],
                    'is_public' => true,
                    'status' => 'published',
                ],
                [
                    'title' => 'Employment At-Will Doctrine',
                    'content' => 'The at-will employment doctrine allows either employer or employee to terminate the employment relationship at any time, for any reason, with or without notice. However, there are important exceptions to this rule.',
                    'tags' => ['employment', 'at-will', 'termination', 'exceptions'],
                    'is_public' => false,
                    'status' => 'published',
                ],
                [
                    'title' => 'Corporate Governance Best Practices',
                    'content' => 'This comprehensive guide covers corporate governance principles, board responsibilities, shareholder rights, and compliance requirements for modern corporations.',
                    'tags' => ['corporate', 'governance', 'board', 'compliance'],
                    'is_public' => true,
                    'status' => 'draft',
                ],
                [
                    'title' => 'Intellectual Property Protection Strategies',
                    'content' => 'Overview of intellectual property protection methods including patents, trademarks, copyrights, and trade secrets. Includes filing procedures and enforcement strategies.',
                    'tags' => ['ip', 'patent', 'trademark', 'copyright', 'protection'],
                    'is_public' => true,
                    'status' => 'published',
                ],
                [
                    'title' => 'Criminal Defense Procedures',
                    'content' => 'Comprehensive guide to criminal defense procedures including arraignment, discovery, plea negotiations, and trial preparation. Essential knowledge for criminal law practitioners.',
                    'tags' => ['criminal', 'defense', 'procedure', 'trial', 'plea'],
                    'is_public' => false,
                    'status' => 'published',
                ],
                [
                    'title' => 'Family Law Mediation Process',
                    'content' => 'Understanding the family law mediation process for divorce, custody, and support matters. Includes preparation strategies and best practices for successful outcomes.',
                    'tags' => ['family', 'mediation', 'divorce', 'custody', 'support'],
                    'is_public' => true,
                    'status' => 'published',
                ],
                [
                    'title' => 'Real Estate Transaction Guidelines',
                    'content' => 'Complete guide to real estate transactions including due diligence, title searches, closing procedures, and common pitfalls to avoid.',
                    'tags' => ['real estate', 'transaction', 'closing', 'title'],
                    'is_public' => true,
                    'status' => 'published',
                ],
                [
                    'title' => 'Tax Law Compliance Framework',
                    'content' => 'Overview of tax compliance requirements for individuals and businesses, including filing deadlines, documentation requirements, and audit procedures.',
                    'tags' => ['tax', 'compliance', 'filing', 'audit'],
                    'is_public' => false,
                    'status' => 'published',
                ],
                [
                    'title' => 'Immigration Law Updates',
                    'content' => 'Recent changes in immigration law including visa categories, application procedures, and policy updates affecting practitioners.',
                    'tags' => ['immigration', 'visa', 'policy', 'updates'],
                    'is_public' => true,
                    'status' => 'draft',
                ],
                [
                    'title' => 'Environmental Compliance Standards',
                    'content' => 'Environmental law compliance standards for businesses including EPA regulations, permitting requirements, and enforcement actions.',
                    'tags' => ['environmental', 'compliance', 'EPA', 'regulations'],
                    'is_public' => true,
                    'status' => 'published',
                ],
            ];
            
            // Randomly select knowledge articles for this company
            $selectedArticles = collect($availableArticles)->random($articleCount);
            
            foreach ($selectedArticles as $articleData) {
                KnowledgeArticle::firstOrCreate([
                    'title' => $articleData['title'],
                    'created_by' => $companyUser->id
                ], [
                    'content' => $articleData['content'],
                    'category_id' => $categories->count() > 0 ? $categories->random()->id : null,
                    'tags' => $articleData['tags'],
                    'is_public' => $articleData['is_public'],
                    'status' => $articleData['status'],
                    'created_by' => $companyUser->id,
                ]);
            }
        }
    }
}