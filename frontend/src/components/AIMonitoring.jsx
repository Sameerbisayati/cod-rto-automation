import { useEffect, useState } from "react";
import "./AIMonitoring.css";

function AIMonitoring() {
  const [monitoring, setMonitoring] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchMonitoring = async () => {
    try {
      const response = await fetch(
        "http://127.0.0.1:8000/api/ai/monitoring"
      );

      if (!response.ok) {
        throw new Error("Unable to fetch AI monitoring data.");
      }

      const data = await response.json();
      setMonitoring(data);
      setError("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMonitoring();

    const interval = setInterval(fetchMonitoring, 10000);

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return <p className="monitoring-message">Loading AI monitoring...</p>;
  }

  if (error) {
    return <p className="monitoring-error">{error}</p>;
  }

  const averageSeconds = (
    monitoring.average_gemini_response_ms / 1000
  ).toFixed(2);

  return (
    <section className="ai-monitoring">
      <div className="monitoring-header">
        <div>
          <h2>AI Performance Monitoring</h2>
          <p>Gemini API activity and response performance</p>
        </div>

        <span className="api-status">
          <span className="status-dot"></span>
          {monitoring.api_configured ? "API Configured" : "API Missing"}
        </span>
      </div>

      <div className="monitoring-grid">
        <div className="monitor-card">
          <span>Total Evaluations</span>
          <h3>{monitoring.total_evaluations}</h3>
        </div>

        <div className="monitor-card">
          <span>Gemini Success</span>
          <h3 className="success-value">
            {monitoring.gemini_success}
          </h3>
        </div>

        <div className="monitor-card">
          <span>Python Fallback</span>
          <h3 className="fallback-value">
            {monitoring.python_fallback}
          </h3>
        </div>

        <div className="monitor-card">
          <span>Average Response Time</span>
          <h3>{averageSeconds}s</h3>
        </div>
      </div>

      <div className="monitoring-footer">
        <span>Total Gemini Time</span>
        <strong>
          {(monitoring.total_gemini_time_ms / 1000).toFixed(2)}s
        </strong>
      </div>
    </section>
  );
}

export default AIMonitoring;