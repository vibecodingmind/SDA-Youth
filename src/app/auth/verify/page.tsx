'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

function VerifyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [error, setError] = useState('');

  const success = searchParams.get('success');
  const errorParam = searchParams.get('error');
  const emailParam = searchParams.get('email');

  useEffect(() => {
    if (emailParam) {
      setEmail(decodeURIComponent(emailParam));
    }
  }, [emailParam]);

  // If verification was successful
  if (success === 'true') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 to-purple-700 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-green-500 rounded-xl flex items-center justify-center text-3xl mx-auto mb-4">
              ✓
            </div>
            <CardTitle className="text-2xl text-green-600">Email Verified!</CardTitle>
            <CardDescription>Your email has been successfully verified</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 mb-6">
              Thank you for verifying your email address. You can now access all features of BUSYBEES!
            </p>
            <Button
              onClick={() => router.push('/auth/signin')}
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              Continue to Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If there was an error
  if (errorParam) {
    const errorMessages: Record<string, string> = {
      'invalid-token': 'The verification link is invalid. Please request a new one.',
      'token-expired': 'The verification link has expired. Please request a new one.',
      'user-not-found': 'Account not found. Please register again.',
      'verification-failed': 'Verification failed. Please try again.',
    };

    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 to-purple-700 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-red-500 rounded-xl flex items-center justify-center text-3xl mx-auto mb-4">
              ✗
            </div>
            <CardTitle className="text-2xl text-red-600">Verification Failed</CardTitle>
            <CardDescription>There was a problem verifying your email</CardDescription>
          </CardHeader>
          <CardContent>
            <Alert className="mb-4 border-red-200 bg-red-50">
              <AlertDescription className="text-red-700">
                {errorMessages[errorParam] || 'An unknown error occurred.'}
              </AlertDescription>
            </Alert>
            <p className="text-gray-600 text-sm mb-4">
              Enter your email below to receive a new verification link.
            </p>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setLoading(true);
                setError('');
                setResendSuccess(false);

                try {
                  const response = await fetch('/api/auth/verify-email', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email }),
                  });

                  const data = await response.json();

                  if (response.ok) {
                    setResendSuccess(true);
                  } else {
                    setError(data.error || 'Failed to send verification email');
                  }
                } catch {
                  setError('An error occurred. Please try again.');
                } finally {
                  setLoading(false);
                }
              }}
              className="space-y-4"
            >
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700" disabled={loading}>
                {loading ? 'Sending...' : 'Resend Verification Email'}
              </Button>
            </form>
            {resendSuccess && (
              <Alert className="mt-4 border-green-200 bg-green-50">
                <AlertDescription className="text-green-700">
                  If an account with that email exists, a new verification email has been sent.
                </AlertDescription>
              </Alert>
            )}
            <p className="text-center text-sm text-gray-500 mt-4">
              <a href="/auth/signin" className="text-purple-600 hover:underline">
                Back to Sign In
              </a>
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Default state - check your email
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 to-purple-700 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-yellow-400 rounded-xl flex items-center justify-center text-3xl mx-auto mb-4">
            📧
          </div>
          <CardTitle className="text-2xl">Check Your Email</CardTitle>
          <CardDescription>We&apos;ve sent you a verification link</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 text-center mb-6">
            Please check your email inbox and click the verification link to activate your account.
            The link will expire in 24 hours.
          </p>

          {error && (
            <Alert className="mb-4 border-red-200 bg-red-50">
              <AlertDescription className="text-red-700">{error}</AlertDescription>
            </Alert>
          )}

          {resendSuccess && (
            <Alert className="mb-4 border-green-200 bg-green-50">
              <AlertDescription className="text-green-700">
                If an account with that email exists, a new verification email has been sent.
              </AlertDescription>
            </Alert>
          )}

          <div className="border-t pt-4 mt-4">
            <p className="text-sm text-gray-500 text-center mb-4">
              Didn&apos;t receive the email? Enter your email to resend:
            </p>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setLoading(true);
                setError('');
                setResendSuccess(false);

                try {
                  const response = await fetch('/api/auth/verify-email', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email }),
                  });

                  const data = await response.json();

                  if (response.ok) {
                    setResendSuccess(true);
                  } else {
                    setError(data.error || 'Failed to send verification email');
                  }
                } catch {
                  setError('An error occurred. Please try again.');
                } finally {
                  setLoading(false);
                }
              }}
              className="space-y-4"
            >
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700" disabled={loading}>
                {loading ? 'Sending...' : 'Resend Verification Email'}
              </Button>
            </form>
          </div>

          <p className="text-center text-sm text-gray-500 mt-4">
            <a href="/auth/signin" className="text-purple-600 hover:underline">
              Back to Sign In
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 to-purple-700 p-4">
          <div className="animate-pulse text-white">Loading...</div>
        </div>
      }
    >
      <VerifyContent />
    </Suspense>
  );
}
