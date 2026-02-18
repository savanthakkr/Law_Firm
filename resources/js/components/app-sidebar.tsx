import { NavMain } from '@/components/nav-main';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader } from '@/components/ui/sidebar';
import { useBrand } from '@/contexts/BrandContext';
import { useLayout } from '@/contexts/LayoutContext';
import { useSidebarSettings } from '@/contexts/SidebarContext';
import { type NavItem } from '@/types';
import { hasPermission } from '@/utils/authorization';
import { Link, usePage } from '@inertiajs/react';
import {
    BookOpen,
    Briefcase,
    Building2,
    Calendar,
    CalendarDays,
    CheckSquare,
    CreditCard,
    DollarSign,
    FileText,
    Gift,
    Image,
    LayoutGrid,
    Mail,
    MessageSquare,
    Palette,
    Settings,
    UserCheck,
    Users,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

export function AppSidebar() {
    const { t, i18n } = useTranslation();
    const { auth } = usePage().props as any;
    const userRole = auth.user?.type || auth.user?.role;
    const permissions = auth?.permissions || [];

    // Get current direction
    const isRtl = document.documentElement.dir === 'rtl';

    // Business switch handler removed

    const getSuperAdminNavItems = (): NavItem[] => [
        {
            title: t('Dashboard'),
            href: route('dashboard'),
            icon: LayoutGrid,
        },

        {
            title: t('Companies'),
            href: route('companies.index'),
            icon: Briefcase,
        },
        {
            title: t('Media Library'),
            href: route('media-library'),
            icon: Image,
        },

        {
            title: t('Plans'),
            icon: CreditCard,
            children: [
                {
                    title: t('Plan'),
                    href: route('plans.index'),
                },
                {
                    title: t('Plan Request'),
                    href: route('plan-requests.index'),
                },
                {
                    title: t('Plan Orders'),
                    href: route('plan-orders.index'),
                },
            ],
        },
        {
            title: t('Coupons'),
            href: route('coupons.index'),
            icon: Settings,
        },

        {
            title: t('Contact Us'),
            href: route('contact-us.index'),
            icon: MessageSquare,
        },
        {
            title: t('Newsletter'),
            href: route('newsletter.index'),
            icon: Mail,
        },
        {
            title: t('Currencies'),
            href: route('currencies.index'),
            icon: DollarSign,
        },
        {
            title: t('Referral Program'),
            href: route('referral.index'),
            icon: Gift,
        },
        {
            title: t('Landing Page'),
            icon: Palette,
            children: [
                {
                    title: t('Landing Page'),
                    href: route('landing-page'),
                },
                {
                    title: t('Custom Pages'),
                    href: route('landing-page.custom-pages.index'),
                },
            ],
        },
        {
            title: t('Email Templates'),
            href: route('email-templates.index'),
            icon: Mail,
        },
        {
            title: t('Settings'),
            href: route('settings'),
            icon: Settings,
        },
    ];

    const getCompanyNavItems = (): NavItem[] => {
        const items: NavItem[] = [];

        // 1. Dashboard
        if (
            hasPermission(permissions, 'manage-dashboard') ||
            permissions.some((p) => p.startsWith('manage-own-')) ||
            permissions.some((p) => p.startsWith('manage-any-'))
        ) {
            items.push({
                title: t('Dashboard'),
                href: route('dashboard'),
                icon: LayoutGrid,
            });
        }

        // 2. Team Members
        const staffChildren = [];
        if (
            hasPermission(permissions, 'manage-users') ||
            hasPermission(permissions, 'manage-any-users') ||
            hasPermission(permissions, 'manage-own-users')
        ) {
            staffChildren.push({
                title: t('Members'),
                href: route('users.index'),
            });
        }
        if (
            hasPermission(permissions, 'manage-roles') ||
            hasPermission(permissions, 'manage-any-roles') ||
            hasPermission(permissions, 'manage-own-roles')
        ) {
            staffChildren.push({
                title: t('Roles'),
                href: route('roles.index'),
            });
        }
        if (staffChildren.length > 0) {
            items.push({
                title: t('Team Members'),
                icon: Users,
                children: staffChildren,
            });
        }

        // 3. Advocate
        const advocateChildren = [];
        if (
            hasPermission(permissions, 'manage-company-profiles') ||
            hasPermission(permissions, 'manage-any-company-profiles') ||
            hasPermission(permissions, 'manage-own-company-profiles')
        ) {
            advocateChildren.push({
                title: t('Company Profiles'),
                href: route('advocate.company-profiles.index'),
            });
        }
        if (advocateChildren.length > 0) {
            items.push({
                title: t('Advocate'),
                icon: Building2,
                children: advocateChildren,
            });
        }

        // 6. Client Management
        const clientChildren = [];
        const clientSetupChildren = [];
        if (
            hasPermission(permissions, 'manage-client-types') ||
            hasPermission(permissions, 'manage-any-client-types') ||
            hasPermission(permissions, 'manage-own-client-types')
        ) {
            clientSetupChildren.push({
                title: t('Client Types'),
                href: route('clients.client-types.index'),
            });
        }
        if (
            hasPermission(permissions, 'manage-document-types') ||
            hasPermission(permissions, 'manage-any-document-types') ||
            hasPermission(permissions, 'manage-own-document-types')
        ) {
            clientSetupChildren.push({
                title: t('Document Types'),
                href: route('advocate.document-types.index'),
            });
        }
        if (
            hasPermission(permissions, 'manage-client-billing-currencies') ||
            hasPermission(permissions, 'manage-any-client-billing-currencies') ||
            hasPermission(permissions, 'manage-own-client-billing-currencies')
        ) {
            clientSetupChildren.push({
                title: t('Billing Currencies'),
                href: route('client-billing-currencies.index'),
            });
        }
        if (clientSetupChildren.length > 0) {
            clientChildren.push({
                title: t('Client Setup'),
                children: clientSetupChildren,
            });
        }
        if (
            hasPermission(permissions, 'manage-clients') ||
            hasPermission(permissions, 'manage-any-clients') ||
            hasPermission(permissions, 'manage-own-clients')
        ) {
            clientChildren.push({
                title: t('Clients'),
                href: route('clients.index'),
            });
        }
        if (
            hasPermission(permissions, 'manage-client-documents') ||
            hasPermission(permissions, 'manage-any-client-documents') ||
            hasPermission(permissions, 'manage-own-client-documents')
        ) {
            clientChildren.push({
                title: t('Documents'),
                href: route('clients.documents.index'),
            });
        }
        if (
            hasPermission(permissions, 'manage-client-billing') ||
            hasPermission(permissions, 'manage-any-client-billing') ||
            hasPermission(permissions, 'manage-own-client-billing')
        ) {
            clientChildren.push({
                title: t('Billing'),
                href: route('clients.billing.index'),
            });
        }
        if (clientChildren.length > 0) {
            items.push({
                title: t('Client Management'),
                icon: UserCheck,
                children: clientChildren,
            });
        }

        // 4. Case Management
        const caseChildren = [];
        const caseSetupChildren = [];
        if (
            hasPermission(permissions, 'manage-case-types') ||
            hasPermission(permissions, 'manage-any-case-types') ||
            hasPermission(permissions, 'manage-own-case-types')
        ) {
            caseSetupChildren.push({
                title: t('Case Types'),
                href: route('cases.case-types.index'),
            });
        }
        if (
            hasPermission(permissions, 'manage-case-statuses') ||
            hasPermission(permissions, 'manage-any-case-statuses') ||
            hasPermission(permissions, 'manage-own-case-statuses')
        ) {
            caseSetupChildren.push({
                title: t('Case Statuses'),
                href: route('cases.case-statuses.index'),
            });
        }
        if (
            hasPermission(permissions, 'manage-event-types') ||
            hasPermission(permissions, 'manage-any-event-types') ||
            hasPermission(permissions, 'manage-own-event-types')
        ) {
            caseSetupChildren.push({
                title: t('Event Types'),
                href: route('advocate.event-types.index'),
            });
        }
        if (
            hasPermission(permissions, 'manage-hearing-types') ||
            hasPermission(permissions, 'manage-any-hearing-types') ||
            hasPermission(permissions, 'manage-own-hearing-types')
        ) {
            caseSetupChildren.push({
                title: t('Hearing Types'),
                href: route('hearing-types.index'),
            });
        }
        if (caseSetupChildren.length > 0) {
            caseChildren.push({
                title: t('Case Setup'),
                children: caseSetupChildren,
            });
        }
        if (
            hasPermission(permissions, 'manage-cases') ||
            hasPermission(permissions, 'manage-any-cases') ||
            hasPermission(permissions, 'manage-own-cases')
        ) {
            caseChildren.push({
                title: t('Cases'),
                href: route('cases.index'),
            });
        }
        if (
            hasPermission(permissions, 'manage-hearings') ||
            hasPermission(permissions, 'manage-any-hearings') ||
            hasPermission(permissions, 'manage-own-hearings')
        ) {
            caseChildren.push({
                title: t('Hearings'),
                href: route('hearings.index'),
            });
        }
        if (caseChildren.length > 0) {
            items.push({
                title: t('Case Management'),
                icon: Briefcase,
                children: caseChildren,
            });
        }

        // 5. Court Schedule
        const courtScheduleChildren = [];
        const setupChildren = [];
        if (
            hasPermission(permissions, 'manage-court-types') ||
            hasPermission(permissions, 'manage-any-court-types') ||
            hasPermission(permissions, 'manage-own-court-types')
        ) {
            setupChildren.push({
                title: t('Court Types'),
                href: route('advocate.court-types.index'),
            });
        }
        if (setupChildren.length > 0) {
            courtScheduleChildren.push({
                title: t('Court Setup'),
                children: setupChildren,
            });
        }
        if (
            hasPermission(permissions, 'manage-courts') ||
            hasPermission(permissions, 'manage-any-courts') ||
            hasPermission(permissions, 'manage-own-courts')
        ) {
            courtScheduleChildren.push({
                title: t('Courts'),
                href: route('courts.index'),
            });
        }
        if (
            hasPermission(permissions, 'manage-judges') ||
            hasPermission(permissions, 'manage-any-judges') ||
            hasPermission(permissions, 'manage-own-judges')
        ) {
            courtScheduleChildren.push({
                title: t('Judges'),
                href: route('judges.index'),
            });
        }
        if (courtScheduleChildren.length > 0) {
            items.push({
                title: t('Court Schedule'),
                icon: Calendar,
                children: courtScheduleChildren,
            });
        }

        

        // 7. Billing & Invoicing
        const billingChildren = [];
        const billingSetupChildren = [];
        if (
            hasPermission(permissions, 'manage-expense-categories') ||
            hasPermission(permissions, 'manage-any-expense-categories') ||
            hasPermission(permissions, 'manage-own-expense-categories')
        ) {
            billingSetupChildren.push({
                title: t('Expense Categories'),
                href: route('billing.expense-categories.index'),
            });
        }
        if (billingSetupChildren.length > 0) {
            billingChildren.push({
                title: t('Billing Setup'),
                children: billingSetupChildren,
            });
        }
        if (
            hasPermission(permissions, 'manage-time-entries') ||
            hasPermission(permissions, 'manage-any-time-entries') ||
            hasPermission(permissions, 'manage-own-time-entries')
        ) {
            billingChildren.push({
                title: t('Time Entries'),
                href: route('billing.time-entries.index'),
            });
        }
        if (
            hasPermission(permissions, 'manage-billing-rates') ||
            hasPermission(permissions, 'manage-any-billing-rates') ||
            hasPermission(permissions, 'manage-own-billing-rates')
        ) {
            billingChildren.push({
                title: t('Billing Rates'),
                href: route('billing.billing-rates.index'),
            });
        }
        if (
            hasPermission(permissions, 'manage-expenses') ||
            hasPermission(permissions, 'manage-any-expenses') ||
            hasPermission(permissions, 'manage-own-expenses')
        ) {
            billingChildren.push({
                title: t('Expenses'),
                href: route('billing.expenses.index'),
            });
        }
        if (
            hasPermission(permissions, 'manage-invoices') ||
            hasPermission(permissions, 'manage-any-invoices') ||
            hasPermission(permissions, 'manage-own-invoices')
        ) {
            billingChildren.push({
                title: t('Invoices'),
                href: route('billing.invoices.index'),
            });
        }
        if (
            hasPermission(permissions, 'manage-payments') ||
            hasPermission(permissions, 'manage-any-payments') ||
            hasPermission(permissions, 'manage-own-payments')
        ) {
            billingChildren.push({
                title: t('Payments'),
                href: route('billing.payments.index'),
            });
        }
        if (billingChildren.length > 0) {
            items.push({
                title: t('Billing & Invoicing'),
                icon: DollarSign,
                children: billingChildren,
            });
        }

        // 8. Task & Workflow
        const taskChildren = [];
        const taskSetupChildren = [];
        if (
            hasPermission(permissions, 'manage-task-types') ||
            hasPermission(permissions, 'manage-any-task-types') ||
            hasPermission(permissions, 'manage-own-task-types')
        ) {
            taskSetupChildren.push({
                title: t('Task Types'),
                href: route('tasks.task-types.index'),
            });
        }
        if (
            hasPermission(permissions, 'manage-task-statuses') ||
            hasPermission(permissions, 'manage-any-task-statuses') ||
            hasPermission(permissions, 'manage-own-task-statuses')
        ) {
            taskSetupChildren.push({
                title: t('Task Statuses'),
                href: route('tasks.task-statuses.index'),
            });
        }
        if (taskSetupChildren.length > 0) {
            taskChildren.push({
                title: t('Task Setup'),
                children: taskSetupChildren,
            });
        }

        if (
            hasPermission(permissions, 'manage-tasks') ||
            hasPermission(permissions, 'manage-any-tasks') ||
            hasPermission(permissions, 'manage-own-tasks')
        ) {
            taskChildren.push({
                title: t('Tasks'),
                href: route('tasks.index'),
            });
        }
        if (
            hasPermission(permissions, 'manage-task-comments') ||
            hasPermission(permissions, 'manage-any-task-comments') ||
            hasPermission(permissions, 'manage-own-task-comments')
        ) {
            taskChildren.push({
                title: t('Comments'),
                href: route('tasks.task-comments.index'),
            });
        }
        if (taskChildren.length > 0) {
            items.push({
                title: t('Task & Workflow'),
                icon: CheckSquare,
                children: taskChildren,
            });
        }

        // 9. Calendar
        if (
            hasPermission(permissions, 'manage-calendar') ||
            hasPermission(permissions, 'manage-any-calendar') ||
            hasPermission(permissions, 'manage-own-calendar')
        ) {
            items.push({
                title: t('Calendar'),
                href: route('calendar.index'),
                icon: CalendarDays,
            });
        }

        // 10. Legal Research
        const researchChildren = [];
        const researchSetupChildren = [];
        if (
            hasPermission(permissions, 'manage-research-types') ||
            hasPermission(permissions, 'manage-any-research-types') ||
            hasPermission(permissions, 'manage-own-research-types')
        ) {
            researchSetupChildren.push({
                title: t('Research Types'),
                href: route('legal-research.research-types.index'),
            });
        }
        if (
            hasPermission(permissions, 'manage-practice-areas') ||
            hasPermission(permissions, 'manage-any-practice-areas') ||
            hasPermission(permissions, 'manage-own-practice-areas')
        ) {
            researchSetupChildren.push({
                title: t('Practice Areas'),
                href: route('advocate.practice-areas.index'),
            });
        }
        if (
            hasPermission(permissions, 'manage-research-categories') ||
            hasPermission(permissions, 'manage-any-research-categories') ||
            hasPermission(permissions, 'manage-own-research-categories')
        ) {
            researchSetupChildren.push({
                title: t('Research Categories'),
                href: route('legal-research.categories.index'),
            });
        }
        if (researchSetupChildren.length > 0) {
            researchChildren.push({
                title: t('Research Setup'),
                children: researchSetupChildren,
            });
        }
        if (
            hasPermission(permissions, 'manage-research-projects') ||
            hasPermission(permissions, 'manage-any-research-projects') ||
            hasPermission(permissions, 'manage-own-research-projects')
        ) {
            researchChildren.push({
                title: t('Research Projects'),
                href: route('legal-research.projects.index'),
            });
        }
        if (
            hasPermission(permissions, 'manage-research-sources') ||
            hasPermission(permissions, 'manage-any-research-sources') ||
            hasPermission(permissions, 'manage-own-research-sources')
        ) {
            researchChildren.push({
                title: t('Research Sources'),
                href: route('legal-research.sources.index'),
            });
        }
        if (
            hasPermission(permissions, 'manage-knowledge-articles') ||
            hasPermission(permissions, 'manage-any-knowledge-articles') ||
            hasPermission(permissions, 'manage-own-knowledge-articles')
        ) {
            researchChildren.push({
                title: t('Knowledge Base'),
                href: route('legal-research.knowledge.index'),
            });
        }
        if (
            hasPermission(permissions, 'manage-legal-precedents') ||
            hasPermission(permissions, 'manage-any-legal-precedents') ||
            hasPermission(permissions, 'manage-own-legal-precedents')
        ) {
            researchChildren.push({
                title: t('Legal Precedents'),
                href: route('legal-research.precedents.index'),
            });
        }
        if (researchChildren.length > 0) {
            items.push({
                title: t('Legal Research'),
                icon: BookOpen,
                children: researchChildren,
            });
        }

        // 11. Document Management
        const documentChildren = [];
        const documentSetupChildren = [];
        if (
            hasPermission(permissions, 'manage-document-categories') ||
            hasPermission(permissions, 'manage-any-document-categories') ||
            hasPermission(permissions, 'manage-own-document-categories')
        ) {
            documentSetupChildren.push({
                title: t('Categories'),
                href: route('document-management.categories.index'),
            });
        }
        if (documentSetupChildren.length > 0) {
            documentChildren.push({
                title: t('Document Setup'),
                children: documentSetupChildren,
            });
        }
        if (
            hasPermission(permissions, 'manage-documents') ||
            hasPermission(permissions, 'manage-any-documents') ||
            hasPermission(permissions, 'manage-own-documents')
        ) {
            documentChildren.push({
                title: t('Documents'),
                href: route('document-management.documents.index'),
            });
        }
        if (
            hasPermission(permissions, 'manage-document-versions') ||
            hasPermission(permissions, 'manage-any-document-versions') ||
            hasPermission(permissions, 'manage-own-document-versions')
        ) {
            documentChildren.push({
                title: t('Versions'),
                href: route('document-management.versions.index'),
            });
        }
        if (
            hasPermission(permissions, 'manage-document-permissions') ||
            hasPermission(permissions, 'manage-any-document-permissions') ||
            hasPermission(permissions, 'manage-own-document-permissions')
        ) {
            documentChildren.push({
                title: t('Permissions'),
                href: route('document-management.permissions.index'),
            });
        }
        if (
            hasPermission(permissions, 'manage-document-comments') ||
            hasPermission(permissions, 'manage-any-document-comments') ||
            hasPermission(permissions, 'manage-own-document-comments')
        ) {
            documentChildren.push({
                title: t('Comments'),
                href: route('document-management.comments.index'),
            });
        }
        if (documentChildren.length > 0) {
            items.push({
                title: t('Document Management'),
                icon: FileText,
                children: documentChildren,
            });
        }

        // 12. Compliance & Regulatory
        const complianceChildren = [];
        const complianceSetupChildren = [];
        if (
            hasPermission(permissions, 'manage-compliance-categories') ||
            hasPermission(permissions, 'manage-any-compliance-categories') ||
            hasPermission(permissions, 'manage-own-compliance-categories')
        ) {
            complianceSetupChildren.push({
                title: t('Compliance Categories'),
                href: route('compliance.categories.index'),
            });
        }
        if (
            hasPermission(permissions, 'manage-compliance-frequencies') ||
            hasPermission(permissions, 'manage-any-compliance-frequencies') ||
            hasPermission(permissions, 'manage-own-compliance-frequencies')
        ) {
            complianceSetupChildren.push({
                title: t('Compliance Frequencies'),
                href: route('compliance.frequencies.index'),
            });
        }
        if (
            hasPermission(permissions, 'manage-risk-categories') ||
            hasPermission(permissions, 'manage-any-risk-categories') ||
            hasPermission(permissions, 'manage-own-risk-categories')
        ) {
            complianceSetupChildren.push({
                title: t('Risk Categories'),
                href: route('compliance.risk-categories.index'),
            });
        }
        if (
            hasPermission(permissions, 'manage-audit-types') ||
            hasPermission(permissions, 'manage-any-audit-types') ||
            hasPermission(permissions, 'manage-own-audit-types')
        ) {
            complianceSetupChildren.push({
                title: t('Compliance Audit Types'),
                href: route('compliance.audit-types.index'),
            });
        }
        if (complianceSetupChildren.length > 0) {
            complianceChildren.push({
                title: t('Compliance Setup'),
                children: complianceSetupChildren,
            });
        }
        if (
            hasPermission(permissions, 'manage-compliance-requirements') ||
            hasPermission(permissions, 'manage-any-compliance-requirements') ||
            hasPermission(permissions, 'manage-own-compliance-requirements')
        ) {
            complianceChildren.push({
                title: t('Compliance Requirements'),
                href: route('compliance.requirements.index'),
            });
        }
        if (
            hasPermission(permissions, 'manage-professional-licenses') ||
            hasPermission(permissions, 'manage-any-professional-licenses') ||
            hasPermission(permissions, 'manage-own-professional-licenses')
        ) {
            complianceChildren.push({
                title: t('Professional Licenses'),
                href: route('compliance.professional-licenses.index'),
            });
        }
        if (
            hasPermission(permissions, 'manage-cle-tracking') ||
            hasPermission(permissions, 'manage-any-cle-tracking') ||
            hasPermission(permissions, 'manage-own-cle-tracking')
        ) {
            complianceChildren.push({
                title: t('CLE Tracking'),
                href: route('compliance.cle-tracking.index'),
            });
        }
        if (
            hasPermission(permissions, 'manage-regulatory-bodies') ||
            hasPermission(permissions, 'manage-any-regulatory-bodies') ||
            hasPermission(permissions, 'manage-own-regulatory-bodies')
        ) {
            complianceChildren.push({
                title: t('Regulatory Bodies'),
                href: route('compliance.regulatory-bodies.index'),
            });
        }
        if (
            hasPermission(permissions, 'manage-risk-assessments') ||
            hasPermission(permissions, 'manage-any-risk-assessments') ||
            hasPermission(permissions, 'manage-own-risk-assessments')
        ) {
            complianceChildren.push({
                title: t('Risk Assessments'),
                href: route('compliance.risk-assessments.index'),
            });
        }
        if (
            hasPermission(permissions, 'manage-compliance-audits') ||
            hasPermission(permissions, 'manage-any-compliance-audits') ||
            hasPermission(permissions, 'manage-own-compliance-audits')
        ) {
            complianceChildren.push({
                title: t('Compliance Audits'),
                href: route('compliance.audits.index'),
            });
        }
        if (complianceChildren.length > 0) {
            items.push({
                title: t('Compliance & Regulatory'),
                icon: CheckSquare,
                children: complianceChildren,
            });
        }

        // 13. Communication
        if (
            hasPermission(permissions, 'manage-messages') ||
            hasPermission(permissions, 'manage-any-messages') ||
            hasPermission(permissions, 'manage-own-messages')
        ) {
            items.push({
                title: t('Communication'),
                icon: Mail,
                href: route('communication.messages.index'),
            });
        }

        // 14. Media Library
        if (
            hasPermission(permissions, 'manage-media') ||
            hasPermission(permissions, 'manage-any-media') ||
            hasPermission(permissions, 'manage-own-media')
        ) {
            items.push({
                title: t('Media Library'),
                href: route('media-library'),
                icon: Image,
            });
        }

        // 15. Plans
        // if (
        //     hasPermission(permissions, 'manage-plans') ||
        //     hasPermission(permissions, 'manage-any-plans') ||
        //     hasPermission(permissions, 'manage-own-plans')
        // ) {
        //     items.push({
        //         title: t('Plans'),
        //         href: route('plans.index'),
        //         icon: CreditCard,
        //     });
        // }

        // 16. Referral Program
        if (
            hasPermission(permissions, 'manage-referral') ||
            hasPermission(permissions, 'manage-any-referral') ||
            hasPermission(permissions, 'manage-own-referral')
        ) {
            items.push({
                title: t('Referral Program'),
                href: route('referral.index'),
                icon: Gift,
            });
        }

        // 17. Settings
        if (hasPermission(permissions, 'manage-settings')) {
            items.push({
                title: t('Settings'),
                href: route('settings'),
                icon: Settings,
            });
        }

        return items;
    };

    const mainNavItems = userRole === 'superadmin' ? getSuperAdminNavItems() : getCompanyNavItems();

    const { position, effectivePosition } = useLayout();
    const { variant, collapsible, style } = useSidebarSettings();
    const { logoLight, logoDark, favicon, updateBrandSettings } = useBrand();
    const [sidebarStyle, setSidebarStyle] = useState({});

    useEffect(() => {
        // Apply styles based on sidebar style
        if (style === 'colored') {
            setSidebarStyle({ backgroundColor: 'var(--primary)', color: 'white' });
        } else if (style === 'gradient') {
            setSidebarStyle({
                background: 'linear-gradient(to bottom, var(--primary), color-mix(in srgb, var(--primary), transparent 20%))',
                color: 'white',
            });
        } else {
            setSidebarStyle({});
        }
    }, [style]);

    const filteredNavItems = mainNavItems;

    // Get the first available menu item's href for logo link
    const getFirstAvailableHref = () => {
        if (filteredNavItems.length === 0) return route('dashboard');

        const firstItem = filteredNavItems[0];
        if (firstItem.href) {
            return firstItem.href;
        } else if (firstItem.children && firstItem.children.length > 0) {
            return firstItem.children[0].href || route('dashboard');
        }
        return route('dashboard');
    };

    return (
        <Sidebar side={effectivePosition} collapsible={collapsible} variant={variant} className={style !== 'plain' ? 'sidebar-custom-style' : ''}>
            <SidebarHeader className={style !== 'plain' ? 'sidebar-styled' : ''} style={sidebarStyle}>
                <div className="flex items-center justify-center p-2">
                    <Link href={getFirstAvailableHref()} className="flex items-center justify-center">
                        {/* Logo for expanded sidebar */}
                        <div className="flex h-10 items-center group-data-[collapsible=icon]:hidden">
                            {(() => {
                                const isDark = document.documentElement.classList.contains('dark');
                                const currentLogo = isDark ? logoLight : logoDark;
                                const displayUrl = currentLogo
                                    ? currentLogo.startsWith('http')
                                        ? currentLogo
                                        : currentLogo.startsWith('/storage/')
                                          ? `${window.location.origin}${currentLogo}`
                                          : currentLogo.startsWith('/')
                                            ? `${window.location.origin}${currentLogo}`
                                            : currentLogo
                                    : '';

                                return displayUrl ? (
                                    <img
                                        key={`${currentLogo}-${Date.now()}`}
                                        src={displayUrl}
                                        alt="Logo"
                                        className="h-9 w-auto max-w-[190px] transition-all duration-200"
                                        onError={() => updateBrandSettings({ [isDark ? 'logoLight' : 'logoDark']: '' })}
                                    />
                                ) : (
                                    <div className="flex h-12 items-center text-lg font-semibold tracking-tight text-inherit">Kuick</div>
                                );
                            })()}
                        </div>

                        {/* Icon for collapsed sidebar */}
                        <div className="hidden h-8 w-8 group-data-[collapsible=icon]:block">
                            {(() => {
                                const displayFavicon = favicon
                                    ? favicon.startsWith('http')
                                        ? favicon
                                        : favicon.startsWith('/storage/')
                                          ? `${window.location.origin}${favicon}`
                                          : favicon.startsWith('/')
                                            ? `${window.location.origin}${favicon}`
                                            : favicon
                                    : '';

                                return displayFavicon ? (
                                    <img
                                        key={`${favicon}-${Date.now()}`}
                                        src={displayFavicon}
                                        alt="Icon"
                                        className="h-8 w-8 transition-all duration-200"
                                        onError={() => updateBrandSettings({ favicon: '' })}
                                    />
                                ) : (
                                    <div className="bg-primary flex h-8 w-8 items-center justify-center rounded font-bold text-white shadow-sm">
                                        W
                                    </div>
                                );
                            })()}
                        </div>
                    </Link>
                </div>

                {/* Business Switcher removed */}
            </SidebarHeader>

            <SidebarContent>
                <div style={sidebarStyle} className={`h-full ${style !== 'plain' ? 'sidebar-styled' : ''}`}>
                    <NavMain items={filteredNavItems} position={effectivePosition} />
                </div>
            </SidebarContent>

            <SidebarFooter>
                {/* <NavFooter items={footerNavItems} className="mt-auto" position={position} /> */}
                {/* Profile menu moved to header */}
            </SidebarFooter>
        </Sidebar>
    );
}
