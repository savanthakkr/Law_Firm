// components/CrudFormModal.tsx
import MediaPicker from '@/components/MediaPicker';
import { MultiSelectField } from '@/components/multi-select-field';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Check, ChevronsUpDown } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { FormField } from '@/types/crud';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import DependentDropdown from './DependentDropdown';

interface CrudFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: any) => void;
    formConfig: {
        fields: FormField[];
        // modalSize?: string;
        columns?: number;
        layout?: 'grid' | 'flex' | 'default';
        modalSize?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | 'full' | 'grid-2' | 'grid-3' | 'grid-4' | 'grid-5' | 'grid-6';
        priceSummary?: {
            unitPrice: number;
            quantity: number;
            quantityFieldName?: string;
        };
        transformData?: (data: any) => any;
    };
    initialData?: any;
    title: string;
    mode: 'create' | 'edit' | 'view';
    description?: string;
}

export function CrudFormModal({ isOpen, onClose, onSubmit, formConfig, initialData = {}, title, mode, description }: CrudFormModalProps) {
    const { t } = useTranslation();
    const [formData, setFormData] = useState<Record<string, any>>({});
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [relationOptions, setRelationOptions] = useState<Record<string, any[]>>({});

    // Calculate total price for price summary
    const calculateTotal = () => {
        if (!formConfig.priceSummary) return 0;
        const quantity = formData[formConfig.priceSummary.quantityFieldName || 'quantity'] || formConfig.priceSummary.quantity || 1;
        return formConfig.priceSummary.unitPrice * quantity;
    };

    // Load initial data when modal opens
    useEffect(() => {
        if (isOpen) {
            // Create a clean copy of the initial data
            const cleanData = { ...initialData };

            // Process fields and set default values
            formConfig.fields.forEach((field) => {
                if (field.type === 'multi-select') {
                    if (cleanData[field.name] && !Array.isArray(cleanData[field.name])) {
                        // Convert to array if it's not already
                        cleanData[field.name] = Array.isArray(cleanData[field.name])
                            ? cleanData[field.name]
                            : cleanData[field.name]
                                ? [cleanData[field.name].toString()]
                                : [];
                    }
                }

                // Set default values for fields that don't have values yet (create mode)
                if (mode === 'create' && (cleanData[field.name] === undefined || cleanData[field.name] === null)) {
                    if (field.defaultValue !== undefined) {
                        cleanData[field.name] = field.defaultValue;
                    }
                }
            });

            setFormData(cleanData || {});
            setErrors({});

            // Load relation data for select fields
            formConfig.fields.forEach((field) => {
                if (field.relation && field.relation.endpoint) {
                    fetch(field.relation.endpoint)
                        .then((res) => res.json())
                        .then((data) => {
                            setRelationOptions((prev) => ({
                                ...prev,
                                [field.name]: Array.isArray(data) ? data : data.data || [],
                            }));
                        })
                        .catch((err) => {
                            // Silent error handling
                        });
                }
            });
        }
    }, [isOpen, initialData, formConfig.fields, mode]);

    const handleChange = (name: string, value: any) => {
        setFormData((prev) => ({ ...prev, [name]: value }));

        // Clear error when field is changed
        if (errors[name]) {
            setErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Process form data before validation
        const processedData = { ...formData };

        // Ensure multi-select fields are properly formatted
        formConfig.fields.forEach((field) => {
            if (field.type === 'multi-select' && processedData[field.name]) {
                // Make sure it's an array of strings
                if (!Array.isArray(processedData[field.name])) {
                    processedData[field.name] = [processedData[field.name].toString()];
                }
            }
        });

        setFormData(processedData);

        // Basic validation
        const newErrors: Record<string, string> = {};
        formConfig.fields.forEach((field) => {
            // For file fields in edit mode, they're never required
            if (field.type === 'file' && mode === 'edit') {
                return;
            }

            // Check if field is conditionally required based on other field values
            const isConditionallyRequired = field.conditional ? field.conditional(mode, formData) : true;

            if (field.required && isConditionallyRequired && !formData[field.name]) {
                newErrors[field.name] = `${field.label} is required`;
            }

            // File validation
            if (field.type === 'file' && formData[field.name] && field.fileValidation) {
                const file = formData[field.name];

                // Check file size
                if (field.fileValidation.maxSize && file.size > field.fileValidation.maxSize) {
                    const maxSizeMB = field.fileValidation.maxSize / (1024 * 1024);
                    newErrors[field.name] = `File size must be less than ${maxSizeMB}MB`;
                }

                // Check mime type
                if (field.fileValidation.mimeTypes && field.fileValidation.mimeTypes.length > 0) {
                    if (!field.fileValidation.mimeTypes.includes(file.type)) {
                        newErrors[field.name] = `File type must be one of: ${field.fileValidation.mimeTypes.join(', ')}`;
                    }
                }

                // Check extension
                if (field.fileValidation.extensions && field.fileValidation.extensions.length > 0) {
                    const fileName = file.name;
                    const fileExt = fileName.substring(fileName.lastIndexOf('.')).toLowerCase();
                    if (!field.fileValidation.extensions.includes(fileExt)) {
                        newErrors[field.name] = `File extension must be one of: ${field.fileValidation.extensions.join(', ')}`;
                    }
                }
            }
        });

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        // Create a clean copy without any unexpected properties
        let cleanData = { ...formData };

        // Process multi-select fields before submission
        formConfig.fields.forEach((field) => {
            if (field.type === 'multi-select' && cleanData[field.name]) {
                // Ensure it's an array of strings
                if (!Array.isArray(cleanData[field.name])) {
                    cleanData[field.name] = [cleanData[field.name].toString()];
                }
            }
        });

        // Apply transform function if provided
        if (formConfig.transformData) {
            cleanData = formConfig.transformData(cleanData);
        }

        onSubmit(cleanData);
    };

    const renderField = (field: FormField) => {
        // Check if field should be conditionally rendered
        if (field.conditional && !field.conditional(mode, formData)) {
            return null;
        }

        // If field has custom render function, use it
        if (field.render) {
            return field.render(field, formData, handleChange);
        }

        // If in view mode, render as read-only
        if (mode === 'view') {
            // Special handling for multi-select fields
            if (field.type === 'multi-select') {
                const selectedValues = Array.isArray(formData[field.name]) ? formData[field.name] : [];
                const selectedLabels = selectedValues
                    .map((value: string) => {
                        const option = field.options?.find((opt) => opt.value === value);
                        return option ? option.label : value;
                    })
                    .join(', ');

                return <div className="rounded-md border bg-gray-50 p-2">{selectedLabels || '-'}</div>;
            }

            // For checkbox fields
            if (field.type === 'checkbox') {
                return <div className="rounded-md border bg-gray-50 p-2">{formData[field.name] ? 'Yes' : 'No'}</div>;
            }

            // For date fields - use appSettings formatting
            if (field.type === 'date' && formData[field.name]) {
                const formattedDate = window.appSettings?.formatDate(formData[field.name]) || new Date(formData[field.name]).toLocaleDateString();
                return <div className="rounded-md border bg-gray-50 p-2">{formattedDate || '-'}</div>;
            }

            // For time fields - use appSettings formatting
            if (field.type === 'time' && formData[field.name]) {
                const timeValue = formData[field.name];
                let formattedTime;

                if (typeof timeValue === 'string' && timeValue.includes(':')) {
                    // Handle time string format (HH:MM or HH:MM:SS)
                    const today = new Date();
                    const [hours, minutes] = timeValue.split(':');
                    today.setHours(parseInt(hours), parseInt(minutes), 0, 0);
                    formattedTime = window.appSettings?.formatTime(today) || timeValue;
                } else {
                    formattedTime = window.appSettings?.formatTime(timeValue) || timeValue;
                }

                return <div className="rounded-md border bg-gray-50 p-2">{formattedTime || '-'}</div>;
            }

            // For currency fields - use appSettings formatting
            if (field.type === 'currency' && formData[field.name]) {
                const formattedCurrency = window.appSettings?.formatCurrency(formData[field.name]) || formData[field.name];
                return <div className="rounded-md border bg-gray-50 p-2">{formattedCurrency || '-'}</div>;
            }

            // For datetime fields (created_at, updated_at, etc.) - use appSettings formatting
            if ((field.name.includes('_at') || field.name.includes('date') || field.name.includes('time')) && formData[field.name]) {
                const value = formData[field.name];
                // Check if it's a datetime string (contains time info)
                if (typeof value === 'string' && (value.includes('T') || value.includes(' ') && value.includes(':'))) {
                    const formattedDateTime = window.appSettings?.formatDateTime(value) || new Date(value).toLocaleString();
                    return <div className="rounded-md border bg-gray-50 p-2">{formattedDateTime || '-'}</div>;
                }
                // Otherwise treat as date only
                const formattedDate = window.appSettings?.formatDate(value) || new Date(value).toLocaleDateString();
                return <div className="rounded-md border bg-gray-50 p-2">{formattedDate || '-'}</div>;
            }

            // For color fields - show color swatch with value
            if (field.type === 'color' && formData[field.name]) {
                return (
                    <div className="flex items-center gap-2 rounded-md border bg-gray-50 p-2">
                        <div
                            className="w-6 h-6 rounded-full border border-gray-300"
                            style={{ backgroundColor: formData[field.name] }}
                        />
                        <span>{formData[field.name]}</span>
                    </div>
                );
            }

            // For other field types
            return (
                <div className="rounded-md border bg-gray-50 p-2">
                    {field.type === 'select' && field.options
                        ? field.options.find((opt) => opt.value === String(formData[field.name]))?.label || formData[field.name] || '-'
                        : formData[field.name] || '-'}
                </div>
            );
        }

        switch (field.type) {
            case 'text':
            case 'email':
            case 'password':
            case 'time':
                return (
                    <Input
                        id={field.name}
                        name={field.name}
                        type={field.type}
                        placeholder={field.placeholder}
                        value={formData[field.name] || ''}
                        onChange={(e) => handleChange(field.name, e.target.value)}
                        required={field.required}
                        className={errors[field.name] ? 'border-red-500' : ''}
                        disabled={mode === 'view' || field.disabled}
                    />
                );

            case 'dependent-dropdown':
                // Create values object dynamically based on field names
                const dependentValues: Record<string, string> = {};
                field.dependentConfig?.forEach((depField) => {
                    dependentValues[depField.name] = formData[depField.name] || '';
                });
                return (
                    <DependentDropdown
                        fields={field.dependentConfig || []}
                        values={dependentValues}
                        onChange={(fieldName, value, additionalData) => {
                            setFormData((prev) => {
                                const newData = { ...prev, [fieldName]: value };

                                // Reset dependent fields when parent changes
                                const fieldIndex = field.dependentConfig?.findIndex((f) => f.name === fieldName) ?? -1;
                                if (fieldIndex !== -1 && field.dependentConfig) {
                                    field.dependentConfig.slice(fieldIndex + 1).forEach((depField) => {
                                        newData[depField.name] = '';
                                    });
                                }

                                return newData;
                            });

                            // Call custom onChange if provided with parent info
                            if (field.onDependentChange) {
                                field.onDependentChange(fieldName, value, formData, additionalData);
                            }
                        }}
                    />
                );

            case 'color':
                return (
                    <div className="flex items-center gap-2">
                        <Input
                            id={field.name}
                            name={field.name}
                            type="color"
                            value={formData[field.name] || '#3B82F6'}
                            onChange={(e) => handleChange(field.name, e.target.value)}
                            required={field.required}
                            className={`h-10 w-16 rounded border p-1 ${errors[field.name] ? 'border-red-500' : ''}`}
                            disabled={mode === 'view' || field.disabled}
                        />
                        <Input
                            type="text"
                            value={formData[field.name] || '#3B82F6'}
                            onChange={(e) => handleChange(field.name, e.target.value)}
                            placeholder="#3B82F6"
                            className={`flex-1 ${errors[field.name] ? 'border-red-500' : ''}`}
                            disabled={mode === 'view' || field.disabled}
                        />
                    </div>
                );

            case 'date':
                // Format date value for input (YYYY-MM-DD format)
                const dateValue = formData[field.name]
                    ? formData[field.name] instanceof Date
                        ? formData[field.name].toISOString().split('T')[0]
                        : typeof formData[field.name] === 'string' && formData[field.name].includes('T')
                            ? formData[field.name].split('T')[0]
                            : formData[field.name]
                    : '';

                return (
                    <Input
                        id={field.name}
                        name={field.name}
                        type="date"
                        placeholder={field.placeholder}
                        value={dateValue}
                        onChange={(e) => handleChange(field.name, e.target.value)}
                        required={field.required}
                        className={errors[field.name] ? 'border-red-500' : ''}
                        disabled={mode === 'view' || field.disabled}
                    />
                );

            case 'number':
                return (
                    <Input
                        id={field.name}
                        name={field.name}
                        type="number"
                        placeholder={field.placeholder}
                        value={formData[field.name] || ''}
                        onChange={(e) => handleChange(field.name, e.target.value ? parseFloat(e.target.value) : '')}
                        required={field.required}
                        className={errors[field.name] ? 'border-red-500' : ''}
                        disabled={mode === 'view' || field.disabled}
                        step={field.step}
                        min={field.min}
                        max={field.max}
                    />
                );

            case 'currency':
                return (
                    <Input
                        id={field.name}
                        name={field.name}
                        type="number"
                        placeholder={field.placeholder}
                        value={formData[field.name] || ''}
                        onChange={(e) => handleChange(field.name, e.target.value ? parseFloat(e.target.value) : '')}
                        required={field.required}
                        className={errors[field.name] ? 'border-red-500' : ''}
                        disabled={mode === 'view' || field.disabled}
                        step="0.01"
                        min="0"
                    />
                );

            case 'textarea':
                return (
                    <Textarea
                        id={field.name}
                        name={field.name}
                        placeholder={field.placeholder}
                        value={formData[field.name] || ''}
                        onChange={(e) => handleChange(field.name, e.target.value)}
                        required={field.required}
                        className={errors[field.name] ? 'border-red-500' : ''}
                        disabled={mode === 'view' || field.disabled}
                    />
                );

            case 'select':
                const options = field.relation ? relationOptions[field.name] || [] : field.options || [];

                const currentValue = String(formData[field.name] || '');
                const selectedOption = field.relation
                    ? options.find((opt: any) => String(opt[field.relation!.valueField]) === currentValue)
                    : options.find((opt) => String(opt.value) === currentValue);

                const displayText = selectedOption ? (field.relation ? selectedOption[field.relation!.labelField] : selectedOption.label) : '';

                return (
                    <Select value={currentValue} onValueChange={(value) => handleChange(field.name, value)} disabled={mode === 'view' || field.disabled}>
                        <SelectTrigger className={errors[field.name] ? 'border-red-500' : ''}>
                            <SelectValue placeholder={field.placeholder || `Select ${field.label}`}>
                                {displayText || field.placeholder || `Select ${field.label}`}
                            </SelectValue>
                        </SelectTrigger>
                        <SelectContent className="z-[60000]">
                            {field.relation
                                ? options.map((option: any) => (
                                    <SelectItem key={option[field.relation!.valueField]} value={String(option[field.relation!.valueField])}>
                                        {option[field.relation!.labelField]}
                                    </SelectItem>
                                ))
                                : options.map((option) => (
                                    <SelectItem key={option.value} value={String(option.value)}>
                                        {option.label}
                                    </SelectItem>
                                ))}
                        </SelectContent>
                    </Select>
                );

            case 'combobox':
                const comboOptions = field.relation ? relationOptions[field.name] || [] : field.options || [];
                const [searchTerm, setSearchTerm] = useState('');
                const comboCurrentValue = String(formData[field.name] || '');
                const comboSelectedOption = field.relation
                    ? comboOptions.find((opt: any) => String(opt[field.relation!.valueField]) === comboCurrentValue)
                    : comboOptions.find((opt) => String(opt.value) === comboCurrentValue);
                const comboDisplayText = comboSelectedOption ? (field.relation ? comboSelectedOption[field.relation!.labelField] : comboSelectedOption.label) : '';

                const filteredOptions = comboOptions.filter((option: any) => {
                    const label = field.relation ? option[field.relation!.labelField] : option.label;
                    return label.toLowerCase().includes(searchTerm.toLowerCase());
                });

                return (
                    <Select value={comboCurrentValue} onValueChange={(value) => handleChange(field.name, value)} disabled={mode === 'view' || field.disabled}>
                        <SelectTrigger className={errors[field.name] ? 'border-red-500' : ''}>
                            <SelectValue placeholder={field.placeholder || `Search ${field.label}...`}>
                                {comboDisplayText || field.placeholder || `Search ${field.label}...`}
                            </SelectValue>
                        </SelectTrigger>
                        <SelectContent className="z-[60000]">
                            <div className="p-2">
                                <Input
                                    placeholder={field.placeholder || `Search ${field.label}...`}
                                    className="mb-2"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            {field.relation
                                ? filteredOptions.map((option: any) => (
                                    <SelectItem key={option[field.relation!.valueField]} value={String(option[field.relation!.valueField])}>
                                        {option[field.relation!.labelField]}
                                    </SelectItem>
                                ))
                                : filteredOptions.map((option) => (
                                    <SelectItem key={option.value} value={String(option.value)}>
                                        {option.label}
                                    </SelectItem>
                                ))}
                        </SelectContent>
                    </Select>
                );

            case 'radio':
                return (
                    <RadioGroup
                        value={formData[field.name] || ''}
                        onValueChange={(value) => handleChange(field.name, value)}
                        disabled={mode === 'view' || field.disabled}
                        className="flex gap-4"
                    >
                        {field.options?.map((option) => (
                            <div key={option.value} className="flex items-center space-x-2">
                                <RadioGroupItem value={option.value} id={`${field.name}-${option.value}`} />
                                <Label htmlFor={`${field.name}-${option.value}`}>{option.label}</Label>
                            </div>
                        ))}
                    </RadioGroup>
                );

            case 'checkbox':
                return (
                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id={field.name}
                            checked={!!formData[field.name]}
                            onCheckedChange={(checked) => handleChange(field.name, checked)}
                            disabled={mode === 'view' || field.disabled}
                        />
                        <Label htmlFor={field.name}>{field.placeholder || field.label}</Label>
                    </div>
                );

            case 'switch':
                // Don't render any label here, it will be handled by the parent component
                return (
                    <Switch
                        id={field.name}
                        checked={!!formData[field.name]}
                        onCheckedChange={(checked) => handleChange(field.name, checked)}
                        disabled={mode === 'view' || field.disabled}
                    />
                );

            case 'multi-select':
                return <MultiSelectField field={field} formData={formData} handleChange={handleChange} />;

            case 'media-picker':
                const currentImageUrl =
                    formData[field.name] ||
                    (mode === 'edit' && initialData[field.name]
                        ? initialData[field.name].startsWith('http')
                            ? initialData[field.name]
                            : `/storage/${initialData[field.name]}`
                        : '');

                return (
                    <MediaPicker
                        value={currentImageUrl}
                        onChange={(value) => handleChange(field.name, value)}
                        placeholder={field.placeholder || `Select ${field.label}`}
                        showPreview={true}
                    />
                );

            case 'file':
                const acceptAttr = field.fileValidation?.accept || '';
                const isImageFile =
                    acceptAttr.includes('image') || (field.fileValidation?.mimeTypes?.some((type) => type.startsWith('image/')) ?? false);

                return (
                    <>
                        <Input
                            id={field.name}
                            name={field.name}
                            type="file"
                            accept={acceptAttr}
                            onChange={(e) => {
                                if (e.target.files && e.target.files[0]) {
                                    handleChange(field.name, e.target.files[0]);
                                }
                            }}
                            className={errors[field.name] ? 'border-red-500' : ''}
                            disabled={mode === 'view' || field.disabled}
                        />
                        {mode === 'edit' && initialData[field.name] && (
                            <div className="mt-1 text-xs text-gray-500">
                                Current file: {initialData.featured_image_original_name || initialData[field.name]}
                            </div>
                        )}
                        {field.fileValidation && (
                            <div className="mt-1 text-xs text-gray-500">
                                {field.fileValidation.extensions && (
                                    <span>
                                        {t('Allowed extensions')}: {field.fileValidation.extensions.join(', ')}{' '}
                                    </span>
                                )}
                                {field.fileValidation.maxSize && (
                                    <span>
                                        {t('Max size')}: {(field.fileValidation.maxSize / (1024 * 1024)).toFixed(1)}MB
                                    </span>
                                )}
                            </div>
                        )}

                        {/* Image preview for image files */}
                        {isImageFile && field.fileValidation?.showPreview !== false && (
                            <div className="mt-2">
                                {formData[field.name] && formData[field.name] instanceof File ? (
                                    // Preview for newly selected file
                                    <div className="mt-2">
                                        <p className="mb-1 text-xs text-gray-500">{t('Preview')}:</p>
                                        <img
                                            src={URL.createObjectURL(formData[field.name])}
                                            alt="Preview"
                                            className="h-24 w-auto rounded-md object-cover shadow-sm"
                                        />
                                    </div>
                                ) : (
                                    mode === 'edit' &&
                                    initialData[field.name] && (
                                        // Show existing image in edit mode
                                        <div className="mt-2">
                                            <p className="mb-1 text-xs text-gray-500">{t('Current image')}:</p>
                                            <img
                                                src={
                                                    typeof initialData[field.name] === 'string' &&
                                                        initialData[field.name].startsWith &&
                                                        initialData[field.name].startsWith('http')
                                                        ? initialData[field.name]
                                                        : `/storage/${initialData[field.name]}`
                                                }
                                                alt="Current"
                                                className="h-24 w-auto rounded-md object-cover shadow-sm"
                                                onError={(e) => {
                                                    e.currentTarget.src = 'https://placehold.co/200x150?text=Image+Not+Found';
                                                }}
                                            />
                                        </div>
                                    )
                                )}
                            </div>
                        )}
                    </>
                );

            default:
                return null;
        }
    };

    // Map modal size to appropriate width class
    // const getModalSizeClass = () => {
    //   const sizeMap: Record<string, string> = {
    //     'sm': 'sm:max-w-sm',
    //     'md': 'sm:max-w-md',
    //     'lg': 'sm:max-w-lg',
    //     'xl': 'sm:max-w-xl',
    //     '2xl': 'sm:max-w-2xl',
    //     '3xl': 'sm:max-w-3xl',
    //     '4xl': 'sm:max-w-4xl',
    //     '5xl': 'sm:max-w-5xl',
    //     'full': 'sm:max-w-full'
    //   };
    //   return formConfig.modalSize ? sizeMap[formConfig.modalSize] : 'sm:max-w-md';
    // };

    const getModalSizeClass = () => {
        const sizeMap: Record<string, string> = {
            sm: 'sm:max-w-sm',
            md: 'sm:max-w-md',
            lg: 'sm:max-w-lg',
            xl: 'sm:max-w-xl',
            '2xl': 'sm:max-w-2xl',
            '3xl': 'sm:max-w-3xl',
            '4xl': 'sm:max-w-4xl',
            '5xl': 'sm:max-w-5xl',
            full: 'sm:max-w-full',
            'grid-2': 'sm:max-w-2xl', // 2-column grid
            'grid-3': 'sm:max-w-4xl', // 3-column grid
            'grid-4': 'sm:max-w-5xl', // 4-column grid
            'grid-5': 'sm:max-w-6xl', // 5-column grid
            'grid-6': 'sm:max-w-7xl', // 6-column grid
        };
        return formConfig.modalSize ? sizeMap[formConfig.modalSize] : 'sm:max-w-md';
    };

    // Group fields by row if specified
    const groupFieldsByRow = () => {
        const rows: Record<number, FormField[]> = {};

        formConfig.fields.forEach((field) => {
            const rowNumber = field.row || 0;
            if (!rows[rowNumber]) {
                rows[rowNumber] = [];
            }
            rows[rowNumber].push(field);
        });

        return Object.entries(rows).sort(([a], [b]) => parseInt(a) - parseInt(b));
    };

    // Determine the layout type
    const layout = formConfig.layout || 'default';
    const columns = formConfig.columns || 1;

    const modalId = `crud-modal-${mode}-${title.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}`;

    // const getGridLayout = () => {
    //     if (layout === 'grid') {
    //         return {
    //             display: 'grid',
    //             gridTemplateColumns: `repeat(${columns}, 1fr)`,
    //             gap: '1.5rem',
    //         };
    //     }

    //     // Fallback to CSS classes for other layouts
    //     switch (layout) {
    //         case 'double':
    //             return { className: 'grid grid-cols-1 lg:grid-cols-2 gap-6' };
    //         case 'triple':
    //             return { className: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' };
    //         default:
    //             return { className: 'space-y-6' };
    //     }
    // };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className={`${getModalSizeClass()} max-h-[90vh]`} modalId={modalId}>
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{description || ' '}</DialogDescription>
                </DialogHeader>
                <ScrollArea className="max-h-[70vh] pr-4">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Price Summary Section */}
                        {formConfig.priceSummary && (
                            <div className="mb-4 rounded-lg bg-gray-50 p-4">
                                <div className="mb-2 flex items-center justify-between">
                                    <span className="text-sm text-gray-600">{t('Unit Price')}:</span>
                                    <span className="font-medium">${formConfig.priceSummary.unitPrice.toFixed(2)}</span>
                                </div>
                                <div className="mb-2 flex items-center justify-between">
                                    <span className="text-sm text-gray-600">{t('Quantity')}:</span>
                                    <span className="font-medium">
                                        {formData[formConfig.priceSummary.quantityFieldName || 'quantity'] || formConfig.priceSummary.quantity || 1}
                                    </span>
                                </div>
                                <div className="border-t pt-2">
                                    <div className="flex items-center justify-between">
                                        <span className="font-semibold">{t('Total Price')}:</span>
                                        <span className="text-primary text-lg font-bold">${calculateTotal().toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>
                        )}
                        {layout === 'grid' ? (
                            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${columns}, 1fr)`, gap: '1.5rem' }}>
                                {formConfig.fields.map((field) => {
                                    if (field.conditional && !field.conditional(mode, formData)) {
                                        return null;
                                    }
                                    return (
                                        <div
                                            key={field.name}
                                            className="space-y-2"
                                            style={{
                                                gridColumn: field.column ? `span ${field.column}` : 'span 1',
                                                width: '100%',
                                            }}
                                        >
                                            <div className="flex items-center justify-between gap-2">
                                                <Label htmlFor={field.name} className="text-sm font-medium">
                                                    {field.label}{' '}
                                                    {field.required && !(field.type === 'file' && mode === 'edit') && (
                                                        <span className="text-red-500">*</span>
                                                    )}
                                                </Label>

                                                {field.addonRight && (
                                                    <div className="shrink-0">
                                                        {field.addonRight}
                                                    </div>
                                                )}
                                            </div>

                                            {renderField(field)}
                                            {errors[field.name] && <p className="text-xs text-red-500">{errors[field.name]}</p>}
                                        </div>
                                    );
                                })}
                            </div>
                        ) : layout === 'flex' ? (
                            <div className="flex flex-wrap gap-4">
                                {formConfig.fields.map((field) => {
                                    if (field.conditional && !field.conditional(mode, formData)) {
                                        return null;
                                    }
                                    return (
                                        <div
                                            key={field.name}
                                            className="space-y-2"
                                            style={{
                                                width: field.width || '100%',
                                                flexGrow: field.width ? 0 : 1,
                                            }}
                                        >
                                            <div className="flex items-center justify-between gap-2">
                                                <Label htmlFor={field.name} className="text-sm font-medium">
                                                    {field.label}{' '}
                                                    {field.required && !(field.type === 'file' && mode === 'edit') && (
                                                        <span className="text-red-500">*</span>
                                                    )}
                                                </Label>

                                                {field.addonRight && (
                                                    <div className="shrink-0">
                                                        {field.addonRight}
                                                    </div>
                                                )}
                                            </div>

                                            {renderField(field)}
                                            {errors[field.name] && <p className="text-xs text-red-500">{errors[field.name]}</p>}
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            // Default layout with row grouping
                            groupFieldsByRow().map(([rowNumber, fields]) => (
                                <div key={rowNumber} className="mb-4 flex flex-wrap gap-4">
                                    {fields.map((field) => {
                                        if (field.conditional && !field.conditional(mode, formData)) {
                                            return null;
                                        }
                                        return (
                                            <div key={field.name} className="space-y-2" style={{ width: field.width || '100%' }}>
                                                <div className="flex items-center justify-between gap-2">
                                                    <Label htmlFor={field.name} className="text-sm font-medium">
                                                        {field.label}{' '}
                                                        {field.required && !(field.type === 'file' && mode === 'edit') && (
                                                            <span className="text-red-500">*</span>
                                                        )}
                                                    </Label>

                                                    {field.addonRight && (
                                                        <div className="shrink-0">
                                                            {field.addonRight}
                                                        </div>
                                                    )}
                                                </div>

                                                {renderField(field)}
                                                {errors[field.name] && <p className="text-xs text-red-500">{errors[field.name]}</p>}
                                            </div>
                                        );
                                    })}
                                </div>
                            ))
                        )}
                    </form>
                </ScrollArea>
                <DialogFooter className="sm:justify-end">
                    <Button type="button" variant="outline" onClick={onClose}>
                        {t('Cancel')}
                    </Button>
                    {mode !== 'view' && (
                        <Button type="button" onClick={handleSubmit}>
                            {t('Save')}
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
