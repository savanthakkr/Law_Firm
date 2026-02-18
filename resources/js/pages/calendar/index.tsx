import { useState } from 'react';
import { PageTemplate } from '@/components/page-template';
import { usePage, router } from '@inertiajs/react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, MapPin, User, FileText } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export default function Calendar() {
  const { t } = useTranslation();
  const { auth, events, upcomingEvents, currentDate, viewType, dateRange } = usePage().props as any;
  
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);

  const currentDateObj = new Date(currentDate);
  const startDate = new Date(dateRange.start);
  const endDate = new Date(dateRange.end);

  const navigateDate = (direction: 'prev' | 'next' | 'today') => {
    let newDate = new Date(currentDate);
    
    if (direction === 'today') {
      newDate = new Date();
    } else if (direction === 'prev') {
      if (viewType === 'month') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else if (viewType === 'week') {
        newDate.setDate(newDate.getDate() - 7);
      } else {
        newDate.setDate(newDate.getDate() - 1);
      }
    } else {
      if (viewType === 'month') {
        newDate.setMonth(newDate.getMonth() + 1);
      } else if (viewType === 'week') {
        newDate.setDate(newDate.getDate() + 7);
      } else {
        newDate.setDate(newDate.getDate() + 1);
      }
    }

    router.get(route('calendar.index'), {
      date: newDate.toISOString().split('T')[0],
      view: viewType
    }, { preserveState: true });
  };

  const changeView = (newView: string) => {
    router.get(route('calendar.index'), {
      date: currentDate,
      view: newView
    }, { preserveState: true });
  };

  const generateCalendarDays = () => {
    const days = [];
    const current = new Date(startDate);
    
    while (current <= endDate) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    
    return days;
  };

  const getEventsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return events.filter((event: any) => {
      const eventDateStr = event.date.split('T')[0];
      return eventDateStr === dateStr;
    });
  };

  const handleEventClick = (event: any) => {
    setSelectedEvent(event);
    setIsEventModalOpen(true);
  };

  const formatTime = (time: string) => {
    if (!time) return '';
    try {
      // If time contains 'T', it's a datetime string - extract time part
      if (time.includes('T')) {
        return window.appSettings?.formatTime(time) || time;
      }
      // Handle HH:mm and HH:mm:ss formats
      const timeParts = time.split(':');
      const formattedTime = `${timeParts[0]}:${timeParts[1]}`;
      return window.appSettings?.formatTime(`2000-01-01T${formattedTime}`) || formattedTime;
    } catch (e) {
      return time;
    }
  };

  const getEventTypeIcon = (type: string) => {
    return type === 'hearing' ? <CalendarIcon className="h-3 w-3" /> : <FileText className="h-3 w-3" />;
  };

  const renderMonthView = () => {
    const days = generateCalendarDays();
    const weeks = [];
    
    for (let i = 0; i < days.length; i += 7) {
      weeks.push(days.slice(i, i + 7));
    }

    return (
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow overflow-hidden">
        <div className="grid grid-cols-7 gap-0 border-b">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="p-3 text-center font-medium text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800">
              {t(day)}
            </div>
          ))}
        </div>
        
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="grid grid-cols-7 gap-0">
            {week.map((day, dayIndex) => {
              const dayEvents = getEventsForDate(day);
              const isCurrentMonth = day.getMonth() === currentDateObj.getMonth();
              const isToday = day.toDateString() === new Date().toDateString();
              
              return (
                <div 
                  key={dayIndex} 
                  className={`min-h-[120px] p-2 border-r border-b border-gray-200 dark:border-gray-700 ${
                    !isCurrentMonth ? 'bg-gray-50 dark:bg-gray-800' : 'bg-white dark:bg-gray-900'
                  }`}
                >
                  <div className={`text-sm font-medium mb-1 ${
                    isToday 
                      ? 'bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center' 
                      : isCurrentMonth 
                        ? 'text-gray-900 dark:text-gray-100' 
                        : 'text-gray-400 dark:text-gray-600'
                  }`}>
                    {day.getDate()}
                  </div>
                  
                  <div className="space-y-1">
                    {dayEvents.slice(0, 3).map((event: any) => (
                      <div
                        key={event.id}
                        onClick={() => handleEventClick(event)}
                        className="text-xs p-1 rounded cursor-pointer hover:opacity-80 truncate"
                        style={{ backgroundColor: `${event.color}20`, color: event.color }}
                      >
                        <div className="flex items-center gap-1">
                          {getEventTypeIcon(event.type)}
                          <span className="truncate">{event.title}</span>
                        </div>
                        <div className="text-xs opacity-75 truncate">
                          {event.case_title}
                        </div>
                      </div>
                    ))}
                    {dayEvents.length > 3 && (
                      <div 
                        className="text-xs text-gray-500 dark:text-gray-400 cursor-pointer hover:underline"
                        onClick={() => {
                          const allEvents = dayEvents.map(e => `${e.title} (${e.case_title})`).join('\n');
                          alert(`All events on ${day.toDateString()}:\n\n${allEvents}`);
                        }}
                      >
                        +{dayEvents.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    );
  };

  const renderWeekView = () => {
    const days = generateCalendarDays().slice(0, 7);
    const hours = Array.from({ length: 24 }, (_, i) => i);

    return (
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow overflow-hidden">
        <div className="grid grid-cols-8 gap-0 border-b">
          <div className="p-3 text-center font-medium text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800">
            {t('Time')}
          </div>
          {days.map((day, index) => {
            const isToday = day.toDateString() === new Date().toDateString();
            return (
              <div key={index} className={`p-3 text-center font-medium bg-gray-50 dark:bg-gray-800 ${
                isToday ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'
              }`}>
                <div className="text-xs">{day.toLocaleDateString(undefined, { weekday: 'short' })}</div>
                <div className={`text-lg ${isToday ? 'bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center mx-auto' : ''}`}>
                  {day.getDate()}
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="max-h-[600px] overflow-y-auto">
          {hours.map((hour) => (
            <div key={hour} className="grid grid-cols-8 gap-0 border-b border-gray-100 dark:border-gray-700">
              <div className="p-2 text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 border-r">
                {hour.toString().padStart(2, '0')}:00
              </div>
              {days.map((day, dayIndex) => {
                const dayEvents = getEventsForDate(day).filter(event => {
                  if (!event.time) return hour === 0;
                  try {
                    let timeStr = event.time;
                    if (timeStr.includes('T')) {
                      timeStr = timeStr.split('T')[1].split('.')[0];
                    }
                    const eventHour = parseInt(timeStr.split(':')[0]);
                    return eventHour === hour;
                  } catch (e) {
                    return hour === 0;
                  }
                });
                
                return (
                  <div key={dayIndex} className="min-h-[60px] p-1 border-r border-gray-100 dark:border-gray-700 relative">
                    {dayEvents.map((event: any) => (
                      <div
                        key={event.id}
                        onClick={() => handleEventClick(event)}
                        className="text-xs p-1 rounded cursor-pointer hover:opacity-80 mb-1"
                        style={{ backgroundColor: `${event.color}20`, color: event.color }}
                      >
                        <div className="flex items-center gap-1">
                          {getEventTypeIcon(event.type)}
                          <span className="truncate font-medium">{event.title}</span>
                        </div>
                        <div className="text-xs opacity-75 truncate">{event.case_title}</div>
                        <div className="text-xs opacity-75">{formatTime(event.time)}</div>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderDayView = () => {
    const day = new Date(currentDate);
    const dayEvents = getEventsForDate(day);
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const isToday = day.toDateString() === new Date().toDateString();

    return (
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow overflow-hidden">
        <div className="p-4 border-b bg-gray-50 dark:bg-gray-800">
          <div className="text-center">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {day.toLocaleDateString(undefined, { weekday: 'long' })}
            </div>
            <div className={`text-2xl font-semibold ${
              isToday ? 'text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-gray-100'
            }`}>
              {day.getDate()}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {day.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
            </div>
          </div>
        </div>
        
        <div className="max-h-[600px] overflow-y-auto">
          {hours.map((hour) => {
            const hourEvents = dayEvents.filter(event => {
              if (!event.time) return hour === 0;
              try {
                let timeStr = event.time;
                if (timeStr.includes('T')) {
                  timeStr = timeStr.split('T')[1].split('.')[0];
                }
                const eventHour = parseInt(timeStr.split(':')[0]);
                return eventHour === hour;
              } catch (e) {
                return hour === 0;
              }
            });
            
            return (
              <div key={hour} className="flex border-b border-gray-100 dark:border-gray-700">
                <div className="w-20 p-3 text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 border-r">
                  {hour.toString().padStart(2, '0')}:00
                </div>
                <div className="flex-1 min-h-[80px] p-2">
                  {hourEvents.map((event: any) => (
                    <div
                      key={event.id}
                      onClick={() => handleEventClick(event)}
                      className="p-3 mb-2 rounded-lg cursor-pointer hover:opacity-80 border-l-4"
                      style={{ 
                        backgroundColor: `${event.color}10`, 
                        borderLeftColor: event.color 
                      }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {getEventTypeIcon(event.type)}
                          <span className="font-medium" style={{ color: event.color }}>
                            {event.title}
                          </span>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {event.type === 'hearing' ? t('Hearing') : t('Timeline')}
                        </Badge>
                      </div>
                      <div className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-1">
                        Case: {event.case_title}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                        {formatTime(event.time)}
                        {event.duration && ` (${event.duration}min)`}
                      </div>
                      {event.court_name && (
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {event.court_name}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };
console.log({upcomingEvents})
  const renderUpcomingEvents = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          {t('Upcoming Events')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {upcomingEvents.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-sm">{t('No upcoming events')}</p>
        ) : (
          <div className="space-y-3">
            {upcomingEvents.map((event: any) => (
              <div 
                key={event.id}
                onClick={() => handleEventClick(event)}
                className="flex items-start gap-3 p-3 rounded-lg border hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
              >
                <div 
                  className="w-3 h-3 rounded-full mt-1 flex-shrink-0"
                  style={{ backgroundColor: event.color }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {getEventTypeIcon(event.type)}
                    <span className="font-medium text-sm truncate">{event.title}</span>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {window.appSettings?.formatDate(event.date) || new Date(event.date).toLocaleDateString()} • {formatTime(event.time)}
                  </div>
                  {event.case_title && (
                    <div className="text-xs text-gray-600 dark:text-gray-300 truncate">
                      {event.case_title}
                    </div>
                  )}
                </div>
                <Badge variant="outline" className="text-xs">
                  {event.type === 'hearing' ? t('Hearing') : t('Timeline')}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );

  const renderEventModal = () => (
    <Dialog open={isEventModalOpen} onOpenChange={setIsEventModalOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {selectedEvent && getEventTypeIcon(selectedEvent.type)}
            {selectedEvent?.title}
          </DialogTitle>
        </DialogHeader>
        
        {selectedEvent && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm">
              <CalendarIcon className="h-4 w-4 text-gray-500" />
              <span>{window.appSettings?.formatDate(selectedEvent.date) || new Date(selectedEvent.date).toLocaleDateString()}</span>
              <Clock className="h-4 w-4 text-gray-500 ml-2" />
              <span>{formatTime(selectedEvent.time)}</span>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <FileText className="h-4 w-4 text-gray-500" />
              <span className="font-medium">Case: {selectedEvent.case_title}</span>
            </div>

            {selectedEvent.court_name && (
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-gray-500" />
                <span>{selectedEvent.court_name}</span>
              </div>
            )}

            {selectedEvent.judge_name && (
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-gray-500" />
                <span>{selectedEvent.judge_name}</span>
              </div>
            )}

            <div className="flex items-center gap-2">
              <Badge 
                style={{ backgroundColor: `${selectedEvent.color}20`, color: selectedEvent.color }}
              >
                {selectedEvent.status}
              </Badge>
              <Badge variant="outline">
                {selectedEvent.type === 'hearing' ? t('Hearing') : t('Timeline')}
              </Badge>
            </div>

            {selectedEvent.details?.description && (
              <div>
                <h4 className="font-medium text-sm mb-1">{t('Description')}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {selectedEvent.details.description}
                </p>
              </div>
            )}

            {selectedEvent.details?.notes && (
              <div>
                <h4 className="font-medium text-sm mb-1">{t('Notes')}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {selectedEvent.details.notes}
                </p>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );

  const breadcrumbs = [
    { title: t('Dashboard'), href: route('dashboard') },
    { title: t('Calendar') }
  ];

  return (
    <PageTemplate
      title={t("Calendar")}
      url="/calendar"
      breadcrumbs={breadcrumbs}
      noPadding
    >
      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigateDate('prev')}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigateDate('next')}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigateDate('today')}
                >
                  {t('Today')}
                </Button>
              </div>
              
              <h2 className="text-xl font-semibold">
                {currentDateObj.toLocaleDateString(undefined, { 
                  month: 'long', 
                  year: 'numeric' 
                })}
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant={viewType === 'month' ? 'default' : 'outline'}
                size="sm"
                onClick={() => changeView('month')}
              >
                {t('Month')}
              </Button>
              <Button
                variant={viewType === 'week' ? 'default' : 'outline'}
                size="sm"
                onClick={() => changeView('week')}
              >
                {t('Week')}
              </Button>
              <Button
                variant={viewType === 'day' ? 'default' : 'outline'}
                size="sm"
                onClick={() => changeView('day')}
              >
                {t('Day')}
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            {viewType === 'month' && renderMonthView()}
            {viewType === 'week' && renderWeekView()}
            {viewType === 'day' && renderDayView()}
          </div>

          <div className="space-y-6">
            {renderUpcomingEvents()}
            
            <Card>
              <CardHeader>
                <CardTitle>{t('This Month')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{t('Total Events')}</span>
                    <span className="font-medium">{events.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>{t('Hearings')}</span>
                    <span className="font-medium">
                      {events.filter((e: any) => e.type === 'hearing').length}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>{t('Timeline Events')}</span>
                    <span className="font-medium">
                      {events.filter((e: any) => e.type === 'timeline').length}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {renderEventModal()}
    </PageTemplate>
  );
}