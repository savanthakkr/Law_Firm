import React from 'react';
import { Head } from '@inertiajs/react';
import { PageTemplate } from '@/components/page-template';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CalendarDays, Clock, FileText, Users, CheckCircle, AlertCircle, Scale, Gavel, Timer, TrendingUp, Target, BarChart3 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from '@inertiajs/react';

interface Task {
    id: number;
    title: string;
    priority: string;
    due_date: string;
    status: string;
}

interface Case {
    id: number;
    case_id: string;
    title: string;
    priority: string;
    client?: { name: string };
    case_status?: { name: string };
}

interface Hearing {
    id: number;
    title: string;
    hearing_date: string;
    hearing_time: string;
    case?: { title: string };
    court?: { name: string };
}

interface TimeEntry {
    id: number;
    description: string;
    hours: number;
    entry_date: string;
    case?: { title: string };
}

interface Stats {
    total_tasks: number;
    pending_tasks: number;
    total_cases: number;
    total_hours_this_month: number;
    task_completion_percentage: number;
}

interface Props {
    myTasks: Task[];
    myCases: Case[];
    upcomingHearings: Hearing[];
    recentTimeEntries: TimeEntry[];
    stats: Stats;
}

export default function TeamMemberDashboard({ myTasks, myCases, upcomingHearings, recentTimeEntries, stats }: Props) {
    const { t } = useTranslation();

    return (
        <PageTemplate 
            title={t('Dashboard')}
            url="/dashboard"
        >
            <Head title="Team Member Dashboard" />
            
            <div className="space-y-6">
                {/* Key Metrics */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Link href={route('tasks.index')}>
                        <Card className="cursor-pointer hover:shadow-md transition-shadow">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">{t('My Tasks')}</p>
                                        <h3 className="mt-2 text-2xl font-bold">{stats.total_tasks}</h3>
                                        <p className="text-xs text-orange-600 mt-1">{stats.pending_tasks} {t('pending')}</p>
                                    </div>
                                    <div className="rounded-full bg-blue-100 p-3 dark:bg-blue-900">
                                        <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </Link>

                    <Link href={route('cases.index')}>
                        <Card className="cursor-pointer hover:shadow-md transition-shadow">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">{t('My Cases')}</p>
                                        <h3 className="mt-2 text-2xl font-bold">{stats.total_cases}</h3>
                                        <p className="text-xs text-muted-foreground mt-1">{t('assigned to me')}</p>
                                    </div>
                                    <div className="rounded-full bg-green-100 p-3 dark:bg-green-900">
                                        <Scale className="h-5 w-5 text-green-600 dark:text-green-400" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </Link>

                    <Link href={route('hearings.index')}>
                        <Card className="cursor-pointer hover:shadow-md transition-shadow">
                            <CardContent className="p-8">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">{t('Upcoming Hearings')}</p>
                                        <h3 className="mt-2 text-2xl font-bold">{upcomingHearings.length}</h3>
                                    </div>
                                    <div className="rounded-full bg-purple-100 p-3 dark:bg-purple-900">
                                        <Gavel className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </Link>

                    <Link href={route('billing.time-entries.index')}>
                        <Card className="cursor-pointer hover:shadow-md transition-shadow">
                            <CardContent className="p-8">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">{t('Hours This Month')}</p>
                                        <h3 className="mt-2 text-2xl font-bold">{stats.total_hours_this_month}</h3>
                                    </div>
                                    <div className="rounded-full bg-emerald-100 p-3 dark:bg-emerald-900">
                                        <Timer className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                </div>

                {/* Main Dashboard Content */}
                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Priority Tasks */}
                    <Card className="lg:col-span-1">
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Target className="h-5 w-5" />
                                    {t('Priority Tasks')}
                                </div>
                                <Badge variant="secondary">{stats.pending_tasks}</Badge>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {myTasks.slice(0, 4).map((task) => (
                                    <div key={task.id} className="flex items-start gap-3 p-3 rounded-lg border">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                            task.priority === 'high' ? 'bg-red-100 dark:bg-red-900' :
                                            task.priority === 'medium' ? 'bg-yellow-100 dark:bg-yellow-900' :
                                            'bg-green-100 dark:bg-green-900'
                                        }`}>
                                            <CheckCircle className={`h-4 w-4 ${
                                                task.priority === 'high' ? 'text-red-600 dark:text-red-400' :
                                                task.priority === 'medium' ? 'text-yellow-600 dark:text-yellow-400' :
                                                'text-green-600 dark:text-green-400'
                                            }`} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-sm truncate">{task.title}</p>
                                            <p className="text-xs text-muted-foreground">Due: {new Date(task.due_date).toLocaleDateString()}</p>
                                        </div>
                                        <Badge variant="outline" className={`text-xs ${
                                            task.priority === 'high' ? 'border-red-200 text-red-700' :
                                            task.priority === 'medium' ? 'border-yellow-200 text-yellow-700' :
                                            'border-green-200 text-green-700'
                                        }`}>
                                            {task.priority}
                                        </Badge>
                                    </div>
                                ))}
                                {myTasks.length === 0 && (
                                    <div className="text-center py-8 text-muted-foreground">
                                        <CheckCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                        <p className="text-sm">{t('No tasks assigned')}</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Upcoming Hearings */}
                    <Card className="lg:col-span-1">
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Gavel className="h-5 w-5" />
                                    {t('Upcoming Hearings')}
                                </div>
                                <Badge variant="secondary">{upcomingHearings.length}</Badge>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {upcomingHearings.slice(0, 4).map((hearing) => (
                                    <div key={hearing.id} className="flex items-start gap-3 p-3 rounded-lg border">
                                        <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                                            <CalendarDays className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-sm truncate">{hearing.title}</p>
                                            <p className="text-xs text-muted-foreground">{hearing.court?.name}</p>
                                            <p className="text-xs text-muted-foreground">{new Date(hearing.hearing_date).toLocaleDateString()} at {hearing.hearing_time}</p>
                                        </div>
                                    </div>
                                ))}
                                {upcomingHearings.length === 0 && (
                                    <div className="text-center py-8 text-muted-foreground">
                                        <Gavel className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                        <p className="text-sm">{t('No upcoming hearings')}</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* My Performance */}
                    <Card className="lg:col-span-1">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <BarChart3 className="h-5 w-5" />
                                {t('My Performance')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">{t('Task Completion')}</span>
                                    <span className="text-sm text-muted-foreground">{stats.task_completion_percentage}%</span>
                                </div>
                                <Progress value={stats.task_completion_percentage} className="h-2" />
                                
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">{t('Hours This Month')}</span>
                                    <span className="text-sm text-muted-foreground">{stats.total_hours_this_month}h</span>
                                </div>
                                <Progress value={(stats.total_hours_this_month / 160) * 100} className="h-2" />
                                
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">{t('Cases Handled')}</span>
                                    <span className="text-sm text-muted-foreground">{stats.total_cases}</span>
                                </div>
                                <Progress value={Math.min((stats.total_cases / 10) * 100, 100)} className="h-2" />
                                
                                <div className="pt-2 border-t">
                                    <div className="grid grid-cols-2 gap-4 text-center">
                                        <div>
                                            <p className="text-2xl font-bold text-green-600">{stats.total_cases}</p>
                                            <p className="text-xs text-muted-foreground">{t('Active Cases')}</p>
                                        </div>
                                        <div>
                                            <p className="text-2xl font-bold text-blue-600">{stats.pending_tasks}</p>
                                            <p className="text-xs text-muted-foreground">{t('Pending Tasks')}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Recent Activity & Quick Actions */}
                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Recent Time Entries */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Timer className="h-5 w-5" />
                                {t('Recent Time Entries')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {recentTimeEntries.slice(0, 5).map((entry) => (
                                    <div key={entry.id} className="flex items-center justify-between p-3 rounded-lg border">
                                        <div className="flex-1">
                                            <p className="font-medium text-sm">{entry.description}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {new Date(entry.entry_date).toLocaleDateString()}
                                                {entry.case && ` • ${entry.case.title}`}
                                            </p>
                                        </div>
                                        <Badge variant="outline" className="text-xs font-bold">
                                            {entry.hours}h
                                        </Badge>
                                    </div>
                                ))}
                                {recentTimeEntries.length === 0 && (
                                    <div className="text-center py-8 text-muted-foreground">
                                        <Timer className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                        <p className="text-sm">{t('No time entries')}</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Quick Actions */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Target className="h-5 w-5" />
                                {t('Quick Actions')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 gap-3">
                                <Link href={route('tasks.index')}>
                                    <Button variant="outline" className="w-full h-16 flex flex-col gap-1">
                                        <CheckCircle className="h-5 w-5" />
                                        <span className="text-xs">{t('View Tasks')}</span>
                                    </Button>
                                </Link>
                                <Link href={route('billing.time-entries.index')}>
                                    <Button variant="outline" className="w-full h-16 flex flex-col gap-1">
                                        <Timer className="h-5 w-5" />
                                        <span className="text-xs">{t('Log Time')}</span>
                                    </Button>
                                </Link>
                                <Link href={route('cases.index')}>
                                    <Button variant="outline" className="w-full h-16 flex flex-col gap-1">
                                        <Scale className="h-5 w-5" />
                                        <span className="text-xs">{t('My Cases')}</span>
                                    </Button>
                                </Link>
                                <Link href={route('hearings.index')}>
                                    <Button variant="outline" className="w-full h-16 flex flex-col gap-1">
                                        <Gavel className="h-5 w-5" />
                                        <span className="text-xs">{t('Hearings')}</span>
                                    </Button>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </PageTemplate>
    );
}