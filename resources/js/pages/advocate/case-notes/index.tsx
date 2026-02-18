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
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function CaseNotes() {
    const { t } = useTranslation();
    const { auth, caseNotes, cases, filters: pageFilters = {} } = usePage().props as any;
    const permissions = auth?.permissions || [];

    const [searchTerm, setSearchTerm] = useState(pageFilters.search || '');
    const [selectedNoteType, setSelectedNoteType] = useState(pageFilters.note_type || 'all');
    const [selectedPriority, setSelectedPriority] = useState(pageFilters.priority || 'all');
    const [selectedStatus, setSelectedStatus] = useState(pageFilters.status || 'all');
    const [showFilters, setShowFilters] = useState(false);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState<any>(null);
    const [formMode, setFormMode] = useState<'create' | 'edit' | 'view'>('create');

    const hasActiveFilters = () => {
        return searchTerm !== '' || selectedNoteType !== 'all' || selectedPriority !== 'all' || selectedStatus !== 'all';
    };

    const activeFilterCount = () => {
        return (
            (searchTerm ? 1 : 0) + (selectedNoteType !== 'all' ? 1 : 0) + (selectedPriority !== 'all' ? 1 : 0) + (selectedStatus !== 'all' ? 1 : 0)
        );
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        applyFilters();
    };

    const applyFilters = () => {
        router.get(
            route('advocate.case-notes.index'),
            {
                page: 1,
                search: searchTerm || undefined,
                note_type: selectedNoteType !== 'all' ? selectedNoteType : undefined,
                priority: selectedPriority !== 'all' ? selectedPriority : undefined,
                status: selectedStatus !== 'all' ? selectedStatus : undefined,
                per_page: pageFilters.per_page,
            },
            { preserveState: true, preserveScroll: true },
        );
    };

    const handleSort = (field: string) => {
        const direction = pageFilters.sort_field === field && pageFilters.sort_direction === 'asc' ? 'desc' : 'asc';
        router.get(
            route('advocate.case-notes.index'),
            {
                sort_field: field,
                sort_direction: direction,
                page: 1,
                search: searchTerm || undefined,
                note_type: selectedNoteType !== 'all' ? selectedNoteType : undefined,
                priority: selectedPriority !== 'all' ? selectedPriority : undefined,
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
        }
    };

    const handleAddNew = () => {
        setCurrentItem(null);
        setFormMode('create');
        setIsFormModalOpen(true);
    };

    const handleFormSubmit = (formData: any) => {
        if (formMode === 'create') {
            toast.loading(t('Creating case note...'));
            router.post(route('advocate.case-notes.store'), formData, {
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
                        toast.error(`Failed to create case note: ${Object.values(errors).join(', ')}`);
                    }
                },
            });
        } else if (formMode === 'edit') {
            toast.loading(t('Updating case note...'));
            router.put(route('advocate.case-notes.update', currentItem.id), formData, {
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
                        toast.error(`Failed to update case note: ${Object.values(errors).join(', ')}`);
                    }
                },
            });
        }
    };

    const handleDeleteConfirm = () => {
        toast.loading(t('Deleting case note...'));
        router.delete(route('advocate.case-notes.destroy', currentItem.id), {
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
                    toast.error(`Failed to delete case note: ${Object.values(errors).join(', ')}`);
                }
            },
        });
    };

    const handleResetFilters = () => {
        setSearchTerm('');
        setSelectedNoteType('all');
        setSelectedPriority('all');
        setSelectedStatus('all');
        setShowFilters(false);
        router.get(
            route('advocate.case-notes.index'),
            {
                page: 1,
                per_page: pageFilters.per_page,
            },
            { preserveState: true, preserveScroll: true },
        );
    };

    const pageActions = [];
    if (hasPermission(permissions, 'create-case-notes')) {
        pageActions.push({
            label: t('Add Case Note'),
            icon: <Plus className="mr-2 h-4 w-4" />,
            variant: 'default',
            onClick: () => handleAddNew(),
        });
    }

    const breadcrumbs = [
        { title: t('Dashboard'), href: route('dashboard') },
        { title: t('Advocate'), href: route('advocate.company-profiles.index') },
        { title: t('Case Notes') },
    ];

    const columns = [
        { key: 'note_id', label: t('Note ID'), sortable: true },
        { key: 'title', label: t('Title'), sortable: true },
        {
            key: 'note_type',
            label: t('Type'),
            render: (value: string) => {
                const types = {
                    general: t('General'),
                    meeting: t('Meeting'),
                    research: t('Research'),
                    strategy: t('Strategy'),
                    client_communication: t('Client Communication'),
                    court_appearance: t('Court Appearance'),
                };
                return types[value as keyof typeof types] || value;
            },
        },
        {
            key: 'priority',
            label: t('Priority'),
            render: (value: string) => {
                const priorities = {
                    low: { label: t('Low'), class: 'bg-gray-50 text-gray-700 ring-gray-600/20' },
                    medium: { label: t('Medium'), class: 'bg-blue-50 text-blue-700 ring-blue-600/20' },
                    high: { label: t('High'), class: 'bg-orange-50 text-orange-700 ring-orange-600/20' },
                    urgent: { label: t('Urgent'), class: 'bg-red-50 text-red-700 ring-red-600/20' },
                };
                const priority = priorities[value as keyof typeof priorities];
                return (
                    <span
                        className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${priority?.class || 'bg-gray-50 text-gray-700 ring-gray-600/20'}`}
                    >
                        {priority?.label || value}
                    </span>
                );
            },
        },
        {
            key: 'is_private',
            label: t('Privacy'),
            render: (value: boolean) => (
                <span
                    className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${
                        value
                            ? 'bg-red-50 text-red-700 ring-1 ring-red-600/20 ring-inset'
                            : 'bg-green-50 text-green-700 ring-1 ring-green-600/20 ring-inset'
                    }`}
                >
                    {value ? t('Private') : t('Public')}
                </span>
            ),
        },
        {
            key: 'tags',
            label: t('Tags'),
            render: (value: string[]) => {
                if (!value || !Array.isArray(value) || value.length === 0) return '-';
                return (
                    <div className="flex flex-wrap gap-1">
                        {value.slice(0, 2).map((tag, index) => (
                            <span
                                key={index}
                                className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-blue-700/10 ring-inset"
                            >
                                {tag}
                            </span>
                        ))}
                        {value.length > 2 && <span className="text-xs text-gray-500">+{value.length - 2}</span>}
                    </div>
                );
            },
        },
        {
            key: 'case_ids',
            label: t('Related Cases'),
            render: (value: string[], row: any) => {
                if (!value || value.length === 0) return '-';
                const relatedCases = cases?.filter((caseItem: any) => value.includes(caseItem.id.toString())) || [];
                return (
                    <div className="flex flex-wrap gap-1">
                        {relatedCases.slice(0, 2).map((caseItem: any, index: number) => (
                            <span
                                key={index}
                                className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-green-700/10 ring-inset"
                            >
                                {caseItem.case_id}
                            </span>
                        ))}
                        {relatedCases.length > 2 && <span className="text-xs text-gray-500">+{relatedCases.length - 2}</span>}
                    </div>
                );
            },
        },
        {
            key: 'status',
            label: t('Status'),
            render: (value: string) => (
                <span
                    className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${
                        value === 'active'
                            ? 'bg-green-50 text-green-700 ring-1 ring-green-600/20 ring-inset'
                            : 'bg-gray-50 text-gray-700 ring-1 ring-gray-600/20 ring-inset'
                    }`}
                >
                    {value === 'active' ? t('Active') : t('Archived')}
                </span>
            ),
        },
        {
            key: 'created_at',
            label: t('Created At'),
            sortable: true,
        type: 'date',
        },
    ];

    const actions = [
        { label: t('View'), icon: 'Eye', action: 'view', className: 'text-blue-500', requiredPermission: 'view-case-notes' },
        { label: t('Edit'), icon: 'Edit', action: 'edit', className: 'text-amber-500', requiredPermission: 'edit-case-notes' },
        { label: t('Delete'), icon: 'Trash2', action: 'delete', className: 'text-red-500', requiredPermission: 'delete-case-notes' },
    ];

    const noteTypeOptions = [
        { value: 'all', label: t('All Types') },
        { value: 'general', label: t('General') },
        { value: 'meeting', label: t('Meeting') },
        { value: 'research', label: t('Research') },
        { value: 'strategy', label: t('Strategy') },
        { value: 'client_communication', label: t('Client Communication') },
        { value: 'court_appearance', label: t('Court Appearance') },
    ];

    const priorityOptions = [
        { value: 'all', label: t('All Priorities') },
        { value: 'low', label: t('Low') },
        { value: 'medium', label: t('Medium') },
        { value: 'high', label: t('High') },
        { value: 'urgent', label: t('Urgent') },
    ];

    const statusOptions = [
        { value: 'all', label: t('All Statuses') },
        { value: 'active', label: t('Active') },
        { value: 'archived', label: t('Archived') },
    ];

    return (
        <PageTemplate title={t('Case Notes')} url="/advocate/case-notes" actions={pageActions} breadcrumbs={breadcrumbs} noPadding>
            <div className="mb-4 rounded-lg bg-white p-4 shadow dark:bg-gray-900">
                <SearchAndFilterBar
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                    onSearch={handleSearch}
                    filters={[
                        {
                            name: 'note_type',
                            label: t('Note Type'),
                            type: 'select',
                            value: selectedNoteType,
                            onChange: setSelectedNoteType,
                            options: noteTypeOptions,
                        },
                        {
                            name: 'priority',
                            label: t('Priority'),
                            type: 'select',
                            value: selectedPriority,
                            onChange: setSelectedPriority,
                            options: priorityOptions,
                        },
                        {
                            name: 'status',
                            label: t('Status'),
                            type: 'select',
                            value: selectedStatus,
                            onChange: setSelectedStatus,
                            options: statusOptions,
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
                            route('advocate.case-notes.index'),
                            {
                                page: 1,
                                per_page: parseInt(value),
                                search: searchTerm || undefined,
                                note_type: selectedNoteType !== 'all' ? selectedNoteType : undefined,
                                priority: selectedPriority !== 'all' ? selectedPriority : undefined,
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
                    data={caseNotes?.data || []}
                    from={caseNotes?.from || 1}
                    onAction={handleAction}
                    sortField={pageFilters.sort_field}
                    sortDirection={pageFilters.sort_direction}
                    onSort={handleSort}
                    permissions={permissions}
                    entityPermissions={{
                        view: 'view-case-notes',
                        create: 'create-case-notes',
                        edit: 'edit-case-notes',
                        delete: 'delete-case-notes',
                    }}
                />

                <Pagination
                    from={caseNotes?.from || 0}
                    to={caseNotes?.to || 0}
                    total={caseNotes?.total || 0}
                    links={caseNotes?.links}
                    entityName={t('case notes')}
                    onPageChange={(url) => router.get(url)}
                />
            </div>

            <CrudFormModal
                isOpen={isFormModalOpen}
                onClose={() => setIsFormModalOpen(false)}
                onSubmit={handleFormSubmit}
                formConfig={{
                    fields: [
                        { name: 'title', label: t('Title'), type: 'text', required: true },
                        { name: 'content', label: t('Content'), type: 'textarea', required: true, rows: 6 },
                        {
                            name: 'case_ids',
                            label: t('Related Cases'),
                            type: 'multi-select',
                            options: cases
                                ? cases.map((caseItem: any) => ({
                                      value: caseItem.id.toString(),
                                      label: `${caseItem.case_id} - ${caseItem.title}`,
                                  }))
                                : [],
                            placeholder: t('Select cases...'),
                        },
                        {
                            name: 'note_type',
                            label: t('Note Type'),
                            type: 'select',
                            required: true,
                            options: [
                                { value: 'general', label: t('General') },
                                { value: 'meeting', label: t('Meeting') },
                                { value: 'research', label: t('Research') },
                                { value: 'strategy', label: t('Strategy') },
                                { value: 'client_communication', label: t('Client Communication') },
                                { value: 'court_appearance', label: t('Court Appearance') },
                            ],
                        },
                        {
                            name: 'priority',
                            label: t('Priority'),
                            type: 'select',
                            required: true,
                            options: [
                                { value: 'low', label: t('Low') },
                                { value: 'medium', label: t('Medium') },
                                { value: 'high', label: t('High') },
                                { value: 'urgent', label: t('Urgent') },
                            ],
                        },
                        {
                            name: 'is_private',
                            label: t('Private Note'),
                            type: 'select',
                            options: [
                                { value: 'false', label: t('Public') },
                                { value: 'true', label: t('Private') },
                            ],
                            defaultValue: 'false',
                        },
                        { name: 'note_date', label: t('Note Date'), type: 'date' },
                        { name: 'tags', label: t('Tags (comma separated)'), type: 'text', placeholder: 'tag1, tag2, tag3' },
                        {
                            name: 'status',
                            label: t('Status'),
                            type: 'select',
                            options: [
                                { value: 'active', label: t('Active') },
                                { value: 'archived', label: t('Archived') },
                            ],
                            defaultValue: 'active',
                        },
                    ],
                    modalSize: 'xl',
                }}
                initialData={
                    currentItem
                        ? {
                              ...currentItem,
                              tags: Array.isArray(currentItem.tags) ? currentItem.tags.join(', ') : '',
                              case_ids: currentItem.case_ids || [],
                          }
                        : null
                }
                title={formMode === 'create' ? t('Add New Case Note') : formMode === 'edit' ? t('Edit Case Note') : t('View Case Note')}
                mode={formMode}
                transformData={(data) => ({
                    ...data,
                    is_private: data.is_private === 'true',
                    tags:
                        typeof data.tags === 'string'
                            ? data.tags
                                  .split(',')
                                  .map((tag: string) => tag.trim())
                                  .filter(Boolean)
                            : data.tags || [],
                    case_ids: data.case_ids || [],
                })}
            />

            <CrudDeleteModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDeleteConfirm}
                itemName={currentItem?.title || ''}
                entityName="case note"
            />
        </PageTemplate>
    );
}
