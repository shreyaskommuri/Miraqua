
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from './card';
import { Badge } from './badge';
import { Button } from './button';
import { cn } from '@/lib/utils';
import { Droplets, Calendar, Plus, Minus } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface ScheduleDay {
  date: string;
  dayOfWeek: string;
  morning?: { time: string; duration: number; volume: number };
  afternoon?: { time: string; duration: number; volume: number };
  evening?: { time: string; duration: number; volume: number };
  hasWatering: boolean;
  isToday?: boolean;
}

interface CalendarScheduleProps {
  schedule: ScheduleDay[];
  onDayClick?: (day: ScheduleDay) => void;
  onCalendarClick?: (date: string) => void;
  className?: string;
  showManualControls?: boolean;
  onVolumeAdjust?: (date: string, adjustment: number) => void;
  plotId?: string;
}

export const CalendarSchedule: React.FC<CalendarScheduleProps> = ({
  schedule,
  onDayClick,
  onCalendarClick,
  className,
  showManualControls = false,
  onVolumeAdjust,
  plotId
}) => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  const generateNext14Days = () => {
    const today = new Date();
    const days = [];
    
    for (let i = 0; i < 14; i++) {
      const currentDate = new Date(today);
      currentDate.setDate(today.getDate() + i);
      
      const dateStr = currentDate.toISOString().split('T')[0];
      const todayStr = today.toISOString().split('T')[0];
      const isToday = dateStr === todayStr;
      
      const existingDay = schedule.find(day => day.date === dateStr);
      const hasWatering = existingDay?.hasWatering || Math.random() > 0.6;
      
      days.push({
        date: dateStr,
        day: currentDate.getDate(),
        dayOfWeek: currentDate.toLocaleDateString('en-US', { weekday: 'short' }),
        isToday,
        hasWatering,
        scheduleData: existingDay
      });
    }
    
    return days;
  };

  const calendarDays = generateNext14Days();

  const handleDayClick = (day: any, e: React.MouseEvent) => {
    e.stopPropagation();
    
    const searchParams = new URLSearchParams({
      date: day.date,
      lat: '37.7749',
      lon: '-122.4194'
    });
    
    navigate(`/app/day/${plotId}/${day.date}?${searchParams.toString()}`);
  };

  const handleCalendarClick = (day: any) => {
    const searchParams = new URLSearchParams({
      date: day.date,
      lat: '37.7749',
      lon: '-122.4194'
    });
    
    navigate(`/app/calendar/${plotId}?${searchParams.toString()}`);
  };

  const getTotalVolume = (day: any) => {
    if (!day.scheduleData) return 0;
    const schedule = day.scheduleData;
    return (schedule.morning?.volume || 0) + (schedule.afternoon?.volume || 0) + (schedule.evening?.volume || 0);
  };

  return (
    <div className={cn("space-y-4 w-full", className)}>
      <Card className="border-0 shadow-lg rounded-2xl bg-white/90 backdrop-blur-sm overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-500 to-blue-500 text-white px-4 py-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <Calendar className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h3 className="text-lg font-bold">Next 2 Weeks</h3>
              <p className="text-emerald-100 text-sm">Tap dates for details</p>
            </div>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="p-4">
          {/* Week Headers */}
          <div className="grid grid-cols-7 gap-1 mb-3">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center text-xs font-semibold text-gray-600 py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days - Reduced height */}
          <div className="space-y-3">
            {/* First Week */}
            <div className="grid grid-cols-7 gap-2">
              {calendarDays.slice(0, 7).map((day, index) => (
                <div
                  key={`week1-${index}`}
                  className={cn(
                    "relative rounded-lg border transition-all duration-200 p-2 flex flex-col items-center justify-center cursor-pointer active:scale-95",
                    "border-gray-200 hover:border-blue-300 bg-white hover:shadow-md min-h-[50px]",
                    day.isToday && "ring-2 ring-emerald-400 bg-emerald-50 border-emerald-300 shadow-lg",
                    day.hasWatering && !day.isToday && "bg-blue-50 border-blue-200"
                  )}
                  onClick={() => handleCalendarClick(day)}
                >
                  {/* Date Number - clickable for day details */}
                  <div 
                    className={cn(
                      "text-sm font-bold transition-all cursor-pointer hover:scale-110 mb-1",
                      day.isToday ? "text-emerald-600" : "text-gray-900"
                    )}
                    onClick={(e) => handleDayClick(day, e)}
                  >
                    {day.day}
                  </div>

                  {/* Watering Indicator */}
                  {day.hasWatering && (
                    <div className="flex flex-col items-center">
                      <Droplets className="w-2.5 h-2.5 text-blue-500 mb-0.5" />
                      {day.scheduleData && (
                        <span className="text-xs text-blue-600 font-medium">
                          {getTotalVolume(day)}L
                        </span>
                      )}
                    </div>
                  )}

                  {/* Manual Controls */}
                  {showManualControls && day.hasWatering && day.scheduleData && (
                    <div className="absolute top-0.5 right-0.5 flex space-x-0.5">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="w-4 h-4 p-0 bg-white shadow-sm hover:bg-gray-100"
                        onClick={(e) => {
                          e.stopPropagation();
                          onVolumeAdjust?.(day.date, -2);
                        }}
                      >
                        <Minus className="w-2 h-2" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="w-4 h-4 p-0 bg-white shadow-sm hover:bg-gray-100"
                        onClick={(e) => {
                          e.stopPropagation();
                          onVolumeAdjust?.(day.date, 2);
                        }}
                      >
                        <Plus className="w-2 h-2" />
                      </Button>
                    </div>
                  )}

                  {/* Today Pulse Indicator */}
                  {day.isToday && (
                    <div className="absolute inset-0 rounded-lg ring-2 ring-emerald-400 ring-opacity-30 animate-pulse pointer-events-none" />
                  )}
                </div>
              ))}
            </div>

            {/* Second Week */}
            <div className="grid grid-cols-7 gap-2">
              {calendarDays.slice(7, 14).map((day, index) => (
                <div
                  key={`week2-${index}`}
                  className={cn(
                    "relative rounded-lg border transition-all duration-200 p-2 flex flex-col items-center justify-center cursor-pointer active:scale-95",
                    "border-gray-200 hover:border-blue-300 bg-white hover:shadow-md min-h-[50px]",
                    day.isToday && "ring-2 ring-emerald-400 bg-emerald-50 border-emerald-300 shadow-lg",
                    day.hasWatering && !day.isToday && "bg-blue-50 border-blue-200"
                  )}
                  onClick={() => handleCalendarClick(day)}
                >
                  {/* Date Number - clickable for day details */}
                  <div 
                    className={cn(
                      "text-sm font-bold transition-all cursor-pointer hover:scale-110 mb-1",
                      day.isToday ? "text-emerald-600" : "text-gray-900"
                    )}
                    onClick={(e) => handleDayClick(day, e)}
                  >
                    {day.day}
                  </div>

                  {/* Watering Indicator */}
                  {day.hasWatering && (
                    <div className="flex flex-col items-center">
                      <Droplets className="w-2.5 h-2.5 text-blue-500 mb-0.5" />
                      {day.scheduleData && (
                        <span className="text-xs text-blue-600 font-medium">
                          {getTotalVolume(day)}L
                        </span>
                      )}
                    </div>
                  )}

                  {/* Manual Controls */}
                  {showManualControls && day.hasWatering && day.scheduleData && (
                    <div className="absolute top-0.5 right-0.5 flex space-x-0.5">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="w-4 h-4 p-0 bg-white shadow-sm hover:bg-gray-100"
                        onClick={(e) => {
                          e.stopPropagation();
                          onVolumeAdjust?.(day.date, -2);
                        }}
                      >
                        <Minus className="w-2 h-2" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="w-4 h-4 p-0 bg-white shadow-sm hover:bg-gray-100"
                        onClick={(e) => {
                          e.stopPropagation();
                          onVolumeAdjust?.(day.date, 2);
                        }}
                      >
                        <Plus className="w-2 h-2" />
                      </Button>
                    </div>
                  )}

                  {/* Today Pulse Indicator */}
                  {day.isToday && (
                    <div className="absolute inset-0 rounded-lg ring-2 ring-emerald-400 ring-opacity-30 animate-pulse pointer-events-none" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Legend */}
      <Card className="border-0 shadow-md rounded-2xl bg-white/80 backdrop-blur-sm">
        <CardContent className="p-3">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-emerald-100 border-2 border-emerald-400 rounded-md animate-pulse" />
              <span className="text-gray-700">Today</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-100 border-2 border-blue-200 rounded-md flex items-center justify-center">
                <Droplets className="w-1.5 h-1.5 text-blue-500" />
              </div>
              <span className="text-gray-700">Scheduled</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-white border-2 border-gray-200 rounded-md" />
              <span className="text-gray-700">Available</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
