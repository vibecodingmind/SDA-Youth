'use client';

import * as React from 'react';
import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Bell, Trophy, BadgeCheck, Calendar, Users, Settings, LogOut, Menu,
  Home, FileText, Award, BarChart3, Shield, Mail, TrendingUp,
  MessageCircle, Heart, BookOpen, Target, Gift, UserPlus, Crosshair,
  Newspaper, Video, FileDown, Clock, CheckCircle, Star, Send,
  Upload, Search, Plus, X, ChevronRight, Flame, Zap, Crown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell
} from 'recharts';
import { NotificationBell } from '@/components/notifications/notification-bell';
import { useNotifications } from '@/hooks/use-notifications';

// Mock data
const mockUser = { id: 'user-1', name: 'John Doe', email: 'john@example.com', role: 'admin', points: 450, streak: 7, rank: 5 };
const mockLeaderboard = [
  { rank: 1, id: 'u1', name: 'Sarah Kim', points: 1200, badges: 8 },
  { rank: 2, id: 'u2', name: 'Mike Chen', points: 980, badges: 6 },
  { rank: 3, id: 'u3', name: 'Emma Wilson', points: 850, badges: 5 },
  { rank: 4, id: 'u4', name: 'David Park', points: 600, badges: 4 },
  { rank: 5, id: 'user-1', name: 'John Doe', points: 450, badges: 3 },
];
const mockBadges = [
  { id: 'b1', name: 'First Steps', icon: '🎯', description: 'Complete your first event', earned: true },
  { id: 'b2', name: 'Social Butterfly', icon: '🦋', description: 'Attend 5 events', earned: true },
  { id: 'b3', name: 'Helper', icon: '🤝', description: 'Volunteer for 3 activities', earned: true },
  { id: 'b4', name: 'Top Contributor', icon: '⭐', description: 'Reach top 10', earned: false },
  { id: 'b5', name: 'Event Master', icon: '🎉', description: 'Create 5 events', earned: false },
  { id: 'b6', name: 'Mentor', icon: '📖', description: 'Help 10 new members', earned: false },
];
const growthData = [
  { month: 'Oct', users: 45 },
  { month: 'Nov', users: 62 },
  { month: 'Dec', users: 78 },
  { month: 'Jan', users: 95 },
  { month: 'Feb', users: 120 },
  { month: 'Mar', users: 156 },
];
const participationData = [
  { name: 'Attended', value: 65, color: '#7C3AED' },
  { name: 'Registered', value: 25, color: '#A78BFA' },
  { name: 'Cancelled', value: 10, color: '#C4B5FD' },
];

// Chat mock data
const mockChatRooms = [
  { id: 'c1', name: 'General Chat', type: 'group', members: 45, lastMessage: 'Hey everyone!' },
  { id: 'c2', name: 'Bible Study Group', type: 'group', members: 12, lastMessage: 'See you tonight!' },
  { id: 'c3', name: 'Worship Team', type: 'group', members: 8, lastMessage: 'Practice at 6pm' },
];
const mockMessages = [
  { id: 'm1', sender: 'Sarah Kim', content: 'Good morning everyone! 👋', time: '9:00 AM' },
  { id: 'm2', sender: 'Mike Chen', content: 'Morning! Ready for Bible study tonight?', time: '9:05 AM' },
  { id: 'm3', sender: 'You', content: 'Yes! Looking forward to it!', time: '9:10 AM' },
];

// Prayer requests mock
const mockPrayerRequests = [
  { id: 'p1', title: 'Healing for grandmother', content: 'Please pray for my grandmother who is recovering from surgery.', author: 'Sarah Kim', prayers: 24, isAnonymous: false },
  { id: 'p2', title: 'Guidance for career decision', content: 'I need wisdom for an important career decision.', author: 'Anonymous', prayers: 18, isAnonymous: true },
  { id: 'p3', title: 'Upcoming mission trip', content: 'Pray for our team traveling to Mexico next week.', author: 'Mike Chen', prayers: 32, isAnonymous: false },
];

// Forum mock
const mockForumTopics = [
  { id: 't1', title: 'How to stay consistent with devotions?', category: 'Spiritual Growth', author: 'Emma Wilson', replies: 15, views: 234 },
  { id: 't2', title: 'Best worship songs for youth service?', category: 'Worship', author: 'David Park', replies: 23, views: 189 },
  { id: 't3', title: 'Tips for sharing your faith at school', category: 'Evangelism', author: 'Lisa Brown', replies: 8, views: 156 },
];

// Events mock
const mockEvents = [
  { id: 'e1', title: 'Youth Bible Study', date: '2026-04-01', location: 'Main Hall', attending: 25, points: 10 },
  { id: 'e2', title: 'Community Service', date: '2026-04-05', location: 'City Park', attending: 18, points: 15 },
  { id: 'e3', title: 'Music Practice', date: '2026-04-08', location: 'Music Room', attending: 12, points: 5 },
];

// Devotionals mock
const mockDevotionals = [
  { id: 'd1', title: 'Walking in Faith', verse: '2 Corinthians 5:7', date: '2026-03-27', read: false },
  { id: 'd2', title: 'The Power of Prayer', verse: 'James 5:16', date: '2026-03-26', read: true },
  { id: 'd3', title: 'Trusting God\'s Plan', verse: 'Jeremiah 29:11', date: '2026-03-25', read: true },
];

// Daily challenges mock
const mockChallenges = [
  { id: 'ch1', title: 'Read 1 Bible chapter', points: 10, completed: false },
  { id: 'ch2', title: 'Pray for 10 minutes', points: 15, completed: true },
  { id: 'ch3', title: 'Share a verse with a friend', points: 20, completed: false },
];

// Rewards mock
const mockRewards = [
  { id: 'r1', name: 'Snack Bar Voucher', points: 50, image: '🍫', stock: 10 },
  { id: 'r2', name: 'T-Shirt', points: 200, image: '👕', stock: 5 },
  { id: 'r3', name: 'Bookstore Gift Card', points: 500, image: '📚', stock: 3 },
];

// Small groups mock
const mockSmallGroups = [
  { id: 'g1', name: 'Young Adults', leader: 'Sarah Kim', members: 15, meetingTime: 'Wed 7PM' },
  { id: 'g2', name: 'High School', leader: 'Mike Chen', members: 20, meetingTime: 'Fri 6PM' },
  { id: 'g3', name: 'College', leader: 'Emma Wilson', members: 12, meetingTime: 'Sun 2PM' },
];

// Testimonies mock
const mockTestimonies = [
  { id: 't1', title: 'From Doubt to Faith', author: 'David Park', date: '2026-03-20', likes: 45 },
  { id: 't2', title: 'God\'s Provision in Hard Times', author: 'Lisa Brown', date: '2026-03-18', likes: 38 },
];

// Sidebar Component
function Sidebar({ sidebarOpen, activeTab, setActiveTab }: { sidebarOpen: boolean; activeTab: string; setActiveTab: (t: string) => void }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'chat', label: 'Chat', icon: MessageCircle },
    { id: 'prayer', label: 'Prayer Wall', icon: Heart },
    { id: 'forum', label: 'Forum', icon: BookOpen },
    { id: 'events', label: 'Events', icon: Calendar },
    { id: 'devotionals', label: 'Devotionals', icon: Target },
    { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
    { id: 'badges', label: 'Badges', icon: Award },
    { id: 'challenges', label: 'Challenges', icon: Zap },
    { id: 'rewards', label: 'Rewards', icon: Gift },
    { id: 'groups', label: 'Groups', icon: Users },
    { id: 'testimonies', label: 'Testimonies', icon: FileText },
    { id: 'media', label: 'Media', icon: Video },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'admin', label: 'Admin', icon: Shield, adminOnly: true },
  ];

  return (
    <motion.aside
      initial={{ width: sidebarOpen ? 256 : 80 }}
      animate={{ width: sidebarOpen ? 256 : 80 }}
      className="bg-gradient-to-b from-purple-900 to-purple-800 text-white min-h-screen p-4 flex flex-col"
    >
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-yellow-400 rounded-lg flex items-center justify-center text-2xl shrink-0">🐝</div>
        {sidebarOpen && <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="font-bold text-xl">BUSYBEES</motion.span>}
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <Button key={item.id} variant={activeTab === item.id ? 'secondary' : 'ghost'}
            className={`w-full justify-start gap-3 ${activeTab === item.id ? 'bg-white/20 text-white hover:bg-white/30' : 'text-white/70 hover:text-white hover:bg-white/10'}`}
            onClick={() => setActiveTab(item.id)}>
            <item.icon className="h-5 w-5 shrink-0" />
            {sidebarOpen && <span className="truncate">{item.label}</span>}
          </Button>
        ))}
      </nav>
      <div className="border-t border-white/20 pt-4 mt-4">
        <Button variant="ghost" className="w-full justify-start gap-3 text-white/70 hover:text-white hover:bg-white/10">
          <Settings className="h-5 w-5" />
          {sidebarOpen && <span>Settings</span>}
        </Button>
        <Button variant="ghost" className="w-full justify-start gap-3 text-white/70 hover:text-white hover:bg-white/10">
          <LogOut className="h-5 w-5" />
          {sidebarOpen && <span>Logout</span>}
        </Button>
      </div>
    </motion.aside>
  );
}

// Dashboard Content
function DashboardContent() {
  return (
    <div className="space-y-6">
      {/* Welcome & Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium opacity-90">Your Points</CardTitle></CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{mockUser.points}</div>
            <p className="text-xs opacity-75 mt-1">🔥 {mockUser.streak} day streak!</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-yellow-500 to-orange-500 text-white">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium opacity-90">Your Rank</CardTitle></CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">#{mockUser.rank}</div>
            <p className="text-xs opacity-75 mt-1">Top 5%</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-500 to-emerald-500 text-white">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium opacity-90">Events Attended</CardTitle></CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">12</div>
            <p className="text-xs opacity-75 mt-1">3 upcoming</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium opacity-90">Badges Earned</CardTitle></CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{mockBadges.filter(b => b.earned).length}</div>
            <p className="text-xs opacity-75 mt-1">{mockBadges.filter(b => !b.earned).length} to unlock</p>
          </CardContent>
        </Card>
      </div>

      {/* Daily Verse & Challenges */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-purple-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-700">
              <BookOpen className="h-5 w-5" /> Daily Verse
            </CardTitle>
          </CardHeader>
          <CardContent>
            <blockquote className="text-lg italic text-gray-700 border-l-4 border-purple-400 pl-4">
              "For I know the plans I have for you, declares the LORD, plans to prosper you and not to harm you, plans to give you hope and a future."
            </blockquote>
            <p className="text-right text-purple-600 font-semibold mt-2">— Jeremiah 29:11</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Zap className="h-5 w-5 text-yellow-500" /> Today&apos;s Challenges</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {mockChallenges.map((challenge) => (
              <div key={challenge.id} className={`flex items-center justify-between p-3 rounded-lg ${challenge.completed ? 'bg-green-50' : 'bg-gray-50'}`}>
                <div className="flex items-center gap-3">
                  {challenge.completed ? <CheckCircle className="h-5 w-5 text-green-500" /> : <Target className="h-5 w-5 text-gray-400" />}
                  <span className={challenge.completed ? 'line-through text-gray-400' : ''}>{challenge.title}</span>
                </div>
                <Badge variant={challenge.completed ? 'secondary' : 'default'} className={challenge.completed ? 'bg-green-100 text-green-600' : 'bg-purple-100 text-purple-600'}>
                  +{challenge.points} pts
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Events & Prayer Requests */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5 text-purple-600" /> Upcoming Events</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockEvents.slice(0, 3).map((event) => (
                <div key={event.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div>
                    <p className="font-medium">{event.title}</p>
                    <p className="text-sm text-gray-500">{new Date(event.date).toLocaleDateString()} • {event.location}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant="secondary">{event.attending} going</Badge>
                    <p className="text-xs text-purple-600 mt-1">+{event.points} pts</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Heart className="h-5 w-5 text-red-500" /> Prayer Requests</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockPrayerRequests.slice(0, 3).map((pr) => (
                <div key={pr.id} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium">{pr.title}</p>
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">{pr.content}</p>
                    </div>
                    <Button size="sm" variant="outline" className="shrink-0 ml-2">
                      <Heart className="h-4 w-4 mr-1" /> {pr.prayers}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Growth Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Community Growth</CardTitle>
          <CardDescription>New member registrations over time</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={growthData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="month" stroke="#6B7280" />
              <YAxis stroke="#6B7280" />
              <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #E5E7EB', borderRadius: '8px' }} />
              <Line type="monotone" dataKey="users" stroke="#7C3AED" strokeWidth={3} dot={{ fill: '#7C3AED', strokeWidth: 2, r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}

// Chat Content
function ChatContent() {
  const [selectedRoom, setSelectedRoom] = useState(mockChatRooms[0]);
  const [message, setMessage] = useState('');

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 h-[calc(100vh-180px)]">
      {/* Rooms List */}
      <Card className="lg:col-span-1">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Messages</CardTitle>
            <Button size="sm" variant="ghost"><Plus className="h-4 w-4" /></Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[400px]">
            {mockChatRooms.map((room) => (
              <div key={room.id} onClick={() => setSelectedRoom(room)}
                className={`p-3 cursor-pointer border-b hover:bg-gray-50 ${selectedRoom.id === room.id ? 'bg-purple-50' : ''}`}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                    <MessageCircle className="h-5 w-5 text-purple-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{room.name}</p>
                    <p className="text-xs text-gray-500 truncate">{room.lastMessage}</p>
                  </div>
                </div>
              </div>
            ))}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Chat Area */}
      <Card className="lg:col-span-3 flex flex-col">
        <CardHeader className="pb-2 border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">{selectedRoom.name}</CardTitle>
            <Badge variant="secondary">{selectedRoom.members} members</Badge>
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden p-0 flex flex-col">
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {mockMessages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.sender === 'You' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[70%] rounded-lg p-3 ${msg.sender === 'You' ? 'bg-purple-600 text-white' : 'bg-gray-100'}`}>
                    <p className="text-xs font-medium mb-1 opacity-70">{msg.sender}</p>
                    <p>{msg.content}</p>
                    <p className="text-xs opacity-50 mt-1">{msg.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
          <div className="p-4 border-t flex gap-2">
            <Input placeholder="Type a message..." value={message} onChange={(e) => setMessage(e.target.value)} className="flex-1" />
            <Button className="bg-purple-600 hover:bg-purple-700"><Send className="h-4 w-4" /></Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Prayer Wall Content
function PrayerWallContent() {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Prayer Wall</h2>
          <p className="text-gray-500">Share your prayer requests and pray for others</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="bg-purple-600 hover:bg-purple-700">
          <Plus className="h-4 w-4 mr-2" /> Add Request
        </Button>
      </div>

      {showForm && (
        <Card className="border-purple-200">
          <CardContent className="pt-4 space-y-4">
            <Input placeholder="Prayer request title..." />
            <textarea className="w-full h-24 p-3 border rounded-lg resize-none" placeholder="Share your prayer request..." />
            <div className="flex justify-between items-center">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" className="rounded" /> Submit anonymously
              </label>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
                <Button className="bg-purple-600 hover:bg-purple-700">Submit</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {mockPrayerRequests.map((pr) => (
          <Card key={pr.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg">{pr.title}</CardTitle>
                <Button size="sm" variant="outline">
                  <Heart className="h-4 w-4 mr-1 text-red-500" /> {pr.prayers}
                </Button>
              </div>
              <CardDescription>by {pr.isAnonymous ? 'Anonymous' : pr.author}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">{pr.content}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// Forum Content
function ForumContent() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Discussion Forum</h2>
          <p className="text-gray-500">Connect and discuss with the community</p>
        </div>
        <Button className="bg-purple-600 hover:bg-purple-700"><Plus className="h-4 w-4 mr-2" /> New Topic</Button>
      </div>

      <div className="space-y-3">
        {mockForumTopics.map((topic) => (
          <Card key={topic.id} className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg hover:text-purple-600">{topic.title}</h3>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                    <Badge variant="secondary">{topic.category}</Badge>
                    <span>by {topic.author}</span>
                  </div>
                </div>
                <div className="text-right text-sm text-gray-500">
                  <p>{topic.replies} replies</p>
                  <p>{topic.views} views</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// Events Content
function EventsContent() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Events</h2>
          <p className="text-gray-500">Upcoming activities and gatherings</p>
        </div>
        <Button className="bg-purple-600 hover:bg-purple-700"><Plus className="h-4 w-4 mr-2" /> Create Event</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {mockEvents.map((event) => (
          <Card key={event.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <CardTitle>{event.title}</CardTitle>
                <Badge className="bg-purple-100 text-purple-600">+{event.points} pts</Badge>
              </div>
              <CardDescription>{event.location}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  <p>{new Date(event.date).toLocaleDateString()}</p>
                  <p>{event.attending} attending</p>
                </div>
                <Button className="bg-purple-600 hover:bg-purple-700">RSVP</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// Devotionals Content
function DevotionalsContent() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Daily Devotionals</h2>
          <p className="text-gray-500">Start your day with God&apos;s Word</p>
        </div>
      </div>

      <div className="space-y-4">
        {mockDevotionals.map((devo) => (
          <Card key={devo.id} className={`hover:shadow-md transition-shadow ${devo.read ? 'opacity-60' : ''}`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${devo.read ? 'bg-green-100' : 'bg-purple-100'}`}>
                    {devo.read ? <CheckCircle className="h-6 w-6 text-green-600" /> : <Target className="h-6 w-6 text-purple-600" />}
                  </div>
                  <div>
                    <h3 className="font-semibold">{devo.title}</h3>
                    <p className="text-sm text-gray-500">{devo.verse} • {new Date(devo.date).toLocaleDateString()}</p>
                  </div>
                </div>
                <Button variant={devo.read ? 'outline' : 'default'} className={devo.read ? '' : 'bg-purple-600 hover:bg-purple-700'}>
                  {devo.read ? 'Read Again' : 'Start Reading'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// Leaderboard Content
function LeaderboardContent() {
  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Trophy className="h-6 w-6" /> 🏆 Leaderboard</CardTitle>
          <CardDescription className="text-white/80">Top contributors this month</CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-3 grid grid-cols-3 gap-4 mb-4">
          <div className="flex flex-col items-center pt-8">
            <Avatar className="w-16 h-16 border-4 border-gray-300"><AvatarFallback className="bg-gray-200 text-gray-600 text-xl">MK</AvatarFallback></Avatar>
            <p className="mt-3 font-semibold">{mockLeaderboard[1]?.name}</p>
            <p className="text-sm text-gray-500">{mockLeaderboard[1]?.points} pts</p>
          </div>
          <div className="flex flex-col items-center">
            <Avatar className="w-20 h-20 border-4 border-yellow-400"><AvatarFallback className="bg-yellow-100 text-yellow-600 text-2xl">SK</AvatarFallback></Avatar>
            <div className="text-2xl mt-1">👑</div>
            <p className="mt-2 font-semibold text-lg">{mockLeaderboard[0]?.name}</p>
            <p className="text-sm text-gray-500">{mockLeaderboard[0]?.points} pts</p>
          </div>
          <div className="flex flex-col items-center pt-12">
            <Avatar className="w-14 h-14 border-4 border-amber-600"><AvatarFallback className="bg-amber-100 text-amber-600 text-lg">EW</AvatarFallback></Avatar>
            <p className="mt-3 font-semibold">{mockLeaderboard[2]?.name}</p>
            <p className="text-sm text-gray-500">{mockLeaderboard[2]?.points} pts</p>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader><CardTitle>Full Rankings</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2">
            {mockLeaderboard.map((user, index) => (
              <div key={user.id} className={`flex items-center justify-between p-3 rounded-lg ${user.id === mockUser.id ? 'bg-purple-50 border border-purple-200' : 'bg-gray-50'}`}>
                <div className="flex items-center gap-3">
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${index === 0 ? 'bg-yellow-400 text-white' : index === 1 ? 'bg-gray-300 text-white' : index === 2 ? 'bg-amber-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
                    {user.rank}
                  </span>
                  <div>
                    <p className="font-medium">{user.name}</p>
                    <p className="text-sm text-gray-500">{user.badges} badges</p>
                  </div>
                </div>
                <p className="font-bold text-purple-600">{user.points} pts</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Badges Content
function BadgesContent() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Award className="h-6 w-6 text-purple-600" /> Your Badges</CardTitle>
          <CardDescription>Achievements you&apos;ve unlocked through participation</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {mockBadges.map((badge) => (
              <motion.div key={badge.id} whileHover={{ scale: 1.05 }}
                className={`p-4 rounded-xl border-2 text-center cursor-pointer transition-all ${badge.earned ? 'border-purple-200 bg-gradient-to-br from-purple-50 to-white shadow-md' : 'border-gray-200 bg-gray-50 opacity-60'}`}>
                <div className="text-4xl mb-2">{badge.icon}</div>
                <p className="font-semibold text-sm">{badge.name}</p>
                <p className="text-xs text-gray-500 mt-1">{badge.description}</p>
                {badge.earned && <Badge variant="secondary" className="mt-2 bg-purple-100 text-purple-600"><BadgeCheck className="h-3 w-3 mr-1" />Earned</Badge>}
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Challenges Content
function ChallengesContent() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Daily Challenges</h2>
          <p className="text-gray-500">Complete challenges to earn points</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {mockChallenges.map((challenge) => (
          <Card key={challenge.id} className={`${challenge.completed ? 'border-green-200 bg-green-50' : ''}`}>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${challenge.completed ? 'bg-green-100' : 'bg-purple-100'}`}>
                  {challenge.completed ? <CheckCircle className="h-6 w-6 text-green-600" /> : <Zap className="h-6 w-6 text-purple-600" />}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">{challenge.title}</h3>
                  <Badge className="mt-1 bg-purple-100 text-purple-600">+{challenge.points} pts</Badge>
                </div>
                <Button variant={challenge.completed ? 'outline' : 'default'} disabled={challenge.completed} className={challenge.completed ? '' : 'bg-purple-600 hover:bg-purple-700'}>
                  {challenge.completed ? 'Done' : 'Complete'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// Rewards Content
function RewardsContent() {
  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-80">Your Points</p>
              <p className="text-4xl font-bold">{mockUser.points}</p>
            </div>
            <Gift className="h-16 w-16 opacity-50" />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {mockRewards.map((reward) => (
          <Card key={reward.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4 text-center">
              <div className="text-5xl mb-3">{reward.image}</div>
              <h3 className="font-semibold">{reward.name}</h3>
              <Badge className="mt-2 bg-purple-100 text-purple-600">{reward.points} points</Badge>
              <p className="text-sm text-gray-500 mt-2">{reward.stock} in stock</p>
              <Button className="mt-3 w-full bg-purple-600 hover:bg-purple-700" disabled={mockUser.points < reward.points}>
                Redeem
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// Groups Content
function GroupsContent() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Small Groups</h2>
          <p className="text-gray-500">Connect with a community</p>
        </div>
        <Button className="bg-purple-600 hover:bg-purple-700"><Plus className="h-4 w-4 mr-2" /> Create Group</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {mockSmallGroups.map((group) => (
          <Card key={group.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="text-lg">{group.name}</CardTitle>
              <CardDescription>Led by {group.leader}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span><Users className="h-4 w-4 inline mr-1" />{group.members} members</span>
                <span><Clock className="h-4 w-4 inline mr-1" />{group.meetingTime}</span>
              </div>
              <Button className="mt-4 w-full bg-purple-600 hover:bg-purple-700">Join Group</Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// Testimonies Content
function TestimoniesContent() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Testimonies</h2>
          <p className="text-gray-500">Stories of God&apos;s faithfulness</p>
        </div>
        <Button className="bg-purple-600 hover:bg-purple-700"><Plus className="h-4 w-4 mr-2" /> Share Your Story</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {mockTestimonies.map((testimony) => (
          <Card key={testimony.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="text-lg">{testimony.title}</CardTitle>
              <CardDescription>by {testimony.author} • {new Date(testimony.date).toLocaleDateString()}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 line-clamp-3">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua...</p>
              <div className="flex items-center justify-between mt-4">
                <Button variant="ghost" size="sm"><Heart className="h-4 w-4 mr-1" /> {testimony.likes}</Button>
                <Button variant="ghost" size="sm">Read More</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// Media Content
function MediaContent() {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="videos">
        <TabsList>
          <TabsTrigger value="videos"><Video className="h-4 w-4 mr-2" /> Videos</TabsTrigger>
          <TabsTrigger value="documents"><FileDown className="h-4 w-4 mr-2" /> Documents</TabsTrigger>
        </TabsList>

        <TabsContent value="videos" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="hover:shadow-md transition-shadow">
                <div className="aspect-video bg-gray-200 rounded-t-lg flex items-center justify-center">
                  <Video className="h-12 w-12 text-gray-400" />
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold">Sermon Title {i}</h3>
                  <p className="text-sm text-gray-500">Pastor John • {i * 12} min</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="documents" className="mt-4">
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileDown className="h-8 w-8 text-purple-600" />
                    <div>
                      <h3 className="font-semibold">Study Guide {i}</h3>
                      <p className="text-sm text-gray-500">PDF • {(i * 0.5).toFixed(1)} MB</p>
                    </div>
                  </div>
                  <Button variant="outline">Download</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Analytics Content
function AnalyticsContent() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>User Growth</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={growthData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="month" stroke="#6B7280" />
                <YAxis stroke="#6B7280" />
                <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #E5E7EB', borderRadius: '8px' }} />
                <Bar dataKey="users" fill="#7C3AED" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Event Participation</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={participationData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                  {participationData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-4 mt-4">
              {participationData.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-sm text-gray-600">{item.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Admin Content
function AdminContent() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Shield className="h-6 w-6 text-purple-600" /> Admin Dashboard</CardTitle>
          <CardDescription>Manage users, content, and send communications</CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="users">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="posts">Posts</TabsTrigger>
          <TabsTrigger value="email">Email</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="mt-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>User Management</CardTitle>
                <Input placeholder="Search users..." className="w-64" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockLeaderboard.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Avatar><AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback></Avatar>
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-gray-500">{user.points} points</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">Edit</Button>
                      <Button size="sm" variant="destructive">Ban</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="email" className="mt-4">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Mail className="h-5 w-5" /> Send Bulk Email</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <Input placeholder="Subject" />
              <textarea className="w-full h-32 p-3 border rounded-lg resize-none" placeholder="Write your message..." />
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">Recipients: All users (156)</p>
                <Button className="bg-purple-600 hover:bg-purple-700"><Mail className="h-4 w-4 mr-2" /> Send Email</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="mt-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card><CardContent className="pt-6 text-center"><p className="text-3xl font-bold text-purple-600">156</p><p className="text-sm text-gray-600">Total Users</p></CardContent></Card>
            <Card><CardContent className="pt-6 text-center"><p className="text-3xl font-bold text-green-600">89%</p><p className="text-sm text-gray-600">Active Rate</p></CardContent></Card>
            <Card><CardContent className="pt-6 text-center"><p className="text-3xl font-bold text-yellow-600">3</p><p className="text-sm text-gray-600">Pending Posts</p></CardContent></Card>
            <Card><CardContent className="pt-6 text-center"><p className="text-3xl font-bold text-blue-600">42</p><p className="text-sm text-gray-600">Emails Sent</p></CardContent></Card>
          </div>
        </TabsContent>

        <TabsContent value="posts" className="mt-4">
          <Card>
            <CardHeader><CardTitle>Content Moderation</CardTitle><CardDescription>Review and moderate user posts</CardDescription></CardHeader>
            <CardContent><p className="text-gray-500 text-center py-8">No pending posts to review</p></CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="mt-4">
          <Card>
            <CardHeader><CardTitle>Platform Settings</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div><p className="font-medium">Enable Email Notifications</p><p className="text-sm text-gray-500">Send emails for important updates</p></div>
                <Button variant="outline">Enable</Button>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div><p className="font-medium">Maintenance Mode</p><p className="text-sm text-gray-500">Temporarily disable the platform</p></div>
                <Button variant="outline">Enable</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Main Page
export default function DashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications(mockUser.id);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar sidebarOpen={sidebarOpen} activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="flex-1 flex flex-col">
        <header className="bg-white border-b sticky top-0 z-10">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)}><Menu className="h-5 w-5" /></Button>
              <h1 className="text-xl font-semibold capitalize">{activeTab}</h1>
            </div>
            <div className="flex items-center gap-4">
              <NotificationBell notifications={notifications} unreadCount={unreadCount} onMarkAsRead={markAsRead} onMarkAllAsRead={markAllAsRead} />
              <Avatar><AvatarFallback className="bg-purple-600 text-white">JD</AvatarFallback></Avatar>
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 overflow-auto">
          {activeTab === 'dashboard' && <DashboardContent />}
          {activeTab === 'chat' && <ChatContent />}
          {activeTab === 'prayer' && <PrayerWallContent />}
          {activeTab === 'forum' && <ForumContent />}
          {activeTab === 'events' && <EventsContent />}
          {activeTab === 'devotionals' && <DevotionalsContent />}
          {activeTab === 'leaderboard' && <LeaderboardContent />}
          {activeTab === 'badges' && <BadgesContent />}
          {activeTab === 'challenges' && <ChallengesContent />}
          {activeTab === 'rewards' && <RewardsContent />}
          {activeTab === 'groups' && <GroupsContent />}
          {activeTab === 'testimonies' && <TestimoniesContent />}
          {activeTab === 'media' && <MediaContent />}
          {activeTab === 'analytics' && <AnalyticsContent />}
          {activeTab === 'admin' && <AdminContent />}
        </main>
      </div>
    </div>
  );
}
