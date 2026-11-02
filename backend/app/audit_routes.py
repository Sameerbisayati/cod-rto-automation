from fastapi import APIRouter, Query
from app.audit_service import get_audit_records

router = APIRouter()


@router.get("/api/audit")
def get_audit_log(limit: int = Query(default=100, ge=1, le=500)):
    records = get_audit_records(limit)

    return {
        "total_records": len(records),
        "records": records
    }