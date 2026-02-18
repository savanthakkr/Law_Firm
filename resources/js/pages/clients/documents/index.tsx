import { useState } from 'react';
import { PageTemplate } from '@/components/page-template';
import { usePage, router } from '@inertiajs/react';
import { Plus, Download } from 'lucide-react';
import { hasPermission } from '@/utils/authorization';
import { CrudTable } from '@/components/CrudTable';
import { CrudFormModal } from '@/components/CrudFormModal';
import { CrudDeleteModal } from '@/components/CrudDeleteModal';
import { toast } from '@/components/custom-toast';
import { useTranslation } from 'react-i18next';
import { Pagination } from '@/components/ui/pagination';
import { SearchAndFilterBar } from '@/components/ui/search-and-filter-bar';

export default function ClientDocuments() {
  const { t } = useTranslation();
  const { auth, documents, clients, documentTypes, filters: pageFilters = {} } = usePage().props as any;
  const permissions = auth?.permissions || [];

  // State
  const [searchTerm, setSearchTerm] = useState(pageFilters.search || '');
  const [selectedClient, setSelectedClient] = useState(pageFilters.client_id || 'all');
  const [selectedType, setSelectedType] = useState(pageFilters.document_type_id || 'all');
  const [selectedStatus, setSelectedStatus] = useState(pageFilters.status || 'all');
  const [showFilters, setShowFilters] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<any>(null);
  const [formMode, setFormMode] = useState<'create' | 'edit' | 'view'>('create');

  // Check if any filters are active
  const hasActiveFilters = () => {
    return searchTerm !== '' || selectedClient !== 'all' || selectedType !== 'all' || selectedStatus !== 'all';
  };

  // Count active filters
  const activeFilterCount = () => {
    return (searchTerm ? 1 : 0) + (selectedClient !== 'all' ? 1 : 0) + (selectedType !== 'all' ? 1 : 0) + (selectedStatus !== 'all' ? 1 : 0);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilters();
  };

  const applyFilters = () => {
    router.get(route('clients.documents.index'), {
      page: 1,
      search: searchTerm || undefined,
      client_id: selectedClient !== 'all' ? selectedClient : undefined,
      document_type_id: selectedType !== 'all' ? selectedType : undefined,
      status: selectedStatus !== 'all' ? selectedStatus : undefined,
      per_page: pageFilters.per_page
    }, { preserveState: true, preserveScroll: true });
  };

  const handleSort = (field: string) => {
    const direction = pageFilters.sort_field === field && pageFilters.sort_direction === 'asc' ? 'desc' : 'asc';

    router.get(route('clients.documents.index'), {
      sort_field: field,
      sort_direction: direction,
      page: 1,
      search: searchTerm || undefined,
      client_id: selectedClient !== 'all' ? selectedClient : undefined,
      document_type_id: selectedType !== 'all' ? selectedType : undefined,
      status: selectedStatus !== 'all' ? selectedStatus : undefined,
      per_page: pageFilters.per_page
    }, { preserveState: true, preserveScroll: true });
  };

  const handleAction = (action: string, item: any) => {
    setCurrentItem(item);

    switch (action) {
      case 'view':
        setFormMode('view');
        setIsViewModalOpen(true);
        break;
      case 'edit':
        setFormMode('edit');
        setIsFormModalOpen(true);
        break;
      case 'delete':
        setIsDeleteModalOpen(true);
        break;
      case 'download':
        handleDownload(item);
        break;
    }
  };

  const handleAddNew = () => {
    setCurrentItem(null);
    setFormMode('create');
    setIsFormModalOpen(true);
  };

  const handleDownload = (doc: any) => {
    const link = document.createElement('a');
    link.href = doc.file_path;
    link.download = doc.document_name;
    link.click();
  };

  const handleFormSubmit = (formData: any) => {
    if (formMode === 'create') {
      toast.loading(t('Uploading document...'));

      router.post(route('clients.documents.store'), formData, {
        onSuccess: (page) => {
          setIsFormModalOpen(false);
          toast.dismiss();
          if (page.props.flash.success) {
            toast.success(page.props.flash.success);
          } else if (page.props.flash.error) {
            toast.error(page.props.flash.error);
          }
        },
        onError: (errors) => {
          toast.dismiss();
          if (typeof errors === 'string') {
            toast.error(errors);
          } else {
            toast.error(`Failed to upload document: ${Object.values(errors).join(', ')}`);
          }
        }
      });
    } else if (formMode === 'edit') {
      toast.loading(t('Updating document...'));

      router.post(route('clients.documents.update', currentItem.id), {
        ...formData,
        _method: 'PUT'
      }, {
        onSuccess: (page) => {
          setIsFormModalOpen(false);
          toast.dismiss();
          if (page.props.flash.success) {
            toast.success(page.props.flash.success);
          } else if (page.props.flash.error) {
            toast.error(page.props.flash.error);
          }
        },
        onError: (errors) => {
          toast.dismiss();
          if (typeof errors === 'string') {
            toast.error(errors);
          } else {
            toast.error(`Failed to update document: ${Object.values(errors).join(', ')}`);
          }
        }
      });
    }
  };

  const handleDeleteConfirm = () => {
    toast.loading(t('Deleting document...'));

    router.delete(route('clients.documents.destroy', currentItem.id), {
      onSuccess: (page) => {
        setIsDeleteModalOpen(false);
        toast.dismiss();
        if (page.props.flash.success) {
          toast.success(page.props.flash.success);
        } else if (page.props.flash.error) {
          toast.error(page.props.flash.error);
        }
      },
      onError: (errors) => {
        toast.dismiss();
        if (typeof errors === 'string') {
          toast.error(errors);
        } else {
          toast.error(`Failed to delete document: ${Object.values(errors).join(', ')}`);
        }
      }
    });
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedClient('all');
    setSelectedType('all');
    setSelectedStatus('all');
    setShowFilters(false);

    router.get(route('clients.documents.index'), {
      page: 1,
      per_page: pageFilters.per_page
    }, { preserveState: true, preserveScroll: true });
  };

  // Define page actions
  const pageActions = [];

  // Add the "Upload Document" button if user has permission
  if (hasPermission(permissions, 'create-client-documents')) {
    pageActions.push({
      label: t('Upload Document'),
      icon: <Plus className="h-4 w-4 mr-2" />,
      variant: 'default',
      onClick: () => handleAddNew()
    });
  }

  const breadcrumbs = [
    { title: t('Dashboard'), href: route('dashboard') },
    { title: t('Client Management'), href: route('clients.index') },
    { title: t('Documents') }
  ];

  // Define table columns
  const columns = [
    {
      key: 'client',
      label: t('Client'),
      render: (value: any, row: any) => {
        return row.client?.name || '-';
      }
    },
    {
      key: 'document_name',
      label: t('Document Name'),
      sortable: true
    },
    {
      key: 'document_type_id',
      label: t('Type'),
      render: (value: string, row: any) => {
        const docType = row.document_type;
        return docType ? (
          <span 
            className="inline-flex items-center rounded-md px-2 py-1 text-xs font-medium"
            style={{ 
              backgroundColor: `${docType.color}20`, 
              color: docType.color 
            }}
          >
            {docType.name}
          </span>
        ) : '-';
      }
    },

    {
      key: 'status',
      label: t('Status'),
      render: (value: string) => {
        const statusColors = {
          active: 'bg-green-50 text-green-700 ring-green-600/20',
          archived: 'bg-gray-50 text-gray-700 ring-gray-600/20'
        };
        return (
          <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${statusColors[value as keyof typeof statusColors] || 'bg-gray-50 text-gray-700 ring-gray-600/20'}`}>
            {value.charAt(0).toUpperCase() + value.slice(1)}
          </span>
        );
      }
    },
    {
      key: 'created_at',
      label: t('Uploaded'),
      sortable: true,
      type: 'date',
    }
  ];

  // Define table actions
  const actions = [
    {
      label: t('Download'),
      icon: 'Download',
      action: 'download',
      className: 'text-blue-500',
      requiredPermission: 'download-client-documents'
    },
    {
      label: t('View'),
      icon: 'Eye',
      action: 'view',
      className: 'text-blue-500',
      requiredPermission: 'view-client-documents'
    },
    {
      label: t('Edit'),
      icon: 'Edit',
      action: 'edit',
      className: 'text-amber-500',
      requiredPermission: 'edit-client-documents'
    },
    {
      label: t('Delete'),
      icon: 'Trash2',
      action: 'delete',
      className: 'text-red-500',
      requiredPermission: 'delete-client-documents'
    }
  ];

  // Prepare options for filters and form
  const clientOptions = [
    { value: 'all', label: t('All Clients') },
    ...(clients || []).map((client: any) => ({
      value: client.id.toString(),
      label: client.name
    }))
  ];

  const typeOptions = [
    { value: 'all', label: t('All Types') },
    ...(documentTypes || []).map((type: any) => ({
      value: type.id.toString(),
      label: type.name
    }))
  ];

  const statusOptions = [
    { value: 'all', label: t('All Statuses') },
    { value: 'active', label: t('Active') },
    { value: 'archived', label: t('Archived') }
  ];

  return (
    <PageTemplate
      title={t("Client Documents")}
      url="/clients/documents"
      actions={pageActions}
      breadcrumbs={breadcrumbs}
      noPadding
    >
      {/* Search and filters section */}
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow mb-4 p-4">
        <SearchAndFilterBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onSearch={handleSearch}
          filters={[
            {
              name: 'client_id',
              label: t('Client'),
              type: 'select',
              value: selectedClient,
              onChange: setSelectedClient,
              options: clientOptions
            },
            {
              name: 'document_type_id',
              label: t('Type'),
              type: 'select',
              value: selectedType,
              onChange: setSelectedType,
              options: typeOptions
            },
            {
              name: 'status',
              label: t('Status'),
              type: 'select',
              value: selectedStatus,
              onChange: setSelectedStatus,
              options: statusOptions
            }
          ]}
          showFilters={showFilters}
          setShowFilters={setShowFilters}
          hasActiveFilters={hasActiveFilters}
          activeFilterCount={activeFilterCount}
          onResetFilters={handleResetFilters}
          onApplyFilters={applyFilters}
          currentPerPage={pageFilters.per_page?.toString() || "10"}
          onPerPageChange={(value) => {
            router.get(route('clients.documents.index'), {
              page: 1,
              per_page: parseInt(value),
              search: searchTerm || undefined,
              client_id: selectedClient !== 'all' ? selectedClient : undefined,
              document_type_id: selectedType !== 'all' ? selectedType : undefined,
              status: selectedStatus !== 'all' ? selectedStatus : undefined
            }, { preserveState: true, preserveScroll: true });
          }}
        />
      </div>

      {/* Content section */}
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow overflow-hidden">
        <CrudTable
          columns={columns}
          actions={actions}
          data={documents?.data || []}
          from={documents?.from || 1}
          onAction={handleAction}
          sortField={pageFilters.sort_field}
          sortDirection={pageFilters.sort_direction}
          onSort={handleSort}
          permissions={permissions}
          entityPermissions={{
            view: 'view-client-documents',
            create: 'create-client-documents',
            edit: 'edit-client-documents',
            delete: 'delete-client-documents'
          }}
        />

        {/* Pagination section */}
        <Pagination
          from={documents?.from || 0}
          to={documents?.to || 0}
          total={documents?.total || 0}
          links={documents?.links}
          entityName={t("documents")}
          onPageChange={(url) => router.get(url)}
        />
      </div>

      {/* Form Modal */}
      <CrudFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSubmit={handleFormSubmit}
        formConfig={{
          fields: [
            {
              name: 'client_id',
              label: t('Client'),
              type: 'select',
              required: true,
              options: clients ? clients.map((client: any) => ({
                value: client.id.toString(),
                label: client.name
              })) : []
            },
            { name: 'document_name', label: t('Document Name'), type: 'text', required: true },
            {
              name: 'document_type_id',
              label: t('Document Type'),
              type: 'select',
              required: true,
              options: documentTypes ? documentTypes.map((type: any) => ({
                value: type.id.toString(),
                label: type.name
              })) : []
            },
            { 
              name: 'file', 
              label: t('File'), 
              type: 'media-picker', 
              required: formMode === 'create'
            },
            { name: 'description', label: t('Description'), type: 'textarea' },
            {
              name: 'status',
              label: t('Status'),
              type: 'select',
              options: [
                { value: 'active', label: t('Active') },
                { value: 'archived', label: t('Archived') }
              ],
              defaultValue: 'active'
            }
          ],
          modalSize: 'xl'
        }}
        initialData={{
          ...currentItem,
          file: currentItem?.file_path ? `${currentItem.file_path}` : null
        }}
        title={
          formMode === 'create'
            ? t('Upload New Document')
            : t('Edit Document')
        }
        mode={formMode}
      />

      {/* View Modal */}
      <CrudFormModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        onSubmit={() => {}}
        formConfig={{
          fields: [
            {
              name: 'client_id',
              label: t('Client'),
              type: 'select',
              options: clients ? clients.map((client: any) => ({
                value: client.id.toString(),
                label: client.name
              })) : []
            },
            { name: 'document_name', label: t('Document Name'), type: 'text' },
            {
              name: 'document_type_id',
              label: t('Document Type'),
              type: 'select',
              options: documentTypes ? documentTypes.map((type: any) => ({
                value: type.id.toString(),
                label: type.name
              })) : []
            },
            { name: 'description', label: t('Description'), type: 'textarea' },
            {
              name: 'status',
              label: t('Status'),
              type: 'select',
              options: [
                { value: 'active', label: t('Active') },
                { value: 'archived', label: t('Archived') }
              ]
            },
            { name: 'created_at', label: t('Created Date'), type: 'text' }
          ],
          modalSize: 'xl'
        }}
        initialData={{
          ...currentItem,
          client_id: currentItem?.client?.name || '',
          document_type_id: currentItem?.document_type?.name || '',
          created_at: currentItem?.created_at ? (window.appSettings?.formatDate(currentItem.created_at) || new Date(currentItem.created_at).toLocaleDateString()) : ''
        }}
        title={t('View Document')}
        mode="view"
      />

      {/* Delete Modal */}
      <CrudDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        itemName={currentItem?.document_name || ''}
        entityName="document"
      />
    </PageTemplate>
  );
}