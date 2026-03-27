import { Metadata } from 'next';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'Cookie Policy | BUSYBEES SDA Youth Ministry',
  description: 'Cookie Policy for the BUSYBEES SDA Youth Ministry platform - Learn about how we use cookies.',
};

export default function CookiePolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-yellow-400 rounded-xl flex items-center justify-center text-3xl mx-auto mb-4">
            🍪
          </div>
          <h1 className="text-3xl font-bold text-purple-900">Cookie Policy</h1>
          <p className="text-gray-600 mt-2">BUSYBEES SDA Youth Ministry Platform</p>
          <p className="text-sm text-gray-500 mt-1">Last Updated: January 2025</p>
        </div>

        <Card className="shadow-lg border-purple-100">
          <CardHeader className="bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-t-lg">
            <CardTitle className="text-xl">What Are Cookies?</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="text-gray-700 leading-relaxed">
              Cookies are small text files that are stored on your device when you visit a website. 
              They help us provide you with a better experience by remembering your preferences, 
              keeping you signed in, and understanding how you use our platform. This policy explains 
              the cookies we use and how you can manage them.
            </p>
          </CardContent>
        </Card>

        <div className="space-y-6 mt-8">
          {/* Cookie Types */}
          <Card className="shadow-md border-purple-100">
            <CardHeader>
              <CardTitle className="text-lg text-purple-800">Types of Cookies We Use</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Essential Cookies */}
              <div className="border-l-4 border-red-500 pl-4">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold text-gray-800">Essential Cookies</h3>
                  <Badge variant="secondary" className="bg-red-100 text-red-700">Required</Badge>
                </div>
                <p className="text-gray-600 text-sm mb-3">
                  These cookies are necessary for the platform to function properly. They cannot be disabled.
                </p>
                <div className="bg-gray-50 p-3 rounded-lg space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="font-medium">next-auth.session-token</span>
                    <span className="text-gray-500">Session</span>
                  </div>
                  <p className="text-gray-500">Maintains your login session. Deleted when you log out.</p>
                  
                  <div className="flex justify-between mt-3">
                    <span className="font-medium">next-auth.csrf-token</span>
                    <span className="text-gray-500">Session</span>
                  </div>
                  <p className="text-gray-500">Protects against Cross-Site Request Forgery (CSRF) attacks.</p>
                  
                  <div className="flex justify-between mt-3">
                    <span className="font-medium">next-auth.callback-url</span>
                    <span className="text-gray-500">Session</span>
                  </div>
                  <p className="text-gray-500">Remembers where to redirect after authentication.</p>
                </div>
              </div>

              {/* Functional Cookies */}
              <div className="border-l-4 border-blue-500 pl-4">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold text-gray-800">Functional Cookies</h3>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-700">Optional</Badge>
                </div>
                <p className="text-gray-600 text-sm mb-3">
                  These cookies remember your preferences and settings to enhance your experience.
                </p>
                <div className="bg-gray-50 p-3 rounded-lg space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="font-medium">theme-preference</span>
                    <span className="text-gray-500">1 year</span>
                  </div>
                  <p className="text-gray-500">Remembers your dark/light mode preference.</p>
                  
                  <div className="flex justify-between mt-3">
                    <span className="font-medium">cookie-consent</span>
                    <span className="text-gray-500">1 year</span>
                  </div>
                  <p className="text-gray-500">Stores your cookie consent preferences.</p>
                  
                  <div className="flex justify-between mt-3">
                    <span className="font-medium">sidebar-state</span>
                    <span className="text-gray-500">Session</span>
                  </div>
                  <p className="text-gray-500">Remembers if your sidebar is collapsed or expanded.</p>
                </div>
              </div>

              {/* Analytics Cookies */}
              <div className="border-l-4 border-green-500 pl-4">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold text-gray-800">Analytics Cookies</h3>
                  <Badge variant="secondary" className="bg-green-100 text-green-700">Optional</Badge>
                </div>
                <p className="text-gray-600 text-sm mb-3">
                  These cookies help us understand how visitors interact with our platform so we can improve it.
                </p>
                <div className="bg-gray-50 p-3 rounded-lg space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="font-medium">_ga</span>
                    <span className="text-gray-500">2 years</span>
                  </div>
                  <p className="text-gray-500">Google Analytics - Distinguishes unique users.</p>
                  
                  <div className="flex justify-between mt-3">
                    <span className="font-medium">_gid</span>
                    <span className="text-gray-500">24 hours</span>
                  </div>
                  <p className="text-gray-500">Google Analytics - Distinguishes users between pages.</p>
                  
                  <div className="flex justify-between mt-3">
                    <span className="font-medium">_gat</span>
                    <span className="text-gray-500">1 minute</span>
                  </div>
                  <p className="text-gray-500">Google Analytics - Throttles request rate.</p>
                </div>
              </div>

              {/* Security Cookies */}
              <div className="border-l-4 border-purple-500 pl-4">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold text-gray-800">Security Cookies</h3>
                  <Badge variant="secondary" className="bg-purple-100 text-purple-700">Required</Badge>
                </div>
                <p className="text-gray-600 text-sm mb-3">
                  These cookies help protect your account and our platform from security threats.
                </p>
                <div className="bg-gray-50 p-3 rounded-lg space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="font-medium">__Secure-next-auth.session-token</span>
                    <span className="text-gray-500">Session</span>
                  </div>
                  <p className="text-gray-500">Secure version of session token for HTTPS connections.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cookie Duration */}
          <Card className="shadow-md border-purple-100">
            <CardHeader>
              <CardTitle className="text-lg text-purple-800">Cookie Duration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-800">Session Cookies</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    These are temporary cookies that are deleted when you close your browser or log out.
                    They are used to maintain your session while you&apos;re actively using the platform.
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-800">Persistent Cookies</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    These cookies remain on your device for a set period or until you manually delete them.
                    They remember your preferences across sessions.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Managing Cookies */}
          <Card className="shadow-md border-purple-100">
            <CardHeader>
              <CardTitle className="text-lg text-purple-800">How to Manage Cookies</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                You have several options for managing cookies:
              </p>

              <div className="space-y-4">
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h4 className="font-medium text-purple-800">Through Our Platform</h4>
                  <p className="text-sm text-gray-600 mt-1 mb-3">
                    When you first visit our platform, you&apos;ll see a cookie consent banner where you can:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" className="bg-green-600 hover:bg-green-700">Accept All</Button>
                    <Button size="sm" variant="outline" className="border-red-300 text-red-600">Decline Non-Essential</Button>
                    <Button size="sm" variant="secondary">Customize</Button>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-800">Through Your Browser</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Most browsers allow you to view, delete, or block cookies. Here&apos;s how:
                  </p>
                  <ul className="list-disc pl-6 text-sm text-gray-600 mt-2 space-y-1">
                    <li><strong>Chrome:</strong> Settings → Privacy and security → Cookies</li>
                    <li><strong>Firefox:</strong> Settings → Privacy & Security → Cookies</li>
                    <li><strong>Safari:</strong> Preferences → Privacy → Manage Website Data</li>
                    <li><strong>Edge:</strong> Settings → Cookies and site permissions</li>
                  </ul>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                  <h4 className="font-medium text-yellow-800">Important Note</h4>
                  <p className="text-sm text-yellow-700 mt-1">
                    Blocking essential cookies may prevent the platform from functioning correctly. 
                    You may not be able to log in or use certain features if essential cookies are disabled.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Third-Party Cookies */}
          <Card className="shadow-md border-purple-100">
            <CardHeader>
              <CardTitle className="text-lg text-purple-800">Third-Party Cookies</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                Some cookies may be set by third-party services we use:
              </p>

              <div className="space-y-3">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Google (OAuth & Analytics)</span>
                    <Badge variant="outline" className="text-xs">Third-party</Badge>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    When you sign in with Google, Google may set cookies. Google Analytics cookies 
                    help us understand platform usage. See{' '}
                    <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" 
                       className="text-purple-600 hover:underline">
                      Google&apos;s Privacy Policy
                    </a>.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Updates & Contact */}
          <Card className="shadow-md border-purple-100">
            <CardHeader>
              <CardTitle className="text-lg text-purple-800">Policy Updates & Contact</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                We may update this cookie policy from time to time. Significant changes will be 
                communicated through the platform. The &quot;Last Updated&quot; date at the top indicates 
                when this policy was last revised.
              </p>

              <div className="bg-purple-50 p-4 rounded-lg">
                <p className="font-medium">Questions about Cookies?</p>
                <p className="text-sm mt-2"><strong>BUSYBEES SDA Youth Ministry</strong></p>
                <p className="text-sm">Email: youthministry@busybees.church</p>
                <p className="text-sm">For privacy-specific inquiries: privacy@busybees.church</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer Links */}
        <div className="mt-8 text-center space-x-4 text-sm">
          <Link href="/legal/terms" className="text-purple-600 hover:underline">Terms of Service</Link>
          <span className="text-gray-400">|</span>
          <Link href="/legal/privacy" className="text-purple-600 hover:underline">Privacy Policy</Link>
          <span className="text-gray-400">|</span>
          <Link href="/" className="text-purple-600 hover:underline">Back to Home</Link>
        </div>
      </div>
    </div>
  );
}
