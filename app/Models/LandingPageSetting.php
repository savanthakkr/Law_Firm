<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LandingPageSetting extends BaseModel
{
    protected $fillable = [
        'company_name',
        'contact_email',
        'contact_phone',
        'contact_address',
        'config_sections'
    ];

    protected $attributes = [
        'company_name' => '',
        'contact_email' => '',
        'contact_phone' => '',
        'contact_address' => ''
    ];

    protected $casts = [
        'config_sections' => 'array'
    ];

    public static function getSettings()
    {
        $settings = self::first();

        if (!$settings) {
            // Import default sections from the template file structure
            $defaultConfig = [
                'sections' => [
                    [
                        'key' => 'header',
                        'transparent' => false,
                        'background_color' => '#ffffff',
                        'text_color' => '#1f2937',
                        'button_style' => 'gradient'
                    ],
                    [
                        'key' => 'hero',
                        'title' => 'Complete Legal Case Management Solution',
                        'subtitle' => 'Streamline your law firm operations with comprehensive case, client, and document management.',
                        'announcement_text' => '⚖️ New: Advanced Court Calendar Integration',
                        'primary_button_text' => 'Start Free Trial',
                        'secondary_button_text' => 'Login',
                        'image' => '/public/DemoMedia/a-advocate-saas-pic.png',
                        'background_color' => '#f1f5f9',
                        'text_color' => '#1f2937',
                        'layout' => 'image-right',
                        'height' => 600,
                        'stats' => [
                            ['value' => '500+', 'label' => 'Law Firms'],
                            ['value' => '25+', 'label' => 'Countries'],
                            ['value' => '98%', 'label' => 'Client Satisfaction']
                        ],
                        'card' => [
                            'name' => 'Sarah Mitchell',
                            'title' => 'Senior Partner',
                            'company' => 'Mitchell & Associates',
                            'initials' => 'SM'
                        ]
                    ],
                    [
                        'key' => 'features',
                        'title' => 'Comprehensive Legal Practice Management',
                        'description' => 'Everything you need to manage cases, clients, and legal operations efficiently.',
                        'background_color' => '#ffffff',
                        'layout' => 'grid',
                        'columns' => 3,
                        'image' => '',
                        'show_icons' => true,
                        'features_list' => [
                            ['title' => 'Case Management', 'description' => 'Organize and track all your legal cases in one place.', 'icon' => 'briefcase'],
                            ['title' => 'Client Portal', 'description' => 'Secure client communication and document sharing.', 'icon' => 'users'],
                            ['title' => 'Time Tracking & Billing', 'description' => 'Automated time tracking with integrated billing system.', 'icon' => 'clock']
                        ]
                    ],
                    [
                        'key' => 'screenshots',
                        'title' => 'See Advocate in Action',
                        'subtitle' => 'Explore our intuitive interface designed to streamline your legal practice operations.',
                        'screenshots_list' => [
                            [
                                'src' => '/public/DemoMedia/a-advocate-saas-pic.png',
                                'alt' => 'Advocate Dashboard Overview',
                                'title' => 'Dashboard Overview',
                                'description' => 'Complete legal practice management dashboard with case overview and analytics'
                            ],
                            [
                                'src' => '/public/DemoMedia/client-advocate-saas-pic.png',
                                'alt' => 'Advocate Client Management',
                                'title' => 'Client Management',
                                'description' => 'Comprehensive client database with contact information and case history'
                            ],
                            [
                                'src' => '/public/DemoMedia/b-advocate-saas-pic.png',
                                'alt' => 'Advocate Superadmin Plan Management Interface',
                                'title' => 'Plan Management',
                                'description' => 'Comprehensive subscription plan management from superadmin dashboard'
                            ],
                            [
                                'src' => '/public/DemoMedia/c-advocate-saas-pic.png',
                                'alt' => 'Advocate Multi-Language Management Interface',
                                'title' => 'Language Management',
                                'description' => 'Comprehensive multi-language support and localization settings'
                            ],
                            [
                                'src' => '/public/DemoMedia/j-advocate-saas-pic.png',
                                'alt' => 'Advocate Company Settings Interface',
                                'title' => 'Company Settings',
                                'description' => 'Comprehensive company configuration and system settings management'
                            ],
                            [
                                'src' => '/public/DemoMedia/g-advocate-saas-pic.png',
                                'alt' => 'Advocate Invoice Management System',
                                'title' => 'Invoice Management',
                                'description' => 'Professional invoice generation and billing management system'
                            ]
                        ]
                    ],
                    [
                        'key' => 'why_choose_us',
                        'title' => 'Why Choose Advocate?',
                        'subtitle' => 'We\'re the trusted legal practice management solution.',
                        'reasons' => [
                            ['title' => 'Quick Implementation', 'description' => 'Get your law firm up and running in under 24 hours.', 'icon' => 'clock'],
                            ['title' => 'Legal Expertise', 'description' => 'Built by legal professionals for legal professionals.', 'icon' => 'users']
                        ],
                        'stats' => [
                            ['value' => '500+', 'label' => 'Law Firms', 'color' => 'blue'],
                            ['value' => '98%', 'label' => 'Client Satisfaction', 'color' => 'green']
                        ]
                    ],
                    [
                        'key' => 'about',
                        'title' => 'About Advocate',
                        'description' => 'We are passionate about transforming legal practice management.',
                        'story_title' => 'Empowering Legal Professionals Since 2020',
                        'story_content' => 'Founded by legal professionals and technology experts, Advocate was born from the need for efficient legal practice management.',
                        'image' => '',
                        'background_color' => '#f1f5f9',
                        'layout' => 'image-right',
                        'stats' => [
                            ['value' => '4+ Years', 'label' => 'Experience', 'color' => 'blue'],
                            ['value' => '500+', 'label' => 'Law Firms', 'color' => 'green'],
                            ['value' => '25+', 'label' => 'Countries', 'color' => 'purple']
                        ]
                    ],
                    [
                        'key' => 'team',
                        'title' => 'Meet Our Team',
                        'subtitle' => 'We\'re a diverse team of innovators and problem-solvers.',
                        'cta_title' => 'Want to Join Our Team?',
                        'cta_description' => 'We\'re always looking for talented individuals.',
                        'cta_button_text' => 'View Open Positions',
                        'members' => [
                            ['name' => 'Sarah Johnson', 'role' => 'CEO & Founder', 'bio' => 'Former legal tech executive with 15+ years experience.', 'image' => '', 'linkedin' => '#', 'email' => 'sarah@advocate.com'],
                            ['name' => 'Michael Rodriguez', 'role' => 'CTO & Co-Founder', 'bio' => 'Full-stack developer specializing in legal software architecture and SaaS platforms.', 'image' => '', 'linkedin' => '#', 'email' => 'michael@advocate.com'],
                            ['name' => 'Emily Chen', 'role' => 'Head of Legal Operations', 'bio' => 'Licensed attorney with expertise in case management and legal workflow optimization.', 'image' => '', 'linkedin' => '#', 'email' => 'emily@advocate.com'],
                            ['name' => 'David Thompson', 'role' => 'Lead Product Manager', 'bio' => 'Product strategist focused on legal practice management and client experience design.', 'image' => '', 'linkedin' => '#', 'email' => 'david@advocate.com']
                        ]
                    ],
                    [
                        'key' => 'testimonials',
                        'title' => 'What Our Clients Say',
                        'subtitle' => 'Don\'t just take our word for it.',
                        'trust_title' => 'Trusted by Law Firms Worldwide',
                        'trust_stats' => [
                            ['value' => '4.9/5', 'label' => 'Average Rating', 'color' => 'blue'],
                            ['value' => '500+', 'label' => 'Law Firms', 'color' => 'green']
                        ],
                        'testimonials' => [
                            ['name' => 'Michael Rodriguez', 'role' => 'Managing Partner', 'company' => 'Rodriguez Law Group', 'content' => 'Advocate has transformed our legal practice operations completely.', 'rating' => 5]
                        ]
                    ],
                    [
                        'key' => 'plans',
                        'title' => 'Choose Your Plan',
                        'subtitle' => 'Start with our free plan and upgrade as you grow.',
                        'faq_text' => 'Have questions about our plans? Contact our sales team'
                    ],
                    [
                        'key' => 'faq',
                        'title' => 'Frequently Asked Questions',
                        'subtitle' => 'Got questions? We\'ve got answers.',
                        'cta_text' => 'Still have questions?',
                        'button_text' => 'Contact Support',
                        'faqs' => [
                            ['question' => 'How does Advocate help law firms?', 'answer' => 'Advocate provides comprehensive case management, client billing, document management, and legal research tools in one platform.']
                        ]
                    ],
                    [
                        'key' => 'newsletter',
                        'title' => 'Stay Updated with Advocate',
                        'subtitle' => 'Get the latest legal tech updates and practice management tips.',
                        'privacy_text' => 'No spam, unsubscribe at any time.',
                        'benefits' => [
                            ['icon' => '⚖️', 'title' => 'Legal Tech Updates', 'description' => 'Latest legal technology features and improvements']
                        ]
                    ],
                    [
                        'key' => 'contact',
                        'title' => 'Get in Touch',
                        'subtitle' => 'Have questions about Advocate? We\'d love to hear from you.',
                        'form_title' => 'Send us a Message',
                        'info_title' => 'Contact Information',
                        'info_description' => 'We\'re here to help and answer any question you might have.',
                        'layout' => 'split',
                        'background_color' => '#f1f5f9'
                    ],
                    [
                        'key' => 'footer',
                        'description' => 'Transforming legal practice management with innovative technology solutions.',
                        'newsletter_title' => 'Stay Updated',
                        'newsletter_subtitle' => 'Join our newsletter for updates',
                        'links' => [
                            'product' => [['name' => 'Features', 'href' => '#features'], ['name' => 'Pricing', 'href' => '#pricing']],
                            'company' => [['name' => 'About Us', 'href' => '#about'], ['name' => 'Contact', 'href' => '#contact']],
                            'support' => [['name' => 'Help Center', 'href' => '#help'], ['name' => 'Documentation', 'href' => '#docs'], ['name' => 'Contact Support', 'href' => '#support']],
                            'legal' => [['name' => 'Privacy Policy', 'href' => '#privacy'], ['name' => 'Terms of Service', 'href' => '#terms']]
                        ],
                        'social_links' => [
                            ['name' => 'Facebook', 'icon' => 'Facebook', 'href' => '#'],
                            ['name' => 'Twitter', 'icon' => 'Twitter', 'href' => '#']
                        ],
                        'section_titles' => [
                            'product' => 'Product',
                            'company' => 'Company',
                            'support' => 'Support',
                            'legal' => 'Legal'
                        ]
                    ]
                ],
                'theme' => [
                    'primary_color' => '#10B981',
                    'secondary_color' => '#ffffff',
                    'accent_color' => '#f8fafc',
                    'logo_light' => '',
                    'logo_dark' => '',
                    'favicon' => ''
                ],
                'seo' => [
                    'meta_title' => 'Legal Case Management System - Complete Law Firm Solution',
                    'meta_description' => 'Comprehensive legal case management software for law firms. Manage cases, clients, documents, billing, and court schedules in one platform.',
                    'meta_keywords' => 'legal case management, law firm software, case management system, legal billing, court calendar, document management'
                ],
                'custom_css' => '',
                'custom_js' => '',
                'section_order' => ['header', 'hero', 'features', 'screenshots', 'why_choose_us',  'about', 'team', 'testimonials', 'plans', 'faq', 'newsletter', 'contact', 'footer'],
                'section_visibility' => [
                    'header' => true,
                    'hero' => true,
                    'features' => true,
                    'screenshots' => true,
                    'why_choose_us' => true,
                    'about' => true,
                    'team' => true,
                    'testimonials' => true,
                    'plans' => true,
                    'faq' => true,
                    'newsletter' => true,
                    'contact' => true,
                    'footer' => true
                ]
            ];

            $settings = self::create([
                'company_name'    => 'Advocate',
                'contact_email'   => 'support@advocate.com',
                'contact_phone'   => '+1 234 567 890',
                'contact_address' => '123 Main Street, New York, USA',
                'config_sections' => $defaultConfig
            ]);
        }
        return $settings;
    }
}
