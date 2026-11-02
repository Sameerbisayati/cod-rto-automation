
import { useEffect, useState } from "react";
import Header from "./components/Header";
import Navbar from "./components/Navbar";
import StatCard from "./components/StatCard";
import DailyOperationsDashboard from "./components/DailyOperationsDashboard";
import NewOrderEvaluator from "./components/NewOrderEvaluator";
import AIMonitoring from "./components/AIMonitoring";
import OrdersTable from "./components/OrdersTable";
import DecisionTable from "./components/DecisionTable";
import WhatsAppSimulator from "./components/WhatsAppSimulator";
import ImpactDashboard from "./components/ImpactDashboard";
import DecisionAnalytics from "./components/DecisionAnalytics";
import DecisionAuditLog from "./components/DecisionAuditLog";
import PrepaidDiscountCalculator from "./components/PrepaidDiscountCalculator";

function App() {
    const [dashboard, setDashboard] = useState(null);
    const [error, setError] = useState("");
    const [activeSection, setActiveSection] = useState("overview");

    useEffect(() => {
        fetch(`${import.meta.env.VITE_API_URL}/api/dashboard`)
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Failed to load dashboard");
                }
                return response.json();
            })
            .then((data) => setDashboard(data))
            .catch((err) => setError(err.message));
    }, []);

    const stats = dashboard
        ? [
              {
                  title: "Total Orders",
                  value: dashboard.total_orders.toLocaleString("en-IN"),
                  subtitle: "All orders in dataset",
              },
              {
                  title: "Delivered Orders",
                  value: dashboard.delivered_orders.toLocaleString("en-IN"),
                  subtitle: "Successfully delivered",
              },
              {
                  title: "RTO Orders",
                  value: dashboard.rto_orders.toLocaleString("en-IN"),
                  subtitle: "Returned to origin",
              },
              {
                  title: "Pending Orders",
                  value: dashboard.pending_orders.toLocaleString("en-IN"),
                  subtitle: "Awaiting final status",
              },
              {
                  title: "RTO Rate",
                  value: `${dashboard.rto_rate}%`,
                  subtitle: "Historical completed-order rate",
              },
              {
                  title: "Average Order Value",
                  value: `₹${dashboard.average_order_value.toLocaleString("en-IN")}`,
                  subtitle: "Average of completed sample orders",
              },
          ]
        : [];

    const renderSection = () => {
        switch (activeSection) {
            case "overview":
                return (
                    <>
                            <DailyOperationsDashboard />
                        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                            {stats.map((stat) => (
                                <StatCard
                                    key={stat.title}
                                    title={stat.title}
                                    value={stat.value}
                                    subtitle={stat.subtitle}
                                />
                            ))}
                        </section>

                        <AIMonitoring />
                        <DecisionAnalytics />
                    </>
                );

            case "orders":
                return (
                    <>
                        <OrdersTable />
                        <DecisionTable />
                        <DecisionAuditLog />
                    </>
                );

            case "evaluator":
                return <NewOrderEvaluator />;

            case "whatsapp":
                return <WhatsAppSimulator />;

            case "analytics":
                return (
                    <>
                        <DecisionAnalytics />
                        <DecisionAuditLog />
                    </>
                );

            case "impact":
                return (
                    <>
                        <PrepaidDiscountCalculator />
                        <ImpactDashboard />
                    </>
                );

            default:
                return null;
        }
    };

    return (
        <main className="min-h-screen bg-slate-950 px-4 py-6 md:px-8">
            <div className="max-w-7xl mx-auto">
                <Header />

                {error && (
                    <p className="text-red-400 mb-5">{error}</p>
                )}

                {!dashboard && !error && (
                    <p className="text-slate-300 py-8">
                        Loading dashboard...
                    </p>
                )}

                {dashboard && (
                    <>
                        <Navbar
                            activeSection={activeSection}
                            onNavigate={setActiveSection}
                        />

                        <div className="mt-8 mb-6">
                            <h1 className="text-2xl font-bold text-white">
                                {activeSection === "overview" && "Dashboard Overview"}
                                {activeSection === "orders" && "Order Management"}
                                {activeSection === "evaluator" && "AI Order Evaluator"}
                                {activeSection === "whatsapp" && "WhatsApp Automation"}
                                {activeSection === "analytics" && "Decision Analytics"}
                                {activeSection === "impact" && "Financial Impact"}
                            </h1>

                            <p className="text-slate-400 mt-2">
                                Monitor and manage your COD RTO automation system.
                            </p>
                        </div>

                        <div className="space-y-8">
                            {renderSection()}
                        </div>
                    </>
                )}
            </div>
        </main>
    );
}

export default App;
