from app.decision_engine import recommend_action


test_orders = [
    {
        "order_id": "TEST_LOW_RISK",
        "customer_name": "Rahul Sharma",
        "order_value": 499,
        "customer_prior_rto": 0,
        "customer_prior_orders": 5,
        "address": "Flat 202, Green Park, Mumbai"
    },
    {
        "order_id": "TEST_PREVIOUS_RTO",
        "customer_name": "Amit Verma",
        "order_value": 1499,
        "customer_prior_rto": 2,
        "customer_prior_orders": 3,
        "address": "House 12, Andheri East, Mumbai"
    },
    {
        "order_id": "TEST_INCOMPLETE_ADDRESS",
        "customer_name": "Priya Singh",
        "order_value": 699,
        "customer_prior_rto": 0,
        "customer_prior_orders": 1,
        "address": "Mumbai"
    },
    {
        "order_id": "TEST_HIGH_VALUE",
        "customer_name": "Neha Patel",
        "order_value": 2500,
        "customer_prior_rto": 1,
        "customer_prior_orders": 2,
        "address": "Flat 301, Green Society, Pune"
    }
]


for order in test_orders:
    decision = recommend_action(order)

    print("\n------------------------------")
    print("Order ID:", order["order_id"])
    print("Risk Score:", decision["risk_score"])
    print("Action:", decision["action"])
    print("Explanation:", decision["explanation"])
    print("Reasons:", decision["reasons"])