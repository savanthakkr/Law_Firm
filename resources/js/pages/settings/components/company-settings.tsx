import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2, ChevronDown, ChevronRight } from 'lucide-react';
import { router } from '@inertiajs/react';
import { toast } from '@/components/custom-toast';
import { useTranslation } from 'react-i18next';
import { CrudFormModal } from '@/components/CrudFormModal';
import { CrudDeleteModal } from '@/components/CrudDeleteModal';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface CompanySetting {
  id: number;
  setting_key: string;
  setting_value: string;
  description?: string;
  category?: string;
}

interface CompanySettingsProps {
  settings: CompanySetting[];
}

export default function CompanySettings({ settings = [] }: CompanySettingsProps) {
  console.log({settings})
  const { t } = useTranslation();
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<CompanySetting | null>(null);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['General']));

  const handleFormSubmit = (formData: any) => {
    // Convert category to lowercase for database storage
    const submitData = {
      ...formData,
      category: formData.category?.toLowerCase() || 'general'
    };
    
    if (formMode === 'create') {
      router.post(route('settings.company.store'), submitData, {
        onSuccess: () => {
          toast.success(t('Setting created successfully'));
          setIsFormModalOpen(false);
          setExpandedCategories(prev => new Set([...prev, formData.category || 'General']));
        },
        onError: () => toast.error(t('Failed to create setting'))
      });
    } else {
      router.put(route('settings.company.update', currentItem!.id), submitData, {
        onSuccess: () => {
          toast.success(t('Setting updated successfully'));
          setIsFormModalOpen(false);
          setExpandedCategories(prev => new Set([...prev, formData.category || 'General']));
        },
        onError: () => toast.error(t('Failed to update setting'))
      });
    }
  };

  const handleEdit = (setting: CompanySetting) => {
    console.log('Editing setting:', setting);
    setCurrentItem(setting);
    setFormMode('edit');
    setIsFormModalOpen(true);
  };

  const handleDelete = (setting: CompanySetting) => {
    setCurrentItem(setting);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = () => {
    router.delete(route('settings.company.destroy', currentItem!.id), {
      onSuccess: () => {
        toast.success(t('Setting deleted successfully'));
        setIsDeleteModalOpen(false);
      },
      onError: () => toast.error(t('Failed to delete setting'))
    });
  };

  const handleAddNew = () => {
    setCurrentItem(null);
    setFormMode('create');
    setIsFormModalOpen(true);
  };

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  // Group settings by category
  const groupedSettings = settings.reduce((acc, setting) => {
    const category = setting.category ? setting.category.charAt(0).toUpperCase() + setting.category.slice(1) : 'General';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(setting);
    return acc;
  }, {} as Record<string, CompanySetting[]>);

  // Transform setting data for form
  const transformSettingForForm = (setting: CompanySetting | null) => {
    if (!setting) return null;
    const transformed = {
      key: setting.setting_key,
      value: setting.setting_value,
      description: setting.description || '',
      category: setting.category ? setting.category.charAt(0).toUpperCase() + setting.category.slice(1) : 'General'
    };
    console.log('Transformed data for form:', transformed);
    return transformed;
  };

  const formConfig = {
    fields: [
      { name: 'key', label: t('Key'), type: 'text' as const, required: true },
      { name: 'value', label: t('Value'), type: 'text' as const, required: true },
      { 
        name: 'category', 
        label: t('Category'), 
        type: 'select' as const, 
        options: [
          { value: 'General', label: t('General') },
          { value: 'Email', label: t('Email') },
          { value: 'Payment', label: t('Payment') },
          { value: 'Security', label: t('Security') },
          { value: 'Integration', label: t('Integration') }
        ],
        defaultValue: 'General'
      },
      { name: 'description', label: t('Description'), type: 'textarea' as const }
    ],
    modalSize: 'lg'
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>{t('Company Settings')}</CardTitle>
            <CardDescription>{t('Manage company-specific configuration settings')}</CardDescription>
          </div>
          <Button onClick={handleAddNew}>
            <Plus className="h-4 w-4 mr-2" />
            {t('Add Setting')}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {Object.keys(groupedSettings).length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {t('No company settings found')}
          </div>
        ) : (
          Object.entries(groupedSettings).map(([category, categorySettings]) => (
            <Collapsible
              key={category}
              open={expandedCategories.has(category)}
              onOpenChange={() => toggleCategory(category)}
            >
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full justify-between p-3 h-auto">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{category}</span>
                    <span className="text-sm text-gray-500">({categorySettings.length})</span>
                  </div>
                  {expandedCategories.has(category) ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-2 mt-2">
                {categorySettings.map((setting) => (
                  <div key={setting.id} className="flex items-center justify-between p-3 border rounded-lg ml-4">
                    <div className="flex-1">
                      <div className="font-medium">{setting.setting_key}</div>
                      <div className="text-sm text-gray-600">{setting.setting_value}</div>
                      {setting.description && (
                        <div className="text-xs text-gray-500 mt-1">{setting.description}</div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(setting)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(setting)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </CollapsibleContent>
            </Collapsible>
          ))
        )}
      </CardContent>

      <CrudFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSubmit={handleFormSubmit}
        formConfig={formConfig}
        initialData={transformSettingForForm(currentItem)}
        title={formMode === 'create' ? t('Add Company Setting') : t('Edit Company Setting')}
        mode={formMode}
      />

      <CrudDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        itemName={currentItem?.setting_key || ''}
        entityName={t('company setting')}
      />
    </Card>
  );
}