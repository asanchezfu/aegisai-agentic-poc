import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import DetectiveSprite from './DetectiveSprite';
import FeedbackModal from './FeedbackModal';
import { submitFeedback } from '@/services/api';

/**
 * Feedback Wrapper Component
 *
 * Wraps any agent component to add feedback functionality.
 * Shows a detective sprite that opens a feedback modal when clicked.
 *
 * IMPORTANT: Always renders children the same way to prevent re-mounting
 * and double animations. Only the detective sprite appears/disappears.
 *
 * Props:
 * - children: The agent component to wrap
 * - agentType: 'risk_analyzer' | 'score_manager' | 'action_planner'
 * - agentColor: 'blue' | 'orange' | 'green'
 * - originalInput: The input that was given to the agent
 * - agentResponse: The response from the agent
 * - enabled: Whether feedback button is visible (appears when agent is complete)
 */
export default function FeedbackWrapper({
    children,
    agentType,
    agentColor,
    originalInput,
    agentResponse,
    enabled = false
}) {
    const [isHovered, setIsHovered] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleSubmit = async (feedbackData) => {
        return await submitFeedback(feedbackData);
    };

    // Always render the same structure to prevent re-mounting children
    return (
        <div
            className="relative"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {children}

            {/* Only show detective sprite when enabled */}
            <AnimatePresence>
                {enabled && (
                    <DetectiveSprite
                        agentColor={agentColor}
                        isHovered={isHovered}
                        onClick={() => setIsModalOpen(true)}
                        position="top-right"
                    />
                )}
            </AnimatePresence>

            <FeedbackModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleSubmit}
                agentType={agentType}
                agentColor={agentColor}
                originalInput={originalInput}
                agentResponse={agentResponse}
            />
        </div>
    );
}
