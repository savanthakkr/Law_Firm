import { CrudFormModal } from '@/components/CrudFormModal';
import { toast } from '@/components/custom-toast';
import { PageTemplate } from '@/components/page-template';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { router, usePage } from '@inertiajs/react';
import { format } from 'date-fns';
import { MessageSquare, MoreVertical, Plus, Search, Send, Trash2, User, Users, Mail, Phone, Calendar, Briefcase, Scale } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface User {
    id: number;
    name: string;
    email: string;
    type?: string;
}

interface Conversation {
    id: number;
    title: string | null;
    type: 'direct' | 'group' | 'case';
    participants: number[];
    case_id: number | null;
    last_message_at: string;
    latest_message: Array<{
        id: number;
        content: string;
        sender: User;
        created_at: string;
    }>;
    case?: {
        id: number;
        title: string;
    };
    receiver?: User;
    messages: any[]
}

interface Props {
    conversations: {
        data: Conversation[];
        links: any[];
        meta: any;
    };
    users: User[];
    filters: {
        search?: string;
        type?: string;
        per_page?: number;
    };
}

export default function MessagesIndex({ conversations, users, filters }: Props) {
    const { t } = useTranslation();
    const { auth } = usePage().props as any;
    const [search, setSearch] = useState(filters.search || '');
    const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
    const [newMessage, setNewMessage] = useState('');
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isUserDetailsOpen, setIsUserDetailsOpen] = useState(false);
    const [userDetails, setUserDetails] = useState<any>(null);
    const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
    const [conversationToDelete, setConversationToDelete] = useState<number | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const messagesContainerRef = useRef<HTMLDivElement>(null);

    const debouncedSearch = useMemo(() => {
        let timeoutId: NodeJS.Timeout;
        return (searchTerm: string) => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                router.get(route('communication.messages.index'), 
                    { search: searchTerm }, 
                    { preserveState: true, replace: true }
                );
            }, 300);
        };
    }, []);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearch(value);
        debouncedSearch(value);
    };

    console.log({selectedConversation})
    useEffect(() => {
        if (messagesContainerRef.current) {
            messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
        }
    }, [selectedConversation?.messages]);

    useEffect(() => {
        if (conversations.data.length > 0 && !selectedConversation) {
            setSelectedConversation(conversations.data[0]);
        }
    }, [conversations.data]);

    const handleSendMessage = () => {
        if (!newMessage.trim() || !selectedConversation) return;

        const tempMessage = {
            id: Date.now(), // Temporary ID
            content: newMessage,
            sender: auth.user,
            created_at: window.appSettings?.formatDateTime(new Date(), false) || new Date().toISOString(),
        };

        // Add message to UI immediately at the bottom (end of array)
        setSelectedConversation((prev) => {
            if (!prev) return prev;
            return {
                ...prev,
                messages: [tempMessage, ...(prev.messages || [])],
            };
        });

        const messageContent = newMessage;
        setNewMessage('');

        router.post(
            route('communication.messages.store'),
            {
                conversation_id: selectedConversation.id,
                content: messageContent,
            },
            {
                onSuccess: () => {
                    router.reload({ only: ['conversations'] });
                },
                onError: (errors) => {
                    toast.error(`Failed to send message: ${Object.values(errors).join(', ')}`);
                    // Remove the temporary message on error
                    setSelectedConversation((prev) => {
                        if (!prev) return prev;
                        return {
                            ...prev,
                            messages: prev.messages?.filter((msg) => msg.id !== tempMessage.id) || [],
                        };
                    });
                    setNewMessage(messageContent); // Restore message text
                },
            },
        );
    };

    const getConversationTitle = (conversation: Conversation) => {
        if (conversation.receiver) {
            return conversation.receiver.name;
        }
        if (conversation.type === 'case' && conversation.case) {
            return conversation.case.title;
        }
        if (conversation.title) return conversation.title;
        return 'Unknown';
    };

    const getConversationIcon = (conversation: Conversation) => {
        switch (conversation.type) {
            case 'group':
                return <Users className="h-4 w-4" />;
            case 'case':
                return <MessageSquare className="h-4 w-4" />;
            default:
                return <User className="h-4 w-4" />;
        }
    };

    const handleFormSubmit = (formData: any) => {
        toast.loading(t('Creating conversation...'));

        router.post(route('communication.messages.store'), formData, {
            onSuccess: (page) => {
                setIsFormModalOpen(false);
                toast.dismiss();
                if (page.props.flash.success) {
                    toast.success(page.props.flash.success);
                }
                // Reload the page to show new conversation
                router.reload();
            },
            onError: (errors) => {
                toast.dismiss();
                toast.error(`Failed to create conversation: ${Object.values(errors).join(', ')}`);
            },
        });
    };

    const handleDeleteConversation = (conversationId: number) => {
        setConversationToDelete(conversationId);
        setIsDeleteAlertOpen(true);
    };

    const confirmDeleteConversation = () => {
        if (!conversationToDelete) return;

        toast.loading(t('Deleting conversation...'));

        router.delete(route('communication.messages.destroy', conversationToDelete), {
            onSuccess: () => {
                toast.dismiss();
                toast.success(t('Conversation deleted successfully'));
                setSelectedConversation(null);
                setIsDeleteAlertOpen(false);
                setConversationToDelete(null);
                router.reload();
            },
            onError: (errors) => {
                toast.dismiss();
                toast.error(`Failed to delete conversation: ${Object.values(errors).join(', ')}`);
            },
        });
    };

    const userOptions = useMemo(
        () =>
            users.map((user) => ({
                value: user.id.toString(),
                label: user.name,
            })),
        [users],
    );

    const handleNewMessage = useCallback(() => {
        setIsFormModalOpen(true);
    }, []);

    const getUserTypeIcon = useCallback((userType?: string) => {
        switch (userType) {
            case 'company':
                return <Briefcase className="h-3 w-3" />;
            case 'team_member':
                return <Users className="h-3 w-3" />;
            case 'client':
                return <User className="h-3 w-3" />;
            default:
                return <User className="h-3 w-3" />;
        }
    }, []);

    const handleUserClick = useCallback((userId: number) => {
        fetch(route('communication.messages.getUserDetails', userId))
            .then(response => response.json())
            .then(data => {
                setUserDetails(data.user);
                setIsUserDetailsOpen(true);
            })
            .catch(() => {
                toast.error(t('Failed to load user details'));
            });
    }, [t]);

    const pageActions = useMemo(
        () => [
            {
                label: t('New Conversation'),
                icon: <Plus className="mr-2 h-4 w-4" />,
                variant: 'default',
                onClick: handleNewMessage,
            },
        ],
        [t, handleNewMessage],
    );

    const breadcrumbs = [
        { title: t('Dashboard'), href: route('dashboard') },
        { title: t('Communication'), href: route('communication.messages.index') },
        { title: t('Messages') },
    ];

    return (
        <PageTemplate title={t('Messages')} url="/communication/messages" actions={pageActions} breadcrumbs={breadcrumbs} noPadding>
            <div className="flex h-[calc(100vh-200px)] overflow-hidden rounded-lg bg-gray-50 dark:bg-gray-900">
                {/* Sidebar - Conversations List */}
                <div className="flex w-80 flex-col border-r border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
                    {/* Header */}
                    <div className="border-b border-gray-200 p-4 dark:border-gray-700">
                        <div className="relative">
                            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                            <Input
                                placeholder={t('Search conversations...')}
                                value={search}
                                onChange={handleSearchChange}
                                className="pl-10"
                            />
                            
                        </div>
                    </div>

                    {/* Conversations */}
                    <div className="flex-1 overflow-y-auto">
                        {conversations.data.length === 0 ? (
                            <div className="flex h-full flex-col items-center justify-center text-gray-500 dark:text-gray-400">
                                <MessageSquare className="mb-4 h-12 w-12 opacity-50" />
                                <p>{t('No conversations found')}</p>
                            </div>
                        ) : (
                            conversations.data.map((conversation) => (
                                <div
                                    key={conversation.id}
                                    onClick={() => setSelectedConversation(conversation)}
                                    className={`flex cursor-pointer items-center p-4 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700 ${
                                        selectedConversation?.id === conversation.id
                                            ? 'border-r-2 border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                            : ''
                                    }`}
                                >
                                    <Avatar className="mr-3 h-10 w-10">
                                        <AvatarFallback>
                                            {conversation.receiver ? conversation.receiver.name.charAt(0).toUpperCase() : getConversationIcon(conversation)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2 min-w-0 flex-1">
                                                <h3 className="truncate text-sm font-medium text-gray-900 dark:text-white">
                                                    {getConversationTitle(conversation)}
                                                </h3>
                                                {conversation.receiver && (
                                                    <Badge variant="outline" className="text-xs px-1 py-0 h-4">
                                                        {getUserTypeIcon(conversation.receiver.type)}
                                                    </Badge>
                                                )}
                                            </div>
                                            <span className="text-xs text-gray-500">{window.appSettings?.formatTime(conversation.last_message_at) || format(new Date(conversation.last_message_at), 'HH:mm')}</span>
                                        </div>
                                        {conversation.latest_message?.[0] && (
                                            <p className="mt-1 truncate text-sm text-gray-600 dark:text-gray-400">
                                                {conversation.latest_message[0].content}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Main Chat Area */}
                <div className="flex flex-1 flex-col">
                    {selectedConversation ? (
                        <>
                            {/* Chat Header */}
                            <div className="border-b border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <Avatar className="mr-3 h-8 w-8">
                                            <AvatarFallback>
                                                {selectedConversation.receiver ? selectedConversation.receiver.name.charAt(0).toUpperCase() : getConversationIcon(selectedConversation)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h2 
                                                    className="text-lg font-medium text-gray-900 dark:text-white cursor-pointer hover:text-blue-600 dark:hover:text-blue-400"
                                                    onClick={() => selectedConversation.receiver && handleUserClick(selectedConversation.receiver.id)}
                                                >
                                                    {getConversationTitle(selectedConversation)}
                                                </h2>
                                                {selectedConversation.receiver && (
                                                    <Badge variant="outline" className="text-xs p-1">
                                                        {getUserTypeIcon(selectedConversation.receiver.type)}
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="sm">
                                                <MoreVertical className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent>
                                            <DropdownMenuItem
                                                onClick={() => handleDeleteConversation(selectedConversation.id)}
                                                className="text-red-600 hover:text-red-700"
                                            >
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                {t('Delete Conversation')}
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </div>

                            {/* Messages Area */}
                            <div ref={messagesContainerRef} className="flex-1 space-y-4 overflow-y-auto bg-gray-50 p-4 dark:bg-gray-900" style={{ scrollBehavior: 'smooth' }}>
                                {selectedConversation.messages && selectedConversation.messages.length > 0 ? (
                                    selectedConversation.messages
                                        .slice()
                                        .reverse()
                                        .map((message) => {
                                            const isCurrentUser = message.sender.id === auth.user.id;
                                            return (
                                                <div
                                                    key={message.id}
                                                    className={`flex items-start space-x-3 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                                                >
                                                    {!isCurrentUser && (
                                                        <Avatar className="h-8 w-8">
                                                            <AvatarFallback>{message.sender.name.charAt(0).toUpperCase()}</AvatarFallback>
                                                        </Avatar>
                                                    )}
                                                    <div className={`max-w-xs lg:max-w-md ${isCurrentUser ? 'order-1' : 'order-2'}`}>
                                                        <div
                                                            className={`rounded-lg p-3 shadow-sm ${
                                                                isCurrentUser
                                                                    ? 'bg-blue-500 text-white'
                                                                    : 'bg-white text-gray-900 dark:bg-gray-800 dark:text-white'
                                                            }`}
                                                        >
                                                            <p className="text-sm">{message.content}</p>
                                                            <p className={`mt-1 text-xs ${isCurrentUser ? 'text-blue-100' : 'text-gray-500'}`}>
                                                                {window.appSettings?.formatTime(message.created_at) || format(new Date(message.created_at), 'HH:mm')}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    {isCurrentUser && (
                                                        <Avatar className="order-2 h-8 w-8">
                                                            <AvatarFallback>{message.sender.name.charAt(0).toUpperCase()}</AvatarFallback>
                                                        </Avatar>
                                                    )}
                                                </div>
                                            );
                                        })
                                ) : (
                                    <div className="flex h-full items-center justify-center text-gray-500 dark:text-gray-400">
                                        <p>{t('No messages yet')}</p>
                                    </div>
                                )}
                            </div>

                            {/* Message Input */}
                            <div className="border-t border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
                                <div className="flex items-center space-x-2">
                                    <Input
                                        placeholder={t('Type a message...')}
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                        className="flex-1"
                                    />
                                    <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
                                        <Send className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-1 items-center justify-center bg-gray-50 dark:bg-gray-900">
                            <div className="text-center text-gray-500 dark:text-gray-400">
                                <MessageSquare className="mx-auto mb-4 h-16 w-16 opacity-50" />
                                <p className="text-lg">{t('Select a conversation to start messaging')}</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <CrudFormModal
                isOpen={isFormModalOpen}
                onClose={() => setIsFormModalOpen(false)}
                onSubmit={handleFormSubmit}
                formConfig={{
                    fields: [
                        {
                            name: 'recipient_id',
                            label: t('Select User'),
                            type: 'combobox',
                            required: true,
                            options: userOptions,
                            placeholder: t('Search users...'),
                        },
                        {
                            name: 'content',
                            label: t('Message'),
                            type: 'textarea',
                            required: true,
                            placeholder: t('Type your message...'),
                        },
                    ],
                }}
                initialData={''}
                title={t('New Conversation')}
                mode="create"
            />

            {/* User Details Dialog */}
            <Dialog open={isUserDetailsOpen} onOpenChange={setIsUserDetailsOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <User className="h-5 w-5" />
                            {t('User Details')}
                        </DialogTitle>
                    </DialogHeader>
                    {userDetails && (
                        <div className="space-y-6">
                            {/* Basic Info */}
                            <div className="flex items-center gap-4">
                                <Avatar className="h-16 w-16">
                                    <AvatarFallback className="text-lg">
                                        {userDetails.name.charAt(0).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <h3 className="text-xl font-semibold">{userDetails.name}</h3>
                                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                        <Mail className="h-4 w-4" />
                                        {userDetails.email}
                                    </div>
                                    <Badge variant="outline" className="mt-1">
                                        {userDetails.type}
                                    </Badge>
                                </div>
                            </div>

                            {/* Client Details */}
                            {userDetails.client && (
                                <div className="border-t pt-4">
                                    <h4 className="font-medium mb-3 flex items-center gap-2">
                                        <User className="h-4 w-4" />
                                        {t('Client Information')}
                                    </h4>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <span className="font-medium">{t('Client ID')}:</span>
                                            <p>{userDetails.client.client_id}</p>
                                        </div>
                                        {userDetails.client.phone && (
                                            <div>
                                                <span className="font-medium flex items-center gap-1">
                                                    <Phone className="h-3 w-3" />
                                                    {t('Phone')}:
                                                </span>
                                                <p>{userDetails.client.phone}</p>
                                            </div>
                                        )}
                                        {userDetails.client.company_name && (
                                            <div>
                                                <span className="font-medium flex items-center gap-1">
                                                    <Briefcase className="h-3 w-3" />
                                                    {t('Company')}:
                                                </span>
                                                <p>{userDetails.client.company_name}</p>
                                            </div>
                                        )}
                                        <div>
                                            <span className="font-medium">{t('Status')}:</span>
                                            <Badge variant={userDetails.client.status === 'active' ? 'default' : 'secondary'}>
                                                {userDetails.client.status}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Cases */}
                            {userDetails.cases && userDetails.cases.length > 0 && (
                                <div className="border-t pt-4">
                                    <h4 className="font-medium mb-3 flex items-center gap-2">
                                        <Scale className="h-4 w-4" />
                                        {t('Cases')} ({userDetails.cases.length})
                                    </h4>
                                    <div className="space-y-2 max-h-40 overflow-y-auto">
                                        {userDetails.cases.map((case_: any) => (
                                            <div key={case_.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                                                <div>
                                                    <p className="font-medium text-sm">{case_.title}</p>
                                                    <p className="text-xs text-gray-600 dark:text-gray-400">ID: {case_.case_id}</p>
                                                </div>
                                                <Badge variant="outline" className="text-xs">
                                                    {case_.case_status?.name || case_.status}
                                                </Badge>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Created Date */}
                            <div className="border-t pt-4 text-sm text-gray-600 dark:text-gray-400">
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4" />
                                    {t('Member since')}: {window.appSettings?.formatDate(userDetails.created_at) || format(new Date(userDetails.created_at), 'MMM dd, yyyy')}
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            <ConfirmDialog
                open={isDeleteAlertOpen}
                onOpenChange={setIsDeleteAlertOpen}
                title={t('Delete Conversation')}
                description={t('Are you sure you want to delete this conversation? This action cannot be undone and all messages will be permanently removed.')}
                onConfirm={confirmDeleteConversation}
                confirmText={t('Delete')}
            />
        </PageTemplate>
    );
}
