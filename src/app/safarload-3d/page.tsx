'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Cinematic3DBackground from '@/components/Cinematic3DBackground';
import Hologram3DShowcase from '@/components/Hologram3DShowcase';

export default function Parallel3DAppPage() {
  const [lang, setLang] = useState<'en' | 'ur'>('en');

  const toggleLang = () => {
    setLang((prev) => (prev === 'en' ? 'ur' : 'en'));
  };

  return (
    <div className="min-h-screen bg-[#090D16] text-slate-100 font-sans p-4 md:p-8 relative overflow-x-hidden">
      {/* Dynamic 3D Moving Canvas Background */}
      <Cinematic3DBackground />

      {/* PARALLEL COMPARISON BADGE & NAV HEADER */}
      <header className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 mb-8 p-4 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-400 flex items-center justify-center text-2xl shadow-lg shadow-emerald-500/30">
            🚚
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
              SAFARLOAD <span class="text-xs px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">3D APP VARIANT</span>
            </h1>
            <p className="text-xs text-slate-400">سفر لوڈ — تھری ڈی سائبر لاجسٹکس پاکستان (Parallel Comparison View)</p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <Link href="/" className="px-4 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs font-bold text-slate-300 hover:text-white hover:border-emerald-500 transition">
            🔄 Switch to Original App Design
          </Link>
          <button onClick={toggleLang} className="px-4 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs font-bold hover:border-emerald-500 transition">
            🌐 {lang === 'en' ? 'اردو' : 'English'}
          </button>
          <Link href="/login" className="px-5 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/30 hover:bg-emerald-400 transition">
            🚀 Open App Dashboard
          </Link>
        </div>
      </header>

      {/* HERO HERO CONTAINER */}
      <section className="max-w-7xl mx-auto text-center my-10 relative z-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold mb-4">
          ✨ Next-Gen 3D Cyber-Logistics Platform
        </div>
        <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight mb-4">
          {lang === 'en' ? (
            <>Experience 3D Freight Dispatching in <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">Pakistan</span></>
          ) : (
            <>پاکستان کی پہلی تھری ڈی ڈیجیٹل لاجسٹکس</>
          )}
        </h1>
        <p className="max-w-2xl mx-auto text-slate-400 text-sm md:text-base mb-8">
          {lang === 'en'
            ? 'Real-time 3D telemetry hologram stage, Motive DRIVE safety scorecards, and instant inter-city freight rate calculators.'
            : 'تھری ڈی ہولوگرام ٹریکنگ، موٹو سیفٹی سکور اور پاکستان کی تمام شاہراؤں کا فوری کرایہ بلڈر'}
        </p>
      </section>

      {/* 3D HOLOGRAM & DYNAMIC RATE ESTIMATOR SHOWCASE */}
      <Hologram3DShowcase />

      {/* FOOTER */}
      <footer className="max-w-7xl mx-auto text-center text-xs text-slate-500 my-10 pt-6 border-t border-slate-800">
        © 2026 SafarLoad Pakistan 3D Variant. Parallel comparison view enabled.
      </footer>
    </div>
  );
}
