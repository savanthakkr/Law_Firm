import { useState } from 'react';
import { PageTemplate } from '@/components/page-template';
import { usePage, router } from '@inertiajs/react';
import { CrudTable } from '@/components/CrudTable';
import { useTranslation } from 'react-i18next';
import { Pagination } from '@/components/ui/pagination';
import { SearchAndFilterBar } from '@/components/ui/search-and-filter-bar';
import { Send } from 'lucide-react';
import { toast } from '@/components/custom-toast';

export default function NewsletterPage() {
  const { t } = useTranslation();
  const { auth, subscriptions, filters: pageFilters = {} } = usePage().props as any;
  const permissions = auth?.permissions || [];

  const [searchTerm, setSearchTerm] = useState(pageFilters.search || '');
  const [statusFilter, setStatusFilter] = useState(pageFilters.status || '');
  const [showFilters, setShowFilters] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.get(route('newsletter.index'), {
      page: 1,
      search: searchTerm || undefined,
      status: statusFilter || undefined,
      per_page: pageFilters.per_page
    }, { preserveState: true, preserveScroll: true });
  };

  const handleSendNewsletter = () => {
    toast.loading(t('Sending newsletter...'));
    router.post(route('newsletter.send'), {}, {
      onSuccess: (page) => {
        toast.dismiss();
        if (page.props.flash?.success) {
          toast.success(page.props.flash.success);
        } else if (page.props.flash?.error) {
          toast.error(page.props.flash.error);
        } else {
          toast.success(t('Newsletter sent successfully!'));
        }
      },
      onError: (errors) => {
        toast.dismiss();
        if (typeof errors === 'object' && errors !== null) {
          const errorMessages = Object.values(errors).flat();
          toast.error(`Failed to send newsletter: ${errorMessages.join(', ')}`);
        } else {
          toast.error(t('Failed to send newsletter. Please try again.'));
        }
      }
    });
  };

  const pageActions = [
    {
      label: t('Send Newsletter'),
      icon: <Send className="h-4 w-4 mr-2" />,
      variant: 'default',
      onClick: handleSendNewsletter
    }
  ];

  const breadcrumbs = [
    { title: t('Dashboard'), href: route('dashboard') },
    { title: t('Newsletter Subscriptions') }
  ];

  const columns = [
    { key: 'email', label: t('Email') },
    {
      key: 'subscribed_at',
      label: t('Subscribed At'),
      render: (value: string) => new Date(value).toLocaleDateString()
    },
    {
      key: 'unsubscribed_at',
      label: t('Status'),
      render: (value: string) => (
        <span className={`px-2 py-1 rounded-full text-xs font-weight-medium ${
          value ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
        }`}>
          {value ? t('Unsubscribed') : t('Subscribed')}
        </span>
      )
    },
    {
      key: 'unsubscribed_at',
      label: t('Unsubscribed At'),
      render: (value: string) => value ? new Date(value).toLocaleDateString() : '-'
    }
  ];

  return (
    <PageTemplate
      title={t("Newsletter Subscriptions")}
      url="/newsletter"
      actions={pageActions}
      breadcrumbs={breadcrumbs}
      noPadding
    >
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow mb-4 p-4">
        <SearchAndFilterBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onSearch={handleSearch}
          filters={[
            {
              key: 'status',
              label: t('Status'),
              type: 'select',
              value: statusFilter,
              onChange: setStatusFilter,
              options: [
                { value: 'all', label: t('All') },
                { value: 'subscribed', label: t('Subscribed') },
                { value: 'unsubscribed', label: t('Unsubscribed') }
              ]
            }
          ]}
          showFilters={showFilters}
          setShowFilters={setShowFilters}
          hasActiveFilters={() => searchTerm !== '' || (statusFilter !== '' && statusFilter !== 'all')}
          activeFilterCount={() => (searchTerm ? 1 : 0) + (statusFilter && statusFilter !== 'all' ? 1 : 0)}
          onResetFilters={() => {
            setSearchTerm('');
            setStatusFilter('all');
            router.get(route('newsletter.index'));
          }}
          onApplyFilters={() => {
            router.get(route('newsletter.index'), {
              page: 1,
              search: searchTerm || undefined,
              status: statusFilter || undefined,
              per_page: pageFilters.per_page
            });
          }}
          currentPerPage={pageFilters.per_page?.toString() || "10"}
          onPerPageChange={(value) => {
            router.get(route('newsletter.index'), {
              page: 1,
              per_page: parseInt(value),
              search: searchTerm || undefined,
              status: statusFilter || undefined
            });
          }}
        />
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-lg shadow overflow-hidden">
        <CrudTable
          columns={columns}
          actions={[]}
          data={subscriptions?.data || []}
          from={subscriptions?.from || 1}
          onAction={() => {}}
          permissions={permissions}
          entityPermissions={{
            view: 'manage-contact-us',
            create: false,
            edit: false,
            delete: false
          }}
          showActions={false}
        />

        <Pagination
          from={subscriptions?.from || 0}
          to={subscriptions?.to || 0}
          total={subscriptions?.total || 0}
          links={subscriptions?.links}
          entityName={t("subscriptions")}
          onPageChange={(url) => router.get(url)}
        />
      </div>


    </PageTemplate>
  );
}