<?php

namespace Database\Seeders;

use App\Models\Contact;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ContactSeeder extends Seeder
{
    public function run(): void
    {
        $contacts = [
            [
                'name' => 'Sarah Mitchell',
                'email' => 'sarah@mitchelllaw.com',
                'subject' => 'Interested in Legal Case Management',
                'message' => 'Hi, I run a small law firm and I\'m interested in your case management system. Can you provide more information about pricing and features?',
                'created_at' => now()->subDays(1),
            ],
            [
                'name' => 'Michael Rodriguez',
                'email' => 'mrodriguez@legalgroup.com',
                'subject' => 'Demo Request',
                'message' => 'We would like to schedule a demo of your legal practice management software for our 15-attorney firm.',
                'created_at' => now()->subDays(3),
            ],
            [
                'name' => 'Jennifer Chen',
                'email' => 'jchen@corporatelaw.com',
                'subject' => 'Integration Questions',
                'message' => 'Does your system integrate with QuickBooks and other accounting software? We need seamless billing integration.',
                'created_at' => now()->subDays(2),
            ],
            [
                'name' => 'David Thompson',
                'email' => 'dthompson@familylaw.com',
                'subject' => 'Security and Compliance',
                'message' => 'What security measures do you have in place? We handle sensitive family law cases and need HIPAA compliance.',
                'created_at' => now()->subDays(5),
            ],
            [
                'name' => 'Lisa Anderson',
                'email' => 'landerson@criminaldefense.com',
                'subject' => 'Pricing Information',
                'message' => 'Can you send me detailed pricing information for a solo practitioner? I specialize in criminal defense.',
                'created_at' => now()->subHours(6),
            ]
        ];

        foreach ($contacts as $contactData) {
            Contact::create($contactData);
        }

    }
}