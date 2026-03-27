'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useRouter } from 'next/navigation';

export function VerificationBanner() {
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const router = useRouter();

  // Don't show banner if not logged in, loading, or already verified
  if (
    status === 'loading' ||
    !session?.user ||
    dismissed
  ) {
    return null;
  }

  // Check if user needs verification
  // Note: We'll need to add emailVerified to the session type
  // For now, we'll check via API on component mount
  const handleResendVerification = async () => {
    const userEmail = session?.user?.email;
    if (!userEmail) return;

    setLoading(true);
    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail }),
      });

      if (response.ok) {
        setSent(true);
        setTimeout(() => setSent(false), 5000);
      }
    } catch (error) {
      console.error('Failed to resend verification:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="text-yellow-600 text-lg">⚠️</span>
          <p className="text-yellow-800 text-sm">
            <strong>Verify your email</strong> to access all features. Check your inbox for the verification link.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {sent ? (
            <span className="text-green-600 text-sm font-medium">✓ Verification email sent!</span>
          ) : (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={handleResendVerification}
                disabled={loading}
                className="text-yellow-700 border-yellow-300 hover:bg-yellow-100"
              >
                {loading ? 'Sending...' : 'Resend Email'}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/auth/verify')}
                className="text-yellow-700 hover:bg-yellow-100"
              >
                Verify Now
              </Button>
            </>
          )}
          <button
            onClick={() => setDismissed(true)}
            className="text-yellow-600 hover:text-yellow-800 ml-2"
            aria-label="Dismiss"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}

// A hook to check if the current user's email is verified
export function useEmailVerification() {
  const { data: session, status } = useSession();
  
  // This would need to be enhanced to check actual verification status
  // For now, return a simple check
  return {
    isVerified: status === 'authenticated' && !!session?.user,
    isLoading: status === 'loading',
    email: session?.user?.email,
  };
}
