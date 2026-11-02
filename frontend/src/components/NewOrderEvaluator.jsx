
import { useEffect, useState } from "react";
import "./NewOrderEvaluator.css";

const API_URL = "http://127.0.0.1:8000";

function NewOrderEvaluator() {
  const [formData, setFormData] = useState({
    customer_name: "",
    order_value: "",
    customer_prior_rto: 0,
    customer_prior_orders: 0,
    address: "",
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    if (!loading) {
      setElapsedTime(0);
      return;
    }

    const timer = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [loading]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");
    setResult(null);
    setElapsedTime(0);

    const order = {
      order_id: `NEW${Date.now()}`,
      customer_name: formData.customer_name.trim(),
      order_value: Number(formData.order_value),
      customer_prior_rto: Number(formData.customer_prior_rto),
      customer_prior_orders: Number(formData.customer_prior_orders),
      address: formData.address.trim(),
    };

    try {
      const response = await fetch(
        `${API_URL}/api/orders/evaluate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(order),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Order evaluation failed."
        );
      }

      setResult(data);
    } catch (err) {
      setError(
        err.message || "Unable to connect to the backend."
      );
    } finally {
      setLoading(false);
    }
  };

  const actionDetails = {
    SHIP_AS_IS: {
      title: "Ready to Ship",
      description:
        "No additional confirmation is recommended. The order can proceed through normal dispatch.",
      nextStep:
        "Continue with your normal packing and shipping process.",
      className: "action-green",
      badge: "Recommended action",
    },

    WHATSAPP_CONFIRMATION: {
      title: "Confirm with Customer",
      description:
        "Ask the customer to confirm their order through WhatsApp before dispatch.",
      nextStep:
        "Open WhatsApp Automation, generate a confirmation message and wait for the customer's response.",
      className: "action-blue",
      badge: "Customer confirmation needed",
    },

    PREPAID_NUDGE: {
      title: "Encourage Prepaid Payment",
      description:
        "Offer the customer a small prepaid incentive to reduce potential COD return risk.",
      nextStep:
        "Open the prepaid discount calculator, review the suggested incentive and send the prepaid message.",
      className: "action-orange",
      badge: "Prepaid incentive suggested",
    },

    HOLD_REVIEW: {
      title: "Needs Manual Review",
      description:
        "The order has elevated risk or uncertain details. It should be reviewed by an operations employee before dispatch.",
      nextStep:
        "Check the customer information and contact the customer if necessary. Do not automatically cancel the order.",
      className: "action-red",
      badge: "Manual review required",
    },
  };

  const getActionDetails = (action) => {
    return (
      actionDetails[action] || {
        title: action?.replaceAll("_", " ") || "Review Required",
        description: "Review this order before taking further action.",
        nextStep: "Check the order details manually.",
        className: "action-blue",
        badge: "Review recommendation",
      }
    );
  };

  const getAssessmentLabel = (value) => {
    const labels = {
      PLAUSIBLE: "Looks reasonable",
      SUSPICIOUS: "Needs attention",
      UNCLEAR: "Could not determine",
      COMPLETE: "Complete",
      PARTIAL: "Partially complete",
      INCOMPLETE: "Incomplete",
    };

    return labels[value] || value || "Not available";
  };

  const getAssessmentClass = (value) => {
    const classes = {
      PLAUSIBLE: "assessment-good",
      COMPLETE: "assessment-good",
      SUSPICIOUS: "assessment-warning",
      PARTIAL: "assessment-warning",
      INCOMPLETE: "assessment-danger",
      UNCLEAR: "assessment-neutral",
    };

    return classes[value] || "assessment-neutral";
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    return `${String(minutes).padStart(2, "0")}:${String(
      remainingSeconds
    ).padStart(2, "0")}`;
  };

  const decision = result?.decision;
  const action = decision
    ? getActionDetails(decision.action)
    : null;

  const reasons = Array.isArray(decision?.reasons)
    ? decision.reasons
    : [];

  const assessment = decision?.ai_assessment;
  const issues = Array.isArray(assessment?.issues)
    ? assessment.issues
    : [];

  return (
    <section className="evaluator-container">
      <div className="evaluator-heading">
        <div>
          <span className="evaluator-label">
            ORDER RISK CHECK
          </span>

          <h2>New Order Evaluator</h2>

          <p>
            Check a COD order before deciding whether it is
            ready to ship, needs confirmation or requires review.
          </p>
        </div>

        <span className="ai-badge">
          <span className="ai-dot"></span>
          AI Assisted
        </span>
      </div>

      <div className="evaluator-intro">
        <strong>How it works</strong>
        <p>
          Enter the customer's details below. The system checks
          order history, delivery address and other risk factors
          to recommend the next action.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="evaluator-form">
        <div className="evaluator-grid">
          <div className="form-group">
            <label htmlFor="customer_name">
              Customer Name
            </label>

            <input
              id="customer_name"
              type="text"
              name="customer_name"
              value={formData.customer_name}
              onChange={handleChange}
              placeholder="e.g. Rahul Sharma"
              required
            />

            <small>
              Enter the name provided with the order.
            </small>
          </div>

          <div className="form-group">
            <label htmlFor="order_value">
              Order Value (₹)
            </label>

            <input
              id="order_value"
              type="number"
              name="order_value"
              value={formData.order_value}
              onChange={handleChange}
              placeholder="e.g. 649"
              min="1"
              step="0.01"
              required
            />

            <small>
              Enter the total order amount.
            </small>
          </div>

          <div className="form-group">
            <label htmlFor="customer_prior_rto">
              Previous RTOs
            </label>

            <input
              id="customer_prior_rto"
              type="number"
              name="customer_prior_rto"
              value={formData.customer_prior_rto}
              onChange={handleChange}
              min="0"
              required
            />

            <small>
              How many previous orders were returned to origin?
            </small>
          </div>

          <div className="form-group">
            <label htmlFor="customer_prior_orders">
              Previous Orders
            </label>

            <input
              id="customer_prior_orders"
              type="number"
              name="customer_prior_orders"
              value={formData.customer_prior_orders}
              onChange={handleChange}
              min="0"
              required
            />

            <small>
              Total number of previous orders placed by this customer.
            </small>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="address">
            Delivery Address
          </label>

          <textarea
            id="address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="Enter house or building number, street, locality, city and PIN code"
            rows="3"
            required
          />

          <small>
            Include as many delivery details as the customer has provided.
            English, Hindi and Hinglish descriptions can be assessed.
          </small>
        </div>

        <button
          type="submit"
          className="evaluate-button"
          disabled={loading}
        >
          {loading ? "Checking Order..." : "Check Order Risk"}
          {!loading && <span>→</span>}
        </button>

        {loading && (
          <div
            className="loading-message"
            role="status"
            aria-live="polite"
          >
            <div className="loading-top">
              <div>
                <span className="loading-title">
                  Your order is being checked
                </span>

                <p>
                  Assessing customer details, address quality
                  and COD risk. This may take up to two minutes.
                  Please keep this page open.
                </p>
              </div>

              <strong className="timer">
                {formatTime(elapsedTime)}
              </strong>
            </div>

            <div className="loading-track">
              <div className="loading-progress"></div>
            </div>
          </div>
        )}
      </form>

      {error && (
        <div
          className="evaluator-error"
          role="alert"
        >
          <strong>Unable to check this order</strong>
          <p>{error}</p>
          <small>
            Please check your connection and try again.
            If the problem continues, contact your system administrator.
          </small>
        </div>
      )}

      {result && decision && (
        <div className="evaluation-result">
          <div className="result-heading">
            <div>
              <span className="evaluator-label">
                ORDER CHECK RESULT
              </span>

              <h3>
                {result.order?.order_id || "New Order"}
              </h3>
            </div>

            <span
              className={
                result.ai_status === "SUCCESS"
                  ? "ai-status success"
                  : "ai-status fallback"
              }
            >
              {result.ai_status === "SUCCESS"
                ? "AI Assessment Completed"
                : "Rule-Based Assessment"}
            </span>
          </div>

          <div className="result-stats">
            <div className="result-stat">
              <span>Order Risk Score</span>

              <strong className="risk-number">
                {decision.risk_score}
                <small>/100</small>
              </strong>

              <small className="stat-help">
                A higher score indicates greater estimated
                order risk.
              </small>
            </div>

            <div className="result-stat">
              <span>Recommended Action</span>

              <strong className={action.className}>
                {action.title}
              </strong>

              <small className="stat-help">
                {action.badge}
              </small>
            </div>
          </div>

          <div className="action-guidance">
            <span className="guidance-label">
              WHAT SHOULD I DO NEXT?
            </span>

            <h4>{action.title}</h4>

            <p>{action.description}</p>

            <div className="next-step">
              <strong>Next step</strong>
              <p>{action.nextStep}</p>
            </div>
          </div>

          <div className="result-explanation">
            <h4>Why was this action recommended?</h4>

            <p>
              {decision.explanation ||
                "The recommendation is based on the available order information."}
            </p>
          </div>

          <div className="result-explanation">
            <h4>Things to Check</h4>

            {reasons.length > 0 ? (
              <ul>
                {reasons.map((reason, index) => (
                  <li key={index}>{reason}</li>
                ))}
              </ul>
            ) : (
              <p>
                No additional risk factors were identified.
              </p>
            )}
          </div>

          {result.ai_status !== "SUCCESS" && (
            <div className="fallback-notice">
              <strong>AI assessment was unavailable</strong>

              <p>
                This recommendation was generated using the
                system's Python risk rules. Customer name and
                address could not be assessed by Gemini for
                this evaluation.
              </p>

              <p>
                Review the customer details manually before
                dispatch, especially if the address or name
                is unclear.
              </p>
            </div>
          )}

          {assessment && (
            <div className="ai-assessment">
              <div className="assessment-heading">
                <div>
                  <span className="evaluator-label">
                    CUSTOMER DETAIL CHECK
                  </span>

                  <h4>AI Assessment</h4>
                </div>

                <span className="assessment-source">
                  Gemini
                </span>
              </div>

              <div className="assessment-grid">
                <div className="assessment-item">
                  <span>Customer Name</span>

                  <strong
                    className={getAssessmentClass(
                      assessment.name_assessment
                    )}
                  >
                    {getAssessmentLabel(
                      assessment.name_assessment
                    )}
                  </strong>
                </div>

                <div className="assessment-item">
                  <span>Delivery Address</span>

                  <strong
                    className={getAssessmentClass(
                      assessment.address_assessment
                    )}
                  >
                    {getAssessmentLabel(
                      assessment.address_assessment
                    )}
                  </strong>
                </div>
              </div>

              <p className="assessment-explanation">
                {assessment.explanation}
              </p>

              {issues.length > 0 && (
                <div className="identified-issues">
                  <strong>Details needing attention</strong>

                  <ul>
                    {issues.map((issue, index) => (
                      <li key={index}>{issue}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          <p className="result-message">
            {result.message}
          </p>

          <p className="result-disclaimer">
            This is a decision-support recommendation, not
            a guarantee that an order will be delivered or returned.
            Review unusual cases before taking action.
          </p>
        </div>
      )}
    </section>
  );
}

export default NewOrderEvaluator;
