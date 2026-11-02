
from fastapi import APIRouter
import pandas as pd

from app.decision_engine import recommend_action
from app.config import DECISION_CONFIG

router = APIRouter()


def get_risk_band(score):
    if score <= DECISION_CONFIG["low_risk_max"]:
        return "LOW"
    elif score <= DECISION_CONFIG["medium_risk_max"]:
        return "MEDIUM"
    elif score <= DECISION_CONFIG["high_risk_max"]:
        return "HIGH"
    return "VERY_HIGH"


@router.get("/api/evaluation")
def get_model_evaluation():
    from app.main import CSV_PATH

    df = pd.read_csv(CSV_PATH, sep="\t")

    df["final_status"] = (
        df["final_status"].astype(str).str.strip().str.upper()
    )

    # Evaluate only orders with a completed outcome
    df = df[df["final_status"].isin(["DELIVERED", "RTO"])]

    risk_bands = {
        "LOW": {"total": 0, "rto": 0, "delivered": 0},
        "MEDIUM": {"total": 0, "rto": 0, "delivered": 0},
        "HIGH": {"total": 0, "rto": 0, "delivered": 0},
        "VERY_HIGH": {"total": 0, "rto": 0, "delivered": 0},
    }

    action_results = {}

    for _, row in df.iterrows():
        order = row.to_dict()
        decision = recommend_action(order)

        score = float(decision.get("risk_score", 0))
        band = get_risk_band(score)
        actual_status = order["final_status"]
        action = decision.get("action", "UNKNOWN")

        risk_bands[band]["total"] += 1

        if actual_status == "RTO":
            risk_bands[band]["rto"] += 1
        else:
            risk_bands[band]["delivered"] += 1

        if action not in action_results:
            action_results[action] = {
                "total": 0,
                "rto": 0,
                "delivered": 0,
            }

        action_results[action]["total"] += 1

        if actual_status == "RTO":
            action_results[action]["rto"] += 1
        else:
            action_results[action]["delivered"] += 1

    # Calculate RTO rate for every risk band
    for band in risk_bands:
        total = risk_bands[band]["total"]
        rto = risk_bands[band]["rto"]

        risk_bands[band]["rto_rate"] = (
            round((rto / total) * 100, 2) if total else 0
        )

    total_orders = len(df)
    total_rto = int((df["final_status"] == "RTO").sum())
    total_delivered = int((df["final_status"] == "DELIVERED").sum())

    return {
        "total_evaluated": total_orders,
        "total_rto": total_rto,
        "total_delivered": total_delivered,
        "overall_rto_rate": (
            round((total_rto / total_orders) * 100, 2)
            if total_orders else 0
        ),
        "risk_band_results": risk_bands,
        "action_results": action_results,
        "note": (
            "Retrospective evaluation using historical outcomes. "
            "Risk bands are rule-based and have not been independently "
            "validated. Results do not prove that any RTO was prevented."
        ),
    }
