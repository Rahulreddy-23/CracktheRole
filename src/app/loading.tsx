export default function GlobalLoading() {
    return (
        <main className="min-h-screen bg-background flex flex-col items-center justify-center gap-6">
            {/* Pulsing logo text */}
            <div className="animate-pulse">
                <span className="text-3xl sm:text-4xl font-bold bg-linear-to-r from-brand-primary-light to-brand-secondary bg-clip-text text-transparent">
                    CrackTheRole
                </span>
            </div>

            {/* Animated dots */}
            <div className="flex items-center gap-1.5">
                {[0, 1, 2].map((i) => (
                    <span
                        key={i}
                        className="w-2 h-2 rounded-full bg-brand-primary"
                        style={{
                            animation: "dot-bounce 1.2s ease-in-out infinite",
                            animationDelay: `${i * 0.15}s`,
                        }}
                    />
                ))}
            </div>

            {/* Inline keyframe for the dot animation */}
            <style>{`
        @keyframes dot-bounce {
          0%, 80%, 100% { opacity: 0.25; transform: scale(0.8); }
          40% { opacity: 1; transform: scale(1.2); }
        }
      `}</style>
        </main>
    );
}
