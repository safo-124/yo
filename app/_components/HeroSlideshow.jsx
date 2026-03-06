// app/_components/HeroSlideshow.jsx
"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { LogIn, UserPlus, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const slides = [
  {
    id: 0,
    badge: "Official Digital Portal",
    heading: (
      <>
        Academic Claims
        <br />
        <span className="text-red-400">Management System</span>
      </>
    ),
    description:
      "The centralized platform for academic staff to submit, track, and manage claims for teaching assignments within the College for Distance and e-Learning.",
    imageStyle: "scale-105",
    gradient: "from-slate-900/80 via-slate-900/60 to-slate-900/30",
  },
  {
    id: 1,
    badge: "Streamlined Workflow",
    heading: (
      <>
        Digital Claims
        <br />
        <span className="text-blue-400">Processing</span>
      </>
    ),
    description:
      "From submission to approval — experience a fully digital workflow with real-time status tracking, multi-level review, and comprehensive audit trails.",
    imageStyle: "scale-110 -translate-x-8",
    gradient: "from-blue-900/85 via-blue-900/60 to-slate-900/30",
  },
  {
    id: 2,
    badge: "Multi-Center Support",
    heading: (
      <>
        All Study Centers
        <br />
        <span className="text-emerald-400">One Platform</span>
      </>
    ),
    description:
      "Manage operations across every CODeL study center with role-based access for lecturers, coordinators, staff registry, and main registry.",
    imageStyle: "scale-110 translate-x-8",
    gradient: "from-slate-900/85 via-emerald-900/50 to-slate-900/30",
  },
];

export default function HeroSlideshow() {
  const [current, setCurrent] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const goTo = useCallback(
    (index) => {
      if (isTransitioning || index === current) return;
      setIsTransitioning(true);
      setCurrent(index);
      setTimeout(() => setIsTransitioning(false), 700);
    },
    [current, isTransitioning]
  );

  const next = useCallback(() => {
    goTo((current + 1) % slides.length);
  }, [current, goTo]);

  const prev = useCallback(() => {
    goTo((current - 1 + slides.length) % slides.length);
  }, [current, goTo]);

  // Auto-advance every 6 seconds
  useEffect(() => {
    const timer = setInterval(next, 6000);
    return () => clearInterval(timer);
  }, [next]);

  const slide = slides[current];

  return (
    <section className="relative h-[520px] sm:h-[560px] lg:h-[600px] overflow-hidden bg-slate-900">
      {/* Background images — all rendered, opacity-toggled */}
      {slides.map((s) => (
        <div
          key={s.id}
          className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
            s.id === current ? "opacity-100" : "opacity-0"
          }`}
        >
          <div className={`relative h-full w-full transition-transform duration-[6000ms] ease-linear ${s.id === current ? s.imageStyle : "scale-100"}`}>
            <Image
              src="/applv.jpg"
              alt="University of Education, Winneba Campus"
              fill
              className="object-cover"
              priority={s.id === 0}
            />
          </div>
          <div className={`absolute inset-0 bg-gradient-to-r ${s.gradient}`} />
        </div>
      ))}

      {/* Accent line top */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-600 via-red-400 to-red-600 z-20" />

      {/* Content */}
      <div className="relative z-10 h-full flex items-center">
        <div className="w-full px-6 sm:px-10 lg:px-16 xl:px-24">
          <div className="max-w-2xl">
            {/* Badge */}
            <div
              key={`badge-${current}`}
              className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white text-xs font-semibold tracking-widest uppercase px-4 py-2 rounded-full border border-white/20 mb-5 animate-fade-in-up"
            >
              {slide.badge}
            </div>

            {/* Heading */}
            <h1
              key={`heading-${current}`}
              className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-white leading-tight tracking-tight mb-5 animate-fade-in-up"
              style={{ animationDelay: "100ms" }}
            >
              {slide.heading}
            </h1>

            {/* Description */}
            <p
              key={`desc-${current}`}
              className="text-slate-300 text-base sm:text-lg leading-relaxed max-w-lg mb-8 animate-fade-in-up"
              style={{ animationDelay: "200ms" }}
            >
              {slide.description}
            </p>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                asChild
                size="lg"
                className="bg-red-600 hover:bg-red-500 text-white font-semibold h-12 px-7 shadow-lg shadow-red-600/25 transition-all"
              >
                <Link href="/login">
                  <LogIn className="h-5 w-5 mr-2" />
                  Staff Portal Login
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-white/30 bg-white/5 text-white hover:bg-white/15 backdrop-blur-sm h-12 px-7 transition-all"
              >
                <Link href="/signup">
                  <UserPlus className="h-5 w-5 mr-2" />
                  Request Account
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation arrows */}
      <button
        onClick={prev}
        className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 z-20 h-10 w-10 rounded-full bg-black/30 backdrop-blur-sm border border-white/10 text-white flex items-center justify-center hover:bg-black/50 transition-colors"
        aria-label="Previous slide"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        onClick={next}
        className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 z-20 h-10 w-10 rounded-full bg-black/30 backdrop-blur-sm border border-white/10 text-white flex items-center justify-center hover:bg-black/50 transition-colors"
        aria-label="Next slide"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      {/* Dot indicators */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2.5">
        {slides.map((s) => (
          <button
            key={s.id}
            onClick={() => goTo(s.id)}
            className={`rounded-full transition-all duration-300 ${
              s.id === current
                ? "w-8 h-2.5 bg-red-500"
                : "w-2.5 h-2.5 bg-white/40 hover:bg-white/60"
            }`}
            aria-label={`Go to slide ${s.id + 1}`}
          />
        ))}
      </div>

      {/* Bottom UEW crest badge (desktop) */}
      <div className="hidden lg:flex absolute bottom-6 right-8 z-20 items-center gap-3 bg-black/30 backdrop-blur-sm rounded-full px-4 py-2 border border-white/10">
        <div className="h-8 w-8 relative shrink-0">
          <Image src="/uew.png" alt="UEW Crest" fill className="object-contain" />
        </div>
        <div className="text-white">
          <p className="text-xs font-semibold leading-tight">University of Education</p>
          <p className="text-[10px] text-white/60">Winneba, Ghana</p>
        </div>
      </div>
    </section>
  );
}
