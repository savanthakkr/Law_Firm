import { PageTemplate } from '@/components/page-template';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { usePage } from '@inertiajs/react';
import { Calendar, Copy, Download, File, FileText, HardDrive, Image as ImageIcon, Info, MoreHorizontal, Plus, Search, Upload, X } from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

interface MediaItem {
    id: number;
    name: string;
    file_name: string;
    url: string;
    thumb_url: string;
    size: number;
    mime_type: string;
    created_at: string;
}

export default function MediaLibraryDemo() {
    const { t } = useTranslation();
    const { csrf_token, storageSettings } = usePage().props as any;

    const allowedTypes = storageSettings?.allowed_file_types || 'jpg,png,webp,gif';
    const acceptAttribute = allowedTypes
        .split(',')
        .map((type) => `.${type.trim()}`)
        .join(',');
    const [media, setMedia] = useState<MediaItem[]>([]);
    const [filteredMedia, setFilteredMedia] = useState<MediaItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [dragActive, setDragActive] = useState(false);

    const [infoModalOpen, setInfoModalOpen] = useState(false);
    const [selectedMediaInfo, setSelectedMediaInfo] = useState<MediaItem | null>(null);
    const itemsPerPage = 12;

    const fetchMedia = useCallback(async () => {
        setLoading(true);
        try {
            const response = await fetch(route('api.media.index'), {
                credentials: 'same-origin',
                headers: {
                    Accept: 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            setMedia(data);
            setFilteredMedia(data);
        } catch (error) {
            console.error('Failed to load media:', error);
            toast.error('Failed to load media');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchMedia();
    }, [fetchMedia]);

    useEffect(() => {
        const filtered = media.filter(
            (item) => item.name.toLowerCase().includes(searchTerm.toLowerCase()) || item.file_name.toLowerCase().includes(searchTerm.toLowerCase()),
        );
        setFilteredMedia(filtered);
        setCurrentPage(1);
    }, [searchTerm, media]);

    const handleFileUpload = async (files: FileList) => {
        setUploading(true);

        const allowedExtensions = allowedTypes.split(',').map((type) => type.trim().toLowerCase());

        const validFiles = Array.from(files).filter((file) => {
            const fileExtension = file.name.split('.').pop()?.toLowerCase();
            if (!fileExtension || !allowedExtensions.includes(fileExtension)) {
                toast.error(`${file.name} - File type not allowed. Allowed types: ${allowedTypes}`);
                return false;
            }
            return true;
        });

        if (validFiles.length === 0) {
            setUploading(false);
            return;
        }

        const formData = new FormData();
        validFiles.forEach((file) => {
            formData.append('files[]', file);
        });

        try {
            const response = await fetch(route('api.media.batch'), {
                method: 'POST',
                body: formData,
                credentials: 'same-origin',
                headers: {
                    'X-CSRF-TOKEN': csrf_token,
                    'X-Requested-With': 'XMLHttpRequest',
                },
            });

            const result = await response.json();

            if (response.ok) {
                setMedia((prev) => [...result.data, ...prev]);
                toast.success(result.message);

                // Show individual errors if any
                if (result.errors && result.errors.length > 0) {
                    result.errors.forEach((error: string) => {
                        toast.error(error);
                    });
                }
            } else {
                // Show individual errors if available, otherwise show main message
                if (result.errors && result.errors.length > 0) {
                    result.errors.forEach((error: string) => {
                        toast.error(error);
                    });
                } else {
                    toast.error(result.message || 'Failed to upload files');
                }
            }
        } catch (error) {
            toast.error('Error uploading files');
        }

        setUploading(false);
        setIsUploadModalOpen(false);
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileUpload(e.dataTransfer.files);
        }
    };

    const deleteMedia = async (id: number) => {
        try {
            const response = await fetch(route('api.media.destroy', id), {
                method: 'DELETE',
                credentials: 'same-origin',
                headers: {
                    'X-CSRF-TOKEN': csrf_token,
                    'X-Requested-With': 'XMLHttpRequest',
                },
            });

            if (response.ok) {
                setMedia((prev) => prev.filter((item) => item.id !== id));
                toast.success('Media deleted successfully');
            } else {
                toast.error('Failed to delete media');
            }
        } catch (error) {
            toast.error('Error deleting media');
        }
    };

    const handleCopyLink = (url: string) => {
        navigator.clipboard.writeText(url);
        toast.success('Image URL copied to clipboard');
    };

    const handleDownload = (id: number, filename: string) => {
        const link = document.createElement('a');
        link.href = route('api.media.download', id);
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success('Download started');
    };

    const handleShowInfo = (item: MediaItem) => {
        setSelectedMediaInfo(item);
        setInfoModalOpen(true);
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString();
    };

    const getFileIcon = (mimeType: string, fileName: string = '') => {
        if (
            mimeType.startsWith('image/') ||
            mimeType.startsWith('video/') ||
            mimeType.startsWith('audio/') ||
            fileName.toLowerCase().endsWith('.mp3')
        ) {
            return null; // Show actual image/video/audio
        }
        if (mimeType === 'application/pdf' || mimeType.includes('pdf')) {
            return (
                <div className="flex flex-col items-center">
                    <div className="mb-1 flex h-12 w-12 items-center justify-center rounded-lg bg-red-100">
                        <FileText className="h-8 w-8 text-red-600" />
                    </div>
                    <span className="text-xs font-medium text-red-600">PDF</span>
                </div>
            );
        }
        if (mimeType.includes('word') || mimeType.includes('document')) {
            return (
                <div className="flex flex-col items-center">
                    <div className="mb-1 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                        <FileText className="h-8 w-8 text-blue-600" />
                    </div>
                    <span className="text-xs font-medium text-blue-600">DOC</span>
                </div>
            );
        }
        if (mimeType === 'text/csv' || mimeType.includes('spreadsheet')) {
            return <FileText className="h-12 w-12 text-green-500" />;
        }
        return <File className="h-12 w-12 text-gray-500" />;
    };

    const getFileTypeLabel = (mimeType: string) => {
        if (mimeType.startsWith('image/')) {
            return mimeType.split('/')[1].toUpperCase();
        }
        if (mimeType.startsWith('video/')) {
            return mimeType.split('/')[1].toUpperCase();
        }
        if (mimeType.startsWith('audio/')) {
            return mimeType.split('/')[1].toUpperCase();
        }
        if (mimeType === 'application/pdf' || mimeType.includes('pdf')) {
            return 'PDF';
        }
        if (mimeType.includes('word') || mimeType.includes('document')) {
            return 'DOC';
        }
        if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) {
            return 'XLS';
        }
        if (mimeType === 'text/csv') {
            return 'CSV';
        }
        return mimeType.split('/')[1].toUpperCase();
    };

    const totalPages = Math.ceil(filteredMedia.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentMedia = filteredMedia.slice(startIndex, startIndex + itemsPerPage);

    const breadcrumbs = [{ title: t('Dashboard'), href: '/dashboard' }, { title: t('Examples'), href: '/examples' }, { title: t('Media Library') }];

    const pageActions = [
        {
            label: t('Upload Media'),
            icon: <Plus className="h-4 w-4" />,
            variant: 'default' as const,
            onClick: () => setIsUploadModalOpen(true),
        },
    ];

    return (
        <PageTemplate title={t('Media Library Demo')} url="/examples/media-library-demo" breadcrumbs={breadcrumbs} actions={pageActions}>
            <div className="space-y-6">
                {/* Search and Stats Bar */}
                <Card>
                    <CardContent className="p-4">
                        <div className="flex flex-col gap-4 lg:flex-row">
                            {/* Search Section */}
                            <div className="flex-1">
                                <div className="relative max-w-sm">
                                    <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform" />
                                    <Input
                                        placeholder={t('Search media files...')}
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                                {searchTerm && (
                                    <p className="text-muted-foreground mt-1 text-xs">{t('Showing results for "{{term}}"', { term: searchTerm })}</p>
                                )}
                            </div>

                            {/* Stats Section */}
                            <div className="flex items-center gap-6">
                                <div className="flex items-center gap-2">
                                    <div className="bg-primary/10 rounded-md p-1.5">
                                        <ImageIcon className="text-primary h-4 w-4" />
                                    </div>
                                    <span className="text-sm font-semibold">
                                        {filteredMedia.length} {t('Files')}
                                    </span>
                                </div>

                                <div className="flex items-center gap-2">
                                    <div className="rounded-md bg-green-500/10 p-1.5">
                                        <HardDrive className="h-4 w-4 text-green-600" />
                                    </div>
                                    <span className="text-sm font-semibold">
                                        {formatFileSize(filteredMedia.reduce((acc, item) => acc + item.size, 0))}
                                    </span>
                                </div>

                                <div className="flex items-center gap-2">
                                    <div className="rounded-md bg-blue-500/10 p-1.5">
                                        <ImageIcon className="h-4 w-4 text-blue-600" />
                                    </div>
                                    <span className="text-sm font-semibold">
                                        {filteredMedia.length} {t('Media')}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Media Grid */}
                <Card>
                    <CardContent className="p-6">
                        {loading ? (
                            <div className="py-12 text-center">
                                <div className="border-primary mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2"></div>
                                <p className="text-muted-foreground">{t('Loading media...')}</p>
                            </div>
                        ) : currentMedia.length === 0 ? (
                            <div className="py-16 text-center">
                                <div className="bg-muted mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full">
                                    <ImageIcon className="text-muted-foreground h-10 w-10" />
                                </div>
                                <h3 className="mb-2 text-lg font-semibold">{t('No media files found')}</h3>
                                <p className="text-muted-foreground mb-6">
                                    {searchTerm
                                        ? t('No results found for "{{term}}"', { term: searchTerm })
                                        : t('Get started by uploading your first media file')}
                                </p>
                                {!searchTerm && (
                                    <Button onClick={() => setIsUploadModalOpen(true)} size="lg">
                                        <Plus className="mr-2 h-4 w-4" />
                                        {t('Upload Media')}
                                    </Button>
                                )}
                            </div>
                        ) : (
                            <>
                                <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
                                    {currentMedia.map((item) => (
                                        <div
                                            key={item.id}
                                            className="group bg-card relative overflow-hidden rounded-lg border transition-all duration-200 hover:shadow-md"
                                        >
                                            {/* File Container */}
                                            <div className="bg-muted relative aspect-square">
                                                {item.mime_type.startsWith('image/') ? (
                                                    <img
                                                        src={item.thumb_url}
                                                        alt={item.name}
                                                        className="h-full w-full object-cover"
                                                        onError={(e) => {
                                                            e.currentTarget.src = item.url;
                                                        }}
                                                    />
                                                ) : item.mime_type.startsWith('video/') ? (
                                                    <video src={item.url} className="h-full w-full object-cover" controls preload="metadata" />
                                                ) : item.mime_type.startsWith('audio/') ||
                                                  item.mime_type === 'audio/mpeg' ||
                                                  item.mime_type === 'audio/mp3' ||
                                                  item.file_name.toLowerCase().endsWith('.mp3') ? (
                                                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-purple-100 to-blue-100">
                                                        <audio src={item.url} controls className="w-full max-w-xs" preload="metadata" />
                                                    </div>
                                                ) : (
                                                    <div className="flex h-full w-full items-center justify-center">
                                                        {item.mime_type === 'application/pdf' ? (
                                                            <div className="flex flex-col items-center">
                                                                <div className="mb-1 flex h-12 w-12 items-center justify-center rounded-lg bg-red-100">
                                                                    <FileText className="h-8 w-8 text-red-600" />
                                                                </div>
                                                                <span className="text-xs font-medium text-red-600">PDF</span>
                                                            </div>
                                                        ) : item.mime_type.includes('word') || item.mime_type.includes('document') ? (
                                                            <div className="flex flex-col items-center">
                                                                <div className="mb-1 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                                                                    <FileText className="h-8 w-8 text-blue-600" />
                                                                </div>
                                                                <span className="text-xs font-medium text-blue-600">DOC</span>
                                                            </div>
                                                        ) : (
                                                            getFileIcon(item.mime_type, item.file_name)
                                                        )}
                                                    </div>
                                                )}

                                                {/* Overlay with Actions */}
                                                <div className="absolute inset-0 bg-black/0 transition-all duration-200 group-hover:bg-black/20" />

                                                {/* Action Dropdown */}
                                                <div className="absolute top-2 right-2">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button
                                                                size="sm"
                                                                variant="secondary"
                                                                className="bg-background/95 hover:bg-background h-8 w-8 p-0 opacity-0 shadow-md transition-opacity group-hover:opacity-100"
                                                            >
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end" className="w-40">
                                                            <DropdownMenuItem onClick={() => handleShowInfo(item)}>
                                                                <Info className="mr-2 h-4 w-4" />
                                                                {t('View Info')}
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => handleCopyLink(item.url)}>
                                                                <Copy className="mr-2 h-4 w-4" />
                                                                {t('Copy Link')}
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => handleDownload(item.id, item.file_name)}>
                                                                <Download className="mr-2 h-4 w-4" />
                                                                {t('Download')}
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem
                                                                onClick={() => deleteMedia(item.id)}
                                                                className="text-destructive focus:text-destructive"
                                                            >
                                                                <X className="mr-2 h-4 w-4" />
                                                                {t('Delete')}
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </div>

                                                {/* File Type Badge */}
                                                <div className="absolute top-2 left-2">
                                                    <Badge variant="secondary" className="bg-background/95 text-xs">
                                                        {getFileTypeLabel(item.mime_type)}
                                                    </Badge>
                                                </div>
                                            </div>

                                            {/* Card Content */}
                                            <div className="space-y-2 p-3">
                                                <div>
                                                    <h3 className="truncate text-sm font-medium" title={item.name}>
                                                        {item.name}
                                                    </h3>
                                                    <p className="text-muted-foreground mt-1 flex items-center gap-1 text-xs">
                                                        <HardDrive className="h-3 w-3" />
                                                        {formatFileSize(item.size)}
                                                    </p>
                                                </div>

                                                <div className="text-muted-foreground flex items-center justify-between text-xs">
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="h-3 w-3" />
                                                        {window.appSettings?.formatDateTime(item.created_at, false) || new Date(item.created_at).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Pagination */}
                                {totalPages > 1 && (
                                    <div className="flex flex-col items-center justify-between gap-4 border-t pt-6 sm:flex-row">
                                        <div className="text-muted-foreground text-sm">
                                            {t('Showing')} <span className="font-semibold">{startIndex + 1}</span> {t('to')}{' '}
                                            <span className="font-semibold">{Math.min(startIndex + itemsPerPage, filteredMedia.length)}</span>{' '}
                                            {t('of')} <span className="font-semibold">{filteredMedia.length}</span> {t('files')}
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                disabled={currentPage === 1}
                                                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                                            >
                                                {t('Previous')}
                                            </Button>

                                            <div className="flex gap-1">
                                                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                                                    let page;
                                                    if (totalPages <= 5) {
                                                        page = i + 1;
                                                    } else if (currentPage <= 3) {
                                                        page = i + 1;
                                                    } else if (currentPage >= totalPages - 2) {
                                                        page = totalPages - 4 + i;
                                                    } else {
                                                        page = currentPage - 2 + i;
                                                    }

                                                    return (
                                                        <Button
                                                            key={page}
                                                            variant={currentPage === page ? 'default' : 'outline'}
                                                            size="sm"
                                                            className="h-8 w-10"
                                                            onClick={() => setCurrentPage(page)}
                                                        >
                                                            {page}
                                                        </Button>
                                                    );
                                                })}
                                            </div>

                                            <Button
                                                variant="outline"
                                                size="sm"
                                                disabled={currentPage === totalPages}
                                                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                                            >
                                                {t('Next')}
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </CardContent>
                </Card>

                {/* Upload Modal */}
                <Dialog open={isUploadModalOpen} onOpenChange={setIsUploadModalOpen}>
                    <DialogContent className="max-w-lg">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <Upload className="h-5 w-5" />
                                {t('Upload Media Files')}
                            </DialogTitle>
                        </DialogHeader>

                        <div className="space-y-6">
                            <div
                                className={`relative rounded-xl border-2 border-dashed p-12 text-center transition-all duration-200 ${
                                    dragActive ? 'scale-[1.02] border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                                }`}
                                onDragEnter={handleDrag}
                                onDragLeave={handleDrag}
                                onDragOver={handleDrag}
                                onDrop={handleDrop}
                            >
                                <div className={`transition-all duration-200 ${dragActive ? 'scale-110' : ''}`}>
                                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                                        <Upload className={`h-8 w-8 transition-colors ${dragActive ? 'text-blue-500' : 'text-gray-400'}`} />
                                    </div>
                                    <h3 className="mb-2 text-lg font-medium">{dragActive ? t('Drop files here') : t('Upload your files')}</h3>
                                    <p className="text-muted-foreground mb-6 text-sm">{t('Drag and drop your files here, or click to browse')}</p>

                                    <Input
                                        type="file"
                                        multiple
                                        accept={acceptAttribute}
                                        onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
                                        className="hidden"
                                        id="file-upload-modal"
                                    />

                                    <Button
                                        type="button"
                                        onClick={() => document.getElementById('file-upload-modal')?.click()}
                                        disabled={uploading}
                                        size="lg"
                                    >
                                        {uploading ? (
                                            <>
                                                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
                                                {t('Uploading...')}
                                            </>
                                        ) : (
                                            <>
                                                <Plus className="mr-2 h-4 w-4" />
                                                {t('Choose Files')}
                                            </>
                                        )}
                                    </Button>
                                </div>

                                {dragActive && <div className="absolute inset-0 rounded-xl bg-blue-500/10" />}
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>

                {/* Info Modal */}
                <Dialog open={infoModalOpen} onOpenChange={setInfoModalOpen}>
                    <DialogContent className="max-w-lg">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <Info className="h-5 w-5" />
                                {t('Media Information')}
                            </DialogTitle>
                        </DialogHeader>

                        {selectedMediaInfo && (
                            <div className="space-y-6">
                                {/* File Preview */}
                                <div className="flex justify-center rounded-lg bg-gray-50 p-4">
                                    {selectedMediaInfo.mime_type.startsWith('image/') ? (
                                        <img
                                            src={selectedMediaInfo.thumb_url}
                                            alt={selectedMediaInfo.name}
                                            className="h-48 max-w-full rounded-md object-contain shadow-sm"
                                            onError={(e) => {
                                                e.currentTarget.src = selectedMediaInfo.url;
                                            }}
                                        />
                                    ) : selectedMediaInfo.mime_type.startsWith('video/') ? (
                                        <video
                                            src={selectedMediaInfo.url}
                                            className="h-48 max-w-full rounded-md object-contain shadow-sm"
                                            controls
                                            preload="metadata"
                                        />
                                    ) : selectedMediaInfo.mime_type.startsWith('audio/') ||
                                      selectedMediaInfo.mime_type === 'audio/mpeg' ||
                                      selectedMediaInfo.mime_type === 'audio/mp3' ||
                                      selectedMediaInfo.file_name.toLowerCase().endsWith('.mp3') ? (
                                        <audio src={selectedMediaInfo.url} controls className="w-full max-w-xs" preload="metadata" />
                                    ) : (
                                        <div className="flex h-48 flex-col items-center justify-center">
                                            {selectedMediaInfo.mime_type === 'application/pdf' ? (
                                                <div className="flex flex-col items-center">
                                                    <div className="mb-2 flex h-16 w-16 items-center justify-center rounded-lg bg-red-100">
                                                        <FileText className="h-10 w-10 text-red-600" />
                                                    </div>
                                                    <span className="text-sm font-medium text-red-600">PDF Document</span>
                                                </div>
                                            ) : selectedMediaInfo.mime_type.includes('word') || selectedMediaInfo.mime_type.includes('document') ? (
                                                <div className="flex flex-col items-center">
                                                    <div className="mb-2 flex h-16 w-16 items-center justify-center rounded-lg bg-blue-100">
                                                        <FileText className="h-10 w-10 text-blue-600" />
                                                    </div>
                                                    <span className="text-sm font-medium text-blue-600">Word Document</span>
                                                </div>
                                            ) : (
                                                <div className="mb-2">{getFileIcon(selectedMediaInfo.mime_type, selectedMediaInfo.file_name)}</div>
                                            )}
                                            <p className="mt-2 text-sm text-gray-600">{selectedMediaInfo.file_name}</p>
                                        </div>
                                    )}
                                </div>

                                {/* File Details */}
                                <div className="grid grid-cols-1 gap-4">
                                    <div className="space-y-3">
                                        <div className="flex items-start justify-between">
                                            <span className="text-muted-foreground text-sm font-medium">{t('File Name')}</span>
                                            <span className="max-w-xs truncate text-right text-sm" title={selectedMediaInfo.file_name}>
                                                {selectedMediaInfo.file_name}
                                            </span>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <span className="text-muted-foreground text-sm font-medium">{t('File Type')}</span>
                                            <Badge variant="secondary">{getFileTypeLabel(selectedMediaInfo.mime_type)}</Badge>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <span className="text-muted-foreground text-sm font-medium">{t('File Size')}</span>
                                            <span className="text-sm">{formatFileSize(selectedMediaInfo.size)}</span>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <span className="text-muted-foreground text-sm font-medium">{t('Uploaded')}</span>
                                            <span className="text-sm">
                                                {window.appSettings?.formatDateTime(selectedMediaInfo.created_at, false) || new Date(selectedMediaInfo.created_at).toLocaleDateString()}
                                                </span>
                                        </div>
                                    </div>

                                    <div className="border-t pt-2">
                                        <span className="text-muted-foreground mb-2 block text-sm font-medium">{t('URL')}</span>
                                        <div className="bg-muted flex items-center gap-2 rounded-md p-2">
                                            <code className="text-muted-foreground flex-1 truncate text-xs">{selectedMediaInfo.url}</code>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => handleCopyLink(selectedMediaInfo.url)}
                                                className="h-6 w-6 p-0"
                                            >
                                                <Copy className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-3 pt-2">
                                    <Button variant="outline" onClick={() => handleCopyLink(selectedMediaInfo.url)} className="flex-1">
                                        <Copy className="mr-2 h-4 w-4" />
                                        {t('Copy Link')}
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={() => handleDownload(selectedMediaInfo.id, selectedMediaInfo.file_name)}
                                        className="flex-1"
                                    >
                                        <Download className="mr-2 h-4 w-4" />
                                        {t('Download')}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </DialogContent>
                </Dialog>
            </div>
        </PageTemplate>
    );
}
