<?php

namespace Database\Seeders;

use App\Models\HearingType;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class HearingTypeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        foreach (User::where('type', 'company')->get() as $user) {
        
            // Create 2-3 hearing types per company
            $hearingTypeCount = rand(8, 10);
            $availableHearingTypes = [
                [
                    'name' => 'Initial Hearing',
                    'description' => 'First hearing in a case to establish basic facts and procedures',
                    'duration_estimate' => 60,
                    'status' => 'active',
                    'requirements' => ['case_file', 'initial_pleadings', 'client_presence'],
                    'notes' => 'Standard initial hearing for new cases',
                ],
                [
                    'name' => 'Motion Hearing',
                    'description' => 'Hearing to address specific motions filed by parties',
                    'duration_estimate' => 45,
                    'status' => 'active',
                    'requirements' => ['motion_documents', 'supporting_evidence', 'legal_briefs'],
                    'notes' => 'For procedural and substantive motions',
                ],
                [
                    'name' => 'Trial',
                    'description' => 'Full trial proceeding with evidence presentation',
                    'duration_estimate' => 480,
                    'status' => 'active',
                    'requirements' => ['witness_list', 'exhibit_list', 'trial_briefs', 'jury_instructions'],
                    'notes' => 'Full day trial proceeding',
                ],
                [
                    'name' => 'Settlement Conference',
                    'description' => 'Court-supervised settlement discussion',
                    'duration_estimate' => 120,
                    'status' => 'active',
                    'requirements' => ['settlement_statement', 'financial_documents', 'authority_to_settle'],
                    'notes' => 'Mandatory settlement conference',
                ],
                [
                    'name' => 'Status Conference',
                    'description' => 'Case management and scheduling conference',
                    'duration_estimate' => 30,
                    'status' => 'active',
                    'requirements' => ['case_status_report', 'scheduling_preferences'],
                    'notes' => 'Regular case management conference',
                ],
                [
                    'name' => 'Sentencing Hearing',
                    'description' => 'Criminal sentencing proceeding',
                    'duration_estimate' => 90,
                    'status' => 'active',
                    'requirements' => ['pre_sentence_report', 'victim_impact_statements', 'character_references'],
                    'notes' => 'For criminal cases only',
                ],
                [
                    'name' => 'Arraignment',
                    'description' => 'Initial criminal proceeding for plea entry',
                    'duration_estimate' => 15,
                    'status' => 'active',
                    'requirements' => ['charging_documents', 'defendant_presence'],
                    'notes' => 'Brief criminal proceeding',
                ],
                [
                    'name' => 'Custody Hearing',
                    'description' => 'Family court hearing for child custody matters',
                    'duration_estimate' => 180,
                    'status' => 'active',
                    'requirements' => ['custody_evaluation', 'parenting_plan', 'financial_affidavit'],
                    'notes' => 'Family law proceeding',
                ],
                [
                    'name' => 'Deposition',
                    'description' => 'Witness deposition under oath',
                    'duration_estimate' => 240,
                    'status' => 'active',
                    'requirements' => ['witness_subpoena', 'court_reporter', 'examination_outline'],
                    'notes' => 'Discovery proceeding',
                ],
                [
                    'name' => 'Mediation',
                    'description' => 'Alternative dispute resolution session',
                    'duration_estimate' => 300,
                    'status' => 'active',
                    'requirements' => ['mediation_agreement', 'position_statements', 'settlement_authority'],
                    'notes' => 'ADR proceeding',
                ],
                [
                    'name' => 'Arbitration',
                    'description' => 'Binding arbitration hearing',
                    'duration_estimate' => 360,
                    'status' => 'active',
                    'requirements' => ['arbitration_agreement', 'evidence_briefs', 'witness_statements'],
                    'notes' => 'Alternative to trial',
                ],
            ];
            
            // Randomly select hearing types for this company
            $selectedTypes = collect($availableHearingTypes)->random($hearingTypeCount);
            
            foreach ($selectedTypes as $typeData) {
                HearingType::firstOrCreate([
                    'name' => $typeData['name'],
                    'created_by' => $user->id
                ], [
                    ...$typeData,
                    'created_by' => $user->id,
                ]);
            }
    }
    }
}