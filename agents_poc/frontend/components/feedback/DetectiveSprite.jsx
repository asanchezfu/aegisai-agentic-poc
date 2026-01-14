import React from 'react';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';

/**
 * Detective Sprite Component
 *
 * A clear, recognizable feedback button with magnifying glass icon.
 * Features:
 * - Clean magnifying glass design (universally recognized for "review/inspect")
 * - Glow effect on hover (uses agent color: blue/orange/green)
 * - Tooltip: "Rate this response"
 * - Click opens feedback modal
 */

export default function DetectiveSprite({
    agentColor = 'blue',
    isHovered = false,
    onClick,
    position = 'top-right'
}) {
    const colorMap = {
        blue: {
            primary: '#3b82f6',
            glow: 'rgba(59, 130, 246, 0.6)',
            bg: 'rgba(59, 130, 246, 0.15)',
            border: 'rgba(59, 130, 246, 0.5)'
        },
        orange: {
            primary: '#f97316',
            glow: 'rgba(249, 115, 22, 0.6)',
            bg: 'rgba(249, 115, 22, 0.15)',
            border: 'rgba(249, 115, 22, 0.5)'
        },
        green: {
            primary: '#10b981',
            glow: 'rgba(16, 185, 129, 0.6)',
            bg: 'rgba(16, 185, 129, 0.15)',
            border: 'rgba(16, 185, 129, 0.5)'
        }
    };

    const colors = colorMap[agentColor] || colorMap.blue;

    const positionClasses = {
        'top-right': 'absolute -top-3 -right-3',
        'bottom-right': 'absolute -bottom-3 -right-3'
    };

    return (
        <motion.div
            className={`${positionClasses[position]} cursor-pointer z-20`}
            onClick={onClick}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
        >
            {/* Subtle floating animation when idle */}
            <motion.div
                animate={{
                    y: isHovered ? 0 : [0, -3, 0],
                }}
                transition={{
                    duration: 2.5,
                    repeat: isHovered ? 0 : Infinity,
                    ease: 'easeInOut'
                }}
            >
                {/* Button container */}
                <motion.div
                    className="relative flex items-center justify-center w-11 h-11 rounded-full"
                    style={{
                        backgroundColor: isHovered ? colors.bg : 'rgba(30, 41, 59, 0.9)',
                        border: `2px solid ${isHovered ? colors.primary : colors.border}`,
                    }}
                    animate={{
                        boxShadow: isHovered
                            ? `0 0 20px ${colors.glow}, 0 0 40px ${colors.glow}`
                            : `0 0 10px ${colors.glow}`,
                    }}
                    transition={{ duration: 0.2 }}
                >
                    {/* Magnifying glass icon */}
                    <motion.div
                        animate={{
                            rotate: isHovered ? 15 : 0,
                            scale: isHovered ? 1.1 : 1
                        }}
                        transition={{ duration: 0.2 }}
                    >
                        <Search
                            className="w-5 h-5"
                            style={{ color: colors.primary }}
                            strokeWidth={2.5}
                        />
                    </motion.div>

                    {/* Star badge indicator */}
                    <motion.div
                        className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[10px]"
                        style={{
                            backgroundColor: colors.primary,
                            color: 'white',
                            fontWeight: 'bold'
                        }}
                        animate={{
                            scale: isHovered ? [1, 1.2, 1] : 1
                        }}
                        transition={{ duration: 0.3 }}
                    >
                        {String.fromCodePoint(0x2605)}
                    </motion.div>

                    {/* Pulse ring animation */}
                    {isHovered && (
                        <motion.div
                            className="absolute inset-0 rounded-full"
                            style={{ border: `2px solid ${colors.primary}` }}
                            initial={{ scale: 1, opacity: 0.8 }}
                            animate={{ scale: 1.5, opacity: 0 }}
                            transition={{ duration: 0.6, repeat: Infinity }}
                        />
                    )}
                </motion.div>
            </motion.div>

            {/* Tooltip */}
            <motion.div
                className="absolute -bottom-9 left-1/2 transform -translate-x-1/2 whitespace-nowrap pointer-events-none"
                initial={{ opacity: 0, y: -5 }}
                animate={{
                    opacity: isHovered ? 1 : 0,
                    y: isHovered ? 0 : -5
                }}
                transition={{ duration: 0.2 }}
            >
                <span
                    className="text-xs font-medium px-3 py-1.5 rounded-lg shadow-lg"
                    style={{
                        backgroundColor: 'rgba(30, 41, 59, 0.95)',
                        color: colors.primary,
                        border: `1px solid ${colors.border}`
                    }}
                >
                    Rate this response
                </span>
            </motion.div>
        </motion.div>
    );
}
