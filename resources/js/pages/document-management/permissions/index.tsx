import { CrudDeleteModal } from '@/components/CrudDeleteModal';
import { CrudFormModal } from '@/components/CrudFormModal';
import { CrudTable } from '@/components/CrudTable';
import { PageTemplate } from '@/components/page-template';
import { Pagination } from '@/components/ui/pagination';
import { SearchAndFilterBar } from '@/components/ui/search-and-filter-bar';
import { hasPermission } from '@/utils/authorization';
import { router, usePage } from '@inertiajs/react';
import { Shield, Users, Clock } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from '@/components/custom-toast';

export default function DocumentPermissionsIndex() {
    const { t } = useTranslation();
    const { auth, permissions: permissionsData, documents, users, filters = {} } = usePage().props as any;
    const permissions = auth?.permissions || [];

    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [documentFilter, setDocumentFilter] = useState(filters.document_id || 'all');
    const [userFilter, setUserFilter] = useState(filters.user_id || 'all');
    const [typeFilter, setTypeFilter] = useState(filters.permission_type || 'all');
    const [showFilters, setShowFilters] = useState(false);

    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState<any>(null);
    const [formMode, setFormMode] = useState<'create' | 'edit' | 'view'>('create');

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
        }
    };

    const handleAddNew = () => {
        setCurrentItem(null);
        setFormMode('create');
        setIsFormModalOpen(true);
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        applyFilters();
    };

    const applyFilters = () => {
        router.get(route('document-management.permissions.index'), {
            page: 1,
            search: searchTerm || undefined,
            document_id: documentFilter !== 'all' ? documentFilter : undefined,
            user_id: userFilter !== 'all' ? userFilter : undefined,
            permission_type: typeFilter !== 'all' ? typeFilter : undefined,
            per_page: filters.per_page,
        }, { preserveState: true, preserveScroll: true });
    };

    const handleFormSubmit = (formData: any) => {
        const action = formMode === 'create' ? 'store' : 'update';
        const routeName = formMode === 'create' 
            ? 'document-management.permissions.store' 
            : 'document-management.permissions.update';

        toast.loading(t(`${formMode === 'create' ? 'Granting' : 'Updating'} permission...`));

        const method = formMode === 'create' ? 'post' : 'put';
        const url = formMode === 'create' ? route(routeName) : route(routeName, currentItem.id);

        router[method](url, formData, {
            onSuccess: () => {
                setIsFormModalOpen(false);
                toast.dismiss();
                toast.success(t(`Permission ${formMode === 'create' ? 'granted' : 'updated'} successfully`));
            },
            onError: (errors) => {
                toast.dismiss();
                toast.error(`Failed to ${action} permission: ${Object.values(errors).join(', ')}`);
            },
        });
    };

    const handleDeleteConfirm = () => {
        toast.loading(t('Revoking permission...'));
        router.delete(route('document-management.permissions.destroy', currentItem.id), {
            onSuccess: () => {
                setIsDeleteModalOpen(false);
                toast.dismiss();
                toast.success(t('Permission revoked successfully'));
            },
            onError: (errors) => {
                toast.dismiss();
                toast.error(`Failed to revoke permission: ${Object.values(errors).join(', ')}`);
            },
        });
    };

    const actions = [];
    if (hasPermission(permissions, 'create-document-permissions')) {
        actions.push({
            label: t('Grant Permission'),
            icon: <Users className="h-4 w-4 mr-2" />,
            variant: 'default',
            onClick: handleAddNew,
        });
    }

    const breadcrumbs = [
        { title: t('Dashboard'), href: route('dashboard') },
        { title: t('Document Management') },
        { title: t('Permissions') },
    ];

    const columns = [
        {
            key: 'document',
            label: t('Document'),
            render: (value: any) => (
                <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-blue-500" />
                    <span className="font-medium">{value?.name || '-'}</span>
                </div>
            ),
        },
        {
            key: 'user',
            label: t('User'),
            render: (value: any) => (
                <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                        <span className="text-xs font-semibold text-gray-600">
                            {value?.name?.charAt(0)?.toUpperCase()}
                        </span>
                    </div>
                    <div>
                        <p className="font-medium">{value?.name || '-'}</p>
                        <p className="text-xs text-gray-500">{value?.email || ''}</p>
                    </div>
                </div>
            ),
        },
        {
            key: 'permission_type',
            label: t('Access Level'),
            render: (value: string) => (
                <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium bg-gray-100 text-gray-800">
                    {t(value?.charAt(0).toUpperCase() + value?.slice(1))}
                </span>
            ),
        },
        {
            key: 'expires_at',
            label: t('Expires'),
            render: (value: string) => (
                <div className="flex items-center gap-2">
                    {value ? (
                        <>
                            <Clock className="h-4 w-4 text-gray-500" />
                            <span className="text-sm">{window.appSettings?.formatDate(value) || new Date(value).toLocaleDateString()}</span>
                        </>
                    ) : (
                        <span className="text-sm text-gray-500">{t('Permanent')}</span>
                    )}
                </div>
            ),
        },
        {
            key: 'created_at',
            label: t('Granted'),
        type: 'date',
        },
    ];

    const tableActions = [
        {
            label: t('View'),
            icon: 'Eye',
            action: 'view',
            className: 'text-blue-500',
            requiredPermission: 'view-document-permissions',
        },
        {
            label: t('Edit'),
            icon: 'Edit',
            action: 'edit',
            className: 'text-amber-500',
            requiredPermission: 'edit-document-permissions',
        },
        {
            label: t('Revoke'),
            icon: 'Trash2',
            action: 'delete',
            className: 'text-red-500',
            requiredPermission: 'delete-document-permissions',
        },
    ];

    return (
        <PageTemplate
            title={t('Document Permissions')}
            url="/document-management/permissions"
            actions={actions}
            breadcrumbs={breadcrumbs}
            noPadding
        >
            <div className="bg-white rounded-lg shadow mb-4 p-4">
                <SearchAndFilterBar
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                    onSearch={handleSearch}
                    filters={[
                        {
                            name: 'document_id',
                            label: t('Document'),
                            type: 'select',
                            value: documentFilter,
                            onChange: setDocumentFilter,
                            options: [
                                { value: 'all', label: t('All Documents') },
                                ...(documents || []).map((doc: any) => ({
                                    value: doc.id.toString(),
                                    label: doc.name
                                }))
                            ],
                        },
                        {
                            name: 'user_id',
                            label: t('User'),
                            type: 'select',
                            value: userFilter,
                            onChange: setUserFilter,
                            options: [
                                { value: 'all', label: t('All Users') },
                                ...(users || []).map((user: any) => ({
                                    value: user.id.toString(),
                                    label: user.name
                                }))
                            ],
                        },
                        {
                            name: 'permission_type',
                            label: t('Permission Type'),
                            type: 'select',
                            value: typeFilter,
                            onChange: setTypeFilter,
                            options: [
                                { value: 'all', label: t('All Types') },
                                { value: 'view', label: t('View') },
                                { value: 'edit', label: t('Edit') },
                                { value: 'download', label: t('Download') },
                                { value: 'comment', label: t('Comment') },
                            ],
                        },
                    ]}
                    showFilters={showFilters}
                    setShowFilters={setShowFilters}
                    hasActiveFilters={() => searchTerm !== '' || documentFilter !== 'all' || userFilter !== 'all' || typeFilter !== 'all'}
                    activeFilterCount={() => (searchTerm ? 1 : 0) + (documentFilter !== 'all' ? 1 : 0) + (userFilter !== 'all' ? 1 : 0) + (typeFilter !== 'all' ? 1 : 0)}
                    onResetFilters={() => {
                        setSearchTerm('');
                        setDocumentFilter('all');
                        setUserFilter('all');
                        setTypeFilter('all');
                        router.get(route('document-management.permissions.index'));
                    }}
                    onApplyFilters={applyFilters}
                    currentPerPage={filters.per_page?.toString() || '10'}
                    onPerPageChange={(value) => {
                        router.get(route('document-management.permissions.index'), {
                            ...filters,
                            per_page: parseInt(value),
                        });
                    }}
                />
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <CrudTable
                    columns={columns}
                    actions={tableActions}
                    data={permissionsData?.data || []}
                    from={permissionsData?.from || 1}
                    onAction={handleAction}
                    permissions={permissions}
                    entityPermissions={{
                        view: 'view-document-permissions',
                        create: 'create-document-permissions',
                        edit: 'edit-document-permissions',
                        delete: 'delete-document-permissions',
                    }}
                />

                <Pagination
                    from={permissionsData?.from || 0}
                    to={permissionsData?.to || 0}
                    total={permissionsData?.total || 0}
                    links={permissionsData?.links}
                    entityName={t('permissions')}
                    onPageChange={(url) => router.get(url)}
                />
            </div>

            {/* Create/Edit Modal */}
            <CrudFormModal
                isOpen={isFormModalOpen && formMode !== 'view'}
                onClose={() => setIsFormModalOpen(false)}
                onSubmit={handleFormSubmit}
                formConfig={{
                    fields: [
                        {
                            name: 'document_id',
                            label: t('Document'),
                            type: 'select',
                            required: true,
                            options: (documents || []).map((doc: any) => ({
                                value: doc.id,
                                label: doc.name
                            }))
                        },
                        {
                            name: 'user_id',
                            label: t('User'),
                            type: 'select',
                            required: true,
                            options: (users || []).map((user: any) => ({
                                value: user.id,
                                label: user.name
                            }))
                        },
                        {
                            name: 'permission_type',
                            label: t('Permission Type'),
                            type: 'select',
                            required: true,
                            options: [
                                { value: 'view', label: t('View') },
                                { value: 'edit', label: t('Edit') },
                                { value: 'download', label: t('Download') },
                                { value: 'comment', label: t('Comment') }
                            ]
                        },
                        {
                            name: 'expires_at',
                            label: t('Expires At'),
                            type: 'date'
                        }
                    ],
                    modalSize: 'lg'
                }}
                initialData={currentItem}
                title={formMode === 'create' ? t('Grant Permission') : t('Edit Permission')}
                mode={formMode}
            />

            {/* View Modal */}
            <CrudFormModal
                isOpen={isFormModalOpen && formMode === 'view'}
                onClose={() => setIsFormModalOpen(false)}
                onSubmit={() => {}}
                formConfig={{
                    fields: [
                        {
                            name: 'document',
                            label: t('Document'),
                            type: 'text',
                            render: () => (
                                <div className="flex items-center gap-2 rounded-md border bg-gray-50 p-2">
                                    <Shield className="h-4 w-4 text-blue-500" />
                                    <span className="font-medium">{currentItem?.document?.name || '-'}</span>
                                </div>
                            )
                        },
                        {
                            name: 'user',
                            label: t('User'),
                            type: 'text',
                            render: () => (
                                <div className="flex items-center gap-3 rounded-md border bg-gray-50 p-2">
                                    <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                                        <span className="text-xs font-semibold text-gray-600">
                                            {currentItem?.user?.name?.charAt(0)?.toUpperCase()}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="font-medium">{currentItem?.user?.name || '-'}</p>
                                        <p className="text-xs text-gray-500">{currentItem?.user?.email || ''}</p>
                                    </div>
                                </div>
                            )
                        },
                        {
                            name: 'permission_type',
                            label: t('Permission Type'),
                            type: 'text',
                            render: () => (
                                <div className="rounded-md border bg-gray-50 p-2">
                                    <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium bg-gray-100 text-gray-800">
                                        {t(currentItem?.permission_type?.charAt(0).toUpperCase() + currentItem?.permission_type?.slice(1))}
                                    </span>
                                </div>
                            )
                        },
                        {
                            name: 'expires_at',
                            label: t('Expires At'),
                            type: 'text',
                            render: () => (
                                <div className="flex items-center gap-2 rounded-md border bg-gray-50 p-2">
                                    {currentItem?.expires_at ? (
                                        <>
                                            <Clock className="h-4 w-4 text-gray-500" />
                                            <span className="text-sm">{window.appSettings?.formatDate(currentItem.expires_at) || new Date(currentItem.expires_at).toLocaleDateString()}</span>
                                        </>
                                    ) : (
                                        <span className="text-sm text-gray-500">{t('Permanent')}</span>
                                    )}
                                </div>
                            )
                        },
                        { name: 'created_at', label: t('Granted At'), type: 'text' },
                        { name: 'updated_at', label: t('Updated At'), type: 'text' }
                    ],
                    modalSize: 'lg'
                }}
                initialData={currentItem}
                title={t('View Permission')}
                mode="view"
            />

            <CrudDeleteModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDeleteConfirm}
                itemName="permission"
                entityName="permission"
            />
        </PageTemplate>
    );
}