
import json
from pathlib import Path
from threading import Lock
from datetime import datetime, timedelta
from zoneinfo import ZoneInfo

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"
DAILY_FILE = DATA_DIR / "daily_operations.json"

TIMEZONE = ZoneInfo("Asia/Kolkata")
_file_lock = Lock()

DECISION_ACTIONS = [
    "SHIP_AS_IS",
    "WHATSAPP_CONFIRMATION",
    "PREPAID_NUDGE",
    "HOLD_REVIEW",
]


def get_local_datetime():
    return datetime.now(TIMEZONE)


def load_records():
    DATA_DIR.mkdir(parents=True, exist_ok=True)

    if not DAILY_FILE.exists():
        return []

    try:
        with open(DAILY_FILE, "r", encoding="utf-8") as file:
            data = json.load(file)

        return data if isinstance(data, list) else []

    except (json.JSONDecodeError, OSError):
        return []


def save_records(records):
    DATA_DIR.mkdir(parents=True, exist_ok=True)

    temporary_file = DAILY_FILE.with_suffix(".tmp")

    with open(temporary_file, "w", encoding="utf-8") as file:
        json.dump(records, file, indent=4, ensure_ascii=False)

    temporary_file.replace(DAILY_FILE)


def record_daily_decision(order, decision, ai_status):
    now = get_local_datetime()

    order_id = str(order.get("order_id") or "").strip()
    action = str(decision.get("action") or "").strip().upper()

    if not order_id:
        raise ValueError("Order ID is required for daily tracking.")

    if action not in DECISION_ACTIONS:
        raise ValueError(f"Invalid decision action: {action}")

    record = {
        "order_id": order_id,
        "customer_name": order.get("customer_name", ""),
        "order_value": float(order.get("order_value") or 0),
        "action": action,
        "risk_score": decision.get("risk_score"),
        "ai_status": ai_status,
        "evaluation_date": now.date().isoformat(),
        "evaluated_at": now.isoformat(),
        "outcome": None,
    }

    with _file_lock:
        records = load_records()

        # Update an existing order evaluated on the same day.
        # This prevents repeat evaluations from inflating daily counts.
        existing_index = next(
            (
                index
                for index, item in enumerate(records)
                if item.get("order_id") == order_id
                and item.get("evaluation_date") == record["evaluation_date"]
            ),
            None,
        )

        if existing_index is not None:
            previous_outcome = records[existing_index].get("outcome")
            record["outcome"] = previous_outcome
            records[existing_index] = record
        else:
            records.append(record)

        save_records(records)

    return record


def get_daily_operations(target_date=None):
    now = get_local_datetime()

    if target_date is None:
        target_date = (now.date() - timedelta(days=1)).isoformat()

    with _file_lock:
        records = load_records()

    daily_records = [
        item
        for item in records
        if item.get("evaluation_date") == target_date
    ]

    decision_counts = {
        action: 0 for action in DECISION_ACTIONS
    }

    for item in daily_records:
        action = item.get("action")

        if action in decision_counts:
            decision_counts[action] += 1

    return {
        "date": target_date,
        "total_evaluated_orders": len(daily_records),
        "decision_counts": decision_counts,
        "records": daily_records,
        "financial_impact": {
            "status": "NOT_MEASURABLE_YET",
            "estimated_avoided_rto_cost": None,
            "estimated_genuine_order_loss": None,
            "estimated_net_impact": None,
            "note": (
                "Financial impact requires actual delivery, RTO, "
                "cancellation and payment outcomes, plus a validated "
                "counterfactual baseline. Decision counts alone do not "
                "prove savings."
            ),
        },
    }
