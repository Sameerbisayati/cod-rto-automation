
from datetime import date

from fastapi import APIRouter, HTTPException, Query

from app.daily_operations import get_daily_operations

router = APIRouter()


@router.get("/api/operations/daily")
def daily_operations(
    target_date: str = Query(
        default=None,
        description="Date in YYYY-MM-DD format. Defaults to yesterday."
    )
):
    if target_date:
        try:
            date.fromisoformat(target_date)
        except ValueError:
            raise HTTPException(
                status_code=400,
                detail="Date must use YYYY-MM-DD format."
            )

    return get_daily_operations(target_date)
