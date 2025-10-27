import { useState, useEffect } from "react";
import { useAuth } from "../auth.jsx";

const API_BASE = import.meta.env.VITE_API_BASE || "http://127.0.0.1:5000";
const safeNum = (v) => (isNaN(v) || v == null ? 0 : Number(v));

export default function SampleBoardsAllocationManager() {
  const { user, token } = useAuth();

  const [stock, setStock] = useState([]);
  const [history, setHistory] = useState([]);
  const [employees, setEmployees] = useState([]);

  const [filters, setFilters] = useState({
    assignmentId: "",
    employee: "",
    item: "",
    purpose: "",
  });

  const [selectedEmp, setSelectedEmp] = useState(null);
  const [empStock, setEmpStock] = useState([]);
  const [empAssignments, setEmpAssignments] = useState([]);

  /* 🔹 Fetch Manager Stock + History */
  useEffect(() => {
    async function fetchStockAndHistory() {
      try {
        const res = await fetch(`${API_BASE}/api/assignments/manager/stock`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setStock(data.stock || []);
        setHistory(data.assignments || []);
      } catch (err) {
        console.error("Manager stock/history fetch error:", err);
      }
    }
    if (token && user?.role === "Manager") fetchStockAndHistory();
  }, [token, user]);

  /* 🔹 Fetch My Team */
  useEffect(() => {
    async function fetchTeam() {
      try {
        const res = await fetch(`${API_BASE}/api/users/team`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setEmployees(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Team fetch error:", err);
      }
    }
    if (token && user?.role === "Manager") fetchTeam();
  }, [token, user]);

  /* 🔹 Fetch Selected Employee Data */
  const fetchEmpData = async (emp) => {
    setSelectedEmp(emp);
    try {
      const res = await fetch(`${API_BASE}/api/assignments/employee/${emp.empCode}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setEmpStock(data.stock || []);
      setEmpAssignments(data.assignments || []);
    } catch (err) {
      console.error("Employee fetch error:", err);
      setEmpStock([]);
      setEmpAssignments([]);
    }
  };

  /* 🔹 Filtered Manager History */
  const filteredHistory = history.filter((h) => {
    return (
      (!filters.assignmentId ||
        (h.rootId || "").toLowerCase().includes(filters.assignmentId.toLowerCase())) &&
      (!filters.employee ||
        (h.employees || []).some((e) =>
          `${e.name} (${e.empCode})`
            .toLowerCase()
            .includes(filters.employee.toLowerCase())
        )) &&
      (!filters.item || (h.item || "").toLowerCase().includes(filters.item.toLowerCase())) &&
      (!filters.purpose || (h.purpose || "").toLowerCase().includes(filters.purpose.toLowerCase()))
    );
  });

  return (
    <div style={{ padding: 20 }}>
      <h2>📦 Sample Allocation (Manager)</h2>

      {/* 🔹 Manager Stock */}
      <h3>📊 My Current Stock</h3>
      {stock.length > 0 ? (
        <table border="1" cellPadding="6" style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>{stock.map((s) => <th key={s.name}>{s.name}</th>)}</tr>
          </thead>
          <tbody>
            <tr>{stock.map((s) => <td key={s.name}>{s.stock}</td>)}</tr>
          </tbody>
        </table>
      ) : (
        <p>⚠️ No stock assigned yet</p>
      )}

      {/* 🔹 Manager Assignment History */}
      <h3 style={{ marginTop: 30 }}>📑 My Assignment History</h3>
      <div style={{ marginBottom: 10, display: "flex", gap: "8px", flexWrap: "wrap" }}>
        <input
          type="text"
          placeholder="Filter by Root ID"
          value={filters.assignmentId}
          onChange={(e) => setFilters({ ...filters, assignmentId: e.target.value })}
        />
        <input
          type="text"
          placeholder="Filter by Employee"
          value={filters.employee}
          onChange={(e) => setFilters({ ...filters, employee: e.target.value })}
        />
        <input
          type="text"
          placeholder="Filter by Item"
          value={filters.item}
          onChange={(e) => setFilters({ ...filters, item: e.target.value })}
        />
        <input
          type="text"
          placeholder="Filter by Purpose"
          value={filters.purpose}
          onChange={(e) => setFilters({ ...filters, purpose: e.target.value })}
        />
      </div>

      {filteredHistory.length > 0 ? (
        <table border="1" cellPadding="6" style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead style={{ background: "#f5f5f5" }}>
            <tr>
              <th>Date</th>
              <th>Item</th>
              <th>Employee</th>
              <th>Qty</th>
              <th>Purpose</th>
              <th>LR Details</th>
            </tr>
          </thead>
          <tbody>
            {filteredHistory.map((h, i) =>
              (h.employees || []).map((e, j) => (
                <tr key={`${i}-${j}`}>
                  <td>{h.date}</td>
                  <td>{h.item}</td>
                  <td>{e.name} ({e.empCode})</td>
                  <td>{e.qty}</td>
                  <td>{h.purpose}</td>
                  <td>{h.lrNo || "-"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      ) : (
        <p>⚠️ No assignment history found.</p>
      )}

      {/* 🔹 Your Reportees */}
      <h3 style={{ marginTop: 40 }}>👥 Your Reportees</h3>
      {employees.length === 0 ? (
        <p>⚠️ No team members found.</p>
      ) : (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
          {employees.map((emp) => (
            <button
              key={emp.empCode}
              onClick={() => fetchEmpData(emp)}
              style={{
                padding: "8px 12px",
                background: selectedEmp?.empCode === emp.empCode ? "#4caf50" : "#2196f3",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
              }}
            >
              {emp.name} ({emp.empCode})
            </button>
          ))}
        </div>
      )}

      {/* 🔹 Selected Employee Info */}
      {selectedEmp && (
        <div
          style={{
            marginTop: 25,
            padding: 15,
            border: "1px solid #ccc",
            borderRadius: 8,
            background: "#fafafa",
          }}
        >
          <h4>
            📋 {selectedEmp.name} ({selectedEmp.empCode}) – Details
          </h4>

          {/* Employee’s Current Stock */}
          <h5 style={{ marginTop: 10 }}>📦 Current Stock</h5>
          {empStock.length > 0 ? (
            <table border="1" cellPadding="6" style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>{empStock.map((s) => <th key={s.name}>{s.name}</th>)}</tr>
              </thead>
              <tbody>
                <tr>{empStock.map((s) => <td key={s.name}>{s.stock}</td>)}</tr>
              </tbody>
            </table>
          ) : (
            <p>⚠️ No stock data available.</p>
          )}

          {/* Employee’s Assignment History */}
          <h5 style={{ marginTop: 20 }}>📑 Assignment History</h5>
          {empAssignments.length > 0 ? (
            <table
              border="1"
              cellPadding="6"
              style={{ width: "100%", borderCollapse: "collapse", background: "white" }}
            >
              <thead style={{ background: "#eee" }}>
                <tr>
                  <th>Date</th>
                  <th>Item</th>
                  <th>Qty</th>
                  <th>Purpose</th>
                  <th>Assigned By</th>
                  <th>LR No.</th>
                </tr>
              </thead>
              <tbody>
                {empAssignments.map((a, i) =>
                  (a.employees || [])
                    .filter((e) => e.empCode === selectedEmp.empCode)
                    .map((e, j) => (
                      <tr key={`${i}-${j}`}>
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
            <p>⚠️ No assignment history found.</p>
          )}
        </div>
      )}
    </div>
  );
}
