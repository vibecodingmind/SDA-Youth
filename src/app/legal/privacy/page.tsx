import { Metadata } from 'next';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

export const metadata: Metadata = {
  title: 'Privacy Policy | BUSYBEES SDA Youth Ministry',
  description: 'Privacy Policy for the BUSYBEES SDA Youth Ministry platform - How we collect, use, and protect your data.',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-yellow-400 rounded-xl flex items-center justify-center text-3xl mx-auto mb-4">
            🐝
          </div>
          <h1 className="text-3xl font-bold text-purple-900">Privacy Policy</h1>
          <p className="text-gray-600 mt-2">BUSYBEES SDA Youth Ministry Platform</p>
          <p className="text-sm text-gray-500 mt-1">Last Updated: January 2025</p>
        </div>

        {/* Compliance Badges */}
        <div className="flex justify-center gap-2 mb-8">
          <Badge variant="secondary" className="bg-green-100 text-green-700">GDPR Compliant</Badge>
          <Badge variant="secondary" className="bg-blue-100 text-blue-700">CCPA Compliant</Badge>
        </div>

        <Card className="shadow-lg border-purple-100">
          <CardHeader className="bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-t-lg">
            <CardTitle className="text-xl">Our Commitment to Your Privacy</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="text-gray-700 leading-relaxed">
              At BUSYBEES SDA Youth Ministry, we are committed to protecting your privacy and ensuring 
              the security of your personal information. This policy explains how we collect, use, store, 
              and protect your data in accordance with the General Data Protection Regulation (GDPR) and 
              the California Consumer Privacy Act (CCPA).
            </p>
          </CardContent>
        </Card>

        <div className="space-y-6 mt-8">
          {/* Section 1: Information We Collect */}
          <Card className="shadow-md border-purple-100">
            <CardHeader>
              <CardTitle className="text-lg text-purple-800">1. Information We Collect</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-gray-700">
              <p className="font-medium text-purple-700">Personal Information:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Account Information:</strong> Name, email address, phone number (optional), date of birth</li>
                <li><strong>Profile Information:</strong> Profile photo, bio, interests, ministry involvement</li>
                <li><strong>Authentication Data:</strong> Login credentials, password (encrypted)</li>
              </ul>

              <Separator className="my-4" />

              <p className="font-medium text-purple-700">Activity Data:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Event Participation:</strong> RSVPs, check-ins, attendance records</li>
                <li><strong>Engagement Metrics:</strong> Points earned, badges achieved, challenges completed</li>
                <li><strong>Content Interactions:</strong> Posts, comments, prayer requests, forum activity</li>
                <li><strong>Communication:</strong> Messages sent, chat room participation</li>
              </ul>

              <Separator className="my-4" />

              <p className="font-medium text-purple-700">Technical Data:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Device Information:</strong> Browser type, operating system, device type</li>
                <li><strong>Usage Data:</strong> Pages visited, features used, session duration</li>
                <li><strong>IP Address:</strong> For security and analytics purposes</li>
              </ul>
            </CardContent>
          </Card>

          {/* Section 2: How We Use Your Data */}
          <Card className="shadow-md border-purple-100">
            <CardHeader>
              <CardTitle className="text-lg text-purple-800">2. How We Use Your Data</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-gray-700">
              <p>We use your information to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Provide Services:</strong> Create and manage your account, display your profile</li>
                <li><strong>Event Management:</strong> Process RSVPs, track attendance, send event reminders</li>
                <li><strong>Gamification:</strong> Award points, badges, and rewards for participation</li>
                <li><strong>Communication:</strong> Send notifications, updates, and ministry communications</li>
                <li><strong>Community Features:</strong> Enable chat, prayer wall, forums, and group interactions</li>
                <li><strong>Improvement:</strong> Analyze usage patterns to improve the platform</li>
                <li><strong>Security:</strong> Protect against unauthorized access and misuse</li>
                <li><strong>Compliance:</strong> Meet legal and regulatory requirements</li>
              </ul>

              <div className="bg-purple-50 p-4 rounded-lg mt-4">
                <p className="text-sm text-purple-700">
                  <strong>Note:</strong> We do not sell your personal information to third parties. 
                  Your data is used solely for ministry purposes and platform functionality.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Section 3: Third-Party Services */}
          <Card className="shadow-md border-purple-100">
            <CardHeader>
              <CardTitle className="text-lg text-purple-800">3. Third-Party Services</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-gray-700">
              <p>We use the following third-party services that may process your data:</p>

              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="font-medium">Google OAuth</p>
                  <p className="text-sm text-gray-600">Used for optional single sign-on authentication. 
                  Google receives your email address and basic profile information when you choose to sign in with Google.</p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="font-medium">NextAuth.js</p>
                  <p className="text-sm text-gray-600">Handles authentication sessions securely. 
                  Authentication tokens are stored in secure, encrypted cookies.</p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="font-medium">Email Service (Resend)</p>
                  <p className="text-sm text-gray-600">Used to send event reminders, notifications, 
                  and ministry communications. Email addresses are only used for platform communications.</p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="font-medium">Analytics Services</p>
                  <p className="text-sm text-gray-600">We may use analytics tools to understand platform usage. 
                  Data is anonymized where possible.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 4: Data Storage & Security */}
          <Card className="shadow-md border-purple-100">
            <CardHeader>
              <CardTitle className="text-lg text-purple-800">4. Data Storage & Security</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-gray-700">
              <p><strong>Data Storage:</strong> Your data is stored securely in our database. 
              We implement industry-standard security measures including:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Encryption of sensitive data (passwords are hashed and salted)</li>
                <li>HTTPS encryption for all data transmission</li>
                <li>Regular security updates and patches</li>
                <li>Access controls limiting who can view personal data</li>
                <li>Regular backups to prevent data loss</li>
              </ul>

              <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg mt-4">
                <p className="text-sm text-yellow-700">
                  <strong>Important:</strong> While we take security seriously, no system is 100% secure. 
                  Please protect your account with a strong password and enable two-factor authentication 
                  when available.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Section 5: Data Retention */}
          <Card className="shadow-md border-purple-100">
            <CardHeader>
              <CardTitle className="text-lg text-purple-800">5. Data Retention</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-gray-700">
              <p>We retain your data for as long as your account is active or as needed to provide services. 
              Specifically:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Account Data:</strong> Retained until account deletion is requested</li>
                <li><strong>Activity Logs:</strong> Retained for up to 2 years for analytics and security</li>
                <li><strong>Messages:</strong> Retained for the duration of relevant conversations</li>
                <li><strong>Event Records:</strong> Retained for historical tracking and certificates</li>
              </ul>
              <p className="mt-4">Upon account deletion request, we will remove or anonymize your personal 
              information within 30 days, except where retention is required by law.</p>
            </CardContent>
          </Card>

          {/* Section 6: Your Rights */}
          <Card className="shadow-md border-purple-100">
            <CardHeader>
              <CardTitle className="text-lg text-purple-800">6. Your Rights (GDPR & CCPA)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-gray-700">
              <p>Under GDPR and CCPA, you have the following rights:</p>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="font-medium text-green-700">Right to Access</p>
                  <p className="text-sm text-gray-600">Request a copy of your personal data</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="font-medium text-blue-700">Right to Rectification</p>
                  <p className="text-sm text-gray-600">Request correction of inaccurate data</p>
                </div>
                <div className="bg-red-50 p-4 rounded-lg">
                  <p className="font-medium text-red-700">Right to Erasure</p>
                  <p className="text-sm text-gray-600">Request deletion of your data</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <p className="font-medium text-purple-700">Right to Portability</p>
                  <p className="text-sm text-gray-600">Receive your data in a portable format</p>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg">
                  <p className="font-medium text-orange-700">Right to Restrict Processing</p>
                  <p className="text-sm text-gray-600">Limit how your data is processed</p>
                </div>
                <div className="bg-teal-50 p-4 rounded-lg">
                  <p className="font-medium text-teal-700">Right to Object</p>
                  <p className="text-sm text-gray-600">Object to certain processing activities</p>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg mt-4">
                <p className="font-medium">How to Exercise Your Rights:</p>
                <p className="text-sm mt-2">Contact us at <strong>youthministry@busybees.church</strong> with 
                your request. We will respond within 30 days. Please include your account email for verification.</p>
              </div>
            </CardContent>
          </Card>

          {/* Section 7: Children's Privacy */}
          <Card className="shadow-md border-purple-100">
            <CardHeader>
              <CardTitle className="text-lg text-purple-800">7. Children&apos;s Privacy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-gray-700">
              <p>Our platform is designed for youth ministry, and we take special care to protect young users:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Users under 13 require parental consent to create an account</li>
                <li>Parental email addresses may be collected for users under 18</li>
                <li>We do not display personal information publicly to other users without consent</li>
                <li>Content moderation is in place to protect young users</li>
                <li>Parents may request access to or deletion of their child&apos;s data</li>
              </ul>
            </CardContent>
          </Card>

          {/* Section 8: Cookies */}
          <Card className="shadow-md border-purple-100">
            <CardHeader>
              <CardTitle className="text-lg text-purple-800">8. Cookies & Tracking</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-gray-700">
              <p>We use cookies and similar technologies for:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Authentication and session management</li>
                <li>Remembering your preferences</li>
                <li>Analytics and platform improvement</li>
              </ul>
              <p className="mt-4">
                For detailed information about cookies we use, please see our{' '}
                <Link href="/legal/cookies" className="text-purple-600 hover:underline">Cookie Policy</Link>.
              </p>
            </CardContent>
          </Card>

          {/* Section 9: Updates & Contact */}
          <Card className="shadow-md border-purple-100">
            <CardHeader>
              <CardTitle className="text-lg text-purple-800">9. Policy Updates & Contact</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-gray-700">
              <p>We may update this privacy policy from time to time. Significant changes will be communicated 
              through the platform. We encourage you to review this policy periodically.</p>

              <div className="bg-purple-50 p-4 rounded-lg mt-4">
                <p className="font-medium">Contact Us:</p>
                <p className="text-sm mt-2"><strong>BUSYBEES SDA Youth Ministry</strong></p>
                <p className="text-sm">Email: youthministry@busybees.church</p>
                <p className="text-sm">For privacy-specific inquiries: privacy@busybees.church</p>
              </div>

              <p className="text-sm text-gray-500 mt-4">
                If you believe we have violated your privacy rights, you may file a complaint with your 
                local data protection authority.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Footer Links */}
        <div className="mt-8 text-center space-x-4 text-sm">
          <Link href="/legal/terms" className="text-purple-600 hover:underline">Terms of Service</Link>
          <span className="text-gray-400">|</span>
          <Link href="/legal/cookies" className="text-purple-600 hover:underline">Cookie Policy</Link>
          <span className="text-gray-400">|</span>
          <Link href="/" className="text-purple-600 hover:underline">Back to Home</Link>
        </div>
      </div>
    </div>
  );
}
