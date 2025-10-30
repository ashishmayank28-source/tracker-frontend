import { useEffect, useState } from "react";
import { useAuth } from "../auth.jsx";
import { useNavigate } from "react-router-dom";

const API_BASE = (import.meta.env.VITE_API_BASE || "http://127.0.0.1:5000").replace(/\/+$/, "");

export default function ManagerDailyTracker() {
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const [reportees, setReportees] = useState([]);
  const [selectedEmp, setSelectedEmp] = useState(null);
  const [summary, setSummary] = useState(null);
  const [reports, setReports] = useState([]);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [collapsed, setCollapsed] = useState(false);
  const [filters, setFilters] = useState({
    meetingType: "",
    customerType: "",
    expectedOnly: false,
    search: ""
  });

  // 🔎 Search State for revisit
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    async function loadReportees() {
      try {
        if (!user?.empCode) return setErr("No Manager empCode");
        const res = await fetch(`${API_BASE}/api/users/hierarchy/${user.empCode}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to fetch hierarchy");
        setReportees(data.subordinates || []);
      } catch (e) {
        setErr(e.message);
      }
    }
    loadReportees();
  }, [user, token]);

  async function fetchSummary(empCode) {
    if (!empCode) return;
    const params = new URLSearchParams();
    params.append("empCode", empCode);
    if (from) params.append("from", from);
    if (to) params.append("to", to);
    const res = await fetch(`${API_BASE}/api/reports/summary?${params}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setSummary(await res.json());
  }

  async function fetchReports(empCode) {
    if (!empCode) return;
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("empCode", empCode);
      if (from) params.append("from", from);
      if (to) params.append("to", to);
      const res = await fetch(`${API_BASE}/api/reports/hierarchy?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setReports(Array.isArray(data) ? data : []);
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  function handleReporteeClick(emp) {
    setSelectedEmp(emp.empCode);
    fetchSummary(emp.empCode);
    fetchReports(emp.empCode);
  }

  // 🔎 Handle search input and suggestions
  function handleSearchInput(value) {
    setSearchTerm(value);
    if (!value.trim()) {
      setSuggestions([]);
      return;
    }
    // Include both customer names and IDs for matching
    const pool = [
      ...new Set(
        reports.flatMap((r) => [r.customerId, r.customer].filter(Boolean))
      ),
    ];
    const filtered = pool.filter((item) =>
      item.toLowerCase().includes(value.toLowerCase())
    );
    setSuggestions(filtered.slice(0, 8));
  }

  function applySearchFilter() {
    setFilters((prev) => ({ ...prev, search: searchTerm.trim() }));
    setSuggestions([]);
  }

  function filteredReports() {
    return reports.filter((r) => {
      if (filters.meetingType && r.meetingType !== filters.meetingType) return false;
      if (filters.customerType && r.customerType !== filters.customerType) return false;
      if (filters.expectedOnly) {
        const exp = r.expectedOrderDate ? new Date(r.expectedOrderDate) : null;
        if (!exp) return false;
        if (from && exp < new Date(from)) return false;
        if (to && exp > new Date(to)) return false;
      }
      if (
        filters.search &&
        !(
          r.customer?.toLowerCase().includes(filters.search.toLowerCase()) ||
          r.customerId?.toLowerCase().includes(filters.search.toLowerCase())
        )
      )
        return false;
      return true;
    });
  }

  const customerTypes = ["", "Retailer", "Distributor", "Architect", "Electrician", "End User", "Builder", "Developer"];
  const meetingTypes = ["", "Internal", "External"];
  const th = { border: "1px solid #ddd", padding: "6px", background: "#f5f5f5", fontWeight: "600", fontSize: "13px" };
  const td = { border: "1px solid #ddd", padding: "6px", fontSize: "13px" };

  return (
    <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "20px" }}>
      <h2 style={{ fontSize: "22px", fontWeight: "600" }}>📅 Manager Daily Tracker</h2>

      {/* Date Filter */}
      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
        <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} style={inputStyle} />
        <input type="date" value={to} onChange={(e) => setTo(e.target.value)} style={inputStyle} />
        <button onClick={() => selectedEmp && (fetchSummary(selectedEmp), fetchReports(selectedEmp))} style={btnBlue}>
          Apply Filters
        </button>
      </div>

      {/* 🔎 Revisit Search */}
      <div style={{ maxWidth: "450px", margin: "10px 0", position: "relative" }}>
        <input
          type="text"
          placeholder="🔎 Search by Name or Customer ID..."
          value={searchTerm}
          onChange={(e) => handleSearchInput(e.target.value)}
          style={{
            width: "100%",
            padding: "8px 10px",
            borderRadius: "6px",
            border: "1px solid #ccc",
          }}
        />
        {suggestions.length > 0 && (
          <ul
            style={{
              listStyle: "none",
              margin: 0,
              padding: 0,
              border: "1px solid #ddd",
              borderRadius: "6px",
              background: "#fff",
              maxHeight: "160px",
              overflowY: "auto",
              position: "absolute",
              zIndex: 20,
              width: "100%",
            }}
          >
            {suggestions.map((s, i) => (
              <li
                key={i}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "6px 10px",
                  borderBottom: "1px solid #eee",
                  cursor: "pointer",
                }}
              >
                <span onClick={() => setSearchTerm(s)}>{s}</span>
                <button
                  onClick={() => navigate(`/customer-history/${encodeURIComponent(s)}`)}
                  style={{
                    background: "#2563eb",
                    color: "#fff",
                    border: "none",
                    padding: "3px 8px",
                    borderRadius: "4px",
                    cursor: "pointer",
                    marginLeft: "8px",
                  }}
                >
                  View History
                </button>
              </li>
            ))}
          </ul>
        )}
        <button
          onClick={applySearchFilter}
          style={{
            marginTop: "10px",
            width: "100%",
            background: "#2563eb",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            padding: "6px",
            cursor: "pointer",
          }}
        >
          Search
        </button>
      </div>

      {err && <p style={{ color: "red" }}>{err}</p>}
      {loading && <p>Loading...</p>}

      <div style={{ display: "flex", flexWrap: "wrap", gap: "20px" }}>
        {/* Left Panel */}
        <div style={leftPanel}>
          <h3 style={{ fontSize: "18px", fontWeight: "500", marginBottom: "10px" }}>👥 Direct Reportees</h3>
          {reportees.length === 0 ? (
            <p>No reportees found</p>
          ) : (
            <ul style={{ listStyle: "none", paddingLeft: 0 }}>
              {reportees.map((emp) => (
                <li
                  key={emp.empCode}
                  style={{
                    border: "1px solid #ddd",
                    borderRadius: "8px",
                    padding: "10px",
                    marginBottom: "8px",
                    background: selectedEmp === emp.empCode ? "#e0f0ff" : "#fafafa",
                  }}
                >
                  <div style={{ fontWeight: "500" }}>{emp.name}</div>
                  <div style={{ fontSize: "13px", color: "#555", marginBottom: "6px" }}>{emp.empCode}</div>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button onClick={() => handleReporteeClick(emp)} style={{ ...btnBlue, background: "#2563eb" }}>
                      View Summary
                    </button>
                    <button
                      onClick={() => navigate(`/employee-view/${emp.empCode}`)}
                      style={{ ...btnBlue, background: "#10b981" }}
                    >
                      Open Dashboard →
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Right Panel */}
        <div style={rightPanel}>
          {summary && (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h4 style={{ fontWeight: "600" }}>📊 Summary</h4>
                <button onClick={() => setCollapsed(!collapsed)} style={btnToggle}>
                  {collapsed ? "▭" : "–"}
                </button>
              </div>
              {!collapsed && (
                <>
                  <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "16px" }}>
                    <thead>
                      <tr>
                        <th style={th}>Meeting Type</th>
                        <th style={th}>External (Count)</th>
                        <th style={th}>Internal (Count)</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td style={td}>Total Meetings</td>
                        <td style={td}>{summary.externalCount || 0}</td>
                        <td style={td}>{summary.internalCount || 0}</td>
                      </tr>
                    </tbody>
                  </table>

                  <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "16px" }}>
                    <thead>
                      <tr>
                        <th style={th}>Customer Types</th>
                        <th style={th}>Total Counts</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr><td style={td}>Retailer</td><td style={td}>{summary.typeCounts?.Retailer || 0}</td></tr>
                      <tr><td style={td}>Distributor</td><td style={td}>{summary.typeCounts?.Distributor || 0}</td></tr>
                      <tr><td style={td}>Architect / Interior Designer</td><td style={td}>{summary.typeCounts?.Architect || 0}</td></tr>
                      <tr><td style={td}>Electrician</td><td style={td}>{summary.typeCounts?.Electrician || 0}</td></tr>
                      <tr>
                        <td style={td}>End User / Builder / Developer</td>
                        <td style={td}>
                          {(summary.typeCounts?.EndUser || 0) +
                            (summary.typeCounts?.Builder || 0) +
                            (summary.typeCounts?.Developer || 0)}
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  <div style={{ overflowX: "auto", maxHeight: "400px" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                      <thead style={{ position: "sticky", top: 0, background: "#f9f9f9", zIndex: 2 }}>
                        {[
                          "Customer ID","Vertical","Name","Mobile","Company","Designation","Meeting Type","Customer Type",
                          "Discussion","Order Status","Order Value","Loss Reason","Next Meeting","Expected Order",
                          "Attendees","Purpose","Date","History"
                        ].map((h) => (<th key={h} style={th}>{h}</th>))}
                      </thead>
                      <tbody>
                        {filteredReports().length === 0 ? (
                          <tr><td colSpan={18} style={{ textAlign: "center", padding: "10px" }}>No reports</td></tr>
                        ) : (
                          filteredReports().map((r, i) => (
                            <tr key={i}>
                              <td style={td}>{r.customerId}</td>
                              <td style={td}>{r.vertical || "-"}</td>
                              <td style={td}>{r.customer}</td>
                              <td style={td}>{r.mobile}</td>
                              <td style={td}>{r.company}</td>
                              <td style={td}>{r.designation}</td>
                              <td style={td}>{r.meetingType}</td>
                              <td style={td}>{r.customerType}</td>
                              <td style={td}>{r.discussion}</td>
                              <td style={td}>{r.orderStatus}</td>
                              <td style={td}>{r.orderValue || "-"}</td>
                              <td style={td}>{r.lossReason || "-"}</td>
                              <td style={td}>{r.nextMeeting ? new Date(r.nextMeeting).toLocaleDateString() : "-"}</td>
                              <td style={td}>{r.expectedOrderDate ? new Date(r.expectedOrderDate).toLocaleDateString() : "-"}</td>
                              <td style={td}>{r.attendees || "-"}</td>
                              <td style={td}>{r.purpose || "-"}</td>
                              <td style={td}>{r.date ? new Date(r.date).toLocaleString() : "-"}</td>
                              <td style={td}>
                                <button
                                  onClick={() => navigate(`/customer-history/${r.customerId}`)}
                                  style={{
                                    background: "green",
                                    color: "#fff",
                                    padding: "4px 10px",
                                    borderRadius: 4,
                                    border: "none",
                                    cursor: "pointer",
                                  }}
                                >
                                  View
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

const inputStyle = { border: "1px solid #ccc", borderRadius: "6px", padding: "6px 10px" };
const btnBlue = { background: "#2563eb", color: "#fff", border: "none", borderRadius: "6px", padding: "6px 12px", cursor: "pointer" };
const btnToggle = { background: "#eee", border: "1px solid #aaa", borderRadius: "4px", cursor: "pointer", padding: "2px 8px" };
const leftPanel = { flex: "1 1 250px", minWidth: "250px", background: "#fff", border: "1px solid #ddd", borderRadius: "10px", padding: "16px" };
const rightPanel = { flex: "2 1 500px", minWidth: "400px", background: "#fff", border: "1px solid #ddd", borderRadius: "10px", padding: "16px" };
