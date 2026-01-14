/**
 * API client for Safety Agent backend.
 *
 * Handles communication with the FastAPI backend to process
 * safety observations through the multi-agent pipeline.
 */

const API_BASE = import.meta.env.VITE_API_URL || ''; /*Delete http://localhost for a deafault nginx backend

/**
 * Analyze a safety observation through the AI pipeline.
 *
 * @param {Object} observation - The observation data from the form
 * @param {string} observation.site - Site location
 * @param {string} observation.potential - Observation potential (NEAR_MISS, etc.)
 * @param {string} observation.type - Observation type (UNSAFE_CONDITION, etc.)
 * @param {string} observation.description - Description of the observation
 * @param {string} [observation.tradeCategoryId] - Trade category ID
 * @param {string} [observation.tradePartnerId] - Trade partner ID
 * @param {string} [observation.photoId] - Photo ID
 * @param {string} [observation.observedAt] - ISO timestamp
 * @returns {Promise<PipelineResult>} The complete pipeline result
 */
export async function analyzeObservation(observation) {
    const response = await fetch(`${API_BASE}/api/observations/analyze`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(observation),
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
        throw new Error(error.detail || `API request failed with status ${response.status}`);
    }

    return response.json();
}

/**
 * Check API health status.
 *
 * @returns {Promise<{status: string, version: string}>}
 */
export async function checkHealth() {
    const response = await fetch(`${API_BASE}/api/health`);

    if (!response.ok) {
        throw new Error('API health check failed');
    }

    return response.json();
}

/**
 * Transform backend hazard data to frontend RiskAnalyzer format.
 *
 * @param {Object} hazard - Hazard from backend
 * @param {Object} observation - Original observation
 * @returns {Object} Data for RiskAnalyzer component
 */
export function transformHazardToRiskData(hazard, observation) {
    // Extract keywords from description
    const keywords = extractKeywords(hazard.description, observation.description);

    // Map taxonomy_ref to category name
    const category = mapTaxonomyToCategory(hazard.taxonomy_ref);

    return {
        hazard: hazard.description,
        category: category,
        keywords: keywords,
        confidence: Math.round(hazard.confidence * 100),
    };
}

/**
 * Transform backend scored hazard to frontend ScoreManager format.
 *
 * @param {Object} scoredHazard - ScoredHazard from backend
 * @returns {Object} Data for ScoreManager component
 */
export function transformScoredHazardToScoreData(scoredHazard) {
    const categoryMap = {
        'CRITICAL': { category: 'Critical', color: 'red' },
        'HIGH': { category: 'High', color: 'orange' },
        'MEDIUM': { category: 'Medium', color: 'yellow' },
        'LOW': { category: 'Low', color: 'green' },
    };

    const mapping = categoryMap[scoredHazard.priority] || categoryMap['MEDIUM'];

    return {
        severity: scoredHazard.severity,
        likelihood: scoredHazard.likelihood,
        riskScore: scoredHazard.rpn,
        category: mapping.category,
        color: mapping.color,
    };
}

/**
 * Transform backend action plan to frontend ActionPlanner format.
 *
 * @param {Object} actionPlan - ActionPlan from backend
 * @returns {Array} Array of action items for ActionPlanner component
 */
export function transformActionPlanToActions(actionPlan) {
    const priorityMap = {
        'ELIMINATION': 'Immediate',
        'SUBSTITUTION': 'Immediate',
        'ENGINEERING': 'Before Next Shift',
        'ADMINISTRATIVE': 'Daily',
        'PPE': 'Before Next Shift',
    };

    return actionPlan.tasks.map((task, index) => ({
        id: index + 1,
        title: task.title,
        description: task.description,
        oshaCode: actionPlan.standards_refs[0] || 'OSHA General Duty',
        priority: priorityMap[task.control_type] || 'Daily',
        controlType: task.control_type,
        responsibleRole: task.responsible_role,
        durationMinutes: task.duration_minutes,
        materials: task.material_requirements,
    }));
}

/**
 * Extract relevant keywords from hazard and observation descriptions.
 */
function extractKeywords(hazardDesc, observationDesc) {
    const commonSafetyTerms = [
        'scaffolding', 'fall', 'falling', 'slip', 'trip', 'electrical', 'chemical',
        'fire', 'machinery', 'equipment', 'guard', 'barrier', 'harness', 'ppe',
        'hazard', 'unsafe', 'exposed', 'unprotected', 'damaged', 'broken',
    ];

    const text = `${hazardDesc} ${observationDesc}`.toLowerCase();
    const found = commonSafetyTerms.filter(term => text.includes(term));

    // Return top 3-5 keywords
    return found.slice(0, Math.min(5, Math.max(3, found.length)));
}

/**
 * Map taxonomy reference to human-readable category.
 */
function mapTaxonomyToCategory(taxonomyRef) {
    const categoryMap = {
        'HAZ-FALL-001': 'Fall Protection / Scaffolding',
        'HAZ-FALL-002': 'Slip, Trip & Fall',
        'HAZ-ELEC-001': 'Electrical Safety',
        'HAZ-ELEC-002': 'Arc Flash / Shock',
        'HAZ-CHEM-001': 'Chemical Exposure',
        'HAZ-CHEM-002': 'Toxic Substances',
        'HAZ-MECH-001': 'Struck By / Caught In',
        'HAZ-MECH-002': 'Machinery Safety',
        'HAZ-ERGO-001': 'Ergonomic / Manual Handling',
        'HAZ-ERGO-002': 'Repetitive Motion',
        'HAZ-FIRE-001': 'Fire / Explosion',
        'HAZ-FIRE-002': 'Hot Work',
        'HAZ-GEN-001': 'General Safety',
        'HAZ-GEN-002': 'Housekeeping',
    };

    return categoryMap[taxonomyRef] || 'General Safety';
}

/**
 * Submit feedback for an agent response.
 *
 * @param {Object} feedback - The feedback data
 * @param {string} feedback.agent_type - Agent type (risk_analyzer, score_manager, action_planner)
 * @param {string} feedback.rating - Rating (terrible, bad, normal, good, amazing)
 * @param {string} [feedback.comment] - Optional comment
 * @param {string} feedback.original_input - JSON stringified input
 * @param {string} feedback.agent_response - JSON stringified response
 * @returns {Promise<Object>} The created feedback record
 */
export async function submitFeedback(feedback) {
    const response = await fetch(`${API_BASE}/api/feedback`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(feedback),
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
        throw new Error(error.detail || `Failed to submit feedback: ${response.status}`);
    }

    return response.json();
}

/**
 * Get feedback records with optional filtering.
 *
 * @param {Object} [options] - Filter options
 * @param {string} [options.agent_type] - Filter by agent type
 * @param {string} [options.rating] - Filter by rating
 * @param {number} [options.limit] - Maximum records to return (default: 100)
 * @returns {Promise<Array>} Array of feedback records
 */
export async function getFeedback(options = {}) {
    const params = new URLSearchParams();
    if (options.agent_type) params.append('agent_type', options.agent_type);
    if (options.rating) params.append('rating', options.rating);
    if (options.limit) params.append('limit', options.limit.toString());

    const url = `${API_BASE}/api/feedback${params.toString() ? '?' + params.toString() : ''}`;
    const response = await fetch(url);

    if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
        throw new Error(error.detail || `Failed to get feedback: ${response.status}`);
    }

    return response.json();
}

export default {
    analyzeObservation,
    checkHealth,
    transformHazardToRiskData,
    transformScoredHazardToScoreData,
    transformActionPlanToActions,
    submitFeedback,
    getFeedback,
};
