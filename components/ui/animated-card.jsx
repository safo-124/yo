// components/ui/animated-card.jsx
"use client";

import { cn } from "@/lib/utils";
import { BookOpen, Users, Award, Building2, Clock, Shield, CheckCircle, GraduationCap, FileText, Database } from 'lucide-react';

const iconMap = {
  BookOpen,
  Users,
  Award,
  Building2,
  Clock,
  Shield,
  CheckCircle,
  GraduationCap,
  FileText,
  Database
};

export function AnimatedCard({ 
  children, 
  className, 
  delay = 0, 
  hover = true,
  ...props 
}) {
  return (
    <div
      className={cn(
        "animate-slide-up transition-all duration-300 ease-out",
        hover && "hover:scale-102 hover:shadow-lg",
        className
      )}
      style={{ animationDelay: `${delay}ms` }}
      {...props}
    >
      {children}
    </div>
  );
}

export function FeatureCard({ icon: iconName, title, description, delay = 0, color = "blue" }) {
  const Icon = iconMap[iconName] || BookOpen;
  
  const colorClasses = {
    blue: "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400",
    purple: "bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400",
    green: "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400",
    orange: "bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400",
    indigo: "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400",
    slate: "bg-slate-50 dark:bg-slate-700/20 text-slate-600 dark:text-slate-400",
    emerald: "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400",
    yellow: "bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400",
    red: "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400"
  };

  return (
    <AnimatedCard 
      delay={delay}
      className={cn(
        "text-center p-6 rounded-xl transition-all duration-300 cursor-pointer group",
        colorClasses[color],
        "hover:scale-105 hover:shadow-md"
      )}
    >
      <div className="transition-transform duration-200 group-hover:scale-110 group-hover:rotate-3">
        <Icon className="h-10 w-10 mx-auto mb-4" />
      </div>
      <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2 group-hover:text-gray-900 dark:group-hover:text-gray-100 transition-colors">
        {title}
      </h3>
      <p className="text-sm text-gray-600 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors">
        {description}
      </p>
    </AnimatedCard>
  );
}