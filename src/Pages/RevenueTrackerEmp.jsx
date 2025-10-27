import { useState, useEffect } from "react";
import { useAuth } from "../auth.jsx";

const API_BASE = import.meta.env.VITE_API_BASE || "http://127.0.0.1:5000";

export default function RevenueTrackerEmp() {
  const { token, user } = useAuth();
  const [revenue, setRevenue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPO, setSelectedPO] = useState(null);

  useEffect(() => {
    async function fetchRevenue() {
      try {
        const res = await fetch(`${API_BASE}/api/customers/my-reports`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();

        // ✅ Normalize all data safely
        const formatted = data
          .filter((r) => r.orderStatus === "Won")
          .map((r) => ({
            customerId: r.customerId || "-",
            customerMobile:
              r.customerMobile ||
              r.mobile ||
              r.visits?.[0]?.customerMobile ||
              "NA",
            customerName:
              r.customerName ||
              r.name ||
              r.visits?.[0]?.customerName ||
              "-",
            customerType:
              r.customerType ||
              r.visits?.[0]?.customerType ||
              "Manual",
            vertical: r.vertical || r.visits?.[0]?.vertical || "-",
            distributorCode:
              r.distributorCode || r.visits?.[0]?.distributorCode || "-",
            distributorName:
              r.distributorName || r.visits?.[0]?.distributorName || "-",
            empCode: r.createdBy || r.empCode || "-",
            empName: r.createdByName || user?.name || "-",
            orderValue: r.orderValue || "-",
            itemName: r.itemName || "-",
            poNumber: r.poNumber || "-",
            poFileUrl: r.poFileUrl || "-",
            date: r.date || r.createdAt || "-",
          }));

        setRevenue(formatted);
      } catch (err) {
        console.error("Error fetching revenue:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchRevenue();
  }, [token]);

  if (loading) return <p>Loading revenue data...</p>;
  if (!revenue.length) return <p>No Order-Won entries found.</p>;

  return (
    <div style={{ padding: 20 }}>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>
        💰 Revenue Tracker (Employee View)
      </h2>

      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
        }}
      >
        <thead>
          <tr style={{ background: "#f4f4f4", textAlign: "left" }}>
            <th style={th}>Customer ID</th>
            <th style={th}>Customer Mob No.</th>
            <th style={th}>Customer Name</th>
            <th style={th}>Customer Type</th>
            <th style={th}>Vertical</th>
            <th style={th}>Distributor Code</th>
            <th style={th}>Distributor Name</th>
            <th style={th}>Emp Code</th>
            <th style={th}>Emp Name</th>
            <th style={th}>Total Value (₹)</th>
            <th style={th}>Item</th>
            <th style={th}>PO No.</th>
            <th style={th}>Uploaded PO</th>
            <th style={th}>Date</th>
          </tr>
        </thead>

        <tbody>
          {revenue.map((r, i) => (
            <tr key={i} style={{ borderBottom: "1px solid #ddd" }}>
              <td style={td}>{r.customerId}</td>
              <td style={td}>{r.customerMobile}</td>
              <td style={td}>{r.customerName}</td>
              <td style={td}>{r.customerType}</td>
              <td style={td}>{r.vertical}</td>
              <td style={td}>{r.distributorCode}</td>
              <td style={td}>{r.distributorName}</td>
              <td style={td}>{r.empCode}</td>
              <td style={td}>{r.empName}</td>
              <td style={{ ...td, fontWeight: 600, color: "#2563eb" }}>
                {r.orderValue}
              </td>
              <td style={td}>{r.itemName}</td>
              <td style={td}>{r.poNumber}</td>
              <td style={td}>
                {r.poFileUrl && r.poFileUrl !== "-" ? (
                  <button
                    onClick={() =>
                      setSelectedPO(
                        r.poFileUrl.startsWith("http")
                          ? r.poFileUrl
                          : `${API_BASE}${r.poFileUrl}`
                      )
                    }
                    style={viewBtn}
                  >
                    🖼️ View
                  </button>
                ) : (
                  "-"
                )}
              </td>
              <td style={td}>
                {r.date ? new Date(r.date).toLocaleDateString() : "-"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {selectedPO && (
        <div style={overlay} onClick={() => setSelectedPO(null)}>
          <div style={popup} onClick={(e) => e.stopPropagation()}>
            <button style={closeBtn} onClick={() => setSelectedPO(null)}>
              ✕ Close
            </button>
            {selectedPO.endsWith(".pdf") ? (
              <iframe
                src={selectedPO}
                width="100%"
                height="600px"
                style={{ border: "1px solid #ccc", borderRadius: 8 }}
                title="PO Preview"
              />
            ) : (
              <img
                src={selectedPO}
                alt="PO"
                style={{
                  width: "100%",
                  maxWidth: "900px",
                  borderRadius: 8,
                  objectFit: "contain",
                }}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- Styles ---------- */
const th = {
  padding: "10px",
  borderBottom: "2px solid #ccc",
  fontSize: "13px",
  fontWeight: "600",
  whiteSpace: "nowrap",
};
const td = {
  padding: "8px 10px",
  fontSize: "13px",
  whiteSpace: "nowrap",
};
const viewBtn = {
  border: "none",
  background: "none",
  color: "#2563eb",
  cursor: "pointer",
  fontWeight: 600,
};
const overlay = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100vw",
  height: "100vh",
  background: "rgba(0,0,0,0.6)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 9999,
};
const popup = {
  background: "#fff",
  borderRadius: 10,
  padding: 16,
  maxWidth: "90%",
  maxHeight: "90vh",
  overflow: "auto",
  position: "relative",
};
const closeBtn = {
  position: "absolute",
  top: 10,
  right: 10,
  background: "#e11d48",
  color: "#fff",
  border: "none",
  borderRadius: 6,
  padding: "4px 10px",
  cursor: "pointer",
};
