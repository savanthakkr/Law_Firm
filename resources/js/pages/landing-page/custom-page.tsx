import React from 'react';
import { usePage, Head } from '@inertiajs/react';
import Header from './components/Header';
import Footer from './components/Footer';
import { useFavicon } from '@/hooks/use-favicon';
import { useBrand } from '@/contexts/BrandContext';
import { THEME_COLORS } from '@/hooks/use-appearance';

interface CustomPage {
  id: number;
  title: string;
  slug: string;
  content: string;
  meta_title?: string;
  meta_description?: string;
  is_active: boolean;
}

interface CustomPageData {
  id: number;
  title: string;
  slug: string;
}

interface PageProps {
  page: CustomPage;
  customPages: CustomPageData[];
  settings: {
    company_name: string;
    contact_email?: string;
    contact_phone?: string;
    contact_address?: string;
    config_sections?: {
      sections?: Array<{
        key: string;
        [key: string]: any;
      }>;
    };
    [key: string]: any;
  };
}

export default function CustomPage() {
  // Custom CSS to fix styling issues
  const customCSS = `
    /* Fix form inputs */
    .custom-page-content input:focus, 
    .custom-page-content textarea:focus {
      --tw-ring-color: var(--primary-color) !important;
      border-color: var(--primary-color) !important;
    }
    
    /* Fix color issues */
    .custom-page-content .bg-blue-50 { background-color: rgba(var(--primary-color-rgb), 0.1) !important; }
    .custom-page-content .bg-purple-50 { background-color: rgba(var(--secondary-color-rgb), 0.1) !important; }
    .custom-page-content .bg-green-50 { background-color: rgba(var(--accent-color-rgb), 0.1) !important; }
    .custom-page-content .bg-red-50 { background-color: rgba(var(--accent-color-rgb), 0.1) !important; }
    
    .custom-page-content .text-blue-600 { color: var(--primary-color) !important; }
    .custom-page-content .text-purple-600 { color: var(--secondary-color) !important; }
    .custom-page-content .text-green-600 { color: var(--accent-color) !important; }
    .custom-page-content .text-red-600 { color: var(--accent-color) !important; }
    
    .custom-page-content .border-blue-500 { border-color: var(--primary-color) !important; }
    .custom-page-content .border-purple-500 { border-color: var(--secondary-color) !important; }
    .custom-page-content .border-green-500 { border-color: var(--accent-color) !important; }
    .custom-page-content .border-red-500 { border-color: var(--accent-color) !important; }
    
    .custom-page-content .bg-blue-600 { background-color: var(--primary-color) !important; }
    .custom-page-content .bg-purple-600 { background-color: var(--secondary-color) !important; }
    .custom-page-content .bg-green-600 { background-color: var(--accent-color) !important; }
    .custom-page-content .bg-red-500 { background-color: var(--accent-color) !important; }
    
    /* Fix border colors */
    .custom-page-content .border-blue-200 { border-color: rgba(var(--primary-color-rgb), 0.2) !important; }
    .custom-page-content .border-green-200 { border-color: rgba(var(--accent-color-rgb), 0.2) !important; }
    
    /* Fix hover states */
    .custom-page-content .hover\:bg-blue-700:hover { background-color: var(--primary-color) !important; opacity: 0.9; }
    
    /* Fix form button */
    .custom-page-content .bg-blue-600 { background-color: var(--primary-color) !important; }
  `;
  const { page, customPages = [], settings } = usePage<PageProps>().props;
  
  // Get brand colors - use same approach as landing page and login page
  const { themeColor, customColor } = useBrand();
  const { props } = usePage();
  const globalSettings = (props as any)?.globalSettings;
  
  // Get theme color from global settings or brand context (same as login page)
  let primaryColor = themeColor === 'custom' ? customColor : THEME_COLORS[themeColor as keyof typeof THEME_COLORS];
  
  // If we have backend settings, use those as priority
  if (globalSettings?.themeColor) {
    if (globalSettings.themeColor === 'custom' && globalSettings.customColor) {
      primaryColor = globalSettings.customColor;
    } else {
      primaryColor = THEME_COLORS[globalSettings.themeColor as keyof typeof THEME_COLORS] || primaryColor;
    }
  }
  
  const secondaryColor = '#8b5cf6';
  const accentColor = '#10b981';
  useFavicon();
  return (
    <>
      <Head>
        <title>{page.meta_title || page.title}</title>
        {page.meta_description && (
          <meta name="description" content={page.meta_description} />
        )}
        <style>{customCSS}</style>
      </Head>
      
      <div 
        className="min-h-screen bg-white" 
        style={{ 
          '--primary-color': primaryColor,
          '--secondary-color': secondaryColor,
          '--accent-color': accentColor,
          '--primary-color-rgb': primaryColor.replace('#', '').match(/.{2}/g)?.map(x => parseInt(x, 16)).join(', ') || '59, 130, 246',
          '--secondary-color-rgb': secondaryColor.replace('#', '').match(/.{2}/g)?.map(x => parseInt(x, 16)).join(', ') || '139, 92, 246',
          '--accent-color-rgb': accentColor.replace('#', '').match(/.{2}/g)?.map(x => parseInt(x, 16)).join(', ') || '16, 185, 129'
        } as React.CSSProperties}
      >
        <Header 
          settings={settings} 
          customPages={customPages}
          sectionData={settings?.config_sections?.sections?.find(s => s.key === 'header') || {}}
          brandColor={primaryColor}
        />
        
        <main className="pt-16">
          <div className="custom-page-content" dangerouslySetInnerHTML={{ __html: page.content }} />
        </main>
        
        <Footer 
          settings={settings} 
          sectionData={settings?.config_sections?.sections?.find(s => s.key === 'footer') || {}} 
          brandColor={primaryColor}
        />
      </div>
    </>
  );
}