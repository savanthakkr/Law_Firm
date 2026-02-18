import { useState, useEffect, useRef } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Send, ArrowLeft, Users, User, MessageSquare } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { formatDistanceToNow } from 'date-fns';
import { PageTemplate } from '@/components/page-template';
import { Link } from '@inertiajs/react';

interface User {
    id: number;
    name: string;
    email: string;
}

interface Message {
    id: number;
    content: string;
    sender: User;
    created_at: string;
    is_read: boolean;
}

interface Conversation {
    id: number;
    title: string | null;
    type: 'direct' | 'group' | 'case';
    participants: number[];
    case_id: number | null;
    case?: {
        id: number;
        title: string;
    };
}

interface Props {
    conversation: Conversation;
    messages: {
        data: Message[];
        links: any[];
        meta: any;
    };
    filters: {
        per_page?: number;
    };
}

export default function MessagesShow({ conversation, messages, filters }: Props) {
    const { t } = useTranslation();
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [messagesList, setMessagesList] = useState(messages.data);

    const { data, setData, post, processing, reset } = useForm({
        content: '',
        conversation_id: conversation.id,
    });

    // Auto-scroll to bottom
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messagesList]);

    // Polling for new messages
    useEffect(() => {
        const fetchNewMessages = async () => {
            try {
                const response = await fetch(route('communication.messages.show', conversation.id));
                // This would need to be an API endpoint that returns JSON
                // For now, we'll just refresh the page data periodically
            } catch (error) {
                console.error('Failed to fetch new messages:', error);
            }
        };

        const interval = setInterval(fetchNewMessages, 30000); // Poll every 30 seconds
        return () => clearInterval(interval);
    }, [conversation.id]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!data.content.trim()) return;

        post(route('communication.messages.store'), {
            onSuccess: () => {
                reset('content');
                // Refresh messages
                router.reload({ only: ['messages'] });
            },
        });
    };

    const getConversationTitle = () => {
        if (conversation.title) return conversation.title;
        if (conversation.type === 'case' && conversation.case) {
            return `Case: ${conversation.case.title}`;
        }
        return 'Direct Message';
    };

    const getConversationIcon = () => {
        switch (conversation.type) {
            case 'group':
                return <Users className="h-5 w-5" />;
            case 'case':
                return <MessageSquare className="h-5 w-5" />;
            default:
                return <User className="h-5 w-5" />;
        }
    };

    const getInitials = (name: string) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase();
    };

    return (
        <PageTemplate
            title={`${t('Messages')} - ${getConversationTitle()}`}
            url={`/communication/messages/${conversation.id}`}
            breadcrumbs={[
                { title: t('Dashboard'), href: route('dashboard') },
                { title: t('Communication'), href: route('communication.messages.index') },
                { title: t('Messages'), href: route('communication.messages.index') },
                { title: getConversationTitle() }
            ]}
        >
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Link href={route('communication.messages.index')}>
                            <Button variant="outline" size="sm">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                {t('Back')}
                            </Button>
                        </Link>
                        <div className="flex items-center space-x-3">
                            {getConversationIcon()}
                            <div>
                                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                                    {getConversationTitle()}
                                </h1>
                                <div className="flex items-center space-x-2">
                                    <Badge variant="outline" className="text-xs">
                                        {t(conversation.type)}
                                    </Badge>
                                    <span className="text-sm text-gray-500">
                                        {conversation.participants.length} {t('participants')}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Messages */}
                <Card className="h-[600px] flex flex-col">
                    <CardHeader>
                        <CardTitle className="text-lg">{t('Conversation')}</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col">
                        {/* Messages List */}
                        <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                            {messagesList.length === 0 ? (
                                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                    <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                    <p>{t('No messages yet')}</p>
                                    <p className="text-sm">{t('Start the conversation!')}</p>
                                </div>
                            ) : (
                                messagesList.map((message) => (
                                    <div key={message.id} className="flex items-start space-x-3">
                                        <Avatar className="h-8 w-8">
                                            <AvatarFallback className="text-xs">
                                                {getInitials(message.sender.name)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-2 mb-1">
                                                <span className="text-sm font-medium text-gray-900 dark:text-white">
                                                    {message.sender.name}
                                                </span>
                                                <span className="text-xs text-gray-500">
                                                    {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                                                </span>
                                                {!message.is_read && (
                                                    <Badge variant="secondary" className="text-xs">
                                                        {t('New')}
                                                    </Badge>
                                                )}
                                            </div>
                                            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3">
                                                <p className="text-sm text-gray-900 dark:text-white whitespace-pre-wrap">
                                                    {message.content}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Message Input */}
                        <form onSubmit={handleSubmit} className="flex space-x-2">
                            <Textarea
                                placeholder={t('Type your message...')}
                                value={data.content}
                                onChange={(e) => setData('content', e.target.value)}
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSubmit(e);
                                    }
                                }}
                                className="flex-1 min-h-[60px] max-h-[120px]"
                                disabled={processing}
                            />
                            <Button type="submit" disabled={processing || !data.content.trim()}>
                                <Send className="h-4 w-4" />
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </PageTemplate>
    );
}