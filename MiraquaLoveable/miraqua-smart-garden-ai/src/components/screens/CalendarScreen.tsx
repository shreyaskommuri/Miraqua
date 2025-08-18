
import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { 
  ArrowLeft, 
  Calendar,
  Droplets, 
  ChevronLeft,
  ChevronRight,
  Plus,
  Minus,
  Clock,
  Sun,
  Moon,
  Sunset,
  Save
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const CalendarScreen = () => {
  const navigate = useNavigate();
  const { plotId } = useParams();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(
    searchParams.get('date') || null
  );
  const [scheduleData, setScheduleData] = useState<Record<string, ScheduleEntry>>({});
  const [editingSchedule, setEditingSchedule] = useState<ScheduleEntry | null>(null);

  interface ScheduleSlot {
    time: string;
    volume: number;
  }

  interface ScheduleEntry {
    morning: ScheduleSlot | null;
    afternoon: ScheduleSlot | null;
    evening: ScheduleSlot | null;
  }

  // Mock schedule data
  const generateScheduleData = (): Record<string, ScheduleEntry> => {
    const data: Record<string, ScheduleEntry> = {};
    const today = new Date();
    
    for (let i = -10; i < 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      
      if (Math.random() > 0.6) {
        data[dateStr] = {
          morning: Math.random() > 0.5 ? { time: '06:00', volume: Math.floor(Math.random() * 15) + 5 } : null,
          afternoon: Math.random() > 0.7 ? { time: '14:00', volume: Math.floor(Math.random() * 10) + 3 } : null,
          evening: Math.random() > 0.8 ? { time: '18:00', volume: Math.floor(Math.random() * 8) + 2 } : null,
        };
      }
    }
    
    return data;
  };

  const generateMonthDays = () => {
    const today = new Date();
    const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const lastDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
    
    const days = [];
    
    // Generate only the days that belong to the current month
    for (let day = 1; day <= lastDayOfMonth.getDate(); day++) {
      const currentDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      const dateStr = currentDate.toISOString().split('T')[0];
      const todayStr = today.toISOString().split('T')[0];
      const isToday = dateStr === todayStr;
      
      const schedule = scheduleData[dateStr];
      const hasWatering = !!schedule;
      
      days.push({
        date: dateStr,
        day: currentDate.getDate(),
        dayOfWeek: currentDate.toLocaleDateString('en-US', { weekday: 'short' }),
        isToday,
        hasWatering,
        schedule,
        isCurrentMonth: true
      });
    }
    
    return days;
  };


  const getTotalVolume = (schedule: ScheduleEntry | null) => {
    if (!schedule) return 0;
    return (schedule.morning?.volume || 0) + (schedule.afternoon?.volume || 0) + (schedule.evening?.volume || 0);
  };

  const handleDateSelect = (dateStr: string) => {
    // Get latitude and longitude from search params or use defaults
    const latitude = parseFloat(searchParams.get('lat') || '37.7749');
    const longitude = parseFloat(searchParams.get('lon') || '-122.4194');
    // Navigate to the specific day view using the correct route pattern
    navigate(`/app/day/${plotId}/${dateStr}?lat=${latitude}&lon=${longitude}&date=${dateStr}`);
  };

  const saveSchedule = () => {
    if (!selectedDate || !editingSchedule) return;
    
    setScheduleData(prev => ({
      ...prev,
      [selectedDate]: editingSchedule
    }));
    
    toast({
      title: "💧 Schedule Updated",
      description: `Watering plan saved for ${new Date(selectedDate).toLocaleDateString()}`,
    });
  };

  const calendarDays = generateMonthDays();

  useEffect(() => {
    setScheduleData(generateScheduleData());
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - Positioned like plot details screen */}
      <header className="fixed top-[64px] left-0 right-0 z-40 bg-white shadow-sm lg:ml-64 lg:top-0 border-t-0">
        <div className="px-4 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate(-1)}
                className="w-10 h-10 p-0 rounded-full hover:bg-gray-100"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-emerald-500 rounded-xl flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-gray-900">Calendar</h1>
                  <p className="text-xs text-gray-600">Plot {plotId} Schedule</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="h-[calc(100vh-128px)] mt-16">
        {/* Calendar Section */}
        <div className="flex-1 px-6 pb-6">
          <Card className="border-0 shadow-lg rounded-2xl bg-white h-full overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-emerald-500 to-blue-500 text-white">
              <CardTitle className="text-xl flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">
                      {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </h3>
                    <p className="text-emerald-100 text-sm">Tap dates for details</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}
                    className="text-white hover:bg-white/20 w-8 h-8 p-0"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}
                    className="text-white hover:bg-white/20 w-8 h-8 p-0"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>

            <CardContent className="p-4">
              {/* Week Headers */}
              <div className="grid grid-cols-7 gap-1 mb-3">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="text-center text-xs font-semibold text-gray-600 py-2">
                    {day}
                  </div>
                ))}
              </div>

              {/* Monthly Calendar Grid */}
              <div className="grid grid-cols-7 gap-2">
                {calendarDays.map((day, index) => (
                  <div
                    key={`day-${index}`}
                    className={`
                      relative rounded-lg border transition-all duration-200 p-2 flex flex-col items-center justify-center cursor-pointer active:scale-95 min-h-[50px]
                      ${day.isCurrentMonth 
                        ? 'border-gray-200 hover:border-blue-300 bg-white hover:shadow-md' 
                        : 'border-gray-100 bg-gray-50 text-gray-400'
                      }
                      ${day.isToday ? 'ring-2 ring-emerald-400 bg-emerald-50 border-emerald-300 shadow-lg' : ''}
                      ${day.hasWatering && !day.isToday && day.isCurrentMonth ? 'bg-blue-50 border-blue-200' : ''}
                    `}
                    onClick={() => handleDateSelect(day.date)}
                  >
                    {/* Date Number */}
                    <div className={`text-sm font-bold mb-1 ${
                      day.isToday ? 'text-emerald-600' : 
                      day.isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
                    }`}>
                      {day.day}
                    </div>

                    {/* Watering Indicator */}
                    {day.hasWatering && day.isCurrentMonth && (
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                    )}

                    {/* Today Pulse Indicator */}
                    {day.isToday && (
                      <div className="absolute inset-0 rounded-lg ring-2 ring-emerald-400 ring-opacity-30 animate-pulse pointer-events-none" />
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Legend */}
        <div className="px-6 pb-6">
          <Card className="border-0 shadow-md rounded-2xl bg-white">
            <CardContent className="p-3">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-emerald-100 border-2 border-emerald-400 rounded-md animate-pulse" />
                  <span className="text-gray-700">Today</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-100 border-2 border-blue-200 rounded-md flex items-center justify-center">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
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
      </div>
    </div>
  );
};

export default CalendarScreen;
