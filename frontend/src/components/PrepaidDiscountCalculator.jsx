
import { useState } from "react";
import "./PrepaidDiscountCalculator.css";

const API_URL = "http://127.0.0.1:8000";

function PrepaidDiscountCalculator() {
  const [orderValue, setOrderValue] = useState("649");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const calculateDiscount = async () => {
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch(
        `${API_URL}/api/whatsapp/discount`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            order_value: Number(orderValue),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Calculation failed.");
      }

      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="discount-section">
      <div className="discount-heading">
        <div>
          <h2>Smart Prepaid Discount Calculator</h2>
          <p>
            Calculate a discount using estimated RTO savings
            and order value.
          </p>
        </div>
        <span className="discount-badge">SMART PRICING</span>
      </div>

      <div className="discount-input-area">
        <label>Enter order value (₹)</label>

        <input
          type="number"
          min="1"
          step="1"
          value={orderValue}
          onChange={(e) => setOrderValue(e.target.value)}
          placeholder="Enter order value"
        />

        <button
          onClick={calculateDiscount}
          disabled={loading || !orderValue || Number(orderValue) <= 0}
        >
          {loading ? "Calculating..." : "Calculate Discount"}
        </button>
      </div>

      {error && (
        <div className="discount-error">{error}</div>
      )}

      {result && (
        <div className="discount-results">
          <div className="discount-highlight">
            <span>Recommended prepaid discount</span>
            <strong>₹{result.recommended_discount}</strong>
            <small>{result.discount_percentage}% of order value</small>
          </div>

          <div className="discount-metrics">
            <div>
              <span>Order value</span>
              <strong>₹{result.order_value}</strong>
            </div>

            <div>
              <span>Expected RTO saving</span>
              <strong>₹{result.expected_rto_saving}</strong>
            </div>

            <div>
              <span>Expected net benefit</span>
              <strong>₹{result.expected_net_benefit}</strong>
            </div>

            <div>
              <span>Gross profit before discount</span>
              <strong>₹{result.gross_profit_before_discount}</strong>
            </div>

            <div>
              <span>Gross profit after discount</span>
              <strong>₹{result.gross_profit_after_discount}</strong>
            </div>
          </div>

          <div className="discount-note">
            {result.note}
          </div>
        </div>
      )}
    </section>
  );
}

export default PrepaidDiscountCalculator;
