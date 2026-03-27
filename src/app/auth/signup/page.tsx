'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function SignUpPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to create account');
      } else {
        router.push('/auth/signin?registered=true');
      }
    } catch {
      setError('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 to-purple-700 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-yellow-400 rounded-xl flex items-center justify-center text-3xl mx-auto mb-4">🐝</div>
          <CardTitle className="text-2xl">Join BUSYBEES</CardTitle>
          <CardDescription>Create your account and start your journey</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            <Input placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} required />
            <Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <Input type="password" placeholder="Password (min 6 characters)" value={password} onChange={(e) => setPassword(e.target.value)} required />
            <Input type="password" placeholder="Confirm Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
            <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700" disabled={loading}>
              {loading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </form>
          <p className="text-center text-sm text-gray-500 mt-4">
            Already have an account?{' '}
            <a href="/auth/signin" className="text-purple-600 hover:underline">Sign in</a>
          </p>
          <p className="text-center text-xs text-gray-400 mt-4">
            By signing up, you&apos;ll receive 50 bonus points! 🎉
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
