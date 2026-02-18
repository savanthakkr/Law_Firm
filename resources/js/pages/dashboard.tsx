import React from 'react';
import { PageTemplate } from '@/components/page-template';
import { RefreshCw, Scale, Users, FileText, Calendar, DollarSign, MessageSquare, Clock, TrendingUp, AlertTriangle, CheckCircle, XCircle, Briefcase, Gavel, BookOpen, Shield, Timer, Target, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useTranslation } from 'react-i18next';
import { Link, usePage } from '@inertiajs/react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Area, AreaChart } from 'recharts';
import { formatCurrency } from '@/utils/helpers';

interface CompanyDashboardData {
  stats: {
    totalCases: number;
    activeCases: number;
    totalClients: number;
    totalRevenue: number;
    monthlyGrowth: number;
    pendingTasks: number;
    upcomingHearings: number;
    unreadMessages: number;
  };
  recentActivity: Array<{
    id: number;
    type: 'case' | 'client' | 'hearing' | 'message' | 'task';
    title: string;
    description: string;
    time: string;
    status: 'success' | 'warning' | 'error' | 'info';
  }>;
  casesByStatus: Array<{ name: string; value: number; color: string }>;
  revenueData: Array<{ month: string; revenue: number; cases: number }>;
  upcomingHearings: Array<{
    id: number;
    title: string;
    court: string;
    date: string;
    time: string;
    type: string;
  }>;
  tasksPriority: Array<{ priority: string; count: number; color: string }>;
  plan: {
    name: string;
    storage_limit: number;
  };
}

interface PageAction {
  label: string;
  icon: React.ReactNode;
  variant: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  onClick: () => void;
}

export default function Dashboard({ dashboardData }: { dashboardData: CompanyDashboardData }) {
  const { t } = useTranslation();
  const { auth } = usePage().props as any;

  const pageActions: PageAction[] = [
    {
      label: t('Analytics'),
      icon: <BarChart3 className="h-4 w-4" />,
      variant: 'outline',
      onClick: () => window.location.href = route('dashboard.analytics.index')
    },
    {
      label: t('Refresh'),
      icon: <RefreshCw className="h-4 w-4" />,
      variant: 'outline',
      onClick: () => window.location.reload()
    },
  ];

  const stats = dashboardData?.stats || {
    totalCases: 156,
    activeCases: 89,
    totalClients: 234,
    totalRevenue: 125000,
    monthlyGrowth: 12.5,
    pendingTasks: 23,
    upcomingHearings: 8,
    unreadMessages: 15
  };

  const recentActivity = dashboardData?.recentActivity || [];
  const casesByStatus = dashboardData?.casesByStatus || [
    { name: 'Active', value: 45, color: '#10b981' },
    { name: 'Pending', value: 25, color: '#f59e0b' },
    { name: 'Closed', value: 30, color: '#6b7280' }
  ];
  const revenueData = dashboardData?.revenueData || [];
  const upcomingHearings = dashboardData?.upcomingHearings || [];
  const tasksPriority = dashboardData?.tasksPriority || [
    { priority: 'High', count: 8, color: '#ef4444' },
    { priority: 'Medium', count: 12, color: '#f59e0b' },
    { priority: 'Low', count: 3, color: '#10b981' }
  ];

  // ShareModal state variables removed



  return (
    <PageTemplate 
      title={t('Dashboard')}
      url="/dashboard"
      actions={pageActions}
    >
      <div className="space-y-6">
        {/* Key Metrics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Link href={route('cases.index')}>
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{t('Active Cases')}</p>
                    <h3 className="mt-2 text-2xl font-bold">{stats.activeCases}</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      {stats.totalCases} {t('total')}
                    </p>
                  </div>
                  <div className="rounded-full bg-blue-100 p-3 dark:bg-blue-900">
                    <Scale className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href={route('clients.index')}>
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{t('Active Clients')}</p>
                    <h3 className="mt-2 text-2xl font-bold">{stats.activeClients || stats.totalClients}</h3>
                    <p className="text-xs text-green-600 mt-1">+{stats.monthlyGrowth}% {t('this month')}</p>
                  </div>
                  <div className="rounded-full bg-green-100 p-3 dark:bg-green-900">
                    <Users className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href={route('clients.billing.index')}>
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{t('Total Revenue')}</p>
                    <h3 className="mt-2 text-2xl font-bold">{formatCurrency(stats?.totalRevenue ?? 0)}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{t('This year')}</p>
                  </div>
                  <div className="rounded-full bg-emerald-100 p-3 dark:bg-emerald-900">
                    <DollarSign className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href={route('tasks.index')}>
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{t('Pending Tasks')}</p>
                    <h3 className="mt-2 text-2xl font-bold">{stats.pendingTasks}</h3>
                    <p className="text-xs text-orange-600 mt-1">{stats.upcomingHearings} {t('hearings due')}</p>
                  </div>
                  <div className="rounded-full bg-orange-100 p-3 dark:bg-orange-900">
                    <Clock className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Main Dashboard Content */}
        <div className="grid gap-1 lg:grid-cols-1">
          {/* Upcoming Hearings */}
          <Card >
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Gavel className="h-5 w-5" />
                  {t('Upcoming Hearings')}
                </div>
                <Badge variant="secondary">{stats.upcomingHearings}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {upcomingHearings.slice(0, 4).map((hearing) => (
                  <div key={hearing.id} className="flex items-start gap-3 p-3 rounded-lg border">
                    <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                      <Calendar className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{hearing.title}</p>
                      <p className="text-xs text-muted-foreground">{hearing.court?.name || hearing.court}</p>
                      <p className="text-xs text-muted-foreground">{hearing.date} at {hearing.time}</p>
                    </div>
                    <Badge variant="outline" className="text-xs">{hearing.type}</Badge>
                  </div>
                ))}
                {upcomingHearings.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">{t('No upcoming hearings')}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Plan Status */}
          {/* <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  {t('Plan Status')}
                </div>
                <Badge variant="outline">{dashboardData?.plan?.name || 'Free Plan'}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {(() => {
                  const plan = dashboardData?.plan || {};
                  const stats = dashboardData?.stats || {};
                  const maxUsers = plan.max_users || 5;
                  const storageLimit = plan.storage_limit || 5;
                  const totalStorageUsed = dashboardData?.storage?.total_used || 0;
                  const currentUsers = stats.currentUsers || 0;
                  
                  return (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{t('Team Members')}</span>
                        <span className="text-sm text-muted-foreground">{currentUsers} / {maxUsers}</span>
                      </div>
                      <Progress value={(currentUsers / maxUsers) * 100} className="h-2" />
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{t('Storage')}</span>
                        <span className="text-sm text-muted-foreground">{totalStorageUsed} GB / {storageLimit} GB</span>
                      </div>
                      <Progress value={(totalStorageUsed / storageLimit) * 100} className="h-2" />
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{t('Cases')}</span>
                        <span className="text-sm text-muted-foreground">{stats.totalCases || 0} / {plan.max_cases || '∞'}</span>
                      </div>
                      <Progress value={plan.max_cases ? Math.min((stats.totalCases || 0) / plan.max_cases, 1) * 100 : 50} className="h-2" />
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{t('Clients')}</span>
                        <span className="text-sm text-muted-foreground">{stats.totalClients || 0} / {plan.max_clients || '∞'}</span>
                      </div>
                      <Progress value={plan.max_clients ? Math.min((stats.totalClients || 0) / plan.max_clients, 1) * 100 : 50} className="h-2" />
                      
                      <div className="pt-2 border-t">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">{t('Plan Details')}</span>
                          <div className="text-right">
                            <div className="text-sm font-bold">${plan.price || 0}/mo</div>
                            {plan.yearly_price && (
                              <div className="text-xs text-muted-foreground">${plan.yearly_price}/yr</div>
                            )}
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground space-y-1">
                          <div>• {maxUsers} {t('Team Members')}</div>
                          <div>• {plan.max_cases || '∞'} {t('Cases')}</div>
                          <div>• {plan.max_clients || '∞'} {t('Clients')}</div>
                          <div>• {storageLimit} GB {t('Storage')}</div>
                        </div>
                        {plan.is_trial && plan.trial_expire_date && (
                          <div className="mt-2 p-2 bg-orange-50 rounded text-xs text-orange-700">
                            {t('Trial expires')}:{' '} {plan?.trial_expire_date ? new Date(plan.trial_expire_date).toLocaleDateString() : '-'}
                          </div>
                        )}
                      </div>
                    </>
                  );
                })()}
              </div>
            </CardContent>
          </Card> */}
        </div>



        {/* Additional Analytics */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Tasks by Priority */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                {t('Tasks by Priority')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {tasksPriority.map((task, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded-full" style={{ backgroundColor: task.color }} />
                      <span className="font-medium">{task.priority} Priority</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold">{task.count}</span>
                      <span className="text-sm text-muted-foreground">{t('tasks')}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                {t('Quick Actions')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <Link href={route('clients.index')}>
                  <Button variant="outline" className="w-full h-16 flex flex-col gap-1">
                    <Users className="h-5 w-5" />
                    <span className="text-xs">{t('Add Client')}</span>
                  </Button>
                </Link>
                <Link href={route('cases.index')}>
                  <Button variant="outline" className="w-full h-16 flex flex-col gap-1">
                    <Scale className="h-5 w-5" />
                    <span className="text-xs">{t('New Case')}</span>
                  </Button>
                </Link>
                <Link href={route('hearings.index')}>
                  <Button variant="outline" className="w-full h-16 flex flex-col gap-1">
                    <Gavel className="h-5 w-5" />
                    <span className="text-xs">{t('Schedule Hearing')}</span>
                  </Button>
                </Link>
                <Link href={route('communication.messages.index')}>
                  <Button variant="outline" className="w-full h-16 flex flex-col gap-1 relative">
                    <MessageSquare className="h-5 w-5" />
                    <span className="text-xs">{t('Messages')}</span>
                    {stats.unreadMessages > 0 && (
                      <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs">
                        {stats.unreadMessages}
                      </Badge>
                    )}
                  </Button>
                </Link>

              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Share Modal removed */}
    </PageTemplate>
  );
}