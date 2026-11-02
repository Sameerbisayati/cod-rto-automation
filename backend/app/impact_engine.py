
# COD RTO financial assumptions

FORWARD_SHIPPING_COST = 65
RETURN_SHIPPING_COST = 65
PACKAGING_HANDLING_COST = 25

DAMAGED_RETURN_RATE = 0.08
DAMAGED_PRODUCT_COST = 180


def calculate_rto_cost():
    shipping_and_handling = (
        FORWARD_SHIPPING_COST
        + RETURN_SHIPPING_COST
        + PACKAGING_HANDLING_COST
    )

    damaged_product_cost = (
        DAMAGED_RETURN_RATE * DAMAGED_PRODUCT_COST
    )

    return round(
        shipping_and_handling + damaged_product_cost,
        2
    )


def generate_impact_report(decisions):
    action_counts = {
        "SHIP_AS_IS": 0,
        "WHATSAPP_CONFIRMATION": 0,
        "PREPAID_NUDGE": 0,
        "HOLD_REVIEW": 0,
    }

    for order in decisions:
        action = str(order.get("action", "")).strip().upper()

        if action in action_counts:
            action_counts[action] += 1

    total_orders = len(decisions)

    rto_orders = sum(
        1
        for order in decisions
        if str(order.get("final_status", "")).strip().upper() == "RTO"
    )

    average_rto_cost = calculate_rto_cost()

    historical_rto_cost = round(
        rto_orders * average_rto_cost,
        2
    )

    return {
        "total_orders": total_orders,
        "action_counts": action_counts,
        "historical_rto_orders": rto_orders,
        "average_estimated_rto_cost": average_rto_cost,
        "estimated_historical_rto_cost": historical_rto_cost,
        "cost_assumptions": {
            "forward_shipping": FORWARD_SHIPPING_COST,
            "return_shipping": RETURN_SHIPPING_COST,
            "packaging_handling": PACKAGING_HANDLING_COST,
            "damaged_return_rate": DAMAGED_RETURN_RATE,
            "damaged_product_cost": DAMAGED_PRODUCT_COST,
        },
        "note": (
            "Historical cost estimate based on supplied assumptions. "
            "This is not measured savings or proof of prevented RTOs."
        ),
    }
