import { PageTemplate } from '@/components/page-template';
import { usePage } from '@inertiajs/react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from 'react-i18next';

export default function HearingTypeShow() {
  const { t } = useTranslation();
  const { hearingType } = usePage().props as any;

  const breadcrumbs = [
    { title: t('Dashboard'), href: route('dashboard') },
    { title: t('Court Schedule'), href: route('courts.index') },
    { title: t('Hearing Types'), href: route('hearing-types.index') },
    { title: hearingType.name }
  ];

  return (
    <PageTemplate
      title={hearingType.name}
      url={`/hearing-types/${hearingType.id}`}
      breadcrumbs={breadcrumbs}
    >
      <div className="space-y-6">
        {/* Basic Information */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">{t('Basic Information')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500">{t('Type ID')}</label>
              <p className="mt-1">{hearingType.type_id}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">{t('Hearing Type Name')}</label>
              <p className="mt-1">{hearingType.name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">{t('Duration Estimate')}</label>
              <p className="mt-1">{hearingType.duration_estimate ? `${hearingType.duration_estimate} minutes` : '-'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">{t('Status')}</label>
              <p className="mt-1">
                <Badge variant={hearingType.status === 'active' ? 'default' : 'secondary'}>
                  {hearingType.status === 'active' ? t('Active') : t('Inactive')}
                </Badge>
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">{t('Created At')}</label>
              <p className="mt-1">
                {window.appSettings?.formatDateTime(hearingType.created_at, false) || new Date(hearingType.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        </Card>

        {/* Description */}
        {hearingType.description && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">{t('Description')}</h3>
            <p className="whitespace-pre-wrap">{hearingType.description}</p>
          </Card>
        )}

        {/* Requirements */}
        {hearingType.requirements && hearingType.requirements.length > 0 && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">{t('Requirements')}</h3>
            <div className="flex flex-wrap gap-2">
              {hearingType.requirements.map((requirement: string, index: number) => (
                <Badge key={index} variant="outline">
                  {requirement.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </Badge>
              ))}
            </div>
          </Card>
        )}

        {/* Notes */}
        {hearingType.notes && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">{t('Notes')}</h3>
            <p className="whitespace-pre-wrap">{hearingType.notes}</p>
          </Card>
        )}
      </div>
    </PageTemplate>
  );
}