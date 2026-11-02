
import os
import json

from dotenv import load_dotenv
from google import genai
from google.genai import types

load_dotenv()

GEMINI_MODEL = "gemini-3.5-flash-lite"
GEMINI_TIMEOUT_MS = 90000


def analyze_customer_details(customer_name, address):
    api_key = os.getenv("GEMINI_API_KEY")

    if not api_key:
        raise ValueError("GEMINI_API_KEY is missing from backend .env")

    client = genai.Client(
        api_key=api_key,
        http_options=types.HttpOptions(
            timeout=GEMINI_TIMEOUT_MS
        )
    )

    response_schema = {
        "type": "OBJECT",
        "properties": {
            "name_assessment": {
                "type": "STRING",
                "enum": ["PLAUSIBLE", "SUSPICIOUS", "UNCLEAR"]
            },
            "address_assessment": {
                "type": "STRING",
                "enum": ["COMPLETE", "PARTIAL", "INCOMPLETE", "UNCLEAR"]
            },
            "issues": {
                "type": "ARRAY",
                "items": {"type": "STRING"}
            },
            "explanation": {
                "type": "STRING"
            }
        },
        "required": [
            "name_assessment",
            "address_assessment",
            "issues",
            "explanation"
        ]
    }

    prompt = f"""
Assess these COD delivery details.

Name: {customer_name}
Address: {address}

Rules:
- Mark clearly meaningless names like asdf or test as SUSPICIOUS.
- Do not penalize unfamiliar, short, culturally different,
  or non-English names.
- Assess whether the address has enough delivery information.
- Understand English, Hindi and Hinglish.
- Missing landmarks alone do not make an address invalid.
- Do not invent missing information.
- Use UNCLEAR when evidence is insufficient.

Return the required JSON assessment with a short explanation.
"""

    try:
        response = client.models.generate_content(
            model=GEMINI_MODEL,
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=response_schema,
                temperature=0.1,
                max_output_tokens=256,
                thinking_config=types.ThinkingConfig(
                    thinking_level=types.ThinkingLevel.LOW
                )
            )
        )

        if not response.text:
            raise ValueError("Gemini returned an empty response")

        result = json.loads(response.text)

        if result["name_assessment"] not in [
            "PLAUSIBLE", "SUSPICIOUS", "UNCLEAR"
        ]:
            raise ValueError("Invalid Gemini name assessment")

        if result["address_assessment"] not in [
            "COMPLETE", "PARTIAL", "INCOMPLETE", "UNCLEAR"
        ]:
            raise ValueError("Invalid Gemini address assessment")

        return result

    finally:
        client.close()
