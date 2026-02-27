"use client";

import { useEffect, useRef } from "react";
import { Clock } from "lucide-react";
import { useInterviewStore } from "@/stores/interview-store";

export default function InterviewTimer() {
    const elapsedSeconds = useInterviewStore((s) => s.elapsedSeconds);
    const isTimerRunning = useInterviewStore((s) => s.isTimerRunning);
    const incrementTimer = useInterviewStore((s) => s.incrementTimer);

    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        if (isTimerRunning) {
            intervalRef.current = setInterval(() => {
                incrementTimer();
            }, 1000);
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [isTimerRunning, incrementTimer]);

    const mins = Math.floor(elapsedSeconds / 60);
    const secs = elapsedSeconds % 60;
    const display = `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;

    return (
        <div className="flex items-center gap-1.5 text-text-secondary font-mono text-sm tabular-nums">
            <Clock className="w-3.5 h-3.5" />
            <span>{display}</span>
        </div>
    );
}
