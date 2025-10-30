import { useState, useEffect } from "react";
import { useAuth } from "../auth.jsx";

const API_BASE = import.meta.env.VITE_API_BASE || "http://127.0.0.1:5000";
const safeNum = (v) => (isNaN(v) || v == null ? 0 : Number(v)); // ✅ Missing helper added

export default function SampleBoardsAllocationEmp() {
  const { user, token } = useAuth();
  const [stock, setStock] = useState([]);
  const [history, setHistory] = useState([]);

  /* 🔹 Fetch Employee Stock + History */
  useEffect(() => {
    async function fetchStock() {
      try {
        const res = await fetch(`${API_BASE}/api/assignments/employee/${user?.empCode}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch stock");
        const data = await res.json();
        setStock(data.stock || []);
        setHistory(data.assignments || []);
      } catch (err) {
        console.error("Employee stock fetch error:", err);
        setStock([]);
        setHistory([]);
      }
    }
    if (token && user?.role === "Employee") fetchStock();
  }, [token, user]);

  return (
    <div style={{ padding: 20 }}>
      <h2>📦 Sample Boards Allocation</h2>

      {/* Stock Section */}
      <h3>📊 My Current Stock</h3>
      {stock.length > 0 ? (
        <table border="1" cellPadding="6" style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th>Item</th>
              <th>Available Qty</th>
            </tr>
          </thead>
          <tbody>
            {stock.map((s, i) => (
              <tr key={i}>
                <td>{s.name}</td>
                <td>{safeNum(s.stock)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>⚠️ No stock assigned yet</p>
      )}

      {/* Assignment History Section */}
      <h3 style={{ marginTop: 30 }}>📑 My Assignment History</h3>
      {history.length > 0 ? (
        <table border="1" cellPadding="6" style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th>Root ID</th>
              <th>RM ID</th>
              <th>BM ID</th>
              <th>Date</th>
              <th>Item</th>
              <th>Qty</th>
              <th>Purpose</th>
              <th>Assigned By</th>
              <th>LR Details (From Vendor)</th>
            </tr>
          </thead>
          <tbody>
            {history.map((a, i) =>
              (a.employees || [])
                .filter((e) => e.empCode === user.empCode)
                .map((e, j) => (
                  <tr key={`${i}-${j}`}>
                    <td>{a.rootId || "-"}</td>
                    <td>{a.rmId || "-"}</td>
                    <td>{a.bmId || "-"}</td>
                    <td>{a.date}</td>
                    <td>{a.item}</td>
                    <td>{safeNum(e.qty)}</td>
                    <td>{a.purpose}</td>
                    <td>{a.assignedBy}</td>
                    <td>{a.lrNo || "-"}</td>
                  </tr>
                ))
            )}
          </tbody>
        </table>
      ) : (
        <p>⚠️ No assignment history found</p>
      )}
    </div>
  );
}
