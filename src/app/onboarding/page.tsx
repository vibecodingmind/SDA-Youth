'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ProfileSetup } from '@/components/onboarding/profile-setup';
import { InterestsSelector } from '@/components/onboarding/interests-selector';
import { NotificationPreferences } from '@/components/onboarding/notification-preferences';
import {
  ChevronLeft,
  ChevronRight,
  SkipForward,
  Check,
  Sparkles,
  Heart,
  Trophy,
  Star,
  PartyPopper,
} from 'lucide-react';

interface OnboardingData {
  name?: string;
  image?: string;
  phone?: string;
  bio?: string;
  timezone?: string;
  interests?: {
    eventCategories: string[];
    smallGroups: string[];
    servingAreas: string[];
  } | null;
  notificationPrefs?: {
    eventReminders: boolean;
    dailyDevotional: boolean;
    prayerRequests: boolean;
    announcements: boolean;
    smallGroupUpdates: boolean;
    achievements: boolean;
    email: boolean;
    push: boolean;
    sms: boolean;
  } | null;
  onboardingStep?: number;
}

const steps = [
  { id: 0, title: 'Welcome', icon: '🐝', shortTitle: 'Welcome' },
  { id: 1, title: 'Profile', icon: '👤', shortTitle: 'Profile' },
  { id: 2, title: 'Interests', icon: '💝', shortTitle: 'Interests' },
  { id: 3, title: 'Notifications', icon: '🔔', shortTitle: 'Notifications' },
  { id: 4, title: 'Complete', icon: '🎉', shortTitle: 'Complete' },
];

const earnedBadges = [
  { name: 'Welcome Bee', icon: '🐝', description: 'Completed onboarding' },
  { name: 'Profile Pro', icon: '⭐', description: 'Set up your profile' },
  { name: 'Community Builder', icon: '🤝', description: 'Joined the community' },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [data, setData] = useState<OnboardingData>({});
  const [showConfetti, setShowConfetti] = useState(false);

  // Fetch existing onboarding data
  useEffect(() => {
    const fetchOnboardingData = async () => {
      if (status === 'unauthenticated') {
        router.push('/auth/signin');
        return;
      }

      if (status === 'authenticated') {
        try {
          const response = await fetch('/api/onboarding');
          if (response.ok) {
            const result = await response.json();
            setData(result.user || {});
            setCurrentStep(result.user?.onboardingStep || 0);
            
            // If onboarding already completed, redirect to home
            if (result.user?.onboardingCompleted) {
              router.push('/');
            }
          }
        } catch (error) {
          console.error('Failed to fetch onboarding data:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchOnboardingData();
  }, [status, router]);

  // Save progress
  const saveProgress = useCallback(async (step: number, completed = false) => {
    setIsSaving(true);
    try {
      await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          step,
          completed,
          name: data.name,
          image: data.image,
          phone: data.phone,
          bio: data.bio,
          timezone: data.timezone,
          interests: data.interests,
          notificationPrefs: data.notificationPrefs,
        }),
      });
    } catch (error) {
      console.error('Failed to save progress:', error);
    } finally {
      setIsSaving(false);
    }
  }, [data]);

  const handleNext = async () => {
    const nextStep = currentStep + 1;
    setCurrentStep(nextStep);
    await saveProgress(nextStep);
    
    if (nextStep === steps.length - 1) {
      setShowConfetti(true);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = async () => {
    await handleNext();
  };

  const handleComplete = async () => {
    await saveProgress(steps.length - 1, true);
    router.push('/');
  };

  const handleProfileUpdate = (profileData: Partial<OnboardingData>) => {
    setData((prev) => ({ ...prev, ...profileData }));
  };

  const handleInterestsUpdate = (interests: NonNullable<OnboardingData['interests']>) => {
    setData((prev) => ({ ...prev, interests }));
  };

  const handleNotificationUpdate = (prefs: NonNullable<OnboardingData['notificationPrefs']>) => {
    setData((prev) => ({ ...prev, notificationPrefs: prefs }));
  };

  if (isLoading || status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-purple-700 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="w-16 h-16 bg-yellow-400 rounded-xl flex items-center justify-center text-3xl mx-auto mb-4 animate-bounce">
            🐝
          </div>
          <p className="text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-purple-700">
      {/* Header */}
      <div className="bg-purple-900/50 backdrop-blur-sm border-b border-purple-700 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-400 rounded-lg flex items-center justify-center text-xl">
                🐝
              </div>
              <div>
                <h1 className="text-white font-bold text-lg">BUSYBEES</h1>
                <p className="text-purple-200 text-xs">SDA Youth Ministry</p>
              </div>
            </div>
            <div className="text-white text-sm">
              Step {currentStep + 1} of {steps.length}
            </div>
          </div>
          
          {/* Progress Bar */}
          <Progress value={progress} className="h-2 bg-purple-700" />
          
          {/* Step Indicators */}
          <div className="flex justify-between mt-4">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={`flex flex-col items-center ${
                  index <= currentStep ? 'text-yellow-400' : 'text-purple-400'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                    index < currentStep
                      ? 'bg-yellow-400 text-purple-900'
                      : index === currentStep
                      ? 'bg-yellow-400 text-purple-900 ring-2 ring-yellow-300 ring-offset-2 ring-offset-purple-900'
                      : 'bg-purple-700 text-purple-400'
                  }`}
                >
                  {index < currentStep ? <Check className="w-4 h-4" /> : step.icon}
                </div>
                <span className="text-xs mt-1 hidden sm:block">{step.shortTitle}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Step 0: Welcome */}
        {currentStep === 0 && (
          <Card className="border-0 shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-yellow-400 to-yellow-300 p-8 text-center">
              <div className="w-24 h-24 bg-purple-900 rounded-2xl flex items-center justify-center text-5xl mx-auto mb-4 shadow-lg">
                🐝
              </div>
              <h2 className="text-3xl font-bold text-purple-900 mb-2">Welcome to BUSYBEES!</h2>
              <p className="text-purple-800">SDA Youth Ministry Platform</p>
            </div>
            <CardContent className="p-8">
              <div className="text-center mb-8">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">
                  We&apos;re so glad you&apos;re here! 💜
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  BUSYBEES is your home for spiritual growth, community, and fun. 
                  Connect with other young people in our ministry, discover events, 
                  join small groups, and grow in your faith journey together.
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-4 mb-8">
                <div className="text-center p-4 bg-purple-50 rounded-xl">
                  <div className="text-3xl mb-2">📖</div>
                  <h4 className="font-semibold text-purple-900">Daily Devotionals</h4>
                  <p className="text-sm text-gray-600">Start each day with God&apos;s Word</p>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-xl">
                  <div className="text-3xl mb-2">🎉</div>
                  <h4 className="font-semibold text-yellow-900">Events & Activities</h4>
                  <p className="text-sm text-gray-600">Connect through fun events</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-xl">
                  <div className="text-3xl mb-2">👥</div>
                  <h4 className="font-semibold text-green-900">Small Groups</h4>
                  <p className="text-sm text-gray-600">Grow together in community</p>
                </div>
              </div>

              <div className="bg-gradient-to-r from-purple-50 to-yellow-50 p-4 rounded-xl mb-6">
                <h4 className="font-semibold text-purple-900 mb-2 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-yellow-500" />
                  What&apos;s Next?
                </h4>
                <p className="text-sm text-gray-600">
                  Let&apos;s set up your profile! This will help us personalize your experience 
                  and connect you with the right groups and events. You can always skip any step 
                  and come back later.
                </p>
              </div>

              <div className="flex justify-end gap-3">
                <Button
                  variant="ghost"
                  onClick={handleSkip}
                  className="text-gray-500"
                >
                  <SkipForward className="w-4 h-4 mr-2" />
                  Skip Tour
                </Button>
                <Button
                  onClick={handleNext}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-8"
                >
                  Let&apos;s Go! <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 1: Profile Setup */}
        {currentStep === 1 && (
          <Card className="border-0 shadow-2xl">
            <CardHeader className="bg-gradient-to-r from-purple-100 to-purple-50 border-b">
              <CardTitle className="text-xl text-purple-900 flex items-center gap-2">
                <span className="text-2xl">👤</span>
                Set Up Your Profile
              </CardTitle>
              <p className="text-gray-600 text-sm">
                Tell us a bit about yourself - this helps others in the community get to know you!
              </p>
            </CardHeader>
            <CardContent className="p-6">
              <ProfileSetup
                initialData={{
                  name: data.name,
                  image: data.image,
                  phone: data.phone,
                  bio: data.bio,
                  timezone: data.timezone,
                }}
                onUpdate={handleProfileUpdate}
              />
              
              <div className="flex justify-between mt-6 pt-6 border-t">
                <Button variant="ghost" onClick={handleBack} className="text-gray-500">
                  <ChevronLeft className="w-4 h-4 mr-2" /> Back
                </Button>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={handleSkip}>
                    Skip for now
                  </Button>
                  <Button
                    onClick={handleNext}
                    className="bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    Continue <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Interests Selection */}
        {currentStep === 2 && (
          <Card className="border-0 shadow-2xl">
            <CardHeader className="bg-gradient-to-r from-yellow-100 to-yellow-50 border-b">
              <CardTitle className="text-xl text-purple-900 flex items-center gap-2">
                <span className="text-2xl">💝</span>
                Your Interests
              </CardTitle>
              <p className="text-gray-600 text-sm">
                Help us tailor your experience by telling us what you&apos;re interested in!
              </p>
            </CardHeader>
            <CardContent className="p-6">
              <InterestsSelector
                initialInterests={data.interests}
                onUpdate={handleInterestsUpdate}
              />
              
              <div className="flex justify-between mt-6 pt-6 border-t">
                <Button variant="ghost" onClick={handleBack} className="text-gray-500">
                  <ChevronLeft className="w-4 h-4 mr-2" /> Back
                </Button>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={handleSkip}>
                    Skip for now
                  </Button>
                  <Button
                    onClick={handleNext}
                    className="bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    Continue <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Notification Preferences */}
        {currentStep === 3 && (
          <Card className="border-0 shadow-2xl">
            <CardHeader className="bg-gradient-to-r from-purple-100 to-purple-50 border-b">
              <CardTitle className="text-xl text-purple-900 flex items-center gap-2">
                <span className="text-2xl">🔔</span>
                Notification Preferences
              </CardTitle>
              <p className="text-gray-600 text-sm">
                Choose how you want to stay connected with the community
              </p>
            </CardHeader>
            <CardContent className="p-6">
              <NotificationPreferences
                initialPrefs={data.notificationPrefs}
                onUpdate={handleNotificationUpdate}
              />
              
              <div className="flex justify-between mt-6 pt-6 border-t">
                <Button variant="ghost" onClick={handleBack} className="text-gray-500">
                  <ChevronLeft className="w-4 h-4 mr-2" /> Back
                </Button>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={handleSkip}>
                    Skip for now
                  </Button>
                  <Button
                    onClick={handleNext}
                    className="bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    Continue <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Complete */}
        {currentStep === 4 && (
          <Card className="border-0 shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-400 p-8 text-center relative">
              {showConfetti && (
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                  {[...Array(20)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute animate-ping"
                      style={{
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                        animationDelay: `${Math.random() * 2}s`,
                        fontSize: `${Math.random() * 20 + 10}px`,
                      }}
                    >
                      {['🎉', '⭐', '💜', '🐝', '✨'][Math.floor(Math.random() * 5)]}
                    </div>
                  ))}
                </div>
              )}
              <div className="w-24 h-24 bg-purple-900 rounded-2xl flex items-center justify-center text-5xl mx-auto mb-4 shadow-lg">
                <PartyPopper className="w-12 h-12 text-yellow-400" />
              </div>
              <h2 className="text-3xl font-bold text-purple-900 mb-2">You&apos;re All Set! 🎉</h2>
              <p className="text-purple-800">Welcome to the BUSYBEES family!</p>
            </div>
            <CardContent className="p-8">
              <div className="text-center mb-8">
                <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center justify-center gap-2">
                  <Trophy className="w-6 h-6 text-yellow-500" />
                  Achievements Unlocked!
                </h3>
                
                <div className="flex justify-center gap-4 flex-wrap">
                  {earnedBadges.map((badge) => (
                    <div
                      key={badge.name}
                      className="bg-gradient-to-b from-purple-50 to-purple-100 p-4 rounded-xl border border-purple-200 text-center"
                    >
                      <div className="text-4xl mb-2">{badge.icon}</div>
                      <h4 className="font-semibold text-purple-900">{badge.name}</h4>
                      <p className="text-xs text-gray-600">{badge.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gradient-to-r from-purple-50 to-yellow-50 p-6 rounded-xl mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center text-2xl">
                    ⭐
                  </div>
                  <div>
                    <h4 className="font-bold text-purple-900 text-lg">+50 Points Earned!</h4>
                    <p className="text-sm text-gray-600">For completing your onboarding</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600">
                  Keep earning points by attending events, completing challenges, and engaging 
                  with the community. Redeem them for rewards!
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-4 mb-8">
                <div className="bg-white p-4 rounded-xl border border-gray-200">
                  <div className="flex items-center gap-3 mb-2">
                    <Heart className="w-5 h-5 text-pink-500" />
                    <h4 className="font-semibold text-gray-800">Join a Small Group</h4>
                  </div>
                  <p className="text-sm text-gray-600">
                    Connect with others in your area of interest
                  </p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-200">
                  <div className="flex items-center gap-3 mb-2">
                    <Star className="w-5 h-5 text-yellow-500" />
                    <h4 className="font-semibold text-gray-800">Explore Events</h4>
                  </div>
                  <p className="text-sm text-gray-600">
                    Check out upcoming events and RSVP
                  </p>
                </div>
              </div>

              <div className="flex justify-center">
                <Button
                  onClick={handleComplete}
                  disabled={isSaving}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-12 py-6 text-lg rounded-xl shadow-lg"
                >
                  {isSaving ? (
                    'Saving...'
                  ) : (
                    <>
                      Start Exploring <ChevronRight className="w-5 h-5 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
