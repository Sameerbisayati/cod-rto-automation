
from app.config import PREPAID_CONFIG


def calculate_prepaid_discount(order_value):
    if order_value <= 0:
        raise ValueError("Order value must be greater than zero.")

    cod_rto_rate = PREPAID_CONFIG["cod_rto_rate"]
    prepaid_rto_rate = PREPAID_CONFIG["prepaid_rto_rate"]
    rto_cost = PREPAID_CONFIG["rto_cost"]
    gross_margin = PREPAID_CONFIG["gross_margin"]
    max_discount_percent = PREPAID_CONFIG["max_discount_percent"]
    max_discount_amount = PREPAID_CONFIG["max_discount_amount"]

    rto_rate_difference = max(0, cod_rto_rate - prepaid_rto_rate)

    expected_rto_saving = rto_rate_difference * rto_cost

    percentage_limit = order_value * max_discount_percent

    discount = min(
        expected_rto_saving,
        percentage_limit,
        max_discount_amount
    )

    discount = round(max(0, discount))

    gross_profit_before_discount = order_value * gross_margin

    gross_profit_after_discount = (
        gross_profit_before_discount - discount
    )

    expected_net_benefit = expected_rto_saving - discount

    return {
        "order_value": round(order_value, 2),
        "recommended_discount": discount,
        "discount_percentage": round(
            (discount / order_value) * 100, 2
        ),
        "expected_rto_saving": round(expected_rto_saving, 2),
        "expected_net_benefit": round(expected_net_benefit, 2),
        "gross_profit_before_discount": round(
            gross_profit_before_discount, 2
        ),
        "gross_profit_after_discount": round(
            gross_profit_after_discount, 2
        ),
        "assumptions": {
            "cod_rto_rate": cod_rto_rate,
            "prepaid_rto_rate": prepaid_rto_rate,
            "rto_cost": rto_cost,
            "gross_margin": gross_margin,
        },
        "note": (
            "Scenario estimate per successful prepaid conversion. "
            "Actual savings depend on conversion and order-level RTO outcomes."
        )
    }
