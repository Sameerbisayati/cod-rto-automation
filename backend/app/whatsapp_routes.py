
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.whatsapp_simulator import (
    generate_whatsapp_message,
    process_customer_reply,
    get_whatsapp_messages,
    simulate_whatsapp_timeout
)

from app.discount_calculator import calculate_prepaid_discount

router = APIRouter()


class ReplyRequest(BaseModel):
    order_id: str
    reply: str


class TimeoutRequest(BaseModel):
    order_id: str


class DiscountRequest(BaseModel):
    order_value: float


@router.post("/api/whatsapp/simulate")
def simulate_whatsapp(order: dict):
    try:
        return generate_whatsapp_message(order)
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error))


@router.post("/api/whatsapp/reply")
def whatsapp_reply(data: ReplyRequest):
    try:
        return process_customer_reply(data.order_id, data.reply)
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error))


@router.get("/api/whatsapp/messages")
def whatsapp_messages():
    return {"messages": get_whatsapp_messages()}


@router.post("/api/whatsapp/timeout")
def whatsapp_timeout(data: TimeoutRequest):
    try:
        return simulate_whatsapp_timeout(data.order_id)
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error))


@router.post("/api/whatsapp/discount")
def prepaid_discount(data: DiscountRequest):
    try:
        return calculate_prepaid_discount(data.order_value)
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error))
