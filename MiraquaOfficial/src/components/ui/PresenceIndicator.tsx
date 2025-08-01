
import React, { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Eye, Users } from 'lucide-react';

interface User {
  id: string;
  name: string;
  avatar?: string;
  role: 'owner' | 'collaborator' | 'viewer';
  lastSeen: Date;
  isOnline: boolean;
  currentPage?: string;
}

interface PresenceIndicatorProps {
  plotId?: string;
  maxVisible?: number;
}

const PresenceIndicator: React.FC<PresenceIndicatorProps> = ({ plotId, maxVisible = 3 }) => {
  const [onlineUsers, setOnlineUsers] = useState<User[]>([]);
  
  useEffect(() => {
    // Simulate real-time presence data
    const mockUsers: User[] = [
      {
        id: '1',
        name: 'Sarah Johnson',
        avatar: '',
        role: 'owner',
        lastSeen: new Date(),
        isOnline: true,
        currentPage: 'plot-details'
      },
      {
        id: '2',
        name: 'Mike Chen',
        avatar: '',
        role: 'collaborator',
        lastSeen: new Date(Date.now() - 300000), // 5 minutes ago
        isOnline: true,
        currentPage: 'analytics'
      },
      {
        id: '3',
        name: 'Emma Davis',
        avatar: '',
        role: 'viewer',
        lastSeen: new Date(Date.now() - 120000), // 2 minutes ago
        isOnline: false,
        currentPage: 'map'
      },
      {
        id: '4',
        name: 'Alex Kim',
        avatar: '',
        role: 'collaborator',
        lastSeen: new Date(Date.now() - 60000), // 1 minute ago
        isOnline: true,
        currentPage: 'plot-details'
      }
    ];
    
    setOnlineUsers(mockUsers.filter(user => user.isOnline));
  }, [plotId]);

  if (onlineUsers.length === 0) return null;

  const visibleUsers = onlineUsers.slice(0, maxVisible);
  const hiddenCount = Math.max(0, onlineUsers.length - maxVisible);

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'owner': return 'ring-green-500';
      case 'collaborator': return 'ring-blue-500';
      case 'viewer': return 'ring-gray-400';
      default: return 'ring-gray-400';
    }
  };

  const formatLastSeen = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / 60000);
    
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    
    return date.toLocaleDateString();
  };

  return (
    <TooltipProvider>
      <div className="flex items-center space-x-2">
        <div className="flex items-center -space-x-2">
          {visibleUsers.map((user) => (
            <Tooltip key={user.id}>
              <TooltipTrigger asChild>
                <div className="relative">
                  <Avatar className={`w-8 h-8 border-2 ${getRoleColor(user.role)} bg-white`}>
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback className="text-xs font-semibold">
                      {user.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  
                  {/* Online status indicator */}
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                  
                  {/* Activity indicator */}
                  {user.currentPage === 'plot-details' && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                      <Eye className="w-2 h-2 text-white" />
                    </div>
                  )}
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="max-w-xs">
                <div className="space-y-1">
                  <div className="font-semibold">{user.name}</div>
                  <div className="text-xs text-gray-500 capitalize">{user.role}</div>
                  <div className="text-xs text-gray-500">
                    {user.isOnline ? 'Online now' : `Last seen ${formatLastSeen(user.lastSeen)}`}
                  </div>
                  {user.currentPage && (
                    <div className="text-xs text-blue-600">
                      Viewing: {user.currentPage.replace('-', ' ')}
                    </div>
                  )}
                </div>
              </TooltipContent>
            </Tooltip>
          ))}
          
          {hiddenCount > 0 && (
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="w-8 h-8 bg-gray-100 border-2 border-gray-300 rounded-full flex items-center justify-center">
                  <span className="text-xs font-semibold text-gray-600">
                    +{hiddenCount}
                  </span>
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <div className="space-y-1">
                  {onlineUsers.slice(maxVisible).map(user => (
                    <div key={user.id} className="text-sm">
                      {user.name} ({user.role})
                    </div>
                  ))}
                </div>
              </TooltipContent>
            </Tooltip>
          )}
        </div>

        <Badge variant="outline" className="text-xs flex items-center space-x-1">
          <Users className="w-3 h-3" />
          <span>{onlineUsers.length} online</span>
        </Badge>
      </div>
    </TooltipProvider>
  );
};

export default PresenceIndicator;
