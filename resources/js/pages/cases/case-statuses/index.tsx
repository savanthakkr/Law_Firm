import { CrudDeleteModal } from '@/components/CrudDeleteModal';
import { CrudFormModal } from '@/components/CrudFormModal';
import { CrudTable } from '@/components/CrudTable';
import { toast } from '@/components/custom-toast';
import { PageTemplate } from '@/components/page-template';
import { Pagination } from '@/components/ui/pagination';
import { SearchAndFilterBar } from '@/components/ui/search-and-filter-bar';
import { hasPermission } from '@/utils/authorization';
import { router, usePage } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function CaseStatuses() {
    const { t } = useTranslation();
    const { auth, caseStatuses, filters: pageFilters = {} } = usePage().props as any;
    const permissions = auth?.permissions || [];

    const [searchTerm, setSearchTerm] = useState(pageFilters.search || '');
    const [selectedStatus, setSelectedStatus] = useState(pageFilters.status || 'all');
    const [showFilters, setShowFilters] = useState(false);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState<any>(null);
    const [formMode, setFormMode] = useState<'create' | 'edit' | 'view'>('create');

    const hasActiveFilters = () => {
        return searchTerm !== '' || selectedStatus !== 'all';
    };

    const activeFilterCount = () => {
        return (searchTerm ? 1 : 0) + (selectedStatus !== 'all' ? 1 : 0);
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        applyFilters();
    };

    const applyFilters = () => {
        router.get(
            route('cases.case-statuses.index'),
            {
                page: 1,
                search: searchTerm || undefined,
                status: selectedStatus !== 'all' ? selectedStatus : undefined,
                per_page: pageFilters.per_page,
            },
            { preserveState: true, preserveScroll: true },
        );
    };
    useEffect(() => {
        const shouldOpen = localStorage.getItem('OPEN_CASE_STATUS_CREATE_MODAL');

        if (shouldOpen === '1') {
            setCurrentItem(null);
            setFormMode('create');
            setIsFormModalOpen(true);

            // prevent reopen on refresh
            localStorage.removeItem('OPEN_CASE_STATUS_CREATE_MODAL');
        }
    }, []);


    const handleSort = (field: string) => {
        const direction = pageFilters.sort_field === field && pageFilters.sort_direction === 'asc' ? 'desc' : 'asc';

        router.get(
            route('cases.case-statuses.index'),
            {
                sort_field: field,
                sort_direction: direction,
                page: 1,
                search: searchTerm || undefined,
                status: selectedStatus !== 'all' ? selectedStatus : undefined,
                per_page: pageFilters.per_page,
            },
            { preserveState: true, preserveScroll: true },
        );
    };

    const handleAction = (action: string, item: any) => {
        setCurrentItem(item);

        switch (action) {
            case 'view':
                setFormMode('view');
                setIsFormModalOpen(true);
                break;
            case 'edit':
                setFormMode('edit');
                setIsFormModalOpen(true);
                break;
            case 'delete':
                setIsDeleteModalOpen(true);
                break;
            case 'toggle-status':
                handleToggleStatus(item);
                break;
        }
    };

    const handleAddNew = () => {
        setCurrentItem(null);
        setFormMode('create');
        setIsFormModalOpen(true);
    };

    const handleFormSubmit = (formData: any) => {
        if (formMode === 'create') {
            toast.loading(t('Creating case status...'));

            router.post(route('cases.case-statuses.store'), formData, {
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
                    toast.error(`Failed to create case status: ${Object.values(errors).join(', ')}`);
                },
            });
        } else if (formMode === 'edit') {
            toast.loading(t('Updating case status...'));

            router.put(route('cases.case-statuses.update', currentItem.id), formData, {
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
                    toast.error(`Failed to update case status: ${Object.values(errors).join(', ')}`);
                },
            });
        }
    };

    const handleDeleteConfirm = () => {
        toast.loading(t('Deleting case status...'));

        router.delete(route('cases.case-statuses.destroy', currentItem.id), {
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
                toast.error(`Failed to delete case status: ${Object.values(errors).join(', ')}`);
            },
        });
    };

    const handleToggleStatus = (caseStatus: any) => {
        const newStatus = caseStatus.status === 'active' ? 'inactive' : 'active';
        toast.loading(`${newStatus === 'active' ? t('Activating') : t('Deactivating')} case status...`);

        router.put(
            route('cases.case-statuses.toggle-status', caseStatus.id),
            {},
            {
                onSuccess: (page) => {
                    toast.dismiss();
                    if (page.props.flash.success) {
                        toast.success(page.props.flash.success);
                    } else if (page.props.flash.error) {
                        toast.error(page.props.flash.error);
                    }
                },
                onError: (errors) => {
                    toast.dismiss();
                    toast.error(`Failed to update case status: ${Object.values(errors).join(', ')}`);
                },
            },
        );
    };

    const handleResetFilters = () => {
        setSearchTerm('');
        setSelectedStatus('all');
        setShowFilters(false);

        router.get(
            route('cases.case-statuses.index'),
            {
                page: 1,
                per_page: pageFilters.per_page,
            },
            { preserveState: true, preserveScroll: true },
        );
    };

    const pageActions = [];

    if (hasPermission(permissions, 'create-case-statuses')) {
        pageActions.push({
            label: t('Add Case Status'),
            icon: <Plus className="mr-2 h-4 w-4" />,
            variant: 'default',
            onClick: () => handleAddNew(),
        });
    }

    const breadcrumbs = [
        { title: t('Dashboard'), href: route('dashboard') },
        { title: t('Case Management'), href: route('cases.index') },
        { title: t('Case Statuses') },
    ];

    const columns = [
        {
            key: 'name',
            label: t('Name'),
            sortable: true,
        },
        {
            key: 'description',
            label: t('Description'),
            render: (value: string) => value || '-',
        },
        {
            key: 'color',
            label: t('Color'),
            render: (value: string) => (
                <div className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded border" style={{ backgroundColor: value }}></div>
                    <span className=" text-sm">{value}</span>
                </div>
            ),
        },

        {
            key: 'is_default',
            label: t('Default'),
            render: (value: boolean) => (
                <span
                    className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${value
                            ? 'bg-blue-50 text-blue-700 ring-1 ring-blue-600/20 ring-inset'
                            : 'bg-gray-50 text-gray-700 ring-1 ring-gray-600/20 ring-inset'
                        }`}
                >
                    {value ? t('Yes') : t('No')}
                </span>
            ),
        },
        {
            key: 'is_closed',
            label: t('Closed Status'),
            render: (value: boolean) => (
                <span
                    className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${value
                            ? 'bg-red-50 text-red-700 ring-1 ring-red-600/20 ring-inset'
                            : 'bg-green-50 text-green-700 ring-1 ring-green-600/20 ring-inset'
                        }`}
                >
                    {value ? t('Closed') : t('Open')}
                </span>
            ),
        },
        {
            key: 'status',
            label: t('Status'),
            render: (value: string) => (
                <span
                    className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${value === 'active'
                            ? 'bg-green-50 text-green-700 ring-1 ring-green-600/20 ring-inset'
                            : 'bg-red-50 text-red-700 ring-1 ring-red-600/20 ring-inset'
                        }`}
                >
                    {value === 'active' ? t('Active') : t('Inactive')}
                </span>
            ),
        },
    ];

    const actions = [
        {
            label: t('View'),
            icon: 'Eye',
            action: 'view',
            className: 'text-blue-500',
            requiredPermission: 'view-case-statuses',
        },
        {
            label: t('Edit'),
            icon: 'Edit',
            action: 'edit',
            className: 'text-amber-500',
            requiredPermission: 'edit-case-statuses',
        },
        {
            label: t('Toggle Status'),
            icon: 'Lock',
            action: 'toggle-status',
            className: 'text-amber-500',
            requiredPermission: 'edit-case-statuses',
        },
        {
            label: t('Delete'),
            icon: 'Trash2',
            action: 'delete',
            className: 'text-red-500',
            requiredPermission: 'delete-case-statuses',
        },
    ];

    return (
        <PageTemplate title={t('Case Statuses')} url="/cases/case-statuses" actions={pageActions} breadcrumbs={breadcrumbs} noPadding>
            <div className="mb-4 rounded-lg bg-white p-4 shadow dark:bg-gray-900">
                <SearchAndFilterBar
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                    onSearch={handleSearch}
                    filters={[
                        {
                            name: 'status',
                            label: t('Status'),
                            type: 'select',
                            value: selectedStatus,
                            onChange: setSelectedStatus,
                            options: [
                                { value: 'all', label: t('All Statuses') },
                                { value: 'active', label: t('Active') },
                                { value: 'inactive', label: t('Inactive') },
                            ],
                        },
                    ]}
                    showFilters={showFilters}
                    setShowFilters={setShowFilters}
                    hasActiveFilters={hasActiveFilters}
                    activeFilterCount={activeFilterCount}
                    onResetFilters={handleResetFilters}
                    onApplyFilters={applyFilters}
                    currentPerPage={pageFilters.per_page?.toString() || '10'}
                    onPerPageChange={(value) => {
                        router.get(
                            route('cases.case-statuses.index'),
                            {
                                page: 1,
                                per_page: parseInt(value),
                                search: searchTerm || undefined,
                                status: selectedStatus !== 'all' ? selectedStatus : undefined,
                            },
                            { preserveState: true, preserveScroll: true },
                        );
                    }}
                />
            </div>

            <div className="overflow-hidden rounded-lg bg-white shadow dark:bg-gray-900">
                <CrudTable
                    columns={columns}
                    actions={actions}
                    data={caseStatuses?.data || []}
                    from={caseStatuses?.from || 1}
                    onAction={handleAction}
                    sortField={pageFilters.sort_field}
                    sortDirection={pageFilters.sort_direction}
                    onSort={handleSort}
                    permissions={permissions}
                    entityPermissions={{
                        view: 'view-case-statuses',
                        create: 'create-case-statuses',
                        edit: 'edit-case-statuses',
                        delete: 'delete-case-statuses',
                    }}
                />

                <Pagination
                    from={caseStatuses?.from || 0}
                    to={caseStatuses?.to || 0}
                    total={caseStatuses?.total || 0}
                    links={caseStatuses?.links}
                    entityName={t('case statuses')}
                    onPageChange={(url) => router.get(url)}
                />
            </div>

            <CrudFormModal
                isOpen={isFormModalOpen}
                onClose={() => setIsFormModalOpen(false)}
                onSubmit={handleFormSubmit}
                formConfig={{
                    fields: [
                        { name: 'name', label: t('Name'), type: 'text', required: true },
                        { name: 'description', label: t('Description'), type: 'textarea' },
                        { name: 'color', label: t('Color'), type: 'color', defaultValue: '#10B981' },
                        { name: 'is_default', label: t('Default Status'), type: 'checkbox' },
                        { name: 'is_closed', label: t('Closed Status'), type: 'checkbox' },
                        {
                            name: 'status',
                            label: t('Status'),
                            type: 'select',
                            options: [
                                { value: 'active', label: 'Active' },
                                { value: 'inactive', label: 'Inactive' },
                            ],
                            defaultValue: 'active',
                        },
                    ],
                    modalSize: 'lg',
                }}
                initialData={currentItem}
                title={formMode === 'create' ? t('Add New Case Status') : formMode === 'edit' ? t('Edit Case Status') : t('View Case Status')}
                mode={formMode}
            />

            <CrudDeleteModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDeleteConfirm}
                itemName={currentItem?.name || ''}
                entityName="case status"
            />
        </PageTemplate>
    );
}
