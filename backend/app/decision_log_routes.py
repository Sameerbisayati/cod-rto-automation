
from fastapi import APIRouter
import pandas as pd

from app.decision_engine import recommend_action

router = APIRouter()


@router.get("/api/decision-log")
def get_decision_log():
    from app.main import CSV_PATH

    df = pd.read_csv(CSV_PATH, sep="\t")

    decision_logs = []

    for index, row in df.iterrows():
        order = row.to_dict()
        decision = recommend_action(order)
        order.update(decision)

        decision_logs.append({
            "log_id": index + 1,
            "order_id": order.get("order_id"),
            "customer_name": order.get("customer_name"),
            "final_status": order.get("final_status"),
            "risk_score": order.get("risk_score"),
            "action": order.get("action"),
            "explanation": order.get("explanation"),
            "reasons": order.get("reasons", []),
        })

    return {
        "total_logs": len(decision_logs),
        "decision_logs": decision_logs,
        "note": "These are retrospective recommendations generated from historical order data."
    }
