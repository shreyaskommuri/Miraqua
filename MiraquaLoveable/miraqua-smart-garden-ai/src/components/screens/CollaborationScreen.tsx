
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ArrowLeft, Plus, Send, UserPlus, MessageCircle, Settings, Crown, User, Shield } from "lucide-react";

const CollaborationScreen = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isInviting, setIsInviting] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchCollaborationData();
  }, []);

  const fetchCollaborationData = async () => {
    setIsLoading(true);
    setError("");
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setUsers([
        {
          id: 1,
          name: "Sarah Johnson",
          email: "sarah@example.com",
          role: "admin",
          initials: "SJ",
          lastActive: "2 hours ago",
          status: "online"
        },
        {
          id: 2,
          name: "Mike Chen",
          email: "mike@example.com",
          role: "editor",
          initials: "MC",
          lastActive: "1 day ago",
          status: "offline"
        },
        {
          id: 3,
          name: "Emma Davis",
          email: "emma@example.com",
          role: "viewer",
          initials: "ED",
          lastActive: "3 hours ago",
          status: "online"
        }
      ]);
      
      setComments([
        {
          id: 1,
          user: "Sarah Johnson",
          avatar: "SJ",
          content: "The tomato plot is looking great! Moisture levels are perfect.",
          timestamp: "2 hours ago",
          plotId: 1
        },
        {
          id: 2,
          user: "Mike Chen",
          avatar: "MC",
          content: "Should we increase watering for the pepper patch? It's been quite hot.",
          timestamp: "1 day ago",
          plotId: 3
        },
        {
          id: 3,
          user: "Emma Davis",
          avatar: "ED",
          content: "I noticed the herb corner needs attention. The basil leaves are wilting.",
          timestamp: "3 hours ago",
          plotId: 2
        }
      ]);
    } catch (err) {
      setError("Failed to load collaboration data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInviteUser = async () => {
    if (!inviteEmail || !/\S+@\S+\.\S+/.test(inviteEmail)) {
      return;
    }

    setIsInviting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Add new user to the list
      const newUser = {
        id: users.length + 1,
        name: inviteEmail.split('@')[0],
        email: inviteEmail,
        role: "viewer",
        initials: inviteEmail.substring(0, 2).toUpperCase(),
        lastActive: "Just invited",
        status: "pending"
      };
      
      setUsers([...users, newUser]);
      setInviteEmail("");
      setShowInviteModal(false);
    } catch (err) {
      setError("Failed to send invite. Please try again.");
    } finally {
      setIsInviting(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    const comment = {
      id: comments.length + 1,
      user: "You",
      avatar: "YO",
      content: newComment,
      timestamp: "now",
      plotId: null
    };

    setComments([comment, ...comments]);
    setNewComment("");
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin':
        return <Crown className="w-4 h-4 text-yellow-600" />;
      case 'editor':
        return <Settings className="w-4 h-4 text-blue-600" />;
      case 'viewer':
        return <User className="w-4 h-4 text-gray-600" />;
      default:
        return <Shield className="w-4 h-4 text-gray-400" />;
    }
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'admin':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'editor':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'viewer':
        return 'bg-gray-100 text-gray-700 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
          <div className="px-6 py-4">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <h1 className="text-xl font-bold text-gray-900">Team & Sharing</h1>
            </div>
          </div>
        </header>
        
        <div className="px-6 py-6 space-y-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 bg-gray-200 rounded-lg animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error && users.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <Card className="w-full max-w-md text-center">
          <CardContent className="p-6">
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={fetchCollaborationData} className="w-full">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Team & Sharing</h1>
                <p className="text-sm text-gray-600">{users.length} members</p>
              </div>
            </div>
            <Button 
              onClick={() => setShowInviteModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Invite
            </Button>
          </div>
        </div>
      </header>

      <ScrollArea className="h-screen">
        <div className="px-6 py-6 pb-32 space-y-6">
          {/* Team Members */}
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="text-lg">Team Members</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {users.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Avatar className="w-10 h-10">
                        <AvatarFallback className="bg-blue-100 text-blue-700">
                          {user.initials}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center space-x-2">
                          <p className="font-medium text-gray-900">{user.name}</p>
                          <div className={`w-2 h-2 rounded-full ${
                            user.status === 'online' ? 'bg-green-500' :
                            user.status === 'pending' ? 'bg-yellow-500' : 'bg-gray-400'
                          }`}></div>
                        </div>
                        <p className="text-sm text-gray-600">{user.email}</p>
                        <p className="text-xs text-gray-500">Last active: {user.lastActive}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {getRoleIcon(user.role)}
                      <Badge className={getRoleBadgeColor(user.role)}>
                        {user.role}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Comments */}
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <MessageCircle className="w-5 h-5 mr-2" />
                Recent Comments
              </CardTitle>
            </CardHeader>
            <CardContent>
              {comments.length === 0 ? (
                <div className="text-center py-8">
                  <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">No comments yet</p>
                  <p className="text-sm text-gray-500">Start a conversation with your team!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {comments.map((comment) => (
                    <div key={comment.id} className="flex space-x-3 p-3 bg-gray-50 rounded-lg">
                      <Avatar className="w-8 h-8 flex-shrink-0">
                        <AvatarFallback className="bg-green-100 text-green-700 text-xs">
                          {comment.avatar}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <p className="font-medium text-gray-900 text-sm">{comment.user}</p>
                          <p className="text-xs text-gray-500">{comment.timestamp}</p>
                        </div>
                        <p className="text-sm text-gray-700">{comment.content}</p>
                        {comment.plotId && (
                          <Button
                            variant="link"
                            size="sm"
                            className="p-0 h-auto text-xs text-blue-600"
                            onClick={() => navigate(`/plot/${comment.plotId}`)}
                          >
                            View Plot →
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Sharing Settings */}
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="text-lg">Sharing Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Public Link</h4>
                <p className="text-sm text-blue-800 mb-3">
                  Share a read-only view of your garden with anyone
                </p>
                <div className="flex items-center space-x-2">
                  <Input
                    value="https://miraqua.app/shared/garden-abc123"
                    readOnly
                    className="text-xs bg-white"
                  />
                  <Button size="sm" variant="outline">
                    Copy
                  </Button>
                </div>
              </div>
              
              <div className="p-4 bg-green-50 rounded-lg">
                <h4 className="font-medium text-green-900 mb-2">Team Features</h4>
                <ul className="text-sm text-green-800 space-y-1">
                  <li>• Real-time notifications for all team members</li>
                  <li>• Shared watering schedules and adjustments</li>
                  <li>• Collaborative plot monitoring and comments</li>
                  <li>• Role-based permissions (Admin, Editor, Viewer)</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </ScrollArea>

      {/* Comment Input */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-gray-200 p-4">
        <div className="flex items-center space-x-3">
          <Avatar className="w-8 h-8">
            <AvatarFallback className="bg-purple-100 text-purple-700 text-xs">
              YO
            </AvatarFallback>
          </Avatar>
          <Input
            placeholder="Add a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
            className="flex-1"
          />
          <Button 
            onClick={handleAddComment}
            disabled={!newComment.trim()}
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-lg">Invite Team Member</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Email Address</label>
                <Input
                  type="email"
                  placeholder="colleague@example.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="h-12"
                />
              </div>
              
              <div className="flex space-x-3">
                <Button
                  onClick={() => setShowInviteModal(false)}
                  variant="outline"
                  className="flex-1"
                  disabled={isInviting}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleInviteUser}
                  disabled={isInviting || !inviteEmail}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isInviting ? "Sending..." : "Send Invite"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default CollaborationScreen;
