import { CrudDeleteModal } from '@/components/CrudDeleteModal';
import { CrudFormModal } from '@/components/CrudFormModal';
import { CrudTable } from '@/components/CrudTable';
import { PageTemplate } from '@/components/page-template';
import { Pagination } from '@/components/ui/pagination';
import { SearchAndFilterBar } from '@/components/ui/search-and-filter-bar';
import { hasPermission } from '@/utils/authorization';
import { router, usePage } from '@inertiajs/react';
import { MessageSquare, CheckCircle, XCircle, Plus } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from '@/components/custom-toast';

export default function DocumentCommentsIndex() {
    const { t } = useTranslation();
    const { auth, comments, documents, filters = {} } = usePage().props as any;
    const permissions = auth?.permissions || [];

    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [documentFilter, setDocumentFilter] = useState(filters.document_id || 'all');
    const [statusFilter, setStatusFilter] = useState(filters.status || 'all');
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
            case 'toggle-resolve':
                handleToggleResolve(item);
                break;
        }
    };

    const handleAddNew = () => {
        setCurrentItem(null);
        setFormMode('create');
        setIsFormModalOpen(true);
    };

    const handleToggleResolve = (comment: any) => {
        const action = comment.is_resolved ? 'Reopening' : 'Resolving';
        toast.loading(t(`${action} comment...`));

        router.put(route('document-management.comments.toggle-resolve', comment.id), {}, {
            onSuccess: () => {
                toast.dismiss();
                toast.success(t('Comment status updated'));
            },
            onError: (errors) => {
                toast.dismiss();
                toast.error(`Failed to update comment: ${Object.values(errors).join(', ')}`);
            },
        });
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        applyFilters();
    };

    const applyFilters = () => {
        router.get(route('document-management.comments.index'), {
            page: 1,
            search: searchTerm || undefined,
            document_id: documentFilter !== 'all' ? documentFilter : undefined,
            status: statusFilter !== 'all' ? statusFilter : undefined,
            per_page: filters.per_page,
        }, { preserveState: true, preserveScroll: true });
    };

    const handleFormSubmit = (formData: any) => {
        const action = formMode === 'create' ? 'store' : 'update';
        const routeName = formMode === 'create' 
            ? 'document-management.comments.store' 
            : 'document-management.comments.update';

        toast.loading(t(`${formMode === 'create' ? 'Adding' : 'Updating'} comment...`));

        const method = formMode === 'create' ? 'post' : 'put';
        const url = formMode === 'create' ? route(routeName) : route(routeName, currentItem.id);

        router[method](url, formData, {
            onSuccess: () => {
                setIsFormModalOpen(false);
                toast.dismiss();
                toast.success(t(`Comment ${formMode === 'create' ? 'added' : 'updated'} successfully`));
            },
            onError: (errors) => {
                toast.dismiss();
                toast.error(`Failed to ${action} comment: ${Object.values(errors).join(', ')}`);
            },
        });
    };

    const handleDeleteConfirm = () => {
        toast.loading(t('Deleting comment...'));
        router.delete(route('document-management.comments.destroy', currentItem.id), {
            onSuccess: () => {
                setIsDeleteModalOpen(false);
                toast.dismiss();
                toast.success(t('Comment deleted successfully'));
            },
            onError: (errors) => {
                toast.dismiss();
                toast.error(`Failed to delete comment: ${Object.values(errors).join(', ')}`);
            },
        });
    };

    const actions = [];
    if (hasPermission(permissions, 'create-document-comments')) {
        actions.push({
            label: t('Add Comment'),
            icon: <Plus className="h-4 w-4 mr-2" />,
            variant: 'default',
            onClick: handleAddNew,
        });
    }

    const breadcrumbs = [
        { title: t('Dashboard'), href: route('dashboard') },
        { title: t('Document Management') },
        { title: t('Comments') },
    ];

    const columns = [
        {
            key: 'document',
            label: t('Document'),
            render: (value: any) => (
                <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-blue-500" />
                    <span className="font-medium">{value?.name || '-'}</span>
                </div>
            ),
        },
        {
            key: 'comment_text',
            label: t('Comment'),
            render: (value: string) => (
                <div className="max-w-md truncate" title={value}>
                    {value}
                </div>
            ),
        },
        {
            key: 'is_resolved',
            label: t('Status'),
            render: (value: boolean) => (
                <div className="flex items-center gap-2">
                    {value ? (
                        <>
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700">
                                {t('Resolved')}
                            </span>
                        </>
                    ) : (
                        <>
                            <XCircle className="h-4 w-4 text-orange-500" />
                            <span className="inline-flex items-center rounded-md bg-orange-50 px-2 py-1 text-xs font-medium text-orange-700">
                                {t('Open')}
                            </span>
                        </>
                    )}
                </div>
            ),
        },
        {
            key: 'creator',
            label: t('Author'),
            render: (value: any) => (
                <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-full bg-gray-300 flex items-center justify-center">
                        <span className="text-xs font-medium text-gray-600">
                            {value?.name?.charAt(0)?.toUpperCase()}
                        </span>
                    </div>
                    <span className="text-sm font-medium">{value?.name || '-'}</span>
                </div>
            ),
        },
        {
            key: 'created_at',
            label: t('Created'),
        type: 'date',
        },
    ];

    const tableActions = [
        {
            label: t('View'),
            icon: 'Eye',
            action: 'view',
            className: 'text-blue-500',
            requiredPermission: 'view-document-comments',
        },
        {
            label: t('Edit'),
            icon: 'Edit',
            action: 'edit',
            className: 'text-amber-500',
            requiredPermission: 'edit-document-comments',
        },
        {
            label: t('Toggle Resolve'),
            icon: 'CheckCircle',
            action: 'toggle-resolve',
            className: 'text-green-500',
            requiredPermission: 'resolve-document-comments',
        },
        {
            label: t('Delete'),
            icon: 'Trash2',
            action: 'delete',
            className: 'text-red-500',
            requiredPermission: 'delete-document-comments',
        },
    ];

    return (
        <PageTemplate
            title={t('Document Comments')}
            url="/document-management/comments"
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
                            name: 'status',
                            label: t('Status'),
                            type: 'select',
                            value: statusFilter,
                            onChange: setStatusFilter,
                            options: [
                                { value: 'all', label: t('All Status') },
                                { value: 'open', label: t('Open') },
                                { value: 'resolved', label: t('Resolved') },
                            ],
                        },
                    ]}
                    showFilters={showFilters}
                    setShowFilters={setShowFilters}
                    hasActiveFilters={() => searchTerm !== '' || documentFilter !== 'all' || statusFilter !== 'all'}
                    activeFilterCount={() => (searchTerm ? 1 : 0) + (documentFilter !== 'all' ? 1 : 0) + (statusFilter !== 'all' ? 1 : 0)}
                    onResetFilters={() => {
                        setSearchTerm('');
                        setDocumentFilter('all');
                        setStatusFilter('all');
                        router.get(route('document-management.comments.index'));
                    }}
                    onApplyFilters={applyFilters}
                    currentPerPage={filters.per_page?.toString() || '10'}
                    onPerPageChange={(value) => {
                        router.get(route('document-management.comments.index'), {
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
                    data={comments?.data || []}
                    from={comments?.from || 1}
                    onAction={handleAction}
                    permissions={permissions}
                    entityPermissions={{
                        view: 'view-document-comments',
                        create: 'create-document-comments',
                        edit: 'edit-document-comments',
                        delete: 'delete-document-comments',
                        'toggle-resolve': 'resolve-document-comments',
                    }}
                />

                <Pagination
                    from={comments?.from || 0}
                    to={comments?.to || 0}
                    total={comments?.total || 0}
                    links={comments?.links}
                    entityName={t('comments')}
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
                            name: 'comment_text',
                            label: t('Comment'),
                            type: 'textarea',
                            required: true,
                            rows: 4
                        }
                    ],
                    modalSize: 'lg'
                }}
                initialData={currentItem}
                title={formMode === 'create' ? t('Add New Comment') : t('Edit Comment')}
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
                                    <MessageSquare className="h-4 w-4 text-blue-500" />
                                    <span className="font-medium">{currentItem?.document?.name || '-'}</span>
                                </div>
                            )
                        },
                        {
                            name: 'comment_text',
                            label: t('Comment'),
                            type: 'text',
                            render: () => (
                                <div className="rounded-md border bg-gray-50 p-3">
                                    <p className="text-sm whitespace-pre-wrap">{currentItem?.comment_text || '-'}</p>
                                </div>
                            )
                        },
                        {
                            name: 'status',
                            label: t('Status'),
                            type: 'text',
                            render: () => (
                                <div className="rounded-md border bg-gray-50 p-2">
                                    <div className="flex items-center gap-2">
                                        {currentItem?.is_resolved ? (
                                            <>
                                                <CheckCircle className="h-4 w-4 text-green-500" />
                                                <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700">
                                                    {t('Resolved')}
                                                </span>
                                            </>
                                        ) : (
                                            <>
                                                <XCircle className="h-4 w-4 text-orange-500" />
                                                <span className="inline-flex items-center rounded-md bg-orange-50 px-2 py-1 text-xs font-medium text-orange-700">
                                                    {t('Open')}
                                                </span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            )
                        },
                        {
                            name: 'creator',
                            label: t('Author'),
                            type: 'text',
                            render: () => (
                                <div className="flex items-center gap-2 rounded-md border bg-gray-50 p-2">
                                    <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                                        <span className="text-xs font-semibold text-gray-600">
                                            {currentItem?.creator?.name?.charAt(0)?.toUpperCase()}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="font-medium">{currentItem?.creator?.name || '-'}</p>
                                        <p className="text-xs text-gray-500">{currentItem?.creator?.email || ''}</p>
                                    </div>
                                </div>
                            )
                        },
                        { name: 'created_at', label: t('Created At'), type: 'text' },
                        { name: 'updated_at', label: t('Updated At'), type: 'text' }
                    ],
                    modalSize: 'lg'
                }}
                initialData={currentItem}
                title={t('View Comment')}
                mode="view"
            />

            <CrudDeleteModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDeleteConfirm}
                itemName={currentItem?.comment_text || 'comment'}
                entityName="comment"
            />
        </PageTemplate>
    );
}