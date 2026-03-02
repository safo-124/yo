// app/page.jsx
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import {
  LogIn,
  UserPlus,
  BookOpen,
  Users,
  Building2,
  Shield,
  Clock,
  CheckCircle2,
  GraduationCap,
  FileText,
  BarChart3,
  ArrowRight,
  Mail,
  Phone,
  MapPin,
  ChevronRight,
} from 'lucide-react';
import Image from 'next/image';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white selection:bg-blue-800 selection:text-white">
      {/* ===== TOP BAR ===== */}
      <div className="bg-slate-800 text-slate-300 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-8">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> info@uew.edu.gh</span>
            <span className="hidden sm:flex items-center gap-1"><Phone className="h-3 w-3" /> +233 3321 22139</span>
          </div>
          <div className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            <span>Winneba, Central Region, Ghana</span>
          </div>
        </div>
      </div>

      {/* ===== NAVIGATION ===== */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 relative flex-shrink-0">
              <Image src="/uew.png" alt="UEW Logo" fill className="object-contain" priority />
            </div>
            <div className="leading-tight hidden sm:block">
              <p className="font-bold text-slate-900 text-sm">University of Education, Winneba</p>
              <p className="text-[11px] text-slate-500 font-medium">College for Distance and e-Learning</p>
            </div>
          </div>
          <nav className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm" className="text-slate-600 hover:text-slate-900">
              <Link href="/login">
                <LogIn className="h-4 w-4 mr-1.5" />
                Sign In
              </Link>
            </Button>
            <Button asChild size="sm" className="bg-blue-800 hover:bg-blue-900 text-white">
              <Link href="/signup">
                <UserPlus className="h-4 w-4 mr-1.5" />
                Request Access
              </Link>
            </Button>
          </nav>
        </div>
      </header>

      {/* ===== HERO ===== */}
      <section className="relative bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 overflow-hidden">
        {/* Subtle pattern overlay */}
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }}></div>
        {/* Gold accent line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-yellow-500 via-yellow-400 to-yellow-500"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left content */}
            <div className="text-white space-y-8">
              <div>
                <div className="inline-flex items-center gap-2 text-yellow-400 text-sm font-semibold mb-4 tracking-wider uppercase">
                  <Shield className="h-4 w-4" />
                  Official Digital Portal
                </div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight tracking-tight">
                  Academic Claims<br />
                  <span className="text-blue-300">Management Portal</span>
                </h1>
              </div>
              <p className="text-slate-300 text-lg leading-relaxed max-w-lg">
                The centralized platform for academic staff to submit, track, and manage
                claims for teaching assignments, course materials, and administrative duties
                within the College for Distance and e-Learning.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button asChild size="lg" className="bg-yellow-500 hover:bg-yellow-400 text-slate-900 font-semibold h-12 px-6 shadow-lg">
                  <Link href="/login">
                    <LogIn className="h-5 w-5 mr-2" />
                    Staff Portal Login
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="border-yellow-500/70 bg-transparent text-yellow-400 hover:bg-yellow-500/10 hover:text-yellow-300 h-12 px-6">
                  <Link href="/signup">
                    <UserPlus className="h-5 w-5 mr-2" />
                    Request Account
                  </Link>
                </Button>
              </div>
            </div>

            {/* Right - Hero Image */}
            <div className="hidden lg:flex flex-col items-center justify-center">
              <div className="relative w-full max-w-md aspect-[4/3] rounded-xl overflow-hidden shadow-2xl border border-white/10">
                <Image src="/applv.jpg" alt="University of Education, Winneba Campus" fill className="object-cover" priority />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-5 text-center">
                  <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                    <div className="h-7 w-7 relative flex-shrink-0">
                      <Image src="/uew.png" alt="UEW Crest" fill className="object-contain" />
                    </div>
                    <span className="text-white text-sm font-semibold">University of Education, Winneba</span>
                  </div>
                </div>
              </div>
              <div className="mt-4 text-center">
                <p className="text-xl text-slate-300 mt-1">Winneba</p>
                <div className="mt-3 h-px w-48 mx-auto bg-gradient-to-r from-transparent via-yellow-500 to-transparent"></div>
                <p className="text-yellow-400 font-semibold text-sm mt-3 tracking-wider uppercase">
                  College for Distance and e-Learning
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== STATS BAR ===== */}
      <section className="bg-blue-800 border-t border-blue-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-0">
          <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-blue-700">
            {[
              { icon: Shield, label: "Secure Access", desc: "Role-based authentication" },
              { icon: Clock, label: "Real-time", desc: "Live status tracking" },
              { icon: Building2, label: "Multi-Center", desc: "All study centers" },
              { icon: CheckCircle2, label: "Verified", desc: "Registry approved" },
            ].map(({ icon: Icon, label, desc }, i) => (
              <div key={i} className="flex items-center gap-3 py-5 px-4 lg:px-6">
                <Icon className="h-8 w-8 text-yellow-400 flex-shrink-0" />
                <div>
                  <p className="text-white font-semibold text-sm">{label}</p>
                  <p className="text-blue-200 text-xs">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== ABOUT / OVERVIEW ===== */}
      <section className="py-16 lg:py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">System Overview</h2>
            <div className="mt-3 h-1 w-16 mx-auto bg-yellow-500 rounded-full"></div>
            <p className="mt-4 text-slate-600 max-w-2xl mx-auto leading-relaxed">
              This portal ensures transparency, accountability, and efficient processing of
              all academic-related claims within the College for Distance and e-Learning.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: BookOpen, title: "Course Administration", desc: "Manage course assignments, teaching schedules, materials, and academic records across all study centers." , color: "bg-blue-50 text-blue-700 border-blue-200" },
              { icon: Users, title: "Role-Based Access Control", desc: "Distinct access levels for lecturers, coordinators, staff registry, and main registry with proper authorization.", color: "bg-indigo-50 text-indigo-700 border-indigo-200" },
              { icon: FileText, title: "Claims Processing", desc: "Streamlined digital workflow for claim submissions, multi-level approvals, and comprehensive status tracking.", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
              { icon: Building2, title: "Center Management", desc: "Multi-center administration supporting all study centers with centralized oversight and coordination.", color: "bg-amber-50 text-amber-700 border-amber-200" },
              { icon: BarChart3, title: "Reporting & Analytics", desc: "Detailed reports, claim summaries, and data analytics for informed decision-making and auditing.", color: "bg-violet-50 text-violet-700 border-violet-200" },
              { icon: Shield, title: "Security & Compliance", desc: "Enterprise-grade security with audit trails, data protection, and regulatory compliance built-in.", color: "bg-rose-50 text-rose-700 border-rose-200" },
            ].map(({ icon: Icon, title, desc, color }, i) => (
              <div key={i} className={`rounded-lg border p-6 ${color} transition-shadow hover:shadow-md`}>
                <div className="flex items-start gap-4">
                  <div className="p-2.5 rounded-lg bg-white shadow-sm flex-shrink-0">
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-1.5">{title}</h3>
                    <p className="text-sm text-slate-600 leading-relaxed">{desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section className="py-16 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">How It Works</h2>
            <div className="mt-3 h-1 w-16 mx-auto bg-yellow-500 rounded-full"></div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { step: "01", title: "Request Access", desc: "Submit an account request with your staff credentials for verification by the Registry Office." },
              { step: "02", title: "Get Verified", desc: "The Registry reviews and approves your account, granting role-based access to the portal." },
              { step: "03", title: "Submit Claims", desc: "Log in to submit teaching claims, upload supporting documents, and track submissions." },
              { step: "04", title: "Track & Manage", desc: "Monitor claim statuses in real-time through coordinator review and registry approval." },
            ].map(({ step, title, desc }, i) => (
              <div key={i} className="relative text-center">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-blue-800 text-white font-bold text-lg mb-4">
                  {step}
                </div>
                {i < 3 && (
                  <ChevronRight className="hidden lg:block absolute top-7 -right-4 h-5 w-5 text-slate-300" />
                )}
                <h3 className="font-semibold text-slate-900 mb-2">{title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA / NOTICE ===== */}
      <section className="py-16 bg-slate-50 border-t border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Verification Notice */}
          <div className="bg-white border border-amber-200 rounded-lg p-6 mb-10 flex gap-4 items-start shadow-sm">
            <div className="p-2 bg-amber-50 rounded-lg flex-shrink-0">
              <Shield className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 mb-1">Account Verification Process</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                All new account requests undergo a thorough verification process by the Registry Office
                to ensure system security and proper authorization. Applicants will receive email
                confirmation upon approval, typically within 2-3 business days.
              </p>
            </div>
          </div>

          {/* CTA Card */}
          <div className="bg-gradient-to-br from-blue-900 to-slate-900 rounded-xl p-8 sm:p-10 text-center shadow-xl">
            <GraduationCap className="h-10 w-10 text-yellow-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-3">Ready to Get Started?</h2>
            <p className="text-slate-300 mb-6 max-w-md mx-auto">
              Access the portal to manage your academic claims or request a new staff account.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild size="lg" className="bg-yellow-500 hover:bg-yellow-400 text-slate-900 font-semibold h-11 px-8">
                <Link href="/login">
                  <LogIn className="h-5 w-5 mr-2" />
                  Sign In to Portal
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-yellow-500/70 bg-transparent text-yellow-400 hover:bg-yellow-500/10 hover:text-yellow-300 h-11 px-8">
                <Link href="/signup">
                  <UserPlus className="h-5 w-5 mr-2" />
                  Request Access
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="bg-slate-900 text-white">
        {/* Gold accent line */}
        <div className="h-1 bg-gradient-to-r from-yellow-600 via-yellow-400 to-yellow-600"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-4 gap-10">
            {/* Brand */}
            <div className="md:col-span-2 space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 relative flex-shrink-0">
                  <Image src="/uew.png" alt="UEW Logo" fill className="object-contain brightness-0 invert" />
                </div>
                <div>
                  <p className="font-bold text-white">University of Education, Winneba</p>
                  <p className="text-yellow-400 text-xs font-semibold tracking-wide">College for Distance and e-Learning</p>
                </div>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
                The Academic Claims Management Portal is the official digital platform for
                efficient processing of academic claims and administrative operations.
              </p>
              <div className="flex items-center gap-4 text-xs text-slate-500">
                <span className="flex items-center gap-1"><Shield className="h-3 w-3" /> Secure</span>
                <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> Reliable</span>
                <span className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Verified</span>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-sm font-semibold text-slate-200 uppercase tracking-wider mb-4">Portal</h4>
              <ul className="space-y-2.5 text-sm">
                <li><Link href="/login" className="text-slate-400 hover:text-white transition-colors">Staff Login</Link></li>
                <li><Link href="/signup" className="text-slate-400 hover:text-white transition-colors">Request Account</Link></li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-sm font-semibold text-slate-200 uppercase tracking-wider mb-4">Contact</h4>
              <ul className="space-y-2.5 text-sm text-slate-400">
                <li className="flex items-center gap-2"><Mail className="h-3.5 w-3.5" /> info@uew.edu.gh</li>
                <li className="flex items-center gap-2"><Phone className="h-3.5 w-3.5" /> +233 3321 22139</li>
                <li className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5" /> Winneba, Ghana</li>
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="border-t border-slate-800 mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3">
            <p className="text-slate-500 text-xs">
              &copy; {new Date().getFullYear()} University of Education, Winneba. All rights reserved.
            </p>
            <div className="flex items-center gap-4 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <GraduationCap className="h-3.5 w-3.5" />
                Academic Excellence
              </span>
              <span className="flex items-center gap-1">
                <Shield className="h-3.5 w-3.5" />
                Data Protection
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
