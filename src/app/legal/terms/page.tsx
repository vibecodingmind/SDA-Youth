import { Metadata } from 'next';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export const metadata: Metadata = {
  title: 'Terms of Service | BUSYBEES SDA Youth Ministry',
  description: 'Terms of Service for the BUSYBEES SDA Youth Ministry platform.',
};

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-yellow-400 rounded-xl flex items-center justify-center text-3xl mx-auto mb-4">
            🐝
          </div>
          <h1 className="text-3xl font-bold text-purple-900">Terms of Service</h1>
          <p className="text-gray-600 mt-2">BUSYBEES SDA Youth Ministry Platform</p>
          <p className="text-sm text-gray-500 mt-1">Last Updated: January 2025</p>
        </div>

        <Card className="shadow-lg border-purple-100">
          <CardHeader className="bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-t-lg">
            <CardTitle className="text-xl">Agreement to Terms</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="text-gray-700 leading-relaxed">
              Welcome to BUSYBEES, the Seventh-day Adventist Youth Ministry platform. By accessing and using this 
              platform, you agree to be bound by these Terms of Service. Our platform is designed to foster spiritual 
              growth, community engagement, and meaningful connections among youth members in a Christ-centered environment.
            </p>
          </CardContent>
        </Card>

        <div className="space-y-6 mt-8">
          {/* Section 1: Account Responsibilities */}
          <Card className="shadow-md border-purple-100">
            <CardHeader>
              <CardTitle className="text-lg text-purple-800">1. Account Responsibilities</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-gray-700">
              <p><strong>Registration:</strong> You must provide accurate and complete information when creating your account. 
              False information may result in account suspension.</p>
              
              <p><strong>Account Security:</strong> You are responsible for maintaining the confidentiality of your login 
              credentials and for all activities under your account.</p>
              
              <p><strong>Age Requirements:</strong> Users must be at least 13 years old. Users under 18 must have 
              parental or guardian consent to use this platform.</p>
              
              <p><strong>Profile Information:</strong> Your profile should reflect your identity within our ministry 
              community. Profile pictures should be appropriate for a church setting.</p>
            </CardContent>
          </Card>

          {/* Section 2: Content Guidelines */}
          <Card className="shadow-md border-purple-100">
            <CardHeader>
              <CardTitle className="text-lg text-purple-800">2. Content Guidelines</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-gray-700">
              <p className="font-medium text-purple-700">As a Christ-centered community, we encourage content that:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Uplifts and encourages spiritual growth</li>
                <li>Promotes meaningful discussion about faith and life</li>
                <li>Shares testimonies of God&apos;s work in your life</li>
                <li>Supports and encourages fellow members</li>
                <li>Provides helpful resources for ministry activities</li>
              </ul>

              <Separator className="my-4" />

              <p className="font-medium text-red-600">The following content is prohibited:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Content that contradicts Seventh-day Adventist beliefs and values</li>
                <li>Harassment, bullying, or disrespectful behavior toward others</li>
                <li>Profanity, inappropriate language, or offensive content</li>
                <li>Spam, advertising, or promotional content without approval</li>
                <li>Personal information of others without their consent</li>
                <li>Content that promotes violence, discrimination, or illegal activities</li>
              </ul>
            </CardContent>
          </Card>

          {/* Section 3: Event Participation */}
          <Card className="shadow-md border-purple-100">
            <CardHeader>
              <CardTitle className="text-lg text-purple-800">3. Event Participation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-gray-700">
              <p><strong>RSVP and Attendance:</strong> When you RSVP for events, please honor your commitment. 
              If your plans change, please update your status promptly.</p>
              
              <p><strong>Check-in System:</strong> Our QR code check-in system helps track attendance for 
              safety and organizational purposes. Points earned are meant to encourage participation, not 
              for competitive purposes.</p>
              
              <p><strong>Event Conduct:</strong> All participants are expected to behave in a manner consistent 
              with Christian values during events, both in-person and virtual.</p>
              
              <p><strong>Photo/Video Release:</strong> By attending events, you acknowledge that photos and 
              videos may be taken for ministry purposes. If you prefer not to be photographed, please inform 
              event organizers.</p>
            </CardContent>
          </Card>

          {/* Section 4: Points and Rewards */}
          <Card className="shadow-md border-purple-100">
            <CardHeader>
              <CardTitle className="text-lg text-purple-800">4. Points, Badges & Rewards</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-gray-700">
              <p><strong>Point System:</strong> Points are awarded for participation, engagement, and 
              achievements within the platform. Points have no monetary value and cannot be transferred.</p>
              
              <p><strong>Badges:</strong> Badges recognize achievements and milestones in your spiritual 
              journey and community involvement.</p>
              
              <p><strong>Rewards Store:</strong> Points may be redeemed for items in our rewards store. 
              Availability is subject to stock and ministry guidelines.</p>
              
              <p><strong>Fair Play:</strong> Attempting to manipulate the point system or create fake 
              accounts for points is prohibited and may result in account suspension.</p>
            </CardContent>
          </Card>

          {/* Section 5: User Conduct */}
          <Card className="shadow-md border-purple-100">
            <CardHeader>
              <CardTitle className="text-lg text-purple-800">5. User Conduct</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-gray-700">
              <p>As members of the BUSYBEES community, we commit to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Treating all members with respect and Christian love</li>
                <li>Respecting the Sabbath (Saturday) as a day of worship and rest</li>
                <li>Supporting the mission and values of the Seventh-day Adventist Church</li>
                <li>Being honest in our interactions and communications</li>
                <li>Reporting inappropriate content or behavior to administrators</li>
                <li>Protecting the privacy of fellow members</li>
              </ul>
            </CardContent>
          </Card>

          {/* Section 6: Intellectual Property */}
          <Card className="shadow-md border-purple-100">
            <CardHeader>
              <CardTitle className="text-lg text-purple-800">6. Intellectual Property</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-gray-700">
              <p><strong>Platform Content:</strong> The BUSYBEES platform, including its design, logos, 
              and original content, is owned by the ministry and protected by intellectual property laws.</p>
              
              <p><strong>User Content:</strong> You retain ownership of content you create and share. 
              By posting content, you grant the ministry a non-exclusive license to use, display, and 
              distribute it for ministry purposes.</p>
              
              <p><strong>Third-Party Content:</strong> When sharing content from other sources, ensure 
              you have the right to share it and provide appropriate attribution.</p>
            </CardContent>
          </Card>

          {/* Section 7: Disclaimers */}
          <Card className="shadow-md border-purple-100">
            <CardHeader>
              <CardTitle className="text-lg text-purple-800">7. Disclaimers</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-gray-700">
              <p><strong>Service Availability:</strong> We strive to maintain platform availability but 
              cannot guarantee uninterrupted access. Maintenance and updates may temporarily affect service.</p>
              
              <p><strong>Content Accuracy:</strong> While we aim for accuracy, user-generated content 
              may not always reflect the views of the ministry or the Seventh-day Adventist Church.</p>
              
              <p><strong>Third-Party Links:</strong> We are not responsible for content on external 
              websites linked from our platform.</p>
              
              <p><strong>Limitation of Liability:</strong> The ministry shall not be liable for any 
              indirect, incidental, or consequential damages arising from platform use.</p>
            </CardContent>
          </Card>

          {/* Section 8: Termination */}
          <Card className="shadow-md border-purple-100">
            <CardHeader>
              <CardTitle className="text-lg text-purple-800">8. Account Termination</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-gray-700">
              <p>Accounts may be suspended or terminated for:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Violation of these Terms of Service</li>
                <li>Behavior inconsistent with Christian values</li>
                <li>Creating fake or misleading accounts</li>
                <li>Harassment or harmful conduct toward others</li>
                <li>Repeated posting of inappropriate content</li>
              </ul>
              <p className="mt-4">You may request account deletion at any time by contacting administrators.</p>
            </CardContent>
          </Card>

          {/* Section 9: Modifications */}
          <Card className="shadow-md border-purple-100">
            <CardHeader>
              <CardTitle className="text-lg text-purple-800">9. Modifications to Terms</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-gray-700">
              <p>We reserve the right to modify these terms at any time. Significant changes will be 
              communicated through the platform. Continued use after modifications constitutes acceptance 
              of the updated terms.</p>
            </CardContent>
          </Card>

          {/* Section 10: Contact */}
          <Card className="shadow-md border-purple-100">
            <CardHeader>
              <CardTitle className="text-lg text-purple-800">10. Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-gray-700">
              <p>For questions about these Terms of Service, please contact:</p>
              <div className="bg-purple-50 p-4 rounded-lg">
                <p><strong>BUSYBEES SDA Youth Ministry</strong></p>
                <p>Email: youthministry@busybees.church</p>
                <p>Phone: Contact your local church office</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer Links */}
        <div className="mt-8 text-center space-x-4 text-sm">
          <Link href="/legal/privacy" className="text-purple-600 hover:underline">Privacy Policy</Link>
          <span className="text-gray-400">|</span>
          <Link href="/legal/cookies" className="text-purple-600 hover:underline">Cookie Policy</Link>
          <span className="text-gray-400">|</span>
          <Link href="/" className="text-purple-600 hover:underline">Back to Home</Link>
        </div>
      </div>
    </div>
  );
}
