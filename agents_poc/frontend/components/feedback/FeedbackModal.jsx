import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MessageSquare, Send, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import RatingSelector from './RatingSelector';
import ErrorCategorySelector from './ErrorCategorySelector';
import DetectiveThankYou from './DetectiveThankYou';

/**
 * Feedback Side Panel Component
 *
 * A side panel for collecting user feedback that doesn't block the agent response.
 * Features:
 * - Slides in from the right side
 * - Minimal backdrop blur so content remains visible
 * - Progress indicator at top
 * - Rating selector with 5 options
 * - Optional comment field
 * - Celebratory animation on submit
 *
 * Flow:
 * 1. User selects rating -> progress to 33%
 * 2. Comment field appears -> progress to 66%
 * 3. Submit -> progress to 100% -> show thank you
 */

export default function FeedbackModal({
    isOpen,
    onClose,
    onSubmit,
    agentType,
    agentColor = 'blue',
    originalInput,
    agentResponse
}) {
    const [step, setStep] = useState(1);
    const [rating, setRating] = useState(null);
    const [errorCategories, setErrorCategories] = useState([]);
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isComplete, setIsComplete] = useState(false);

    // Determine if error categories are required (for bad ratings)
    const requiresCategories = rating === 'terrible' || rating === 'bad';
    const canSubmit = rating && (!requiresCategories || errorCategories.length > 0);

    // Progress calculation
    const getProgress = () => {
        if (isComplete) return 100;
        if (isSubmitting) return 85;
        if (step === 2 && comment.length > 0) return 75;
        if (step === 2 && errorCategories.length > 0) return 60;
        if (step === 2) return 45;
        if (rating) return 30;
        return 0;
    };

    const handleRatingSelect = (selectedRating) => {
        setRating(selectedRating);
        setTimeout(() => setStep(2), 400);
    };

    const handleSubmit = async () => {
        if (!rating) return;

        setIsSubmitting(true);

        try {
            await onSubmit({
                agent_type: agentType,
                rating: rating,
                error_categories: errorCategories.length > 0 ? errorCategories : null,
                comment: comment || null,
                original_input: JSON.stringify(originalInput),
                agent_response: JSON.stringify(agentResponse),
            });

            setIsComplete(true);

            setTimeout(() => {
                onClose();
            }, 2500);
        } catch (error) {
            console.error('Failed to submit feedback:', error);
            setIsSubmitting(false);
        }
    };

    useEffect(() => {
        if (!isOpen) {
            const timeout = setTimeout(() => {
                setStep(1);
                setRating(null);
                setErrorCategories([]);
                setComment('');
                setIsComplete(false);
                setIsSubmitting(false);
            }, 300);
            return () => clearTimeout(timeout);
        }
    }, [isOpen]);

    const colorMap = {
        blue: {
            primary: '#3b82f6',
            gradient: 'from-blue-500 to-blue-600',
            border: 'border-blue-500/40',
            bg: 'bg-blue-500/10',
            icon: 'text-blue-400'
        },
        orange: {
            primary: '#f97316',
            gradient: 'from-orange-500 to-orange-600',
            border: 'border-orange-500/40',
            bg: 'bg-orange-500/10',
            icon: 'text-orange-400'
        },
        green: {
            primary: '#10b981',
            gradient: 'from-emerald-500 to-emerald-600',
            border: 'border-emerald-500/40',
            bg: 'bg-emerald-500/10',
            icon: 'text-emerald-400'
        }
    };

    const colors = colorMap[agentColor] || colorMap.blue;
    const progress = getProgress();

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Light backdrop */}
                    <motion.div
                        className="fixed inset-0 bg-black/20 z-40"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                    />

                    {/* Compact modal positioned to the right of the agent card */}
                    <motion.div
                        className="absolute -top-2 left-full ml-4 z-50 w-80"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    >
                        <div
                            className={`bg-slate-900/95 backdrop-blur-sm border ${colors.border} rounded-xl overflow-hidden`}
                            style={{ boxShadow: '0 10px 40px rgba(0,0,0,0.3)' }}
                        >
                            {/* Progress bar at top */}
                            <div className="h-1 bg-slate-800 relative overflow-hidden">
                                <motion.div
                                    className={`h-full bg-gradient-to-r ${colors.gradient}`}
                                    initial={{ width: '0%' }}
                                    animate={{ width: `${progress}%` }}
                                    transition={{ duration: 0.3 }}
                                />
                            </div>

                            {/* Header */}
                            <div className="p-4 border-b border-slate-800">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Star className={`w-5 h-5 ${colors.icon}`} />
                                        <span className="text-base font-semibold text-white">
                                            Rate Response
                                        </span>
                                    </div>
                                    <button
                                        onClick={onClose}
                                        className="text-slate-400 hover:text-white transition-colors p-1.5 rounded hover:bg-slate-800"
                                        disabled={isSubmitting}
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                                <p className="text-sm text-slate-500 mt-1">
                                    Help improve AI quality
                                </p>
                            </div>

                            {/* Content */}
                            <div className="p-4">
                                <AnimatePresence mode="wait">
                                    {!isComplete ? (
                                        <motion.div
                                            key="feedback-form"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="space-y-4"
                                        >
                                            {/* Rating */}
                                            <div>
                                                <p className="text-sm text-slate-400 mb-3">
                                                    How was this response?
                                                </p>
                                                <RatingSelector
                                                    value={rating}
                                                    onChange={handleRatingSelect}
                                                    disabled={isSubmitting}
                                                    compact={true}
                                                />
                                            </div>

                                            {/* Error Categories */}
                                            <AnimatePresence>
                                                {step >= 2 && (
                                                    <motion.div
                                                        initial={{ opacity: 0, height: 0 }}
                                                        animate={{ opacity: 1, height: 'auto' }}
                                                        exit={{ opacity: 0, height: 0 }}
                                                        transition={{ duration: 0.2 }}
                                                    >
                                                        <ErrorCategorySelector
                                                            agentType={agentType}
                                                            agentColor={agentColor}
                                                            selectedCategories={errorCategories}
                                                            onChange={setErrorCategories}
                                                            disabled={isSubmitting}
                                                            required={requiresCategories}
                                                        />
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>

                                            {/* Comment */}
                                            <AnimatePresence>
                                                {step >= 2 && (
                                                    <motion.div
                                                        initial={{ opacity: 0, height: 0 }}
                                                        animate={{ opacity: 1, height: 'auto' }}
                                                        exit={{ opacity: 0, height: 0 }}
                                                        transition={{ duration: 0.2 }}
                                                    >
                                                        <p className="text-sm text-slate-400 mb-2">
                                                            Additional feedback (optional)
                                                        </p>
                                                        <Textarea
                                                            value={comment}
                                                            onChange={(e) => setComment(e.target.value)}
                                                            placeholder="What could be improved?"
                                                            className="bg-slate-800/70 border-slate-700 text-white text-sm placeholder:text-slate-500 resize-none focus:ring-1 focus:ring-blue-500/50 min-h-[80px]"
                                                            rows={3}
                                                            disabled={isSubmitting}
                                                            maxLength={500}
                                                        />
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>

                                            {/* Submit Button */}
                                            {step >= 2 && (
                                                <motion.div
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                >
                                                    <Button
                                                        onClick={handleSubmit}
                                                        disabled={!canSubmit || isSubmitting}
                                                        className={`w-full bg-gradient-to-r ${colors.gradient} hover:opacity-90 text-white py-2.5 rounded-lg text-sm font-medium`}
                                                    >
                                                        {isSubmitting ? (
                                                            <span className="flex items-center gap-2">
                                                                <motion.div
                                                                    animate={{ rotate: 360 }}
                                                                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                                                >
                                                                    <Send className="w-4 h-4" />
                                                                </motion.div>
                                                                Submitting...
                                                            </span>
                                                        ) : (
                                                            <span className="flex items-center justify-center gap-2">
                                                                <Send className="w-4 h-4" />
                                                                Submit Feedback
                                                            </span>
                                                        )}
                                                    </Button>
                                                </motion.div>
                                            )}
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            key="thank-you"
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                        >
                                            <DetectiveThankYou agentColor={agentColor} compact={false} />
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
