import { useState } from 'react';
import { PageTemplate } from '@/components/page-template';
import { usePage, router } from '@inertiajs/react';
import { hasPermission } from '@/utils/authorization';
import { CrudTable } from '@/components/CrudTable';
import { useTranslation } from 'react-i18next';
import { Pagination } from '@/components/ui/pagination';
import { SearchAndFilterBar } from '@/components/ui/search-and-filter-bar';

export default function ContactUsPage() {
  const { t } = useTranslation();
  const { auth, contacts, filters: pageFilters = {} } = usePage().props as any;
  const permissions = auth?.permissions || [];

  const [searchTerm, setSearchTerm] = useState(pageFilters.search || '');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.get(route('contact-us.index'), {
      page: 1,
      search: searchTerm || undefined,
      per_page: pageFilters.per_page
    }, { preserveState: true, preserveScroll: true });
  };

  const handleSort = (field: string) => {
    const direction = pageFilters.sort_field === field && pageFilters.sort_direction === 'asc' ? 'desc' : 'asc';
    router.get(route('contact-us.index'), {
      sort_field: field,
      sort_direction: direction,
      page: 1,
      search: searchTerm || undefined,
      per_page: pageFilters.per_page
    }, { preserveState: true, preserveScroll: true });
  };

  const breadcrumbs = [
    { title: t('Dashboard'), href: route('dashboard') },
    { title: t('Contact Us') }
  ];

  const columns = [
    { key: 'name', label: t('Name') },
    { key: 'email', label: t('Email') },
    { key: 'subject', label: t('Subject') },
    { key: 'message', label: t('Message') },
    {
      key: 'created_at',
      label: t('Date'),
        type: 'date',
    }
  ];

  return (
    <PageTemplate
      title={t("Contact Us Messages")}
      url="/contact-us"
      breadcrumbs={breadcrumbs}
      noPadding
    >
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow mb-4 p-4">
        <SearchAndFilterBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onSearch={handleSearch}
          filters={[]}
          showFilters={false}
          setShowFilters={() => {}}
          hasActiveFilters={() => searchTerm !== ''}
          activeFilterCount={() => searchTerm ? 1 : 0}
          onResetFilters={() => {
            setSearchTerm('');
            router.get(route('contact-us.index'));
          }}
          onApplyFilters={() => {}}
          currentPerPage={pageFilters.per_page?.toString() || "10"}
          onPerPageChange={(value) => {
            router.get(route('contact-us.index'), {
              page: 1,
              per_page: parseInt(value),
              search: searchTerm || undefined
            });
          }}
        />
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-lg shadow overflow-hidden">
        <CrudTable
          columns={columns}
          actions={[]}
          data={contacts?.data || []}
          from={contacts?.from || 1}
          onAction={() => {}}
          sortField={pageFilters.sort_field}
          sortDirection={pageFilters.sort_direction}
          onSort={handleSort}
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
          from={contacts?.from || 0}
          to={contacts?.to || 0}
          total={contacts?.total || 0}
          links={contacts?.links}
          entityName={t("contact messages")}
          onPageChange={(url) => router.get(url)}
        />
      </div>
    </PageTemplate>
  );
}