/**
 * Shared animation configurations for the Feedback System
 *
 * Centralized Framer Motion animation variants for consistency
 * across all feedback components.
 */

// Modal entrance/exit animations
export const modalVariants = {
    initial: { opacity: 0, scale: 0.9, y: 20 },
    animate: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.9, y: 20 }
};

export const modalTransition = {
    type: 'spring',
    damping: 25,
    stiffness: 300
};

// Backdrop fade
export const backdropVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 }
};

// Detective sprite hover states
export const detectiveVariants = {
    rest: {
        scale: 1,
        filter: 'none'
    },
    hover: {
        scale: 1.15,
        transition: { duration: 0.2 }
    },
    tap: {
        scale: 0.95
    }
};

// Floating animation for idle detective
export const floatingAnimation = {
    y: [0, -3, 0],
    transition: {
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut'
    }
};

// Rating button selection animation
export const ratingSelectVariants = {
    initial: { opacity: 0, y: 20 },
    animate: (i) => ({
        opacity: 1,
        y: 0,
        transition: { delay: i * 0.05 }
    }),
    selected: {
        scale: [1, 1.3, 1],
        rotate: [0, 10, -10, 0],
        transition: { duration: 0.4 }
    }
};

// Rating button hover effect generator
export const ratingHoverEffect = (color, scale = 1.1) => ({
    scale,
    boxShadow: `0 0 20px ${color}40`
});

// Circular progress animation
export const progressVariants = {
    initial: (perimeter) => ({ strokeDashoffset: perimeter }),
    animate: (dashOffset) => ({
        strokeDashoffset: dashOffset,
        transition: { duration: 0.5, ease: 'easeOut' }
    })
};

// Thank you celebration animations
export const celebrationVariants = {
    detective: {
        initial: { scale: 0, rotate: -180 },
        animate: { scale: 1, rotate: 0 },
        transition: { type: 'spring', damping: 12, stiffness: 100 }
    },
    bounce: {
        y: [0, -4, 0],
        transition: { duration: 1.5, repeat: Infinity, ease: 'easeInOut' }
    }
};

// Confetti particle animation generator
export const confettiVariants = (particle) => ({
    initial: {
        x: 0,
        y: 0,
        scale: 0,
        rotate: 0,
        opacity: 1
    },
    animate: {
        x: particle.x,
        y: particle.y,
        scale: particle.scale,
        rotate: particle.rotation,
        opacity: 0
    },
    transition: {
        duration: 1.5,
        delay: particle.delay,
        ease: 'easeOut'
    }
});

// Glow pulse effect
export const glowPulseVariants = {
    animate: {
        scale: [1, 1.3, 1],
        opacity: [0.5, 0.8, 0.5]
    },
    transition: {
        duration: 2,
        repeat: Infinity
    }
};

// Stagger children animation
export const staggerContainerVariants = {
    animate: {
        transition: {
            staggerChildren: 0.05
        }
    }
};

// Slide up fade in
export const slideUpFadeIn = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.3 }
};

// Scale fade in
export const scaleFadeIn = {
    initial: { opacity: 0, scale: 0 },
    animate: { opacity: 1, scale: 1 },
    transition: { type: 'spring', stiffness: 500, damping: 30 }
};

// Expand height animation
export const expandHeight = {
    initial: { opacity: 0, height: 0 },
    animate: { opacity: 1, height: 'auto' },
    exit: { opacity: 0, height: 0 },
    transition: { duration: 0.3 }
};

// Spinner rotation
export const spinnerVariants = {
    animate: {
        rotate: 360,
        transition: {
            duration: 1,
            repeat: Infinity,
            ease: 'linear'
        }
    }
};

// Path drawing animation (for SVG strokes)
export const drawPath = {
    initial: { pathLength: 0 },
    animate: { pathLength: 1 },
    transition: { duration: 0.5 }
};

// Agent-specific color configurations
export const agentColors = {
    blue: {
        primary: '#3b82f6',
        accent: '#60a5fa',
        glow: 'rgba(59, 130, 246, 0.5)',
        gradient: 'from-blue-500 to-blue-600'
    },
    orange: {
        primary: '#f97316',
        accent: '#fb923c',
        glow: 'rgba(249, 115, 22, 0.5)',
        gradient: 'from-orange-500 to-orange-600'
    },
    green: {
        primary: '#10b981',
        accent: '#34d399',
        glow: 'rgba(16, 185, 129, 0.5)',
        gradient: 'from-emerald-500 to-emerald-600'
    }
};

// Rating configurations with colors and emojis
export const ratingConfig = [
    {
        value: 'terrible',
        label: 'Terrible',
        color: 'rgb(239, 68, 68)',
        emoji: '\u{1F61E}'
    },
    {
        value: 'bad',
        label: 'Bad',
        color: 'rgb(249, 115, 22)',
        emoji: '\u{1F615}'
    },
    {
        value: 'normal',
        label: 'Normal',
        color: 'rgb(234, 179, 8)',
        emoji: '\u{1F610}'
    },
    {
        value: 'good',
        label: 'Good',
        color: 'rgb(132, 204, 22)',
        emoji: '\u{1F642}'
    },
    {
        value: 'amazing',
        label: 'Amazing',
        color: 'rgb(34, 197, 94)',
        emoji: '\u{1F929}'
    }
];
