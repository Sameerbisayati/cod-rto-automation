
import os
import time
import logging
from uuid import uuid4

from fastapi import APIRouter, HTTPException

from app.gemini_service import analyze_customer_details
from app.decision_engine import recommend_action
from app.monitoring import record_evaluation, get_monitoring_data
from app.audit_service import save_audit_record
from app.daily_operations import record_daily_decision

router = APIRouter()

logger = logging.getLogger(__name__)


@router.get("/api/ai/monitoring")
def ai_monitoring():
    data = get_monitoring_data()
    data["api_configured"] = bool(os.getenv("GEMINI_API_KEY"))
    return data


@router.post("/api/orders/evaluate")
def evaluate_new_order(order: dict):
    total_start = time.perf_counter()

    customer_name = str(order.get("customer_name") or "").strip()
    address = str(order.get("address") or "").strip()

    if not customer_name:
        raise HTTPException(
            status_code=400,
            detail="Customer name is required."
        )

    if not address:
        raise HTTPException(
            status_code=400,
            detail="Delivery address is required."
        )

    order["order_id"] = str(
        order.get("order_id") or f"NEW-{uuid4().hex[:12].upper()}"
    )

    gemini_start = time.perf_counter()

    try:
        gemini_analysis = analyze_customer_details(
            customer_name,
            address
        )

        gemini_time_ms = round(
            (time.perf_counter() - gemini_start) * 1000, 2
        )

        decision = recommend_action(
            order,
            gemini_analysis=gemini_analysis
        )

        ai_status = "SUCCESS"
        message = "Order evaluated using Gemini and Python risk rules."

        logger.info(
            "Gemini success for order %s in %.2f ms",
            order["order_id"],
            gemini_time_ms
        )

    except Exception as error:
        gemini_time_ms = round(
            (time.perf_counter() - gemini_start) * 1000, 2
        )

        logger.exception(
            "Gemini request failed for order %s after %.2f ms. Error: %s",
            order["order_id"],
            gemini_time_ms,
            str(error)
        )

        decision = recommend_action(order)

        ai_status = "FALLBACK"
        message = (
            "Gemini was unavailable or took too long. "
            "Python risk rules were used to evaluate this order."
        )

    try:
        record_evaluation(ai_status, gemini_time_ms)

        save_audit_record(
            order,
            decision,
            ai_status,
            gemini_time_ms
        )

        daily_record = record_daily_decision(
            order,
            decision,
            ai_status
        )

        return {
            "order": order,
            "decision": decision,
            "ai_status": ai_status,
            "gemini_time_ms": gemini_time_ms,
            "total_time_ms": round(
                (time.perf_counter() - total_start) * 1000, 2
            ),
            "audit_saved": True,
            "daily_record_saved": True,
            "evaluation_date": daily_record["evaluation_date"],
            "message": message
        }

    except Exception as error:
        logger.exception("Failed to save evaluation records")

        raise HTTPException(
            status_code=500,
            detail=f"Order evaluation or record saving failed: {error}"
        )
