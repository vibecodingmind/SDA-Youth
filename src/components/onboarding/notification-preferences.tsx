'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

interface NotificationPreferencesProps {
  initialPrefs?: {
    eventReminders?: boolean;
    dailyDevotional?: boolean;
    prayerRequests?: boolean;
    announcements?: boolean;
    smallGroupUpdates?: boolean;
    achievements?: boolean;
    email?: boolean;
    push?: boolean;
    sms?: boolean;
  } | null;
  onUpdate: (prefs: {
    eventReminders: boolean;
    dailyDevotional: boolean;
    prayerRequests: boolean;
    announcements: boolean;
    smallGroupUpdates: boolean;
    achievements: boolean;
    email: boolean;
    push: boolean;
    sms: boolean;
  }) => void;
}

const notificationOptions = [
  {
    id: 'eventReminders',
    title: 'Event Reminders',
    description: 'Get notified about upcoming events and RSVPs',
    emoji: '📅',
  },
  {
    id: 'dailyDevotional',
    title: 'Daily Devotional',
    description: 'Receive daily devotional messages',
    emoji: '📖',
  },
  {
    id: 'prayerRequests',
    title: 'Prayer Requests',
    description: 'Updates on prayer requests you\'re following',
    emoji: '🙏',
  },
  {
    id: 'announcements',
    title: 'Announcements',
    description: 'Important announcements from leadership',
    emoji: '📢',
  },
  {
    id: 'smallGroupUpdates',
    title: 'Small Group Updates',
    description: 'Messages and updates from your small groups',
    emoji: '👥',
  },
  {
    id: 'achievements',
    title: 'Achievements & Badges',
    description: 'Celebrate when you earn points and badges',
    emoji: '🏆',
  },
];

const channelOptions = [
  {
    id: 'email',
    title: 'Email Notifications',
    description: 'Receive updates via email',
    emoji: '✉️',
  },
  {
    id: 'push',
    title: 'Push Notifications',
    description: 'Browser and mobile push notifications',
    emoji: '🔔',
  },
  {
    id: 'sms',
    title: 'SMS Notifications',
    description: 'Text message alerts (requires phone number)',
    emoji: '📱',
  },
];

export function NotificationPreferences({ initialPrefs, onUpdate }: NotificationPreferencesProps) {
  const [preferences, setPreferences] = useState({
    eventReminders: initialPrefs?.eventReminders ?? true,
    dailyDevotional: initialPrefs?.dailyDevotional ?? true,
    prayerRequests: initialPrefs?.prayerRequests ?? true,
    announcements: initialPrefs?.announcements ?? true,
    smallGroupUpdates: initialPrefs?.smallGroupUpdates ?? true,
    achievements: initialPrefs?.achievements ?? true,
    email: initialPrefs?.email ?? true,
    push: initialPrefs?.push ?? true,
    sms: initialPrefs?.sms ?? false,
  });

  const togglePreference = (id: string) => {
    const newPrefs = {
      ...preferences,
      [id]: !preferences[id as keyof typeof preferences],
    };
    setPreferences(newPrefs);
    onUpdate(newPrefs);
  };

  return (
    <div className="space-y-6">
      {/* Notification Types */}
      <Card className="border-purple-100 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg text-purple-900 flex items-center gap-2">
            <span className="text-2xl">🔔</span>
            What to Notify
          </CardTitle>
          <p className="text-sm text-gray-500">
            Choose what types of notifications you&apos;d like to receive
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {notificationOptions.map((option) => (
            <div
              key={option.id}
              className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-purple-25 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">{option.emoji}</span>
                <div>
                  <Label className="font-medium text-gray-800">{option.title}</Label>
                  <p className="text-xs text-gray-500">{option.description}</p>
                </div>
              </div>
              <Switch
                checked={preferences[option.id as keyof typeof preferences] as boolean}
                onCheckedChange={() => togglePreference(option.id)}
                className="data-[state=checked]:bg-purple-600"
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Notification Channels */}
      <Card className="border-purple-100 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg text-purple-900 flex items-center gap-2">
            <span className="text-2xl">📨</span>
            How to Notify
          </CardTitle>
          <p className="text-sm text-gray-500">
            Choose how you want to receive notifications
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {channelOptions.map((option) => (
            <div
              key={option.id}
              className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-purple-25 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">{option.emoji}</span>
                <div>
                  <Label className="font-medium text-gray-800">{option.title}</Label>
                  <p className="text-xs text-gray-500">{option.description}</p>
                </div>
              </div>
              <Switch
                checked={preferences[option.id as keyof typeof preferences] as boolean}
                onCheckedChange={() => togglePreference(option.id)}
                className="data-[state=checked]:bg-purple-600"
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Summary */}
      <div className="bg-gradient-to-r from-purple-50 to-yellow-50 p-4 rounded-lg border border-purple-200">
        <h4 className="font-medium text-purple-900 mb-2">Notification Summary</h4>
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary" className="bg-purple-100 text-purple-800">
            {Object.values(preferences).filter((v, i) => i < 6 && v).length} types enabled
          </Badge>
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
            {Object.values(preferences).filter((v, i) => i >= 6 && v).length} channels active
          </Badge>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          You can always change these settings later in your profile
        </p>
      </div>
    </div>
  );
}

export default NotificationPreferences;
