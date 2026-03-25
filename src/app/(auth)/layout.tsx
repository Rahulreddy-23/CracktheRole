export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="auth-layout min-h-screen flex">
      {/* ── Decorative left panel (desktop only) ── */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-[55%] relative overflow-hidden flex-col items-center justify-center p-12">
        {/* Animated gradient mesh */}
        <div className="auth-gradient-bg absolute inset-0" />
        {/* Grain overlay */}
        <div className="grain-overlay absolute inset-0" />

        {/* Content */}
        <div className="relative z-10 max-w-sm text-center">
          {/* Logo */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg glow-blue">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-primary-foreground">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
            </div>
            <span className="text-2xl font-bold text-foreground">CrackTheRole</span>
          </div>

          {/* Tagline */}
          <h2 className="text-3xl font-bold text-foreground mb-3 leading-tight">
            Your AI<br />
            <span className="text-gradient">Interview Coach</span>
          </h2>
          <p className="text-muted-foreground text-sm mb-10 leading-relaxed">
            Practice real interview questions, get AI feedback, and build the perfect resume — all in one place.
          </p>

          {/* Feature pills */}
          <div className="flex flex-wrap justify-center gap-2">
            {["AI Mock Interviews", "Smart Resume Builder", "Code Execution"].map((feat) => (
              <span
                key={feat}
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium glass border border-primary/20 text-primary"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block" />
                {feat}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right: Auth form ── */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12 bg-background relative">
        {/* Subtle grain on right side too */}
        <div className="grain-overlay absolute inset-0 opacity-50" />
        <div className="relative z-10 w-full max-w-md">{children}</div>
      </div>

      <style>{`
        .auth-gradient-bg {
          background:
            radial-gradient(ellipse 80% 60% at 20% 50%, rgba(59,130,246,0.18) 0%, transparent 60%),
            radial-gradient(ellipse 60% 80% at 80% 20%, rgba(139,92,246,0.12) 0%, transparent 55%),
            radial-gradient(ellipse 70% 60% at 50% 80%, rgba(6,182,212,0.10) 0%, transparent 60%),
            hsl(240 10% 5%);
          animation: meshShift 12s ease-in-out infinite alternate;
        }
        @keyframes meshShift {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .grain-overlay {
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");
          background-repeat: repeat;
          background-size: 128px 128px;
          pointer-events: none;
          opacity: 0.06;
        }
      `}</style>
    </div>
  );
}
