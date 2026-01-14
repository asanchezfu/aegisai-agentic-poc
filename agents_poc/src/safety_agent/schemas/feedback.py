"""
Feedback schema for agent response ratings.

Captures user feedback on agent responses to improve AI quality.
"""

from datetime import datetime
from enum import Enum
from typing import Optional
from uuid import uuid4

from pydantic import BaseModel, Field


class AgentType(str, Enum):
    """Agent type identifier."""
    RISK_ANALYZER = "risk_analyzer"
    SCORE_MANAGER = "score_manager"
    ACTION_PLANNER = "action_planner"


class Rating(str, Enum):
    """Feedback rating values."""
    TERRIBLE = "terrible"
    BAD = "bad"
    NORMAL = "normal"
    GOOD = "good"
    AMAZING = "amazing"


class ErrorCategory(str, Enum):
    """Error category tags for categorizing AI agent issues."""
    # Risk Analyzer categories
    MISSED_HAZARD = "missed_hazard"
    WRONG_HAZARD_TYPE = "wrong_hazard_type"
    TOO_GENERIC_HAZARD = "too_generic_hazard"
    FALSE_POSITIVE = "false_positive"
    MISSING_CONTEXT = "missing_context"
    # Score Manager categories
    SEVERITY_TOO_HIGH = "severity_too_high"
    SEVERITY_TOO_LOW = "severity_too_low"
    LIKELIHOOD_TOO_HIGH = "likelihood_too_high"
    LIKELIHOOD_TOO_LOW = "likelihood_too_low"
    PRIORITY_WRONG = "priority_wrong"
    # Action Planner categories
    PLAN_TOO_GENERIC = "plan_too_generic"
    PLAN_NOT_ACTIONABLE = "plan_not_actionable"
    MISSING_ACCEPTANCE_CRITERIA = "missing_acceptance_criteria"
    CITATION_IRRELEVANT_OR_MISSING = "citation_irrelevant_or_missing"


class FeedbackCreate(BaseModel):
    """Request model for submitting feedback."""
    agent_type: AgentType
    rating: Rating
    comment: Optional[str] = Field(None, max_length=1000)
    error_categories: Optional[list[str]] = Field(default=None)
    original_input: str  # JSON stringified
    agent_response: str  # JSON stringified
    session_id: Optional[str] = None
    pipeline_run_id: Optional[str] = None


class Feedback(BaseModel):
    """Complete feedback record."""
    id: str = Field(default_factory=lambda: str(uuid4()))
    created_at: datetime = Field(default_factory=datetime.now)
    agent_type: AgentType
    rating: Rating
    comment: Optional[str] = None
    error_categories: Optional[list[str]] = Field(default=None)
    original_input: str
    agent_response: str
    session_id: Optional[str] = None
    pipeline_run_id: Optional[str] = None
