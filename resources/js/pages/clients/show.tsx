import { useState } from 'react';
import { PageTemplate } from '@/components/page-template';
import { usePage } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, FileText } from 'lucide-react';
import { formatCurrency } from '@/utils/helpers';
export default function ClientShow() {
  const { t } = useTranslation();
  const { client, documents } = usePage().props as any;

  const breadcrumbs = [
    { title: t('Dashboard'), href: route('dashboard') },
    { title: t('Client Management'), href: route('clients.index') },
    { title: t('Clients'), href: route('clients.index') },
    { title: client.name }
  ];

  const pageActions = [
    {
      label: t('Back to Clients'),
      icon: <ArrowLeft className="h-4 w-4 mr-2" />,
      variant: 'outline',
      onClick: () => window.location.href = route('clients.index')
    }
  ];


  return (
    <PageTemplate
      title={`${t('Client')}: ${client.name}`}
      breadcrumbs={breadcrumbs}
      actions={pageActions}
      noPadding
    >
      <div className="space-y-6">
        {/* Client Details Card */}
        <Card className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">{t('Basic Information')}</h3>
              <div className="space-y-2">
                <div><strong>{t('Client ID')}:</strong> {client.client_id}</div>
                <div><strong>{t('Name')}:</strong> {client.name}</div>
                <div><strong>{t('Email')}:</strong> {client.email || '-'}</div>
                <div><strong>{t('Phone')}:</strong> {client.phone || '-'}</div>
                <div><strong>{t('Type')}:</strong> {client.client_type?.name || '-'}</div>
                <div><strong>{t('Status')}:</strong> 
                  <Badge className="ml-2" variant={client.status === 'active' ? 'default' : 'secondary'}>
                    {client.status === 'active' ? t('Active') : t('Inactive')}
                  </Badge>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">{t('Contact Information')}</h3>
              <div className="space-y-2">
                <div><strong>{t('Address')}:</strong> {client.address || '-'}</div>
                <div><strong>{t('Company')}:</strong> {client.company_name || '-'}</div>
                <div><strong>{t('Tax ID')}:</strong> {client.tax_id || '-'}</div>
                <div><strong>{t('Tax Rate')}:</strong> {client.tax_rate ? `${client.tax_rate}%` : '0%'}</div>
                <div><strong>{t('Date of Birth')}:</strong> {client.date_of_birth ? (window.appSettings?.formatDate(client.date_of_birth) || new Date(client.date_of_birth).toLocaleDateString()) : '-'}</div>
                <div><strong>{t('Referral Source')}:</strong> {client.referral_source || '-'}</div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">{t('Additional Information')}</h3>
              <div className="space-y-2">
                <div><strong>{t('Notes')}:</strong></div>
                <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                  {client.notes || t('No notes available')}
                </div>
                <div><strong>{t('Created')}:</strong> {window.appSettings?.formatDate(client.created_at) || new Date(client.created_at).toLocaleDateString()}</div>
              </div>
            </div>
          </div>
        </Card>

        {/* Tabs for Related Data */}
        <Card className="p-6">
          <Tabs defaultValue="documents" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="documents">{t('Documents')} ({documents?.length || 0})</TabsTrigger>
              <TabsTrigger value="billing">{t('Billing Info')} ({client.billing_info ? 1 : 0})</TabsTrigger>
            </TabsList>
            
            <TabsContent value="documents" className="mt-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">{t('Client Documents')}</h3>
                {documents && documents.length > 0 ? (
                  <div className="grid gap-4">
                    {documents.map((doc: any, index: number) => (
                      <Card key={index} className="p-4 cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => window.open(doc.file_path, '_blank')}>
                        <div className="flex gap-4">
                          <div className="flex-shrink-0">
                            {doc.file_path ? (
                              <img 
                                src={doc.file_path} 
                                alt={doc.document_name}
                                className="w-16 h-16 object-cover rounded border"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                  e.currentTarget.nextElementSibling.style.display = 'flex';
                                }}
                              />
                            ) : null}
                            <div className="w-16 h-16 bg-gray-100 rounded border flex items-center justify-center" style={{display: doc.file_path ? 'none' : 'flex'}}>
                              <FileText className="h-6 w-6 text-gray-500" />
                            </div>
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="font-medium">{doc.document_name}</h4>
                              <Badge variant="outline">{doc.document_type}</Badge>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div><strong>{t('Uploaded')}:</strong> {window.appSettings?.formatDate(doc.created_at) || new Date(doc.created_at).toLocaleDateString()}</div>
                              <div className="col-span-2"><strong>{t('Description')}:</strong> {doc.description || '-'}</div>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    {t('No documents found for this client')}
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="billing" className="mt-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">{t('Billing Information')}</h3>
                {client.billing_info ? (
                  <Card className="p-4">
                    <div className="flex justify-between items-start mb-4">
                      <h4 className="font-medium">{t('Client Billing Details')}</h4>
                      {client.billing_info.status && (
                        <Badge variant={client.billing_info.status === 'active' ? 'default' : 'secondary'}>
                          {client.billing_info.status}
                        </Badge>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      {client.billing_info.billing_address && (
                        <div><strong>{t('Billing Address')}:</strong> {client.billing_info.billing_address}</div>
                      )}
                      {client.billing_info.billing_contact_name && (
                        <div><strong>{t('Contact Name')}:</strong> {client.billing_info.billing_contact_name}</div>
                      )}
                      {client.billing_info.billing_contact_email && (
                        <div><strong>{t('Contact Email')}:</strong> {client.billing_info.billing_contact_email}</div>
                      )}
                      {client.billing_info.billing_contact_phone && (
                        <div><strong>{t('Contact Phone')}:</strong> {client.billing_info.billing_contact_phone}</div>
                      )}
                      {client.billing_info.payment_terms && (
                        <div><strong>{t('Payment Terms')}:</strong> {client.billing_info.formatted_payment_terms || client.billing_info.payment_terms}</div>
                      )}
                      {client.billing_info.custom_payment_terms && (
                        <div><strong>{t('Custom Payment Terms')}:</strong> {client.billing_info.custom_payment_terms}</div>
                      )}

                      {(client.billing_info.currency_name || client.billing_info.currency) && (
                        <div><strong>{t('Currency')}:</strong> {client.billing_info.currency_name || client.billing_info.currency} {client.billing_info.currency_code && `(${client.billing_info.currency_code})`}</div>
                      )}
                      {client.billing_info.billing_notes && (
                        <div className="col-span-2"><strong>{t('Billing Notes')}:</strong> {client.billing_info.billing_notes}</div>
                      )}
                    </div>
                  </Card>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    {t('No billing information found for this client')}
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </PageTemplate>
  );
}