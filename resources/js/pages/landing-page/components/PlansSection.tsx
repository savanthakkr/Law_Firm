import { Link } from '@inertiajs/react';
import { ArrowRight, Check } from 'lucide-react';
import { useState } from 'react';
import { useScrollAnimation } from '../../../hooks/useScrollAnimation';
import { formatCurrency } from '@/utils/helpers';

// Simple encryption function for plan ID
const encryptPlanId = (planId: number): string => {
    const key = 'advocate2025';
    const str = planId.toString();
    let encrypted = '';
    for (let i = 0; i < str.length; i++) {
        encrypted += String.fromCharCode(str.charCodeAt(i) ^ key.charCodeAt(i % key.length));
    }
    return btoa(encrypted);
};

interface Plan {
    id: number;
    name: string;
    description: string;
    price: number;
    yearly_price?: number;
    duration: string;
    features?: string[];
    is_popular?: boolean;
    is_plan_enable: string;
    trial_days?: number;
    stats?: {
        users: number;
        cases: number;
        clients: number;
        storage: string;
    };
}

interface PlansSectionProps {
    brandColor?: string;
    plans: Plan[];
    settings?: any;
    sectionData?: {
        title?: string;
        subtitle?: string;
        faq_text?: string;
    };
    trial_days?: number;
}

function PlansSection({ plans, settings, sectionData, brandColor = '#3b82f6' }: PlansSectionProps) {
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
    const { ref, isVisible } = useScrollAnimation();

    // Filter enabled plans
    const enabledPlans = plans.filter((plan) => plan.is_plan_enable === 'on');

    // Default plans if none provided
    const defaultPlans = [
        {
            id: 1,
            name: 'Starter',
            description: 'Perfect for individuals getting started with digital networking',
            price: 0,
            yearly_price: 0,
            duration: 'month',
            features: ['1 Digital Business Card', 'Basic QR Code', 'Contact Form', 'Basic Analytics', 'Email Support'],
            is_popular: false,
            is_plan_enable: 'on',
        },
        {
            id: 2,
            name: 'Professional',
            description: 'Ideal for professionals and small businesses',
            price: 19,
            yearly_price: 190,
            duration: 'month',
            features: [
                '5 Digital Business Cards',
                'Custom QR Codes',
                'NFC Support',
                'Advanced Analytics',
                'Custom Branding',
                'Priority Support',
                'Lead Capture',
            ],
            is_popular: true,
            is_plan_enable: 'on',
        },
        {
            id: 3,
            name: 'Enterprise',
            description: 'For teams and large organizations',
            price: 49,
            yearly_price: 490,
            duration: 'month',
            features: [
                'Unlimited Digital Cards',
                'Team Management',
                'Custom Domain',
                'White Label Solution',
                'API Access',
                'Dedicated Support',
                'Advanced Integrations',
                'Custom Features',
            ],
            is_popular: false,
            is_plan_enable: 'on',
        },
    ];

    const displayPlans = enabledPlans.length > 0 ? enabledPlans : defaultPlans;

    const getPrice = (plan: Plan) => {
        if (billingCycle === 'yearly' && plan.yearly_price) {
            return plan.yearly_price;
        }
        return plan.price;
    };
    console.log({ plans });

    return (
        <section id="pricing" className="bg-white py-12 sm:py-16 lg:py-20" ref={ref}>
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div
                    className={`mb-8 text-center transition-all duration-700 sm:mb-12 lg:mb-16 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}
                >
                    <h2 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl">{sectionData?.title || 'Choose Your Plan'}</h2>
                    <p className="mx-auto mb-8 max-w-3xl text-lg leading-relaxed font-medium text-gray-600">
                        {sectionData?.subtitle ||
                            'Start with our free plan and upgrade as you grow. All plans include our core features with no setup fees or hidden costs.'}
                    </p>

                    {/* Billing Toggle */}
                    <div className="flex items-center justify-center gap-4">
                        <span className={`text-sm ${billingCycle === 'monthly' ? 'font-semibold text-gray-900' : 'text-gray-500'}`}>Monthly</span>
                        <button
                            onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
                            className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
                            style={{ backgroundColor: billingCycle === 'yearly' ? brandColor : '#e5e7eb' }}
                        >
                            <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                    billingCycle === 'yearly' ? 'translate-x-6' : 'translate-x-1'
                                }`}
                            />
                        </button>
                        <span className={`text-sm ${billingCycle === 'yearly' ? 'font-semibold text-gray-900' : 'text-gray-500'}`}>Yearly</span>
                        {/* {billingCycle === 'yearly' && (
              <span className="bg-gray-100 text-gray-700 text-xs font-semibold px-2.5 py-0.5 rounded-full border">
                Save 20%
              </span>
            )} */}
                    </div>
                </div>

                <div
                    className={`grid grid-cols-1 gap-8 transition-all delay-300 duration-700 md:grid-cols-2 lg:grid-cols-4 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}
                >
                    {displayPlans.map((plan) => (
                        <div key={plan.id} className={`group relative flex h-full flex-col ${plan.is_popular ? 'z-10 scale-[1.02]' : ''}`}>
                            {/* Card with decorative elements */}
                            <div
                                className="absolute inset-0 overflow-hidden rounded-2xl border shadow-lg transition-all duration-300 group-hover:shadow-xl"
                                style={{
                                    background: plan.is_popular
                                        ? `linear-gradient(to bottom right, ${brandColor}20, ${brandColor}10, transparent)`
                                        : 'linear-gradient(to bottom right, rgb(243 244 246 / 0.8), rgb(249 250 251 / 0.5), transparent)',
                                    borderColor: plan.is_popular ? `${brandColor}30` : 'rgb(229 231 235 / 0.8)',
                                }}
                            >
                                {/* Decorative background elements */}
                                <div
                                    className="absolute top-0 right-0 -mt-16 -mr-16 h-32 w-32 rounded-full opacity-70"
                                    style={{ background: `linear-gradient(to bottom right, ${brandColor}10, transparent)` }}
                                ></div>
                                <div
                                    className="absolute bottom-0 left-0 -mb-12 -ml-12 h-24 w-24 rounded-full opacity-50"
                                    style={{ background: `linear-gradient(to top right, ${brandColor}10, transparent)` }}
                                ></div>
                            </div>

                            {/* Recommended indicator */}
                            {plan.is_popular && (
                                <div className="absolute -top-4 right-0 left-0 z-20 flex justify-center">
                                    <div
                                        className="flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium text-white shadow-lg"
                                        style={{ backgroundColor: brandColor }}
                                    >
                                        <Check className="h-4 w-4" />
                                        Recommended
                                    </div>
                                </div>
                            )}

                            {/* Content container */}
                            <div className="relative z-10 flex h-full flex-col p-6 pt-8">
                                {/* Plan header */}
                                <div className="mb-6">
                                    <h3 className="mb-2 text-2xl font-bold" style={{ color: plan.is_popular ? brandColor : 'inherit' }}>
                                        {plan.name}
                                    </h3>
                                    <div className="mb-3 flex items-baseline gap-1.5">
                                        <span className="text-3xl font-extrabold" style={{ color: plan.is_popular ? brandColor : 'inherit' }}>
                                            {getPrice(plan) === 0 ? '$0' : formatCurrency(getPrice(plan))}
                                        </span>
                                        <span className="text-muted-foreground text-sm">/{billingCycle === 'yearly' ? 'year' : 'month'}</span>
                                    </div>
                                    <p className="text-muted-foreground mb-3 line-clamp-2 text-sm leading-relaxed">{plan.description}</p>
                                    {plan.trial_days > 0 && (
                                        <div className="flex items-center gap-1.5 text-sm" style={{ color: brandColor }}>
                                            <Check className="h-3.5 w-3.5" />
                                            {plan.trial_days} days free trial
                                        </div>
                                    )}
                                    {billingCycle === 'yearly' && getPrice(plan) > 0 && (
                                        <div className="flex items-center gap-1.5 text-sm" style={{ color: brandColor }}>
                                            <Check className="h-3.5 w-3.5" />
                                            Save {formatCurrency(Math.round((plan.price * 12 - getPrice(plan)) * 100) / 100)} annually
                                        </div>
                                    )}
                                </div>

                                {/* Divider with icon */}
                                <div className="relative my-4 flex items-center">
                                    <div className="flex-grow border-t border-gray-200"></div>
                                    <div className="mx-3 rounded-full p-1.5" style={{ backgroundColor: `${brandColor}10`, color: brandColor }}>
                                        <Check className="h-4 w-4" />
                                    </div>
                                    <div className="flex-grow border-t border-gray-200"></div>
                                </div>

                                {/* Usage limits */}
                                <div className="mb-4">
                                    <h4 className="text-muted-foreground mb-3 text-sm font-semibold tracking-wider uppercase">Usage Limits</h4>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="rounded-lg bg-white/50 p-2 text-center">
                                            <div className="text-lg font-bold" style={{ color: brandColor }}>
                                                {plan.stats?.users || 'N/A'}
                                            </div>
                                            <div className="text-muted-foreground text-xs">Team Members</div>
                                        </div>
                                        <div className="rounded-lg bg-white/50 p-2 text-center">
                                            <div className="text-lg font-bold" style={{ color: brandColor }}>
                                                {plan.stats?.cases || 'N/A'}
                                            </div>
                                            <div className="text-muted-foreground text-xs">Cases</div>
                                        </div>
                                        <div className="rounded-lg bg-white/50 p-2 text-center">
                                            <div className="text-lg font-bold" style={{ color: brandColor }}>
                                                {plan.stats?.clients || 'N/A'}
                                            </div>
                                            <div className="text-muted-foreground text-xs">Clients</div>
                                        </div>
                                        <div className="rounded-lg bg-white/50 p-2 text-center">
                                            <div className="text-lg font-bold" style={{ color: brandColor }}>
                                                {plan.stats?.storage || 'N/A'}
                                            </div>
                                            <div className="text-muted-foreground text-xs">Storage</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Features */}
                                <div className="mb-6 flex-1">
                                    <h4 className="text-muted-foreground mb-3 text-sm font-semibold tracking-wider uppercase">Features</h4>
                                    <ul className="space-y-2.5">
                                        {(plan.features || []).map((feature, index) => (
                                            <li key={index} className="flex items-center gap-3">
                                                <div
                                                    className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full"
                                                    style={{ backgroundColor: `${brandColor}10`, color: brandColor }}
                                                >
                                                    <Check className="h-3.5 w-3.5" />
                                                </div>
                                                <span className="text-sm font-medium">{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Actions */}
                                <div className="mt-auto border-t border-gray-200 pt-4">
                                    <Link
                                        href={route('register', { plan: encryptPlanId(plan.id) })}
                                        className="block w-full rounded-lg px-6 py-3 text-center font-semibold transition-colors hover:opacity-90"
                                        style={{
                                            backgroundColor: plan.is_popular ? brandColor : '#f3f4f6',
                                            color: plan.is_popular ? 'white' : '#111827',
                                        }}
                                    >
                                        {plan.price === 0 ? 'Start Free' : 'Get Started'}
                                        <ArrowRight className="ml-2 inline-block h-4 w-4" />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* FAQ Link */}
                {sectionData?.faq_text && (
                    <div className="mt-8 text-center sm:mt-12">
                        <p className="text-gray-600">{sectionData.faq_text}</p>
                    </div>
                )}
            </div>
        </section>
    );
}

export default PlansSection;
