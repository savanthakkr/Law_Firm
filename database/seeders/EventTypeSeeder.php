<?php

namespace Database\Seeders;

use App\Models\EventType;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class EventTypeSeeder extends Seeder
{
    public function run(): void
    {
        $companyUsers = User::where('type', 'company')->get();

        foreach ($companyUsers as $companyUser) {
            
            // Create 2-3 event types per company
            $eventTypeCount = rand(8, 10);
            $availableEventTypes = [
                ['name' => 'Milestone', 'description' => 'Important project milestones', 'color' => '#10B981'],
                ['name' => 'Hearing', 'description' => 'Court hearings and proceedings', 'color' => '#EF4444'],
                ['name' => 'Deadline', 'description' => 'Important deadlines', 'color' => '#F59E0B'],
                ['name' => 'Meeting', 'description' => 'Client and team meetings', 'color' => '#3B82F6'],
                ['name' => 'Filing', 'description' => 'Document filing events', 'color' => '#8B5CF6'],
                ['name' => 'Review', 'description' => 'Case review sessions', 'color' => '#6B7280'],
                ['name' => 'Consultation', 'description' => 'Client consultation sessions', 'color' => '#059669'],
                ['name' => 'Settlement', 'description' => 'Settlement negotiations', 'color' => '#DC2626'],
                ['name' => 'Deposition', 'description' => 'Witness depositions', 'color' => '#F97316'],
                ['name' => 'Trial', 'description' => 'Court trial proceedings', 'color' => '#84CC16'],
                ['name' => 'Discovery', 'description' => 'Discovery phase events', 'color' => '#06B6D4'],
            ];
            
            // Randomly select event types for this company
            $selectedTypes = collect($availableEventTypes)->random($eventTypeCount);
            
            foreach ($selectedTypes as $type) {
                EventType::firstOrCreate([
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