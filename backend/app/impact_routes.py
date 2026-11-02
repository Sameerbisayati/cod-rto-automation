
from fastapi import APIRouter
from app.impact_engine import generate_impact_report
from app.decision_engine import recommend_action
import pandas as pd

router = APIRouter()


@router.get("/api/impact")
def get_impact_report():
    from app.main import CSV_PATH

    df = pd.read_csv(CSV_PATH, sep="\t")

    decisions = []

    for _, row in df.iterrows():
        order = row.to_dict()

        decision = recommend_action(order)

        order.update(decision)

        decisions.append(order)

    return generate_impact_report(decisions)
