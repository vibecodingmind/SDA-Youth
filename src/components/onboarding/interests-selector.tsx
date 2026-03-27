'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Music,
  Users,
  BookOpen,
  Heart,
  Utensils,
  Camera,
  Mic2,
  Palette,
  Globe,
  HandHeart,
  MessageCircle,
  Calendar,
} from 'lucide-react';

interface InterestsSelectorProps {
  initialInterests?: {
    eventCategories?: string[];
    smallGroups?: string[];
    servingAreas?: string[];
  } | null;
  onUpdate: (interests: {
    eventCategories: string[];
    smallGroups: string[];
    servingAreas: string[];
  }) => void;
}

const eventCategories = [
  { id: 'worship', label: 'Worship Services', icon: Music, emoji: '🎵' },
  { id: 'bible-study', label: 'Bible Study', icon: BookOpen, emoji: '📖' },
  { id: 'social', label: 'Social Events', icon: Users, emoji: '🎉' },
  { id: 'outreach', label: 'Community Outreach', icon: Heart, emoji: '🤝' },
  { id: 'sports', label: 'Sports & Recreation', icon: '🏃', emoji: '⚽' },
  { id: 'retreats', label: 'Retreats & Camps', icon: Calendar, emoji: '🏕️' },
  { id: 'workshops', label: 'Workshops & Training', icon: '🎓', emoji: '📚' },
  { id: 'prayer', label: 'Prayer Meetings', icon: MessageCircle, emoji: '🙏' },
];

const smallGroups = [
  { id: 'young-adults', label: 'Young Adults (18-25)', emoji: '🌟' },
  { id: 'teens', label: 'Teens (13-17)', emoji: '💫' },
  { id: 'mens', label: "Men's Group", emoji: '💪' },
  { id: 'womens', label: "Women's Group", emoji: '💐' },
  { id: 'music', label: 'Music Ministry', emoji: '🎸' },
  { id: 'drama', label: 'Drama & Arts', emoji: '🎭' },
  { id: 'missions', label: 'Missions Team', emoji: '🌍' },
  { id: 'hospitality', label: 'Hospitality Team', emoji: '🍽️' },
];

const servingAreas = [
  { id: 'worship-team', label: 'Worship Team', icon: Mic2, emoji: '🎤' },
  { id: 'audio-visual', label: 'Audio/Visual', icon: '🎬', emoji: '📷' },
  { id: 'hospitality', label: 'Hospitality', icon: Utensils, emoji: '☕' },
  { id: 'photography', label: 'Photography/Media', icon: Camera, emoji: '📸' },
  { id: 'children', label: 'Children\'s Ministry', icon: '👶', emoji: '👶' },
  { id: 'welcome-team', label: 'Welcome Team', icon: HandHeart, emoji: '👋' },
  { id: 'prayer-team', label: 'Prayer Team', icon: Heart, emoji: '💝' },
  { id: 'outreach', label: 'Outreach & Evangelism', icon: Globe, emoji: '🌍' },
  { id: 'creative-arts', label: 'Creative Arts', icon: Palette, emoji: '🎨' },
  { id: 'tech-support', label: 'Tech Support', icon: '💻', emoji: '💻' },
];

export function InterestsSelector({ initialInterests, onUpdate }: InterestsSelectorProps) {
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    initialInterests?.eventCategories || []
  );
  const [selectedGroups, setSelectedGroups] = useState<string[]>(
    initialInterests?.smallGroups || []
  );
  const [selectedServing, setSelectedServing] = useState<string[]>(
    initialInterests?.servingAreas || []
  );

  const toggleCategory = (id: string) => {
    const newCategories = selectedCategories.includes(id)
      ? selectedCategories.filter((c) => c !== id)
      : [...selectedCategories, id];
    setSelectedCategories(newCategories);
    onUpdate({
      eventCategories: newCategories,
      smallGroups: selectedGroups,
      servingAreas: selectedServing,
    });
  };

  const toggleGroup = (id: string) => {
    const newGroups = selectedGroups.includes(id)
      ? selectedGroups.filter((g) => g !== id)
      : [...selectedGroups, id];
    setSelectedGroups(newGroups);
    onUpdate({
      eventCategories: selectedCategories,
      smallGroups: newGroups,
      servingAreas: selectedServing,
    });
  };

  const toggleServing = (id: string) => {
    const newServing = selectedServing.includes(id)
      ? selectedServing.filter((s) => s !== id)
      : [...selectedServing, id];
    setSelectedServing(newServing);
    onUpdate({
      eventCategories: selectedCategories,
      smallGroups: selectedGroups,
      servingAreas: newServing,
    });
  };

  return (
    <div className="space-y-6">
      {/* Event Categories */}
      <Card className="border-purple-100 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg text-purple-900 flex items-center gap-2">
            <span className="text-2xl">📅</span>
            Event Categories
          </CardTitle>
          <p className="text-sm text-gray-500">
            What types of events interest you?
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            {eventCategories.map((category) => {
              const isSelected = selectedCategories.includes(category.id);
              return (
                <div
                  key={category.id}
                  onClick={() => toggleCategory(category.id)}
                  className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                    isSelected
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-purple-300 hover:bg-purple-25'
                  }`}
                >
                  <span className="text-xl">{category.emoji}</span>
                  <span className={`text-sm font-medium ${isSelected ? 'text-purple-900' : 'text-gray-700'}`}>
                    {category.label}
                  </span>
                  {isSelected && (
                    <Badge className="ml-auto bg-purple-600 text-white text-xs">Selected</Badge>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Small Groups */}
      <Card className="border-purple-100 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg text-purple-900 flex items-center gap-2">
            <span className="text-2xl">👥</span>
            Small Groups
          </CardTitle>
          <p className="text-sm text-gray-500">
            Which small groups would you like to join?
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            {smallGroups.map((group) => {
              const isSelected = selectedGroups.includes(group.id);
              return (
                <div
                  key={group.id}
                  onClick={() => toggleGroup(group.id)}
                  className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                    isSelected
                      ? 'border-yellow-500 bg-yellow-50'
                      : 'border-gray-200 hover:border-yellow-300 hover:bg-yellow-25'
                  }`}
                >
                  <span className="text-xl">{group.emoji}</span>
                  <span className={`text-sm font-medium ${isSelected ? 'text-yellow-900' : 'text-gray-700'}`}>
                    {group.label}
                  </span>
                  {isSelected && (
                    <Badge className="ml-auto bg-yellow-500 text-white text-xs">Selected</Badge>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Serving Areas */}
      <Card className="border-purple-100 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg text-purple-900 flex items-center gap-2">
            <span className="text-2xl">💝</span>
            Serving Areas
          </CardTitle>
          <p className="text-sm text-gray-500">
            Where would you like to serve? (Select all that apply)
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            {servingAreas.map((area) => {
              const isSelected = selectedServing.includes(area.id);
              return (
                <div
                  key={area.id}
                  onClick={() => toggleServing(area.id)}
                  className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                    isSelected
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-green-300 hover:bg-green-25'
                  }`}
                >
                  <span className="text-xl">{area.emoji}</span>
                  <span className={`text-sm font-medium ${isSelected ? 'text-green-900' : 'text-gray-700'}`}>
                    {area.label}
                  </span>
                  {isSelected && (
                    <Badge className="ml-auto bg-green-600 text-white text-xs">Selected</Badge>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      <div className="bg-gradient-to-r from-purple-50 to-yellow-50 p-4 rounded-lg border border-purple-200">
        <h4 className="font-medium text-purple-900 mb-2">Your Selections</h4>
        <div className="flex flex-wrap gap-2">
          {selectedCategories.length === 0 && selectedGroups.length === 0 && selectedServing.length === 0 ? (
            <p className="text-sm text-gray-500">No selections yet. Click on items above to select them.</p>
          ) : (
            <>
              {selectedCategories.map((id) => {
                const cat = eventCategories.find((c) => c.id === id);
                return cat ? (
                  <Badge key={id} variant="secondary" className="bg-purple-100 text-purple-800">
                    {cat.emoji} {cat.label}
                  </Badge>
                ) : null;
              })}
              {selectedGroups.map((id) => {
                const group = smallGroups.find((g) => g.id === id);
                return group ? (
                  <Badge key={id} variant="secondary" className="bg-yellow-100 text-yellow-800">
                    {group.emoji} {group.label}
                  </Badge>
                ) : null;
              })}
              {selectedServing.map((id) => {
                const area = servingAreas.find((a) => a.id === id);
                return area ? (
                  <Badge key={id} variant="secondary" className="bg-green-100 text-green-800">
                    {area.emoji} {area.label}
                  </Badge>
                ) : null;
              })}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default InterestsSelector;
