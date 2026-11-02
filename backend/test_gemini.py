
from app.gemini_service import analyze_customer_details

result = analyze_customer_details(
    customer_name="Rahul Sharma",
    address="Flat 202, Green Park, near City Mall, Mumbai"
)

print("\nGemini Analysis:")
print(result)
