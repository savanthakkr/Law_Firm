<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DirectoryController;
use App\Http\Controllers\PermissionController;
use App\Http\Controllers\PlanController;
use App\Http\Controllers\PlanOrderController;
use App\Http\Controllers\PlanRequestController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\ReferralController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\CompanyController;
use App\Http\Controllers\CouponController;
use App\Http\Controllers\CurrencyController;
use App\Http\Controllers\ImpersonateController;
use App\Http\Controllers\TranslationController;
use App\Http\Controllers\LandingPageController;
use App\Http\Controllers\LandingPage\CustomPageController;
use App\Http\Controllers\LanguageController;
use App\Http\Controllers\MediaController;
use App\Http\Controllers\RazorpayController;
use App\Http\Controllers\MercadoPagoController;
use App\Http\Controllers\StripePaymentController;
use App\Http\Controllers\PayPalPaymentController;
use App\Http\Controllers\BankPaymentController;
use App\Http\Controllers\PaystackPaymentController;
use App\Http\Controllers\FlutterwavePaymentController;
use App\Http\Controllers\PayTabsPaymentController;
use App\Http\Controllers\SkrillPaymentController;
use App\Http\Controllers\CoinGatePaymentController;
use App\Http\Controllers\PayfastPaymentController;
use App\Http\Controllers\TapPaymentController;
use App\Http\Controllers\XenditPaymentController;
use App\Http\Controllers\PayTRPaymentController;
use App\Http\Controllers\MolliePaymentController;
use App\Http\Controllers\ToyyibPayPaymentController;
use App\Http\Controllers\CashfreeController;
use App\Http\Controllers\IyzipayPaymentController;
use App\Http\Controllers\BenefitPaymentController;
use App\Http\Controllers\OzowPaymentController;
use App\Http\Controllers\EasebuzzPaymentController;
use App\Http\Controllers\KhaltiPaymentController;
use App\Http\Controllers\AuthorizeNetPaymentController;
use App\Http\Controllers\FedaPayPaymentController;
use App\Http\Controllers\PayHerePaymentController;
use App\Http\Controllers\CinetPayPaymentController;
use App\Http\Controllers\PaiementPaymentController;
use App\Http\Controllers\NepalstePaymentController;
use App\Http\Controllers\YooKassaPaymentController;
use App\Http\Controllers\AamarpayPaymentController;
use App\Http\Controllers\MidtransPaymentController;
use App\Http\Controllers\PaymentWallPaymentController;
use App\Http\Controllers\SSPayPaymentController;
use App\Http\Controllers\PublicFormController;
use App\Http\Controllers\TaskController;
use App\Http\Controllers\TaskTypeController;
use App\Http\Controllers\TaskStatusController;
use App\Http\Controllers\WorkflowController;


use App\Http\Controllers\TaskCommentController;

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', [LandingPageController::class, 'show'])->name('home');
Route::get('/directory', [DirectoryController::class, 'index'])->name('directory.index');

// Invoice Payment Routes (Public - No Auth Required)
Route::get('invoice/pay/{token}', [\App\Http\Controllers\InvoicePaymentController::class, 'show'])->name('invoice.payment');
Route::post('invoice/pay/{token}', [\App\Http\Controllers\InvoicePaymentController::class, 'processPayment'])->name('invoice.payment.process');
Route::get('invoice/pay/{token}/success', [\App\Http\Controllers\InvoicePaymentController::class, 'success'])->name('invoice.payment.success');

// Public form submission routes

// Cashfree webhook (public route)
Route::post('cashfree/webhook', [CashfreeController::class, 'webhook'])->name('cashfree.webhook');

// Benefit webhook (public route)
Route::post('benefit/webhook', [BenefitPaymentController::class, 'webhook'])->name('benefit.webhook');
Route::get('payments/benefit/success', [BenefitPaymentController::class, 'success'])->name('benefit.success');
Route::post('payments/benefit/callback', [BenefitPaymentController::class, 'callback'])->name('benefit.callback');

// FedaPay callback (public route)
Route::match(['GET', 'POST'], 'payments/fedapay/callback', [FedaPayPaymentController::class, 'callback'])->name('fedapay.callback');

// YooKassa success/callback (public routes)
Route::get('payments/yookassa/success', [YooKassaPaymentController::class, 'success'])->name('yookassa.success');
Route::post('payments/yookassa/callback', [YooKassaPaymentController::class, 'callback'])->name('yookassa.callback');

// Nepalste success/callback (public routes)
Route::get('payments/nepalste/success', [NepalstePaymentController::class, 'success'])->name('nepalste.success');
Route::post('payments/nepalste/callback', [NepalstePaymentController::class, 'callback'])->name('nepalste.callback');

// PayTR callback (public route)
Route::post('payments/paytr/callback', [PayTRPaymentController::class, 'callback'])->name('paytr.callback');

// PayTabs callback (public route)
Route::match(['GET', 'POST'], 'payments/paytabs/callback', [PayTabsPaymentController::class, 'callback'])->name('paytabs.callback');
Route::get('payments/paytabs/success', [PayTabsPaymentController::class, 'success'])->name('paytabs.success');

// Tap payment routes (public routes)
Route::get('payments/tap/success', [TapPaymentController::class, 'success'])->name('tap.success');
Route::post('payments/tap/callback', [TapPaymentController::class, 'callback'])->name('tap.callback');

// Aamarpay payment routes (public routes)
Route::match(['GET', 'POST'], 'payments/aamarpay/success', [AamarpayPaymentController::class, 'success'])->name('aamarpay.success');
Route::post('payments/aamarpay/callback', [AamarpayPaymentController::class, 'callback'])->name('aamarpay.callback');

// PaymentWall callback (public route)
Route::match(['GET', 'POST'], 'payments/paymentwall/callback', [PaymentWallPaymentController::class, 'callback'])->name('paymentwall.callback');
Route::get('payments/paymentwall/success', [PaymentWallPaymentController::class, 'success'])->name('paymentwall.success');

// PayFast payment routes (public routes)
Route::get('payments/payfast/success', [PayfastPaymentController::class, 'success'])->name('payfast.success');
Route::post('payments/payfast/callback', [PayfastPaymentController::class, 'callback'])->name('payfast.callback');

// CoinGate callback (public route)
Route::match(['GET', 'POST'], 'payments/coingate/callback', [CoinGatePaymentController::class, 'callback'])->name('coingate.callback');

// Xendit payment routes (public routes)
Route::get('payments/xendit/success', [XenditPaymentController::class, 'success'])->name('xendit.success');
Route::post('payments/xendit/callback', [XenditPaymentController::class, 'callback'])->name('xendit.callback');

// PWA Manifest routes removed

Route::get('/landing-page', [LandingPageController::class, 'settings'])->name('landing-page');
Route::post('/landing-page/contact', [LandingPageController::class, 'submitContact'])->name('landing-page.contact');
Route::post('/landing-page/subscribe', [LandingPageController::class, 'subscribe'])->name('landing-page.subscribe');
Route::post('newsletter/subscribe', [\App\Http\Controllers\NewsletterController::class, 'subscribe'])->name('newsletter.subscribe');
Route::get('newsletter/unsubscribe/{email}', [\App\Http\Controllers\NewsletterController::class, 'unsubscribe'])->name('newsletter.unsubscribe');
Route::get('/page/{slug}', [CustomPageController::class, 'show'])->name('custom-page.show');

Route::get('/translations/{locale}', [TranslationController::class, 'getTranslations'])->name('translations');
Route::get('/refresh-language/{locale}', [TranslationController::class, 'refreshLanguage'])->name('refresh-language');
Route::get('/initial-locale', [TranslationController::class, 'getInitialLocale'])->name('initial-locale');


// Email Templates routes (no middleware for testing)
Route::get('email-templates', [\App\Http\Controllers\EmailTemplateController::class, 'index'])->name('email-templates.index');
Route::get('email-templates/{emailTemplate}', [\App\Http\Controllers\EmailTemplateController::class, 'show'])->name('email-templates.show');
Route::put('email-templates/{emailTemplate}/settings', [\App\Http\Controllers\EmailTemplateController::class, 'updateSettings'])->name('email-templates.update-settings');
Route::put('email-templates/{emailTemplate}/content', [\App\Http\Controllers\EmailTemplateController::class, 'updateContent'])->name('email-templates.update-content');

Route::middleware(['auth', 'verified'])->group(function () {
    // Plans routes - accessible without plan check
    Route::get('plans', [PlanController::class, 'index'])->name('plans.index');
    Route::post('plans/request', [PlanController::class, 'requestPlan'])->name('plans.request');
    Route::post('plans/trial', [PlanController::class, 'startTrial'])->name('plans.trial');
    Route::post('plans/subscribe', [PlanController::class, 'subscribe'])->name('plans.subscribe');
    Route::post('plans/coupons/validate', [CouponController::class, 'validate'])->name('coupons.validate');

    // Payment routes - accessible without plan check
    Route::post('payments/stripe', [StripePaymentController::class, 'processPayment'])->name('stripe.payment');
    Route::post('payments/paypal', [PayPalPaymentController::class, 'processPayment'])->name('paypal.payment');
    Route::post('payments/bank', [BankPaymentController::class, 'processPayment'])->name('bank.payment');
    Route::post('payments/paystack', [PaystackPaymentController::class, 'processPayment'])->name('paystack.payment');
    Route::post('payments/flutterwave', [FlutterwavePaymentController::class, 'processPayment'])->name('flutterwave.payment');
    Route::post('payments/paytabs', [PayTabsPaymentController::class, 'processPayment'])->name('paytabs.payment');
    Route::post('payments/skrill', [SkrillPaymentController::class, 'processPayment'])->name('skrill.payment');
    Route::post('payments/coingate', [CoinGatePaymentController::class, 'processPayment'])->name('coingate.payment');
    Route::post('payments/payfast', [PayfastPaymentController::class, 'processPayment'])->name('payfast.payment');
    Route::post('payments/mollie', [MolliePaymentController::class, 'processPayment'])->name('mollie.payment');
    Route::post('payments/toyyibpay', [ToyyibPayPaymentController::class, 'processPayment'])->name('toyyibpay.payment');
    Route::post('payments/iyzipay', [IyzipayPaymentController::class, 'processPayment'])->name('iyzipay.payment');
    Route::post('payments/benefit', [BenefitPaymentController::class, 'processPayment'])->name('benefit.payment');
    Route::post('payments/ozow', [OzowPaymentController::class, 'processPayment'])->name('ozow.payment');
    Route::post('payments/easebuzz', [EasebuzzPaymentController::class, 'processPayment'])->name('easebuzz.payment');
    Route::post('payments/khalti', [KhaltiPaymentController::class, 'processPayment'])->name('khalti.payment');
    Route::post('payments/authorizenet', [AuthorizeNetPaymentController::class, 'processPayment'])->name('authorizenet.payment');
    Route::post('payments/fedapay', [FedaPayPaymentController::class, 'processPayment'])->name('fedapay.payment');
    Route::post('payments/payhere', [PayHerePaymentController::class, 'processPayment'])->name('payhere.payment');
    Route::post('payments/cinetpay', [CinetPayPaymentController::class, 'processPayment'])->name('cinetpay.payment');
    Route::post('payments/paiement', [PaiementPaymentController::class, 'processPayment'])->name('paiement.payment');
    Route::post('payments/nepalste', [NepalstePaymentController::class, 'processPayment'])->name('nepalste.payment');
    Route::post('payments/yookassa', [YooKassaPaymentController::class, 'processPayment'])->name('yookassa.payment');
    Route::post('payments/aamarpay', [AamarpayPaymentController::class, 'processPayment'])->name('aamarpay.payment');
    Route::post('payments/midtrans', [MidtransPaymentController::class, 'processPayment'])->name('midtrans.payment');
    Route::post('payments/paymentwall', [PaymentWallPaymentController::class, 'processPayment'])->name('paymentwall.payment');
    Route::post('payments/sspay', [SSPayPaymentController::class, 'processPayment'])->name('sspay.payment');

    // Payment gateway specific routes
    Route::post('razorpay/create-order', [RazorpayController::class, 'createOrder'])->name('razorpay.create-order');
    Route::post('razorpay/verify-payment', [RazorpayController::class, 'verifyPayment'])->name('razorpay.verify-payment');
    Route::post('cashfree/create-session', [CashfreeController::class, 'createPaymentSession'])->name('cashfree.create-session');
    Route::post('cashfree/verify-payment', [CashfreeController::class, 'verifyPayment'])->name('cashfree.verify-payment');
    Route::post('mercadopago/create-preference', [MercadoPagoController::class, 'createPreference'])->name('mercadopago.create-preference');
    Route::post('mercadopago/process-payment', [MercadoPagoController::class, 'processPayment'])->name('mercadopago.process-payment');

    // Other payment creation routes
    Route::post('tap/create-payment', [TapPaymentController::class, 'createPayment'])->name('tap.create-payment');
    Route::post('xendit/create-payment', [XenditPaymentController::class, 'createPayment'])->name('xendit.create-payment');
    Route::post('payments/paytr/create-token', [PayTRPaymentController::class, 'createPaymentToken'])->name('paytr.create-token');
    Route::post('iyzipay/create-form', [IyzipayPaymentController::class, 'createPaymentForm'])->name('iyzipay.create-form');
    Route::post('benefit/create-session', [BenefitPaymentController::class, 'createPaymentSession'])->name('benefit.create-session');
    Route::post('ozow/create-payment', [OzowPaymentController::class, 'createPayment'])->name('ozow.create-payment');
    Route::post('easebuzz/create-payment', [EasebuzzPaymentController::class, 'createPayment'])->name('easebuzz.create-payment');
    Route::post('khalti/create-payment', [KhaltiPaymentController::class, 'createPayment'])->name('khalti.create-payment');
    Route::post('authorizenet/create-form', [AuthorizeNetPaymentController::class, 'createPaymentForm'])->name('authorizenet.create-form');
    Route::post('fedapay/create-payment', [FedaPayPaymentController::class, 'createPayment'])->name('fedapay.create-payment');
    Route::post('payhere/create-payment', [PayHerePaymentController::class, 'createPayment'])->name('payhere.create-payment');
    Route::post('cinetpay/create-payment', [CinetPayPaymentController::class, 'createPayment'])->name('cinetpay.create-payment');
    Route::post('paiement/create-payment', [PaiementPaymentController::class, 'createPayment'])->name('paiement.create-payment');
    Route::post('nepalste/create-payment', [NepalstePaymentController::class, 'createPayment'])->name('nepalste.create-payment');
    Route::post('yookassa/create-payment', [YooKassaPaymentController::class, 'createPayment'])->name('yookassa.create-payment');
    Route::post('aamarpay/create-payment', [AamarpayPaymentController::class, 'createPayment'])->name('aamarpay.create-payment');
    Route::post('midtrans/create-payment', [MidtransPaymentController::class, 'createPayment'])->name('midtrans.create-payment');
    Route::post('paymentwall/create-payment', [PaymentWallPaymentController::class, 'createPayment'])->name('paymentwall.create-payment');
    Route::post('sspay/create-payment', [SSPayPaymentController::class, 'createPayment'])->name('sspay.create-payment');

    // Payment success/callback routes
    Route::post('payments/skrill/callback', [SkrillPaymentController::class, 'callback'])->name('skrill.callback');
    Route::get('payments/paytr/success', [PayTRPaymentController::class, 'success'])->name('paytr.success');
    Route::get('payments/paytr/failure', [PayTRPaymentController::class, 'failure'])->name('paytr.failure');
    Route::get('payments/mollie/success', [MolliePaymentController::class, 'success'])->name('mollie.success');
    Route::post('payments/mollie/callback', [MolliePaymentController::class, 'callback'])->name('mollie.callback');
    Route::match(['GET', 'POST'], 'payments/toyyibpay/success', [ToyyibPayPaymentController::class, 'success'])->name('toyyibpay.success');
    Route::post('payments/toyyibpay/callback', [ToyyibPayPaymentController::class, 'callback'])->name('toyyibpay.callback');
    Route::post('payments/iyzipay/callback', [IyzipayPaymentController::class, 'callback'])->name('iyzipay.callback');
    Route::get('payments/ozow/success', [OzowPaymentController::class, 'success'])->name('ozow.success');
    Route::post('payments/ozow/callback', [OzowPaymentController::class, 'callback'])->name('ozow.callback');
    Route::get('payments/payhere/success', [PayHerePaymentController::class, 'success'])->name('payhere.success');
    Route::post('payments/payhere/callback', [PayHerePaymentController::class, 'callback'])->name('payhere.callback');
    Route::get('payments/cinetpay/success', [CinetPayPaymentController::class, 'success'])->name('cinetpay.success');
    Route::post('payments/cinetpay/callback', [CinetPayPaymentController::class, 'callback'])->name('cinetpay.callback');
    Route::get('payments/paiement/success', [PaiementPaymentController::class, 'success'])->name('paiement.success');
    Route::post('payments/paiement/callback', [PaiementPaymentController::class, 'callback'])->name('paiement.callback');
    Route::post('payments/midtrans/callback', [MidtransPaymentController::class, 'callback'])->name('midtrans.callback');
    Route::post('paymentwall/process', [PaymentWallPaymentController::class, 'processPayment'])->name('paymentwall.process');
    Route::get('payments/sspay/success', [SSPayPaymentController::class, 'success'])->name('sspay.success');
    Route::post('payments/sspay/callback', [SSPayPaymentController::class, 'callback'])->name('sspay.callback');
    Route::get('mercadopago/success', [MercadoPagoController::class, 'success'])->name('mercadopago.success');
    Route::get('mercadopago/failure', [MercadoPagoController::class, 'failure'])->name('mercadopago.failure');
    Route::get('mercadopago/pending', [MercadoPagoController::class, 'pending'])->name('mercadopago.pending');
    Route::post('mercadopago/webhook', [MercadoPagoController::class, 'webhook'])->name('mercadopago.webhook');
    Route::post('authorizenet/test-connection', [AuthorizeNetPaymentController::class, 'testConnection'])->name('authorizenet.test-connection');

    // All other routes require plan access check
    Route::middleware('plan.access')->group(function () {
        Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');
        Route::get('dashboard/redirect', [DashboardController::class, 'redirectToFirstAvailablePage'])->name('dashboard.redirect');
        
        // Analytics routes
        Route::get('dashboard/analytics', [\App\Http\Controllers\DashboardAnalyticsController::class, 'index'])->name('dashboard.analytics.index');

        Route::get('media-library', function () {
            $storageSettings = \App\Services\StorageConfigService::getStorageConfig();
            return Inertia::render('media-library', [
                'storageSettings' => $storageSettings
            ]);
        })->name('media-library');



        // Media Library API routes
        Route::get('api/media', [MediaController::class, 'index'])->middleware('permission:manage-media')->name('api.media.index');
        Route::post('api/media/batch', [MediaController::class, 'batchStore'])->middleware('permission:create-media')->name('api.media.batch');
        Route::get('api/media/{id}/download', [MediaController::class, 'download'])->middleware('permission:download-media')->name('api.media.download');
        Route::delete('api/media/{id}', [MediaController::class, 'destroy'])->middleware('permission:delete-media')->name('api.media.destroy');

        // Document API routes
        Route::get('api/documents/{document}/download', [\App\Http\Controllers\DocumentController::class, 'apiDownload'])->middleware('permission:download-documents')->name('api.documents.download');

        // Permissions routes with granular permissions
        Route::middleware('permission:manage-permissions')->group(function () {
            Route::get('permissions', [PermissionController::class, 'index'])->middleware('permission:manage-permissions')->name('permissions.index');
            Route::get('permissions/create', [PermissionController::class, 'create'])->middleware('permission:create-permissions')->name('permissions.create');
            Route::post('permissions', [PermissionController::class, 'store'])->middleware('permission:create-permissions')->name('permissions.store');
            Route::get('permissions/{permission}', [PermissionController::class, 'show'])->middleware('permission:view-permissions')->name('permissions.show');
            Route::get('permissions/{permission}/edit', [PermissionController::class, 'edit'])->middleware('permission:edit-permissions')->name('permissions.edit');
            Route::put('permissions/{permission}', [PermissionController::class, 'update'])->middleware('permission:edit-permissions')->name('permissions.update');
            Route::patch('permissions/{permission}', [PermissionController::class, 'update'])->middleware('permission:edit-permissions');
            Route::delete('permissions/{permission}', [PermissionController::class, 'destroy'])->middleware('permission:delete-permissions')->name('permissions.destroy');
        });

        // Roles routes with granular permissions
        Route::middleware('permission:manage-roles')->group(function () {
            Route::get('roles', [RoleController::class, 'index'])->middleware('permission:manage-roles')->name('roles.index');
            Route::get('roles/create', [RoleController::class, 'create'])->middleware('permission:create-roles')->name('roles.create');
            Route::post('roles', [RoleController::class, 'store'])->middleware('permission:create-roles')->name('roles.store');
            Route::get('roles/{role}', [RoleController::class, 'show'])->middleware('permission:view-roles')->name('roles.show');
            Route::get('roles/{role}/edit', [RoleController::class, 'edit'])->middleware('permission:edit-roles')->name('roles.edit');
            Route::put('roles/{role}', [RoleController::class, 'update'])->middleware('permission:edit-roles')->name('roles.update');
            Route::patch('roles/{role}', [RoleController::class, 'update'])->middleware('permission:edit-roles');
            Route::delete('roles/{role}', [RoleController::class, 'destroy'])->middleware('permission:delete-roles')->name('roles.destroy');
        });

        // Users routes with granular permissions
        Route::middleware('permission:manage-users')->group(function () {
            Route::get('users', [UserController::class, 'index'])->middleware('permission:manage-users')->name('users.index');
            Route::get('users/create', [UserController::class, 'create'])->middleware('permission:create-users')->name('users.create');
            Route::post('users', [UserController::class, 'store'])->middleware('permission:create-users')->name('users.store');
            Route::get('users/{user}', [UserController::class, 'show'])->middleware('permission:view-users')->name('users.show');
            Route::get('users/{user}/edit', [UserController::class, 'edit'])->middleware('permission:edit-users')->name('users.edit');
            Route::put('users/{user}', [UserController::class, 'update'])->middleware('permission:edit-users')->name('users.update');
            Route::patch('users/{user}', [UserController::class, 'update'])->middleware('permission:edit-users');
            Route::delete('users/{user}', [UserController::class, 'destroy'])->middleware('permission:delete-users')->name('users.destroy');

            // Additional user routes
            Route::put('users/{user}/reset-password', [UserController::class, 'resetPassword'])->middleware('permission:reset-password-users')->name('users.reset-password');
            Route::put('users/{user}/toggle-status', [UserController::class, 'toggleStatus'])->middleware('permission:toggle-status-users')->name('users.toggle-status');
        });




        // Client Type routes
        Route::middleware('permission:manage-client-types')->group(function () {
            Route::get('clients/client-types', [\App\Http\Controllers\ClientTypeController::class, 'index'])->name('clients.client-types.index');
            Route::post('clients/client-types', [\App\Http\Controllers\ClientTypeController::class, 'store'])->middleware('permission:create-client-types')->name('clients.client-types.store');
            Route::put('clients/client-types/{clientType}', [\App\Http\Controllers\ClientTypeController::class, 'update'])->middleware('permission:edit-client-types')->name('clients.client-types.update');
            Route::delete('clients/client-types/{clientType}', [\App\Http\Controllers\ClientTypeController::class, 'destroy'])->middleware('permission:delete-client-types')->name('clients.client-types.destroy');
            Route::put('clients/client-types/{clientType}/toggle-status', [\App\Http\Controllers\ClientTypeController::class, 'toggleStatus'])->middleware('permission:edit-client-types')->name('clients.client-types.toggle-status');
        });

        // Client routes
        Route::middleware('permission:manage-clients')->group(function () {
            Route::get('clients', [\App\Http\Controllers\ClientController::class, 'index'])->name('clients.index');
            Route::get('clients/{client}', [\App\Http\Controllers\ClientController::class, 'show'])->middleware('permission:view-clients')->name('clients.show');
            Route::post('clients', [\App\Http\Controllers\ClientController::class, 'store'])->middleware('permission:create-clients')->name('clients.store');
            Route::put('clients/{client}', [\App\Http\Controllers\ClientController::class, 'update'])->middleware('permission:edit-clients')->name('clients.update');
            Route::delete('clients/{client}', [\App\Http\Controllers\ClientController::class, 'destroy'])->middleware('permission:delete-clients')->name('clients.destroy');
            Route::put('clients/{client}/toggle-status', [\App\Http\Controllers\ClientController::class, 'toggleStatus'])->middleware('permission:edit-clients')->name('clients.toggle-status');
            Route::put('clients/{client}/reset-password', [\App\Http\Controllers\ClientController::class, 'resetPassword'])->middleware('permission:edit-clients')->name('clients.reset-password');
        });



        // Client Document routes
        Route::middleware('permission:manage-client-documents')->group(function () {
            Route::get('client/documents', [\App\Http\Controllers\ClientDocumentController::class, 'index'])->name('clients.documents.index');
            Route::post('client/documents', [\App\Http\Controllers\ClientDocumentController::class, 'store'])->middleware('permission:create-client-documents')->name('clients.documents.store');
            Route::put('client/documents/{document}', [\App\Http\Controllers\ClientDocumentController::class, 'update'])->middleware('permission:edit-client-documents')->name('clients.documents.update');
            Route::delete('client/documents/{document}', [\App\Http\Controllers\ClientDocumentController::class, 'destroy'])->middleware('permission:delete-client-documents')->name('clients.documents.destroy');
            Route::get('client/documents/{document}/download', [\App\Http\Controllers\ClientDocumentController::class, 'download'])->middleware('permission:download-client-documents')->name('clients.documents.download');
        });

        // Client Billing Info routes
        Route::middleware('permission:manage-client-billing')->group(function () {
            Route::get('client/billing', [\App\Http\Controllers\ClientBillingInfoController::class, 'index'])->name('clients.billing.index');
            Route::post('client/billing', [\App\Http\Controllers\ClientBillingInfoController::class, 'store'])->middleware('permission:create-client-billing')->name('clients.billing.store');
            Route::put('client/billing/{billing}', [\App\Http\Controllers\ClientBillingInfoController::class, 'update'])->middleware('permission:edit-client-billing')->name('clients.billing.update');
            Route::delete('client/billing/{billing}', [\App\Http\Controllers\ClientBillingInfoController::class, 'destroy'])->middleware('permission:delete-client-billing')->name('clients.billing.destroy');
        });

        // Client Billing Currency routes
        Route::middleware('permission:manage-client-billing-currencies')->group(function () {
            Route::get('client-billing-currencies', [\App\Http\Controllers\ClientBillingCurrencyController::class, 'index'])->name('client-billing-currencies.index');
            Route::post('client-billing-currencies', [\App\Http\Controllers\ClientBillingCurrencyController::class, 'store'])->middleware('permission:create-client-billing-currencies')->name('client-billing-currencies.store');
            Route::put('client-billing-currencies/{clientBillingCurrency}', [\App\Http\Controllers\ClientBillingCurrencyController::class, 'update'])->middleware('permission:edit-client-billing-currencies')->name('client-billing-currencies.update');
            Route::delete('client-billing-currencies/{clientBillingCurrency}', [\App\Http\Controllers\ClientBillingCurrencyController::class, 'destroy'])->middleware('permission:delete-client-billing-currencies')->name('client-billing-currencies.destroy');
            Route::get('api/client-billing-currencies', [\App\Http\Controllers\ClientBillingCurrencyController::class, 'getAllCurrencies'])->name('api.client-billing-currencies');
        });

        // Company Profile routes
        Route::middleware('permission:manage-company-profiles')->group(function () {
            Route::get('advocate/company-profiles', [\App\Http\Controllers\CompanyProfileController::class, 'index'])->name('advocate.company-profiles.index');
            Route::post('advocate/company-profiles', [\App\Http\Controllers\CompanyProfileController::class, 'store'])->middleware('permission:create-company-profiles')->name('advocate.company-profiles.store');
            Route::put('advocate/company-profiles/{profile}', [\App\Http\Controllers\CompanyProfileController::class, 'update'])->middleware('permission:edit-company-profiles')->name('advocate.company-profiles.update');
            Route::delete('advocate/company-profiles/{profile}', [\App\Http\Controllers\CompanyProfileController::class, 'destroy'])->middleware('permission:delete-company-profiles')->name('advocate.company-profiles.destroy');
            Route::put('advocate/company-profiles/{profile}/toggle-status', [\App\Http\Controllers\CompanyProfileController::class, 'toggleStatus'])->middleware('permission:edit-company-profiles')->name('advocate.company-profiles.toggle-status');
        });

        // Practice Area routes
        Route::middleware('permission:manage-practice-areas')->group(function () {
            Route::get('advocate/practice-areas', [\App\Http\Controllers\PracticeAreaController::class, 'index'])->name('advocate.practice-areas.index');
            Route::post('advocate/practice-areas', [\App\Http\Controllers\PracticeAreaController::class, 'store'])->middleware('permission:create-practice-areas')->name('advocate.practice-areas.store');
            Route::put('advocate/practice-areas/{area}', [\App\Http\Controllers\PracticeAreaController::class, 'update'])->middleware('permission:edit-practice-areas')->name('advocate.practice-areas.update');
            Route::delete('advocate/practice-areas/{area}', [\App\Http\Controllers\PracticeAreaController::class, 'destroy'])->middleware('permission:delete-practice-areas')->name('advocate.practice-areas.destroy');
            Route::put('advocate/practice-areas/{area}/toggle-status', [\App\Http\Controllers\PracticeAreaController::class, 'toggleStatus'])->middleware('permission:edit-practice-areas')->name('advocate.practice-areas.toggle-status');
        });

        // Company Setting routes
        Route::middleware('permission:manage-company-settings')->group(function () {
            Route::get('advocate/company-settings', [\App\Http\Controllers\CompanySettingController::class, 'index'])->name('advocate.company-settings.index');
            Route::put('advocate/company-settings/{setting}', [\App\Http\Controllers\CompanySettingController::class, 'update'])->middleware('permission:edit-company-settings')->name('advocate.company-settings.update');
        });

        // Case Document routes
        Route::middleware('permission:manage-case-documents')->group(function () {
            Route::get('advocate/case-documents', [\App\Http\Controllers\CaseDocumentController::class, 'index'])->name('advocate.case-documents.index');
            Route::post('advocate/case-documents', [\App\Http\Controllers\CaseDocumentController::class, 'store'])->middleware('permission:create-case-documents')->name('advocate.case-documents.store');
            Route::put('advocate/case-documents/{document}', [\App\Http\Controllers\CaseDocumentController::class, 'update'])->middleware('permission:edit-case-documents')->name('advocate.case-documents.update');
            Route::delete('advocate/case-documents/{document}', [\App\Http\Controllers\CaseDocumentController::class, 'destroy'])->middleware('permission:delete-case-documents')->name('advocate.case-documents.destroy');
            Route::get('advocate/case-documents/{document}/download', [\App\Http\Controllers\CaseDocumentController::class, 'download'])->middleware('permission:download-case-documents')->name('advocate.case-documents.download');
        });

        // Case Note routes
        Route::middleware('permission:manage-case-notes')->group(function () {
            Route::get('advocate/case-notes', [\App\Http\Controllers\CaseNoteController::class, 'index'])->name('advocate.case-notes.index');
            Route::post('advocate/case-notes', [\App\Http\Controllers\CaseNoteController::class, 'store'])->middleware('permission:create-case-notes')->name('advocate.case-notes.store');
            Route::put('advocate/case-notes/{note}', [\App\Http\Controllers\CaseNoteController::class, 'update'])->middleware('permission:edit-case-notes')->name('advocate.case-notes.update');
            Route::delete('advocate/case-notes/{note}', [\App\Http\Controllers\CaseNoteController::class, 'destroy'])->middleware('permission:delete-case-notes')->name('advocate.case-notes.destroy');
        });

        // Document Type routes
        Route::middleware('permission:manage-document-types')->group(function () {
            Route::get('advocate/document-types', [\App\Http\Controllers\DocumentTypeController::class, 'index'])->name('advocate.document-types.index');
            Route::post('advocate/document-types', [\App\Http\Controllers\DocumentTypeController::class, 'store'])->middleware('permission:create-document-types')->name('advocate.document-types.store');
            Route::put('advocate/document-types/{documentType}', [\App\Http\Controllers\DocumentTypeController::class, 'update'])->middleware('permission:edit-document-types')->name('advocate.document-types.update');
            Route::delete('advocate/document-types/{documentType}', [\App\Http\Controllers\DocumentTypeController::class, 'destroy'])->middleware('permission:delete-document-types')->name('advocate.document-types.destroy');
            Route::put('advocate/document-types/{documentType}/toggle-status', [\App\Http\Controllers\DocumentTypeController::class, 'toggleStatus'])->middleware('permission:edit-document-types')->name('advocate.document-types.toggle-status');
        });

        // Document Category routes
        Route::middleware('permission:manage-document-categories')->group(function () {
            Route::get('document-management/categories', [\App\Http\Controllers\DocumentCategoryController::class, 'index'])->name('document-management.categories.index');
            Route::post('document-management/categories', [\App\Http\Controllers\DocumentCategoryController::class, 'store'])->middleware('permission:create-document-categories')->name('document-management.categories.store');
            Route::put('document-management/categories/{category}', [\App\Http\Controllers\DocumentCategoryController::class, 'update'])->middleware('permission:edit-document-categories')->name('document-management.categories.update');
            Route::delete('document-management/categories/{category}', [\App\Http\Controllers\DocumentCategoryController::class, 'destroy'])->middleware('permission:delete-document-categories')->name('document-management.categories.destroy');
            Route::put('document-management/categories/{category}/toggle-status', [\App\Http\Controllers\DocumentCategoryController::class, 'toggleStatus'])->middleware('permission:edit-document-categories')->name('document-management.categories.toggle-status');
        });

        // Document routes
        Route::middleware('permission:manage-documents')->group(function () {
            Route::get('document-management/documents', [\App\Http\Controllers\DocumentController::class, 'index'])->name('document-management.documents.index');
            Route::get('document-management/documents/{document}', [\App\Http\Controllers\DocumentController::class, 'show'])->middleware('permission:view-documents')->name('document-management.documents.show');
            Route::post('document-management/documents', [\App\Http\Controllers\DocumentController::class, 'store'])->middleware('permission:create-documents')->name('document-management.documents.store');
            Route::put('document-management/documents/{document}', [\App\Http\Controllers\DocumentController::class, 'update'])->middleware('permission:edit-documents')->name('document-management.documents.update');
            Route::delete('document-management/documents/{document}', [\App\Http\Controllers\DocumentController::class, 'destroy'])->middleware('permission:delete-documents')->name('document-management.documents.destroy');
            Route::get('document-management/documents/{document}/download', [\App\Http\Controllers\DocumentController::class, 'download'])->middleware('permission:download-documents')->name('document-management.documents.download');
        });



        // Document Version routes
        Route::middleware('permission:manage-document-versions')->group(function () {
            Route::get('document-management/versions', [\App\Http\Controllers\DocumentVersionController::class, 'index'])->name('document-management.versions.index');
            Route::post('document-management/versions', [\App\Http\Controllers\DocumentVersionController::class, 'store'])->middleware('permission:create-document-versions')->name('document-management.versions.store');
            Route::delete('document-management/versions/{version}', [\App\Http\Controllers\DocumentVersionController::class, 'destroy'])->middleware('permission:delete-document-versions')->name('document-management.versions.destroy');
            Route::get('document-management/versions/{version}/download', [\App\Http\Controllers\DocumentVersionController::class, 'download'])->middleware('permission:download-document-versions')->name('document-management.versions.download');
            Route::put('document-management/versions/{version}/restore', [\App\Http\Controllers\DocumentVersionController::class, 'restore'])->middleware('permission:restore-document-versions')->name('document-management.versions.restore');
        });

        // Document Comment routes
        Route::middleware('permission:manage-document-comments')->group(function () {
            Route::get('document-management/comments', [\App\Http\Controllers\DocumentCommentController::class, 'index'])->name('document-management.comments.index');
            Route::post('document-management/comments', [\App\Http\Controllers\DocumentCommentController::class, 'store'])->middleware('permission:create-document-comments')->name('document-management.comments.store');
            Route::put('document-management/comments/{comment}', [\App\Http\Controllers\DocumentCommentController::class, 'update'])->middleware('permission:edit-document-comments')->name('document-management.comments.update');
            Route::delete('document-management/comments/{comment}', [\App\Http\Controllers\DocumentCommentController::class, 'destroy'])->middleware('permission:delete-document-comments')->name('document-management.comments.destroy');
            Route::put('document-management/comments/{comment}/toggle-resolve', [\App\Http\Controllers\DocumentCommentController::class, 'toggleResolve'])->middleware('permission:resolve-document-comments')->name('document-management.comments.toggle-resolve');
        });

        // Document Permission routes
        Route::middleware('permission:manage-document-permissions')->group(function () {
            Route::get('document-management/permissions', [\App\Http\Controllers\DocumentPermissionController::class, 'index'])->name('document-management.permissions.index');
            Route::post('document-management/permissions', [\App\Http\Controllers\DocumentPermissionController::class, 'store'])->middleware('permission:create-document-permissions')->name('document-management.permissions.store');
            Route::put('document-management/permissions/{permission}', [\App\Http\Controllers\DocumentPermissionController::class, 'update'])->middleware('permission:edit-document-permissions')->name('document-management.permissions.update');
            Route::delete('document-management/permissions/{permission}', [\App\Http\Controllers\DocumentPermissionController::class, 'destroy'])->middleware('permission:delete-document-permissions')->name('document-management.permissions.destroy');
        });



        // Research Project routes
        Route::middleware('permission:manage-research-projects')->group(function () {
            Route::get('legal-research/projects', [\App\Http\Controllers\ResearchProjectController::class, 'index'])->name('legal-research.projects.index');
            Route::get('legal-research/projects/{project}', [\App\Http\Controllers\ResearchProjectController::class, 'show'])->middleware('permission:view-research-projects')->name('legal-research.projects.show');
            Route::post('legal-research/projects', [\App\Http\Controllers\ResearchProjectController::class, 'store'])->middleware('permission:create-research-projects')->name('legal-research.projects.store');
            Route::put('legal-research/projects/{project}', [\App\Http\Controllers\ResearchProjectController::class, 'update'])->middleware('permission:edit-research-projects')->name('legal-research.projects.update');
            Route::delete('legal-research/projects/{project}', [\App\Http\Controllers\ResearchProjectController::class, 'destroy'])->middleware('permission:delete-research-projects')->name('legal-research.projects.destroy');
            Route::put('legal-research/projects/{project}/toggle-status', [\App\Http\Controllers\ResearchProjectController::class, 'toggleStatus'])->middleware('permission:edit-research-projects')->name('legal-research.projects.toggle-status');
        });

        // Research Source routes
        Route::middleware('permission:manage-research-sources')->group(function () {
            Route::get('legal-research/sources', [\App\Http\Controllers\ResearchSourceController::class, 'index'])->name('legal-research.sources.index');
            Route::post('legal-research/sources', [\App\Http\Controllers\ResearchSourceController::class, 'store'])->middleware('permission:create-research-sources')->name('legal-research.sources.store');
            Route::put('legal-research/sources/{source}', [\App\Http\Controllers\ResearchSourceController::class, 'update'])->middleware('permission:edit-research-sources')->name('legal-research.sources.update');
            Route::delete('legal-research/sources/{source}', [\App\Http\Controllers\ResearchSourceController::class, 'destroy'])->middleware('permission:delete-research-sources')->name('legal-research.sources.destroy');
            Route::put('legal-research/sources/{source}/toggle-status', [\App\Http\Controllers\ResearchSourceController::class, 'toggleStatus'])->middleware('permission:edit-research-sources')->name('legal-research.sources.toggle-status');
        });

        // Research Category routes
        Route::middleware('permission:manage-research-categories')->group(function () {
            Route::get('legal-research/categories', [\App\Http\Controllers\ResearchCategoryController::class, 'index'])->name('legal-research.categories.index');
            Route::post('legal-research/categories', [\App\Http\Controllers\ResearchCategoryController::class, 'store'])->middleware('permission:create-research-categories')->name('legal-research.categories.store');
            Route::put('legal-research/categories/{category}', [\App\Http\Controllers\ResearchCategoryController::class, 'update'])->middleware('permission:edit-research-categories')->name('legal-research.categories.update');
            Route::delete('legal-research/categories/{category}', [\App\Http\Controllers\ResearchCategoryController::class, 'destroy'])->middleware('permission:delete-research-categories')->name('legal-research.categories.destroy');
            Route::put('legal-research/categories/{category}/toggle-status', [\App\Http\Controllers\ResearchCategoryController::class, 'toggleStatus'])->middleware('permission:edit-research-categories')->name('legal-research.categories.toggle-status');
        });

        // Knowledge Article routes
        Route::middleware('permission:manage-knowledge-articles')->group(function () {
            Route::get('legal-research/knowledge', [\App\Http\Controllers\KnowledgeArticleController::class, 'index'])->name('legal-research.knowledge.index');
            Route::post('legal-research/knowledge', [\App\Http\Controllers\KnowledgeArticleController::class, 'store'])->middleware('permission:create-knowledge-articles')->name('legal-research.knowledge.store');
            Route::put('legal-research/knowledge/{article}', [\App\Http\Controllers\KnowledgeArticleController::class, 'update'])->middleware('permission:edit-knowledge-articles')->name('legal-research.knowledge.update');
            Route::delete('legal-research/knowledge/{article}', [\App\Http\Controllers\KnowledgeArticleController::class, 'destroy'])->middleware('permission:delete-knowledge-articles')->name('legal-research.knowledge.destroy');
            Route::put('legal-research/knowledge/{article}/publish', [\App\Http\Controllers\KnowledgeArticleController::class, 'publish'])->middleware('permission:publish-knowledge-articles')->name('legal-research.knowledge.publish');
        });

        // Legal Precedent routes
        Route::middleware('permission:manage-legal-precedents')->group(function () {
            Route::get('legal-research/precedents', [\App\Http\Controllers\LegalPrecedentController::class, 'index'])->name('legal-research.precedents.index');
            Route::post('legal-research/precedents', [\App\Http\Controllers\LegalPrecedentController::class, 'store'])->middleware('permission:create-legal-precedents')->name('legal-research.precedents.store');
            Route::put('legal-research/precedents/{precedent}', [\App\Http\Controllers\LegalPrecedentController::class, 'update'])->middleware('permission:edit-legal-precedents')->name('legal-research.precedents.update');
            Route::delete('legal-research/precedents/{precedent}', [\App\Http\Controllers\LegalPrecedentController::class, 'destroy'])->middleware('permission:delete-legal-precedents')->name('legal-research.precedents.destroy');
            Route::put('legal-research/precedents/{precedent}/toggle-status', [\App\Http\Controllers\LegalPrecedentController::class, 'toggleStatus'])->middleware('permission:edit-legal-precedents')->name('legal-research.precedents.toggle-status');
        });

        // Research Note routes
        Route::middleware('permission:manage-research-notes')->group(function () {
            Route::get('legal-research/notes', [\App\Http\Controllers\ResearchNoteController::class, 'index'])->name('legal-research.notes.index');
            Route::post('legal-research/notes', [\App\Http\Controllers\ResearchNoteController::class, 'store'])->middleware('permission:create-research-notes')->name('legal-research.notes.store');
            Route::put('legal-research/notes/{note}', [\App\Http\Controllers\ResearchNoteController::class, 'update'])->middleware('permission:edit-research-notes')->name('legal-research.notes.update');
            Route::delete('legal-research/notes/{note}', [\App\Http\Controllers\ResearchNoteController::class, 'destroy'])->middleware('permission:delete-research-notes')->name('legal-research.notes.destroy');
        });

        // Research Citation routes
        Route::middleware('permission:manage-research-citations')->group(function () {
            Route::get('legal-research/citations', [\App\Http\Controllers\ResearchCitationController::class, 'index'])->name('legal-research.citations.index');
            Route::post('legal-research/citations', [\App\Http\Controllers\ResearchCitationController::class, 'store'])->middleware('permission:create-research-citations')->name('legal-research.citations.store');
            Route::put('legal-research/citations/{citation}', [\App\Http\Controllers\ResearchCitationController::class, 'update'])->middleware('permission:edit-research-citations')->name('legal-research.citations.update');
            Route::delete('legal-research/citations/{citation}', [\App\Http\Controllers\ResearchCitationController::class, 'destroy'])->middleware('permission:delete-research-citations')->name('legal-research.citations.destroy');
        });

        // Research Type routes
        Route::middleware('permission:manage-research-types')->group(function () {
            Route::get('legal-research/research-types', [\App\Http\Controllers\ResearchTypeController::class, 'index'])->name('legal-research.research-types.index');
            Route::post('legal-research/research-types', [\App\Http\Controllers\ResearchTypeController::class, 'store'])->middleware('permission:create-research-types')->name('legal-research.research-types.store');
            Route::put('legal-research/research-types/{researchType}', [\App\Http\Controllers\ResearchTypeController::class, 'update'])->middleware('permission:edit-research-types')->name('legal-research.research-types.update');
            Route::delete('legal-research/research-types/{researchType}', [\App\Http\Controllers\ResearchTypeController::class, 'destroy'])->middleware('permission:delete-research-types')->name('legal-research.research-types.destroy');
            Route::put('legal-research/research-types/{researchType}/toggle-status', [\App\Http\Controllers\ResearchTypeController::class, 'toggleStatus'])->middleware('permission:edit-research-types')->name('legal-research.research-types.toggle-status');
        });

        // Event Type routes
        Route::middleware('permission:manage-event-types')->group(function () {
            Route::get('advocate/event-types', [\App\Http\Controllers\EventTypeController::class, 'index'])->name('advocate.event-types.index');
            Route::post('advocate/event-types', [\App\Http\Controllers\EventTypeController::class, 'store'])->middleware('permission:create-event-types')->name('advocate.event-types.store');
            Route::put('advocate/event-types/{eventType}', [\App\Http\Controllers\EventTypeController::class, 'update'])->middleware('permission:edit-event-types')->name('advocate.event-types.update');
            Route::delete('advocate/event-types/{eventType}', [\App\Http\Controllers\EventTypeController::class, 'destroy'])->middleware('permission:delete-event-types')->name('advocate.event-types.destroy');
            Route::put('advocate/event-types/{eventType}/toggle-status', [\App\Http\Controllers\EventTypeController::class, 'toggleStatus'])->middleware('permission:edit-event-types')->name('advocate.event-types.toggle-status');
        });

        // Court Type routes
        Route::middleware('permission:manage-court-types')->group(function () {
            Route::get('advocate/court-types', [\App\Http\Controllers\CourtTypeController::class, 'index'])->name('advocate.court-types.index');
            Route::post('advocate/court-types', [\App\Http\Controllers\CourtTypeController::class, 'store'])->middleware('permission:create-court-types')->name('advocate.court-types.store');
            Route::put('advocate/court-types/{courtType}', [\App\Http\Controllers\CourtTypeController::class, 'update'])->middleware('permission:edit-court-types')->name('advocate.court-types.update');
            Route::delete('advocate/court-types/{courtType}', [\App\Http\Controllers\CourtTypeController::class, 'destroy'])->middleware('permission:delete-court-types')->name('advocate.court-types.destroy');
            Route::put('advocate/court-types/{courtType}/toggle-status', [\App\Http\Controllers\CourtTypeController::class, 'toggleStatus'])->middleware('permission:edit-court-types')->name('advocate.court-types.toggle-status');
        });

        // Hearing routes
        Route::middleware('permission:manage-hearings')->group(function () {
            Route::get('hearings', [\App\Http\Controllers\HearingController::class, 'index'])->name('hearings.index');
            Route::post('hearings', [\App\Http\Controllers\HearingController::class, 'store'])->middleware('permission:create-hearings')->name('hearings.store');
            Route::put('hearings/{hearing}', [\App\Http\Controllers\HearingController::class, 'update'])->middleware('permission:edit-hearings')->name('hearings.update');
            Route::delete('hearings/{hearing}', [\App\Http\Controllers\HearingController::class, 'destroy'])->middleware('permission:delete-hearings')->name('hearings.destroy');
            Route::get('api/hearings/court-judges/{court}', [\App\Http\Controllers\HearingController::class, 'getCourtJudges'])->name('api.hearings.court-judges');
        });

        // Calendar route
        Route::get('calendar', [\App\Http\Controllers\CalendarController::class, 'index'])->name('calendar.index');

        // Court Management routes
        Route::middleware('permission:manage-courts')->group(function () {
            Route::get('courts', [\App\Http\Controllers\CourtController::class, 'index'])->name('courts.index');
            Route::get('courts/{court}', [\App\Http\Controllers\CourtController::class, 'show'])->middleware('permission:view-courts')->name('courts.show');
            Route::post('courts', [\App\Http\Controllers\CourtController::class, 'store'])->middleware('permission:create-courts')->name('courts.store');
            Route::put('courts/{court}', [\App\Http\Controllers\CourtController::class, 'update'])->middleware('permission:edit-courts')->name('courts.update');
            Route::delete('courts/{court}', [\App\Http\Controllers\CourtController::class, 'destroy'])->middleware('permission:delete-courts')->name('courts.destroy');
            Route::put('courts/{court}/toggle-status', [\App\Http\Controllers\CourtController::class, 'toggleStatus'])->middleware('permission:edit-courts')->name('courts.toggle-status');
        });

        // Judge Management routes
        Route::middleware('permission:manage-judges')->group(function () {
            Route::get('judges', [\App\Http\Controllers\JudgeController::class, 'index'])->name('judges.index');
            Route::get('judges/{judge}', [\App\Http\Controllers\JudgeController::class, 'show'])->middleware('permission:view-judges')->name('judges.show');
            Route::post('judges', [\App\Http\Controllers\JudgeController::class, 'store'])->middleware('permission:create-judges')->name('judges.store');
            Route::put('judges/{judge}', [\App\Http\Controllers\JudgeController::class, 'update'])->middleware('permission:edit-judges')->name('judges.update');
            Route::delete('judges/{judge}', [\App\Http\Controllers\JudgeController::class, 'destroy'])->middleware('permission:delete-judges')->name('judges.destroy');
            Route::put('judges/{judge}/toggle-status', [\App\Http\Controllers\JudgeController::class, 'toggleStatus'])->middleware('permission:edit-judges')->name('judges.toggle-status');
        });

        // Hearing Type Management routes
        Route::middleware('permission:manage-hearing-types')->group(function () {
            Route::get('hearing-types', [\App\Http\Controllers\HearingTypeController::class, 'index'])->name('hearing-types.index');
            Route::get('hearing-types/{hearingType}', [\App\Http\Controllers\HearingTypeController::class, 'show'])->middleware('permission:view-hearing-types')->name('hearing-types.show');
            Route::post('hearing-types', [\App\Http\Controllers\HearingTypeController::class, 'store'])->middleware('permission:create-hearing-types')->name('hearing-types.store');
            Route::put('hearing-types/{hearingType}', [\App\Http\Controllers\HearingTypeController::class, 'update'])->middleware('permission:edit-hearing-types')->name('hearing-types.update');
            Route::delete('hearing-types/{hearingType}', [\App\Http\Controllers\HearingTypeController::class, 'destroy'])->middleware('permission:delete-hearing-types')->name('hearing-types.destroy');
            Route::put('hearing-types/{hearingType}/toggle-status', [\App\Http\Controllers\HearingTypeController::class, 'toggleStatus'])->middleware('permission:edit-hearing-types')->name('hearing-types.toggle-status');
        });

        // Company Settings in Settings page routes
        Route::middleware('permission:manage-company-settings')->group(function () {
            Route::post('settings/company', [\App\Http\Controllers\Settings\SettingsController::class, 'storeCompanySetting'])->name('settings.company.store');
            Route::put('settings/company/{id}', [\App\Http\Controllers\Settings\SettingsController::class, 'updateCompanySetting'])->name('settings.company.update');
            Route::delete('settings/company/{id}', [\App\Http\Controllers\Settings\SettingsController::class, 'destroyCompanySetting'])->name('settings.company.destroy');
        });

        // Case Management routes
        Route::middleware('permission:manage-cases')->group(function () {
            Route::get('cases', [\App\Http\Controllers\CaseController::class, 'index'])->name('cases.index');
            Route::get('cases/{case}', [\App\Http\Controllers\CaseController::class, 'show'])->middleware('permission:view-cases')->name('cases.show');
            Route::post('cases', [\App\Http\Controllers\CaseController::class, 'store'])->middleware('permission:create-cases')->name('cases.store');
            Route::put('cases/{case}', [\App\Http\Controllers\CaseController::class, 'update'])->middleware('permission:edit-cases')->name('cases.update');
            Route::delete('cases/{case}', [\App\Http\Controllers\CaseController::class, 'destroy'])->middleware('permission:delete-cases')->name('cases.destroy');
            Route::put('cases/{case}/toggle-status', [\App\Http\Controllers\CaseController::class, 'toggleStatus'])->middleware('permission:edit-cases')->name('cases.toggle-status');
        });

        // Case Types routes
        Route::middleware('permission:manage-case-types')->group(function () {
            Route::get('case/case-types', [\App\Http\Controllers\CaseTypeController::class, 'index'])->name('cases.case-types.index');
            Route::post('case/case-types', [\App\Http\Controllers\CaseTypeController::class, 'store'])->middleware('permission:create-case-types')->name('cases.case-types.store');
            Route::put('case/case-types/{caseType}', [\App\Http\Controllers\CaseTypeController::class, 'update'])->middleware('permission:edit-case-types')->name('cases.case-types.update');
            Route::delete('case/case-types/{caseType}', [\App\Http\Controllers\CaseTypeController::class, 'destroy'])->middleware('permission:delete-case-types')->name('cases.case-types.destroy');
            Route::put('case/case-types/{caseType}/toggle-status', [\App\Http\Controllers\CaseTypeController::class, 'toggleStatus'])->middleware('permission:edit-case-types')->name('cases.case-types.toggle-status');
        });

        // Case Statuses routes
        Route::middleware('permission:manage-case-statuses')->group(function () {
            Route::get('case/case-statuses', [\App\Http\Controllers\CaseStatusController::class, 'index'])->name('cases.case-statuses.index');
            Route::post('case/case-statuses', [\App\Http\Controllers\CaseStatusController::class, 'store'])->middleware('permission:create-case-statuses')->name('cases.case-statuses.store');
            Route::put('case/case-statuses/{caseStatus}', [\App\Http\Controllers\CaseStatusController::class, 'update'])->middleware('permission:edit-case-statuses')->name('cases.case-statuses.update');
            Route::delete('case/case-statuses/{caseStatus}', [\App\Http\Controllers\CaseStatusController::class, 'destroy'])->middleware('permission:delete-case-statuses')->name('cases.case-statuses.destroy');
            Route::put('case/case-statuses/{caseStatus}/toggle-status', [\App\Http\Controllers\CaseStatusController::class, 'toggleStatus'])->middleware('permission:edit-case-statuses')->name('cases.case-statuses.toggle-status');
        });

        // Case Timelines routes
        Route::middleware('permission:manage-case-timelines')->group(function () {
            Route::get('cases/case-timelines', [\App\Http\Controllers\CaseTimelineController::class, 'index'])->name('cases.case-timelines.index');
            Route::post('cases/case-timelines', [\App\Http\Controllers\CaseTimelineController::class, 'store'])->middleware('permission:create-case-timelines')->name('cases.case-timelines.store');
            Route::put('cases/case-timelines/{timeline}', [\App\Http\Controllers\CaseTimelineController::class, 'update'])->middleware('permission:edit-case-timelines')->name('cases.case-timelines.update');
            Route::delete('cases/case-timelines/{timeline}', [\App\Http\Controllers\CaseTimelineController::class, 'destroy'])->middleware('permission:delete-case-timelines')->name('cases.case-timelines.destroy');
            Route::put('cases/case-timelines/{timeline}/toggle-status', [\App\Http\Controllers\CaseTimelineController::class, 'toggleStatus'])->middleware('permission:edit-case-timelines')->name('cases.case-timelines.toggle-status');
        });

        // Case Team Members routes
        Route::middleware('permission:manage-case-team-members')->group(function () {
            Route::get('cases/case-team-members', [\App\Http\Controllers\CaseTeamMemberController::class, 'index'])->name('cases.case-team-members.index');
            Route::post('cases/case-team-members', [\App\Http\Controllers\CaseTeamMemberController::class, 'store'])->middleware('permission:create-case-team-members')->name('cases.case-team-members.store');
            Route::put('cases/case-team-members/{teamMember}', [\App\Http\Controllers\CaseTeamMemberController::class, 'update'])->middleware('permission:edit-case-team-members')->name('cases.case-team-members.update');
            Route::delete('cases/case-team-members/{teamMember}', [\App\Http\Controllers\CaseTeamMemberController::class, 'destroy'])->middleware('permission:delete-case-team-members')->name('cases.case-team-members.destroy');
            Route::put('cases/case-team-members/{teamMember}/toggle-status', [\App\Http\Controllers\CaseTeamMemberController::class, 'toggleStatus'])->middleware('permission:edit-case-team-members')->name('cases.case-team-members.toggle-status');
        });

        // Plans management routes (admin only)
        Route::middleware('permission:manage-plans')->group(function () {
            Route::get('plans/create', [PlanController::class, 'create'])->middleware('permission:create-plans')->name('plans.create');
            Route::post('plans', [PlanController::class, 'store'])->middleware('permission:create-plans')->name('plans.store');
            Route::get('plans/{plan}/edit', [PlanController::class, 'edit'])->middleware('permission:edit-plans')->name('plans.edit');
            Route::put('plans/{plan}', [PlanController::class, 'update'])->middleware('permission:edit-plans')->name('plans.update');
            Route::delete('plans/{plan}', [PlanController::class, 'destroy'])->middleware('permission:delete-plans')->name('plans.destroy');
            Route::post('plans/{plan}/toggle-status', [PlanController::class, 'toggleStatus'])->name('plans.toggle-status');
        });

        // Plan Orders routes
        Route::middleware('permission:manage-plan-orders')->group(function () {
            Route::get('plan-orders', [PlanOrderController::class, 'index'])->middleware('permission:manage-plan-orders')->name('plan-orders.index');
            Route::post('plan-orders/{planOrder}/approve', [PlanOrderController::class, 'approve'])->middleware('permission:approve-plan-orders')->name('plan-orders.approve');
            Route::post('plan-orders/{planOrder}/reject', [PlanOrderController::class, 'reject'])->middleware('permission:reject-plan-orders')->name('plan-orders.reject');
        });

        // Plan Requests routes (placeholder)
        Route::get('plan-requests', function () {
            return Inertia::render('plans/plan-requests');
        })->name('plan-requests.index');

        // Companies routes
        Route::middleware('permission:manage-companies')->group(function () {
            Route::get('companies', [CompanyController::class, 'index'])->middleware('permission:manage-companies')->name('companies.index');
            Route::post('companies', [CompanyController::class, 'store'])->middleware('permission:create-companies')->name('companies.store');
            Route::put('companies/{company}', [CompanyController::class, 'update'])->middleware('permission:edit-companies')->name('companies.update');
            Route::delete('companies/{company}', [CompanyController::class, 'destroy'])->middleware('permission:delete-companies')->name('companies.destroy');
            Route::put('companies/{company}/reset-password', [CompanyController::class, 'resetPassword'])->middleware('permission:reset-password-companies')->name('companies.reset-password');
            Route::put('companies/{company}/toggle-status', [CompanyController::class, 'toggleStatus'])->middleware('permission:toggle-status-companies')->name('companies.toggle-status');
            Route::get('companies/{company}/plans', [CompanyController::class, 'getPlans'])->middleware('permission:manage-plans-companies')->name('companies.plans');
            Route::put('companies/{company}/upgrade-plan', [CompanyController::class, 'upgradePlan'])->middleware('permission:upgrade-plan-companies')->name('companies.upgrade-plan');
        });


        // Coupons routes
        Route::middleware('permission:manage-coupons')->group(function () {
            Route::get('coupons', [CouponController::class, 'index'])->middleware('permission:manage-coupons')->name('coupons.index');
            Route::get('coupons/{coupon}', [CouponController::class, 'show'])->middleware('permission:view-coupons')->name('coupons.show');
            Route::post('coupons', [CouponController::class, 'store'])->middleware('permission:create-coupons')->name('coupons.store');
            Route::put('coupons/{coupon}', [CouponController::class, 'update'])->middleware('permission:edit-coupons')->name('coupons.update');
            Route::put('coupons/{coupon}/toggle-status', [CouponController::class, 'toggleStatus'])->middleware('permission:toggle-status-coupons')->name('coupons.toggle-status');
            Route::delete('coupons/{coupon}', [CouponController::class, 'destroy'])->middleware('permission:delete-coupons')->name('coupons.destroy');
        });

        // Plan Requests routes
        Route::middleware('permission:manage-plan-requests')->group(function () {
            Route::get('plan-requests', [PlanRequestController::class, 'index'])->middleware('permission:manage-plan-requests')->name('plan-requests.index');
            Route::post('plan-requests/{planRequest}/approve', [PlanRequestController::class, 'approve'])->middleware('permission:approve-plan-requests')->name('plan-requests.approve');
            Route::post('plan-requests/{planRequest}/reject', [PlanRequestController::class, 'reject'])->middleware('permission:reject-plan-requests')->name('plan-requests.reject');
        });
        
        // Plan request cancel route (accessible to all authenticated users)
        Route::post('plan-requests/{planRequest}/cancel', [PlanRequestController::class, 'cancel'])->name('plan-requests.cancel');



        // Referral routes
        Route::middleware('permission:manage-referral')->group(function () {
            Route::get('referral', [ReferralController::class, 'index'])->middleware('permission:manage-referral')->name('referral.index');
            Route::get('referral/referred-users', [ReferralController::class, 'getReferredUsers'])->middleware('permission:manage-users-referral')->name('referral.referred-users');
            Route::post('referral/settings', [ReferralController::class, 'updateSettings'])->middleware('permission:manage-setting-referral')->name('referral.settings.update');
            Route::post('referral/payout-request', [ReferralController::class, 'createPayoutRequest'])->middleware('permission:manage-payout-referral')->name('referral.payout-request.create');
            Route::post('referral/payout-request/{payoutRequest}/approve', [ReferralController::class, 'approvePayoutRequest'])->middleware('permission:approve-payout-referral')->name('referral.payout-request.approve');
            Route::post('referral/payout-request/{payoutRequest}/reject', [ReferralController::class, 'rejectPayoutRequest'])->middleware('permission:reject-payout-referral')->name('referral.payout-request.reject');
        });

        // Contact Us routes
        Route::middleware('permission:manage-contact-us')->group(function () {
            Route::get('contact-us', [\App\Http\Controllers\ContactUsController::class, 'index'])->name('contact-us.index');
        });

        // Newsletter routes
        Route::middleware('permission:manage-contact-us')->group(function () {
            Route::get('newsletter', [\App\Http\Controllers\NewsletterController::class, 'index'])->name('newsletter.index');
            Route::post('newsletter/send', [\App\Http\Controllers\NewsletterController::class, 'send'])->name('newsletter.send');
        });



        // Currencies routes
        Route::middleware('permission:manage-currencies')->group(function () {
            Route::get('currencies', [CurrencyController::class, 'index'])->middleware('permission:manage-currencies')->name('currencies.index');
            Route::post('currencies', [CurrencyController::class, 'store'])->middleware('permission:create-currencies')->name('currencies.store');
            Route::put('currencies/{currency}', [CurrencyController::class, 'update'])->middleware('permission:edit-currencies')->name('currencies.update');
            Route::delete('currencies/{currency}', [CurrencyController::class, 'destroy'])->middleware('permission:delete-currencies')->name('currencies.destroy');
        });

        // ChatGPT routes
        Route::post('api/chatgpt/generate', [\App\Http\Controllers\ChatGptController::class, 'generate'])->name('chatgpt.generate');

        // Compliance Requirements routes
        Route::middleware('permission:manage-compliance-requirements')->group(function () {
            Route::get('compliance/requirements', [\App\Http\Controllers\ComplianceRequirementController::class, 'index'])->name('compliance.requirements.index');
            Route::post('compliance/requirements', [\App\Http\Controllers\ComplianceRequirementController::class, 'store'])->middleware('permission:create-compliance-requirements')->name('compliance.requirements.store');
            Route::put('compliance/requirements/{requirement}', [\App\Http\Controllers\ComplianceRequirementController::class, 'update'])->middleware('permission:edit-compliance-requirements')->name('compliance.requirements.update');
            Route::delete('compliance/requirements/{requirement}', [\App\Http\Controllers\ComplianceRequirementController::class, 'destroy'])->middleware('permission:delete-compliance-requirements')->name('compliance.requirements.destroy');
            Route::put('compliance/requirements/{requirement}/toggle-status', [\App\Http\Controllers\ComplianceRequirementController::class, 'toggleStatus'])->middleware('permission:toggle-status-compliance-requirements')->name('compliance.requirements.toggle-status');
        });

        // Compliance Categories routes
        Route::middleware('permission:manage-compliance-categories')->group(function () {
            Route::get('compliance/categories', [\App\Http\Controllers\ComplianceCategoryController::class, 'index'])->name('compliance.categories.index');
            Route::post('compliance/categories', [\App\Http\Controllers\ComplianceCategoryController::class, 'store'])->middleware('permission:create-compliance-categories')->name('compliance.categories.store');
            Route::put('compliance/categories/{category}', [\App\Http\Controllers\ComplianceCategoryController::class, 'update'])->middleware('permission:edit-compliance-categories')->name('compliance.categories.update');
            Route::delete('compliance/categories/{category}', [\App\Http\Controllers\ComplianceCategoryController::class, 'destroy'])->middleware('permission:delete-compliance-categories')->name('compliance.categories.destroy');
            Route::put('compliance/categories/{category}/toggle-status', [\App\Http\Controllers\ComplianceCategoryController::class, 'toggleStatus'])->middleware('permission:toggle-status-compliance-categories')->name('compliance.categories.toggle-status');
        });

        // Compliance Frequencies routes
        Route::middleware('permission:manage-compliance-frequencies')->group(function () {
            Route::get('compliance/frequencies', [\App\Http\Controllers\ComplianceFrequencyController::class, 'index'])->name('compliance.frequencies.index');
            Route::post('compliance/frequencies', [\App\Http\Controllers\ComplianceFrequencyController::class, 'store'])->middleware('permission:create-compliance-frequencies')->name('compliance.frequencies.store');
            Route::put('compliance/frequencies/{frequency}', [\App\Http\Controllers\ComplianceFrequencyController::class, 'update'])->middleware('permission:edit-compliance-frequencies')->name('compliance.frequencies.update');
            Route::delete('compliance/frequencies/{frequency}', [\App\Http\Controllers\ComplianceFrequencyController::class, 'destroy'])->middleware('permission:delete-compliance-frequencies')->name('compliance.frequencies.destroy');
            Route::put('compliance/frequencies/{frequency}/toggle-status', [\App\Http\Controllers\ComplianceFrequencyController::class, 'toggleStatus'])->middleware('permission:toggle-status-compliance-frequencies')->name('compliance.frequencies.toggle-status');
        });

        // Professional Licenses routes
        Route::middleware('permission:manage-professional-licenses')->group(function () {
            Route::get('compliance/professional-licenses', [\App\Http\Controllers\ProfessionalLicenseController::class, 'index'])->name('compliance.professional-licenses.index');
            Route::post('compliance/professional-licenses', [\App\Http\Controllers\ProfessionalLicenseController::class, 'store'])->middleware('permission:create-professional-licenses')->name('compliance.professional-licenses.store');
            Route::put('compliance/professional-licenses/{license}', [\App\Http\Controllers\ProfessionalLicenseController::class, 'update'])->middleware('permission:edit-professional-licenses')->name('compliance.professional-licenses.update');
            Route::delete('compliance/professional-licenses/{license}', [\App\Http\Controllers\ProfessionalLicenseController::class, 'destroy'])->middleware('permission:delete-professional-licenses')->name('compliance.professional-licenses.destroy');
            Route::put('compliance/professional-licenses/{license}/toggle-status', [\App\Http\Controllers\ProfessionalLicenseController::class, 'toggleStatus'])->middleware('permission:toggle-status-professional-licenses')->name('compliance.professional-licenses.toggle-status');
        });

        // Regulatory Bodies routes
        Route::middleware('permission:manage-regulatory-bodies')->group(function () {
            Route::get('compliance/regulatory-bodies', [\App\Http\Controllers\RegulatoryBodyController::class, 'index'])->name('compliance.regulatory-bodies.index');
            Route::post('compliance/regulatory-bodies', [\App\Http\Controllers\RegulatoryBodyController::class, 'store'])->middleware('permission:create-regulatory-bodies')->name('compliance.regulatory-bodies.store');
            Route::put('compliance/regulatory-bodies/{body}', [\App\Http\Controllers\RegulatoryBodyController::class, 'update'])->middleware('permission:edit-regulatory-bodies')->name('compliance.regulatory-bodies.update');
            Route::delete('compliance/regulatory-bodies/{body}', [\App\Http\Controllers\RegulatoryBodyController::class, 'destroy'])->middleware('permission:delete-regulatory-bodies')->name('compliance.regulatory-bodies.destroy');
            Route::put('compliance/regulatory-bodies/{body}/toggle-status', [\App\Http\Controllers\RegulatoryBodyController::class, 'toggleStatus'])->middleware('permission:toggle-status-regulatory-bodies')->name('compliance.regulatory-bodies.toggle-status');
        });

        // CLE Tracking routes
        Route::middleware('permission:manage-cle-tracking')->group(function () {
            Route::get('compliance/cle-tracking', [\App\Http\Controllers\CleTrackingController::class, 'index'])->name('compliance.cle-tracking.index');
            Route::post('compliance/cle-tracking', [\App\Http\Controllers\CleTrackingController::class, 'store'])->middleware('permission:create-cle-tracking')->name('compliance.cle-tracking.store');
            Route::put('compliance/cle-tracking/{cleTracking}', [\App\Http\Controllers\CleTrackingController::class, 'update'])->middleware('permission:edit-cle-tracking')->name('compliance.cle-tracking.update');
            Route::delete('compliance/cle-tracking/{cleTracking}', [\App\Http\Controllers\CleTrackingController::class, 'destroy'])->middleware('permission:delete-cle-tracking')->name('compliance.cle-tracking.destroy');
            Route::get('compliance/cle-tracking/{cleTracking}/download', [\App\Http\Controllers\CleTrackingController::class, 'download'])->middleware('permission:download-cle-tracking')->name('compliance.cle-tracking.download');
        });

        // Compliance Policies routes
        Route::middleware('permission:manage-compliance-policies')->group(function () {
            Route::get('compliance/policies', [\App\Http\Controllers\CompliancePolicyController::class, 'index'])->name('compliance.policies.index');
            Route::get('compliance/policies/create', [\App\Http\Controllers\CompliancePolicyController::class, 'create'])->middleware('permission:create-compliance-policies')->name('compliance.policies.create');
            Route::post('compliance/policies', [\App\Http\Controllers\CompliancePolicyController::class, 'store'])->middleware('permission:create-compliance-policies')->name('compliance.policies.store');
            Route::get('compliance/policies/{policy}', [\App\Http\Controllers\CompliancePolicyController::class, 'show'])->middleware('permission:view-compliance-policies')->name('compliance.policies.show');
            Route::get('compliance/policies/{policy}/edit', [\App\Http\Controllers\CompliancePolicyController::class, 'edit'])->middleware('permission:edit-compliance-policies')->name('compliance.policies.edit');
            Route::put('compliance/policies/{policy}', [\App\Http\Controllers\CompliancePolicyController::class, 'update'])->middleware('permission:edit-compliance-policies')->name('compliance.policies.update');
            Route::delete('compliance/policies/{policy}', [\App\Http\Controllers\CompliancePolicyController::class, 'destroy'])->middleware('permission:delete-compliance-policies')->name('compliance.policies.destroy');
            Route::put('compliance/policies/{policy}/toggle-status', [\App\Http\Controllers\CompliancePolicyController::class, 'toggleStatus'])->middleware('permission:toggle-status-compliance-policies')->name('compliance.policies.toggle-status');
        });

        // Risk Categories routes
        Route::middleware('permission:manage-risk-categories')->group(function () {
            Route::get('compliance/risk-categories', [\App\Http\Controllers\RiskCategoryController::class, 'index'])->name('compliance.risk-categories.index');
            Route::post('compliance/risk-categories', [\App\Http\Controllers\RiskCategoryController::class, 'store'])->middleware('permission:create-risk-categories')->name('compliance.risk-categories.store');
            Route::put('compliance/risk-categories/{category}', [\App\Http\Controllers\RiskCategoryController::class, 'update'])->middleware('permission:edit-risk-categories')->name('compliance.risk-categories.update');
            Route::delete('compliance/risk-categories/{category}', [\App\Http\Controllers\RiskCategoryController::class, 'destroy'])->middleware('permission:delete-risk-categories')->name('compliance.risk-categories.destroy');
            Route::put('compliance/risk-categories/{category}/toggle-status', [\App\Http\Controllers\RiskCategoryController::class, 'toggleStatus'])->middleware('permission:toggle-status-risk-categories')->name('compliance.risk-categories.toggle-status');
        });

        // Risk Assessments routes
        Route::middleware('permission:manage-risk-assessments')->group(function () {
            Route::get('compliance/risk-assessments', [\App\Http\Controllers\RiskAssessmentController::class, 'index'])->name('compliance.risk-assessments.index');
            Route::post('compliance/risk-assessments', [\App\Http\Controllers\RiskAssessmentController::class, 'store'])->middleware('permission:create-risk-assessments')->name('compliance.risk-assessments.store');
            Route::put('compliance/risk-assessments/{riskAssessment}', [\App\Http\Controllers\RiskAssessmentController::class, 'update'])->middleware('permission:edit-risk-assessments')->name('compliance.risk-assessments.update');
            Route::delete('compliance/risk-assessments/{riskAssessment}', [\App\Http\Controllers\RiskAssessmentController::class, 'destroy'])->middleware('permission:delete-risk-assessments')->name('compliance.risk-assessments.destroy');
        });

        // Audit Types routes
        Route::middleware('permission:manage-audit-types')->group(function () {
            Route::get('compliance/audit-types', [\App\Http\Controllers\AuditTypeController::class, 'index'])->name('compliance.audit-types.index');
            Route::post('compliance/audit-types', [\App\Http\Controllers\AuditTypeController::class, 'store'])->middleware('permission:create-audit-types')->name('compliance.audit-types.store');
            Route::put('compliance/audit-types/{auditType}', [\App\Http\Controllers\AuditTypeController::class, 'update'])->middleware('permission:edit-audit-types')->name('compliance.audit-types.update');
            Route::delete('compliance/audit-types/{auditType}', [\App\Http\Controllers\AuditTypeController::class, 'destroy'])->middleware('permission:delete-audit-types')->name('compliance.audit-types.destroy');
            Route::put('compliance/audit-types/{auditType}/toggle-status', [\App\Http\Controllers\AuditTypeController::class, 'toggleStatus'])->middleware('permission:toggle-status-audit-types')->name('compliance.audit-types.toggle-status');
        });

        // Compliance Audits routes
        Route::middleware('permission:manage-compliance-audits')->group(function () {
            Route::get('compliance/audits', [\App\Http\Controllers\ComplianceAuditController::class, 'index'])->name('compliance.audits.index');
            Route::post('compliance/audits', [\App\Http\Controllers\ComplianceAuditController::class, 'store'])->middleware('permission:create-compliance-audits')->name('compliance.audits.store');
            Route::put('compliance/audits/{audit}', [\App\Http\Controllers\ComplianceAuditController::class, 'update'])->middleware('permission:edit-compliance-audits')->name('compliance.audits.update');
            Route::delete('compliance/audits/{audit}', [\App\Http\Controllers\ComplianceAuditController::class, 'destroy'])->middleware('permission:delete-compliance-audits')->name('compliance.audits.destroy');
        });

        // Time Entry routes
        Route::middleware('permission:manage-time-entries')->group(function () {
            Route::get('billing/time-entries', [\App\Http\Controllers\TimeEntryController::class, 'index'])->name('billing.time-entries.index');
            Route::post('billing/time-entries', [\App\Http\Controllers\TimeEntryController::class, 'store'])->middleware('permission:create-time-entries')->name('billing.time-entries.store');
            Route::put('billing/time-entries/{timeEntry}', [\App\Http\Controllers\TimeEntryController::class, 'update'])->middleware('permission:edit-time-entries')->name('billing.time-entries.update');
            Route::delete('billing/time-entries/{timeEntry}', [\App\Http\Controllers\TimeEntryController::class, 'destroy'])->middleware('permission:delete-time-entries')->name('billing.time-entries.destroy');
            Route::put('billing/time-entries/{timeEntry}/approve', [\App\Http\Controllers\TimeEntryController::class, 'approve'])->middleware('permission:approve-time-entries')->name('billing.time-entries.approve');
            Route::post('billing/time-entries/start-timer', [\App\Http\Controllers\TimeEntryController::class, 'startTimer'])->middleware('permission:start-timer')->name('billing.time-entries.start-timer');
            Route::put('billing/time-entries/{timeEntry}/stop-timer', [\App\Http\Controllers\TimeEntryController::class, 'stopTimer'])->middleware('permission:stop-timer')->name('billing.time-entries.stop-timer');
        });

        // Billing Rate routes
        Route::middleware('permission:manage-billing-rates')->group(function () {
            Route::get('billing/billing-rates', [\App\Http\Controllers\BillingRateController::class, 'index'])->name('billing.billing-rates.index');
            Route::post('billing/billing-rates', [\App\Http\Controllers\BillingRateController::class, 'store'])->middleware('permission:create-billing-rates')->name('billing.billing-rates.store');
            Route::put('billing/billing-rates/{billingRate}', [\App\Http\Controllers\BillingRateController::class, 'update'])->middleware('permission:edit-billing-rates')->name('billing.billing-rates.update');
            Route::delete('billing/billing-rates/{billingRate}', [\App\Http\Controllers\BillingRateController::class, 'destroy'])->middleware('permission:delete-billing-rates')->name('billing.billing-rates.destroy');
            Route::put('billing/billing-rates/{billingRate}/toggle-status', [\App\Http\Controllers\BillingRateController::class, 'toggleStatus'])->middleware('permission:toggle-status-billing-rates')->name('billing.billing-rates.toggle-status');
        });

        // Fee Type routes
        Route::middleware('permission:manage-fee-types')->group(function () {
            Route::get('billing/fee-types', [\App\Http\Controllers\FeeTypeController::class, 'index'])->name('billing.fee-types.index');
            Route::post('billing/fee-types', [\App\Http\Controllers\FeeTypeController::class, 'store'])->middleware('permission:create-fee-types')->name('billing.fee-types.store');
            Route::put('billing/fee-types/{feeType}', [\App\Http\Controllers\FeeTypeController::class, 'update'])->middleware('permission:edit-fee-types')->name('billing.fee-types.update');
            Route::delete('billing/fee-types/{feeType}', [\App\Http\Controllers\FeeTypeController::class, 'destroy'])->middleware('permission:delete-fee-types')->name('billing.fee-types.destroy');
            Route::put('billing/fee-types/{feeType}/toggle-status', [\App\Http\Controllers\FeeTypeController::class, 'toggleStatus'])->middleware('permission:toggle-status-fee-types')->name('billing.fee-types.toggle-status');
        });

        // Fee Structure routes
        Route::middleware('permission:manage-fee-structures')->group(function () {
            Route::get('billing/fee-structures', [\App\Http\Controllers\FeeStructureController::class, 'index'])->name('billing.fee-structures.index');
            Route::post('billing/fee-structures', [\App\Http\Controllers\FeeStructureController::class, 'store'])->middleware('permission:create-fee-structures')->name('billing.fee-structures.store');
            Route::put('billing/fee-structures/{feeStructure}', [\App\Http\Controllers\FeeStructureController::class, 'update'])->middleware('permission:edit-fee-structures')->name('billing.fee-structures.update');
            Route::delete('billing/fee-structures/{feeStructure}', [\App\Http\Controllers\FeeStructureController::class, 'destroy'])->middleware('permission:delete-fee-structures')->name('billing.fee-structures.destroy');
            Route::put('billing/fee-structures/{feeStructure}/toggle-status', [\App\Http\Controllers\FeeStructureController::class, 'toggleStatus'])->middleware('permission:toggle-status-fee-structures')->name('billing.fee-structures.toggle-status');
        });

        // Expense routes
        Route::middleware('permission:manage-expenses')->group(function () {
            Route::get('billing/expenses', [\App\Http\Controllers\ExpenseController::class, 'index'])->name('billing.expenses.index');
            Route::post('billing/expenses', [\App\Http\Controllers\ExpenseController::class, 'store'])->middleware('permission:create-expenses')->name('billing.expenses.store');
            Route::put('billing/expenses/{expense}', [\App\Http\Controllers\ExpenseController::class, 'update'])->middleware('permission:edit-expenses')->name('billing.expenses.update');
            Route::delete('billing/expenses/{expense}', [\App\Http\Controllers\ExpenseController::class, 'destroy'])->middleware('permission:delete-expenses')->name('billing.expenses.destroy');
            Route::put('billing/expenses/{expense}/approve', [\App\Http\Controllers\ExpenseController::class, 'approve'])->middleware('permission:approve-expenses')->name('billing.expenses.approve');
        });

        // Expense Category routes
        Route::middleware('permission:manage-expense-categories')->group(function () {
            Route::get('billing/expense-categories', [\App\Http\Controllers\ExpenseCategoryController::class, 'index'])->name('billing.expense-categories.index');
            Route::post('billing/expense-categories', [\App\Http\Controllers\ExpenseCategoryController::class, 'store'])->middleware('permission:create-expense-categories')->name('billing.expense-categories.store');
            Route::put('billing/expense-categories/{expenseCategory}', [\App\Http\Controllers\ExpenseCategoryController::class, 'update'])->middleware('permission:edit-expense-categories')->name('billing.expense-categories.update');
            Route::delete('billing/expense-categories/{expenseCategory}', [\App\Http\Controllers\ExpenseCategoryController::class, 'destroy'])->middleware('permission:delete-expense-categories')->name('billing.expense-categories.destroy');
            Route::put('billing/expense-categories/{expenseCategory}/toggle-status', [\App\Http\Controllers\ExpenseCategoryController::class, 'toggleStatus'])->middleware('permission:toggle-status-expense-categories')->name('billing.expense-categories.toggle-status');
        });

        // Invoice routes
        Route::middleware('permission:manage-invoices')->group(function () {
            Route::get('billing/invoices', [\App\Http\Controllers\InvoiceController::class, 'index'])->name('billing.invoices.index');
            Route::get('billing/invoices/create', [\App\Http\Controllers\InvoiceController::class, 'create'])->middleware('permission:create-invoices')->name('billing.invoices.create');
            Route::get('billing/invoices/{invoice}', [\App\Http\Controllers\InvoiceController::class, 'show'])->middleware('permission:view-invoices')->name('billing.invoices.show');
            Route::get('billing/invoices/{invoice}/edit', [\App\Http\Controllers\InvoiceController::class, 'edit'])->middleware('permission:edit-invoices')->name('billing.invoices.edit');
            Route::get('billing/invoices/{invoice}/generate', [\App\Http\Controllers\InvoiceController::class, 'generate'])->middleware('permission:view-invoices')->name('billing.invoices.generate');
            Route::post('billing/invoices', [\App\Http\Controllers\InvoiceController::class, 'store'])->middleware('permission:create-invoices')->name('billing.invoices.store');
            Route::put('billing/invoices/{invoice}', [\App\Http\Controllers\InvoiceController::class, 'update'])->middleware('permission:edit-invoices')->name('billing.invoices.update');
            Route::delete('billing/invoices/{invoice}', [\App\Http\Controllers\InvoiceController::class, 'destroy'])->middleware('permission:delete-invoices')->name('billing.invoices.destroy');
            Route::put('billing/invoices/{invoice}/send', [\App\Http\Controllers\InvoiceController::class, 'send'])->middleware('permission:send-invoices')->name('billing.invoices.send');
            Route::post('billing/invoices/generate-from-time-and-expenses', [\App\Http\Controllers\InvoiceController::class, 'generateFromTimeAndExpenses'])->middleware('permission:create-invoices')->name('billing.invoices.generate-from-time-and-expenses');
        });

        // Payment routes
        Route::middleware('permission:manage-payments')->group(function () {
            Route::get('billing/payments', [\App\Http\Controllers\PaymentController::class, 'index'])->name('billing.payments.index');
            Route::post('billing/payments', [\App\Http\Controllers\PaymentController::class, 'store'])->middleware('permission:create-payments')->name('billing.payments.store');
            Route::put('billing/payments/{payment}', [\App\Http\Controllers\PaymentController::class, 'update'])->middleware('permission:edit-payments')->name('billing.payments.update');
            Route::delete('billing/payments/{payment}', [\App\Http\Controllers\PaymentController::class, 'destroy'])->middleware('permission:delete-payments')->name('billing.payments.destroy');
        });

        // Task Management routes
        Route::middleware('permission:manage-tasks')->group(function () {
            Route::get('tasks', [\App\Http\Controllers\TaskController::class, 'index'])->name('tasks.index');
            Route::get('tasks/{task}', [\App\Http\Controllers\TaskController::class, 'show'])->middleware('permission:view-tasks')->name('tasks.show');
            Route::post('tasks', [\App\Http\Controllers\TaskController::class, 'store'])->middleware('permission:create-tasks')->name('tasks.store');
            Route::put('tasks/{task}', [\App\Http\Controllers\TaskController::class, 'update'])->middleware('permission:edit-tasks')->name('tasks.update');
            Route::delete('tasks/{task}', [\App\Http\Controllers\TaskController::class, 'destroy'])->middleware('permission:delete-tasks')->name('tasks.destroy');
            Route::put('tasks/{task}/toggle-status', [\App\Http\Controllers\TaskController::class, 'toggleStatus'])->middleware('permission:toggle-status-tasks')->name('tasks.toggle-status');
            Route::get('api/tasks/case-users/{case}', [\App\Http\Controllers\TaskController::class, 'getCaseUsers'])->name('api.tasks.case-users');
            Route::get('api/clients/{client}/cases', [\App\Http\Controllers\InvoiceController::class, 'getClientCases'])->name('api.clients.cases');
            Route::get('api/cases/{case}/time-entries', [\App\Http\Controllers\InvoiceController::class, 'getCaseTimeEntries'])->name('api.cases.time-entries');
            Route::get('api/clients/{client}/time-entries', [\App\Http\Controllers\InvoiceController::class, 'getClientTimeEntries'])->name('api.clients.time-entries');
        });

        // Task Type routes
        Route::middleware('permission:manage-task-types')->group(function () {
            Route::get('task/task-types', [\App\Http\Controllers\TaskTypeController::class, 'index'])->name('tasks.task-types.index');
            Route::post('task/task-types', [\App\Http\Controllers\TaskTypeController::class, 'store'])->middleware('permission:create-task-types')->name('tasks.task-types.store');
            Route::put('task/task-types/{taskType}', [\App\Http\Controllers\TaskTypeController::class, 'update'])->middleware('permission:edit-task-types')->name('tasks.task-types.update');
            Route::delete('task/task-types/{taskType}', [\App\Http\Controllers\TaskTypeController::class, 'destroy'])->middleware('permission:delete-task-types')->name('tasks.task-types.destroy');
            Route::put('task/task-types/{taskType}/toggle-status', [\App\Http\Controllers\TaskTypeController::class, 'toggleStatus'])->middleware('permission:toggle-status-task-types')->name('tasks.task-types.toggle-status');
        });

        // Task Status routes
        Route::middleware('permission:manage-task-statuses')->group(function () {
            Route::get('task/task-statuses', [\App\Http\Controllers\TaskStatusController::class, 'index'])->name('tasks.task-statuses.index');
            Route::post('task/task-statuses', [\App\Http\Controllers\TaskStatusController::class, 'store'])->middleware('permission:create-task-statuses')->name('tasks.task-statuses.store');
            Route::put('task/task-statuses/{taskStatus}', [\App\Http\Controllers\TaskStatusController::class, 'update'])->middleware('permission:edit-task-statuses')->name('tasks.task-statuses.update');
            Route::delete('task/task-statuses/{taskStatus}', [\App\Http\Controllers\TaskStatusController::class, 'destroy'])->middleware('permission:delete-task-statuses')->name('tasks.task-statuses.destroy');
            Route::put('task/task-statuses/{taskStatus}/toggle-status', [\App\Http\Controllers\TaskStatusController::class, 'toggleStatus'])->middleware('permission:toggle-status-task-statuses')->name('tasks.task-statuses.toggle-status');
        });

        // Workflow routes
        Route::middleware('permission:manage-workflows')->group(function () {
            Route::get('task/workflows', [\App\Http\Controllers\WorkflowController::class, 'index'])->name('tasks.workflows.index');
            Route::post('task/workflows', [\App\Http\Controllers\WorkflowController::class, 'store'])->middleware('permission:create-workflows')->name('tasks.workflows.store');
            Route::put('task/workflows/{workflow}', [\App\Http\Controllers\WorkflowController::class, 'update'])->middleware('permission:edit-workflows')->name('tasks.workflows.update');
            Route::delete('task/workflows/{workflow}', [\App\Http\Controllers\WorkflowController::class, 'destroy'])->middleware('permission:delete-workflows')->name('tasks.workflows.destroy');
            Route::put('task/workflows/{workflow}/toggle-status', [\App\Http\Controllers\WorkflowController::class, 'toggleStatus'])->middleware('permission:toggle-status-workflows')->name('tasks.workflows.toggle-status');
        });







        // Task Comment routes
        Route::middleware('permission:manage-task-comments')->group(function () {
            Route::get('task/task-comments', [\App\Http\Controllers\TaskCommentController::class, 'index'])->name('tasks.task-comments.index');
            Route::post('task/task-comments', [\App\Http\Controllers\TaskCommentController::class, 'store'])->middleware('permission:create-task-comments')->name('tasks.task-comments.store');
            Route::put('task/task-comments/{taskComment}', [\App\Http\Controllers\TaskCommentController::class, 'update'])->middleware('permission:edit-task-comments')->name('tasks.task-comments.update');
            Route::delete('task/task-comments/{taskComment}', [\App\Http\Controllers\TaskCommentController::class, 'destroy'])->middleware('permission:delete-task-comments')->name('tasks.task-comments.destroy');
        });

        // Communication & Collaboration Routes
        Route::prefix('communication')->name('communication.')->group(function () {
            // Messages
            Route::middleware('permission:manage-messages')->group(function () {
                Route::get('/messages', [\App\Http\Controllers\MessageController::class, 'index'])->name('messages.index');
                Route::get('/messages/{conversation}', [\App\Http\Controllers\MessageController::class, 'show'])->middleware('permission:view-messages')->name('messages.show');
                Route::post('/messages', [\App\Http\Controllers\MessageController::class, 'store'])->middleware('permission:send-messages')->name('messages.store');
                Route::delete('/messages/{conversation}', [\App\Http\Controllers\MessageController::class, 'destroy'])->middleware('permission:delete-messages')->name('messages.destroy');
                
                // API endpoints for polling
                Route::get('/api/unread-count', [\App\Http\Controllers\MessageController::class, 'getUnreadCount'])->name('messages.unread-count');
                Route::get('/api/recent-messages', [\App\Http\Controllers\MessageController::class, 'getRecentMessages'])->name('messages.recent');
                Route::get('/messages/user/{user}', [\App\Http\Controllers\MessageController::class, 'getUserDetails'])->name('messages.getUserDetails');
            });
        });

        // Language management
        Route::get('manage-language/{lang?}', [LanguageController::class, 'managePage'])->middleware('permission:manage-language')->name('manage-language');
        Route::get('language/load', [LanguageController::class, 'load'])->name('language.load');
        Route::match(['POST', 'PATCH'], 'language/save', [LanguageController::class, 'save'])->middleware('permission:edit-language')->name('language.save');

        // Landing Page content management (Super Admin only)
        Route::middleware('App\Http\Middleware\SuperAdminMiddleware')->group(function () {
            Route::get('landing-page/settings', [LandingPageController::class, 'settings'])->name('landing-page.settings');
            Route::post('landing-page/settings', [LandingPageController::class, 'updateSettings'])->name('landing-page.settings.update');

            Route::resource('landing-page/custom-pages', CustomPageController::class)->names([
                'index' => 'landing-page.custom-pages.index',
                'store' => 'landing-page.custom-pages.store',
                'update' => 'landing-page.custom-pages.update',
                'destroy' => 'landing-page.custom-pages.destroy'
            ]);
        });

        // Impersonation routes
        Route::middleware('App\Http\Middleware\SuperAdminMiddleware')->group(function () {
            Route::get('impersonate/{userId}', [ImpersonateController::class, 'start'])->name('impersonate.start');
        });

        Route::post('impersonate/leave', [ImpersonateController::class, 'leave'])->name('impersonate.leave');
    }); // End plan.access middleware group
});

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';

Route::match(['GET', 'POST'], 'payments/easebuzz/success', [EasebuzzPaymentController::class, 'success'])->name('easebuzz.success');
Route::post('payments/easebuzz/callback', [EasebuzzPaymentController::class, 'callback'])->name('easebuzz.callback');
   