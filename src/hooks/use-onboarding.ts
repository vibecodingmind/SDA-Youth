'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';

interface OnboardingStatus {
  isLoading: boolean;
  needsOnboarding: boolean;
  onboardingCompleted: boolean;
  onboardingStep: number;
}

/**
 * Hook to detect first-time users and manage onboarding flow
 */
export function useOnboarding(): OnboardingStatus {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [state, setState] = useState<OnboardingStatus>({
    isLoading: true,
    needsOnboarding: false,
    onboardingCompleted: false,
    onboardingStep: 0,
  });

  const checkOnboardingStatus = useCallback(async () => {
    if (status === 'loading') return;
    
    if (status === 'unauthenticated') {
      setState((prev) => ({ ...prev, isLoading: false }));
      return;
    }

    // Don't redirect if already on onboarding page
    if (pathname === '/onboarding') {
      setState((prev) => ({ ...prev, isLoading: false }));
      return;
    }

    try {
      const response = await fetch('/api/onboarding');
      if (response.ok) {
        const data = await response.json();
        const user = data.user;

        setState({
          isLoading: false,
          needsOnboarding: !user?.onboardingCompleted,
          onboardingCompleted: user?.onboardingCompleted ?? false,
          onboardingStep: user?.onboardingStep ?? 0,
        });

        // Redirect to onboarding if not completed
        if (!user?.onboardingCompleted && pathname !== '/onboarding') {
          router.push('/onboarding');
        }
      } else {
        setState((prev) => ({ ...prev, isLoading: false }));
      }
    } catch (error) {
      console.error('Failed to check onboarding status:', error);
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  }, [status, pathname, router]);

  useEffect(() => {
    checkOnboardingStatus();
  }, [checkOnboardingStatus]);

  return state;
}

/**
 * Hook to redirect first-time users to onboarding
 * Call this in layout or protected pages
 */
export function useRequireOnboarding(): void {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const checkAndRedirect = async () => {
      if (status === 'loading') return;
      
      if (status === 'unauthenticated') {
        return;
      }

      // Skip if already on auth pages or onboarding
      const skipPaths = ['/onboarding', '/auth/signin', '/auth/signup', '/auth/reset-password'];
      if (skipPaths.some(path => pathname?.startsWith(path))) {
        return;
      }

      try {
        const response = await fetch('/api/onboarding');
        if (response.ok) {
          const data = await response.json();
          
          if (!data.user?.onboardingCompleted) {
            router.push('/onboarding');
          }
        }
      } catch (error) {
        console.error('Failed to check onboarding:', error);
      }
    };

    checkAndRedirect();
  }, [status, pathname, router]);
}

/**
 * Hook to manage onboarding progress
 */
export function useOnboardingProgress() {
  const [isSaving, setIsSaving] = useState(false);

  const saveProgress = useCallback(async (
    step: number,
    data: {
      name?: string;
      image?: string;
      phone?: string;
      bio?: string;
      timezone?: string;
      interests?: {
        eventCategories: string[];
        smallGroups: string[];
        servingAreas: string[];
      };
      notificationPrefs?: Record<string, boolean>;
      completed?: boolean;
    }
  ) => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ step, ...data }),
      });

      if (!response.ok) {
        throw new Error('Failed to save progress');
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to save onboarding progress:', error);
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, []);

  return { saveProgress, isSaving };
}

export default useOnboarding;
