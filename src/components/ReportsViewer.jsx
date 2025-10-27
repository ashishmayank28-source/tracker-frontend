// frontend/src/components/ReportsViewer.jsx
import { useEffect, useState } from "react";
import { useAuth } from "../auth.jsx";

const API_BASE = (import.meta.env.VITE_API_BASE || "http://127.0.0.1:5000")
  .replace(/\/+$/, "");

export default function ReportsViewer() {
  const { token } = useAuth();

  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [summary, setSummary] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState("reports"); // reports | summary

  // Filters
  const [filters, setFilters] = useState({});
  const [summaryFilters, setSummaryFilters] = useState({});

  /* ---------- Load submitted reports ---------- */
  async function loadReports() {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (from) params.append("from", from);
      if (to) params.append("to", to);

      const res = await fetch(`${API_BASE}/api/reports/submitted?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setReports(data.reports || []);
    } catch (err) {
      console.error("Reports load error:", err);
    } finally {
      setLoading(false);
    }
  }

  /* ---------- Load summary ---------- */
  async function loadSummary() {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (from) params.append("from", from);
      if (to) params.append("to", to);

      const res = await fetch(`${API_BASE}/api/reports/summary?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setSummary(data.summary || []);
    } catch (err) {
      console.error("Summary load error:", err);
    } finally {
      setLoading(false);
    }
  }

  /* ---------- Auto-load on toggle ---------- */
  useEffect(() => {
    if (view === "reports") {
      loadReports();
    } else {
      loadSummary();
    }
  }, [view]);

  /* ---------- Filter Helpers ---------- */
  const filteredReports = reports.filter((r) =>
    Object.entries(filters).every(([key, val]) =>
      !val ? true : String(r[key] || "").toLowerCase().includes(val.toLowerCase())
    )
  );

  const filteredSummary = summary.filter((row) =>
    Object.entries(summaryFilters).every(([key, val]) =>
      !val ? true : String(row[key] || "").toLowerCase().includes(val.toLowerCase())
    )
  );

  return (
    <div style={{ padding: 20 }}>
      <h3 style={{ marginBottom: 20 }}>📊 Reports Viewer</h3>

      {/* Toggle buttons */}
      <div style={{ marginBottom: 15 }}>
        <button
          onClick={() => setView("reports")}
          style={{
            padding: "6px 12px",
            marginRight: 10,
            background: view === "reports" ? "#1976d2" : "#f0f0f0",
            color: view === "reports" ? "#fff" : "#000",
            border: "1px solid #ccc",
            borderRadius: 4,
            cursor: "pointer",
          }}
        >
          📑 Submitted Reports
        </button>
        <button
          onClick={() => setView("summary")}
          style={{
            padding: "6px 12px",
            background: view === "summary" ? "#1976d2" : "#f0f0f0",
            color: view === "summary" ? "#fff" : "#000",
            border: "1px solid #ccc",
            borderRadius: 4,
            cursor: "pointer",
          }}
        >
          📌 Summary Reports
        </button>
      </div>

      {/* Date Filters */}
      <div
        style={{
          marginBottom: 15,
          display: "flex",
          gap: "12px",
          alignItems: "center",
        }}
      >
        <div>
          <label style={{ marginRight: 5 }}>From:</label>
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            style={{ padding: "4px" }}
          />
        </div>
        <div>
          <label style={{ marginRight: 5 }}>To:</label>
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            style={{ padding: "4px" }}
          />
        </div>
        <button
          onClick={() => (view === "reports" ? loadReports() : loadSummary())}
          style={{
            padding: "6px 12px",
            border: "1px solid #ccc",
            borderRadius: 4,
            cursor: "pointer",
            background: "#f0f0f0",
          }}
        >
          Apply
        </button>
      </div>

      {/* Reports Table */}
      {view === "reports" && (
        <>
          {loading ? (
            <p>Loading reports...</p>
          ) : (
            <table
              border="1"
              cellPadding="6"
              style={{
                borderCollapse: "collapse",
                width: "100%",
                fontSize: "14px",
              }}
            >
              <thead style={{ background: "#f5f5f5" }}>
                <tr>
                  {[
                    "customerId",
                    "empCode",
                    "name",
                    "company",
                    "customerType",
                    "discussion",
                    "opportunityType",
                    "orderStatus",
                    "orderValue",
                    "nextMeeting",
                    "date",
                  ].map((col) => (
                    <th key={col}>
                      {col}
                      <br />
                      <input
                        style={{
                          width: "100%",
                          fontSize: "12px",
                          marginTop: 4,
                          padding: "2px 4px",
                        }}
                        placeholder="Filter..."
                        value={filters[col] || ""}
                        onChange={(e) =>
                          setFilters({ ...filters, [col]: e.target.value })
                        }
                      />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredReports.length > 0 ? (
                  filteredReports.map((r, idx) => (
                    <tr key={idx}>
                      <td>{r.customerId}</td>
                      <td>{r.empCode}</td>
                      <td>{r.name}</td>
                      <td>{r.company}</td>
                      <td>{r.customerType}</td>
                      <td>{r.discussion}</td>
                      <td>{r.opportunityType}</td>
                      <td>{r.orderStatus}</td>
                      <td>{r.orderValue}</td>
                      <td>{r.nextMeeting}</td>
                      <td>{new Date(r.date).toLocaleDateString()}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="11" style={{ textAlign: "center" }}>
                      No reports found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </>
      )}

      {/* Summary Table */}
      {view === "summary" && (
        <>
          {loading ? (
            <p>Loading summary...</p>
          ) : (
            <table
              border="1"
              cellPadding="6"
              style={{
                borderCollapse: "collapse",
                width: "100%",
                textAlign: "center",
                fontSize: "14px",
              }}
            >
              <thead style={{ background: "#f5f5f5" }}>
                <tr>
                  {[
                    "empCode",
                    "empName",
                    "externalCount",
                    "internalCount",
                    "retailer",
                    "distributor",
                    "architect",
                    "electrician",
                    "endUser",
                  ].map((col) => (
                    <th key={col}>
                      {col}
                      <br />
                      <input
                        style={{
                          width: "100%",
                          fontSize: "12px",
                          marginTop: 4,
                          padding: "2px 4px",
                        }}
                        placeholder="Filter..."
                        value={summaryFilters[col] || ""}
                        onChange={(e) =>
                          setSummaryFilters({
                            ...summaryFilters,
                            [col]: e.target.value,
                          })
                        }
                      />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredSummary.length > 0 ? (
                  filteredSummary.map((row, idx) => (
                    <tr key={idx}>
                      <td>{row.empCode}</td>
                      <td>{row.empName}</td>
                      <td>{row.externalCount}</td>
                      <td>{row.internalCount}</td>
                      <td>{row.retailer}</td>
                      <td>{row.distributor}</td>
                      <td>{row.architect}</td>
                      <td>{row.electrician}</td>
                      <td>{row.endUser}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="9" style={{ textAlign: "center" }}>
                      No summary found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </>
      )}
    </div>
  );
}
