
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

  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days = [];
    const today = new Date();
    
    for (let i = 0; i < 42; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);
      
      const dateStr = currentDate.toISOString().split('T')[0];
      const isCurrentMonth = currentDate.getMonth() === month;
      const isToday = currentDate.toDateString() === today.toDateString();
      const schedule = scheduleData[dateStr];
      
      days.push({
        date: dateStr,
        day: currentDate.getDate(),
        isCurrentMonth,
        isToday,
        schedule,
        hasWatering: !!schedule
      });
    }
    
    return days;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + (direction === 'next' ? 1 : -1));
      return newDate;
    });
  };

  const getTotalVolume = (schedule: ScheduleEntry | null) => {
    if (!schedule) return 0;
    return (schedule.morning?.volume || 0) + (schedule.afternoon?.volume || 0) + (schedule.evening?.volume || 0);
  };

  const handleDateSelect = (dateStr: string) => {
    setSelectedDate(dateStr);
    const existing = scheduleData[dateStr];
    setEditingSchedule({
      morning: existing?.morning || { time: '06:00', volume: 10 },
      afternoon: existing?.afternoon || { time: '14:00', volume: 5 },
      evening: existing?.evening || { time: '18:00', volume: 3 }
    });
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

  const calendarDays = generateCalendarDays();
  const monthName = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  useEffect(() => {
    setScheduleData(generateScheduleData());
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-40 shadow-sm">
        <div className="px-4 py-3">
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
                  <h1 className="text-lg font-bold text-gray-900">Calendar View</h1>
                  <p className="text-xs text-gray-600">Plot {plotId} Schedule</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-col lg:flex-row h-[calc(100vh-88px)]">
        {/* Calendar Section */}
        <div className="flex-1 p-6">
          <Card className="border-0 shadow-lg rounded-2xl bg-white/90 backdrop-blur-sm h-full">
            {/* Month Navigation */}
            <CardHeader>
              <div className="flex items-center justify-between">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigateMonth('prev')}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <CardTitle className="text-xl">{monthName}</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigateMonth('next')}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>

            <CardContent>
              {/* Week Headers */}
              <div className="grid grid-cols-7 gap-2 mb-4">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-2">
                {calendarDays.map((day, index) => (
                  <div
                    key={index}
                    className={`
                      relative aspect-square rounded-lg border-2 transition-all duration-200 cursor-pointer p-2 flex flex-col items-center justify-center
                      ${day.isCurrentMonth ? 'border-gray-200 hover:border-blue-300 bg-white' : 'border-transparent bg-gray-50'}
                      ${day.isToday ? 'ring-2 ring-emerald-400 bg-emerald-50 border-emerald-200' : ''}
                      ${selectedDate === day.date ? 'border-blue-500 bg-blue-50' : ''}
                      ${day.hasWatering && day.isCurrentMonth ? 'bg-blue-50 border-blue-200' : ''}
                    `}
                    onClick={() => handleDateSelect(day.date)}
                  >
                    {/* Date */}
                    <div className={`text-lg font-semibold ${
                      day.isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
                    } ${day.isToday ? 'text-emerald-600' : ''}`}>
                      {day.day}
                    </div>

                    {/* Schedule Indicators */}
                    {day.hasWatering && (
                      <div className="mt-1 flex flex-col items-center">
                        <Droplets className="w-3 h-3 text-blue-500" />
                        <span className="text-xs text-blue-600 font-medium">
                          {getTotalVolume(day.schedule)}L
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Schedule Editor */}
        {selectedDate && (
          <div className="w-full lg:w-96 p-6 border-l border-gray-200">
            <Card className="border-0 shadow-lg rounded-2xl bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg">
                  {new Date(selectedDate).toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {editingSchedule && (
                  <>
                    {/* Morning Schedule */}
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Sun className="w-5 h-5 text-yellow-500" />
                        <Label className="font-medium">Morning (6:00 AM)</Label>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Volume</span>
                           <span className="text-lg font-bold text-blue-600">
                             {editingSchedule.morning?.volume || 0}L
                           </span>
                        </div>
                         <Slider
                           value={[editingSchedule.morning?.volume || 0]}
                           onValueChange={(value) => 
                             setEditingSchedule(prev => ({
                               ...prev!,
                               morning: { ...(prev!.morning || { time: '06:00', volume: 0 }), volume: value[0] }
                             }))
                           }
                          max={30}
                          min={0}
                          step={1}
                          className="w-full"
                        />
                      </div>
                    </div>

                    {/* Afternoon Schedule */}
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Sun className="w-5 h-5 text-orange-500" />
                        <Label className="font-medium">Afternoon (2:00 PM)</Label>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Volume</span>
                           <span className="text-lg font-bold text-blue-600">
                             {editingSchedule.afternoon?.volume || 0}L
                           </span>
                        </div>
                         <Slider
                           value={[editingSchedule.afternoon?.volume || 0]}
                           onValueChange={(value) => 
                             setEditingSchedule(prev => ({
                               ...prev!,
                               afternoon: { ...(prev!.afternoon || { time: '14:00', volume: 0 }), volume: value[0] }
                             }))
                           }
                          max={20}
                          min={0}
                          step={1}
                          className="w-full"
                        />
                      </div>
                    </div>

                    {/* Evening Schedule */}
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Sunset className="w-5 h-5 text-purple-500" />
                        <Label className="font-medium">Evening (6:00 PM)</Label>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Volume</span>
                           <span className="text-lg font-bold text-blue-600">
                             {editingSchedule.evening?.volume || 0}L
                           </span>
                        </div>
                         <Slider
                           value={[editingSchedule.evening?.volume || 0]}
                           onValueChange={(value) => 
                             setEditingSchedule(prev => ({
                               ...prev!,
                               evening: { ...(prev!.evening || { time: '18:00', volume: 0 }), volume: value[0] }
                             }))
                           }
                          max={15}
                          min={0}
                          step={1}
                          className="w-full"
                        />
                      </div>
                    </div>

                    {/* Total Volume */}
                    <div className="pt-4 border-t border-gray-200">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-900">Daily Total</span>
                        <span className="text-2xl font-bold text-emerald-600">
                          {getTotalVolume(editingSchedule)}L
                        </span>
                      </div>
                    </div>

                    {/* Save Button */}
                    <Button
                      onClick={saveSchedule}
                      className="w-full bg-gradient-to-r from-blue-500 to-emerald-500 hover:from-blue-600 hover:to-emerald-600"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Save Schedule
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default CalendarScreen;
