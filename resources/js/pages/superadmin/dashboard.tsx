import React, { useState } from 'react';
import { PageTemplate } from '@/components/page-template';
import { RefreshCw, BarChart3, Scale, Building2, CreditCard, DollarSign, TrendingUp, Activity, Users, AlertCircle, FileText, Gavel, BookOpen, Shield, Eye, Clock, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { router } from '@inertiajs/react';
import { useBrand } from '@/contexts/BrandContext';
import { THEME_COLORS } from '@/hooks/use-appearance';
import { formatCurrency } from '@/utils/helpers';

interface SuperAdminDashboardData {
  stats: {
    totalLawFirms: number;
    totalRevenue: number;
    monthlyRevenue: number;
    yearlyRevenue: number;
    activePlans: number;
    pendingRequests: number;
    monthlyGrowth: number;
    totalCases: number;
    activeCases: number;
    totalClients: number;
    totalHearings: number;
    totalAttorneys: number;
    totalDocuments: number;
  };
  recentActivity: Array<{
    id: number;
    type: string;
    message: string;
    time: string;
    status: 'success' | 'warning' | 'error';
  }>;
  topPlans: Array<{
    name: string;
    subscribers: number;
    revenue: number;
    price: number;
    features: {
      max_users: number;
      max_cases: number;
      max_clients: number;
      storage_limit: number;
    };
  }>;
  practiceAreas: Array<{
    name: string;
    count: number;
    percentage: number;
  }>;
  revenueAnalytics: {
    total: number;
    monthly: number;
    yearly: number;
    growth: number;
  };
}

interface PageAction {
  label: string;
  icon: React.ReactNode;
  variant: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  onClick: () => void;
}

export default function SuperAdminDashboard({ dashboardData }: { dashboardData: SuperAdminDashboardData }) {
  const { t } = useTranslation();
  const { themeColor, customColor } = useBrand();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    router.reload({ only: ['dashboardData'] });
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const pageActions: PageAction[] = [
    {
      label: t('Refresh'),
      icon: <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />,
      variant: 'outline',
      onClick: handleRefresh
    }
  ];

  const stats = dashboardData?.stats || {
    totalLawFirms: 156,
    totalRevenue: 245678,
    monthlyRevenue: 18500,
    yearlyRevenue: 245678,
    activePlans: 8,
    pendingRequests: 12,
    monthlyGrowth: 15.2,
    totalCases: 1247,
    activeCases: 892,
    totalClients: 2156,
    totalHearings: 89,
    totalAttorneys: 324,
    totalDocuments: 5678
  };

  const recentActivity = dashboardData?.recentActivity || [
    { id: 1, type: 'law_firm', message: 'New law firm registered: Smith & Associates', time: '2 hours ago', status: 'success' },
    { id: 2, type: 'subscription', message: 'Plan subscription: $299.00', time: '4 hours ago', status: 'success' },
    { id: 3, type: 'plan_request', message: 'Plan upgrade request pending', time: '6 hours ago', status: 'warning' },
  ];

  const topPlans = dashboardData?.topPlans || [
    { name: 'Professional', subscribers: 45, revenue: 13500, price: 299, features: { max_users: 10, max_cases: 100, max_clients: 200, storage_limit: 50 } },
    { name: 'Business', subscribers: 32, revenue: 9600, price: 199, features: { max_users: 5, max_cases: 50, max_clients: 100, storage_limit: 25 } },
    { name: 'Enterprise', subscribers: 12, revenue: 7200, price: 599, features: { max_users: 25, max_cases: 500, max_clients: 1000, storage_limit: 200 } },
  ];

  const practiceAreas = dashboardData?.practiceAreas || [
    { name: 'Corporate Law', count: 45, percentage: 28.5 },
    { name: 'Criminal Defense', count: 38, percentage: 24.1 },
    { name: 'Family Law', count: 32, percentage: 20.3 },
    { name: 'Personal Injury', count: 25, percentage: 15.8 },
    { name: 'Real Estate', count: 18, percentage: 11.4 },
  ];



  return (
    <PageTemplate 
      title={t('Super Admin Dashboard')}
      description={t('Comprehensive overview of your legal practice management platform')}
      url="/dashboard"
      actions={pageActions}
    >
      <div className="space-y-8">
        {/* Executive Summary */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">{t('Total Law Firms')}</p>
                  <div className="flex items-baseline gap-2">
                    <h3 className="text-3xl font-bold tracking-tight">{(stats?.totalLawFirms ?? 0).toLocaleString()}</h3>
                    <Badge variant="secondary" className="text-xs bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                      +{stats.monthlyGrowth}%
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{t('Active subscribers')}</p>
                </div>
                <div className="rounded-lg bg-blue-50 p-3 dark:bg-blue-900/20">
                  <Building2 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-emerald-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">{t('Monthly Revenue')}</p>
                  <h3 className="text-3xl font-bold tracking-tight">{formatCurrency(stats?.monthlyRevenue ?? 0)}</h3>
                  <p className="text-xs text-muted-foreground">{formatCurrency(stats?.totalRevenue ?? 0)} {t('total')}</p>
                </div>
                <div className="rounded-lg bg-emerald-50 p-3 dark:bg-emerald-900/20">
                  <DollarSign className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">{t('Active Cases')}</p>
                  <h3 className="text-3xl font-bold tracking-tight">{(stats?.activeCases ?? 0).toLocaleString()}</h3>
                  <p className="text-xs text-muted-foreground">{(stats?.totalCases ?? 0).toLocaleString()} {t('total cases')}</p>
                </div>
                <div className="rounded-lg bg-purple-50 p-3 dark:bg-purple-900/20">
                  <Scale className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">{t('Platform Users')}</p>
                  <h3 className="text-3xl font-bold tracking-tight">{((stats?.totalAttorneys ?? 0) + (stats?.totalClients ?? 0)).toLocaleString()}</h3>
                  <p className="text-xs text-muted-foreground">{stats.totalAttorneys} {t('attorneys')}, {stats.totalClients} {t('clients')}</p>
                </div>
                <div className="rounded-lg bg-orange-50 p-3 dark:bg-orange-900/20">
                  <Users className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* System Status */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Shield className="h-5 w-5 text-green-600" />
                {t('System Status')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-green-50 dark:bg-green-900/20">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium">{t('System Health')}</span>
                </div>
                <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                  {t('Excellent')}
                </Badge>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{t('Uptime')}</span>
                  <span className="font-medium">99.9%</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{t('Response Time')}</span>
                  <span className="font-medium">200ms</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{t('Security Score')}</span>
                  <span className="font-medium text-green-600">A+</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Activity className="h-5 w-5 text-blue-600" />
                {t('Recent Activity')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentActivity.slice(0, 4).map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg border border-border/50 hover:bg-muted/50 transition-colors">
                    <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                      activity.status === 'success' ? 'bg-green-500' :
                      activity.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium leading-tight">{activity.message}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-xs text-muted-foreground">{activity.time}</p>
                        <Badge variant="outline" className="text-xs px-1.5 py-0.5">
                          {activity.type.replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <BarChart3 className="h-5 w-5 text-purple-600" />
                {t('Quick Insights')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                  <div className="text-xl font-bold text-blue-600">{stats.totalHearings}</div>
                  <div className="text-xs text-muted-foreground">{t('Hearings Today')}</div>
                </div>
                <div className="text-center p-3 rounded-lg bg-purple-50 dark:bg-purple-900/20">
                  <div className="text-xl font-bold text-purple-600">{stats.pendingRequests}</div>
                  <div className="text-xs text-muted-foreground">{t('Pending Requests')}</div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{t('Documents Processed')}</span>
                  <span className="font-medium">{(stats?.totalDocuments ?? 0).toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{t('Active Subscriptions')}</span>
                  <span className="font-medium">{stats.activePlans}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Analytics */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Practice Areas Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-indigo-600" />
                {t('Practice Areas Distribution')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {practiceAreas.map((area, index) => (
                  <div key={area.name} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'][index] }} />
                        <span className="text-sm font-medium">{area.name}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-medium">{area.count}</span>
                        <span className="text-xs text-muted-foreground ml-1">firms</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress value={area.percentage} className="flex-1 h-2" />
                      <span className="text-xs text-muted-foreground w-12 text-right">{area.percentage}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Subscription Plans Performance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-green-600" />
                {t('Subscription Plans Performance')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topPlans.map((plan, index) => (
                  <div key={plan.name} className="p-4 rounded-lg border border-border/50 hover:shadow-sm transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: themeColor === 'custom' ? customColor : THEME_COLORS[themeColor] }}>
                          <span className="text-xs font-bold text-white">#{index + 1}</span>
                        </div>
                        <div>
                          <span className="font-semibold">{plan.name}</span>
                          <div className="text-xs text-muted-foreground">${plan.price}/month</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-green-600">${(plan.revenue ?? 0).toLocaleString()}</div>
                        <div className="text-xs text-muted-foreground">{t('revenue')}</div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>{plan.subscribers} {t('subscribers')}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span>{plan.features.max_cases} {t('cases limit')}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageTemplate>
  );
}