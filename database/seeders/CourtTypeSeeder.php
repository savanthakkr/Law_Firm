<?php

namespace Database\Seeders;

use App\Models\CourtType;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CourtTypeSeeder extends Seeder
{
    public function run(): void
    {
        $companyUsers = User::where('type', 'company')->get();

        foreach ($companyUsers as $companyUser) {

            // Create 2-3 court types per company
            $courtTypeCount = rand(8, 10);
            $availableCourtTypes = [
                ['name' => 'District Court', 'description' => 'District level courts', 'color' => '#10B981'],
                ['name' => 'High Court', 'description' => 'High court jurisdiction', 'color' => '#EF4444'],
                ['name' => 'Supreme Court', 'description' => 'Supreme court level', 'color' => '#8B5CF6'],
                ['name' => 'Family Court', 'description' => 'Family matters court', 'color' => '#F59E0B'],
                ['name' => 'Criminal Court', 'description' => 'Criminal cases court', 'color' => '#DC2626'],
                ['name' => 'Civil Court', 'description' => 'Civil matters court', 'color' => '#3B82F6'],
                ['name' => 'Commercial Court', 'description' => 'Commercial disputes court', 'color' => '#059669'],
                ['name' => 'Appellate Court', 'description' => 'Appeals court jurisdiction', 'color' => '#F97316'],
                ['name' => 'Magistrate Court', 'description' => 'Magistrate level court', 'color' => '#84CC16'],
                ['name' => 'Labor Court', 'description' => 'Employment disputes court', 'color' => '#06B6D4'],
                ['name' => 'Tax Court', 'description' => 'Tax matters court', 'color' => '#6B7280'],
            ];

            // Randomly select court types for this company
            $selectedTypes = collect($availableCourtTypes)->random($courtTypeCount);
            
            foreach ($selectedTypes as $type) {
                CourtType::firstOrCreate([
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
