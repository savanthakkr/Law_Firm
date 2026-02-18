<?php

namespace Database\Seeders;

use App\Models\PaymentSetting;
use App\Models\User;
use Illuminate\Database\Seeder;

class PaymentSettingSeeder extends Seeder
{
    public function run(): void
    {
        $paymentData = [
            "currency" => "USD",
            "currency_symbol" => "$",
            "is_manually_enabled" => false,
            "is_bank_enabled" => true,
            "bank_detail" => "Bank: ICICI\nA/C No.: **************",
            "is_stripe_enabled" => true,
            "stripe_key" => "pk_test_51OXGvzSAsS22iEY5PekVdzVSyfN1UPISauWpIFjKnvwQdtoPezhD8QkjUp7uYdcrOtTQGPlgI7cYb2GmbmhUEZ3s00KkT57vnu",
            "stripe_secret" => "sk_test_51OXGvzSAsS22iEY5Y8MYPm5SNkQJlVVURGCVXs8pMb1IwIMGgddDMRLl3ehsh539755SdYUJxWqgx1Akk2AzYeXp00SsApGgqi",
            "is_paypal_enabled" => true,
            "paypal_mode" => "sandbox",
            "paypal_client_id" => "Ad7xfQTPWKZAcZNDgKCYEL1W7NDfrV7JzV23Os_kqTVSy5_zzIPcL1-h3YRtfAJTkLraUwZwB77f4Dln",
            "paypal_secret_key" => "EMGQOacnVfLAYsL6Fdfhtkp_ci5xnvQVZxxsBCBBTIOq6G_aqo9oVQvSFEYDIm5S5_z69Rb7Tl4UGIAu",
            "is_razorpay_enabled" => true,
            "razorpay_key" => "rzp_test_e8PsdGTRCf72A3",
            "razorpay_secret" => "ICKMMeS7W9lDNZXz9PsCcHz8",
            "is_mercadopago_enabled" => true,
            "mercadopago_mode" => "sandbox",
            "mercadopago_access_token" => "APP_USR-3318506436823427-072403-4680217215b40298b02af56b22cbdc53-700671671",
            "is_paystack_enabled" => true,
            "paystack_public_key" => "pk_test_9f6aaad1da032c2081934aa6cf8518d94a308b99",
            "paystack_secret_key" => "sk_test_90ed83442cfdefca663b0ee1e9c9f8189d675f6b",
            "is_flutterwave_enabled" => true,
            "flutterwave_public_key" => "FLWPUBK_TEST-05113ace39b840b31bcd365f532858ca-X",
            "flutterwave_secret_key" => "FLWSECK_TEST-b08c1c32a710451237c2372b5bafbeea-X",
            "is_tap_enabled" => true,
            "tap_secret_key" => "sk_test_XKokBfNWv6FIYuTMg5sLPjhJ",
            "is_xendit_enabled" => true,
            "xendit_api_key" => "xnd_development_2ADaRSmN4LzAvXF6QzC2NgqeOdJnIeMB14nCJNUZTbGa2IKPUMCTBgXEP7bjX",
            "is_paytr_enabled" => true,
            "paytr_merchant_id" => "369665",
            "paytr_merchant_key" => "5o7dH6ySGNSnU3ui",
            "paytr_merchant_salt" => "k8Z93ao1cJ1NUjTM",
            "is_mollie_enabled" => true,
            "mollie_api_key" => "test_drRNWfgDpRz43qxJ2VG6VSgW8Nzq5H",
            "is_toyyibpay_enabled" => true,
            "toyyibpay_category_code" => "luwaaf3e",
            "toyyibpay_secret_key" => "sop4ikpj-1qrg-i4lv-xb3z-0j5p81rn55in",
            "is_paymentwall_enabled" => true,
            "paymentwall_public_key" => "t_365891948ea844de751301cbcc1897",
            "paymentwall_private_key" => "t_365891948ea844de751301cbcc1897",
            "is_sspay_enabled" => true,
            "sspay_secret_key" => "gkxfw65k-saic-ccl7-unf2-noto3phisl7i",
            "sspay_category_code" => "lnpbm6ei",
            "is_benefit_enabled" => true,
            "benefit_mode" => "sandbox",
            "benefit_secret_key" => "sk_test_wFuvyqhJU0I947YjODCs1egV",
            "benefit_public_key" => "pk_test_4g6LtBAFExwsb9ecjJDfXiYV",
            "is_iyzipay_enabled" => true,
            "iyzipay_mode" => "sandbox",
            "iyzipay_secret_key" => "sandbox-41KGyTBIn3yw24tH9WOAI9LeexWdV0Fo",
            "iyzipay_public_key" => "sandbox-vpWI8D8A8cIdrDtzGETfPEOm3huNb33U",
            "is_aamarpay_enabled" => true,
            "aamarpay_store_id" => "aamarpaytest",
            "aamarpay_signature" => "dbb74894e82415a2f7ff0ec3a97e4183",
            "is_midtrans_enabled" => true,
            "midtrans_mode" => "sandbox",
            "midtrans_secret_key" => "SB-Mid-server-CkuriL9PLmx6NQwXjqTMXEXG",
            "is_yookassa_enabled" => true,
            "yookassa_shop_id" => "900839",
            "yookassa_secret_key" => "test_hN6Bgz7yc-f_DhUfKjNEp28bBd1g3LAubegbgijstpw",
            "is_nepalste_enabled" => false,
            "nepalste_mode" => "sandbox",
            "nepalste_secret_key" => "",
            "nepalste_public_key" => "",
            "is_paiement_enabled" => true,
            "paiement_merchant_id" => "PP-F258",
            "is_cinetpay_enabled" => true,
            "cinetpay_site_id" => "932948",
            "cinetpay_api_key" => "875761857625ea7da46f407.47059526",
            "cinetpay_secret_key" => "1883168137625ea9026fb3b5.72705402",
            "is_payhere_enabled" => true,
            "payhere_mode" => "sandbox",
            "payhere_merchant_id" => "1223903",
            "payhere_merchant_secret" => "MTY4MTQwNjY1ODM1MTE4NDA5NTA1ODQxOTE0OTEzMTA4MTAzMTQ5",
            "payhere_app_id" => "4OVxgDxWLuy4JDDSparOo43H7",
            "payhere_app_secret" => "8gfC8Lr42eU8m4OJAJDybB4UpsygCEQa74Tv9DVHSehT",
            "is_fedapay_enabled" => true,
            "fedapay_mode" => "sandbox",
            "fedapay_secret_key" => "sk_sandbox_D7UaHvIWputPlilghOg7Hxre",
            "fedapay_public_key" => "pk_sandbox_rcO3DdlKATFe-2h4NhJBhQHt",
            "is_authorizenet_enabled" => true,
            "authorizenet_mode" => "sandbox",
            "authorizenet_merchant_id" => "635Q6ftmE27",
            "authorizenet_transaction_key" => "92G6j97CV23JsWrk",
            "is_khalti_enabled" => true,
            "khalti_secret_key" => "test_secret_key_2f4ce233c9fe4db299cb3ff461028e51",
            "khalti_public_key" => "test_public_key_d7a1edf24fbd47219865fc3c4586888b",
            "is_easebuzz_enabled" => true,
            "easebuzz_merchant_key" => "G4AR9WUW1",
            "easebuzz_salt_key" => "ULPY6UW38",
            "easebuzz_environment" => "demo",
            "is_ozow_enabled" => true,
            "ozow_mode" => "sandbox",
            "ozow_site_key" => "WEN-WEN-003",
            "ozow_private_key" => "5ijH5VKlpmjHdxMGwUvkA8ivhEB5w5Xf",
            "ozow_api_key" => "lXNzCh0DpZBfpcid5fLldcss76Uv3PNM",
            "is_cashfree_enabled" => true,
            "cashfree_mode" => "sandbox",
            "cashfree_secret_key" => "cfsk_ma_test_5ed59f42098a0b562056ac63d81b352a_44a4c592",
            "cashfree_public_key" => "TEST103872709ceb85b1602c29cc31b107278301",
            "is_paytabs_enabled" => true,
            "paytabs_profile_id" => "123985",
            "paytabs_server_key" => "SNJ9LG9RBG-J69HGL6BJ2-B9KWDTRTN2",
            "paytabs_region" => "ARE",
            "paytabs_mode" => "sandbox",
            "is_skrill_enabled" => true,
            "skrill_merchant_id" => "skrill_user_test2@smart2pay.com",
            "skrill_secret_word" => "Qazxsw21.s2p!",
            "is_coingate_enabled" => true,
            "coingate_api_token" => "n6cjiN4w5p_s3ayK9zAkA3tasRUaQ3mfosx52BpT",
            "coingate_mode" => "sandbox",
            "is_payfast_enabled" => true,
            "payfast_merchant_id" => "10029177",
            "payfast_merchant_key" => "p4ktujv6gen32",
            "payfast_passphrase" => "rajodiyapayfast",
            "payfast_mode" => "sandbox"
        ];

        // Create for superadmin (user_id = 1)
        foreach ($paymentData as $key => $value) {
            PaymentSetting::firstOrCreate([
                'key' => $key,
                'user_id' => 1
            ], [
                'value' => $value
            ]);
        }

        // Create for all company users
        $companyUsers = User::where('type', 'company')->get();
        foreach ($companyUsers as $companyUser) {
            foreach ($paymentData as $key => $value) {
                PaymentSetting::firstOrCreate([
                    'key' => $key,
                    'user_id' => $companyUser->id
                ], [
                    'value' => $value
                ]);
            }
        }
    }
}