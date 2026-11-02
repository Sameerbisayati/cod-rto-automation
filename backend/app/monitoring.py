from threading import Lock

_monitoring_data = {
    "total_evaluations": 0,
    "gemini_success": 0,
    "python_fallback": 0,
    "total_gemini_time_ms": 0,
}

_lock = Lock()


def record_evaluation(ai_status, gemini_time_ms):
    with _lock:
        _monitoring_data["total_evaluations"] += 1

        if ai_status == "SUCCESS":
            _monitoring_data["gemini_success"] += 1
        else:
            _monitoring_data["python_fallback"] += 1

        if gemini_time_ms is not None:
            _monitoring_data["total_gemini_time_ms"] += gemini_time_ms


def get_monitoring_data():
    with _lock:
        data = _monitoring_data.copy()

    successful = data["gemini_success"]

    if successful:
        average_time = round(
            data["total_gemini_time_ms"] / successful, 2
        )
    else:
        average_time = 0

    return {
        **data,
        "average_gemini_response_ms": average_time,
        "api_configured": None,
    }