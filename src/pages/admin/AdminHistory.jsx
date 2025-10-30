import { useEffect, useState } from "react";
import { useAuth } from "../../auth.jsx";

const API_BASE = import.meta.env.VITE_API_BASE || "http://127.0.0.1:5000";

export default function AdminHistory() {
  const { token } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [filters, setFilters] = useState({
    rootId: "",
    rmId: "",
    bmId: "",
    emp: "",
    item: "",
    purpose: "",
  });

  /* 🔹 Fetch Admin full history */
  useEffect(() => {
    async function fetchHistory() {
      try {
        const res = await fetch(`${API_BASE}/api/assignments/history/admin`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setAssignments(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Admin history fetch error:", err);
      }
    }
    if (token) fetchHistory();
  }, [token]);

  /* 🔹 Submit to Vendor */
  async function handleSubmitToVendor(assignmentId) {
    try {
      const res = await fetch(`${API_BASE}/api/assignments/dispatch/${assignmentId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (data.success) {
        alert("✅ Sent to Vendor for dispatch!");
        // Refresh
        setAssignments((prev) =>
          prev.map((a) =>
            a.rootId === assignmentId ? { ...a, toVendor: true } : a
          )
        );
      }
    } catch (err) {
      console.error("Dispatch submit error:", err);
    }
  }

  /* 🔹 Filtering */
  const filteredAssignments = assignments
    .filter((a) =>
      a.rootId?.toLowerCase().includes(filters.rootId.toLowerCase())
    )
    .filter((a) =>
      a.rmId?.toLowerCase().includes(filters.rmId.toLowerCase())
    )
    .filter((a) =>
      a.bmId?.toLowerCase().includes(filters.bmId.toLowerCase())
    )
    .filter((a) =>
      a.item?.toLowerCase().includes(filters.item.toLowerCase())
    )
    .filter((a) =>
      a.purpose?.toLowerCase().includes(filters.purpose.toLowerCase())
    )
    .filter((a) =>
      (a.employees || []).some((e) =>
        e.name.toLowerCase().includes(filters.emp.toLowerCase())
      )
    );

  return (
    <div style={{ padding: 20 }}>
      <h2>📑 Admin Assignment History</h2>

      {/* 🔍 Filter Row */}
      <div
        style={{
          display: "flex",
          gap: 10,
          flexWrap: "wrap",
          marginBottom: 15,
        }}
      >
        <input
          type="text"
          placeholder="Filter by Assignment ID"
          value={filters.rootId}
          onChange={(e) => setFilters({ ...filters, rootId: e.target.value })}
        />
        <input
          type="text"
          placeholder="Filter by RM ID"
          value={filters.rmId}
          onChange={(e) => setFilters({ ...filters, rmId: e.target.value })}
        />
        <input
          type="text"
          placeholder="Filter by BM ID"
          value={filters.bmId}
          onChange={(e) => setFilters({ ...filters, bmId: e.target.value })}
        />
        <input
          type="text"
          placeholder="Filter by Employee"
          value={filters.emp}
          onChange={(e) => setFilters({ ...filters, emp: e.target.value })}
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

      {/* 📊 History Table */}
      <table
        border="1"
        cellPadding="6"
        style={{ width: "100%", borderCollapse: "collapse" }}
      >
        <thead style={{ background: "#f5f5f5" }}>
          <tr>
            <th>Assignment ID</th>
            <th>RM ID</th>
            <th>BM ID</th>
            <th>Date</th>
            <th>Item</th>
            <th>Employee</th>
            <th>Qty</th>
            <th>Purpose</th>
            <th>Assigned By</th>
            <th>Role</th>
            <th>To Dispatch</th>
            <th>LR No.</th>
          </tr>
        </thead>
        <tbody>
          {filteredAssignments.map((a, i) =>
            (a.employees || []).map((emp, j) => (
              <tr key={`${i}-${j}`}>
                <td>{a.rootId}</td>
                <td>{a.rmId || "-"}</td>
                <td>{a.bmId || "-"}</td>
                <td>{a.date}</td>
                <td>{a.item}</td>
                <td>
                  {emp.name} ({emp.empCode})
                </td>
                <td>{emp.qty}</td>
                <td>{a.purpose}</td>
                <td>{a.assignedBy}</td>
                <td>{a.role}</td>
                <td>
                  {a.toVendor ? (
                    "✅ Sent"
                  ) : (
                    <button onClick={() => handleSubmitToVendor(a.rootId)}>
                      Submit
                    </button>
                  )}
                </td>
                <td>{a.lrNo || "-"}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
