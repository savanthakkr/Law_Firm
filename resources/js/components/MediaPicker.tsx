import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import MediaLibraryModal from './MediaLibraryModal';
import { Image as ImageIcon, X, FileText, File } from 'lucide-react';
import { usePage } from '@inertiajs/react';

interface MediaPickerProps {
  label?: string;
  value?: string;
  onChange: (value: string) => void;
  multiple?: boolean;
  placeholder?: string;
  showPreview?: boolean;
}

export default function MediaPicker({ 
  label, 
  value = '', 
  onChange, 
  multiple = false,
  placeholder = 'Select image...',
  showPreview = true
}: MediaPickerProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { storageSettings } = usePage().props as any;

  const handleSelect = (selectedUrl: string) => {
    onChange(selectedUrl);
  };

  const handleClear = () => {
    onChange('');
  };

  const imageUrls = value ? value.split(',').filter(Boolean) : [];

  return (
    <div className="space-y-2">
      {label && <Label>{label}</Label>}
      
      <div className="flex gap-2">
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          readOnly={multiple}
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => setIsModalOpen(true)}
        >
          <ImageIcon className="h-4 w-4 mr-2" />
          Browse
        </Button>
        {value && (
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={handleClear}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Preview */}
      {showPreview && imageUrls.length > 0 && (
        <div className="grid grid-cols-4 gap-2 mt-2">
          {imageUrls.map((url, index) => {
            const isPdf = url.toLowerCase().includes('.pdf') || url.includes('application/pdf');
            const isDoc = url.toLowerCase().includes('.doc') || url.toLowerCase().includes('.docx') || url.includes('document');
            
            return (
              <div key={index} className="relative">
                {isPdf ? (
                  <div className="w-full h-20 bg-red-50 border border-red-200 rounded flex flex-col items-center justify-center">
                    <div className="w-8 h-8 bg-red-100 rounded flex items-center justify-center mb-1">
                      <FileText className="h-5 w-5 text-red-600" />
                    </div>
                    <span className="text-xs text-red-600 font-medium">PDF</span>
                  </div>
                ) : isDoc ? (
                  <div className="w-full h-20 bg-blue-50 border border-blue-200 rounded flex flex-col items-center justify-center">
                    <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center mb-1">
                      <FileText className="h-5 w-5 text-blue-600" />
                    </div>
                    <span className="text-xs text-blue-600 font-medium">DOC</span>
                  </div>
                ) : (
                  <img
                    src={url}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-20 object-cover rounded border"
                    onError={(e) => {
                      // Fallback to generic file icon if image fails to load
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const fallback = target.nextElementSibling as HTMLElement;
                      if (fallback) fallback.style.display = 'flex';
                    }}
                  />
                )}
                {/* Fallback for failed image loads */}
                {!isPdf && !isDoc && (
                  <div className="w-full h-20 bg-gray-50 border border-gray-200 rounded flex-col items-center justify-center" style={{display: 'none'}}>
                    <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center mb-1">
                      <File className="h-5 w-5 text-gray-600" />
                    </div>
                    <span className="text-xs text-gray-600 font-medium">FILE</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <MediaLibraryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelect={handleSelect}
        multiple={multiple}
      />
    </div>
  );
}