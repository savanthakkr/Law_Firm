import { PageTemplate } from '@/components/page-template';
import { router, usePage } from '@inertiajs/react';
import { ArrowLeft, Download, FileText, MessageSquare, Shield, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function DocumentShow() {
    const { t } = useTranslation();
    const { document: documentData, latestVersion, comments, permissions } = usePage().props as any;



    const breadcrumbs = [
        { title: t('Dashboard'), href: route('dashboard') },
        { title: t('Document Management'), href: route('document-management.documents.index') },
        { title: documentData.name },
    ];

    const pageActions = [
        {
            label: t('Back to Documents'),
            icon: <ArrowLeft className="mr-2 h-4 w-4" />,
            variant: 'outline',
            onClick: () => router.get(route('document-management.documents.index')),
        },
    ];

    return (
        <PageTemplate url={`/document-management/documents/${documentData.id}`} actions={pageActions} breadcrumbs={breadcrumbs} noPadding>
            {/* Document Header */}
            <div className="mb-6 rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
                <div className="p-6">
                    <div className="mb-4 flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="rounded-lg bg-gray-100 p-2 dark:bg-gray-800">
                                <FileText className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-gray-900 dark:text-white">{documentData.name}</h1>
                                <p className="text-sm text-gray-600 dark:text-gray-400">{documentData.document_type?.name}</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3">
                            <span
                                className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                                    documentData.status === 'draft'
                                        ? 'bg-gray-50 text-gray-700 ring-gray-600/20'
                                        : documentData.status === 'review'
                                          ? 'bg-yellow-50 text-yellow-700 ring-yellow-600/20'
                                          : documentData.status === 'final'
                                            ? 'bg-green-50 text-green-700 ring-green-600/20'
                                            : documentData.status === 'archived'
                                              ? 'bg-red-50 text-red-700 ring-red-600/20'
                                              : 'bg-gray-50 text-gray-700 ring-gray-600/20'
                                }`}
                            >
                                {t(documentData.status?.charAt(0).toUpperCase() + documentData.status?.slice(1))}
                            </span>
                            <button
                                onClick={() => {
                                    const link = window.document.createElement('a');
                                    link.href = documentData.file_path;
                                    link.download = documentData.name;
                                    link.click();
                                }}
                                className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-50"
                            >
                                <Download className="mr-1 h-4 w-4" />
                                {t('Download')}
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-4 gap-4 text-sm md:grid-cols-5">
                        <div>
                            <span className="font-medium text-gray-500 dark:text-gray-400">{t('Version')}:</span>
                            <p className="text-gray-900 dark:text-white">{latestVersion?.version_number || '1.0'}</p>
                        </div>

                        <div>
                            <span className="font-medium text-gray-500 dark:text-gray-400">{t('Created')}:</span>
                            <p className="text-gray-900 dark:text-white">{window.appSettings?.formatDateTime(documentData.created_at) || new Date(documentData.created_at).toLocaleDateString()}</p>
                        </div>
                        <div>
                            <span className="font-medium text-gray-500 dark:text-gray-400">{t('Updated')}:</span>
                            <p className="text-gray-900 dark:text-white">{window.appSettings?.formatDateTime(documentData.updated_at) || new Date(documentData.updated_at).toLocaleDateString()}</p>
                        </div>
                        <div>
                            <span className="font-medium text-gray-500 dark:text-gray-400">{t('Confidentiality')}:</span>
                            <p>
                              <span
                                className={`ml-2 inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                                    documentData.confidentiality === 'public'
                                        ? 'bg-blue-50 text-blue-700 ring-blue-600/20'
                                        : documentData.confidentiality === 'internal'
                                          ? 'bg-gray-50 text-gray-700 ring-gray-600/20'
                                          : documentData.confidentiality === 'confidential'
                                            ? 'bg-orange-50 text-orange-700 ring-orange-600/20'
                                            : documentData.confidentiality === 'restricted'
                                              ? 'bg-red-50 text-red-700 ring-red-600/20'
                                              : 'bg-gray-50 text-gray-700 ring-gray-600/20'
                                }`}
                            >
                                {t(documentData.confidentiality?.charAt(0).toUpperCase() + documentData.confidentiality?.slice(1))}
                            </span>
                            </p>
                        </div>
                    </div>

                    {documentData.description && (
                        <div className="mt-4 border-t border-gray-200 pt-4 dark:border-gray-700">
                            <span className="font-medium text-gray-500 dark:text-gray-400">{t('Description')}:</span>
                            <p className="mt-1 text-gray-900 dark:text-white">{documentData.description}</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Document Permissions */}
            {permissions && permissions.length > 0 && (
                <div className="mb-6 rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
                    <div className="p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-2">
                                <Shield className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('Access Permissions')}</h2>
                                <p className="text-sm text-gray-600 dark:text-gray-400">{permissions.length} {t('users have access')}</p>
                            </div>
                        </div>
                        
                        <div className="space-y-3">
                            {permissions.map((permission: any) => (
                                <div key={permission.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                                            <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">
                                                {permission.user?.name?.charAt(0)?.toUpperCase()}
                                            </span>
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900 dark:text-white">{permission.user?.name}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">{permission.user?.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                                            {t(permission.permission_type?.charAt(0).toUpperCase() + permission.permission_type?.slice(1))}
                                        </span>
                                        {permission.expires_at && (
                                            <div className="flex items-center gap-1 text-xs text-gray-500">
                                                <Clock className="h-3 w-3" />
                                                <span>{window.appSettings?.formatDate(permission.expires_at) || new Date(permission.expires_at).toLocaleDateString()}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Document Comments */}
            {comments && comments.length > 0 && (
                <div className="mb-6 rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
                    <div className="p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-2">
                                <MessageSquare className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('Recent Comments')}</h2>
                                <p className="text-sm text-gray-600 dark:text-gray-400">{comments.length} {t('recent comments')}</p>
                            </div>
                        </div>
                        
                        <div className="space-y-4">
                            {comments.map((comment: any) => (
                                <div key={comment.id} className="border-l-4 border-gray-200 dark:border-gray-700 pl-4">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="h-6 w-6 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                                                <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                                                    {comment.creator?.name?.charAt(0)?.toUpperCase()}
                                                </span>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-900 dark:text-white">{comment.creator?.name}</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">{window.appSettings?.formatDateTime(comment.created_at) || new Date(comment.created_at).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {comment.is_resolved ? (
                                                <>
                                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                                    <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 dark:bg-green-900 dark:text-green-300">
                                                        {t('Resolved')}
                                                    </span>
                                                </>
                                            ) : (
                                                <>
                                                    <XCircle className="h-4 w-4 text-orange-500" />
                                                    <span className="inline-flex items-center rounded-md bg-orange-50 px-2 py-1 text-xs font-medium text-orange-700 dark:bg-orange-900 dark:text-orange-300">
                                                        {t('Open')}
                                                    </span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-700 dark:text-gray-300 ml-9">{comment.comment_text}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

        </PageTemplate>
    );
}
