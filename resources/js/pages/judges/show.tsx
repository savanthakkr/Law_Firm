import { PageTemplate } from '@/components/page-template';
import { usePage } from '@inertiajs/react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from 'react-i18next';

export default function JudgeShow() {
  const { t } = useTranslation();
  const { judge } = usePage().props as any;

  const breadcrumbs = [
    { title: t('Dashboard'), href: route('dashboard') },
    { title: t('Court Schedule'), href: route('courts.index') },
    { title: t('Judges'), href: route('judges.index') },
    { title: judge.name }
  ];

  return (
    <PageTemplate
      title={judge.name}
      url={`/judges/${judge.id}`}
      breadcrumbs={breadcrumbs}
    >
      <div className="space-y-6">
        {/* Basic Information */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">{t('Basic Information')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500">{t('Judge ID')}</label>
              <p className="mt-1">{judge.judge_id}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">{t('Judge Name')}</label>
              <p className="mt-1">{judge.name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">{t('Title')}</label>
              <p className="mt-1">{judge.title || '-'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">{t('Status')}</label>
              <p className="mt-1">
                <Badge variant={judge.status === 'active' ? 'default' : 'secondary'}>
                  {judge.status === 'active' ? t('Active') : t('Inactive')}
                </Badge>
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">{t('Court')}</label>
              <p className="mt-1">{judge.court?.name || '-'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">{t('Email')}</label>
              <p className="mt-1">{judge.email || '-'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">{t('Phone')}</label>
              <p className="mt-1">{judge.phone || '-'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">{t('Created At')}</label>
              <p className="mt-1">
                {window.appSettings?.formatDateTime(judge.created_at, false) || new Date(judge.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        </Card>

        {/* Contact Information */}
        {judge.contact_info && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">{t('Contact Information')}</h3>
            <p className="whitespace-pre-wrap">{judge.contact_info}</p>
          </Card>
        )}

        {/* Preferences */}
        {judge.preferences && Object.keys(judge.preferences).length > 0 && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">{t('Preferences')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(judge.preferences).map(([key, value]) => (
                <div key={key}>
                  <label className="text-sm font-medium text-gray-500">
                    {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </label>
                  <p className="mt-1">
                    {typeof value === 'boolean' ? (value ? t('Yes') : t('No')) : String(value)}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Notes */}
        {judge.notes && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">{t('Notes')}</h3>
            <p className="whitespace-pre-wrap">{judge.notes}</p>
          </Card>
        )}
      </div>
    </PageTemplate>
  );
}