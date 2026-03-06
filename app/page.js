// app/page.js
import Link from "next/link";
import Image from "next/image";
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
} from "lucide-react";
import HeroSlideshow from "./_components/HeroSlideshow";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white selection:bg-blue-800 selection:text-white">
      {/* ===== TOP BAR ===== */}
      <div className="bg-slate-900 text-slate-400 text-xs">
        <div className="flex justify-between items-center h-8 px-6 sm:px-10 lg:px-16">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <Mail className="h-3 w-3" /> info@uew.edu.gh
            </span>
            <span className="hidden sm:flex items-center gap-1.5">
              <Phone className="h-3 w-3" /> +233 3321 22139
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <MapPin className="h-3 w-3" />
            <span>Winneba, Central Region, Ghana</span>
          </div>
        </div>
      </div>

      {/* ===== NAVIGATION ===== */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="flex items-center justify-between h-16 px-6 sm:px-10 lg:px-16">
          {/* Logo — far left */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="h-10 w-10 relative shrink-0">
              <Image
                src="/uew.png"
                alt="UEW Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
            <div className="hidden sm:block leading-tight">
              <p className="font-bold text-slate-900 text-sm group-hover:text-blue-800 transition-colors">
                University of Education, Winneba
              </p>
              <p className="text-[11px] text-slate-500 font-medium">
                College for Distance and e-Learning
              </p>
            </div>
          </Link>

          {/* Nav — far right */}
          <nav className="flex items-center gap-2">
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="text-slate-600 hover:text-slate-900"
            >
              <Link href="/login">
                <LogIn className="h-4 w-4 mr-1.5" />
                Sign In
              </Link>
            </Button>
            <Button
              asChild
              size="sm"
              className="bg-red-600 hover:bg-red-700 text-white shadow-sm"
            >
              <Link href="/signup">
                <UserPlus className="h-4 w-4 mr-1.5" />
                Request Access
              </Link>
            </Button>
          </nav>
        </div>
      </header>

      {/* ===== HERO SLIDESHOW ===== */}
      <HeroSlideshow />

      {/* ===== STATS BAR ===== */}
      <section className="bg-slate-900">
        <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-slate-700/50">
          {[
            { icon: Shield, label: "Secure Access", desc: "Role-based authentication" },
            { icon: Clock, label: "Real-time", desc: "Live status tracking" },
            { icon: Building2, label: "Multi-Center", desc: "All study centers" },
            { icon: CheckCircle2, label: "Verified", desc: "Registry approved" },
          ].map(({ icon: Icon, label, desc }, i) => (
            <div key={i} className="flex items-center gap-3 py-5 px-5 lg:px-8">
              <div className="p-2 rounded-lg bg-red-600/10 shrink-0">
                <Icon className="h-5 w-5 text-red-400" />
              </div>
              <div>
                <p className="text-white font-semibold text-sm">{label}</p>
                <p className="text-slate-400 text-xs">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== SYSTEM OVERVIEW ===== */}
      <section className="py-16 lg:py-20 bg-slate-50">
        <div className="px-6 sm:px-10 lg:px-16 xl:px-24">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
              System Overview
            </h2>
            <div className="mt-3 h-1 w-16 mx-auto bg-red-500 rounded-full" />
            <p className="mt-4 text-slate-600 max-w-2xl mx-auto leading-relaxed">
              This portal ensures transparency, accountability, and efficient
              processing of all academic-related claims within the College for
              Distance and e-Learning.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {[
              {
                icon: BookOpen,
                title: "Course Administration",
                desc: "Manage course assignments, teaching schedules, materials, and academic records across all study centers.",
                light: "bg-blue-50",
                iconColor: "text-blue-600",
              },
              {
                icon: Users,
                title: "Role-Based Access Control",
                desc: "Distinct access levels for lecturers, coordinators, staff registry, and main registry with proper authorization.",
                light: "bg-indigo-50",
                iconColor: "text-indigo-600",
              },
              {
                icon: FileText,
                title: "Claims Processing",
                desc: "Streamlined digital workflow for claim submissions, multi-level approvals, and comprehensive status tracking.",
                light: "bg-emerald-50",
                iconColor: "text-emerald-600",
              },
              {
                icon: Building2,
                title: "Center Management",
                desc: "Multi-center administration supporting all study centers with centralized oversight and coordination.",
                light: "bg-amber-50",
                iconColor: "text-amber-600",
              },
              {
                icon: BarChart3,
                title: "Reporting & Analytics",
                desc: "Detailed reports, claim summaries, and data analytics for informed decision-making and auditing.",
                light: "bg-violet-50",
                iconColor: "text-violet-600",
              },
              {
                icon: Shield,
                title: "Security & Compliance",
                desc: "Enterprise-grade security with audit trails, data protection, and regulatory compliance built-in.",
                light: "bg-rose-50",
                iconColor: "text-rose-600",
              },
            ].map(({ icon: Icon, title, desc, light, iconColor }, i) => (
              <div
                key={i}
                className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group"
              >
                <div className={`inline-flex p-3 rounded-lg ${light} mb-4`}>
                  <Icon className={`h-6 w-6 ${iconColor}`} />
                </div>
                <h3 className="font-semibold text-slate-900 text-lg mb-2 group-hover:text-blue-800 transition-colors">
                  {title}
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CAMPUS IMAGE BANNER ===== */}
      <section className="relative h-64 sm:h-72 overflow-hidden">
        <Image
          src="/applv.jpg"
          alt="University of Education Winneba Campus Life"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/80 via-slate-900/50 to-slate-900/80" />
        <div className="relative z-10 h-full flex items-center justify-center text-center px-6">
          <div>
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="h-12 w-12 relative shrink-0">
                <Image
                  src="/uew.png"
                  alt="UEW Crest"
                  fill
                  className="object-contain"
                />
              </div>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
              University of Education, Winneba
            </h2>
            <p className="text-red-400 font-semibold text-sm tracking-widest uppercase">
              College for Distance and e-Learning
            </p>
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section className="py-16 lg:py-20 bg-white">
        <div className="px-6 sm:px-10 lg:px-16 xl:px-24">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
              How It Works
            </h2>
            <div className="mt-3 h-1 w-16 mx-auto bg-red-500 rounded-full" />
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-5xl mx-auto">
            {[
              {
                step: "01",
                title: "Request Access",
                desc: "Submit an account request with your staff credentials for verification by the Registry Office.",
              },
              {
                step: "02",
                title: "Get Verified",
                desc: "The Registry reviews and approves your account, granting role-based access to the portal.",
              },
              {
                step: "03",
                title: "Submit Claims",
                desc: "Log in to submit teaching claims, upload supporting documents, and track submissions.",
              },
              {
                step: "04",
                title: "Track & Manage",
                desc: "Monitor claim statuses in real-time through coordinator review and registry approval.",
              },
            ].map(({ step, title, desc }, i) => (
              <div key={i} className="relative text-center group">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-slate-900 text-white font-bold text-lg mb-4 shadow-lg group-hover:bg-red-600 transition-colors">
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

      {/* ===== CTA ===== */}
      <section className="py-16 bg-slate-50 border-t border-slate-200">
        <div className="max-w-4xl mx-auto px-6 sm:px-10">
          {/* Notice */}
          <div className="bg-white border border-amber-200 rounded-xl p-6 mb-10 flex gap-4 items-start shadow-sm">
            <div className="p-2.5 bg-amber-50 rounded-lg shrink-0">
              <Shield className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 mb-1">
                Account Verification Process
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                All new account requests undergo a thorough verification process
                by the Registry Office to ensure system security and proper
                authorization. Applicants will receive email confirmation upon
                approval, typically within 2–3 business days.
              </p>
            </div>
          </div>

          {/* CTA Card */}
          <div className="relative bg-slate-900 rounded-2xl overflow-hidden shadow-2xl">
            {/* Background image */}
            <div className="absolute inset-0">
              <Image
                src="/applv.jpg"
                alt=""
                fill
                className="object-cover opacity-20"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-900/95 to-blue-900/90" />
            </div>

            <div className="relative z-10 p-8 sm:p-10 text-center">
              <GraduationCap className="h-10 w-10 text-red-400 mx-auto mb-4" />
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
                Ready to Get Started?
              </h2>
              <p className="text-slate-300 mb-8 max-w-md mx-auto">
                Access the portal to manage your academic claims or request a
                new staff account today.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  asChild
                  size="lg"
                  className="bg-red-600 hover:bg-red-500 text-white font-semibold h-12 px-8 shadow-lg shadow-red-600/25"
                >
                  <Link href="/login">
                    <LogIn className="h-5 w-5 mr-2" />
                    Sign In to Portal
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="border-white/30 bg-white/5 text-white hover:bg-white/15 h-12 px-8"
                >
                  <Link href="/signup">
                    <UserPlus className="h-5 w-5 mr-2" />
                    Request Access
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="bg-slate-900 text-white">
        <div className="h-1 bg-gradient-to-r from-red-600 via-red-400 to-red-600" />

        <div className="px-6 sm:px-10 lg:px-16 xl:px-24 py-12">
          <div className="grid md:grid-cols-4 gap-10">
            {/* Brand */}
            <div className="md:col-span-2 space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 relative shrink-0">
                  <Image
                    src="/uew.png"
                    alt="UEW Logo"
                    fill
                    className="object-contain brightness-0 invert"
                  />
                </div>
                <div>
                  <p className="font-bold text-white">
                    University of Education, Winneba
                  </p>
                  <p className="text-red-400 text-xs font-semibold tracking-wide">
                    College for Distance and e-Learning
                  </p>
                </div>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
                The Academic Claims Management Portal is the official digital
                platform for efficient processing of academic claims and
                administrative operations.
              </p>
              <div className="flex items-center gap-4 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <Shield className="h-3 w-3" /> Secure
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" /> Reliable
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" /> Verified
                </span>
              </div>
            </div>

            {/* Links */}
            <div>
              <h4 className="text-sm font-semibold text-slate-200 uppercase tracking-wider mb-4">
                Portal
              </h4>
              <ul className="space-y-2.5 text-sm">
                <li>
                  <Link
                    href="/login"
                    className="text-slate-400 hover:text-white transition-colors"
                  >
                    Staff Login
                  </Link>
                </li>
                <li>
                  <Link
                    href="/signup"
                    className="text-slate-400 hover:text-white transition-colors"
                  >
                    Request Account
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-sm font-semibold text-slate-200 uppercase tracking-wider mb-4">
                Contact
              </h4>
              <ul className="space-y-2.5 text-sm text-slate-400">
                <li className="flex items-center gap-2">
                  <Mail className="h-3.5 w-3.5" /> info@uew.edu.gh
                </li>
                <li className="flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5" /> +233 3321 22139
                </li>
                <li className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5" /> Winneba, Ghana
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom */}
          <div className="border-t border-slate-800 mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3">
            <p className="text-slate-500 text-xs">
              &copy; {new Date().getFullYear()} University of Education, Winneba.
              All rights reserved.
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
