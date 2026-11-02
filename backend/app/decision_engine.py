
from app.config import DECISION_CONFIG


BASE_RISK_SCORE = 10


def check_address_quality(address):
    if not isinstance(address, str) or not address.strip():
        return 30, "Address is missing."

    score = 0
    reasons = []

    has_house_number = any(char.isdigit() for char in address)

    if not has_house_number:
        score += 15
        reasons.append("No house or building number found.")

    if len(address.strip()) < 15:
        score += 15
        reasons.append("Address is very short.")

    if not reasons:
        reasons.append("Address appears reasonably detailed.")

    return min(score, 40), " ".join(reasons)


def calculate_risk(order, gemini_analysis=None):
    risk_score = BASE_RISK_SCORE
    reasons = [
        "Baseline risk allowance based on historical COD returns."
    ]

    previous_rto = int(order.get("customer_prior_rto") or 0)
    previous_orders = int(order.get("customer_prior_orders") or 0)
    order_value = float(order.get("order_value") or 0)

    # Previous RTO history
    if previous_rto >= DECISION_CONFIG["previous_rto_high"]:
        risk_score += 40
        reasons.append(
            f"Customer has {previous_rto} previous RTOs."
        )
    elif previous_rto >= DECISION_CONFIG["previous_rto_medium"]:
        risk_score += 20
        reasons.append(
            f"Customer has {previous_rto} previous RTO."
        )
    else:
        reasons.append("No previous RTO recorded.")

    # Customer order history
    if previous_orders == 0:
        risk_score += 10
        reasons.append("First-time customer; no delivery history.")
    else:
        reasons.append(
            f"Customer has {previous_orders} previous orders."
        )

    # Order value
    if order_value >= DECISION_CONFIG["high_order_value"]:
        risk_score += 20
        reasons.append(
            "High-value order increases potential RTO exposure."
        )
    elif order_value >= DECISION_CONFIG["medium_order_value"]:
        risk_score += 10
        reasons.append("Medium-value order.")

    # Address quality
    if DECISION_CONFIG["address_risk_enabled"]:
        address_score, address_reason = check_address_quality(
            order.get("address", "")
        )
        risk_score += address_score
        reasons.append(address_reason)

    # Gemini assessment
    if gemini_analysis:
        name_assessment = gemini_analysis.get(
            "name_assessment", "UNCLEAR"
        )

        address_assessment = gemini_analysis.get(
            "address_assessment", "UNCLEAR"
        )

        if name_assessment == "SUSPICIOUS":
            risk_score += 20
            reasons.append(
                "AI assessment found the customer name suspicious."
            )

        if DECISION_CONFIG["address_risk_enabled"]:
            if address_assessment == "INCOMPLETE":
                risk_score += 15
                reasons.append(
                    "AI assessment found the delivery address incomplete."
                )
            elif address_assessment == "PARTIAL":
                risk_score += 5
                reasons.append(
                    "AI assessment found that the address may need clarification."
                )

        if name_assessment == "UNCLEAR":
            reasons.append(
                "AI could not confidently assess the customer name."
            )

        if address_assessment == "UNCLEAR":
            reasons.append(
                "AI could not confidently assess the delivery address."
            )

    risk_score = min(risk_score, 100)

    return risk_score, reasons


def recommend_action(order, gemini_analysis=None):
    risk_score, reasons = calculate_risk(
        order,
        gemini_analysis
    )

    if risk_score <= DECISION_CONFIG["low_risk_max"]:
        action = "SHIP_AS_IS"
        explanation = "Low risk. Process the COD order normally."

    elif risk_score <= DECISION_CONFIG["medium_risk_max"]:
        action = "WHATSAPP_CONFIRMATION"
        explanation = (
            "Moderate risk. Confirm customer intent through WhatsApp."
        )

    elif risk_score <= DECISION_CONFIG["high_risk_max"]:
        action = "PREPAID_NUDGE"
        explanation = (
            "Elevated risk. Offer a prepaid payment incentive."
        )

    else:
        action = "HOLD_REVIEW"
        explanation = (
            "Very high risk. Hold the order for manual review "
            "before deciding whether to cancel."
        )

    result = {
        "risk_score": risk_score,
        "action": action,
        "explanation": explanation,
        "reasons": reasons,
    }

    if gemini_analysis:
        result["ai_assessment"] = gemini_analysis

    return result
