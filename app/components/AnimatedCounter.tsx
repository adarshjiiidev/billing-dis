"use client";

import { useEffect, useState } from "react";

export default function AnimatedCounter({ value, duration = 1500, prefix = "", suffix = "" }: { value: number, duration?: number, prefix?: string, suffix?: string }) {
    const [count, setCount] = useState(0);

    useEffect(() => {
        let startTime: number | null = null;
        let animationFrameId: number;

        const animate = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const progress = timestamp - startTime;
            const progressRatio = Math.min(progress / duration, 1);

            // easeOutExpo
            const easeOut = progressRatio === 1 ? 1 : 1 - Math.pow(2, -10 * progressRatio);

            setCount(Math.floor(easeOut * value));

            if (progress < duration) {
                animationFrameId = requestAnimationFrame(animate);
            }
        };

        animationFrameId = requestAnimationFrame(animate);

        return () => cancelAnimationFrame(animationFrameId);
    }, [value, duration]);

    return (
        <span className="tabular-nums">
            {prefix}{count.toLocaleString()}{suffix}
        </span>
    );
}
