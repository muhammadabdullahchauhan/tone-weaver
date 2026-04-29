import Link from "next/link";
import {
  Mic2,
  Blend,
  BookOpen,
  BarChart2,
  Star,
  Users,
  Zap,
  Shield,
  Globe,
  ArrowRight,
  Play,
  Waves,
} from "lucide-react";

const features = [
  {
    icon: Mic2,
    title: "Voice Recording",
    description: "High-quality 44.1 kHz recording with real-time waveform visualization and Web Audio API integration.",
    color: "#6366f1",
    href: "/record",
  },
  {
    icon: Globe,
    title: "Accent Conversion",
    description: "Transform your voice into 6+ accents including British RP, American, Australian, and Indian.",
    color: "#ec4899",
    href: "/record",
  },
  {
    icon: Blend,
    title: "Hybrid Accents",
    description: "Blend two accents together with a custom ratio slider for unique, personalized voice profiles.",
    color: "#8b5cf6",
    href: "/hybrid",
  },
  {
    icon: BookOpen,
    title: "Learning Mode",
    description: "Phonetic breakdowns, IPA notation, practice exercises with real-time pronunciation scoring.",
    color: "#f59e0b",
    href: "/learning",
  },
  {
    icon: BarChart2,
    title: "Comparison & Stats",
    description: "Side-by-side audio comparison with waveforms, similarity scores, and detailed analytics.",
    color: "#10b981",
    href: "/comparison",
  },
  {
    icon: Star,
    title: "Celebrity Voices",
    description: "Apply voice profiles inspired by David Attenborough, Morgan Freeman, and more.",
    color: "#f97316",
    href: "/record",
  },
];

const stats = [
  { value: "6+", label: "Accent Profiles" },
  { value: "<100ms", label: "Processing Latency" },
  { value: "44.1kHz", label: "Audio Quality" },
  { value: "8+", label: "Celebrity Filters" },
];

const steps = [
  {
    step: "01",
    title: "Record Your Voice",
    description: "Click record and speak naturally. Our Web Audio API captures studio-quality audio at 44.1 kHz.",
    icon: Mic2,
    color: "#6366f1",
  },
  {
    step: "02",
    title: "Select Your Accent",
    description: "Choose from British, American, Australian, Indian, Scottish, or Irish — or create a hybrid blend.",
    icon: Globe,
    color: "#ec4899",
  },
  {
    step: "03",
    title: "Transform & Share",
    description: "AI processes your voice with <100ms latency. Download, compare, or share with a single click.",
    icon: Zap,
    color: "#8b5cf6",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden pt-20 pb-28 px-4">
        {/* Background glow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full opacity-20 blur-3xl bg-[#6366f1]" />
          <div className="absolute top-20 -left-32 w-80 h-80 rounded-full opacity-15 blur-3xl bg-[#ec4899]" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-[#6366f1]/30 to-transparent" />
        </div>

        <div className="relative max-w-5xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#6366f1]/10 border border-[#6366f1]/25 text-[#a5b4fc] text-sm font-medium mb-8">
            <div className="w-1.5 h-1.5 rounded-full bg-[#6366f1] recording-dot" />
            AI-Powered Accent Translation
          </div>

          <h1 className="text-5xl lg:text-7xl font-extrabold mb-6 leading-tight">
            <span className="gradient-text">Transform Your Voice</span>
            <br />
            <span className="text-slate-200">with AI Precision</span>
          </h1>

          <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Record your voice and convert it to any accent in real time. From British RP to Australian
            twang — Tone Weaver makes every voice exceptional.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/record"
              className="flex items-center gap-2 px-8 py-4 rounded-2xl gradient-bg text-white text-lg font-semibold hover:opacity-90 transition-all glow-primary"
            >
              <Mic2 className="w-5 h-5" />
              Start Recording Free
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/learning"
              className="flex items-center gap-2 px-8 py-4 rounded-2xl bg-white/5 border border-white/10 text-slate-300 text-lg font-medium hover:bg-white/10 transition-all"
            >
              <Play className="w-4 h-4 fill-current" />
              Try Learning Mode
            </Link>
          </div>
        </div>

        {/* Mock waveform decoration */}
        <div className="relative max-w-3xl mx-auto mt-16 px-4">
          <div className="glass-card p-4 overflow-hidden">
            <div className="flex items-end justify-center gap-1 h-16">
              {Array.from({ length: 60 }, (_, i) => {
                const h = 15 + Math.abs(Math.sin(i * 0.4 + 1) * Math.sin(i * 0.15)) * 85;
                return (
                  <div
                    key={i}
                    className="w-1 rounded-full"
                    style={{
                      height: `${h}%`,
                      background: `linear-gradient(to top, #6366f1, #ec4899)`,
                      opacity: 0.7 + (i % 3) * 0.1,
                    }}
                  />
                );
              })}
            </div>
            <div className="flex items-center justify-between mt-3 text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <Waves className="w-3.5 h-3.5 text-[#6366f1]" />
                Original Audio
              </span>
              <span className="px-2.5 py-1 rounded-full bg-[#6366f1]/15 text-[#6366f1] font-medium">
                British RP — 87% match
              </span>
              <span className="flex items-center gap-1.5">
                <Waves className="w-3.5 h-3.5 text-[#ec4899]" />
                Converted Audio
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="px-4 py-12 border-y border-white/8">
        <div className="max-w-5xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map(({ value, label }) => (
            <div key={label} className="text-center">
              <div className="text-3xl font-bold gradient-text">{value}</div>
              <div className="text-slate-500 text-sm mt-1">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="px-4 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-bold text-slate-100 mb-4">
              Everything You Need to{" "}
              <span className="gradient-text">Sound Perfect</span>
            </h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              A complete suite of voice transformation tools built for professionals, learners, and creators.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map(({ icon: Icon, title, description, color, href }) => (
              <Link
                key={title}
                href={href}
                className="group glass-card p-6 hover:border-white/15 transition-all duration-300 hover:-translate-y-1"
              >
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110"
                  style={{ background: color + "22", border: `1px solid ${color}40` }}
                >
                  <Icon className="w-6 h-6" style={{ color }} />
                </div>
                <h3 className="text-slate-100 font-semibold text-lg mb-2">{title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{description}</p>
                <div
                  className="flex items-center gap-1 mt-4 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ color }}
                >
                  Try it <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="px-4 py-20 border-t border-white/8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-bold text-slate-100 mb-4">
              How It <span className="gradient-text">Works</span>
            </h2>
            <p className="text-slate-400 text-lg">Three simple steps to transform your voice.</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {steps.map(({ step, title, description, icon: Icon, color }) => (
              <div key={step} className="relative">
                <div className="glass-card p-6 h-full">
                  <div
                    className="text-6xl font-black mb-4 opacity-10"
                    style={{ color }}
                  >
                    {step}
                  </div>
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                    style={{ background: color + "22" }}
                  >
                    <Icon className="w-5 h-5" style={{ color }} />
                  </div>
                  <h3 className="text-slate-100 font-bold text-lg mb-2">{title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust */}
      <section className="px-4 py-16 border-t border-white/8">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {[
              {
                icon: Zap,
                title: "Real-Time Processing",
                desc: "Sub-100ms latency ensures seamless, instant voice transformation without noticeable delays.",
                color: "#f59e0b",
              },
              {
                icon: Shield,
                title: "Privacy First",
                desc: "Audio is processed locally where possible. No recordings stored without your explicit consent.",
                color: "#10b981",
              },
              {
                icon: Users,
                title: "For Everyone",
                desc: "Whether you're a professional, language learner, content creator, or just curious — Tone Weaver is for you.",
                color: "#6366f1",
              },
            ].map(({ icon: Icon, title, desc, color }) => (
              <div key={title} className="glass-card p-5 flex gap-4">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: color + "22" }}
                >
                  <Icon className="w-5 h-5" style={{ color }} />
                </div>
                <div>
                  <h4 className="text-slate-200 font-semibold mb-1">{title}</h4>
                  <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="px-4 py-20">
        <div className="max-w-3xl mx-auto text-center">
          <div className="glass-card p-12 relative overflow-hidden">
            <div className="absolute inset-0 gradient-bg opacity-5" />
            <h2 className="text-4xl font-bold text-slate-100 mb-4 relative">
              Ready to Transform Your Voice?
            </h2>
            <p className="text-slate-400 text-lg mb-8 relative">
              Join thousands of users experiencing the future of voice transformation.
            </p>
            <Link
              href="/record"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl gradient-bg text-white text-lg font-semibold hover:opacity-90 transition-all glow-primary relative"
            >
              <Mic2 className="w-5 h-5" />
              Get Started — It&apos;s Free
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
