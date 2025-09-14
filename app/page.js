// app/page.jsx
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AnimatedCard, FeatureCard } from "@/components/ui/animated-card";
import { LogIn, UserPlus, BookOpen, Users, Building2, Award, ChevronRight, Shield, Clock, CheckCircle, GraduationCap, FileText, Database } from 'lucide-react';
import Image from 'next/image';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-red-50 to-blue-100 dark:from-slate-900 dark:via-red-900 dark:to-blue-900 selection:bg-blue-600 selection:text-white overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] dark:bg-grid-slate-700/25 dark:[mask-image:linear-gradient(0deg,rgba(255,255,255,0.1),rgba(255,255,255,0.5))]"></div>
      
      {/* Red and Blue Inspired Floating Elements */}
      <div className="absolute top-20 left-10 w-24 h-24 bg-red-500/10 rounded-full blur-xl animate-float"></div>
      <div className="absolute top-40 right-20 w-20 h-20 bg-blue-500/10 rounded-full blur-xl animate-float-delayed"></div>
      <div className="absolute bottom-20 left-20 w-32 h-32 bg-red-600/10 rounded-full blur-xl animate-float-slow"></div>
      <div className="absolute top-60 right-40 w-16 h-16 bg-blue-600/8 rounded-full blur-lg animate-float"></div>
      <div className="absolute bottom-40 right-10 w-28 h-28 bg-red-500/8 rounded-full blur-lg animate-float-delayed"></div>
      
      {/* Main Content */}
      <div className="relative min-h-screen p-4 sm:p-6 lg:p-8">
        {/* University Header */}
        <AnimatedCard className="text-center mb-16 pt-12" delay={0}>
          <div className="mx-auto mb-8 h-32 w-32 relative drop-shadow-lg transform hover:scale-105 transition-transform duration-500">
            <Image
              src="/uew.png"
              alt="University of Education, Winneba Logo"
              fill
              className="object-contain filter drop-shadow-xl"
              priority
            />
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold bg-gradient-to-r from-blue-700 via-red-600 to-blue-600 bg-clip-text text-transparent mb-4 tracking-tight animate-gradient">
            University of Education
          </h1>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-semibold text-slate-700 dark:text-slate-200 mb-6 tracking-wide">
            Winneba
          </h2>
          <div className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold bg-gradient-to-r from-red-600 via-blue-600 to-red-700 bg-clip-text text-transparent mb-4 tracking-wide animate-gradient">
            College for Distance and e-Learning
          </div>
        </AnimatedCard>

        {/* Main Card */}
        <AnimatedCard 
          className="w-full max-w-7xl mx-auto shadow-2xl rounded-3xl overflow-hidden backdrop-blur-sm bg-white/95 dark:bg-slate-800/95 border border-slate-200/50 dark:border-slate-700/50 mb-20" 
          delay={200}
        >
          <CardHeader className="text-center bg-gradient-to-r from-blue-700 via-red-600 to-blue-600 text-white p-10 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-700/20 to-red-600/20 animate-pulse-bg"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-center mb-6">
                <Shield className="h-10 w-10 mr-4 animate-bounce-soft text-red-200" />
                <CardTitle className="text-4xl font-bold tracking-tight">
                  Academic Claims Management Portal
                </CardTitle>
              </div>
              <CardDescription className="text-blue-100 text-xl leading-relaxed max-w-3xl mx-auto">
                A comprehensive digital platform designed for efficient academic claims processing, 
                course management, and administrative oversight within the College for Distance and e-Learning.
              </CardDescription>
            </div>
          </CardHeader>
          
          <CardContent className="p-12 space-y-12">
            {/* System Overview */}
            <AnimatedCard 
              className="bg-gradient-to-r from-blue-50 to-red-50 dark:from-blue-900/20 dark:to-red-900/20 rounded-2xl p-10 border border-blue-200 dark:border-blue-700" 
              delay={400}
            >
              <h3 className="text-3xl font-bold text-slate-800 dark:text-slate-200 mb-8 flex items-center">
                <FileText className="h-8 w-8 mr-4 text-blue-600 dark:text-blue-400" />
                System Overview
              </h3>
              <p className="text-slate-700 dark:text-slate-300 text-xl leading-relaxed">
                This portal serves as the central hub for academic staff to submit, track, and manage their claims 
                for teaching assignments, course materials, and administrative duties. The system ensures 
                transparency, accountability, and efficient processing of all academic-related claims within the 
                College for Distance and e-Learning.
              </p>
            </AnimatedCard>

            {/* Features Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 mb-12">
              <FeatureCard
                icon="BookOpen"
                title="Course Administration"
                description="Comprehensive management of course assignments, materials, and academic schedules"
                delay={500}
                color="blue"
              />
              <FeatureCard
                icon="Users"
                title="Role-Based Access"
                description="Secure authentication system with distinct roles for lecturers and coordinators"
                delay={600}
                color="red"
              />
              <FeatureCard
                icon="Database"
                title="Claims Processing"
                description="Streamlined workflow for claim submissions, approvals, and status tracking"
                delay={700}
                color="blue"
              />
            </div>

            {/* Key Features */}
            <AnimatedCard 
              className="bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-700/50 dark:to-blue-700/20 rounded-2xl p-10 border border-blue-200 dark:border-blue-600" 
              delay={800}
            >
              <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-8 flex items-center">
                <CheckCircle className="h-7 w-7 mr-4 text-blue-600 animate-pulse-soft" />
                Key System Features
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <div className="space-y-6">
                  <div className="flex items-center text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer group">
                    <Clock className="h-6 w-6 mr-4 text-blue-600 group-hover:scale-110 transition-transform" />
                    <span className="font-medium text-lg">Real-time Processing & Notifications</span>
                  </div>
                  <div className="flex items-center text-slate-700 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 transition-colors cursor-pointer group">
                    <Shield className="h-6 w-6 mr-4 text-red-600 group-hover:scale-110 transition-transform" />
                    <span className="font-medium text-lg">Enterprise-Grade Security</span>
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="flex items-center text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer group">
                    <Building2 className="h-6 w-6 mr-4 text-blue-600 group-hover:scale-110 transition-transform" />
                    <span className="font-medium text-lg">Multi-Center Administration</span>
                  </div>
                  <div className="flex items-center text-slate-700 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 transition-colors cursor-pointer group">
                    <Users className="h-6 w-6 mr-4 text-red-600 group-hover:scale-110 transition-transform" />
                    <span className="font-medium text-lg">Collaborative Workflow Management</span>
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="flex items-center text-slate-700 dark:text-slate-300 hover:text-blue-700 dark:hover:text-blue-400 transition-colors cursor-pointer group">
                    <Award className="h-6 w-6 mr-4 text-blue-700 group-hover:scale-110 transition-transform" />
                    <span className="font-medium text-lg">Comprehensive Audit Trail</span>
                  </div>
                  <div className="flex items-center text-slate-700 dark:text-slate-300 hover:text-red-700 dark:hover:text-red-400 transition-colors cursor-pointer group">
                    <FileText className="h-6 w-6 mr-4 text-red-700 group-hover:scale-110 transition-transform" />
                    <span className="font-medium text-lg">Detailed Reporting & Analytics</span>
                  </div>
                </div>
              </div>
            </AnimatedCard>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6">
              <AnimatedCard delay={900}>
                <Button asChild size="lg" className="w-full bg-gradient-to-r from-blue-700 to-red-600 hover:from-blue-800 hover:to-red-700 text-white transition-all duration-300 ease-in-out transform hover:scale-[1.02] hover:shadow-2xl rounded-2xl shadow-lg h-20 text-xl font-semibold group">
                  <Link href="/login" className="flex items-center justify-center">
                    <LogIn className="mr-4 h-7 w-7 group-hover:animate-bounce-soft" /> 
                    Access Portal
                    <ChevronRight className="ml-4 h-6 w-6 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </AnimatedCard>
              
              <AnimatedCard delay={1000}>
                <Button asChild variant="outline" size="lg" className="w-full border-2 border-blue-300 text-blue-700 hover:bg-blue-50 dark:border-blue-600 dark:text-blue-400 dark:hover:bg-blue-900/30 transition-all duration-300 ease-in-out transform hover:scale-[1.02] hover:shadow-lg rounded-2xl h-20 text-xl font-semibold group">
                  <Link href="/signup" className="flex items-center justify-center">
                    <UserPlus className="mr-4 h-7 w-7 group-hover:scale-110 transition-transform" /> 
                    Request Account Access
                  </Link>
                </Button>
              </AnimatedCard>
            </div>

            {/* Important Notice */}
            <AnimatedCard 
              className="bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-400 dark:border-amber-500 rounded-r-2xl p-8" 
              delay={1100}
            >
              <div className="flex items-start">
                <Shield className="h-7 w-7 text-amber-600 dark:text-amber-400 mt-1 mr-5 flex-shrink-0 animate-pulse-soft" />
                <div>
                  <p className="text-xl font-semibold text-amber-800 dark:text-amber-200 mb-3">
                    Account Verification Process
                  </p>
                  <p className="text-amber-700 dark:text-amber-300 leading-relaxed text-lg">
                    All new account requests undergo a thorough verification process by the Registry Office 
                    to ensure system security and proper authorization. Applicants will receive email 
                    confirmation upon approval, typically within 2-3 business days.
                  </p>
                </div>
              </div>
            </AnimatedCard>
          </CardContent>
        </AnimatedCard>

        {/* Statistics */}
        <div className="mt-16 grid grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-4xl">
          {[
            { label: "Secure", sublabel: "24/7 System Access", color: "text-blue-700 dark:text-blue-400", delay: 1200 },
            { label: "Verified", sublabel: "Authentication System", color: "text-red-700 dark:text-red-400", delay: 1300 },
            { label: "Real-time", sublabel: "Status Updates", color: "text-blue-800 dark:text-blue-300", delay: 1400 },
            { label: "Professional", sublabel: "Academic Standards", color: "text-red-800 dark:text-red-300", delay: 1500 }
          ].map((stat, index) => (
            <AnimatedCard 
              key={index}
              className="text-center p-6 bg-white/80 dark:bg-slate-800/80 rounded-2xl backdrop-blur-sm border border-blue-200/50 dark:border-blue-700/50 hover:bg-white/95 dark:hover:bg-slate-800/95 hover:scale-105 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-xl"
              delay={stat.delay}
            >
              <div className={`text-3xl font-bold ${stat.color} mb-2`}>{stat.label}</div>
              <div className="text-sm text-slate-600 dark:text-slate-400 font-medium">{stat.sublabel}</div>
            </AnimatedCard>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="relative bg-slate-900 dark:bg-black text-white border-t border-blue-200 dark:border-blue-700">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <AnimatedCard delay={1600} className="space-y-4">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="h-12 w-12 relative">
                    <Image
                      src="/uew.png"
                      alt="UEW Logo"
                      fill
                      className="object-contain filter brightness-0 invert"
                    />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">University of Education, Winneba</h3>
                    <p className="text-blue-400 text-sm font-semibold">College for Distance and e-Learning</p>
                  </div>
                </div>
                <p className="text-slate-400 leading-relaxed max-w-md">
                  The Academic Claims Management Portal serves as the digital backbone for 
                  efficient administrative processes, ensuring transparency and accountability 
                  in academic operations within the College for Distance and e-Learning.
                </p>
                <div className="flex items-center space-x-2 text-sm text-blue-500">
                  <Shield className="h-4 w-4" />
                  <span>Secure • Reliable • Professional</span>
                </div>
              </AnimatedCard>
            </div>
            
            <AnimatedCard delay={1700}>
              <h3 className="text-lg font-semibold mb-6 text-slate-200">Portal Access</h3>
              <ul className="space-y-3 text-slate-400">
                <li>
                  <Link href="/login" className="hover:text-white transition-colors hover:translate-x-1 transform flex items-center group">
                    <LogIn className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
                    Staff Login
                  </Link>
                </li>
                <li>
                  <Link href="/signup" className="hover:text-white transition-colors hover:translate-x-1 transform flex items-center group">
                    <UserPlus className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
                    Account Request
                  </Link>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors hover:translate-x-1 transform flex items-center group">
                    <FileText className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
                    Documentation
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors hover:translate-x-1 transform flex items-center group">
                    <Shield className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
                    Security Policy
                  </a>
                </li>
              </ul>
            </AnimatedCard>
            
            <AnimatedCard delay={1800}>
              <h3 className="text-lg font-semibold mb-6 text-slate-200">System Features</h3>
              <ul className="space-y-3 text-slate-400">
                <li className="hover:text-white transition-colors cursor-pointer flex items-center group">
                  <BookOpen className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
                  Course Management
                </li>
                <li className="hover:text-white transition-colors cursor-pointer flex items-center group">
                  <Database className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
                  Claims Processing
                </li>
                <li className="hover:text-white transition-colors cursor-pointer flex items-center group">
                  <Users className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
                  User Management
                </li>
                <li className="hover:text-white transition-colors cursor-pointer flex items-center group">
                  <Award className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
                  Performance Analytics
                </li>
              </ul>
            </AnimatedCard>
          </div>
          
          <div className="border-t border-slate-800 mt-12 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <p className="text-slate-400 text-sm">
                &copy; {new Date().getFullYear()} University of Education, Winneba. All rights reserved.
              </p>
              <div className="flex items-center space-x-6 text-sm text-slate-500">
                <span className="flex items-center">
                  <GraduationCap className="h-4 w-4 mr-1" />
                  Academic Excellence
                </span>
                <span className="flex items-center">
                  <Shield className="h-4 w-4 mr-1" />
                  Data Protection
                </span>
                <span className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  24/7 Support
                </span>
              </div>
            </div>
          </div>
        </div>
      </footer>


    </div>
  );
}
