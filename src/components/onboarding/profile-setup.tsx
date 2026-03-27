'use client';

import { useState, useRef } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Camera, Upload, User } from 'lucide-react';

interface ProfileSetupProps {
  initialData?: {
    name?: string | null;
    image?: string | null;
    phone?: string | null;
    bio?: string | null;
    timezone?: string | null;
  };
  onUpdate: (data: {
    name?: string;
    image?: string;
    phone?: string;
    bio?: string;
    timezone?: string;
  }) => void;
}

const timezones = [
  { value: 'Pacific/Honolulu', label: 'Hawaii (HST)' },
  { value: 'America/Anchorage', label: 'Alaska (AKST)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PST)' },
  { value: 'America/Denver', label: 'Mountain Time (MST)' },
  { value: 'America/Chicago', label: 'Central Time (CST)' },
  { value: 'America/New_York', label: 'Eastern Time (EST)' },
  { value: 'UTC', label: 'UTC' },
  { value: 'Europe/London', label: 'London (GMT)' },
  { value: 'Europe/Paris', label: 'Paris (CET)' },
  { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
  { value: 'Asia/Singapore', label: 'Singapore (SGT)' },
  { value: 'Australia/Sydney', label: 'Sydney (AEST)' },
];

export function ProfileSetup({ initialData, onUpdate }: ProfileSetupProps) {
  const [name, setName] = useState(initialData?.name || '');
  const [image, setImage] = useState(initialData?.image || '');
  const [phone, setPhone] = useState(initialData?.phone || '');
  const [bio, setBio] = useState(initialData?.bio || '');
  const [timezone, setTimezone] = useState(initialData?.timezone || 'UTC');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be less than 5MB');
      return;
    }

    setIsUploading(true);

    try {
      // Convert to base64 for preview
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64 = event.target?.result as string;
        setImage(base64);
        
        // Upload to server
        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', 'avatar');

        try {
          const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
          });

          if (response.ok) {
            const data = await response.json();
            setImage(data.url);
          }
        } catch {
          // Keep base64 as fallback
        }
      };
      reader.readAsDataURL(file);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = () => {
    onUpdate({
      name: name || undefined,
      image: image || undefined,
      phone: phone || undefined,
      bio: bio || undefined,
      timezone,
    });
  };

  return (
    <div className="space-y-6">
      {/* Avatar Upload */}
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <Avatar className="w-24 h-24 border-4 border-purple-200 shadow-lg">
            <AvatarImage src={image} alt={name || 'User'} />
            <AvatarFallback className="bg-purple-100 text-purple-600 text-2xl">
              {name?.charAt(0)?.toUpperCase() || <User className="w-10 h-10" />}
            </AvatarFallback>
          </Avatar>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="absolute bottom-0 right-0 bg-purple-600 text-white p-2 rounded-full shadow-lg hover:bg-purple-700 transition-colors"
            disabled={isUploading}
          >
            <Camera className="w-4 h-4" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="text-purple-600 border-purple-200 hover:bg-purple-50"
        >
          <Upload className="w-4 h-4 mr-2" />
          {isUploading ? 'Uploading...' : 'Upload Photo'}
        </Button>
      </div>

      {/* Form Fields */}
      <Card className="border-purple-100">
        <CardContent className="pt-6 space-y-4">
          {/* Display Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-purple-900 font-medium">
              Display Name *
            </Label>
            <Input
              id="name"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="border-purple-200 focus:border-purple-400 focus:ring-purple-400"
            />
            <p className="text-xs text-gray-500">
              This is how others will see you in the community
            </p>
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-purple-900 font-medium">
              Phone Number
            </Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+1 (555) 000-0000"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="border-purple-200 focus:border-purple-400 focus:ring-purple-400"
            />
            <p className="text-xs text-gray-500">
              Optional - for event reminders via SMS
            </p>
          </div>

          {/* Bio/Testimony */}
          <div className="space-y-2">
            <Label htmlFor="bio" className="text-purple-900 font-medium">
              About You / Testimony
            </Label>
            <Textarea
              id="bio"
              placeholder="Share a bit about yourself or your faith journey..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={4}
              className="border-purple-200 focus:border-purple-400 focus:ring-purple-400 resize-none"
            />
            <p className="text-xs text-gray-500">
              Tell others about your journey - this will appear on your profile
            </p>
          </div>

          {/* Timezone */}
          <div className="space-y-2">
            <Label htmlFor="timezone" className="text-purple-900 font-medium">
              Timezone
            </Label>
            <Select value={timezone} onValueChange={setTimezone}>
              <SelectTrigger className="border-purple-200 focus:border-purple-400 focus:ring-purple-400">
                <SelectValue placeholder="Select your timezone" />
              </SelectTrigger>
              <SelectContent>
                {timezones.map((tz) => (
                  <SelectItem key={tz.value} value={tz.value}>
                    {tz.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500">
              Used for event reminders and daily devotionals
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Auto-save on change */}
      <div className="hidden">
        {setTimeout(() => {
          handleSubmit();
        }, 1000) && null}
      </div>
    </div>
  );
}

export default ProfileSetup;
