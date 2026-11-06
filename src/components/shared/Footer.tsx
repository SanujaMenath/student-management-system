
import Link from 'next/link';
import {
  MapPin,
  Phone,
  Mail,
} from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#072B20] text-white border-l-2 border-[#8CC63F]">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Institute Information */}
          <div>
            <h2 className="text-xl font-bold tracking-wide">
              HANDAHAMY
            </h2>

            <p className="text-xs tracking-widest font-medium">
              EDUCATIONAL INSTITUTE
            </p>

            <p className="text-sm text-gray-300 leading-7 mt-4 max-w-xs">
              Nurturing confident, curious and caring young learners
              in a safe community.
            </p>

            {/* Social Links */}
            <div className="flex gap-2 mt-4">
              {[
                { label: 'f', href: '#' },
                { label: 'in', href: '#' },
                { label: 'ig', href: '#' },
              ].map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  className="w-10 h-10 flex items-center justify-center rounded-xl border border-white/20 text-sm text-gray-300 hover:bg-white/10 transition"
                >
                  {social.label}
                </a>
              ))}
            </div>
          </div>

          {/* Explore */}
          <div>
            <h3 className="font-semibold mb-6">Explore</h3>

            <ul className="space-y-4 text-sm text-gray-300">
              <li>
                <Link href="/" className="hover:text-white transition">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-white transition">
                  About
                </Link>
              </li>
              <li>
                <Link href="/admissions" className="hover:text-white transition">
                  Admissions
                </Link>
              </li>
              <li>
                <Link href="/payments" className="hover:text-white transition">
                  Payments
                </Link>
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-6">Quick links</h3>

            <ul className="space-y-4 text-sm text-gray-300">
              <li>
                <Link href="/careers" className="hover:text-white transition">
                  Careers
                </Link>
              </li>
              <li>
                <Link href="/payments" className="hover:text-white transition">
                  Online payments
                </Link>
              </li>
              <li>
                <Link href="/auth/login" className="hover:text-white transition">
                  Portal login
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold mb-6">Contact</h3>

            <ul className="space-y-4 text-sm text-gray-300">
              <li className="flex items-center gap-3">
                <MapPin className="w-7 h-7 shrink-0" />
                <span>Sabaragamuwa, Sri Lanka</span>
              </li>

              <li className="flex items-center gap-3">
                <Phone className="w-7 h-7 shrink-0" />
                <span>+94 00 000 0000</span>
              </li>

              <li className="flex items-center gap-3">
                <Mail className="w-7 h-7 shrink-0" />
                <span>hello@handahamy.edu.lk</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-white/15 mt-16 pt-6 flex flex-col md:flex-row justify-between items-center gap-3 text-xs text-gray-300">
          <p>
            © 2025 Handahamy Educational Institute
          </p>

          <p>
            Community project by IS Group 06 · SUSL
          </p>
        </div>
      </div>
    </footer>
  );
}
