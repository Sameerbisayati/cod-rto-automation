
import { useEffect, useRef, useState } from "react";
import "./WhatsAppSimulator.css";

const API_URL = "http://127.0.0.1:8000";

function WhatsAppSimulator() {
    const [orders, setOrders] = useState([]);
    const [messages, setMessages] = useState([]);
    const [language, setLanguage] = useState("ENGLISH");
    const [loading, setLoading] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [historySearch, setHistorySearch] = useState("");

    const historyRef = useRef(null);

    const fetchOrders = async () => {
        try {
            const response = await fetch(`${API_URL}/api/decisions`);

            if (!response.ok) {
                throw new Error("Unable to load orders.");
            }

            const data = await response.json();

            const eligibleOrders = data.filter((order) =>
                ["WHATSAPP_CONFIRMATION", "PREPAID_NUDGE"].includes(
                    order.action
                )
            );

            setOrders(eligibleOrders);
        } catch (err) {
            setError(err.message);
        }
    };

    const fetchMessages = async () => {
        try {
            const response = await fetch(`${API_URL}/api/whatsapp/messages`);

            if (!response.ok) {
                throw new Error("Unable to load WhatsApp history.");
            }

            const data = await response.json();
            setMessages(data.messages || []);
        } catch (err) {
            setError(err.message);
        }
    };

    useEffect(() => {
        fetchOrders();
        fetchMessages();
    }, []);

    useEffect(() => {
        if (success) {
            historyRef.current?.scrollIntoView({
                behavior: "smooth",
                block: "start",
            });
        }
    }, [success]);

    // Search both eligible orders and message history
    const searchText = historySearch.trim().toLowerCase();

    const matchesSearch = (item) => {
        if (!searchText) return true;

        return JSON.stringify(item || {})
            .toLowerCase()
            .includes(searchText);
    };

    const filteredOrders = orders.filter(matchesSearch);
    const filteredMessages = messages.filter(matchesSearch);

    const generateMessage = async (order) => {
        setLoading(true);
        setError("");
        setSuccess("");

        try {
            const response = await fetch(
                `${API_URL}/api/whatsapp/simulate`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        ...order,
                        language,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.detail || "Message generation failed.");
            }

            setSelectedOrder(order.order_id);
            await fetchMessages();

            setSuccess(
                "WhatsApp message generated successfully! You can view it in Message History below."
            );
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    
const sendReply = async (orderId, reply) => {
    setError("");
    setSuccess("");

    try {
        const response = await fetch(
            `${API_URL}/api/whatsapp/reply`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    order_id: orderId,
                    reply,
                }),
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.detail || "Reply failed.");
        }

        setSuccess(data.response || "Customer reply processed successfully.");

        await fetchMessages();

    } catch (err) {
        setError(err.message);
    }
};

    const expireMessage = async (orderId) => {
        setError("");
        setSuccess("");

        try {
            const response = await fetch(
                `${API_URL}/api/whatsapp/timeout`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        order_id: orderId,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.detail || "Unable to expire message.");
            }

            await fetchMessages();
        } catch (err) {
            setError(err.message);
        }
    };

    const statusClass = (status) => {
        const statusColors = {
            CONFIRMED_READY_TO_SHIP: "success",
            PAYMENT_REPORTED: "success",
            AWAITING_REPLY: "warning",
            PAYMENT_PENDING: "info",
            CUSTOMER_DECLINED: "danger",
            PREPAID_DECLINED: "danger",
            EXPIRED: "neutral",
        };

        return statusColors[status] || "neutral";
    };

    return (
        <section className="whatsapp-section">

            <div className="whatsapp-heading">
                <div>
                    <h2>WhatsApp Automation</h2>
                    <p>
                        Simulate customer confirmation and prepaid
                        conversations.
                    </p>
                </div>

                <span className="mock-badge">SIMULATION</span>
            </div>

            {error && (
                <div className="whatsapp-error">
                    {error}
                </div>
            )}

            {success && (
                <div className="whatsapp-success">
                    <span>✓</span>
                    {success}
                </div>
            )}

            {/* Language and Search Toolbar */}
            <div className="whatsapp-toolbar">

                <div className="language-selector">
                    <label htmlFor="whatsapp-language">
                        Message Language
                    </label>

                    <select
                        id="whatsapp-language"
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                    >
                        <option value="ENGLISH">English</option>
                        <option value="HINDI">Hindi</option>
                        <option value="HINGLISH">Hinglish</option>
                    </select>
                </div>

                <div className="whatsapp-search">
                    <input
                        type="search"
                        placeholder="Search customer, order ID or status..."
                        value={historySearch}
                        onChange={(e) => setHistorySearch(e.target.value)}
                    />

                    {historySearch && (
                        <button
                            type="button"
                            className="search-clear-button"
                            onClick={() => setHistorySearch("")}
                        >
                            Clear
                        </button>
                    )}
                </div>

            </div>

            {/* Eligible Orders */}
            <div className="whatsapp-orders">

                <div className="whatsapp-section-heading">
                    <div>
                        <h3>Eligible Orders</h3>
                        <p>
                            Orders that need confirmation or prepaid
                            encouragement.
                        </p>
                    </div>

                    <span className="whatsapp-count">
                        {filteredOrders.length} Orders
                    </span>
                </div>

                {filteredOrders.length === 0 ? (
                    <p className="history-empty">
                        {historySearch
                            ? "No matching orders found."
                            : "No eligible orders available."}
                    </p>
                ) : (
                    <div className="whatsapp-order-list">

                        {filteredOrders.map((order, index) => (
                            <div
                                className="whatsapp-order"
                                key={`${order.order_id}-${index}`}
                            >
                                <div className="whatsapp-order-details">
                                    <h4>{order.customer_name}</h4>

                                    <p>Order: {order.order_id}</p>

                                    <p>
                                        Value: ₹
                                        {Number(order.order_value).toFixed(2)}
                                    </p>

                                    <span className="whatsapp-action">
                                        {order.action}
                                    </span>
                                </div>

                                <button
                                    disabled={loading}
                                    onClick={() => generateMessage(order)}
                                >
                                    {loading && selectedOrder === order.order_id
                                        ? "Generating..."
                                        : "Generate Message"}
                                </button>
                            </div>
                        ))}

                    </div>
                )}

            </div>

            {/* Message History */}
            <div
                className="whatsapp-history"
                ref={historyRef}
            >

                <div className="whatsapp-history-heading">
                    <div>
                        <h3>Message History</h3>
                        <p>
                            Track customer responses and message statuses.
                        </p>
                    </div>

                    <button
                        className="refresh-button"
                        onClick={fetchMessages}
                    >
                        Refresh
                    </button>
                </div>

                <p className="whatsapp-search-count">
                    Showing {filteredMessages.length} of {messages.length} messages
                </p>

                {messages.length === 0 ? (
                    <p className="history-empty">
                        No messages generated yet.
                    </p>
                ) : filteredMessages.length === 0 ? (
                    <p className="history-empty">
                        No matching messages found. Try another search.
                    </p>
                ) : (

                    <div className="whatsapp-message-grid">

                        {filteredMessages.map((item, index) => (
                            <div
                                className="whatsapp-message"
                                key={`${item.order_id}-${item.created_at}-${index}`}
                            >

                                <div className="whatsapp-message-top">
                                    <div>
                                        <h4>{item.customer_name}</h4>
                                        <p>Order: {item.order_id}</p>
                                    </div>

                                    <span
                                        className={`whatsapp-status ${statusClass(
                                            item.status
                                        )}`}
                                    >
                                        {item.status}
                                    </span>
                                </div>

                                <span className="whatsapp-language-tag">
                                    {item.language || "ENGLISH"}
                                </span>

                                <div className="whatsapp-message-content">
                                    {item.message}
                                </div>
{item.reply && (
    <p className="whatsapp-customer-reply">
        Customer Reply: {item.reply}
    </p>
)}

                                {[
                                    "AWAITING_REPLY",
                                    "PAYMENT_PENDING",
                                ].includes(item.status) && (

                                    <div className="whatsapp-reply-controls">

                                        <button
                                            onClick={() =>
                                                sendReply(item.order_id, "YES")
                                            }
                                        >
                                            YES
                                        </button>

                                        <button
                                            onClick={() =>
                                                sendReply(item.order_id, "NO")
                                            }
                                        >
                                            NO
                                        </button>

                                        <button
                                            onClick={() =>
                                                sendReply(item.order_id, "MAYBE")
                                            }
                                        >
                                            RANDOM / UNCLEAR
                                        </button>

                                        {item.status === "PAYMENT_PENDING" && (
                                            <button
                                                onClick={() =>
                                                    sendReply(item.order_id, "PAID")
                                                }
                                            >
                                                PAID
                                            </button>
                                        )}

                                        <button
                                            className="expire-button"
                                            onClick={() =>
                                                expireMessage(item.order_id)
                                            }
                                        >
                                            Expire
                                        </button>

                                    </div>
                                )}

                            </div>
                        ))}

                    </div>
                )}

            </div>
<button
  className="back-to-top"
  onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
  title="Back to top"
  aria-label="Back to top"
>
  ↑
</button>
        </section>
    );
}

export default WhatsAppSimulator;
