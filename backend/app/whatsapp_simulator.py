
import json
from pathlib import Path
from threading import Lock
from datetime import datetime, timedelta, timezone

from app.discount_calculator import calculate_prepaid_discount
from app.whatsapp_templates import get_whatsapp_template


DATA_DIR = Path(__file__).resolve().parent.parent / "data"
WHATSAPP_FILE = DATA_DIR / "whatsapp_messages.json"

file_lock = Lock()


def load_messages():
    if not WHATSAPP_FILE.exists():
        return []

    try:
        with open(WHATSAPP_FILE, "r", encoding="utf-8") as file:
            data = json.load(file)
            return data if isinstance(data, list) else []
    except (json.JSONDecodeError, OSError):
        return []


def save_messages(messages):
    DATA_DIR.mkdir(parents=True, exist_ok=True)

    with open(WHATSAPP_FILE, "w", encoding="utf-8") as file:
        json.dump(messages, file, indent=4, ensure_ascii=False)


def find_latest_message(messages, order_id):
    order_id = str(order_id)

    return next(
        (
            item for item in messages
            if str(item.get("order_id")) == order_id
        ),
        None
    )


def generate_whatsapp_message(order):
    action = str(order.get("action", "")).upper()
    order_id = str(order.get("order_id", "UNKNOWN"))
    customer_name = str(order.get("customer_name", "Customer"))
    language = str(order.get("language", "ENGLISH")).upper()

    if action not in ["WHATSAPP_CONFIRMATION", "PREPAID_NUDGE"]:
        raise ValueError("This order does not require WhatsApp messaging.")

    now = datetime.now(timezone.utc)

    with file_lock:
        messages = load_messages()

        existing = find_latest_message(messages, order_id)

        if existing and existing.get("status") in [
            "AWAITING_REPLY",
            "PAYMENT_PENDING"
        ]:
            expires_at = datetime.fromisoformat(existing["expires_at"])

            if now < expires_at:
                return existing

            existing["status"] = "EXPIRED"
            existing["updated_at"] = now.isoformat()

        order_value = 0
        discount = 0

        if action == "PREPAID_NUDGE":
            try:
                order_value = float(order.get("order_value", 0))
            except (TypeError, ValueError):
                raise ValueError("A valid order value is required.")

            if order_value <= 0:
                raise ValueError("Order value must be greater than zero.")

            discount_data = calculate_prepaid_discount(order_value)
            discount = discount_data["recommended_discount"]

            message_type = "PREPAID_NUDGE"

        else:
            message_type = "CONFIRMATION"

        message_text = get_whatsapp_template(
            language=language,
            message_type=message_type,
            customer_name=customer_name,
            order_id=order_id,
            order_value=order_value,
            discount=discount
        )

        record = {
            "order_id": order_id,
            "customer_name": customer_name,
            "action": action,
            "message_type": message_type,
            "language": language,
            "message": message_text,
            "status": "AWAITING_REPLY",
            "reply": None,
            "created_at": now.isoformat(),
            "expires_at": (now + timedelta(hours=24)).isoformat(),
            "updated_at": now.isoformat()
        }

        messages.insert(0, record)
        save_messages(messages)

        return record



def process_customer_reply(order_id, reply):
    order_id = str(order_id)
    normalized_reply = str(reply).strip().upper()

    with file_lock:
        messages = load_messages()
        record = find_latest_message(messages, order_id)

        if not record:
            raise ValueError("WhatsApp message not found for this order.")

        current_status = record.get("status")

        if current_status not in ["AWAITING_REPLY", "PAYMENT_PENDING"]:
            raise ValueError(
                f"This message is already processed: {current_status}"
            )

        now = datetime.now(timezone.utc)
        expires_at = datetime.fromisoformat(record["expires_at"])

        if now >= expires_at:
            record["status"] = "EXPIRED"
            record["updated_at"] = now.isoformat()
            save_messages(messages)
            raise ValueError("The 24-hour reply window has expired.")

        if normalized_reply in ["MAYBE", "RANDOM", "UNCLEAR"]:
            record["reply"] = normalized_reply
            record["updated_at"] = now.isoformat()
            save_messages(messages)

            if current_status == "PAYMENT_PENDING":
                response = (
                    "Unclear response received. Prepaid payment is still pending. "
                    "Please reply PAID after completing payment."
                )
            else:
                response = (
                    "Unclear response received. The order is still waiting "
                    "for customer confirmation. Please reply YES or NO."
                )

            return {
                "order_id": order_id,
                "status": current_status,
                "response": response
            }

        if normalized_reply == "PAID":
            if record["action"] != "PREPAID_NUDGE":
                raise ValueError("PAID is only valid for prepaid orders.")

            if current_status != "PAYMENT_PENDING":
                raise ValueError(
                    "Accept the prepaid offer before reporting payment."
                )

            record["status"] = "PAYMENT_REPORTED"
            response = (
                "Customer reported payment. Verify payment with "
                "the payment provider before shipping."
            )

        elif normalized_reply in ["YES", "Y"]:
            if current_status != "AWAITING_REPLY":
                raise ValueError("Prepaid payment is still pending.")

            if record["action"] == "WHATSAPP_CONFIRMATION":
                record["status"] = "CONFIRMED_READY_TO_SHIP"
                response = "Customer confirmed. Order is ready for shipping."
            else:
                record["status"] = "PAYMENT_PENDING"
                response = (
                    "Customer accepted the prepaid offer. "
                    "Payment is still pending."
                )

        elif normalized_reply in ["NO", "N"]:
            if current_status != "AWAITING_REPLY":
                raise ValueError("Prepaid payment is already pending.")

            if record["action"] == "WHATSAPP_CONFIRMATION":
                record["status"] = "CUSTOMER_DECLINED"
                response = (
                    "Customer declined the order. Manual review is required."
                )
            else:
                record["status"] = "PREPAID_DECLINED"
                response = "Customer declined prepaid. Keep the order as COD."

        else:
            return {
                "order_id": order_id,
                "status": current_status,
                "response": (
                    "Unrecognized reply. Please reply YES or NO. "
                    "For prepaid orders, reply PAID after accepting the offer."
                )
            }

        record["reply"] = normalized_reply
        record["updated_at"] = now.isoformat()
        save_messages(messages)

        return {
            "order_id": order_id,
            "status": record["status"],
            "response": response
        }
    order_id = str(order_id)
    normalized_reply = str(reply).strip().upper()

    with file_lock:
        messages = load_messages()
        record = find_latest_message(messages, order_id)

        if not record:
            raise ValueError("WhatsApp message not found for this order.")

        current_status = record.get("status")

        if current_status not in ["AWAITING_REPLY", "PAYMENT_PENDING"]:
            raise ValueError(
                f"This message is already processed: {current_status}"
            )

        now = datetime.now(timezone.utc)
        expires_at = datetime.fromisoformat(record["expires_at"])

        if now >= expires_at:
            record["status"] = "EXPIRED"
            record["updated_at"] = now.isoformat()
            save_messages(messages)
            raise ValueError("The 24-hour reply window has expired.")

        if normalized_reply == "PAID":
            if record["action"] != "PREPAID_NUDGE":
                raise ValueError("PAID is only valid for prepaid orders.")

            if current_status != "PAYMENT_PENDING":
                raise ValueError(
                    "Accept the prepaid offer before reporting payment."
                )

            record["status"] = "PAYMENT_REPORTED"
            response = (
                "Customer reported payment. Verify payment with "
                "the payment provider before shipping."
            )

        elif normalized_reply in ["YES", "Y"]:
            if current_status != "AWAITING_REPLY":
                raise ValueError("Prepaid payment is still pending.")

            if record["action"] == "WHATSAPP_CONFIRMATION":
                record["status"] = "CONFIRMED_READY_TO_SHIP"
                response = "Customer confirmed. Order is ready for shipping."
            else:
                record["status"] = "PAYMENT_PENDING"
                response = (
                    "Customer accepted the prepaid offer. "
                    "Payment is still pending."
                )

        elif normalized_reply in ["NO", "N"]:
            if current_status != "AWAITING_REPLY":
                raise ValueError("Prepaid payment is already pending.")

            if record["action"] == "WHATSAPP_CONFIRMATION":
                record["status"] = "CUSTOMER_DECLINED"
                response = (
                    "Customer declined the order. Manual review is required."
                )
            else:
                record["status"] = "PREPAID_DECLINED"
                response = "Customer declined prepaid. Keep the order as COD."

        else:
            return {
                "order_id": order_id,
                "status": current_status,
                "response": (
                    "Please reply YES or NO. For prepaid orders, "
                    "reply PAID after accepting the offer."
                )
            }

        record["reply"] = normalized_reply
        record["updated_at"] = now.isoformat()
        save_messages(messages)

        return {
            "order_id": order_id,
            "status": record["status"],
            "response": response
        }


def expire_pending_messages():
    now = datetime.now(timezone.utc)
    expired_count = 0

    with file_lock:
        messages = load_messages()

        for record in messages:
            if record.get("status") not in [
                "AWAITING_REPLY",
                "PAYMENT_PENDING"
            ]:
                continue

            expires_at = datetime.fromisoformat(record["expires_at"])

            if now >= expires_at:
                record["status"] = "EXPIRED"
                record["updated_at"] = now.isoformat()
                expired_count += 1

        save_messages(messages)

    return expired_count


def get_whatsapp_messages():
    expire_pending_messages()

    with file_lock:
        return load_messages()


def simulate_whatsapp_timeout(order_id):
    order_id = str(order_id)

    with file_lock:
        messages = load_messages()
        record = find_latest_message(messages, order_id)

        if not record:
            raise ValueError("WhatsApp message not found.")

        if record.get("status") not in [
            "AWAITING_REPLY",
            "PAYMENT_PENDING"
        ]:
            raise ValueError(
                f"This message is already processed: {record['status']}"
            )

        now = datetime.now(timezone.utc)

        record["expires_at"] = (
            now - timedelta(seconds=1)
        ).isoformat()

        record["status"] = "EXPIRED"
        record["updated_at"] = now.isoformat()

        save_messages(messages)

    return {
        "order_id": order_id,
        "status": "EXPIRED",
        "response": "No customer reply received within 24 hours."
    }
