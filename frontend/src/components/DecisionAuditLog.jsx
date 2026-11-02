import { useEffect, useState } from "react";
import "./DecisionAuditLog.css";

const API_URL = "http://127.0.0.1:8000";

function DecisionAuditLog() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("ALL");

  const fetchAuditRecords = async () => {
    try {
      const response = await fetch(`${API_URL}/api/audit?limit=100`);

      if (!response.ok) {
        throw new Error("Unable to load audit records.");
      }

      const data = await response.json();
      setRecords(data.records || []);
      setError("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditRecords();

    const interval = setInterval(fetchAuditRecords, 10000);

    return () => clearInterval(interval);
  }, []);

  const filteredRecords =
    filter === "ALL"
      ? records
      : records.filter((record) => record.action === filter);

  const formatDate = (date) => {
    return new Date(date).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  if (loading) {
    return <p className="audit-message">Loading audit records...</p>;
  }

  if (error) {
    return <p className="audit-error">{error}</p>;
  }

  return (
    <section className="audit-section">
      <div className="audit-header">
        <div>
          <h2>Decision Audit Log</h2>
          <p>History of newly evaluated orders</p>
        </div>

        <div className="audit-count">
          {records.length} Records
        </div>
      </div>

      <div className="audit-toolbar">
        <label htmlFor="audit-filter">Filter by action</label>

        <select
          id="audit-filter"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="ALL">All Actions</option>
          <option value="SHIP_AS_IS">Ship As-Is</option>
          <option value="WHATSAPP_CONFIRMATION">
            WhatsApp Confirmation
          </option>
          <option value="PREPAID_NUDGE">Prepaid Nudge</option>
          <option value="HOLD_REVIEW">Hold / Review</option>
        </select>

        <button onClick={fetchAuditRecords}>
          Refresh
        </button>
      </div>

      {filteredRecords.length === 0 ? (
        <div className="audit-empty">
          No audit records found. Evaluate a new order to create one.
        </div>
      ) : (
        <div className="audit-table-wrapper">
          <table className="audit-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Risk</th>
                <th>Recommended Action</th>
                <th>AI Status</th>
                <th>Gemini Time</th>
                <th>Evaluated At</th>
              </tr>
            </thead>

            <tbody>
              {filteredRecords.map((record, index) => (
                <tr key={`${record.order_id}-${record.evaluated_at}-${index}`}>
                  <td>{record.order_id}</td>
                  <td>{record.customer_name}</td>
                  <td>
                    <span className="audit-risk">
                      {record.risk_score}/100
                    </span>
                  </td>
                  <td>
                    {record.action.replaceAll("_", " ")}
                  </td>
                  <td>
                    <span
                      className={`audit-status ${
                        record.ai_status === "SUCCESS"
                          ? "audit-success"
                          : "audit-fallback"
                      }`}
                    >
                      {record.ai_status}
                    </span>
                  </td>
                  <td>
                    {record.gemini_time_ms != null
                      ? `${(record.gemini_time_ms / 1000).toFixed(2)}s`
                      : "N/A"}
                  </td>
                  <td>{formatDate(record.evaluated_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="audit-note">
        Records show recommendations generated during new order evaluations.
        They do not indicate that an order was actually shipped or cancelled.
      </p>
    </section>
  );
}

export default DecisionAuditLog;