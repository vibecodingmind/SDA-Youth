'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Invalid email or password');
      } else {
        router.push('/');
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
          <CardTitle className="text-2xl">Welcome Back</CardTitle>
          <CardDescription>Sign in to your BUSYBEES account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            <Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <Input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
          <div className="mt-4 space-y-2">
            <Button variant="outline" className="w-full" onClick={() => signIn('google')}>
              Continue with Google
            </Button>
          </div>
          <p className="text-center text-sm text-gray-500 mt-4">
            Don&apos;t have an account?{' '}
            <a href="/auth/signup" className="text-purple-600 hover:underline">Sign up</a>
          </p>
          <p className="text-center text-sm text-gray-500 mt-2">
            <a href="/auth/reset-password" className="text-purple-600 hover:underline">Forgot password?</a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
