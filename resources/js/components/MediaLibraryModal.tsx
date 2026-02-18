import React, { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { toast } from 'sonner';
import { Upload, X, Image as ImageIcon, Search, Plus, Check, FileText, File, Copy } from 'lucide-react';
import { usePage } from '@inertiajs/react';
import { hasPermission } from '@/utils/authorization';

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

interface MediaLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
  multiple?: boolean;
}

interface StorageSettings {
  allowed_file_types: string;
  max_file_size_mb: number;
}

export default function MediaLibraryModal({ 
  isOpen, 
  onClose, 
  onSelect, 
  multiple = false 
}: MediaLibraryModalProps) {
  const { auth, storageSettings } = usePage().props as any;
  const permissions = auth?.permissions || [];
  const canCreateMedia = hasPermission(permissions, 'create-media');
  const canManageMedia = hasPermission(permissions, 'manage-media');
  
  const allowedTypes = storageSettings?.allowed_file_types || 'jpg,png,webp,gif';
  const acceptAttribute = allowedTypes.split(',').map(type => `.${type.trim()}`).join(',');
  
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [filteredMedia, setFilteredMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 18;

  const fetchMedia = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(route('api.media.index'), {
        credentials: 'same-origin',
        headers: {
          'Accept': 'application/json',
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
      toast.error('Failed to load media');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchMedia();
      setSearchTerm('');
    }
  }, [isOpen, fetchMedia]);

  // Filter media based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredMedia(media);
    } else {
      const filtered = media.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.file_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredMedia(filtered);
    }
    setCurrentPage(1);
  }, [searchTerm, media]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredMedia.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentMedia = filteredMedia.slice(startIndex, startIndex + itemsPerPage);

  const handleFileUpload = async (files: FileList) => {
    setUploading(true);
    
    const allowedExtensions = allowedTypes.split(',').map(type => type.trim().toLowerCase());
    
    const validFiles = Array.from(files).filter(file => {
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
    validFiles.forEach(file => {
      formData.append('files[]', file);
    });
    
    try {
      const response = await fetch(route('api.media.batch'), {
        method: 'POST',
        body: formData,
        credentials: 'same-origin',
        headers: {
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
          'X-Requested-With': 'XMLHttpRequest',
        },
      });
      
      const result = await response.json();
      
      if (response.ok) {
        if (result.data && result.data.length > 0) {
          setMedia(prev => [...result.data, ...prev]);
        }
        
        // Show appropriate success/warning messages
        if (result.errors && result.errors.length > 0) {
          toast.warning(result.message || `${result.data?.length || 0} uploaded, ${result.errors.length} failed`);
          result.errors.forEach((error: string) => {
            toast.error(error, { duration: 5000 });
          });
        } else {
          toast.success(result.message || `${result.data?.length || 0} file(s) uploaded successfully`);
        }
      } else {
        toast.error(result.message || 'Failed to upload files');
        if (result.errors) {
          result.errors.forEach((error: string) => {
            toast.error(error, { duration: 5000 });
          });
        }
      }
    } catch (error) {
      toast.error('Error uploading files');
    }
    
    setUploading(false);
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

  const handleSelect = (url: string) => {
    if (multiple) {
      setSelectedItems(prev => 
        prev.includes(url) 
          ? prev.filter(item => item !== url)
          : [...prev, url]
      );
    } else {
      onSelect(url);
      onClose();
    }
  };

  const handleConfirmSelection = () => {
    if (multiple && selectedItems.length > 0) {
      onSelect(selectedItems.join(','));
      onClose();
    }
  };



  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[85vh] overflow-hidden">
        <DialogHeader className="pb-4">
          <DialogTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Media Library
            {filteredMedia.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {filteredMedia.length}
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Header with Search and Upload */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search media files..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            {canCreateMedia && (
              <div className="flex gap-2">
                <Input
                  type="file"
                  multiple
                  accept={acceptAttribute}
                  onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
                  className="hidden"
                  id="file-upload"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('file-upload')?.click()}
                  disabled={uploading}
                  size="sm"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {uploading ? 'Uploading...' : 'Upload'}
                </Button>
              </div>
            )}
          </div>
          
          {/* Stats and Selection Info */}
          <div className="flex items-center justify-between text-sm text-muted-foreground bg-muted/30 px-3 py-2 rounded-md">
            <span>
              {filteredMedia.length} files • Page {currentPage} of {totalPages || 1}
            </span>
            {multiple && selectedItems.length > 0 && (
              <Badge variant="default" className="text-xs">
                {selectedItems.length} selected
              </Badge>
            )}
          </div>

          {/* Media Grid */}
          <div className="border rounded-lg bg-muted/10 flex flex-col">
            {loading ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Loading media...</p>
                </div>
              </div>
            ) : filteredMedia.length === 0 ? (
              <div className="flex-1 flex items-center justify-center py-16">
                <div className="text-center max-w-sm">
                  <div
                    className={`mx-auto w-24 h-24 border-2 border-dashed rounded-xl flex items-center justify-center mb-6 transition-colors ${
                      dragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
                    }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                  >
                    <Upload className="h-10 w-10 text-muted-foreground" />
                  </div>
                  
                  <div className="space-y-3 mb-6">
                    <h3 className="text-lg font-semibold">No media files found</h3>
                    {searchTerm && (
                      <p className="text-sm text-muted-foreground">
                        No results for <span className="font-medium text-foreground">"${searchTerm}"</span>
                      </p>
                    )}
                    <p className="text-sm text-muted-foreground">
                      {searchTerm ? 'Try a different search term or upload new images' : 'Upload images to get started'}
                    </p>
                  </div>
                  
                  {canCreateMedia && (
                    <Button
                      type="button"
                      onClick={() => document.getElementById('file-upload')?.click()}
                      disabled={uploading}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Upload Images
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-4">
                <div className="grid grid-cols-6 gap-3">
                  {currentMedia.map((item) => (
                    <div
                      key={item.id}
                      className={`relative group cursor-pointer rounded-lg overflow-hidden transition-all hover:scale-105 ${
                        selectedItems.includes(item.url) 
                          ? 'ring-2 ring-primary shadow-lg' 
                          : 'hover:shadow-md border border-border hover:border-primary/50'
                      }`}
                      onClick={() => handleSelect(item.url)}
                    >
                      <div className="relative aspect-square bg-muted">
                        {item.mime_type.startsWith('image/') ? (
                          <img
                            src={item.thumb_url}
                            alt={item.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src = item.url;
                            }}
                          />
                        ) : item.mime_type === 'application/pdf' ? (
                          <div className="flex flex-col items-center justify-center w-full h-full">
                            <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center mb-1">
                              <FileText className="h-5 w-5 text-red-600" />
                            </div>
                            <span className="text-xs text-red-600 font-medium">PDF</span>
                          </div>
                        ) : (item.mime_type.includes('word') || item.mime_type.includes('document')) ? (
                          <div className="flex flex-col items-center justify-center w-full h-full">
                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mb-1">
                              <FileText className="h-5 w-5 text-blue-600" />
                            </div>
                            <span className="text-xs text-blue-600 font-medium">DOC</span>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center w-full h-full">
                            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center mb-1">
                              <File className="h-5 w-5 text-gray-600" />
                            </div>
                            <span className="text-xs text-gray-600 font-medium">FILE</span>
                          </div>
                        )}
                        
                        {/* Selection Indicator */}
                        {selectedItems.includes(item.url) && (
                          <div className="absolute inset-0 bg-primary/30 flex items-center justify-center">
                            <div className="bg-primary text-primary-foreground rounded-full p-1.5">
                              <Check className="h-4 w-4" />
                            </div>
                          </div>
                        )}
                        
                        {/* Copy Link Button */}
                        <button
                          className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 hover:bg-white rounded p-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigator.clipboard.writeText(item.url);
                            toast.success('Link copied to clipboard');
                          }}
                          title="Copy link"
                        >
                          <Copy className="h-3 w-3 text-gray-600" />
                        </button>
                        
                        {/* Hover Overlay */}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                        
                        {/* File Name Tooltip */}
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <p className="text-xs text-white truncate" title={item.name}>
                            {item.name}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-3 border-t">
              <div className="text-sm text-muted-foreground">
                Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredMedia.length)} of {filteredMedia.length} files
              </div>
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                >
                  Previous
                </Button>
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
                      className="w-8 h-8 p-0"
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </Button>
                  );
                })}
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                >
                  Next
                </Button>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-between items-center pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <div className="flex gap-2">
              {multiple && selectedItems.length > 0 && (
                <Button variant="outline" onClick={() => setSelectedItems([])} size="sm">
                  Clear
                </Button>
              )}
              {multiple && selectedItems.length > 0 && (
                <Button onClick={handleConfirmSelection}>
                  Select {selectedItems.length} item{selectedItems.length > 1 ? 's' : ''}
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}