import { useState } from 'react';
import { PageTemplate } from '@/components/page-template';
import { usePage, router } from '@inertiajs/react';
import { Plus, Download, RotateCcw, FileText } from 'lucide-react';
import { hasPermission } from '@/utils/authorization';
import { CrudTable } from '@/components/CrudTable';
import { CrudFormModal } from '@/components/CrudFormModal';
import { CrudDeleteModal } from '@/components/CrudDeleteModal';
import { toast } from '@/components/custom-toast';
import { useTranslation } from 'react-i18next';
import { Pagination } from '@/components/ui/pagination';
import { SearchAndFilterBar } from '@/components/ui/search-and-filter-bar';

export default function DocumentVersions() {
  const { t } = useTranslation();
  const { auth, versions, documents, filters: pageFilters = {} } = usePage().props as any;
  const permissions = auth?.permissions || [];

  const [searchTerm, setSearchTerm] = useState(pageFilters.search || '');
  const [selectedDocument, setSelectedDocument] = useState(pageFilters.document_id || 'all');
  const [showFilters, setShowFilters] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<any>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilters();
  };

  const applyFilters = () => {
    router.get(route('document-management.versions.index'), {
      page: 1,
      search: searchTerm || undefined,
      document_id: selectedDocument !== 'all' ? selectedDocument : undefined,
      per_page: pageFilters.per_page
    }, { preserveState: true, preserveScroll: true });
  };

  const handleAction = (action: string, item: any) => {
    setCurrentItem(item);
    switch (action) {
      case 'delete':
        setIsDeleteModalOpen(true);
        break;
      case 'download':
         handleDownload(item);
        break;
      case 'restore':
        handleRestore(item);
        break;
    }
  };

  const handleDownload = (doc: any) => {
    const link = document.createElement('a');
    link.href = doc.file_path;
    link.download = doc.document_name;
    link.click();
  };

  const handleAddNew = () => {
    setCurrentItem(null);
    setIsFormModalOpen(true);
  };

  const handleRestore = (version: any) => {
    if (version.is_current) {
      toast.error(t('This version is already current'));
      return;
    }

    toast.loading(t('Restoring version...'));
    router.put(route('document-management.versions.restore', version.id), {}, {
      onSuccess: (page) => {
        toast.dismiss();
        if (page.props.flash.success) {
          toast.success(page.props.flash.success);
        }
      },
      onError: (errors) => {
        toast.dismiss();
        toast.error(`Failed to restore version: ${Object.values(errors).join(', ')}`);
      }
    });
  };

  const handleFormSubmit = (formData: any) => {
    toast.loading(t('Creating new version...'));

    router.post(route('document-management.versions.store'), formData, {
      onSuccess: (page) => {
        setIsFormModalOpen(false);
        toast.dismiss();
        if (page.props.flash.success) {
          toast.success(page.props.flash.success);
        }
      },
      onError: (errors) => {
        toast.dismiss();
        toast.error(`Failed to create version: ${Object.values(errors).join(', ')}`);
      }
    });
  };

  const handleDeleteConfirm = () => {
    toast.loading(t('Deleting version...'));
    router.delete(route('document-management.versions.destroy', currentItem.id), {
      onSuccess: (page) => {
        setIsDeleteModalOpen(false);
        toast.dismiss();
        if (page.props.flash.success) {
          toast.success(page.props.flash.success);
        }
      },
      onError: (errors) => {
        toast.dismiss();
        toast.error(`Failed to delete version: ${Object.values(errors).join(', ')}`);
      }
    });
  };

  const pageActions = [];
  if (hasPermission(permissions, 'create-document-versions')) {
    pageActions.push({
      label: t('New Version'),
      icon: <Plus className="h-4 w-4 mr-2" />,
      variant: 'default',
      onClick: () => handleAddNew()
    });
  }

  const breadcrumbs = [
    { title: t('Dashboard'), href: route('dashboard') },
    { title: t('Document Management') },
    { title: t('Versions') }
  ];

  const columns = [
    {
      key: 'document',
      label: t('Document'),
      render: (value: any) => (
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-gray-500" />
          <span className="font-medium">{value?.name}</span>
        </div>
      )
    },
    {
      key: 'version_number',
      label: t('Version'),
      render: (value: string, item: any) => (
        <div className="flex items-center gap-2">
          <span className="">{value}</span>
          {item.is_current && (
            <span className="inline-flex items-center rounded-md px-2 py-1 text-xs font-medium bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20">
              {t('Current')}
            </span>
          )}
        </div>
      )
    },
    {
      key: 'changes_description',
      label: t('Changes'),
      render: (value: string) => value || '-'
    },
    {
      key: 'creator',
      label: t('Created By'),
      render: (value: any) => value?.name || '-'
    },
    {
      key: 'created_at',
      label: t('Created'),
        type: 'date',
    }
  ];

  const actions = [
    {
      label: t('Download'),
      icon: 'Download',
      action: 'download',
      className: 'text-green-500',
      requiredPermission: 'download-document-versions'
    },
    {
      label: t('Restore'),
      icon: 'RotateCcw',
      action: 'restore',
      className: 'text-blue-500',
      requiredPermission: 'restore-document-versions',
      condition: (item: any) => !item.is_current
    },
    {
      label: t('Delete'),
      icon: 'Trash2',
      action: 'delete',
      className: 'text-red-500',
      requiredPermission: 'delete-document-versions',
      condition: (item: any) => !item.is_current
    }
  ];

  const documentOptions = [
    { value: 'all', label: t('All Documents') },
    ...(documents || []).map((doc: any) => ({ value: doc.id.toString(), label: doc.name }))
  ];

  return (
    <PageTemplate
      title={t("Document Versions")}
      url="/document-management/versions"
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
              name: 'document_id',
              label: t('Document'),
              type: 'select',
              value: selectedDocument,
              onChange: setSelectedDocument,
              options: documentOptions
            }
          ]}
          showFilters={showFilters}
          setShowFilters={setShowFilters}
          hasActiveFilters={() => searchTerm !== '' || selectedDocument !== 'all'}
          activeFilterCount={() => (searchTerm ? 1 : 0) + (selectedDocument !== 'all' ? 1 : 0)}
          onResetFilters={() => {
            setSearchTerm('');
            setSelectedDocument('all');
            setShowFilters(false);
            router.get(route('document-management.versions.index'), { page: 1, per_page: pageFilters.per_page });
          }}
          onApplyFilters={applyFilters}
          currentPerPage={pageFilters.per_page?.toString() || "10"}
          onPerPageChange={(value) => {
            router.get(route('document-management.versions.index'), {
              page: 1,
              per_page: parseInt(value),
              search: searchTerm || undefined,
              document_id: selectedDocument !== 'all' ? selectedDocument : undefined
            });
          }}
        />
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-lg shadow overflow-hidden">
        <CrudTable
          columns={columns}
          actions={actions}
          data={versions?.data || []}
          from={versions?.from || 1}
          onAction={handleAction}
          permissions={permissions}
          entityPermissions={{
            view: 'view-document-versions',
            create: 'create-document-versions',
            delete: 'delete-document-versions'
          }}
        />

        <Pagination
          from={versions?.from || 0}
          to={versions?.to || 0}
          total={versions?.total || 0}
          links={versions?.links}
          entityName={t("versions")}
          onPageChange={(url) => router.get(url)}
        />
      </div>

      <CrudFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSubmit={handleFormSubmit}
        formConfig={{
          fields: [
            { 
              name: 'document_id', 
              label: t('Document'), 
              type: 'select', 
              required: true,
              options: (documents || []).map((doc: any) => ({ value: doc.id, label: doc.name }))
            },
            { name: 'file', label: t('New File'), type: 'media-picker', required: true },
            { name: 'changes_description', label: t('Changes Description'), type: 'textarea', placeholder: 'Describe what changed in this version...' }
          ],
          modalSize: 'lg'
        }}
        initialData={null}
        title={t('Upload New Version')}
        mode="create"
      />

      <CrudDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        itemName={`Version ${currentItem?.version_number}` || ''}
        entityName="version"
      />
    </PageTemplate>
  );
}