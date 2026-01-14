"""
FastAPI server for Safety Agent.

Provides REST API endpoints to process safety observations through
the multi-agent pipeline.
"""

import logging
import sys
from contextlib import asynccontextmanager
from datetime import datetime
from typing import Optional
from uuid import uuid4

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from safety_agent.schemas import (
    Observation,
    ObservationPotential,
    ObservationType,
    Hazard,
    ScoredHazard,
    ActionPlan,
    Feedback,
    FeedbackCreate,
    AgentType,
    Rating,
)
from safety_agent.orchestrator.pipeline import ObservationPipeline, PipelineResult
from safety_agent.llm.client import LLMConfigurationError

import json
from pathlib import Path

# Feedback storage file
FEEDBACK_FILE = Path(__file__).parent.parent.parent.parent / "data" / "feedback.json"


def load_feedback() -> list[dict]:
    """Load existing feedback from JSON file."""
    if FEEDBACK_FILE.exists():
        with open(FEEDBACK_FILE, 'r') as f:
            return json.load(f)
    return []


def save_feedback(feedback_list: list[dict]):
    """Save feedback to JSON file."""
    FEEDBACK_FILE.parent.mkdir(parents=True, exist_ok=True)
    with open(FEEDBACK_FILE, 'w') as f:
        json.dump(feedback_list, f, indent=2, default=str)


def setup_logging():
    """Configure logging to show detailed pipeline output in console."""
    # Create a custom formatter with colors for better readability
    class ColoredFormatter(logging.Formatter):
        COLORS = {
            'DEBUG': '\033[36m',     # Cyan
            'INFO': '\033[32m',      # Green
            'WARNING': '\033[33m',   # Yellow
            'ERROR': '\033[31m',     # Red
            'CRITICAL': '\033[35m',  # Magenta
            'RESET': '\033[0m',      # Reset
        }

        def format(self, record):
            color = self.COLORS.get(record.levelname, self.COLORS['RESET'])
            reset = self.COLORS['RESET']

            # Format the message
            formatted = super().format(record)

            # Add color to the level name
            return f"{color}{formatted}{reset}"

    # Configure root logger
    root_logger = logging.getLogger()
    root_logger.setLevel(logging.INFO)

    # Remove existing handlers
    for handler in root_logger.handlers[:]:
        root_logger.removeHandler(handler)

    # Create console handler with colored formatter
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(logging.INFO)
    formatter = ColoredFormatter(
        '%(asctime)s | %(name)s | %(message)s',
        datefmt='%H:%M:%S'
    )
    console_handler.setFormatter(formatter)
    root_logger.addHandler(console_handler)

    # Set specific loggers to INFO level
    logging.getLogger('safety_agent').setLevel(logging.INFO)
    logging.getLogger('safety_agent.orchestrator').setLevel(logging.INFO)
    logging.getLogger('safety_agent.agents').setLevel(logging.INFO)

    # Reduce noise from other libraries
    logging.getLogger('uvicorn').setLevel(logging.WARNING)
    logging.getLogger('uvicorn.access').setLevel(logging.WARNING)
    logging.getLogger('httpx').setLevel(logging.WARNING)
    logging.getLogger('openai').setLevel(logging.WARNING)


# Setup logging on module import
setup_logging()

logger = logging.getLogger(__name__)


# Request/Response models for API
class ObservationRequest(BaseModel):
    """Request model for submitting an observation."""

    site: str = Field(..., min_length=1, description="Site location")
    potential: str = Field(..., description="Observation potential (NEAR_MISS, FIRST_AID, etc.)")
    type: str = Field(..., description="Observation type (UNSAFE_CONDITION, UNSAFE_ACT, etc.)")
    description: str = Field(..., min_length=1, description="Description of the observation")
    trade_category_id: Optional[str] = Field(None, alias="tradeCategoryId")
    trade_partner_id: Optional[str] = Field(None, alias="tradePartnerId")
    photo_id: Optional[str] = Field(None, alias="photoId")
    observed_at: Optional[datetime] = Field(None, alias="observedAt")

    class Config:
        populate_by_name = True


class HealthResponse(BaseModel):
    """Health check response."""

    status: str
    version: str


# Map frontend potential values to backend enum
POTENTIAL_MAPPING = {
    "NEAR_MISS": ObservationPotential.NEAR_MISS,
    "SAFE_PRACTICE": ObservationPotential.NEAR_MISS,  # Map to closest
    "AT_RISK_BEHAVIOR": ObservationPotential.NEAR_MISS,
    "HAZARD": ObservationPotential.FIRST_AID,
    "OTHER": ObservationPotential.NEAR_MISS,
    "FIRST_AID": ObservationPotential.FIRST_AID,
    "MEDICAL_TREATMENT": ObservationPotential.MEDICAL_TREATMENT,
    "LOST_TIME": ObservationPotential.LOST_TIME,
    "FATALITY": ObservationPotential.FATALITY,
}

# Map frontend type values to backend enum
TYPE_MAPPING = {
    "AREA_FOR_IMPROVEMENT": ObservationType.AREA_FOR_IMPROVEMENT,
    "POSITIVE_OBSERVATION": ObservationType.POSITIVE_OBSERVATION,
    "UNSAFE_CONDITION": ObservationType.UNSAFE_CONDITION,
    "UNSAFE_ACT": ObservationType.UNSAFE_ACT,
    "ENVIRONMENTAL": ObservationType.ENVIRONMENTAL,
}


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan handler."""
    logger.info("Safety Agent API starting up...")
    yield
    logger.info("Safety Agent API shutting down...")


app = FastAPI(
    title="Safety Agent API",
    description="AI-powered safety observation pipeline with multi-agent architecture",
    version="0.1.0",
    lifespan=lifespan,
)

# Enable CORS for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3002",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3002",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health", response_model=HealthResponse)
async def health_check():
    """Check API health status."""
    return HealthResponse(status="healthy", version="0.1.0")


@app.post("/api/observations/analyze", response_model=PipelineResult)
async def analyze_observation(request: ObservationRequest):
    """
    Process a safety observation through the full AI pipeline.

    The pipeline runs three agents in sequence:
    1. Risk Analyzer - Detects hazards from the observation
    2. Score Manager - Scores hazards using risk matrix
    3. Action Planner - Generates OSHA-compliant action plans

    Returns the complete pipeline result with all hazards, scores, and action plans.
    """
    logger.info("")
    logger.info("*" * 80)
    logger.info("API REQUEST RECEIVED: POST /api/observations/analyze")
    logger.info("*" * 80)
    logger.info(f"Request Data:")
    logger.info(f"  - Site: {request.site}")
    logger.info(f"  - Potential: {request.potential}")
    logger.info(f"  - Type: {request.type}")
    logger.info(f"  - Description: {request.description[:100]}...")
    logger.info("*" * 80)

    try:
        # Map potential to enum
        potential = POTENTIAL_MAPPING.get(request.potential)
        if not potential:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid potential value: {request.potential}"
            )

        # Map type to enum
        obs_type = TYPE_MAPPING.get(request.type)
        if not obs_type:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid type value: {request.type}"
            )

        # Create observation object
        observation = Observation(
            id=str(uuid4()),
            observed_at=request.observed_at or datetime.now(),
            site=request.site,
            potential=potential,
            type=obs_type,
            description=request.description,
            trade_category_id=request.trade_category_id,
            trade_partner_id=request.trade_partner_id,
            photo_id=request.photo_id,
        )

        logger.info(f"Created Observation object with ID: {observation.id}")
        logger.info(f"Mapped potential '{request.potential}' -> {potential}")
        logger.info(f"Mapped type '{request.type}' -> {obs_type}")

        # Run the pipeline
        logger.info("")
        logger.info("Invoking ObservationPipeline...")
        pipeline = ObservationPipeline()
        result = pipeline.run(observation)

        if not result.success:
            logger.error(f"Pipeline failed: {result.error}")
            raise HTTPException(status_code=500, detail=result.error)

        logger.info("")
        logger.info("*" * 80)
        logger.info("API RESPONSE READY")
        logger.info("*" * 80)
        logger.info(f"Returning to frontend:")
        logger.info(f"  - Hazards: {len(result.hazards)}")
        logger.info(f"  - Scored Hazards: {len(result.scored_hazards)}")
        logger.info(f"  - Action Plans: {len(result.action_plans)}")
        logger.info(f"  - Success: {result.success}")
        logger.info("*" * 80)
        logger.info("")

        return result

    except HTTPException:
        raise
    except LLMConfigurationError as e:
        logger.error(f"LLM service error: {e}")
        raise HTTPException(
            status_code=503,
            detail="LLM service encountered an unexpected configuration error. Please contact administrator."
        )
    except Exception as e:
        logger.exception("Unexpected error processing observation")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/feedback", response_model=Feedback)
async def submit_feedback(request: FeedbackCreate):
    """
    Submit feedback for an agent response.

    Captures:
    - agent_type: Which agent (risk_analyzer, score_manager, action_planner)
    - rating: User rating (terrible, bad, normal, good, amazing)
    - comment: Optional text feedback
    - original_input: What the agent received
    - agent_response: What the agent produced
    """
    logger.info("")
    logger.info("*" * 80)
    logger.info("FEEDBACK RECEIVED: POST /api/feedback")
    logger.info("*" * 80)
    logger.info(f"Agent: {request.agent_type}")
    logger.info(f"Rating: {request.rating}")
    if request.error_categories:
        logger.info(f"Error Categories: {request.error_categories}")
    if request.comment:
        logger.info(f"Comment: {request.comment[:50]}...")
    logger.info("*" * 80)

    # Create feedback record
    feedback = Feedback(
        agent_type=request.agent_type,
        rating=request.rating,
        comment=request.comment,
        error_categories=request.error_categories,
        original_input=request.original_input,
        agent_response=request.agent_response,
        session_id=request.session_id,
        pipeline_run_id=request.pipeline_run_id,
    )

    # Save to JSON file
    feedback_list = load_feedback()
    feedback_list.append(feedback.model_dump())
    save_feedback(feedback_list)

    logger.info(f"Feedback saved with ID: {feedback.id}")

    return feedback


@app.get("/api/feedback", response_model=list[Feedback])
async def get_feedback(
    agent_type: Optional[AgentType] = None,
    rating: Optional[Rating] = None,
    limit: int = 100,
):
    """
    Retrieve feedback records with optional filtering.
    """
    feedback_list = load_feedback()

    # Apply filters
    if agent_type:
        feedback_list = [f for f in feedback_list if f.get('agent_type') == agent_type.value]
    if rating:
        feedback_list = [f for f in feedback_list if f.get('rating') == rating.value]

    # Sort by created_at descending and limit
    feedback_list.sort(key=lambda x: x.get('created_at', ''), reverse=True)

    return feedback_list[:limit]


def run_server(host: str = "0.0.0.0", port: int = 8000, reload: bool = False):
    """Run the API server using uvicorn."""
    import uvicorn
    uvicorn.run(
        "safety_agent.api.server:app",
        host=host,
        port=port,
        reload=reload,
    )


if __name__ == "__main__":
    run_server(reload=True)
