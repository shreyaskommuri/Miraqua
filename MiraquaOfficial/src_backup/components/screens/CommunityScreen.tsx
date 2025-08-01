
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  ArrowLeft, 
  Users, 
  Trophy, 
  Heart, 
  MessageSquare,
  Share,
  Target,
  Eye,
  ThumbsUp,
  Camera
} from 'lucide-react';

const CommunityScreen = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('feed');
  const [loading, setLoading] = useState(true);
  const [communityData, setCommunityData] = useState<any>(null);

  useEffect(() => {
    fetchCommunityData();
  }, []);

  const fetchCommunityData = async () => {
    setLoading(true);
    // Remove the artificial delay
    setCommunityData({
      challenges: [
        {
          id: 1,
          title: 'Summer Water Saver',
          description: 'Reduce water usage by 20% this month',
          participants: 234,
          daysLeft: 12,
          reward: '50 points',
          progress: 65,
          joined: true
        },
        {
          id: 2,
          title: 'Green Thumb Challenge',
          description: 'Grow 3 different vegetables',
          participants: 189,
          daysLeft: 25,
          reward: 'Expert Badge',
          progress: 33,
          joined: false
        }
      ],
      feed: [
        {
          id: 1,
          user: { name: 'Sarah Chen', avatar: '/placeholder.svg' },
          content: 'Just harvested my first tomatoes of the season! 🍅',
          image: '/placeholder.svg',
          likes: 24,
          comments: 8,
          timeAgo: '2h ago'
        },
        {
          id: 2,
          user: { name: 'Mike Rodriguez', avatar: '/placeholder.svg' },
          content: 'My smart irrigation system saved 30% water this week!',
          likes: 15,
          comments: 5,
          timeAgo: '4h ago'
        }
      ],
      leaderboard: [
        { rank: 1, name: 'GreenThumb_Pro', points: 2340, badge: 'Expert' },
        { rank: 2, name: 'PlantWhisperer', points: 2180, badge: 'Master' },
        { rank: 3, name: 'EcoGardener', points: 1950, badge: 'Advanced' }
      ]
    });
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
        <header className="bg-white/90 backdrop-blur-sm border-b border-green-200 sticky top-0 z-40">
          <div className="px-4 py-4">
            <div className="flex items-center space-x-3">
              <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <h1 className="text-lg font-bold">Community</h1>
            </div>
          </div>
        </header>
        <div className="p-4 space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-lg animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">

      <div className="bg-gray-50 dark:bg-gray-900 min-h-[calc(100vh-80px)]">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          {/* Tabs Navigation */}
          <div className="bg-white dark:bg-gray-800 px-4 py-4 border-b border-gray-100 dark:border-gray-700">
            <TabsList className="grid w-full grid-cols-3 bg-gray-100 dark:bg-gray-700">
              <TabsTrigger value="feed" className="font-medium">
                Feed
              </TabsTrigger>
              <TabsTrigger value="challenges" className="font-medium">
                Challenges
              </TabsTrigger>
              <TabsTrigger value="leaderboard" className="font-medium">
                Leaderboard
              </TabsTrigger>
            </TabsList>
          </div>

          <ScrollArea className="h-[calc(100vh-160px)]">
            <div className="p-4 space-y-4">
              <TabsContent value="feed" className="space-y-4 mt-0">
                {communityData.feed.map((post: any) => (
                  <Card key={post.id} className="border-0 shadow-sm bg-white dark:bg-gray-800">
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3 mb-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={post.user.avatar} />
                          <AvatarFallback className="bg-green-100 text-green-700">{post.user.name[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="font-medium text-gray-900 dark:text-white">{post.user.name}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">{post.timeAgo}</div>
                        </div>
                      </div>
                      
                      <p className="text-gray-800 dark:text-gray-200 mb-3">{post.content}</p>
                      
                      {post.image && (
                        <div className="w-full h-48 bg-gray-200 dark:bg-gray-700 rounded-lg mb-3 flex items-center justify-center">
                          <Camera className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <Button variant="ghost" size="sm" className="text-gray-600 dark:text-gray-400 hover:text-red-500">
                            <Heart className="w-4 h-4 mr-1" />
                            {post.likes}
                          </Button>
                          <Button variant="ghost" size="sm" className="text-gray-600 dark:text-gray-400">
                            <MessageSquare className="w-4 h-4 mr-1" />
                            {post.comments}
                          </Button>
                        </div>
                        <Button variant="ghost" size="sm" className="text-gray-600 dark:text-gray-400">
                          <Share className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="challenges" className="space-y-4 mt-0">
                {communityData.challenges.map((challenge: any) => (
                  <Card key={challenge.id} className="border-0 shadow-sm bg-white dark:bg-gray-800">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                            <Target className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                            <CardTitle className="text-lg text-gray-900 dark:text-white">{challenge.title}</CardTitle>
                          </div>
                        </div>
                        <Badge className={challenge.joined ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}>
                          {challenge.joined ? "Joined" : "Available"}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-gray-600 dark:text-gray-300 mb-4">{challenge.description}</p>
                      
                      {challenge.joined && (
                        <div className="mb-4">
                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-gray-600 dark:text-gray-400">Progress</span>
                            <span className="font-medium text-blue-600 dark:text-blue-400">{challenge.progress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div 
                              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${challenge.progress}%` }}
                            />
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          <div className="flex items-center space-x-1 mb-1">
                            <Users className="w-3 h-3" />
                            <span>{challenge.participants} participants</span>
                          </div>
                          <div>{challenge.daysLeft} days left</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-1">{challenge.reward}</div>
                          <Button 
                            size="sm" 
                            className={challenge.joined ? "bg-gray-300 text-gray-700" : "bg-blue-600 hover:bg-blue-700 text-white"}
                            disabled={challenge.joined}
                          >
                            {challenge.joined ? "Joined" : "Join Challenge"}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="leaderboard" className="space-y-4 mt-0">
                <Card className="border-0 shadow-sm bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border border-yellow-200 dark:border-yellow-800">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center space-x-2 text-gray-900 dark:text-white">
                      <div className="w-8 h-8 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center">
                        <Trophy className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                      </div>
                      <span>Top Gardeners</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      {communityData.leaderboard.map((user: any, index: number) => (
                        <div key={index} className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
                          <div className="flex items-center space-x-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg ${
                              user.rank === 1 ? "bg-gradient-to-r from-yellow-400 to-yellow-500" : 
                              user.rank === 2 ? "bg-gradient-to-r from-gray-400 to-gray-500" : 
                              user.rank === 3 ? "bg-gradient-to-r from-orange-400 to-orange-500" : "bg-gray-300"
                            }`}>
                              {user.rank}
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900 dark:text-white text-lg">{user.name}</div>
                              <Badge 
                                variant="secondary" 
                                className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                              >
                                {user.badge}
                              </Badge>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-2xl text-blue-600 dark:text-blue-400">{user.points}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">points</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </div>
          </ScrollArea>
        </Tabs>
      </div>
    </div>
  );
};

export default CommunityScreen;
