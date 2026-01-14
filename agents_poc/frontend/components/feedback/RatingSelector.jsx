import React from 'react';
import { motion } from 'framer-motion';

/**
 * Rating Selector Component
 *
 * 5 rating options with unique colors and hover behaviors:
 * - Terrible (1): Red - Disappointed face
 * - Bad (2): Orange - Slight frown
 * - Normal (3): Yellow - Neutral
 * - Good (4): Lime - Smile
 * - Amazing (5): Green - Star eyes
 */

const ratings = [
    {
        value: 'terrible',
        label: 'Terrible',
        color: 'rgb(239, 68, 68)',
        bgClass: 'bg-red-500/20',
        borderClass: 'border-red-500',
        hoverBgClass: 'hover:bg-red-500/30',
        emoji: String.fromCodePoint(0x1F61E),
        hoverScale: 1.05
    },
    {
        value: 'bad',
        label: 'Bad',
        color: 'rgb(249, 115, 22)',
        bgClass: 'bg-orange-500/20',
        borderClass: 'border-orange-500',
        hoverBgClass: 'hover:bg-orange-500/30',
        emoji: String.fromCodePoint(0x1F615),
        hoverScale: 1.08
    },
    {
        value: 'normal',
        label: 'Normal',
        color: 'rgb(234, 179, 8)',
        bgClass: 'bg-yellow-500/20',
        borderClass: 'border-yellow-500',
        hoverBgClass: 'hover:bg-yellow-500/30',
        emoji: String.fromCodePoint(0x1F610),
        hoverScale: 1.1
    },
    {
        value: 'good',
        label: 'Good',
        color: 'rgb(132, 204, 22)',
        bgClass: 'bg-lime-500/20',
        borderClass: 'border-lime-500',
        hoverBgClass: 'hover:bg-lime-500/30',
        emoji: String.fromCodePoint(0x1F642),
        hoverScale: 1.12
    },
    {
        value: 'amazing',
        label: 'Amazing',
        color: 'rgb(34, 197, 94)',
        bgClass: 'bg-green-500/20',
        borderClass: 'border-green-500',
        hoverBgClass: 'hover:bg-green-500/30',
        emoji: String.fromCodePoint(0x1F929),
        hoverScale: 1.15
    },
];

export default function RatingSelector({ value, onChange, disabled = false, compact = false }) {
    return (
        <div className="flex justify-between gap-1">
            {ratings.map((rating, index) => {
                const isSelected = value === rating.value;

                return (
                    <motion.button
                        key={rating.value}
                        onClick={() => !disabled && onChange(rating.value)}
                        disabled={disabled}
                        className={`
                            relative flex-1 flex flex-col items-center ${compact ? 'gap-1 p-2' : 'gap-2 p-3'} rounded-lg
                            border ${compact ? 'border' : 'border-2'} transition-colors duration-200
                            ${isSelected
                                ? `${rating.bgClass} ${rating.borderClass}`
                                : 'border-slate-700 bg-slate-800/30 hover:border-slate-600'
                            }
                            ${rating.hoverBgClass}
                            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                        `}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.03 }}
                        whileHover={!disabled ? {
                            scale: compact ? 1.05 : rating.hoverScale,
                            boxShadow: `0 0 15px ${rating.color}40`
                        } : {}}
                        whileTap={!disabled ? { scale: 0.95 } : {}}
                    >
                        {/* Emoji */}
                        <motion.span
                            className={compact ? 'text-lg' : 'text-2xl'}
                            animate={isSelected ? {
                                scale: [1, 1.2, 1],
                                rotate: [0, 5, -5, 0]
                            } : {}}
                            transition={{ duration: 0.3 }}
                        >
                            {rating.emoji}
                        </motion.span>

                        {/* Label */}
                        <span className={`${compact ? 'text-[10px]' : 'text-xs'} font-medium ${
                            isSelected ? 'text-white' : 'text-slate-400'
                        }`}>
                            {rating.label}
                        </span>

                        {/* Selection indicator dot */}
                        {isSelected && (
                            <motion.div
                                className={`absolute -bottom-0.5 left-1/2 -translate-x-1/2 ${compact ? 'w-1.5 h-1.5' : 'w-2 h-2'} rounded-full`}
                                style={{ backgroundColor: rating.color }}
                                layoutId="rating-indicator"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                            />
                        )}
                    </motion.button>
                );
            })}
        </div>
    );
}
