import React from 'react';
import { motion } from 'framer-motion';

/**
 * Circular Progress Component
 *
 * A progress bar that follows the modal border (rounded rectangle path).
 * Visual stages:
 * - 0-33%: Rating selected
 * - 33-66%: Comment section visible
 * - 66-100%: Submitted
 *
 * Uses SVG with animated strokeDashoffset and glow effect.
 */

export default function CircularProgress({ progress, color = 'blue', className = '' }) {
    const colorMap = {
        blue: '#3b82f6',
        orange: '#f97316',
        green: '#10b981'
    };

    const strokeColor = colorMap[color] || colorMap.blue;

    // SVG dimensions matching the modal
    const width = 100;
    const height = 100;
    const radius = 8;
    const strokeWidth = 2;
    const padding = strokeWidth / 2;

    // Calculate perimeter of rounded rectangle
    // Perimeter = 2*(width + height - 4*radius) + 2*PI*radius
    const straightLength = 2 * ((width - 2 * radius) + (height - 2 * radius));
    const cornerLength = 2 * Math.PI * radius;
    const perimeter = straightLength + cornerLength;

    // Stroke dash offset based on progress (reversed so it fills clockwise from top)
    const dashOffset = perimeter - (perimeter * progress) / 100;

    // Create the rounded rectangle path starting from top center
    const createRoundedRectPath = () => {
        const x = padding;
        const y = padding;
        const w = width - strokeWidth;
        const h = height - strokeWidth;
        const r = radius;

        return `
            M ${x + w / 2} ${y}
            L ${x + w - r} ${y}
            Q ${x + w} ${y} ${x + w} ${y + r}
            L ${x + w} ${y + h - r}
            Q ${x + w} ${y + h} ${x + w - r} ${y + h}
            L ${x + r} ${y + h}
            Q ${x} ${y + h} ${x} ${y + h - r}
            L ${x} ${y + r}
            Q ${x} ${y} ${x + r} ${y}
            L ${x + w / 2} ${y}
        `.trim();
    };

    const pathD = createRoundedRectPath();

    return (
        <div className={`absolute inset-0 pointer-events-none ${className}`}>
            <svg
                className="w-full h-full"
                viewBox={`0 0 ${width} ${height}`}
                preserveAspectRatio="none"
                style={{ overflow: 'visible' }}
            >
                <defs>
                    {/* Glow filter */}
                    <filter id={`glow-${color}`} x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                        <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>

                {/* Background track */}
                <path
                    d={pathD}
                    fill="none"
                    stroke="rgba(255,255,255,0.1)"
                    strokeWidth={strokeWidth}
                />

                {/* Animated progress */}
                <motion.path
                    d={pathD}
                    fill="none"
                    stroke={strokeColor}
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    strokeDasharray={perimeter}
                    initial={{ strokeDashoffset: perimeter }}
                    animate={{ strokeDashoffset: dashOffset }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    filter={`url(#glow-${color})`}
                />
            </svg>

            {/* Progress percentage indicator (optional, shows at corners) */}
            {progress > 0 && progress < 100 && (
                <motion.div
                    className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2"
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    <div
                        className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold"
                        style={{
                            backgroundColor: strokeColor,
                            boxShadow: `0 0 10px ${strokeColor}80`
                        }}
                    >
                        {Math.round(progress)}
                    </div>
                </motion.div>
            )}
        </div>
    );
}
