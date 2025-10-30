import { useState, useEffect } from "react";
import { useAuth } from "../auth.jsx";
import { useNavigate } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_BASE || "http://127.0.0.1:5000";

export default function SubmittedReports({ empCode }) {
  const { token, user } = useAuth();
  const emp = empCode || user?.empCode;
  const [reports, setReports] = useState([]);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

async function loadReports() {
  if (!emp) return;
  setLoading(true);
  try {
    const params = new URLSearchParams();
    params.append("empCode", emp);
    if (from) params.append("from", from);
    if (to) params.append("to", to);

    // ✅ Use hierarchy-aware endpoint for managers viewing subordinates
    const endpoint = user?.role?.toLowerCase() === "employee" && !empCode
      ? `/api/customers/my-reports?${params.toString()}`
      : `/api/reports?${params.toString()}`;

    const res = await fetch(`${API_BASE}${endpoint}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();
    setReports(Array.isArray(data) ? data : []);
  } catch (err) {
    console.error("Failed to load reports", err);
    setReports([]);
  } finally {
    setLoading(false);
  }
}

  useEffect(() => {
    loadReports();
    // reload when switching employee in readOnly view
  }, [emp]);

  const th = { border: "1px solid #ddd", padding: "6px", background: "#f5f5f5", fontWeight: "600", fontSize: "13px" };
  const td = { border: "1px solid #ddd", padding: "6px", fontSize: "13px" };

  return (
    <div style={{ padding: 20 }}>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 15 }}>📋 Submitted Reports</h2>

      {/* Date Filter */}
      <div style={{ display: "flex", gap: 10, marginBottom: 15 }}>
        <input type="date" value={from} onChange={(e) => setFrom(e.target.value)}
               style={{ border: "1px solid #ccc", borderRadius: 6, padding: 6 }} />
        <input type="date" value={to} onChange={(e) => setTo(e.target.value)}
               style={{ border: "1px solid #ccc", borderRadius: 6, padding: 6 }} />
        <button onClick={loadReports}
                style={{ background: "#2563eb", color: "#fff", padding: "6px 14px",
                         border: "none", borderRadius: 6, cursor: "pointer" }}>
          Filter
        </button>
      </div>

      {loading ? (
        <p>Loading…</p>
      ) : reports.length === 0 ? (
        <p>No reports found</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              {["Customer ID","Emp Code","Name","Mobile","Company","Designation","Customer Type","Discussion","Opportunity Type",
                "Order Status","Order Value","Loss Reason","Next Meeting","Expected Order","Attendees","Purpose","Date","History"]
                .map((h) => (<th key={h} style={th}>{h}</th>))}
            </tr>
          </thead>
          <tbody>
            {reports.map((r, i) => (
              <tr key={i}>
                <td style={td}>{r.customerId}</td>
                <td style={td}>{r.createdBy || r.empCode || "-"}</td>
                <td style={td}>{r.name}</td>
                <td style={td}>{r.mobile}</td>
                <td style={td}>{r.company || "-"}</td>
                <td style={td}>{r.designation || "-"}</td>
                <td style={td}>{r.customerType}</td>
                <td style={td}>{r.discussion || "-"}</td>
                <td style={td}>{r.opportunityType || "-"}</td>
                <td style={td}>{r.orderStatus || "-"}</td>
                <td style={td}>{r.orderValue || "-"}</td>
                <td style={td}>{r.orderLossReason || "-"}</td>
                <td style={td}>{r.nextMeetingDate ? new Date(r.nextMeetingDate).toLocaleDateString() : "-"}</td>
                <td style={td}>{r.expectedOrderDate ? new Date(r.expectedOrderDate).toLocaleDateString() : "-"}</td>
                <td style={td}>{r.attendees || "-"}</td>
                <td style={td}>{r.purpose || "-"}</td>
                <td style={td}>{r.date ? new Date(r.date).toLocaleString() : "-"}</td>
                <td style={td}>
                  <button
                    onClick={() =>
                      navigate(`/customer-history/${r.customerId}`, { state: { from: "submitted" } })
                    }
                    style={{ background: "green", color: "#fff", padding: "4px 10px",
                             borderRadius: 4, border: "none", cursor: "pointer" }}
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
