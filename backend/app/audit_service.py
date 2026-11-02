import json
from pathlib import Path
from threading import Lock
from datetime import datetime, timezone

DATA_DIR = Path(__file__).resolve().parent.parent / "data"
AUDIT_FILE = DATA_DIR / "decision_audit.json"

audit_lock = Lock()


def save_audit_record(order, decision, ai_status, gemini_time_ms):
    DATA_DIR.mkdir(parents=True, exist_ok=True)

    record = {
        "order_id": order.get("order_id", "UNKNOWN"),
        "customer_name": order.get("customer_name", "Unknown"),
        "order_value": order.get("order_value", 0),
        "risk_score": decision.get("risk_score", 0),
        "action": decision.get("action", "UNKNOWN"),
        "explanation": decision.get("explanation", ""),
        "reasons": decision.get("reasons", []),
        "ai_status": ai_status,
        "gemini_time_ms": gemini_time_ms,
        "evaluated_at": datetime.now(timezone.utc).isoformat()
    }

    with audit_lock:
        if AUDIT_FILE.exists():
            try:
                with open(AUDIT_FILE, "r", encoding="utf-8") as file:
                    records = json.load(file)

                if not isinstance(records, list):
                    records = []
            except (json.JSONDecodeError, OSError):
                records = []
        else:
            records = []

        records.insert(0, record)

        with open(AUDIT_FILE, "w", encoding="utf-8") as file:
            json.dump(records, file, indent=4)

    return record


def get_audit_records(limit=100):
    with audit_lock:
        if not AUDIT_FILE.exists():
            return []

        try:
            with open(AUDIT_FILE, "r", encoding="utf-8") as file:
                records = json.load(file)

            if not isinstance(records, list):
                return []

            return records[:limit]

        except (json.JSONDecodeError, OSError):
            return []