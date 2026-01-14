import React from 'react';
import { motion } from 'framer-motion';

/**
 * Error Category Selector Component
 *
 * Displays agent-specific error category tags for feedback categorization.
 * Users can select multiple tags to indicate what type of issue they observed.
 *
 * Tags are different per agent type:
 * - Risk Analyzer: Hazard detection issues
 * - Score Manager: Scoring/priority issues
 * - Action Planner: Action plan quality issues
 */

const categoryConfig = {
    risk_analyzer: [
        { value: 'missed_hazard', label: 'Missed Hazard' },
        { value: 'wrong_hazard_type', label: 'Wrong Type' },
        { value: 'too_generic_hazard', label: 'Too Generic' },
        { value: 'false_positive', label: 'False Positive' },
        { value: 'missing_context', label: 'Missing Context' },
    ],
    score_manager: [
        { value: 'severity_too_high', label: 'Severity Too High' },
        { value: 'severity_too_low', label: 'Severity Too Low' },
        { value: 'likelihood_too_high', label: 'Likelihood Too High' },
        { value: 'likelihood_too_low', label: 'Likelihood Too Low' },
        { value: 'priority_wrong', label: 'Wrong Priority' },
    ],
    action_planner: [
        { value: 'plan_too_generic', label: 'Too Generic' },
        { value: 'plan_not_actionable', label: 'Not Actionable' },
        { value: 'missing_acceptance_criteria', label: 'Missing Criteria' },
        { value: 'citation_irrelevant_or_missing', label: 'Bad Citations' },
    ],
};

const colorMap = {
    blue: {
        selected: 'bg-blue-500/30 border-blue-500 text-blue-300',
        unselected: 'bg-slate-800/50 border-slate-600 text-slate-400 hover:border-slate-500 hover:bg-slate-700/50',
    },
    orange: {
        selected: 'bg-orange-500/30 border-orange-500 text-orange-300',
        unselected: 'bg-slate-800/50 border-slate-600 text-slate-400 hover:border-slate-500 hover:bg-slate-700/50',
    },
    green: {
        selected: 'bg-emerald-500/30 border-emerald-500 text-emerald-300',
        unselected: 'bg-slate-800/50 border-slate-600 text-slate-400 hover:border-slate-500 hover:bg-slate-700/50',
    },
};

export default function ErrorCategorySelector({
    agentType,
    agentColor = 'blue',
    selectedCategories = [],
    onChange,
    disabled = false,
    required = false,
}) {
    const categories = categoryConfig[agentType] || [];
    const colors = colorMap[agentColor] || colorMap.blue;

    const toggleCategory = (value) => {
        if (disabled) return;

        const isSelected = selectedCategories.includes(value);
        if (isSelected) {
            onChange(selectedCategories.filter((v) => v !== value));
        } else {
            onChange([...selectedCategories, value]);
        }
    };

    if (categories.length === 0) return null;

    return (
        <div>
            <p className="text-sm text-slate-400 mb-2">
                What was wrong?{' '}
                {required ? (
                    <span className="text-red-400 text-xs">(required)</span>
                ) : (
                    <span className="text-slate-500 text-xs">(optional)</span>
                )}
            </p>
            <div className="flex flex-wrap gap-1.5">
                {categories.map((category, index) => {
                    const isSelected = selectedCategories.includes(category.value);

                    return (
                        <motion.button
                            key={category.value}
                            onClick={() => toggleCategory(category.value)}
                            disabled={disabled}
                            className={`
                                px-2.5 py-1 rounded-full text-xs font-medium
                                border transition-all duration-150
                                ${isSelected ? colors.selected : colors.unselected}
                                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                            `}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.03 }}
                            whileHover={!disabled ? { scale: 1.05 } : {}}
                            whileTap={!disabled ? { scale: 0.95 } : {}}
                        >
                            {category.label}
                        </motion.button>
                    );
                })}
            </div>
        </div>
    );
}
