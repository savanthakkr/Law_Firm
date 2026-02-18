import { CrudDeleteModal } from '@/components/CrudDeleteModal';
import { CrudFormModal } from '@/components/CrudFormModal';
import { CrudTable } from '@/components/CrudTable';
import { toast } from '@/components/custom-toast';
import { PageTemplate } from '@/components/page-template';
import { Pagination } from '@/components/ui/pagination';
import { SearchAndFilterBar } from '@/components/ui/search-and-filter-bar';
import { hasPermission } from '@/utils/authorization';
import { router, usePage } from '@inertiajs/react';
import { ArrowLeft, Clock, FileText, Plus, Search, Users, CheckSquare } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function CaseShow() {
    const { t } = useTranslation();
    const {
        auth,
        case: caseData,
        timelines,
        teamMembers,
        users,
        caseDocuments,
        caseNotes,
        documentTypes,
        roles,
        researchProjects,
        tasks,
        taskTypes,
        taskStatuses,
        filters = {},
    } = usePage().props as any;
    const permissions = auth?.permissions || [];

    const [activeTab, setActiveTab] = useState('timelines');
    const [selectedProject, setSelectedProject] = useState<any>(null);
    const [projectSubTab, setProjectSubTab] = useState('details');
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isViewTeamModalOpen, setIsViewTeamModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState<any>(null);
    const [formMode, setFormMode] = useState<'create' | 'edit' | 'view'>('create');
    const [selectedCitation, setSelectedCitation] = useState<any>(null);
    const [isCitationModalOpen, setIsCitationModalOpen] = useState(false);
    const [selectedNote, setSelectedNote] = useState<any>(null);
    const [isNoteViewModalOpen, setIsNoteViewModalOpen] = useState(false);
    const [isDocumentViewModalOpen, setIsDocumentViewModalOpen] = useState(false);
    const [isTaskViewModalOpen, setIsTaskViewModalOpen] = useState(false);

    // Timeline filters
    const [timelineSearch, setTimelineSearch] = useState(filters.timeline_search || '');
    const [timelineEventType, setTimelineEventType] = useState(filters.timeline_event_type || 'all');
    const [timelineStatus, setTimelineStatus] = useState(filters.timeline_status || 'all');
    const [timelineCompleted, setTimelineCompleted] = useState(filters.timeline_completed || 'all');
    const [showTimelineFilters, setShowTimelineFilters] = useState(false);

    // Team filters
    const [teamSearch, setTeamSearch] = useState(filters.team_search || '');
    const [teamRole, setTeamRole] = useState(filters.team_role || 'all');
    const [teamStatus, setTeamStatus] = useState(filters.team_status || 'all');
    const [showTeamFilters, setShowTeamFilters] = useState(false);

    // Document filters
    const [docSearch, setDocSearch] = useState(filters.doc_search || '');
    const [docType, setDocType] = useState(filters.doc_type || 'all');
    const [docConfidentiality, setDocConfidentiality] = useState(filters.doc_confidentiality || 'all');
    const [docStatus, setDocStatus] = useState(filters.doc_status || 'all');
    const [showDocFilters, setShowDocFilters] = useState(false);

    // Note filters
    const [noteSearch, setNoteSearch] = useState(filters.note_search || '');
    const [noteType, setNoteType] = useState(filters.note_type || 'all');
    const [notePriority, setNotePriority] = useState(filters.note_priority || 'all');
    const [showNoteFilters, setShowNoteFilters] = useState(false);

    // Task filters
    const [taskSearch, setTaskSearch] = useState(filters.task_search || '');
    const [taskTypeId, setTaskTypeId] = useState(filters.task_type_id || 'all');
    const [taskStatus, setTaskStatus] = useState(filters.task_status || 'all');
    const [taskPriority, setTaskPriority] = useState(filters.task_priority || 'all');
    const [taskAssignedTo, setTaskAssignedTo] = useState(filters.task_assigned_to || 'all');
    const [showTaskFilters, setShowTaskFilters] = useState(false);

    const handleTimelineAction = (action: string, item?: any) => {
        setCurrentItem(item || null);
        switch (action) {
            case 'create':
                setFormMode('create');
                setIsFormModalOpen(true);
                break;
            case 'edit':
                setFormMode('edit');
                setIsFormModalOpen(true);
                break;
            case 'view':
                setFormMode('view');
                setIsFormModalOpen(true);
                break;
            case 'delete':
                setIsDeleteModalOpen(true);
                break;
            case 'toggle-status':
                handleTimelineToggleStatus(item);
                break;
        }
    };

    const handleTimelineToggleStatus = (timeline: any) => {
        const newStatus = timeline.status === 'active' ? 'inactive' : 'active';
        toast.loading(`${newStatus === 'active' ? t('Activating') : t('Deactivating')} timeline...`);

        router.put(
            route('cases.case-timelines.toggle-status', timeline.id),
            {},
            {
                onSuccess: () => {
                    toast.dismiss();
                    toast.success(t('Timeline status updated'));
                },
                onError: () => {
                    toast.dismiss();
                    toast.error(t('Failed to update timeline status'));
                },
            },
        );
    };

    const handleTeamAction = (action: string, item?: any) => {
        setCurrentItem(item || null);
        switch (action) {
            case 'create':
                setFormMode('create');
                setIsFormModalOpen(true);
                break;
            case 'edit':
                setFormMode('edit');
                setIsFormModalOpen(true);
                break;
            case 'view':
                setFormMode('view');
                setIsViewTeamModalOpen(true);
                break;
            case 'delete':
                setIsDeleteModalOpen(true);
                break;
            case 'toggle-status':
                handleTeamToggleStatus(item);
                break;
        }
    };

    const handleTeamToggleStatus = (member: any) => {
        const newStatus = member.status === 'active' ? 'inactive' : 'active';
        toast.loading(`${newStatus === 'active' ? t('Activating') : t('Deactivating')} team member...`);

        router.put(
            route('cases.case-team-members.toggle-status', member.id),
            {},
            {
                onSuccess: () => {
                    toast.dismiss();
                    toast.success(t('Team member status updated'));
                },
                onError: () => {
                    toast.dismiss();
                    toast.error(t('Failed to update team member status'));
                },
            },
        );
    };

    const handleDocumentAction = (action: string, item?: any) => {
        setCurrentItem(item || null);
        switch (action) {
            case 'create':
                setFormMode('create');
                setIsFormModalOpen(true);
                break;
            case 'edit':
                setFormMode('edit');
                setIsFormModalOpen(true);
                break;
            case 'view':
                setIsDocumentViewModalOpen(true);
                break;
            case 'delete':
                setIsDeleteModalOpen(true);
                break;
            case 'download':
                const link = document.createElement('a');
                link.href = item.file_path;
                link.download = item.document_name;
                link.click();
                break;
        }
    };

    const handleNoteAction = (action: string, item?: any) => {
        setCurrentItem(item || null);
        switch (action) {
            case 'create':
                setFormMode('create');
                setIsFormModalOpen(true);
                break;
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

    const handleTimelineSubmit = (formData: any) => {
        const data = { ...formData, case_id: caseData.id };

        if (formMode === 'create') {
            toast.loading(t('Creating timeline event...'));
            router.post(route('cases.case-timelines.store'), data, {
                onSuccess: () => {
                    setIsFormModalOpen(false);
                    toast.dismiss();
                    toast.success(t('Timeline event created'));
                },
                onError: (errors) => {
                    toast.dismiss();
                    toast.error(`Failed to create timeline: ${Object.values(errors).join(', ')}`);
                },
            });
        } else if (formMode === 'edit') {
            toast.loading(t('Updating timeline event...'));
            router.put(route('cases.case-timelines.update', currentItem.id), data, {
                onSuccess: () => {
                    setIsFormModalOpen(false);
                    toast.dismiss();
                    toast.success(t('Timeline event updated'));
                },
                onError: (errors) => {
                    toast.dismiss();
                    toast.error(`Failed to update timeline: ${Object.values(errors).join(', ')}`);
                },
            });
        }
    };

    const handleTeamSubmit = (formData: any) => {
        const data = { ...formData, case_id: caseData.id };

        if (formMode === 'create') {
            toast.loading(t('Assigning team member...'));
            router.post(route('cases.case-team-members.store'), data, {
                onSuccess: () => {
                    setIsFormModalOpen(false);
                    toast.dismiss();
                    toast.success(t('Team member assigned'));
                },
                onError: (errors) => {
                    toast.dismiss();
                    toast.error(`Failed to assign team member: ${Object.values(errors).join(', ')}`);
                },
            });
        } else if (formMode === 'edit') {
            toast.loading(t('Updating team member...'));
            router.put(route('cases.case-team-members.update', currentItem.id), data, {
                onSuccess: () => {
                    setIsFormModalOpen(false);
                    toast.dismiss();
                    toast.success(t('Team member updated'));
                },
                onError: (errors) => {
                    toast.dismiss();
                    toast.error(`Failed to update team member: ${Object.values(errors).join(', ')}`);
                },
            });
        }
    };

    const handleDocumentSubmit = (formData: any) => {
        const data = { ...formData, case_id: caseData.id };

        if (formMode === 'create') {
            toast.loading(t('Creating case document...'));
            router.post(route('advocate.case-documents.store'), data, {
                onSuccess: () => {
                    setIsFormModalOpen(false);
                    toast.dismiss();
                    toast.success(t('Case document created'));
                },
                onError: (errors) => {
                    toast.dismiss();
                    toast.error(`Failed to create document: ${Object.values(errors).join(', ')}`);
                },
            });
        } else if (formMode === 'edit') {
            toast.loading(t('Updating case document...'));
            router.post(
                route('advocate.case-documents.update', currentItem.id),
                {
                    ...data,
                    _method: 'PUT',
                },
                {
                    onSuccess: () => {
                        setIsFormModalOpen(false);
                        toast.dismiss();
                        toast.success(t('Case document updated'));
                    },
                    onError: (errors) => {
                        toast.dismiss();
                        toast.error(`Failed to update document: ${Object.values(errors).join(', ')}`);
                    },
                },
            );
        }
    };

    const handleDeleteConfirm = () => {
        let route_name = 'cases.case-timelines.destroy';
        if (activeTab === 'team') route_name = 'cases.case-team-members.destroy';
        if (activeTab === 'documents') route_name = 'advocate.case-documents.destroy';
        if (activeTab === 'notes') route_name = 'advocate.case-notes.destroy';
        if (activeTab === 'tasks') route_name = 'tasks.destroy';

        toast.loading(t('Deleting...'));
        router.delete(route(route_name, currentItem.id), {
            onSuccess: () => {
                setIsDeleteModalOpen(false);
                toast.dismiss();
                toast.success(t('Deleted successfully'));
            },
            onError: (errors) => {
                toast.dismiss();
                toast.error(`Failed to delete: ${Object.values(errors).join(', ')}`);
            },
        });
    };

    const handleNoteSubmit = (formData: any) => {
        const data = { ...formData, case_ids: [caseData.id.toString()] };

        if (formMode === 'create') {
            toast.loading(t('Creating case note...'));
            router.post(route('advocate.case-notes.store'), data, {
                onSuccess: () => {
                    setIsFormModalOpen(false);
                    toast.dismiss();
                    toast.success(t('Case note created'));
                },
                onError: (errors) => {
                    toast.dismiss();
                    toast.error(`Failed to create note: ${Object.values(errors).join(', ')}`);
                },
            });
        } else if (formMode === 'edit') {
            toast.loading(t('Updating case note...'));
            router.put(route('advocate.case-notes.update', currentItem.id), data, {
                onSuccess: () => {
                    setIsFormModalOpen(false);
                    toast.dismiss();
                    toast.success(t('Case note updated'));
                },
                onError: (errors) => {
                    toast.dismiss();
                    toast.error(`Failed to update note: ${Object.values(errors).join(', ')}`);
                },
            });
        }
    };

    // Timeline filter functions
    const handleTimelineSearch = (e: React.FormEvent) => {
        e.preventDefault();
        applyTimelineFilters();
    };

    const applyTimelineFilters = () => {
        router.get(
            route('cases.show', caseData.id),
            {
                timeline_search: timelineSearch || undefined,
                timeline_event_type: timelineEventType !== 'all' ? timelineEventType : undefined,
                timeline_status: timelineStatus !== 'all' ? timelineStatus : undefined,
                timeline_completed: timelineCompleted !== 'all' ? timelineCompleted : undefined,
                timeline_per_page: filters.timeline_per_page,
            },
            { preserveState: true, preserveScroll: true },
        );
    };

    const handleTimelineSort = (field: string) => {
        const direction = filters.timeline_sort_field === field && filters.timeline_sort_direction === 'asc' ? 'desc' : 'asc';
        router.get(
            route('cases.show', caseData.id),
            {
                timeline_search: timelineSearch || undefined,
                timeline_event_type: timelineEventType !== 'all' ? timelineEventType : undefined,
                timeline_status: timelineStatus !== 'all' ? timelineStatus : undefined,
                timeline_completed: timelineCompleted !== 'all' ? timelineCompleted : undefined,
                timeline_sort_field: field,
                timeline_sort_direction: direction,
                timeline_per_page: filters.timeline_per_page,
            },
            { preserveState: true, preserveScroll: true },
        );
    };

    // Team filter functions
    const handleTeamSearch = (e: React.FormEvent) => {
        e.preventDefault();
        applyTeamFilters();
    };

    const applyTeamFilters = () => {
        router.get(
            route('cases.show', caseData.id),
            {
                team_search: teamSearch || undefined,
                team_role: teamRole !== 'all' ? teamRole : undefined,
                team_status: teamStatus !== 'all' ? teamStatus : undefined,
                team_per_page: filters.team_per_page,
            },
            { preserveState: true, preserveScroll: true },
        );
    };

    const handleTeamSort = (field: string) => {
        const direction = filters.team_sort_field === field && filters.team_sort_direction === 'asc' ? 'desc' : 'asc';
        router.get(
            route('cases.show', caseData.id),
            {
                team_search: teamSearch || undefined,
                team_role: teamRole !== 'all' ? teamRole : undefined,
                team_status: teamStatus !== 'all' ? teamStatus : undefined,
                team_sort_field: field,
                team_sort_direction: direction,
                team_per_page: filters.team_per_page,
            },
            { preserveState: true, preserveScroll: true },
        );
    };

    // Document filter functions
    const handleDocumentSearch = (e: React.FormEvent) => {
        e.preventDefault();
        applyDocumentFilters();
    };

    const applyDocumentFilters = () => {
        router.get(
            route('cases.show', caseData.id),
            {
                doc_search: docSearch || undefined,
                doc_type: docType !== 'all' ? docType : undefined,
                doc_confidentiality: docConfidentiality !== 'all' ? docConfidentiality : undefined,
                doc_status: docStatus !== 'all' ? docStatus : undefined,
                doc_per_page: filters.doc_per_page,
            },
            { preserveState: true, preserveScroll: true },
        );
    };

    const handleDocumentSort = (field: string) => {
        const direction = filters.doc_sort_field === field && filters.doc_sort_direction === 'asc' ? 'desc' : 'asc';
        router.get(
            route('cases.show', caseData.id),
            {
                doc_search: docSearch || undefined,
                doc_type: docType !== 'all' ? docType : undefined,
                doc_confidentiality: docConfidentiality !== 'all' ? docConfidentiality : undefined,
                doc_status: docStatus !== 'all' ? docStatus : undefined,
                doc_sort_field: field,
                doc_sort_direction: direction,
                doc_per_page: filters.doc_per_page,
            },
            { preserveState: true, preserveScroll: true },
        );
    };

    // Task handlers
    const handleTaskAction = (action: string, item?: any) => {
        setCurrentItem(item || null);
        switch (action) {
            case 'create':
                setFormMode('create');
                setIsFormModalOpen(true);
                break;
            case 'edit':
                setFormMode('edit');
                setIsFormModalOpen(true);
                break;
            case 'view':
                setIsTaskViewModalOpen(true);
                break;
            case 'delete':
                setIsDeleteModalOpen(true);
                break;
            case 'toggle-status':
                setIsStatusModalOpen(true);
                break;
        }
    };

    const handleTaskStatusChange = (formData: any) => {
        toast.loading(t('Updating task status...'));
        router.put(route('tasks.update', currentItem.id), {
            ...currentItem,
            status: formData.status,
            task_type_id: currentItem.task_type_id || currentItem.taskType?.id,
            assigned_to: currentItem.assigned_to || currentItem.assignedUser?.id,
            case_id: currentItem.case_id || currentItem.case?.id,
            task_status_id: currentItem.task_status_id || currentItem.taskStatus?.id
        }, {
            onSuccess: () => {
                setIsStatusModalOpen(false);
                toast.dismiss();
                toast.success(t('Task status updated'));
            },
            onError: (errors) => {
                toast.dismiss();
                toast.error(`Failed to update task status: ${Object.values(errors).join(', ')}`);
            }
        });
    };

    const handleTaskSubmit = (formData: any) => {
        const data = { ...formData, case_id: caseData.id };

        if (formMode === 'create') {
            toast.loading(t('Creating task...'));
            router.post(route('tasks.store'), data, {
                onSuccess: () => {
                    setIsFormModalOpen(false);
                    toast.dismiss();
                    toast.success(t('Task created'));
                },
                onError: (errors) => {
                    toast.dismiss();
                    toast.error(`Failed to create task: ${Object.values(errors).join(', ')}`);
                },
            });
        } else if (formMode === 'edit') {
            toast.loading(t('Updating task...'));
            router.put(route('tasks.update', currentItem.id), data, {
                onSuccess: () => {
                    setIsFormModalOpen(false);
                    toast.dismiss();
                    toast.success(t('Task updated'));
                },
                onError: (errors) => {
                    toast.dismiss();
                    toast.error(`Failed to update task: ${Object.values(errors).join(', ')}`);
                },
            });
        }
    };

    // Task filter functions
    const handleTaskSearch = (e: React.FormEvent) => {
        e.preventDefault();
        applyTaskFilters();
    };

    const applyTaskFilters = () => {
        router.get(
            route('cases.show', caseData.id),
            {
                task_search: taskSearch || undefined,
                task_type_id: taskTypeId !== 'all' ? taskTypeId : undefined,
                task_status: taskStatus !== 'all' ? taskStatus : undefined,
                task_priority: taskPriority !== 'all' ? taskPriority : undefined,
                task_assigned_to: taskAssignedTo !== 'all' ? taskAssignedTo : undefined,
                task_per_page: filters.task_per_page,
            },
            { preserveState: true, preserveScroll: true },
        );
    };

    const handleTaskSort = (field: string) => {
        const direction = filters.task_sort_field === field && filters.task_sort_direction === 'asc' ? 'desc' : 'asc';
        router.get(
            route('cases.show', caseData.id),
            {
                task_search: taskSearch || undefined,
                task_type_id: taskTypeId !== 'all' ? taskTypeId : undefined,
                task_status: taskStatus !== 'all' ? taskStatus : undefined,
                task_priority: taskPriority !== 'all' ? taskPriority : undefined,
                task_assigned_to: taskAssignedTo !== 'all' ? taskAssignedTo : undefined,
                task_sort_field: field,
                task_sort_direction: direction,
                task_per_page: filters.task_per_page,
            },
            { preserveState: true, preserveScroll: true },
        );
    };

    const breadcrumbs = [
        { title: t('Dashboard'), href: route('dashboard') },
        { title: t('Case Management'), href: route('cases.index') },
        { title: caseData.case_id },
    ];

    const pageActions = [
        {
            label: t('Back to Cases'),
            icon: <ArrowLeft className="mr-2 h-4 w-4" />,
            variant: 'outline',
            onClick: () => router.get(route('cases.index')),
        },
    ];

    const timelineColumns = [
        {
            key: 'title',
            label: t('Title'),
            sortable: true,
        },
        {
            key: 'event_type',
            label: t('Event Type'),
            render: (value: string) => (
                <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">{value}</span>
            ),
        },
        {
            key: 'event_date',
            label: t('Event Date'),
            sortable: true,
            render: (value: string) => window.appSettings?.formatDate(value) || new Date(value).toLocaleDateString(),
        },
        {
            key: 'is_completed',
            label: t('Completed'),
            render: (value: boolean) => (
                <span
                    className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${value ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'
                        }`}
                >
                    {value ? t('Yes') : t('No')}
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

    const teamColumns = [
        {
            key: 'user',
            label: t('Team Member'),
            render: (value: any, row: any) => row.user?.name || '-',
        },

        {
            key: 'assigned_date',
            label: t('Assigned Date'),
            sortable: true,
            render: (value: string) => window.appSettings?.formatDate(value) || new Date(value).toLocaleDateString(),
        },
        {
            key: 'status',
            label: t('Status'),
            render: (value: string) => (
                <span
                    className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${value === 'active' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
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
        },
        {
            label: t('Edit'),
            icon: 'Edit',
            action: 'edit',
            className: 'text-amber-500',
        },
        {
            label: t('Toggle Status'),
            icon: 'Lock',
            action: 'toggle-status',
            className: 'text-amber-500',
        },
        {
            label: t('Delete'),
            icon: 'Trash2',
            action: 'delete',
            className: 'text-red-500',
        },
    ];

    return (
        <PageTemplate
            title={`${caseData.title} (${caseData.case_id})`}
            url={`/cases/${caseData.id}`}
            actions={pageActions}
            breadcrumbs={breadcrumbs}
            noPadding
        >
            {/* Case Header */}
            <div className="mb-6 rounded-lg border border-gray-200 bg-white shadow dark:border-gray-700 dark:bg-gray-900">
                <div className="p-6">
                    <div className="grid grid-cols-4 gap-4 text-sm md:grid-cols-6">
                        <div>
                            <span className="font-medium text-gray-500 dark:text-gray-400">{t('Client')}:</span>
                            <p className="text-gray-900 dark:text-white">{caseData.client?.name}</p>
                        </div>
                        <div>
                            <span className="font-medium text-gray-500 dark:text-gray-400">{t('Case Type')}:</span>
                            <p className="text-gray-900 dark:text-white">{caseData.case_type?.name}</p>
                        </div>
                        <div>
                            <span className="font-medium text-gray-500 dark:text-gray-400">{t('Filing Date')}:</span>
                            <p className="text-gray-900 dark:text-white">
                                {caseData.filing_date ? (window.appSettings?.formatDate(caseData.filing_date) || new Date(caseData.filing_date).toLocaleDateString()) : '-'}
                            </p>
                        </div>
                        <div>
                            <span className="font-medium text-gray-500 dark:text-gray-400">{t('Expected Completion')}:</span>
                            <p className="text-gray-900 dark:text-white">
                                {caseData.expected_completion_date ? (window.appSettings?.formatDate(caseData.expected_completion_date) || new Date(caseData.expected_completion_date).toLocaleDateString()) : '-'}
                            </p>
                        </div>
                        <div>
                            <span className="font-medium text-gray-500 dark:text-gray-400">{t('Status')}:</span>
                            <p className="text-gray-900 dark:text-white mt-1">
                                <span
                                    className={`inline-flex items-center rounded px-2 py-1 text-xs font-medium ${caseData.status === 'active'
                                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                        }`}
                                >
                                    {caseData.status === 'active' ? t('Active') : t('Inactive')}
                                </span>
                            </p>
                        </div>
                        <div>
                            <span className="font-medium text-gray-500 dark:text-gray-400">{t('Priority')}:</span>
                            <p className="text-gray-900 dark:text-white mt-1">
                                <span
                                    className={`inline-flex items-center rounded px-2 py-1 text-xs font-medium ${caseData.priority === 'high'
                                            ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                            : caseData.priority === 'medium'
                                                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                                : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                        }`}
                                >
                                    {t(caseData.priority?.charAt(0).toUpperCase() + caseData.priority?.slice(1))}
                                </span>
                            </p>
                        </div>
                    </div>

                    {caseData.court && (
                        <div className="mt-4 border-t border-gray-200 pt-4 dark:border-gray-700">
                            <span className="font-medium text-gray-500 dark:text-gray-400">{t('Court Details')}:</span>
                            <div className="mt-2 grid grid-cols-2 gap-4 text-sm md:grid-cols-5">
                                <div>
                                    <span className="font-medium text-gray-500 dark:text-gray-400">{t('Court Type')}:</span>
                                    <p className="text-gray-900 dark:text-white">{caseData.court.court_type?.name || '-'}</p>
                                </div>
                                <div>
                                    <span className="font-medium text-gray-500 dark:text-gray-400">{t('Address')}:</span>
                                    <p className="text-gray-900 dark:text-white">{caseData.court.address || '-'}</p>
                                </div>
                                <div>
                                    <span className="font-medium text-gray-500 dark:text-gray-400">{t('Phone')}:</span>
                                    <p className="text-gray-900 dark:text-white">{caseData.court.phone || '-'}</p>
                                </div>
                                <div>
                                    <span className="font-medium text-gray-500 dark:text-gray-400">{t('Email')}:</span>
                                    <p className="text-gray-900 dark:text-white">{caseData.court.email || '-'}</p>
                                </div>
                                <div>
                                    <span className="font-medium text-gray-500 dark:text-gray-400">{t('Jurisdiction')}:</span>
                                    <p className="text-gray-900 dark:text-white">{caseData.court.jurisdiction || '-'}</p>
                                </div>
                            </div>
                            {caseData.court.judges && caseData.court.judges.length > 0 && (
                                <div className="mt-3">
                                    <span className="font-medium text-gray-500 dark:text-gray-400">{t('Judges')}:</span>
                                    <div className="mt-1 space-y-2">
                                        {caseData.court.judges.map((judge: any) => (
                                            <div key={judge.id} className="rounded-md bg-gray-50 p-3 dark:bg-gray-800">
                                                <div className="flex items-center justify-between">
                                                    <span className="font-medium text-gray-900 dark:text-white">{judge.name}</span>
                                                    <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 dark:bg-blue-900 dark:text-blue-200">
                                                        {judge.designation || t('Judge')}
                                                    </span>
                                                </div>
                                                {judge.specialization && (
                                                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                                                        <span className="font-medium">{t('Specialization')}:</span> {judge.specialization}
                                                    </p>
                                                )}
                                                {judge.contact_info && (
                                                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                                                        <span className="font-medium">{t('Contact')}:</span> {judge.contact_info}
                                                    </p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="hidden">
                    </div>

                    {caseData.description && (
                        <div className="mt-4 border-t border-gray-200 pt-4 dark:border-gray-700">
                            <span className="font-medium text-gray-500 dark:text-gray-400">{t('Description')}:</span>
                            <p className="mt-1 text-gray-900 dark:text-white">{caseData.description}</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Tabs */}
            <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow dark:border-gray-700 dark:bg-gray-900">
                <div className="border-b border-gray-200 dark:border-gray-700">
                    <nav className="flex overflow-x-auto">
                        {hasPermission(permissions, 'view-case-timelines') && (
                            <button
                                onClick={() => {
                                    setActiveTab('timelines');
                                    router.get(route('cases.show', caseData.id), {}, { preserveState: true, preserveScroll: true });
                                }}
                                className={`flex-shrink-0 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${activeTab === 'timelines'
                                        ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                                    }`}
                            >
                                <div className="flex items-center space-x-2">
                                    <Clock className="h-4 w-4" />
                                    <span>{t('Timeline')}</span>
                                </div>
                            </button>
                        )}
                        {hasPermission(permissions, 'view-case-team-members') && (
                            <button
                                onClick={() => {
                                    setActiveTab('team');
                                    router.get(route('cases.show', caseData.id), {}, { preserveState: true, preserveScroll: true });
                                }}
                                className={`flex-shrink-0 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${activeTab === 'team'
                                        ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                                    }`}
                            >
                                <div className="flex items-center space-x-2">
                                    <Users className="h-4 w-4" />
                                    <span>{t('Team Members')}</span>
                                </div>
                            </button>
                        )}
                        {hasPermission(permissions, 'view-case-documents') && (
                            <button
                                onClick={() => {
                                    setActiveTab('documents');
                                    router.get(route('cases.show', caseData.id), {}, { preserveState: true, preserveScroll: true });
                                }}
                                className={`flex-shrink-0 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${activeTab === 'documents'
                                        ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                                    }`}
                            >
                                <div className="flex items-center space-x-2">
                                    <FileText className="h-4 w-4" />
                                    <span>{t('Documents')}</span>
                                </div>
                            </button>
                        )}
                        {hasPermission(permissions, 'view-case-notes') && (
                            <button
                                onClick={() => {
                                    setActiveTab('notes');
                                    router.get(route('cases.show', caseData.id), {}, { preserveState: true, preserveScroll: true });
                                }}
                                className={`flex-shrink-0 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${activeTab === 'notes'
                                        ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                                    }`}
                            >
                                <div className="flex items-center space-x-2">
                                    <FileText className="h-4 w-4" />
                                    <span>{t('Notes')}</span>
                                </div>
                            </button>
                        )}
                        {hasPermission(permissions, 'view-tasks') && (
                            <button
                                onClick={() => {
                                    setActiveTab('tasks');
                                    router.get(route('cases.show', caseData.id), {}, { preserveState: true, preserveScroll: true });
                                }}
                                className={`flex-shrink-0 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${activeTab === 'tasks'
                                        ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                                    }`}
                            >
                                <div className="flex items-center space-x-2">
                                    <CheckSquare className="h-4 w-4" />
                                    <span>{t('Tasks')}</span>
                                </div>
                            </button>
                        )}
                        {hasPermission(permissions, 'view-research-projects') && (
                            <button
                                onClick={() => {
                                    setActiveTab('research-projects');
                                    router.get(route('cases.show', caseData.id), {}, { preserveState: true, preserveScroll: true });
                                }}
                                className={`flex-shrink-0 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${activeTab === 'research-projects'
                                        ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                                    }`}
                            >
                                <div className="flex items-center space-x-2">
                                    <Search className="h-4 w-4" />
                                    <span>{t('Research Projects')}</span>
                                </div>
                            </button>
                        )}
                    </nav>
                </div>

                <div className="p-6">
                    {activeTab === 'timelines' && (
                        <div>
                            <div className="mb-6 flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('Timeline Events')}</h3>
                                {hasPermission(permissions, 'create-case-timelines') && (
                                    <button
                                        onClick={() => handleTimelineAction('create')}
                                        className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                                    >
                                        <Plus className="h-4 w-4" />
                                        {t('Add Event')}
                                    </button>
                                )}
                            </div>

                            <div className="mb-4">
                                <SearchAndFilterBar
                                    searchTerm={timelineSearch}
                                    onSearchChange={setTimelineSearch}
                                    onSearch={handleTimelineSearch}
                                    filters={[
                                        {
                                            name: 'timeline_event_type',
                                            label: t('Event Type'),
                                            type: 'select',
                                            value: timelineEventType,
                                            onChange: setTimelineEventType,
                                            options: [
                                                { value: 'all', label: t('All Types') },
                                                { value: 'milestone', label: t('Milestone') },
                                                { value: 'hearing', label: t('Hearing') },
                                                { value: 'deadline', label: t('Deadline') },
                                                { value: 'meeting', label: t('Meeting') },
                                            ],
                                        },
                                        {
                                            name: 'timeline_completed',
                                            label: t('Completed'),
                                            type: 'select',
                                            value: timelineCompleted,
                                            onChange: setTimelineCompleted,
                                            options: [
                                                { value: 'all', label: t('All') },
                                                { value: '1', label: t('Completed') },
                                                { value: '0', label: t('Pending') },
                                            ],
                                        },
                                        {
                                            name: 'timeline_status',
                                            label: t('Status'),
                                            type: 'select',
                                            value: timelineStatus,
                                            onChange: setTimelineStatus,
                                            options: [
                                                { value: 'all', label: t('All Statuses') },
                                                { value: 'active', label: t('Active') },
                                                { value: 'inactive', label: t('Inactive') },
                                            ],
                                        },
                                    ]}
                                    showFilters={showTimelineFilters}
                                    setShowFilters={setShowTimelineFilters}
                                    hasActiveFilters={() =>
                                        timelineSearch !== '' ||
                                        timelineEventType !== 'all' ||
                                        timelineStatus !== 'all' ||
                                        timelineCompleted !== 'all'
                                    }
                                    activeFilterCount={() =>
                                        (timelineSearch ? 1 : 0) +
                                        (timelineEventType !== 'all' ? 1 : 0) +
                                        (timelineStatus !== 'all' ? 1 : 0) +
                                        (timelineCompleted !== 'all' ? 1 : 0)
                                    }
                                    onResetFilters={() => {
                                        setTimelineSearch('');
                                        setTimelineEventType('all');
                                        setTimelineStatus('all');
                                        setTimelineCompleted('all');
                                        router.get(route('cases.show', caseData.id));
                                    }}
                                    onApplyFilters={applyTimelineFilters}
                                    currentPerPage={filters.timeline_per_page?.toString() || '10'}
                                    onPerPageChange={(value) => {
                                        router.get(route('cases.show', caseData.id), {
                                            ...filters,
                                            timeline_per_page: parseInt(value),
                                        });
                                    }}
                                />
                            </div>

                            <CrudTable
                                columns={timelineColumns}
                                actions={actions}
                                data={timelines?.data || []}
                                from={timelines?.from || 1}
                                onAction={handleTimelineAction}
                                sortField={filters.timeline_sort_field}
                                sortDirection={filters.timeline_sort_direction}
                                onSort={handleTimelineSort}
                                permissions={permissions}
                                entityPermissions={{
                                    view: 'view-case-timelines',
                                    create: 'create-case-timelines',
                                    edit: 'edit-case-timelines',
                                    delete: 'delete-case-timelines',
                                }}
                            />

                            <Pagination
                                from={timelines?.from || 0}
                                to={timelines?.to || 0}
                                total={timelines?.total || 0}
                                links={timelines?.links}
                                entityName={t('timeline events')}
                                onPageChange={(url) => router.get(url)}
                            />
                        </div>
                    )}

                    {activeTab === 'team' && (
                        <div>
                            <div className="mb-6 flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('Team Members')}</h3>
                                {hasPermission(permissions, 'create-case-team-members') && (
                                    <button
                                        onClick={() => handleTeamAction('create')}
                                        className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                                    >
                                        <Plus className="h-4 w-4" />
                                        {t('Add Member')}
                                    </button>
                                )}
                            </div>

                            <div className="mb-4">
                                <SearchAndFilterBar
                                    searchTerm={teamSearch}
                                    onSearchChange={setTeamSearch}
                                    onSearch={handleTeamSearch}
                                    filters={[
                                        {
                                            name: 'team_role',
                                            label: t('Role'),
                                            type: 'select',
                                            value: teamRole,
                                            onChange: setTeamRole,
                                            options: [
                                                { value: 'all', label: t('All Roles') },
                                                { value: 'lead_advocate', label: t('Lead Advocate') },
                                                { value: 'team_member', label: t('Team Member') },
                                                { value: 'paralegal', label: t('Paralegal') },
                                                { value: 'assistant', label: t('Assistant') },
                                            ],
                                        },
                                        {
                                            name: 'team_status',
                                            label: t('Status'),
                                            type: 'select',
                                            value: teamStatus,
                                            onChange: setTeamStatus,
                                            options: [
                                                { value: 'all', label: t('All Statuses') },
                                                { value: 'active', label: t('Active') },
                                                { value: 'inactive', label: t('Inactive') },
                                            ],
                                        },
                                    ]}
                                    showFilters={showTeamFilters}
                                    setShowFilters={setShowTeamFilters}
                                    hasActiveFilters={() => teamSearch !== '' || teamRole !== 'all' || teamStatus !== 'all'}
                                    activeFilterCount={() => (teamSearch ? 1 : 0) + (teamRole !== 'all' ? 1 : 0) + (teamStatus !== 'all' ? 1 : 0)}
                                    onResetFilters={() => {
                                        setTeamSearch('');
                                        setTeamRole('all');
                                        setTeamStatus('all');
                                        router.get(route('cases.show', caseData.id));
                                    }}
                                    onApplyFilters={applyTeamFilters}
                                    currentPerPage={filters.team_per_page?.toString() || '10'}
                                    onPerPageChange={(value) => {
                                        router.get(route('cases.show', caseData.id), {
                                            ...filters,
                                            team_per_page: parseInt(value),
                                        });
                                    }}
                                />
                            </div>

                            <CrudTable
                                columns={teamColumns}
                                actions={actions}
                                data={teamMembers?.data || []}
                                from={teamMembers?.from || 1}
                                onAction={handleTeamAction}
                                sortField={filters.team_sort_field}
                                sortDirection={filters.team_sort_direction}
                                onSort={handleTeamSort}
                                permissions={permissions}
                                entityPermissions={{
                                    view: 'view-case-team-members',
                                    create: 'create-case-team-members',
                                    edit: 'edit-case-team-members',
                                    delete: 'delete-case-team-members',
                                }}
                            />

                            <Pagination
                                from={teamMembers?.from || 0}
                                to={teamMembers?.to || 0}
                                total={teamMembers?.total || 0}
                                links={teamMembers?.links}
                                entityName={t('team members')}
                                onPageChange={(url) => router.get(url)}
                            />
                        </div>
                    )}

                    {activeTab === 'documents' && (
                        <div>
                            <div className="mb-6 flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('Case Documents')}</h3>
                                {hasPermission(permissions, 'create-case-documents') && (
                                    <button
                                        onClick={() => handleDocumentAction('create')}
                                        className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                                    >
                                        <Plus className="h-4 w-4" />
                                        {t('Add Document')}
                                    </button>
                                )}
                            </div>

                            <div className="mb-4">
                                <SearchAndFilterBar
                                    searchTerm={docSearch}
                                    onSearchChange={setDocSearch}
                                    onSearch={handleDocumentSearch}
                                    filters={[
                                        {
                                            name: 'doc_type',
                                            label: t('Document Type'),
                                            type: 'select',
                                            value: docType,
                                            onChange: setDocType,
                                            options: [
                                                { value: 'all', label: t('All Types') },
                                                { value: 'contract', label: t('Contract') },
                                                { value: 'evidence', label: t('Evidence') },
                                                { value: 'correspondence', label: t('Correspondence') },
                                                { value: 'court_filing', label: t('Court Filing') },
                                                { value: 'research', label: t('Research') },
                                                { value: 'other', label: t('Other') },
                                            ],
                                        },
                                        {
                                            name: 'doc_confidentiality',
                                            label: t('Confidentiality'),
                                            type: 'select',
                                            value: docConfidentiality,
                                            onChange: setDocConfidentiality,
                                            options: [
                                                { value: 'all', label: t('All Levels') },
                                                { value: 'public', label: t('Public') },
                                                { value: 'confidential', label: t('Confidential') },
                                                { value: 'privileged', label: t('Privileged') },
                                            ],
                                        },
                                        {
                                            name: 'doc_status',
                                            label: t('Status'),
                                            type: 'select',
                                            value: docStatus,
                                            onChange: setDocStatus,
                                            options: [
                                                { value: 'all', label: t('All Statuses') },
                                                { value: 'active', label: t('Active') },
                                                { value: 'archived', label: t('Archived') },
                                            ],
                                        },
                                    ]}
                                    showFilters={showDocFilters}
                                    setShowFilters={setShowDocFilters}
                                    hasActiveFilters={() =>
                                        docSearch !== '' || docType !== 'all' || docConfidentiality !== 'all' || docStatus !== 'all'
                                    }
                                    activeFilterCount={() =>
                                        (docSearch ? 1 : 0) +
                                        (docType !== 'all' ? 1 : 0) +
                                        (docConfidentiality !== 'all' ? 1 : 0) +
                                        (docStatus !== 'all' ? 1 : 0)
                                    }
                                    onResetFilters={() => {
                                        setDocSearch('');
                                        setDocType('all');
                                        setDocConfidentiality('all');
                                        setDocStatus('all');
                                        router.get(route('cases.show', caseData.id));
                                    }}
                                    onApplyFilters={applyDocumentFilters}
                                    currentPerPage={filters.doc_per_page?.toString() || '10'}
                                    onPerPageChange={(value) => {
                                        router.get(route('cases.show', caseData.id), {
                                            ...filters,
                                            doc_per_page: parseInt(value),
                                        });
                                    }}
                                />
                            </div>

                            <CrudTable
                                columns={[
                                    { key: 'document_name', label: t('Document Name'), sortable: true },
                                    {
                                        key: 'document_type_id',
                                        label: t('Document Type'),
                                        render: (value: any, row: any) => {
                                            const docType = documentTypes?.find(
                                                (type: any) => type.id.toString() === row.document_type_id?.toString(),
                                            );
                                            return docType?.name ? (
                                                <span
                                                    className="inline-flex items-center rounded-md px-2 py-1 text-xs font-medium"
                                                    style={{
                                                        backgroundColor: `${docType.color || '#3B82F6'}20`,
                                                        color: docType.color || '#3B82F6',
                                                    }}
                                                >
                                                    {docType.name}
                                                </span>
                                            ) : (
                                                '-'
                                            );
                                        },
                                    },
                                    {
                                        key: 'confidentiality',
                                        label: t('Confidentiality'),
                                        render: (value: string) => {
                                            const confidentialities = {
                                                public: { label: t('Public'), class: 'bg-green-50 text-green-700' },
                                                confidential: { label: t('Confidential'), class: 'bg-yellow-50 text-yellow-700' },
                                                privileged: { label: t('Privileged'), class: 'bg-red-50 text-red-700' },
                                            };
                                            const conf = confidentialities[value as keyof typeof confidentialities];
                                            return (
                                                <span
                                                    className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${conf?.class || 'bg-gray-50 text-gray-700'}`}
                                                >
                                                    {conf?.label || value}
                                                </span>
                                            );
                                        },
                                    },

                                    {
                                        key: 'created_at',
                                        label: t('Created At'),
                                        sortable: true,
                                        type: 'date',
                                    },
                                ]}
                                actions={[
                                    { label: t('View'), icon: 'Eye', action: 'view', className: 'text-blue-500' },
                                    { label: t('Edit'), icon: 'Edit', action: 'edit', className: 'text-amber-500' },
                                    { label: t('Download'), icon: 'Download', action: 'download', className: 'text-green-500' },
                                    { label: t('Delete'), icon: 'Trash2', action: 'delete', className: 'text-red-500' },
                                ]}
                                data={caseDocuments?.data || []}
                                from={caseDocuments?.from || 1}
                                onAction={handleDocumentAction}
                                sortField={filters.doc_sort_field}
                                sortDirection={filters.doc_sort_direction}
                                onSort={handleDocumentSort}
                                permissions={permissions}
                                entityPermissions={{
                                    view: 'view-case-documents',
                                    create: 'create-case-documents',
                                    edit: 'edit-case-documents',
                                    delete: 'delete-case-documents',
                                }}
                            />

                            <Pagination
                                from={caseDocuments?.from || 0}
                                to={caseDocuments?.to || 0}
                                total={caseDocuments?.total || 0}
                                links={caseDocuments?.links}
                                entityName={t('documents')}
                                onPageChange={(url) => router.get(url)}
                            />
                        </div>
                    )}

                    {activeTab === 'notes' && (
                        <div>
                            <div className="mb-6 flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('Case Notes')}</h3>
                                {hasPermission(permissions, 'create-case-notes') && (
                                    <button
                                        onClick={() => handleNoteAction('create')}
                                        className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                                    >
                                        <Plus className="h-4 w-4" />
                                        {t('Add Note')}
                                    </button>
                                )}
                            </div>

                            <div className="mb-4">
                                <SearchAndFilterBar
                                    searchTerm={noteSearch}
                                    onSearchChange={setNoteSearch}
                                    onSearch={(e) => {
                                        e.preventDefault();
                                    }}
                                    filters={[
                                        {
                                            name: 'note_type',
                                            label: t('Note Type'),
                                            type: 'select',
                                            value: noteType,
                                            onChange: setNoteType,
                                            options: [
                                                { value: 'all', label: t('All Types') },
                                                { value: 'general', label: t('General') },
                                                { value: 'meeting', label: t('Meeting') },
                                                { value: 'research', label: t('Research') },
                                                { value: 'strategy', label: t('Strategy') },
                                            ],
                                        },
                                        {
                                            name: 'priority',
                                            label: t('Priority'),
                                            type: 'select',
                                            value: notePriority,
                                            onChange: setNotePriority,
                                            options: [
                                                { value: 'all', label: t('All Priorities') },
                                                { value: 'low', label: t('Low') },
                                                { value: 'medium', label: t('Medium') },
                                                { value: 'high', label: t('High') },
                                                { value: 'urgent', label: t('Urgent') },
                                            ],
                                        },
                                    ]}
                                    showFilters={showNoteFilters}
                                    setShowFilters={setShowNoteFilters}
                                    hasActiveFilters={() => noteSearch !== '' || noteType !== 'all' || notePriority !== 'all'}
                                    activeFilterCount={() => (noteSearch ? 1 : 0) + (noteType !== 'all' ? 1 : 0) + (notePriority !== 'all' ? 1 : 0)}
                                    onResetFilters={() => {
                                        setNoteSearch('');
                                        setNoteType('all');
                                        setNotePriority('all');
                                    }}
                                    onApplyFilters={() => { }}
                                    currentPerPage="10"
                                    onPerPageChange={() => { }}
                                />
                            </div>

                            <CrudTable
                                columns={[
                                    { key: 'title', label: t('Title'), sortable: true },
                                    {
                                        key: 'note_type',
                                        label: t('Type'),
                                        render: (value: string) => (
                                            <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">
                                                {value?.replace('_', ' ')}
                                            </span>
                                        ),
                                    },
                                    {
                                        key: 'priority',
                                        label: t('Priority'),
                                        render: (value: string) => {
                                            const colors = {
                                                low: 'bg-gray-50 text-gray-700',
                                                medium: 'bg-blue-50 text-blue-700',
                                                high: 'bg-orange-50 text-orange-700',
                                                urgent: 'bg-red-50 text-red-700',
                                            };
                                            return (
                                                <span
                                                    className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${colors[value as keyof typeof colors] || colors.medium}`}
                                                >
                                                    {t(value?.charAt(0).toUpperCase() + value?.slice(1))}
                                                </span>
                                            );
                                        },
                                    },
                                    {
                                        key: 'is_private',
                                        label: t('Privacy'),
                                        render: (value: boolean) => (
                                            <span
                                                className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${value ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'
                                                    }`}
                                            >
                                                {value ? t('Private') : t('Public')}
                                            </span>
                                        ),
                                    },
                                    {
                                        key: 'creator',
                                        label: t('Created By'),
                                        render: (value: any) => value?.name || '-',
                                    },
                                    {
                                        key: 'created_at',
                                        label: t('Created At'),
                                        sortable: true,
                                        type: 'date',
                                    },
                                ]}
                                actions={[
                                    { label: t('View'), icon: 'Eye', action: 'view', className: 'text-blue-500' },
                                    { label: t('Edit'), icon: 'Edit', action: 'edit', className: 'text-amber-500' },
                                    { label: t('Delete'), icon: 'Trash2', action: 'delete', className: 'text-red-500' },
                                ]}
                                data={(() => {
                                    let filteredNotes =
                                        caseNotes?.data?.filter((note: any) => {
                                            if (!note.case_ids?.includes(caseData.id.toString())) return false;
                                            if (
                                                noteSearch &&
                                                !note.title?.toLowerCase().includes(noteSearch.toLowerCase()) &&
                                                !note.content?.toLowerCase().includes(noteSearch.toLowerCase())
                                            )
                                                return false;
                                            if (noteType !== 'all' && note.note_type !== noteType) return false;
                                            if (notePriority !== 'all' && note.priority !== notePriority) return false;
                                            return true;
                                        }) || [];

                                    if (filters.note_sort_field) {
                                        filteredNotes.sort((a: any, b: any) => {
                                            let aVal = a[filters.note_sort_field];
                                            let bVal = b[filters.note_sort_field];
                                            const direction = filters.note_sort_direction === 'desc' ? -1 : 1;

                                            if (filters.note_sort_field === 'created_at') {
                                                return direction * (new Date(aVal || 0).getTime() - new Date(bVal || 0).getTime());
                                            }

                                            if (filters.note_sort_field === 'title') {
                                                aVal = (aVal || '').toString().toLowerCase();
                                                bVal = (bVal || '').toString().toLowerCase();
                                                return direction * aVal.localeCompare(bVal);
                                            }

                                            return direction * (aVal || '').toString().localeCompare((bVal || '').toString());
                                        });
                                    }

                                    return filteredNotes;
                                })()}
                                from={1}
                                onAction={handleNoteAction}
                                sortField={filters.note_sort_field}
                                sortDirection={filters.note_sort_direction}
                                onSort={(field) => {
                                    const direction = filters.note_sort_field === field && filters.note_sort_direction === 'asc' ? 'desc' : 'asc';
                                    router.get(
                                        route('cases.show', caseData.id),
                                        {
                                            ...filters,
                                            note_search: noteSearch || undefined,
                                            note_type: noteType !== 'all' ? noteType : undefined,
                                            note_priority: notePriority !== 'all' ? notePriority : undefined,
                                            note_sort_field: field,
                                            note_sort_direction: direction,
                                            note_per_page: filters.note_per_page,
                                        },
                                        { preserveState: true, preserveScroll: true },
                                    );
                                }}
                                permissions={permissions}
                                entityPermissions={{
                                    view: 'view-case-notes',
                                    create: 'create-case-notes',
                                    edit: 'edit-case-notes',
                                    delete: 'delete-case-notes',
                                }}
                            />
                        </div>
                    )}

                    {activeTab === 'tasks' && (
                        <div>
                            <div className="mb-6 flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('Tasks')}</h3>
                                {hasPermission(permissions, 'create-tasks') && (
                                    <button
                                        onClick={() => handleTaskAction('create')}
                                        className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                                    >
                                        <Plus className="h-4 w-4" />
                                        {t('Add Task')}
                                    </button>
                                )}
                            </div>

                            <div className="mb-4">
                                <SearchAndFilterBar
                                    searchTerm={taskSearch}
                                    onSearchChange={setTaskSearch}
                                    onSearch={handleTaskSearch}
                                    filters={[
                                        {
                                            name: 'task_type_id',
                                            label: t('Task Type'),
                                            type: 'select',
                                            value: taskTypeId,
                                            onChange: setTaskTypeId,
                                            options: [
                                                { value: 'all', label: t('All Types') },
                                                ...(taskTypes?.map((type: any) => ({
                                                    value: type.id.toString(),
                                                    label: type.name,
                                                })) || []),
                                            ],
                                        },
                                        {
                                            name: 'task_status',
                                            label: t('Status'),
                                            type: 'select',
                                            value: taskStatus,
                                            onChange: setTaskStatus,
                                            options: [
                                                { value: 'all', label: t('All Statuses') },
                                                { value: 'not_started', label: t('Not Started') },
                                                { value: 'in_progress', label: t('In Progress') },
                                                { value: 'completed', label: t('Completed') },
                                                { value: 'on_hold', label: t('On Hold') },
                                            ],
                                        },
                                        {
                                            name: 'task_priority',
                                            label: t('Priority'),
                                            type: 'select',
                                            value: taskPriority,
                                            onChange: setTaskPriority,
                                            options: [
                                                { value: 'all', label: t('All Priorities') },
                                                { value: 'critical', label: t('Critical') },
                                                { value: 'high', label: t('High') },
                                                { value: 'medium', label: t('Medium') },
                                                { value: 'low', label: t('Low') },
                                            ],
                                        },
                                        {
                                            name: 'task_assigned_to',
                                            label: t('Assigned To'),
                                            type: 'select',
                                            value: taskAssignedTo,
                                            onChange: setTaskAssignedTo,
                                            options: [
                                                { value: 'all', label: t('All Users') },
                                                ...(users?.map((user: any) => ({
                                                    value: user.id.toString(),
                                                    label: user.name,
                                                })) || []),
                                            ],
                                        },
                                    ]}
                                    showFilters={showTaskFilters}
                                    setShowFilters={setShowTaskFilters}
                                    hasActiveFilters={() =>
                                        taskSearch !== '' ||
                                        taskTypeId !== 'all' ||
                                        taskStatus !== 'all' ||
                                        taskPriority !== 'all' ||
                                        taskAssignedTo !== 'all'
                                    }
                                    activeFilterCount={() =>
                                        (taskSearch ? 1 : 0) +
                                        (taskTypeId !== 'all' ? 1 : 0) +
                                        (taskStatus !== 'all' ? 1 : 0) +
                                        (taskPriority !== 'all' ? 1 : 0) +
                                        (taskAssignedTo !== 'all' ? 1 : 0)
                                    }
                                    onResetFilters={() => {
                                        setTaskSearch('');
                                        setTaskTypeId('all');
                                        setTaskStatus('all');
                                        setTaskPriority('all');
                                        setTaskAssignedTo('all');
                                        router.get(route('cases.show', caseData.id));
                                    }}
                                    onApplyFilters={applyTaskFilters}
                                    currentPerPage={filters.task_per_page?.toString() || '10'}
                                    onPerPageChange={(value) => {
                                        router.get(route('cases.show', caseData.id), {
                                            ...filters,
                                            task_per_page: parseInt(value),
                                        });
                                    }}
                                />
                            </div>

                            <CrudTable
                                columns={[
                                    {
                                        key: 'task_id',
                                        label: t('Task ID'),
                                        sortable: true,
                                    },
                                    {
                                        key: 'title',
                                        label: t('Title'),
                                        sortable: true,
                                    },
                                    {
                                        key: 'task_type',
                                        label: t('Type'),
                                        render: (value: any) => (
                                            <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">
                                                {value?.name || '-'}
                                            </span>
                                        ),
                                    },
                                    {
                                        key: 'priority',
                                        label: t('Priority'),
                                        render: (value: string) => {
                                            const colors = {
                                                critical: 'bg-red-50 text-red-700',
                                                high: 'bg-orange-50 text-orange-700',
                                                medium: 'bg-yellow-50 text-yellow-700',
                                                low: 'bg-green-50 text-green-700',
                                            };
                                            return (
                                                <span
                                                    className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${colors[value as keyof typeof colors] || colors.medium
                                                        }`}
                                                >
                                                    {t(value?.charAt(0).toUpperCase() + value?.slice(1))}
                                                </span>
                                            );
                                        },
                                    },
                                    {
                                        key: 'status',
                                        label: t('Status'),
                                        render: (value: string) => {
                                            const colors = {
                                                not_started: 'bg-gray-50 text-gray-700',
                                                in_progress: 'bg-blue-50 text-blue-700',
                                                completed: 'bg-green-50 text-green-700',
                                                on_hold: 'bg-yellow-50 text-yellow-700',
                                            };
                                            return (
                                                <span
                                                    className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${colors[value as keyof typeof colors] || colors.not_started
                                                        }`}
                                                >
                                                    {t(value?.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase()))}
                                                </span>
                                            );
                                        },
                                    },
                                    {
                                        key: 'assignedUser',
                                        label: t('Assigned To'),
                                        render: (value: any, row: any) => value?.name || row?.assigned_user?.name || (users?.find((u: any) => u.id.toString() === row?.assigned_to?.toString())?.name) || '-',
                                    },
                                    {
                                        key: 'due_date',
                                        label: t('Due Date'),
                                        sortable: true,
                                        type: 'date',
                                    },
                                ]}
                                actions={[
                                    {
                                        label: t('View'),
                                        icon: 'Eye',
                                        action: 'view',
                                        className: 'text-blue-500',
                                    },
                                    {
                                        label: t('Edit'),
                                        icon: 'Edit',
                                        action: 'edit',
                                        className: 'text-amber-500',
                                    },
                                    {
                                        label: t('Change Status'),
                                        icon: 'CheckCircle',
                                        action: 'toggle-status',
                                        className: 'text-green-500',
                                    },
                                    {
                                        label: t('Delete'),
                                        icon: 'Trash2',
                                        action: 'delete',
                                        className: 'text-red-500',
                                    },
                                ]}
                                data={tasks?.data || []}
                                from={tasks?.from || 1}
                                onAction={handleTaskAction}
                                sortField={filters.task_sort_field}
                                sortDirection={filters.task_sort_direction}
                                onSort={handleTaskSort}
                                permissions={permissions}
                                entityPermissions={{
                                    view: 'view-tasks',
                                    create: 'create-tasks',
                                    edit: 'edit-tasks',
                                    delete: 'delete-tasks',
                                }}
                            />

                            <Pagination
                                from={tasks?.from || 0}
                                to={tasks?.to || 0}
                                total={tasks?.total || 0}
                                links={tasks?.links}
                                entityName={t('tasks')}
                                onPageChange={(url) => router.get(url)}
                            />
                        </div>
                    )}

                    {activeTab === 'research-projects' && (
                        <div>
                            {!selectedProject ? (
                                <div>
                                    <div className="mb-6 flex items-center justify-between">
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('Research Projects')}</h3>
                                    </div>

                                    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
                                        <CrudTable
                                            columns={[
                                                { key: 'title', label: t('Project Title'), sortable: true },
                                                { key: 'research_id', label: t('Project ID'), sortable: true },
                                                {
                                                    key: 'priority',
                                                    label: t('Priority'),
                                                    render: (value: string) => (
                                                        <span
                                                            className={`inline-flex items-center rounded px-2 py-1 text-xs font-medium ${value === 'urgent'
                                                                    ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                                                    : value === 'high'
                                                                        ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
                                                                        : value === 'medium'
                                                                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                                                                            : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                                                                }`}
                                                        >
                                                            {t(value?.charAt(0).toUpperCase() + value?.slice(1))}
                                                        </span>
                                                    ),
                                                },
                                                {
                                                    key: 'status',
                                                    label: t('Status'),
                                                    render: (value: string) => (
                                                        <span
                                                            className={`inline-flex items-center rounded px-2 py-1 text-xs font-medium ${value === 'active'
                                                                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                                                    : value === 'completed'
                                                                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                                                                        : value === 'on_hold'
                                                                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                                                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                                                }`}
                                                        >
                                                            {t(value?.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase()))}
                                                        </span>
                                                    ),
                                                },
                                            ]}
                                            actions={[{ label: t('View Details'), icon: 'Eye', action: 'view', className: 'text-blue-500' }]}
                                            data={researchProjects?.data || []}
                                            from={researchProjects?.from || 1}
                                            onAction={(action, project) => {
                                                if (action === 'view') {
                                                    setSelectedProject(project);
                                                    setProjectSubTab('details');
                                                }
                                            }}
                                            permissions={permissions}
                                            entityPermissions={{
                                                view: 'view-research-projects',
                                            }}
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    <div className="mb-6 flex items-center justify-between">
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{selectedProject.title}</h3>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">{selectedProject.research_id}</p>
                                        </div>
                                        <button
                                            onClick={() => setSelectedProject(null)}
                                            className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                                        >
                                            <ArrowLeft className="h-4 w-4" />
                                            {t('Back to Projects')}
                                        </button>
                                    </div>

                                    {/* Project Details Card */}
                                    <div className="mb-6 rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
                                        <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
                                            <div>
                                                <span className="font-medium text-gray-500 dark:text-gray-400">{t('Research Type')}:</span>
                                                <p className="text-gray-900 dark:text-white">{selectedProject.research_type?.name || '-'}</p>
                                            </div>
                                            <div>
                                                <span className="font-medium text-gray-500 dark:text-gray-400">{t('Due Date')}:</span>
                                                <p className="text-gray-900 dark:text-white">
                                                    {selectedProject.due_date ? (window.appSettings?.formatDate(selectedProject.due_date) || new Date(selectedProject.due_date).toLocaleDateString()) : '-'}
                                                </p>
                                            </div>
                                            <div>
                                                <span className="font-medium text-gray-500 dark:text-gray-400">{t('Priority')}:</span>
                                                <span
                                                    className={`ml-2 inline-flex items-center rounded px-2 py-1 text-xs font-medium ${selectedProject.priority === 'urgent'
                                                            ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                                            : selectedProject.priority === 'high'
                                                                ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
                                                                : selectedProject.priority === 'medium'
                                                                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                                                                    : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                                                        }`}
                                                >
                                                    {t(selectedProject.priority?.charAt(0).toUpperCase() + selectedProject.priority?.slice(1))}
                                                </span>
                                            </div>
                                            <div>
                                                <span className="font-medium text-gray-500 dark:text-gray-400">{t('Status')}:</span>
                                                <span
                                                    className={`ml-2 inline-flex items-center rounded px-2 py-1 text-xs font-medium ${selectedProject.status === 'active'
                                                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                                            : selectedProject.status === 'completed'
                                                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                                                                : selectedProject.status === 'on_hold'
                                                                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                                                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                                        }`}
                                                >
                                                    {t(selectedProject.status?.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase()))}
                                                </span>
                                            </div>
                                        </div>

                                        {selectedProject.description && (
                                            <div className="mt-4 border-t border-gray-200 pt-4 dark:border-gray-700">
                                                <span className="font-medium text-gray-500 dark:text-gray-400">{t('Description')}:</span>
                                                <p className="mt-1 text-gray-900 dark:text-white">{selectedProject.description}</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Project Sub-tabs */}
                                    <div className="mb-6 overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
                                        <div className="border-b border-gray-200 dark:border-gray-700">
                                            <nav className="flex">
                                                <button
                                                    onClick={() => setProjectSubTab('notes')}
                                                    className={`flex-shrink-0 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${projectSubTab === 'notes'
                                                            ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                                                            : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                                                        }`}
                                                >
                                                    <div className="flex items-center space-x-2">
                                                        <FileText className="h-4 w-4" />
                                                        <span>
                                                            {t('Notes')} ({selectedProject.notes?.length || 0})
                                                        </span>
                                                    </div>
                                                </button>
                                                <button
                                                    onClick={() => setProjectSubTab('citations')}
                                                    className={`flex-shrink-0 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${projectSubTab === 'citations'
                                                            ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                                                            : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                                                        }`}
                                                >
                                                    <div className="flex items-center space-x-2">
                                                        <FileText className="h-4 w-4" />
                                                        <span>
                                                            {t('Citations')} ({selectedProject.citations?.length || 0})
                                                        </span>
                                                    </div>
                                                </button>
                                            </nav>
                                        </div>

                                        <div className="p-6">
                                            {projectSubTab === 'notes' && (
                                                <div className="overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
                                                    <CrudTable
                                                        columns={[
                                                            { key: 'title', label: t('Title'), sortable: true },
                                                            {
                                                                key: 'note_content',
                                                                label: t('Content'),
                                                                render: (value: string) => value?.substring(0, 50) + '...' || '-',
                                                            },
                                                            {
                                                                key: 'source_reference',
                                                                label: t('Source Reference'),
                                                                render: (value: string) => value || '-',
                                                            },
                                                            {
                                                                key: 'created_at',
                                                                label: t('Created'),
                                                                type: 'date',
                                                            },
                                                        ]}
                                                        actions={[{ label: t('View'), icon: 'Eye', action: 'view', className: 'text-blue-500' }]}
                                                        data={selectedProject.notes || []}
                                                        from={1}
                                                        onAction={(action, note) => {
                                                            if (action === 'view') {
                                                                setSelectedNote(note);
                                                                setIsNoteViewModalOpen(true);
                                                            }
                                                        }}
                                                        permissions={permissions}
                                                        entityPermissions={{
                                                            view: 'view-research-notes',
                                                        }}
                                                    />
                                                </div>
                                            )}

                                            {projectSubTab === 'citations' && (
                                                <div className="overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
                                                    <CrudTable
                                                        columns={[
                                                            {
                                                                key: 'citation_text',
                                                                label: t('Citation'),
                                                                render: (value: string) => <span className="">{value}</span>,
                                                            },
                                                            {
                                                                key: 'citation_type',
                                                                label: t('Type'),
                                                                render: (value: string) => (
                                                                    <span
                                                                        className={`inline-flex items-center rounded px-2 py-1 text-xs font-medium ${value === 'case'
                                                                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                                                                                : value === 'statute'
                                                                                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                                                                    : value === 'article'
                                                                                        ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                                                                                        : value === 'book'
                                                                                            ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
                                                                                            : value === 'website'
                                                                                                ? 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200'
                                                                                                : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                                                                            }`}
                                                                    >
                                                                        {t(value?.charAt(0).toUpperCase() + value?.slice(1))}
                                                                    </span>
                                                                ),
                                                            },
                                                            { key: 'source', label: t('Source'), render: (value: any) => value?.source_name || '-' },
                                                            {
                                                                key: 'created_at',
                                                                label: t('Created'),
                                                                type: 'date',
                                                            },
                                                        ]}
                                                        actions={[{ label: t('View'), icon: 'Eye', action: 'view', className: 'text-blue-500' }]}
                                                        data={selectedProject.citations || []}
                                                        from={1}
                                                        onAction={(action, citation) => {
                                                            if (action === 'view') {
                                                                setSelectedCitation(citation);
                                                                setIsCitationModalOpen(true);
                                                            }
                                                        }}
                                                        permissions={permissions}
                                                        entityPermissions={{
                                                            view: 'view-research-citations',
                                                        }}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Timeline Form Modal */}
            {activeTab === 'timelines' && (
                <CrudFormModal
                    isOpen={isFormModalOpen}
                    onClose={() => setIsFormModalOpen(false)}
                    onSubmit={handleTimelineSubmit}
                    formConfig={{
                        fields: [
                            { name: 'title', label: t('Event Title'), type: 'text', required: true },
                            { name: 'description', label: t('Description'), type: 'textarea' },
                            {
                                name: 'event_type',
                                label: t('Event Type'),
                                type: 'select',
                                required: true,
                                options: [
                                    { value: 'milestone', label: t('Milestone') },
                                    { value: 'hearing', label: t('Hearing') },
                                    { value: 'deadline', label: t('Deadline') },
                                    { value: 'meeting', label: t('Meeting') },
                                ],
                            },
                            { name: 'event_date', label: t('Event Date'), type: 'date', required: true },
                            { name: 'is_completed', label: t('Completed'), type: 'checkbox' },
                            {
                                name: 'status',
                                label: t('Status'),
                                type: 'select',
                                options: [
                                    { value: 'active', label: t('Active') },
                                    { value: 'inactive', label: t('Inactive') },
                                ],
                                defaultValue: 'active',
                            },
                        ],
                        modalSize: 'lg',
                    }}
                    initialData={currentItem}
                    title={
                        formMode === 'create' ? t('Add Timeline Event') : formMode === 'edit' ? t('Edit Timeline Event') : t('View Timeline Event')
                    }
                    mode={formMode}
                />
            )}

            {/* Team Form Modal */}
            {activeTab === 'team' && (
                <CrudFormModal
                    isOpen={isFormModalOpen}
                    onClose={() => setIsFormModalOpen(false)}
                    onSubmit={handleTeamSubmit}
                    formConfig={{
                        fields: [
                            {
                                name: 'user_id',
                                label: t('Team Member'),
                                type: 'select',
                                required: true,
                                options: users
                                    ? [
                                        ...users.map((user: any) => ({
                                            value: user.id.toString(),
                                            label: `${user.name} (${user.email})`,
                                        })),
                                        {
                                            value: auth.user.id.toString(),
                                            label: `${auth.user.name} (Me)`,
                                        },
                                    ]
                                    : [
                                        {
                                            value: auth.user.id.toString(),
                                            label: `${auth.user.name} (Me)`,
                                        },
                                    ],
                            },

                            {
                                name: 'assigned_date',
                                label: t('Assigned Date'),
                                type: 'date',
                                required: true,
                                defaultValue: new Date().toISOString().split('T')[0],
                            },
                            {
                                name: 'status',
                                label: t('Status'),
                                type: 'select',
                                options: [
                                    { value: 'active', label: t('Active') },
                                    { value: 'inactive', label: t('Inactive') },
                                ],
                                defaultValue: 'active',
                            },
                        ],
                        modalSize: 'lg',
                    }}
                    initialData={currentItem}
                    title={formMode === 'create' ? t('Add Team Member') : t('Edit Team Member')}
                    mode={formMode}
                />
            )}

            {/* View Team Member Modal */}
            {activeTab === 'team' && (
                <CrudFormModal
                    isOpen={isViewTeamModalOpen}
                    onClose={() => setIsViewTeamModalOpen(false)}
                    onSubmit={() => {}}
                    formConfig={{
                        fields: [
                            {
                                name: 'user_id',
                                label: t('Team Member'),
                                type: 'select',
                                options: users
                                    ? [
                                        ...users.map((user: any) => ({
                                            value: user.id.toString(),
                                            label: `${user.name} (${user.email})`,
                                        })),
                                        {
                                            value: auth.user.id.toString(),
                                            label: `${auth.user.name} (Me)`,
                                        },
                                    ]
                                    : [
                                        {
                                            value: auth.user.id.toString(),
                                            label: `${auth.user.name} (Me)`,
                                        },
                                    ],
                            },
                            {
                                name: 'assigned_date',
                                label: t('Assigned Date'),
                                type: 'date'
                            },
                            {
                                name: 'status',
                                label: t('Status'),
                                type: 'select',
                                options: [
                                    { value: 'active', label: t('Active') },
                                    { value: 'inactive', label: t('Inactive') },
                                ]
                            },
                            { name: 'created_at', label: t('Created Date'), type: 'text' }
                        ],
                        modalSize: 'lg',
                    }}
                    initialData={{
                        ...currentItem,
                        user_id: currentItem?.user?.id,
                        created_at: currentItem?.created_at ? (window.appSettings?.formatDate(currentItem.created_at) || new Date(currentItem.created_at).toLocaleDateString()) : ''                    }}
                    title={t('View Team Member')}
                    mode="view"
                />
            )}

            {/* Document Form Modal */}
            {activeTab === 'documents' && (
                <CrudFormModal
                    isOpen={isFormModalOpen}
                    onClose={() => setIsFormModalOpen(false)}
                    onSubmit={handleDocumentSubmit}
                    formConfig={{
                        fields: [
                            { name: 'document_name', label: t('Document Name'), type: 'text', required: true },
                            { name: 'file', label: t('File'), type: 'media-picker', required: formMode === 'create' },
                            {
                                name: 'document_type_id',
                                label: t('Document Type'),
                                type: 'select',
                                required: true,
                                options: documentTypes
                                    ? documentTypes.map((type: any) => ({
                                        value: type.id.toString(),
                                        label: type.name,
                                    }))
                                    : [],
                            },
                            {
                                name: 'confidentiality',
                                label: t('Confidentiality Level'),
                                type: 'select',
                                required: true,
                                options: [
                                    { value: 'public', label: t('Public') },
                                    { value: 'confidential', label: t('Confidential') },
                                    { value: 'privileged', label: t('Privileged') },
                                ],
                            },
                            { name: 'document_date', label: t('Document Date'), type: 'date' },
                            { name: 'description', label: t('Description'), type: 'textarea' },
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
                    initialData={{
                        ...currentItem,
                        document_type_id: currentItem?.document_type_id,
                        file: currentItem?.file_path
                    }}
                    title={formMode === 'create' ? t('Add Case Document') : t('Edit Case Document')}
                    mode={formMode}
                />
            )}

            {/* View Document Modal */}
            {activeTab === 'documents' && (
                <CrudFormModal
                    isOpen={isDocumentViewModalOpen}
                    onClose={() => setIsDocumentViewModalOpen(false)}
                    onSubmit={() => {}}
                    formConfig={{
                        fields: [
                            { name: 'document_name', label: t('Document Name'), type: 'text' },
                            { name: 'document_type_name', label: t('Document Type'), type: 'text' },
                            { name: 'confidentiality', label: t('Confidentiality Level'), type: 'text' },
                            { name: 'document_date', label: t('Document Date'), type: 'text' },
                            { name: 'description', label: t('Description'), type: 'textarea' },
                            { name: 'status', label: t('Status'), type: 'text' },
                            { name: 'created_at', label: t('Created At'), type: 'text' },
                            { name: 'updated_at', label: t('Last Updated'), type: 'text' }
                        ],
                        modalSize: 'xl',
                    }}
                    initialData={{
                        ...currentItem,
                        document_type_name: documentTypes?.find((type: any) => type.id.toString() === currentItem?.document_type_id?.toString())?.name || '-',
                        document_date: currentItem?.document_date ? new Date(currentItem.document_date).toLocaleDateString() : '-',
                        created_at: currentItem?.created_at ? new Date(currentItem.created_at).toLocaleDateString() : '-',
                        updated_at: currentItem?.updated_at ? new Date(currentItem.updated_at).toLocaleDateString() : '-'
                    }}
                    title={t('View Case Document')}
                    mode="view"
                />
            )}

            {/* Note Form Modal */}
            {activeTab === 'notes' && (
                <CrudFormModal
                    isOpen={isFormModalOpen}
                    onClose={() => setIsFormModalOpen(false)}
                    onSubmit={handleNoteSubmit}
                    formConfig={{
                        fields: [
                            { name: 'title', label: t('Title'), type: 'text', required: true },
                            { name: 'content', label: t('Content'), type: 'textarea', required: true },
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
                                ],
                            },
                            {
                                name: 'priority',
                                label: t('Priority'),
                                type: 'select',
                                options: [
                                    { value: 'low', label: t('Low') },
                                    { value: 'medium', label: t('Medium') },
                                    { value: 'high', label: t('High') },
                                    { value: 'urgent', label: t('Urgent') },
                                ],
                                defaultValue: 'medium',
                            },
                            { name: 'is_private', label: t('Private Note'), type: 'checkbox' },
                            { name: 'tags', label: t('Tags (comma separated)'), type: 'text' },
                        ],
                        modalSize: 'lg',
                    }}
                    initialData={currentItem}
                    title={formMode === 'create' ? t('Add Case Note') : formMode === 'edit' ? t('Edit Case Note') : t('View Case Note')}
                    mode={formMode}
                />
            )}

            {/* Task Form Modal */}
            {activeTab === 'tasks' && (
                <CrudFormModal
                    isOpen={isFormModalOpen}
                    onClose={() => setIsFormModalOpen(false)}
                    onSubmit={handleTaskSubmit}
                    formConfig={{
                        fields: [
                            { name: 'title', label: t('Title'), type: 'text', required: true },
                            { name: 'description', label: t('Description'), type: 'textarea' },
                            {
                                name: 'priority',
                                label: t('Priority'),
                                type: 'select',
                                required: true,
                                options: [
                                    { value: 'critical', label: t('Critical') },
                                    { value: 'high', label: t('High') },
                                    { value: 'medium', label: t('Medium') },
                                    { value: 'low', label: t('Low') },
                                ],
                                defaultValue: 'medium',
                            },
                            { name: 'due_date', label: t('Due Date'), type: 'date' },
                            { name: 'estimated_duration', label: t('Estimated Duration (hours)'), type: 'number' },
                            {
                                name: 'assigned_to',
                                label: t('Assigned To'),
                                type: 'select',
                                options: [
                                    { value: auth.user.id.toString(), label: `${auth.user.name} (Me)` },
                                    ...(users?.map((user: any) => ({
                                        value: user.id.toString(),
                                        label: user.name,
                                    })) || []),
                                ],
                            },
                            {
                                name: 'task_type_id',
                                label: t('Task Type'),
                                type: 'select',
                                options: [
                                    ...(taskTypes?.map((type: any) => ({
                                        value: type.id.toString(),
                                        label: type.name,
                                    })) || []),
                                ],
                            },
                            {
                                name: 'task_status_id',
                                label: t('Task Status'),
                                type: 'select',
                                options: [
                                    ...(taskStatuses?.map((status: any) => ({
                                        value: status.id.toString(),
                                        label: status.name,
                                    })) || []),
                                ],
                            },
                            { name: 'notes', label: t('Notes'), type: 'textarea' },
                        ],
                        modalSize: 'lg',
                    }}
                    initialData={currentItem}
                    title={formMode === 'create' ? t('Add Task') : formMode === 'edit' ? t('Edit Task') : t('View Task')}
                    mode={formMode}
                />
            )}

            {/* Task View Modal */}
            {activeTab === 'tasks' && (
                <CrudFormModal
                    isOpen={isTaskViewModalOpen}
                    onClose={() => setIsTaskViewModalOpen(false)}
                    onSubmit={() => {}}
                    formConfig={{
                        fields: [
                            { name: 'task_id', label: t('Task ID'), type: 'text' },
                            { name: 'title', label: t('Title'), type: 'text' },
                            { name: 'description', label: t('Description'), type: 'textarea' },
                            { name: 'priority', label: t('Priority'), type: 'text' },
                            { name: 'status', label: t('Status'), type: 'text' },
                            { name: 'due_date', label: t('Due Date'), type: 'text' },
                            { name: 'estimated_duration', label: t('Estimated Duration'), type: 'text' },
                            { name: 'assigned_to_name', label: t('Assigned To'), type: 'text' },
                            { name: 'task_type_name', label: t('Task Type'), type: 'text' },
                            { name: 'task_status_name', label: t('Task Status'), type: 'text' },
                            { name: 'notes', label: t('Notes'), type: 'textarea' },
                            { name: 'created_at', label: t('Created At'), type: 'text' },
                            { name: 'updated_at', label: t('Updated At'), type: 'text' }
                        ],
                        modalSize: 'lg',
                    }}
                    initialData={{
                        ...currentItem,
                        priority: currentItem?.priority ? t(currentItem.priority.charAt(0).toUpperCase() + currentItem.priority.slice(1)) : '-',
                        status: currentItem?.status ? t(currentItem.status.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())) : '-',
                        due_date: currentItem?.due_date ? (window.appSettings?.formatDate(currentItem.due_date) || new Date(currentItem.due_date).toLocaleDateString()) : '-',
                        estimated_duration: currentItem?.estimated_duration ? `${currentItem.estimated_duration} hours` : '-',
                        assigned_to_name: currentItem?.assignedUser?.name || currentItem?.assigned_user?.name || (users?.find((u: any) => u.id.toString() === currentItem?.assigned_to?.toString())?.name) || '-',
                        task_type_name: currentItem?.taskType?.name || currentItem?.task_type?.name || '-',
                        task_status_name: currentItem?.taskStatus?.name || currentItem?.task_status?.name || '-',
                        created_at: currentItem?.created_at ? (window.appSettings?.formatDate(currentItem.created_at) || new Date(currentItem.created_at).toLocaleDateString()) : '-',
                        updated_at: currentItem?.updated_at ? (window.appSettings?.formatDate(currentItem.updated_at) || new Date(currentItem.updated_at).toLocaleDateString()) : '-'
                    }}
                    title={t('View Task')}
                    mode="view"
                />
            )}

            {/* Task Status Change Modal */}
            {activeTab === 'tasks' && (
                <CrudFormModal
                    isOpen={isStatusModalOpen}
                    onClose={() => setIsStatusModalOpen(false)}
                    onSubmit={handleTaskStatusChange}
                    formConfig={{
                        fields: [
                            {
                                name: 'status',
                                label: t('Status'),
                                type: 'select',
                                required: true,
                                options: [
                                    { value: 'not_started', label: t('Not Started') },
                                    { value: 'in_progress', label: t('In Progress') },
                                    { value: 'completed', label: t('Completed') },
                                    { value: 'on_hold', label: t('On Hold') },
                                ],
                            },
                        ],
                        modalSize: 'sm',
                    }}
                    initialData={currentItem ? { status: currentItem.status } : null}
                    title={t('Change Task Status')}
                    mode="edit"
                />
            )}

            <CrudDeleteModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDeleteConfirm}
                itemName={currentItem?.title || currentItem?.user?.name || currentItem?.document_name || ''}
                entityName={
                    activeTab === 'timelines'
                        ? 'timeline event'
                        : activeTab === 'team'
                            ? 'team member'
                            : activeTab === 'tasks'
                                ? 'task'
                                : 'document'
                }
            />

            {/* Citation Details Modal */}
            <CrudFormModal
                isOpen={isCitationModalOpen}
                onClose={() => setIsCitationModalOpen(false)}
                onSubmit={() => { }}
                formConfig={{
                    fields: [
                        { name: 'citation_text', label: t('Citation Text'), type: 'textarea' },
                        { name: 'citation_type', label: t('Type'), type: 'text' },
                        { name: 'source_name', label: t('Source'), type: 'text' },
                        { name: 'notes', label: t('Notes'), type: 'textarea' },
                        { name: 'created_at', label: t('Created'), type: 'text' },
                    ],
                    modalSize: 'lg',
                }}
                initialData={{
                    ...selectedCitation,
                    source_name: selectedCitation?.source?.source_name || '-',
                    created_at: selectedCitation?.created_at ? new Date(selectedCitation.created_at).toLocaleDateString() : '-',
                }}
                title={t('Citation Details')}
                mode="view"
            />

            {/* Note Details Modal */}
            <CrudFormModal
                isOpen={isNoteViewModalOpen}
                onClose={() => setIsNoteViewModalOpen(false)}
                onSubmit={() => { }}
                formConfig={{
                    fields: [
                        { name: 'title', label: t('Title'), type: 'text' },
                        { name: 'note_content', label: t('Content'), type: 'textarea' },
                        { name: 'source_reference', label: t('Source Reference'), type: 'text' },
                        { name: 'created_at', label: t('Created'), type: 'text' },
                    ],
                    modalSize: 'lg',
                }}
                initialData={{
                    ...selectedNote,
                    created_at: selectedNote?.created_at ? new Date(selectedNote.created_at).toLocaleDateString() : '-',
                }}
                title={t('Note Details')}
                mode="view"
            />
        </PageTemplate>
    );
}
