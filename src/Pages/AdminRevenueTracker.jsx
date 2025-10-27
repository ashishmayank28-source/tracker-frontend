import { useState, useEffect } from "react";
import { useAuth } from "../auth.jsx";
import * as XLSX from "xlsx";

const API_BASE = import.meta.env.VITE_API_BASE || "http://127.0.0.1:5000";

export default function AdminRevenueTracker() {
  const { token, user } = useAuth();
  const [revenue, setRevenue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPO, setSelectedPO] = useState(null);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [region, setRegion] = useState("");
  const [branch, setBranch] = useState("");

  /* 🔹 Fetch Admin Revenue (all hierarchy data) */
  async function loadRevenue() {
    setLoading(true);
    try {
      let url = `${API_BASE}/api/revenue/admin`;
      const params = [];
      if (from && to) params.push(`from=${from}&to=${to}`);
      if (region) params.push(`region=${region}`);
      if (branch) params.push(`branch=${branch}`);
      if (params.length) url += "?" + params.join("&");

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setRevenue(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Admin Revenue fetch error:", err);
      setRevenue([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRevenue();
  }, []);

  /* 🔹 Export to Excel */
  function exportToExcel() {
    const sheetData = revenue.map((r) => ({
      Date: new Date(r.date).toLocaleDateString(),
      Region: r.region || "-",
      Branch: r.branch || "-",
      "Employee": `${r.empName || "-"} (${r.empCode || "-"})`,
      "Manager Code": r.managerCode || "-",
      "Manager Name": r.managerName || "-",
      "Customer ID": r.customerId,
      "Customer Name": r.customerName,
      "Customer Type": r.customerType,
      "Vertical": r.verticalType || r.vertical,
      "Distributor": r.distributorName,
      "Order Type": r.orderType,
      "Item": r.itemName,
      "Order Value (₹)": r.orderValue,
      "PO No": r.poNumber,
      "Approved By": r.approvedBy || "-",
      "Submitted By": r.submittedBy || "-",
    }));

    const ws = XLSX.utils.json_to_sheet(sheetData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Admin Revenue");
    XLSX.writeFile(wb, `Admin_Revenue_${new Date().toLocaleDateString()}.xlsx`);
  }

  return (
    <div style={{ padding: 20 }}>
      <h2 style={{ fontSize: "22px", fontWeight: "bold", marginBottom: 10 }}>
        💰 Admin Revenue Tracker
      </h2>
      <p style={{ color: "#555", marginBottom: 16 }}>
        View all revenue entries submitted from every RM, BM, and Manager.
      </p>

      {/* 🔹 Filter Row */}
      <div style={filterRow}>
        <input
          type="date"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
          style={inputStyle}
        />
        <input
          type="date"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          style={inputStyle}
        />
        <input
          type="text"
          placeholder="Filter by Region..."
          value={region}
          onChange={(e) => setRegion(e.target.value)}
          style={inputStyle}
        />
        <input
          type="text"
          placeholder="Filter by Branch..."
          value={branch}
          onChange={(e) => setBranch(e.target.value)}
          style={inputStyle}
        />
        <button onClick={loadRevenue} style={btnBlueSmall}>
          🔍 Filter
        </button>
        <button onClick={exportToExcel} style={btnBlueSmall}>
          📤 Export Excel
        </button>
      </div>

      {/* 🔹 Table */}
      <div
        style={{
          overflowY: "auto",
          maxHeight: "80vh",
          border: "1px solid #ccc",
          borderRadius: 6,
        }}
      >
        <table style={tableStyle}>
          <thead>
            <tr>
              {[
                "Date",
                "Region",
                "Branch",
                "Employee",
                "Manager",
                "Customer ID",
                "Customer",
                "Type",
                "Vertical",
                "Distributor",
                "Order Type",
                "Item",
                "Value (₹)",
                "PO No.",
                "PO File",
                "Approved By",
                "Submitted By",
              ].map((h) => (
                <th key={h} style={th}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="17" style={{ textAlign: "center", padding: 20 }}>
                  ⏳ Loading data...
                </td>
              </tr>
            ) : revenue.length > 0 ? (
              revenue.map((r) => (
                <tr key={r._id}>
                  <td style={td}>
                    {r.date ? new Date(r.date).toLocaleDateString() : "-"}
                  </td>
                  <td style={td}>{r.region || "-"}</td>
                  <td style={td}>{r.branch || "-"}</td>
                  <td style={td}>
                    {r.empName} ({r.empCode})
                  </td>
                  <td style={td}>
                    {r.managerName} ({r.managerCode})
                  </td>
                  <td style={td}>{r.customerId || "-"}</td>
                  <td style={td}>{r.customerName || "-"}</td>
                  <td style={td}>{r.customerType || "-"}</td>
                  <td style={td}>{r.verticalType || r.vertical || "-"}</td>
                  <td style={td}>{r.distributorName || "-"}</td>
                  <td style={td}>{r.orderType || "-"}</td>
                  <td style={td}>{r.itemName || "-"}</td>
                  <td style={td}>{r.orderValue || "-"}</td>
                  <td style={td}>{r.poNumber || "-"}</td>
                  <td style={td}>
                    {r.poFileUrl && r.poFileUrl !== "-" ? (
                      <button
                        onClick={() =>
                          setSelectedPO(`${API_BASE}${r.poFileUrl}`)
                        }
                        style={btnView}
                      >
                        View
                      </button>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td style={td}>{r.approvedBy || "-"}</td>
                  <td style={td}>{r.submittedBy || "-"}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="17" style={{ textAlign: "center", padding: 20 }}>
                  No revenue data found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 🔹 PO Preview Modal */}
      {selectedPO && (
        <div style={overlay} onClick={() => setSelectedPO(null)}>
          <div style={popup} onClick={(e) => e.stopPropagation()}>
            <button style={closeBtn} onClick={() => setSelectedPO(null)}>
              ✕
            </button>
            {selectedPO.endsWith(".pdf") ? (
              <iframe src={selectedPO} width="100%" height="600px" />
            ) : (
              <img
                src={selectedPO}
                alt="PO File"
                style={{ width: "100%", borderRadius: 8 }}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- Styles ---------- */
const tableStyle = { width: "100%", borderCollapse: "collapse" };
const th = {
  padding: "10px",
  borderBottom: "2px solid #ccc",
  fontSize: "13px",
  fontWeight: 600,
  background: "#f4f4f4",
  position: "sticky",
  top: 0,
  zIndex: 10,
};
const td = { padding: "8px 10px", fontSize: "13px" };
const inputStyle = {
  padding: "6px 10px",
  borderRadius: 6,
  border: "1px solid #ccc",
};
const btnBlueSmall = {
  background: "#2563eb",
  color: "#fff",
  border: "none",
  borderRadius: 4,
  padding: "6px 12px",
  cursor: "pointer",
};
const btnView = {
  background: "#0ea5e9",
  color: "#fff",
  border: "none",
  borderRadius: 4,
  padding: "4px 10px",
  cursor: "pointer",
};
const filterRow = {
  display: "flex",
  flexWrap: "wrap",
  gap: 10,
  marginBottom: 16,
  alignItems: "center",
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
  padding: 16,
  borderRadius: 10,
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
