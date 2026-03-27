'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Cookie, Settings, X } from 'lucide-react';

type CookiePreferences = {
  essential: boolean;
  functional: boolean;
  analytics: boolean;
};

const COOKIE_CONSENT_KEY = 'busybees-cookie-consent';

export function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);
  const [showCustomize, setShowCustomize] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    essential: true, // Always true, cannot be disabled
    functional: true,
    analytics: true,
  });

  useEffect(() => {
    // Check if user has already made a choice
    const storedConsent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!storedConsent) {
      // Small delay to prevent flash on page load
      const timer = setTimeout(() => setShowBanner(true), 500);
      return () => clearTimeout(timer);
    } else {
      try {
        const parsed = JSON.parse(storedConsent);
        setPreferences(parsed);
      } catch {
        // Invalid stored consent, show banner
        setShowBanner(true);
      }
    }
  }, []);

  const savePreferences = (prefs: CookiePreferences) => {
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(prefs));
    setPreferences(prefs);
    setShowBanner(false);
    setShowCustomize(false);
    
    // Apply preferences (in a real app, this would enable/disable tracking scripts)
    if (prefs.analytics) {
      // Enable analytics
      console.log('Analytics cookies enabled');
    } else {
      // Disable analytics
      console.log('Analytics cookies disabled');
    }
  };

  const handleAcceptAll = () => {
    savePreferences({
      essential: true,
      functional: true,
      analytics: true,
    });
  };

  const handleDeclineNonEssential = () => {
    savePreferences({
      essential: true,
      functional: false,
      analytics: false,
    });
  };

  const handleSavePreferences = () => {
    savePreferences(preferences);
  };

  const handleToggle = (key: 'functional' | 'analytics') => {
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-in slide-in-from-bottom-4 duration-500">
      <Card className="max-w-4xl mx-auto shadow-2xl border-purple-200 bg-white/95 backdrop-blur-sm">
        <CardContent className="p-4 sm:p-6">
          {!showCustomize ? (
            // Main Banner
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="flex items-start gap-3 flex-1">
                <div className="w-10 h-10 bg-yellow-400 rounded-lg flex items-center justify-center text-xl shrink-0">
                  <Cookie className="w-5 h-5 text-yellow-900" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">We use cookies</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    We use cookies to enhance your experience, remember your preferences, and analyze 
                    platform usage. By clicking &quot;Accept All&quot;, you consent to our use of cookies.{' '}
                    <Link href="/legal/cookies" className="text-purple-600 hover:underline">
                      Learn more
                    </Link>
                  </p>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2 sm:shrink-0 w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowCustomize(true)}
                  className="flex items-center gap-1"
                >
                  <Settings className="w-4 h-4" />
                  Customize
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDeclineNonEssential}
                  className="text-gray-600"
                >
                  Decline Non-Essential
                </Button>
                <Button
                  size="sm"
                  onClick={handleAcceptAll}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  Accept All
                </Button>
              </div>
            </div>
          ) : (
            // Customize Panel
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Cookie Preferences
                </h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowBanner(false)}
                  className="h-8 w-8"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="space-y-3">
                {/* Essential Cookies */}
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <Checkbox 
                    id="essential" 
                    checked={true} 
                    disabled 
                    className="mt-0.5"
                  />
                  <div className="flex-1">
                    <Label htmlFor="essential" className="font-medium cursor-default">
                      Essential Cookies
                      <span className="ml-2 text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">
                        Required
                      </span>
                    </Label>
                    <p className="text-sm text-gray-600 mt-1">
                      These cookies are necessary for the platform to function. They enable login, 
                      security features, and basic functionality.
                    </p>
                  </div>
                </div>

                {/* Functional Cookies */}
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <Checkbox 
                    id="functional"
                    checked={preferences.functional}
                    onCheckedChange={() => handleToggle('functional')}
                    className="mt-0.5"
                  />
                  <div className="flex-1">
                    <Label htmlFor="functional" className="font-medium cursor-pointer">
                      Functional Cookies
                    </Label>
                    <p className="text-sm text-gray-600 mt-1">
                      These cookies remember your preferences like theme settings and sidebar state 
                      to enhance your experience.
                    </p>
                  </div>
                </div>

                {/* Analytics Cookies */}
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <Checkbox 
                    id="analytics"
                    checked={preferences.analytics}
                    onCheckedChange={() => handleToggle('analytics')}
                    className="mt-0.5"
                  />
                  <div className="flex-1">
                    <Label htmlFor="analytics" className="font-medium cursor-pointer">
                      Analytics Cookies
                    </Label>
                    <p className="text-sm text-gray-600 mt-1">
                      These cookies help us understand how you use the platform so we can improve 
                      it. Data is anonymized where possible.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center pt-2">
                <Link 
                  href="/legal/cookies" 
                  className="text-sm text-purple-600 hover:underline"
                >
                  View full Cookie Policy
                </Link>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowCustomize(false)}
                  >
                    Back
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSavePreferences}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    Save Preferences
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
