<?php

use App\Models\Setting;
use App\Models\User;
use App\Models\Coupon;
use Carbon\Carbon;
use App\Models\Plan;
use App\Models\PlanOrder;
use App\Models\Role;
use App\Models\PaymentSetting;
use Illuminate\Support\Facades\Auth;

if (!function_exists('getCacheSize')) {
    /**
     * Get the total cache size in MB
     *
     * @return string
     */
    function getCacheSize()
    {
        $file_size = 0;
        $framework_path = storage_path('framework');
        
        if (is_dir($framework_path)) {
            foreach (\File::allFiles($framework_path) as $file) {
                $file_size += $file->getSize();
            }
        }
        
        return number_format($file_size / 1000000, 2);
    }
}

if (! function_exists('settings')) {
    function settings($user_id = null)
    {
        // Skip database queries during installation
        if (request()->is('install/*') || request()->is('update/*') || !file_exists(storage_path('installed'))) {
            return [];
        }

        if (is_null($user_id)) {
            if (auth()->user()) {
                if (!in_array(auth()->user()->type, ['superadmin', 'company'])) {
                    $user_id = auth()->user()->created_by;
                } else {
                    $user_id = auth()->id();
                }
            } else {
                $user = User::where('type', 'superadmin')->first();
                $user_id = $user ? $user->id : null;
            }
        }

        if (!$user_id) {
            return collect();
        }

        $userSettings = Setting::where('user_id', $user_id)->pluck('value', 'key')->toArray();
        
        // If user is not superadmin, merge with superadmin settings for specific keys
        if (auth()->check() && auth()->user()->type !== 'superadmin') {
            $superAdmin = User::where('type', 'superadmin')->first();
            if ($superAdmin) {
                $superAdminKeys = ['decimalFormat', 'defaultCurrency', 'thousandsSeparator', 'floatNumber', 'currencySymbolSpace', 'currencySymbolPosition', 'dateFormat', 'timeFormat', 'calendarStartDay', 'defaultTimezone'];
                $superAdminSettings = Setting::where('user_id', $superAdmin->id)
                    ->whereIn('key', $superAdminKeys)
                    ->pluck('value', 'key')
                    ->toArray();
                $userSettings = array_merge($superAdminSettings, $userSettings);
            }
        }

        return $userSettings;
    }
}

if (! function_exists('formatDateTime')) {
    function formatDateTime($date, $includeTime = true)
    {
        if (!$date) {
            return null;
        }

        $settings = settings();

        $dateFormat = $settings['dateFormat'] ?? 'Y-m-d';
        $timeFormat = $settings['timeFormat'] ?? 'H:i';
        $timezone = $settings['defaultTimezone'] ?? config('app.timezone', 'UTC');

        $format = $includeTime ? "$dateFormat $timeFormat" : $dateFormat;

        return Carbon::parse($date)->timezone($timezone)->format($format);
    }
}

if (! function_exists('getSetting')) {
    function getSetting($key, $default = null, $user_id = null)
    {
        $settings = settings($user_id);
        
        // If no value found and no default provided, try to get from defaultSettings
        if (!isset($settings[$key]) && $default === null) {
            $defaultSettings = defaultSettings();
            $default = $defaultSettings[$key] ?? null;
        }
        
        return $settings[$key] ?? $default;
    }
}

if (! function_exists('updateSetting')) {
    function updateSetting($key, $value, $user_id = null)
    {
        if (is_null($user_id)) {
            if (auth()->user()) {
                if (!in_array(auth()->user()->type, ['superadmin', 'company'])) {
                    $user_id = auth()->user()->created_by;
                } else {
                    $user_id = auth()->id();
                }
            } else {
                $user = User::where('type', 'superadmin')->first();
                $user_id = $user ? $user->id : null;
            }
        }

        if (!$user_id) {
            return false;
        }

        return Setting::updateOrCreate(
            ['user_id' => $user_id, 'key' => $key],
            ['value' => $value]
        );
    }
}

if (! function_exists('isLandingPageEnabled')) {
    function isLandingPageEnabled()
    {
        return getSetting('landingPageEnabled', true) === true || getSetting('landingPageEnabled', true) === '1';
    }
}

if (! function_exists('defaultRoleAndSetting')) {
    function defaultRoleAndSetting($user)
    {
        $companyRole = Role::where('name', 'company')->first();
            
        if ($companyRole) {
            $user->assignRole($companyRole);
        }
        
        // Create default settings for the user
        if ($user->type === 'superadmin') {
            createDefaultSettings($user->id);
        } elseif ($user->type === 'company') {
            copySettingsFromSuperAdmin($user->id);
            
            // Create client and team_member roles for this company
            createCompanyRoles($user);
        }

        return true;
    }
}

if (! function_exists('createCompanyRoles')) {
    function createCompanyRoles($companyUser)
    {
        // Create client role
        $clientRole = Role::firstOrCreate([
            'name' => 'client',
            'guard_name' => 'web',
            'created_by' => $companyUser->id
        ], [
            'label' => 'Client',
            'description' => 'Client with limited access to their cases and documents'
        ]);
        
        $clientRole->syncPermissions([
                // Dashboard
                'manage-dashboard',

                // Calender
                'manage-calendar',
                'view-calendar',

                // Cases
                'manage-cases',
                'view-cases',

                // Case Documents
                'manage-case-documents',
                'view-case-documents',
                'download-case-documents',

                // Case Notes
                'manage-case-notes',
                'view-case-notes',

                // Case Timelines
                'manage-case-timelines',
                'view-case-timelines',

                // Expenses
                'manage-expenses',
                'view-expenses',

                // Client Documents
                'manage-client-documents',
                'view-client-documents',
                'download-client-documents',

                // Client Billing
                'manage-client-billing',
                'view-client-billing',

                // Hearings
                'manage-hearings',
                'view-hearings',

                // Documents
                'manage-documents',
                'view-documents',
                'download-documents',



                // Document Comments (limited access)
                'manage-document-comments',
                'view-document-comments',
                'create-document-comments',

                // Messages
                'manage-messages',
                'view-messages',
                'send-messages',

                // Invoices
                'manage-invoices',
                'view-invoices',

                // Payments
                'manage-payments',
                'view-payments',
                'create-payments',

                // Time Entries
                'manage-time-entries',
                'view-time-entries',

                // Knowledge Articles
                'manage-knowledge-articles',
                'view-knowledge-articles',

                // Legal Precedents
                'manage-legal-precedents',
                'view-legal-precedents'
            ]);
        
        // Create team_member role with permissions
        $teamRole = Role::firstOrCreate([
            'name' => 'team_member',
            'guard_name' => 'web',
            'created_by' => $companyUser->id
        ], [
            'label' => 'Team Member',
            'description' => 'Team member with limited access to company modules'
        ]);
        
        $teamPermissions = [
            // Dashboard
            'manage-dashboard',

            // Calender
            'manage-calendar',
            'view-calendar',
            'manage-own-calendar',

            // Tasks
            'manage-tasks',
            'view-tasks',
            'create-tasks',
            'edit-tasks',
            'assign-tasks',
            'toggle-status-tasks',

            // Time Entries
            'manage-time-entries',
            'view-time-entries',
            'create-time-entries',
            'edit-time-entries',
            'start-timer',
            'stop-timer',

            // Cases
            'manage-cases',
            'view-cases',
            'create-cases',
            'edit-cases',
            'toggle-status-cases',

            // Case Documents
            'manage-case-documents',
            'view-case-documents',
            'create-case-documents',
            'edit-case-documents',
            'download-case-documents',

            // Case Notes
            'manage-case-notes',
            'view-case-notes',
            'create-case-notes',
            'edit-case-notes',

            // Case Timelines
            'manage-case-timelines',
            'view-case-timelines',
            'create-case-timelines',
            'edit-case-timelines',

            // Clients
            'manage-clients',
            'view-clients',
            'create-clients',
            'edit-clients',

            // Client Communications


            // Documents
            'manage-documents',
            'view-documents',
            'create-documents',
            'edit-documents',
            'download-documents',



            // Document Comments (limited access)
            'manage-document-comments',
            'view-document-comments',
            'create-document-comments',
            'edit-document-comments',

            // Document Permissions (view only)
            'manage-document-permissions',
            'view-document-permissions',

            // Hearings
            'manage-hearings',
            'view-hearings',
            'create-hearings',
            'edit-hearings',

            'manage-media',
            'manage-own-media',
            // Research
            'manage-research-projects',
            'view-research-projects',
            'create-research-projects',
            'edit-research-projects',
            'manage-knowledge-articles',
            'view-knowledge-articles',
            'create-knowledge-articles',
            'edit-knowledge-articles',
            'manage-legal-precedents',
            'view-legal-precedents',
            'create-legal-precedents',
            'edit-legal-precedents',

            // Messages
            'manage-messages',
            'view-messages',
            'send-messages'
        ];
        
        $teamRole->syncPermissions($teamPermissions);
        
        // Create default team member user
        $teamMember = User::firstOrCreate([
            'email' => 'teammember' . $companyUser->id . '@company.com',
            'created_by' => $companyUser->id
        ], [
            'name' => 'John Doe',
            'password' => \Hash::make('password'),
            'type' => 'team_member',
            'lang' => $companyUser->lang ?? 'en',
            'status' => 'active',
            'referral_code' => 0
        ]);
        
        $teamMember->roles()->sync([$teamRole->id]);
        
        // Create default client user
        $client = User::firstOrCreate([
            'email' => 'client' . $companyUser->id . '@company.com',
            'created_by' => $companyUser->id
        ], [
            'name' => 'Jane Smith',
            'password' => \Hash::make('password'),
            'type' => 'client',
            'lang' => $companyUser->lang ?? 'en',
            'status' => 'active',
            'referral_code' => 0
        ]);
        
        $client->roles()->sync([$clientRole->id]);
        
        // Create default client type first
        $defaultClientType = \App\Models\ClientType::firstOrCreate([
            'name' => 'Individual',
            'created_by' => $companyUser->id
        ], [
            'description' => 'Individual client type',
            'status' => 'active'
        ]);
        
        // Create client record in clients table
        \App\Models\Client::firstOrCreate([
            'email' => $client->email,
            'created_by' => $companyUser->id
        ], [
            'name' => $client->name,
            'phone' => '+1 234 567 890',
            'address' => '123 Client Street, City, State',
            'client_type_id' => $defaultClientType->id,
            'status' => 'active',
            'company_name' => $companyUser->name,
            'tax_id' => null,
            'tax_rate' => 0.00,
            'date_of_birth' => null,
            'notes' => 'Default client created during company setup',
            'referral_source' => 'System Generated'
        ]);
    }
}

if (! function_exists('getPaymentSettings')) {
    /**
     * Get payment settings for a user
     *
     * @param int|null $userId
     * @return array
     */
    function getPaymentSettings($userId = null)
    {
        if (is_null($userId)) {
            if (auth()->check() && auth()->user()->type == 'superadmin') {
                $userId = auth()->id();
            } else {
                $user = User::where('type', 'superadmin')->first();
                $userId = $user ? $user->id : null;
            }
        }

        return PaymentSetting::getUserSettings($userId);
    }
}

if (! function_exists('updatePaymentSetting')) {
    /**
     * Update or create a payment setting
     *
     * @param string $key
     * @param mixed $value
     * @param int|null $userId
     * @return \App\Models\PaymentSetting
     */
    function updatePaymentSetting($key, $value, $userId = null)
    {
        if (is_null($userId)) {
            $userId = auth()->id();
        }

        return PaymentSetting::updateOrCreateSetting($userId, $key, $value);
    }
}

if (! function_exists('isPaymentMethodEnabled')) {
    /**
     * Check if a payment method is enabled
     *
     * @param string $method (stripe, paypal, razorpay, mercadopago, bank)
     * @param int|null $userId
     * @return bool
     */
    function isPaymentMethodEnabled($method, $userId = null)
    {
        $settings = getPaymentSettings($userId);
        $key = "is_{$method}_enabled";
        
        return isset($settings[$key]) && ($settings[$key] === true || $settings[$key] === '1');
    }
}

if (! function_exists('getPaymentMethodConfig')) {
    /**
     * Get configuration for a specific payment method
     *
     * @param string $method (stripe, paypal, razorpay, mercadopago)
     * @param int|null $userId
     * @return array
     */
    function getPaymentMethodConfig($method, $userId = null)
    {
        $settings = getPaymentSettings($userId);
        
        switch ($method) {
            case 'stripe':
                return [
                    'enabled' => isPaymentMethodEnabled('stripe', $userId),
                    'key' => $settings['stripe_key'] ?? null,
                    'secret' => $settings['stripe_secret'] ?? null,
                ];
                
            case 'paypal':
                return [
                    'enabled' => isPaymentMethodEnabled('paypal', $userId),
                    'mode' => $settings['paypal_mode'] ?? 'sandbox',
                    'client_id' => $settings['paypal_client_id'] ?? null,
                    'secret' => $settings['paypal_secret_key'] ?? null,
                ];
                
            case 'razorpay':
                return [
                    'enabled' => isPaymentMethodEnabled('razorpay', $userId),
                    'key' => $settings['razorpay_key'] ?? null,
                    'secret' => $settings['razorpay_secret'] ?? null,
                ];
                
            case 'mercadopago':
                return [
                    'enabled' => isPaymentMethodEnabled('mercadopago', $userId),
                    'mode' => $settings['mercadopago_mode'] ?? 'sandbox',
                    'access_token' => $settings['mercadopago_access_token'] ?? null,
                ];
                
            case 'paystack':
                return [
                    'enabled' => isPaymentMethodEnabled('paystack', $userId),
                    'public_key' => $settings['paystack_public_key'] ?? null,
                    'secret_key' => $settings['paystack_secret_key'] ?? null,
                ];
                
            case 'flutterwave':
                return [
                    'enabled' => isPaymentMethodEnabled('flutterwave', $userId),
                    'public_key' => $settings['flutterwave_public_key'] ?? null,
                    'secret_key' => $settings['flutterwave_secret_key'] ?? null,
                ];
                
            case 'bank':
                return [
                    'enabled' => isPaymentMethodEnabled('bank', $userId),
                    'details' => $settings['bank_detail'] ?? null,
                ];
                
            case 'paytabs':
                return [
                    'enabled' => isPaymentMethodEnabled('paytabs', $userId),
                    'mode' => $settings['paytabs_mode'] ?? 'sandbox',
                    'profile_id' => $settings['paytabs_profile_id'] ?? null,
                    'server_key' => $settings['paytabs_server_key'] ?? null,
                    'region' => $settings['paytabs_region'] ?? 'ARE',
                ];
                
            case 'skrill':
                return [
                    'enabled' => isPaymentMethodEnabled('skrill', $userId),
                    'merchant_id' => $settings['skrill_merchant_id'] ?? null,
                    'secret_word' => $settings['skrill_secret_word'] ?? null,
                ];
                
            case 'coingate':
                return [
                    'enabled' => isPaymentMethodEnabled('coingate', $userId),
                    'mode' => $settings['coingate_mode'] ?? 'sandbox',
                    'api_token' => $settings['coingate_api_token'] ?? null,
                ];
                
            case 'payfast':
                return [
                    'enabled' => isPaymentMethodEnabled('payfast', $userId),
                    'mode' => $settings['payfast_mode'] ?? 'sandbox',
                    'merchant_id' => $settings['payfast_merchant_id'] ?? null,
                    'merchant_key' => $settings['payfast_merchant_key'] ?? null,
                    'passphrase' => $settings['payfast_passphrase'] ?? null,
                ];
                
            case 'tap':
                return [
                    'enabled' => isPaymentMethodEnabled('tap', $userId),
                    'secret_key' => $settings['tap_secret_key'] ?? null,
                ];
                
            case 'xendit':
                return [
                    'enabled' => isPaymentMethodEnabled('xendit', $userId),
                    'api_key' => $settings['xendit_api_key'] ?? null,
                ];
                
            case 'paytr':
                return [
                    'enabled' => isPaymentMethodEnabled('paytr', $userId),
                    'merchant_id' => $settings['paytr_merchant_id'] ?? null,
                    'merchant_key' => $settings['paytr_merchant_key'] ?? null,
                    'merchant_salt' => $settings['paytr_merchant_salt'] ?? null,
                ];
                
            case 'mollie':
                return [
                    'enabled' => isPaymentMethodEnabled('mollie', $userId),
                    'api_key' => $settings['mollie_api_key'] ?? null,
                ];
                
            case 'toyyibpay':
                return [
                    'enabled' => isPaymentMethodEnabled('toyyibpay', $userId),
                    'category_code' => $settings['toyyibpay_category_code'] ?? null,
                    'secret_key' => $settings['toyyibpay_secret_key'] ?? null,
                    'mode' => $settings['toyyibpay_mode'] ?? 'sandbox',
                ];
                
            case 'cashfree':
                return [
                    'enabled' => isPaymentMethodEnabled('cashfree', $userId),
                    'mode' => $settings['cashfree_mode'] ?? 'sandbox',
                    'public_key' => $settings['cashfree_public_key'] ?? null,
                    'secret_key' => $settings['cashfree_secret_key'] ?? null,
                ];
                
            case 'iyzipay':
                return [
                    'enabled' => isPaymentMethodEnabled('iyzipay', $userId),
                    'mode' => $settings['iyzipay_mode'] ?? 'sandbox',
                    'public_key' => $settings['iyzipay_public_key'] ?? null,
                    'secret_key' => $settings['iyzipay_secret_key'] ?? null,
                ];
                
            case 'benefit':
                return [
                    'enabled' => isPaymentMethodEnabled('benefit', $userId),
                    'mode' => $settings['benefit_mode'] ?? 'sandbox',
                    'public_key' => $settings['benefit_public_key'] ?? null,
                    'secret_key' => $settings['benefit_secret_key'] ?? null,
                ];
                
            case 'ozow':
                return [
                    'enabled' => isPaymentMethodEnabled('ozow', $userId),
                    'mode' => $settings['ozow_mode'] ?? 'sandbox',
                    'site_key' => $settings['ozow_site_key'] ?? null,
                    'private_key' => $settings['ozow_private_key'] ?? null,
                    'api_key' => $settings['ozow_api_key'] ?? null,
                ];
                
            case 'easebuzz':
                return [
                    'enabled' => isPaymentMethodEnabled('easebuzz', $userId),
                    'merchant_key' => $settings['easebuzz_merchant_key'] ?? null,
                    'salt_key' => $settings['easebuzz_salt_key'] ?? null,
                    'environment' => $settings['easebuzz_environment'] ?? 'test',
                ];
                
            case 'khalti':
                return [
                    'enabled' => isPaymentMethodEnabled('khalti', $userId),
                    'public_key' => $settings['khalti_public_key'] ?? null,
                    'secret_key' => $settings['khalti_secret_key'] ?? null,
                ];
                
            case 'authorizenet':
                return [
                    'enabled' => isPaymentMethodEnabled('authorizenet', $userId),
                    'mode' => $settings['authorizenet_mode'] ?? 'sandbox',
                    'merchant_id' => $settings['authorizenet_merchant_id'] ?? null,
                    'transaction_key' => $settings['authorizenet_transaction_key'] ?? null,
                    'supported_countries' => ['US', 'CA', 'GB', 'AU'],
                    'supported_currencies' => ['USD', 'CAD', 'CHF', 'DKK', 'EUR', 'GBP', 'NOK', 'PLN', 'SEK', 'AUD', 'NZD'],
                ];
                
            case 'fedapay':
                return [
                    'enabled' => isPaymentMethodEnabled('fedapay', $userId),
                    'mode' => $settings['fedapay_mode'] ?? 'sandbox',
                    'public_key' => $settings['fedapay_public_key'] ?? null,
                    'secret_key' => $settings['fedapay_secret_key'] ?? null,
                ];
                
            case 'payhere':
                return [
                    'enabled' => isPaymentMethodEnabled('payhere', $userId),
                    'mode' => $settings['payhere_mode'] ?? 'sandbox',
                    'merchant_id' => $settings['payhere_merchant_id'] ?? null,
                    'merchant_secret' => $settings['payhere_merchant_secret'] ?? null,
                    'app_id' => $settings['payhere_app_id'] ?? null,
                    'app_secret' => $settings['payhere_app_secret'] ?? null,
                ];
                
            case 'cinetpay':
                return [
                    'enabled' => isPaymentMethodEnabled('cinetpay', $userId),
                    'site_id' => $settings['cinetpay_site_id'] ?? null,
                    'api_key' => $settings['cinetpay_api_key'] ?? null,
                    'secret_key' => $settings['cinetpay_secret_key'] ?? null,
                ];
                
            case 'paymentwall':
                return [
                    'enabled' => isPaymentMethodEnabled('paymentwall', $userId),
                    'mode' => $settings['paymentwall_mode'] ?? 'sandbox',
                    'public_key' => $settings['paymentwall_public_key'] ?? null,
                    'private_key' => $settings['paymentwall_private_key'] ?? null,
                ];
                
            default:
                return [];
        }
    }
}

if (! function_exists('getEnabledPaymentMethods')) {
    /**
     * Get all enabled payment methods
     *
     * @param int|null $userId
     * @return array
     */
    function getEnabledPaymentMethods($userId = null)
    {
        $methods = ['stripe', 'paypal', 'razorpay', 'mercadopago', 'paystack', 'flutterwave', 'bank', 'paytabs', 'skrill', 'coingate', 'payfast', 'tap', 'xendit', 'paytr', 'mollie', 'toyyibpay', 'cashfree', 'iyzipay', 'benefit', 'ozow', 'easebuzz', 'khalti', 'authorizenet', 'fedapay', 'payhere', 'cinetpay', 'paymentwall'];
        $enabled = [];
        
        foreach ($methods as $method) {
            if (isPaymentMethodEnabled($method, $userId)) {
                $enabled[$method] = getPaymentMethodConfig($method, $userId);
            }
        }
        
        return $enabled;
    }
}

if (! function_exists('validatePaymentMethodConfig')) {
    /**
     * Validate payment method configuration
     *
     * @param string $method
     * @param array $config
     * @return array [valid => bool, errors => array]
     */
    function validatePaymentMethodConfig($method, $config)
    {
        $errors = [];
        
        switch ($method) {
            case 'stripe':
                if (empty($config['key'])) {
                    $errors[] = 'Stripe publishable key is required';
                }
                if (empty($config['secret'])) {
                    $errors[] = 'Stripe secret key is required';
                }
                break;
                
            case 'paypal':
                if (empty($config['client_id'])) {
                    $errors[] = 'PayPal client ID is required';
                }
                if (empty($config['secret'])) {
                    $errors[] = 'PayPal secret key is required';
                }
                break;
                
            case 'razorpay':
                if (empty($config['key'])) {
                    $errors[] = 'Razorpay key ID is required';
                }
                if (empty($config['secret'])) {
                    $errors[] = 'Razorpay secret key is required';
                }
                break;
                
            case 'mercadopago':
                if (empty($config['access_token'])) {
                    $errors[] = 'MercadoPago access token is required';
                }
                break;
                
            case 'bank':
                if (empty($config['details'])) {
                    $errors[] = 'Bank details are required';
                }
                break;
                
            case 'paytabs':
                if (empty($config['server_key'])) {
                    $errors[] = 'PayTabs server key is required';
                }
                if (empty($config['profile_id'])) {
                    $errors[] = 'PayTabs profile id is required';
                }
                if (empty($config['region'])) {
                    $errors[] = 'PayTabs region is required';
                }
                break;
                
            case 'skrill':
                if (empty($config['merchant_id'])) {
                    $errors[] = 'Skrill merchant ID is required';
                }
                if (empty($config['secret_word'])) {
                    $errors[] = 'Skrill secret word is required';
                }
                break;
                
            case 'coingate':
                if (empty($config['api_token'])) {
                    $errors[] = 'CoinGate API token is required';
                }
                break;
                
            case 'payfast':
                if (empty($config['merchant_id'])) {
                    $errors[] = 'Payfast merchant ID is required';
                }
                if (empty($config['merchant_key'])) {
                    $errors[] = 'Payfast merchant key is required';
                }
                break;
                
            case 'tap':
                if (empty($config['secret_key'])) {
                    $errors[] = 'Tap secret key is required';
                }
                break;
                
            case 'xendit':
                if (empty($config['api_key'])) {
                    $errors[] = 'Xendit api key is required';
                }
                break;
                
            case 'paytr':
                if (empty($config['merchant_id'])) {
                    $errors[] = 'PayTR merchant ID is required';
                }
                if (empty($config['merchant_key'])) {
                    $errors[] = 'PayTR merchant key is required';
                }
                if (empty($config['merchant_salt'])) {
                    $errors[] = 'PayTR merchant salt is required';
                }
                break;
                
            case 'mollie':
                if (empty($config['api_key'])) {
                    $errors[] = 'Mollie API key is required';
                }
                break;
                
            case 'toyyibpay':
                if (empty($config['category_code'])) {
                    $errors[] = 'toyyibPay category code is required';
                }
                if (empty($config['secret_key'])) {
                    $errors[] = 'toyyibPay secret key is required';
                }
                break;
                
            case 'cashfree':
                if (empty($config['public_key'])) {
                    $errors[] = 'Cashfree App ID is required';
                }
                if (empty($config['secret_key'])) {
                    $errors[] = 'Cashfree Secret Key is required';
                }
                break;
                
            case 'iyzipay':
                if (empty($config['public_key'])) {
                    $errors[] = 'Iyzipay API key is required';
                }
                if (empty($config['secret_key'])) {
                    $errors[] = 'Iyzipay secret key is required';
                }
                break;
                
            case 'benefit':
                if (empty($config['public_key'])) {
                    $errors[] = 'Benefit API key is required';
                }
                if (empty($config['secret_key'])) {
                    $errors[] = 'Benefit secret key is required';
                }
                break;
                
            case 'ozow':
                if (empty($config['site_key'])) {
                    $errors[] = 'Ozow site key is required';
                }
                if (empty($config['private_key'])) {
                    $errors[] = 'Ozow private key is required';
                }
                break;
                
            case 'easebuzz':
                if (empty($config['merchant_key'])) {
                    $errors[] = 'Easebuzz merchant key is required';
                }
                if (empty($config['salt_key'])) {
                    $errors[] = 'Easebuzz salt key is required';
                }
                break;
                
            case 'khalti':
                if (empty($config['public_key'])) {
                    $errors[] = 'Khalti public key is required';
                }
                if (empty($config['secret_key'])) {
                    $errors[] = 'Khalti secret key is required';
                }
                break;
                
            case 'authorizenet':
                if (empty($config['merchant_id'])) {
                    $errors[] = 'AuthorizeNet merchant ID is required';
                }
                if (empty($config['transaction_key'])) {
                    $errors[] = 'AuthorizeNet transaction key is required';
                }
                break;
                
            case 'fedapay':
                if (empty($config['public_key'])) {
                    $errors[] = 'FedaPay public key is required';
                }
                if (empty($config['secret_key'])) {
                    $errors[] = 'FedaPay secret key is required';
                }
                break;
                
            case 'payhere':
                if (empty($config['merchant_id'])) {
                    $errors[] = 'PayHere merchant ID is required';
                }
                if (empty($config['merchant_secret'])) {
                    $errors[] = 'PayHere merchant secret is required';
                }
                break;
                
            case 'cinetpay':
                if (empty($config['site_id'])) {
                    $errors[] = 'CinetPay site ID is required';
                }
                if (empty($config['api_key'])) {
                    $errors[] = 'CinetPay API key is required';
                }
                break;
                
            case 'paiement':
                if (empty($config['merchant_id'])) {
                    $errors[] = 'Paiement Pro merchant ID is required';
                }
                break;
                
            case 'nepalste':
                if (empty($config['public_key'])) {
                    $errors[] = 'Nepalste public key is required';
                }
                if (empty($config['secret_key'])) {
                    $errors[] = 'Nepalste secret key is required';
                }
                break;
                
            case 'yookassa':
                if (empty($config['shop_id'])) {
                    $errors[] = 'YooKassa shop ID is required';
                }
                if (empty($config['secret_key'])) {
                    $errors[] = 'YooKassa secret key is required';
                }
                break;
                
            case 'midtrans':
                if (empty($config['secret_key'])) {
                    $errors[] = 'Midtrans secret key is required';
                }
                break;
                
            case 'aamarpay':
                if (empty($config['store_id'])) {
                    $errors[] = 'Aamarpay store ID is required';
                }
                if (empty($config['signature'])) {
                    $errors[] = 'Aamarpay signature is required';
                }
                break;
                            
            case 'paymentwall':
                if (empty($config['public_key'])) {
                    $errors[] = 'PaymentWall public key is required';
                }
                if (empty($config['private_key'])) {
                    $errors[] = 'PaymentWall private key is required';
                }
                break;
                
            case 'sspay':
                if (empty($config['secret_key'])) {
                    $errors[] = 'SSPay secret key is required';
                }
                break;
        }
        
        return [
            'valid' => empty($errors),
            'errors' => $errors
        ];
    }
}

if (! function_exists('calculatePlanPricing')) {
    function calculatePlanPricing($plan, $couponCode = null, $billingCycle = 'monthly')
    {
        // Use the plan's method to get correct price for billing cycle
        $originalPrice = $plan->getPriceForCycle($billingCycle);
        $discountAmount = 0;
        $finalPrice = $originalPrice;
        $couponId = null;
        
        if ($couponCode) {
            $coupon = Coupon::where('code', $couponCode)
                ->where('status', 1)
                ->first();
            
            if ($coupon) {
                if ($coupon->type === 'percentage') {
                    $discountAmount = ($originalPrice * $coupon->discount_amount) / 100;
                } else {
                    $discountAmount = min($coupon->discount_amount, $originalPrice);
                }
                $finalPrice = max(0, $originalPrice - $discountAmount);
                $couponId = $coupon->id;
            }
        }
        
        return [
            'original_price' => $originalPrice,
            'discount_amount' => $discountAmount,
            'final_price' => $finalPrice,
            'coupon_id' => $couponId
        ];
    }
}

if (! function_exists('createPlanOrder')) {
    function createPlanOrder($data)
    {
        $plan = Plan::findOrFail($data['plan_id']);
        $billingCycle = $data['billing_cycle'] ?? 'monthly';
        $pricing = calculatePlanPricing($plan, $data['coupon_code'] ?? null, $billingCycle);
        
        return PlanOrder::create([
            'user_id' => $data['user_id'],
            'plan_id' => $plan->id,
            'coupon_id' => $pricing['coupon_id'],
            'billing_cycle' => $billingCycle,
            'payment_method' => $data['payment_method'],
            'coupon_code' => $data['coupon_code'] ?? null,
            'original_price' => $pricing['original_price'],
            'discount_amount' => $pricing['discount_amount'],
            'final_price' => $pricing['final_price'],
            'payment_id' => $data['payment_id'],
            'status' => $data['status'] ?? 'pending',
            'ordered_at' => now(),
        ]);
    }
}

if (! function_exists('assignPlanToUser')) {
    function assignPlanToUser($user, $plan, $billingCycle)
    {
        // Validate billing cycle
        if (!in_array($billingCycle, ['monthly', 'yearly'])) {
            throw new \InvalidArgumentException('Invalid billing cycle: ' . $billingCycle);
        }
        
        // Calculate expiration date based on billing cycle
        $expiresAt = $billingCycle === 'yearly' ? now()->addYear() : now()->addMonth();
        
        \Log::info('Assigning plan ' . $plan->id . ' to user ' . $user->id . ' with billing cycle ' . $billingCycle);
        
        // Update user with new plan and clear trial status
        $updated = $user->update([
            'plan_id' => $plan->id,
            'plan_expire_date' => $expiresAt,
            'plan_is_active' => 1,
            // Clear trial status when assigning paid plan
            'is_trial' => null,
            'trial_day' => 0,
            'trial_expire_date' => null,
        ]);
        
        \Log::info('Plan assignment result: ' . ($updated ? 'success' : 'failed'));
        
        return $updated;
    }
}

if (! function_exists('processPaymentSuccess')) {
    function processPaymentSuccess($data)
    {
        $plan = Plan::findOrFail($data['plan_id']);
        $user = User::findOrFail($data['user_id']);
        
        $planOrder = createPlanOrder(array_merge($data, ['status' => 'approved']));
        assignPlanToUser($user, $plan, $data['billing_cycle']);
        
        // Verify the plan was assigned
        $user->refresh();
        
        // Create referral record if user was referred
        \App\Http\Controllers\ReferralController::createReferralRecord($user);
        
        return $planOrder;
    }
}

if (! function_exists('getPaymentGatewaySettings')) {
    function getPaymentGatewaySettings()
    {
        $superAdminId = User::where('type', 'superadmin')->first()?->id;
        
        return [
            'payment_settings' => PaymentSetting::getUserSettings($superAdminId),
            'general_settings' => Setting::getUserSettings($superAdminId),
            'super_admin_id' => $superAdminId
        ];
    }
}

if (! function_exists('validatePaymentRequest')) {
    function validatePaymentRequest($request, $additionalRules = [])
    {
        $baseRules = [
            'plan_id' => 'required|exists:plans,id',
            'billing_cycle' => 'required|in:monthly,yearly',
            'coupon_code' => 'nullable|string',
        ];
        
        return $request->validate(array_merge($baseRules, $additionalRules));
    }
}

if (! function_exists('handlePaymentError')) {
    function handlePaymentError($e, $method = 'payment')
    {
        return back()->withErrors(['error' => __('Payment processing failed: :message', ['message' => $e->getMessage()])]);
    }
}

if (! function_exists('defaultSettings')) {
    /**
     * Get default settings for System, Brand, Storage, and Currency configurations
     *
     * @return array
     */
    function defaultSettings()
    {
        return [
            // System Settings
            'defaultLanguage' => 'en',
            'dateFormat' => 'Y-m-d',
            'timeFormat' => 'H:i',
            'calendarStartDay' => 'sunday',
            'defaultTimezone' => 'UTC',
            'emailVerification' => false,
            'landingPageEnabled' => true,
            
            // Brand Settings
            'logoDark' => '/images/logos/logo-dark.png',
            'logoLight' => '/images/logos/logo-light.png',
            'favicon' => '/images/logos/favicon.ico',
            'titleText' => 'Advocate',
            'footerText' => '© 2025 Advocate. All rights reserved.',
            'themeColor' => 'green',
            'customColor' => '#10b981',
            'sidebarVariant' => 'inset',
            'sidebarStyle' => 'plain',
            'layoutDirection' => 'left',
            'themeMode' => 'light',
            
            // Storage Settings
            'storage_type' => 'local',
            'storage_file_types' => 'jpg,png,webp,gif,pdf,doc,docx,txt,csv',
            'storage_max_upload_size' => '2048',
            'aws_access_key_id' => '',
            'aws_secret_access_key' => '',
            'aws_default_region' => 'us-east-1',
            'aws_bucket' => '',
            'aws_url' => '',
            'aws_endpoint' => '',
            'wasabi_access_key' => '',
            'wasabi_secret_key' => '',
            'wasabi_region' => 'us-east-1',
            'wasabi_bucket' => '',
            'wasabi_url' => '',
            'wasabi_root' => '',
            
            // Currency Settings
            'decimalFormat' => '2',
            'defaultCurrency' => 'USD',
            'decimalSeparator' => '.',
            'thousandsSeparator' => ',',
            'floatNumber' => true,
            'currencySymbolSpace' => false,
            'currencySymbolPosition' => 'before',
        ];
    }
}

if (! function_exists('createDefaultSettings')) {
    /**
     * Create default settings for a user
     *
     * @param int $userId
     * @return void
     */
    function createDefaultSettings($userId)
    {
        $defaults = defaultSettings();
        $settingsData = [];
        
        foreach ($defaults as $key => $value) {
            $settingsData[] = [
                'user_id' => $userId,
                'key' => $key,
                'value' => is_bool($value) ? ($value ? '1' : '0') : (string)$value,
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }
        
        Setting::insert($settingsData);
    }
}

if (! function_exists('copySettingsFromSuperAdmin')) {
    /**
     * Copy system and brand settings from superadmin to company user
     *
     * @param int $companyUserId
     * @return void
     */
    function copySettingsFromSuperAdmin($companyUserId)
    {
        $superAdmin = User::where('type', 'superadmin')->first();
        if (!$superAdmin) {
            createDefaultSettings($companyUserId);
            return;
        }
        
        // Settings to copy from superadmin (system and brand settings only)
        $settingsToCopy = [
            'defaultLanguage', 'dateFormat', 'timeFormat', 'calendarStartDay', 
            'defaultTimezone', 'emailVerification', 'landingPageEnabled',
            'logoDark', 'logoLight', 'favicon', 'titleText', 'footerText',
            'themeColor', 'customColor', 'sidebarVariant', 'sidebarStyle',
            'layoutDirection', 'themeMode'
        ];
        
        $superAdminSettings = Setting::where('user_id', $superAdmin->id)
            ->whereIn('key', $settingsToCopy)
            ->get();
        
        $settingsData = [];
        
        // Only copy existing superadmin settings
        foreach ($superAdminSettings as $setting) {
            $settingsData[] = [
                'user_id' => $companyUserId,
                'key' => $setting->key,
                'value' => $setting->value,
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }
        
        Setting::insertOrIgnore($settingsData);
    }
}

if (! function_exists('createdBy')) {
    function createdBy()
    {
        if (Auth::user()->type == 'superadmin') {
            return Auth::user()->id;
        } else if (Auth::user()->type == 'company') {
            return Auth::user()->id;
        } else {
            return  Auth::user()->id;
        }
    }
}

if (! function_exists('getCompanyAndUsersId')) {
    function getCompanyAndUsersId()
    {
        $user = Auth::user();
        if ($user->hasRole(['company'])) {
            $companyUserIds = User::where('created_by', $user->id)->pluck('id')->toArray();
            $companyUserIds[] = $user->id;
            return $companyUserIds;
        }else{
            $userCreatedBy = User::where('id',Auth::user()->created_by)->value('id');
            $companyUserIds = User::where('created_by', $userCreatedBy)->pluck('id')->toArray();
            $companyUserIds[] = $userCreatedBy;
            return $companyUserIds;
        }
    }
}