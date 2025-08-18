
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from './card';
import { Input } from './input';
import { Badge } from './badge';
import { 
  Search, 
  Home, 
  Plus, 
  MessageSquare,
  BarChart3,
  Settings,
  Droplets,
  Map,
  Users,
  FileText,
  CloudRain,
  User,
  Calendar,
  Bell
} from 'lucide-react';

interface Command {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  category: string;
  keywords: string[];
  action: () => void;
  shortcut?: string;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const commands: Command[] = [
    // Navigation
    {
      id: 'home',
      title: 'Go to Dashboard',
      description: 'View all your plots and garden overview',
      icon: Home,
      category: 'Navigation',
      keywords: ['home', 'dashboard', 'overview'],
      action: () => navigate('/app')
    },
    {
      id: 'add-plot',
      title: 'Add New Plot',
      description: 'Create a new garden plot',
      icon: Plus,
      category: 'Actions',
      keywords: ['add', 'new', 'plot', 'create', 'garden'],
      action: () => navigate('/app/add-plot')
    },
    {
      id: 'chat',
      title: 'AI Garden Assistant',
      description: 'Chat with your AI gardening expert',
      icon: MessageSquare,
      category: 'Navigation',
      keywords: ['chat', 'ai', 'assistant', 'help', 'ask'],
      action: () => navigate('/chat')
    },
    {
      id: 'analytics',
      title: 'View Analytics',
      description: 'See detailed garden analytics and reports',
      icon: BarChart3,
      category: 'Navigation',
      keywords: ['analytics', 'reports', 'stats', 'data'],
      action: () => navigate('/app/analytics')
    },
    {
      id: 'weather',
      title: 'Weather Forecast',
      description: 'Check 7-day weather forecast',
      icon: CloudRain,
      category: 'Navigation',
      keywords: ['weather', 'forecast', 'rain', 'temperature'],
      action: () => navigate('/weather')
    },
    {
      id: 'collaboration',
      title: 'Team Collaboration',
      description: 'Manage team members and comments',
      icon: Users,
      category: 'Navigation',
      keywords: ['team', 'collaboration', 'members', 'share'],
      action: () => navigate('/collaboration')
    },
    {
      id: 'export',
      title: 'Export Reports',
      description: 'Generate and download garden reports',
      icon: FileText,
      category: 'Actions',
      keywords: ['export', 'download', 'report', 'pdf', 'csv'],
      action: () => navigate('/export')
    },
    {
      id: 'account',
      title: 'Account Settings',
      description: 'Manage your account and preferences',
      icon: User,
      category: 'Navigation',
      keywords: ['account', 'settings', 'profile', 'preferences'],
      action: () => navigate('/app/account')
    },
    // Quick Actions
    {
      id: 'water-all',
      title: 'Water All Plots',
      description: 'Start watering all active plots',
      icon: Droplets,
      category: 'Quick Actions',
      keywords: ['water', 'all', 'plots', 'irrigation'],
      action: () => {
        // Water all plots functionality
        alert('Watering all plots started!');
      }
    },
    {
      id: 'notifications',
      title: 'View Notifications',
      description: 'Check all recent notifications',
      icon: Bell,
      category: 'Quick Actions',
      keywords: ['notifications', 'alerts', 'messages'],
      action: () => {
        // Open notifications functionality
        // In a real app, this might open a notifications panel
      }
    }
  ];

  const filteredCommands = commands.filter(command =>
    command.title.toLowerCase().includes(search.toLowerCase()) ||
    command.description.toLowerCase().includes(search.toLowerCase()) ||
    command.keywords.some(keyword => keyword.toLowerCase().includes(search.toLowerCase()))
  );

  const groupedCommands = filteredCommands.reduce((acc, command) => {
    if (!acc[command.category]) {
      acc[command.category] = [];
    }
    acc[command.category].push(command);
    return acc;
  }, {} as Record<string, Command[]>);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [search]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => Math.min(prev + 1, filteredCommands.length - 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => Math.max(prev - 1, 0));
          break;
        case 'Enter':
          e.preventDefault();
          if (filteredCommands[selectedIndex]) {
            filteredCommands[selectedIndex].action();
            onClose();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, filteredCommands, selectedIndex]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center pt-[20vh]">
      <Card className="w-full max-w-2xl mx-4 shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
        <CardContent className="p-0">
          {/* Search Input */}
          <div className="p-6 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                ref={inputRef}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search commands... (type anything or use ⌘K)"
                className="pl-12 pr-4 h-12 text-lg border-0 focus:ring-0 bg-transparent"
                autoComplete="off"
              />
            </div>
          </div>

          {/* Commands List */}
          <div ref={listRef} className="max-h-96 overflow-y-auto">
            {Object.keys(groupedCommands).length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Search className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No commands found</p>
                <p className="text-sm">Try searching for "add", "water", or "chat"</p>
              </div>
            ) : (
              Object.entries(groupedCommands).map(([category, categoryCommands]) => (
                <div key={category}>
                  <div className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50 border-t border-gray-100">
                    {category}
                  </div>
                  {categoryCommands.map((command, index) => {
                    const globalIndex = filteredCommands.indexOf(command);
                    const Icon = command.icon;
                    return (
                      <div
                        key={command.id}
                        className={`px-6 py-4 cursor-pointer transition-colors border-l-4 ${
                          selectedIndex === globalIndex
                            ? 'bg-blue-50 border-blue-500'
                            : 'hover:bg-gray-50 border-transparent'
                        }`}
                        onClick={() => {
                          command.action();
                          onClose();
                        }}
                        onMouseEnter={() => setSelectedIndex(globalIndex)}
                      >
                        <div className="flex items-center space-x-4">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            selectedIndex === globalIndex ? 'bg-blue-100' : 'bg-gray-100'
                          }`}>
                            <Icon className={`w-5 h-5 ${
                              selectedIndex === globalIndex ? 'text-blue-600' : 'text-gray-600'
                            }`} />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h3 className="font-medium text-gray-900">{command.title}</h3>
                              {command.shortcut && (
                                <Badge variant="outline" className="text-xs">
                                  {command.shortcut}
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-600">{command.description}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-3 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center space-x-4">
                <span>↑↓ Navigate</span>
                <span>↵ Select</span>
                <span>Esc Close</span>
              </div>
              <span>{filteredCommands.length} commands</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
