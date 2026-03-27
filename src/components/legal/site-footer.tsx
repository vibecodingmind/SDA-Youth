import Link from 'next/link';
import { Separator } from '@/components/ui/separator';

export function SiteFooter() {
  return (
    <footer className="bg-gradient-to-r from-purple-900 to-purple-800 text-white py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand Section */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-yellow-400 rounded-lg flex items-center justify-center text-lg">
                🐝
              </div>
              <span className="font-bold text-lg">BUSYBEES</span>
            </div>
            <p className="text-sm text-purple-200">
              SDA Youth Ministry Platform - Empowering young people to grow in faith, 
              serve with love, and connect in community.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-3">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="text-purple-200 hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/auth/signin" className="text-purple-200 hover:text-white transition-colors">
                  Sign In
                </Link>
              </li>
              <li>
                <Link href="/auth/signup" className="text-purple-200 hover:text-white transition-colors">
                  Join Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="font-semibold mb-3">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/legal/terms" className="text-purple-200 hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/legal/privacy" className="text-purple-200 hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/legal/cookies" className="text-purple-200 hover:text-white transition-colors">
                  Cookie Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <Separator className="my-6 bg-white/20" />

        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-purple-200">
          <p>
            &copy; {new Date().getFullYear()} BUSYBEES SDA Youth Ministry. All rights reserved.
          </p>
          <p className="text-xs">
            Built with faith, hope, and love.
          </p>
        </div>
      </div>
    </footer>
  );
}
