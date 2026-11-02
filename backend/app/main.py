
from pathlib import Path

import pandas as pd
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from app.decision_engine import recommend_action
from app.evaluation_routes import router as evaluation_router
from app.whatsapp_routes import router as whatsapp_router
from app.decision_log_routes import router as decision_log_router
from app.order_routes import router as order_router
from app.audit_routes import router as audit_router
from app.impact_routes import router as impact_router
from app.daily_operations_routes import router as daily_operations_router


app = FastAPI(title="COD RTO Automation API")

app.include_router(whatsapp_router)
app.include_router(impact_router)
app.include_router(evaluation_router)
app.include_router(decision_log_router)
app.include_router(order_router)
app.include_router(audit_router)
app.include_router(daily_operations_router)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


BASE_DIR = Path(__file__).resolve().parent.parent
CSV_PATH = BASE_DIR / "data" / "orders_sample.csv"

df = pd.read_csv(CSV_PATH, sep="\t")
df["final_status"] = df["final_status"].astype(str).str.strip().str.upper()

completed = df[
    df["final_status"].isin(["DELIVERED", "RTO"])
].copy()


@app.get("/")
def home():
    return {
        "message": "COD RTO Automation API is running"
    }


@app.get("/api/health")
def health():
    return {
        "status": "ok",
        "total_orders": len(df),
        "completed_orders": len(completed),
    }


@app.get("/api/dashboard")
def dashboard():
    delivered = int(
        (completed["final_status"] == "DELIVERED").sum()
    )

    rto = int(
        (completed["final_status"] == "RTO").sum()
    )

    total = delivered + rto

    return {
        "total_orders": len(df),
        "completed_orders": total,
        "delivered_orders": delivered,
        "rto_orders": rto,
        "pending_orders": int(len(df) - total),
        "rto_rate": round(
            (rto / total) * 100, 2
        ) if total else 0,
        "average_order_value": round(
            float(completed["order_value"].mean()), 2
        ) if total else 0,
    }


@app.get("/api/orders")
def get_orders(limit: int = 20):
    if limit < 1 or limit > 100:
        raise HTTPException(
            status_code=400,
            detail="Limit must be between 1 and 100",
        )

    records = df.head(limit).copy()
    records = records.astype(object).where(
        pd.notna(records), None
    )

    return records.to_dict(orient="records")


@app.get("/api/decisions")
def get_decisions():
    records = df.copy()
    records = records.astype(object).where(
        pd.notna(records), None
    )

    decisions = []

    for order in records.to_dict(orient="records"):
        result = recommend_action(order)

        decisions.append({
            "order_id": order["order_id"],
            "customer_name": order["customer_name"],
            "order_value": order["order_value"],
            "final_status": order["final_status"],
            **result,
        })

    return decisions


@app.get("/api/decisions/{order_id}")
def get_order_decision(order_id: str):
    matching = df[
        df["order_id"].astype(str) == order_id
    ]

    if matching.empty:
        raise HTTPException(
            status_code=404,
            detail="Order not found",
        )

    order = matching.iloc[0].to_dict()
    result = recommend_action(order)

    return {
        "order_id": order_id,
        "customer_name": order["customer_name"],
        **result,
    }
