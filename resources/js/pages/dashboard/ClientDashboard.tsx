import React from 'react';
import { Head } from '@inertiajs/react';
import { PageTemplate } from '@/components/page-template';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CalendarDays, FileText, Scale, Gavel, MessageSquare, User, Clock, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from '@inertiajs/react';

interface Case {
    id: number;
    case_id: string;
    title: string;
    case_status?: { name: string; is_closed: boolean };
    case_type?: { name: string };
}

interface Hearing {
    id: number;
    title: string;
    hearing_date: string;
    hearing_time: string;
    case?: { title: string };
    court?: { name: string };
}

interface Document {
    id: number;
    title: string;
    created_at: string;
}

interface Stats {
    total_cases: number;
    active_cases: number;
    upcoming_hearings: number;
    total_documents: number;
    total_messages: number;
    unread_messages: number;
}

interface Client {
    id: number;
    name: string;
    email: string;
    phone?: string;
    client_id: string;
}

interface Props {
    client: Client;
    myCases: Case[];
    upcomingHearings: Hearing[];
    recentDocuments: Document[];
    stats: Stats;
    userType: string;
    dashboardData: { stats: Stats };
}

export default function ClientDashboard({ client, myCases, upcomingHearings, recentDocuments, stats }: Props) {
    const { t } = useTranslation();

    return (
        <PageTemplate 
            title={t('Client Dashboard')}
            url="/dashboard"
        >
            <Head title="Client Dashboard" />
            
            <div className="space-y-6">
                {/* Welcome Section */}
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                                <User className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold">Welcome, {client.name}</h2>
                                <p className="text-muted-foreground">Client ID: {client.client_id}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Key Metrics */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">{t('My Cases')}</p>
                                    <h3 className="mt-2 text-2xl font-bold">{stats.total_cases}</h3>
                                    <p className="text-xs text-green-600 mt-1">{stats.active_cases} {t('active')}</p>
                                </div>
                                <div className="rounded-full bg-blue-100 p-3 dark:bg-blue-900">
                                    <Scale className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">{t('Upcoming Hearings')}</p>
                                    <h3 className="mt-2 text-2xl font-bold">{stats.upcoming_hearings}</h3>
                                    <p className="text-xs text-muted-foreground mt-1">{t('scheduled')}</p>
                                </div>
                                <div className="rounded-full bg-purple-100 p-3 dark:bg-purple-900">
                                    <Gavel className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">{t('Documents')}</p>
                                    <h3 className="mt-2 text-2xl font-bold">{stats.total_documents}</h3>
                                    <p className="text-xs text-muted-foreground mt-1">{t('available')}</p>
                                </div>
                                <div className="rounded-full bg-green-100 p-3 dark:bg-green-900">
                                    <FileText className="h-5 w-5 text-green-600 dark:text-green-400" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">{t('Messages')}</p>
                                    <h3 className="mt-2 text-2xl font-bold">{stats.total_messages}</h3>
                                    <p className="text-xs text-orange-600 mt-1">{stats.unread_messages} {t('unread')}</p>
                                </div>
                                <div className="rounded-full bg-orange-100 p-3 dark:bg-orange-900">
                                    <MessageSquare className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Dashboard Content */}
                <div className="grid gap-6 lg:grid-cols-2">
                    {/* My Cases */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Scale className="h-5 w-5" />
                                    {t('My Cases')}
                                </div>
                                <Badge variant="secondary">{myCases.length}</Badge>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {myCases.slice(0, 5).map((case_) => (
                                    <div key={case_.id} className="flex items-start gap-3 p-3 rounded-lg border">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                            case_.case_status?.is_closed ? 'bg-gray-100 dark:bg-gray-900' : 'bg-blue-100 dark:bg-blue-900'
                                        }`}>
                                            <Scale className={`h-4 w-4 ${
                                                case_.case_status?.is_closed ? 'text-gray-600 dark:text-gray-400' : 'text-blue-600 dark:text-blue-400'
                                            }`} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-sm truncate">{case_.title}</p>
                                            <p className="text-xs text-muted-foreground">Case ID: {case_.case_id}</p>
                                            <p className="text-xs text-muted-foreground">{case_.case_type?.name}</p>
                                        </div>
                                        <Badge variant={case_.case_status?.is_closed ? "secondary" : "default"} className="text-xs">
                                            {case_.case_status?.name || 'Active'}
                                        </Badge>
                                    </div>
                                ))}
                                {myCases.length === 0 && (
                                    <div className="text-center py-8 text-muted-foreground">
                                        <Scale className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                        <p className="text-sm">{t('No cases found')}</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Upcoming Hearings */}
                    <Card>
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
                                {upcomingHearings.slice(0, 5).map((hearing) => (
                                    <div key={hearing.id} className="flex items-start gap-3 p-3 rounded-lg border">
                                        <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                                            <CalendarDays className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-sm truncate">{hearing.title}</p>
                                            <p className="text-xs text-muted-foreground">{hearing.court?.name}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {new Date(hearing.hearing_date).toLocaleDateString()} at {hearing.hearing_time}
                                            </p>
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
                </div>

                {/* Recent Documents & Quick Actions */}
                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Recent Documents */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="h-5 w-5" />
                                {t('Recent Documents')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {recentDocuments.slice(0, 5).map((document) => (
                                    <div key={document.id} className="flex items-center justify-between p-3 rounded-lg border">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                                                <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-sm">{document.title}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {new Date(document.created_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {recentDocuments.length === 0 && (
                                    <div className="text-center py-8 text-muted-foreground">
                                        <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                        <p className="text-sm">{t('No documents available')}</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Quick Actions */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <AlertCircle className="h-5 w-5" />
                                {t('Quick Actions')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 gap-3">
                                <Link href={route('cases.index')}>
                                    <Button variant="outline" className="w-full h-16 flex flex-col gap-1">
                                        <Scale className="h-5 w-5" />
                                        <span className="text-xs">{t('View Cases')}</span>
                                    </Button>
                                </Link>
                                <Link href={route('hearings.index')}>
                                    <Button variant="outline" className="w-full h-16 flex flex-col gap-1">
                                        <Gavel className="h-5 w-5" />
                                        <span className="text-xs">{t('Hearings')}</span>
                                    </Button>
                                </Link>
                                <Link href={route('clients.documents.index')}>
                                    <Button variant="outline" className="w-full h-16 flex flex-col gap-1">
                                        <FileText className="h-5 w-5" />
                                        <span className="text-xs">{t('Documents')}</span>
                                    </Button>
                                </Link>
                                <Link href={route('communication.messages.index')}>
                                    <Button variant="outline" className="w-full h-16 flex flex-col gap-1">
                                        <MessageSquare className="h-5 w-5" />
                                        <span className="text-xs">{t('Messages')}</span>
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