import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Heart, Star } from 'lucide-react';

/**
 * Detective Thank You Component
 *
 * Celebratory animation shown after successful feedback submission.
 * Features:
 * - Animated happy detective SVG (smiling, thumbs up)
 * - Confetti particles (stars, hearts, sparkles)
 * - Thank you message
 * - Auto-closes modal after animation
 */

const thankYouMessages = [
    "Thanks for helping me improve!",
    "Your feedback is invaluable!",
    "Case closed! Thanks, detective!",
    "You're making AI safer!"
];

export default function DetectiveThankYou({ agentColor = 'blue', compact = false }) {
    const colorMap = {
        blue: { primary: '#3b82f6', accent: '#60a5fa' },
        orange: { primary: '#f97316', accent: '#fb923c' },
        green: { primary: '#10b981', accent: '#34d399' }
    };

    const colors = colorMap[agentColor] || colorMap.blue;

    // Random message (memoized to stay consistent during animation)
    const message = useMemo(() =>
        thankYouMessages[Math.floor(Math.random() * thankYouMessages.length)],
    []);

    // Generate confetti particles
    const particles = useMemo(() =>
        Array.from({ length: compact ? 8 : 15 }, (_, i) => ({
            id: i,
            x: Math.random() * (compact ? 100 : 200) - (compact ? 50 : 100),
            y: Math.random() * (compact ? -60 : -120) - (compact ? 15 : 30),
            rotation: Math.random() * 360,
            scale: 0.5 + Math.random() * 0.5,
            delay: Math.random() * 0.3,
            type: i % 3 // 0: star, 1: sparkle, 2: heart
        })),
    [compact]);

    return (
        <motion.div
            className={`text-center ${compact ? 'py-3' : 'py-6'} relative overflow-hidden`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
        >
            {/* Confetti particles */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {particles.map((particle) => (
                    <motion.div
                        key={particle.id}
                        className="absolute left-1/2 top-1/2"
                        initial={{
                            x: 0,
                            y: 0,
                            scale: 0,
                            rotate: 0,
                            opacity: 1
                        }}
                        animate={{
                            x: particle.x,
                            y: particle.y,
                            scale: particle.scale,
                            rotate: particle.rotation,
                            opacity: 0
                        }}
                        transition={{
                            duration: 1.5,
                            delay: particle.delay,
                            ease: 'easeOut'
                        }}
                    >
                        {particle.type === 0 ? (
                            <Star
                                className="w-4 h-4"
                                style={{ color: colors.primary }}
                                fill={colors.primary}
                            />
                        ) : particle.type === 1 ? (
                            <Sparkles
                                className="w-4 h-4"
                                style={{ color: colors.accent }}
                            />
                        ) : (
                            <Heart
                                className="w-3 h-3"
                                style={{ color: colors.primary }}
                                fill={colors.primary}
                            />
                        )}
                    </motion.div>
                ))}
            </div>

            {/* Animated Happy Detective */}
            <motion.div
                className={`relative inline-block ${compact ? 'mb-2' : 'mb-4'}`}
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', damping: 12, stiffness: 100 }}
            >
                {/* Pulsing glow ring */}
                <motion.div
                    className="absolute inset-0 rounded-full"
                    style={{
                        background: `radial-gradient(circle, ${colors.primary}30 0%, transparent 70%)`
                    }}
                    animate={{
                        scale: [1, 1.3, 1],
                        opacity: [0.5, 0.8, 0.5]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                />

                {/* Detective SVG */}
                <motion.svg
                    width={compact ? '50' : '80'}
                    height={compact ? '50' : '80'}
                    viewBox="0 0 48 48"
                    className="mx-auto relative z-10"
                    animate={{ y: [0, -4, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                >
                    {/* Face background */}
                    <circle
                        cx="24"
                        cy="26"
                        r="14"
                        fill="#1e293b"
                        stroke={colors.primary}
                        strokeWidth="2"
                    />

                    {/* Hat with bounce */}
                    <motion.path
                        d="M10 22 L24 10 L38 22 L40 22 L40 26 L8 26 L8 22 Z"
                        fill={colors.primary}
                        animate={{ y: [0, -2, 0] }}
                        transition={{ duration: 0.6, repeat: 3, repeatDelay: 0.5 }}
                    />

                    {/* Hat band */}
                    <rect x="8" y="24" width="32" height="2" fill={colors.accent} opacity="0.6" />

                    {/* Happy closed eyes (curved lines) */}
                    <motion.path
                        d="M17 28 Q19 25 21 28"
                        stroke={colors.accent}
                        strokeWidth="2.5"
                        fill="none"
                        strokeLinecap="round"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 0.3, delay: 0.3 }}
                    />
                    <motion.path
                        d="M27 28 Q29 25 31 28"
                        stroke={colors.accent}
                        strokeWidth="2.5"
                        fill="none"
                        strokeLinecap="round"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 0.3, delay: 0.4 }}
                    />

                    {/* Big happy smile */}
                    <motion.path
                        d="M17 33 Q24 40 31 33"
                        stroke={colors.accent}
                        strokeWidth="2.5"
                        fill="none"
                        strokeLinecap="round"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 0.5, delay: 0.5 }}
                    />

                    {/* Blush marks */}
                    <circle cx="14" cy="32" r="2" fill={colors.primary} opacity="0.4" />
                    <circle cx="34" cy="32" r="2" fill={colors.primary} opacity="0.4" />

                    {/* Thumbs up */}
                    <motion.g
                        initial={{ x: 15, y: 10, scale: 0, opacity: 0 }}
                        animate={{ x: 0, y: 0, scale: 1, opacity: 1 }}
                        transition={{ delay: 0.6, type: 'spring', stiffness: 200 }}
                    >
                        <circle cx="40" cy="38" r="6" fill={colors.primary} />
                        <text x="37" y="41" fontSize="8">
                            {String.fromCodePoint(0x1F44D)}
                        </text>
                    </motion.g>
                </motion.svg>
            </motion.div>

            {/* Thank You Text */}
            <motion.h4
                className={`${compact ? 'text-base' : 'text-xl'} font-bold text-white ${compact ? 'mb-1' : 'mb-2'}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
            >
                Thank You!
            </motion.h4>

            <motion.p
                className={`text-slate-400 ${compact ? 'text-xs' : ''}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
            >
                {message}
            </motion.p>

            {/* Decorative line */}
            {!compact && (
                <motion.div
                    className="mt-4 h-1 mx-auto rounded-full"
                    style={{ backgroundColor: colors.primary }}
                    initial={{ width: 0 }}
                    animate={{ width: '60%' }}
                    transition={{ delay: 0.8, duration: 0.5 }}
                />
            )}
        </motion.div>
    );
}
