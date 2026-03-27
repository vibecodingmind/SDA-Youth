'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { db } from '@/lib/db';

export default function SetupPage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [setupComplete, setSetupComplete] = useState(false);
  
  // Form data
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [churchName, setChurchName] = useState('BUSYBEES SDA Youth Ministry');
  const [churchAddress, setChurchAddress] = useState('');

  useEffect(() => {
    // Check if setup is already complete
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data.settings?.setup_complete === 'true') {
          setSetupComplete(true);
        }
      })
      .catch(() => {});
  }, []);

  const handleCreateAdmin = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: adminName,
          email: adminEmail,
          password: adminPassword,
        }),
      });

      if (response.ok) {
        // Set user as admin
        const userData = await response.json();
        await fetch('/api/admin/users/' + userData.user.id, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ role: 'admin' }),
        });
        setStep(2);
      }
    } catch (error) {
      console.error('Failed to create admin:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    setLoading(true);
    try {
      await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify([
          { key: 'church_name', value: churchName },
          { key: 'church_address', value: churchAddress },
          { key: 'setup_complete', value: 'true' },
        ]),
      });
      setStep(3);
    } catch (error) {
      console.error('Failed to save settings:', error);
    } finally {
      setLoading(false);
    }
  };

  if (setupComplete) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 to-purple-700 p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <div className="text-5xl mb-4">✅</div>
            <CardTitle>Setup Complete!</CardTitle>
            <CardDescription>Your platform is ready to use</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full bg-purple-600 hover:bg-purple-700" asChild>
              <a href="/auth/signin">Go to Login</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 to-purple-700 p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-yellow-400 rounded-xl flex items-center justify-center text-3xl mx-auto mb-4">🐝</div>
          <CardTitle>Welcome to BUSYBEES</CardTitle>
          <CardDescription>Let&apos;s set up your youth ministry platform</CardDescription>
          <Progress value={(step / 3) * 100} className="mt-4" />
        </CardHeader>
        <CardContent>
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Step 1: Create Admin Account</h3>
              <Input placeholder="Admin Name" value={adminName} onChange={(e) => setAdminName(e.target.value)} />
              <Input type="email" placeholder="Admin Email" value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} />
              <Input type="password" placeholder="Password" value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} />
              <Button className="w-full bg-purple-600 hover:bg-purple-700" onClick={handleCreateAdmin} disabled={loading || !adminName || !adminEmail || !adminPassword}>
                {loading ? 'Creating...' : 'Continue'}
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Step 2: Organization Details</h3>
              <Input placeholder="Organization Name" value={churchName} onChange={(e) => setChurchName(e.target.value)} />
              <Input placeholder="Address (optional)" value={churchAddress} onChange={(e) => setChurchAddress(e.target.value)} />
              <Button className="w-full bg-purple-600 hover:bg-purple-700" onClick={handleSaveSettings} disabled={loading}>
                {loading ? 'Saving...' : 'Continue'}
              </Button>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4 text-center">
              <div className="text-5xl">🎉</div>
              <h3 className="font-semibold text-lg">You&apos;re All Set!</h3>
              <p className="text-gray-500">Your platform has been configured. You can now start using BUSYBEES.</p>
              <Button className="w-full bg-purple-600 hover:bg-purple-700" asChild>
                <a href="/auth/signin">Start Using BUSYBEES</a>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
