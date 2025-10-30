import { useState, useEffect } from "react";
import { useAuth } from "../auth.jsx";

const API_BASE = import.meta.env.VITE_API_BASE || "http://127.0.0.1:5000";
const safeNum = (v) => (isNaN(v) || v == null ? 0 : Number(v));

export default function SampleBoardsAllocationBranch() {
  const { user, token } = useAuth();

  const [items, setItems] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [selectedItem, setSelectedItem] = useState("");
  const [selectedEmps, setSelectedEmps] = useState([]);
  const [purpose, setPurpose] = useState("");
  const [assignments, setAssignments] = useState([]);
  const [columns, setColumns] = useState(["Qty"]);
  const [showHistory, setShowHistory] = useState(false);

  const [searchId, setSearchId] = useState("");
  const [searchResult, setSearchResult] = useState(null);

  const [assignmentsFilter, setAssignmentsFilter] = useState({
    id: "",
    emp: "",
    item: "",
    purpose: "",
  });

  /* 🔹 Fetch BM team */
  useEffect(() => {
    async function fetchTeam() {
      try {
        const res = await fetch(`${API_BASE}/api/users/team`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch team");
        const data = await res.json();
        setEmployees(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error fetching BM team:", err);
        setEmployees([]);
      }
    }
    if (token && user?.role === "BranchManager") fetchTeam();
  }, [token, user]);

  /* 🔹 Fetch stock + history (BM) */
  useEffect(() => {
    async function fetchStock() {
      try {
        const res = await fetch(`${API_BASE}/api/assignments/branch/stock`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch stock");
        const data = await res.json();
        setItems(data?.stock || []);
        setAssignments(data?.assignments || []);
      } catch (err) {
        console.error("Error fetching stock:", err);
        setItems([]);
      }
      {console.logassignments}
    }
    if (token && user?.role === "BranchManager") fetchStock();
  }, [token, user]);
   
  /* 🔹 Toggle employee */
  const toggleEmployee = (emp) => {
    if (selectedEmps.find((e) => e.empCode === emp.empCode)) {
      setSelectedEmps(selectedEmps.filter((e) => e.empCode !== emp.empCode));
    } else {
      setSelectedEmps([...selectedEmps, { ...emp, qty: 0, extra: {} }]);
    }
  };

  /* 🔹 Update value */
  const updateValue = (empCode, field, value) => {
    setSelectedEmps((prev) =>
      prev.map((e) =>
        e.empCode === empCode
          ? field === "qty"
            ? { ...e, qty: safeNum(value) }
            : { ...e, extra: { ...e.extra, [field]: value } }
          : e
      )
    );
  };

  /* 🔹 Allot stock further (BM → Employees) */
  const handleAllot = async () => {
    const stockItem = items.find((i) => i.name === selectedItem);
    const totalQty = selectedEmps.reduce((sum, e) => sum + safeNum(e.qty), 0);

    if (!stockItem || totalQty > safeNum(stockItem.stock)) {
      alert("❌ Not enough stock available!");
      return;
    }

const parent = assignments.find(a => a.item === selectedItem);  // to fetch root & rmId

const newAssignment = {
  rootId: parent?.rootId || "NA",   // Admin rootId carry
  rmId: parent?.rmId || "NA",       // RM ID carry from previous allocation
  bmId: "BM" + Date.now(),          // new BM ID
  item: selectedItem,
  employees: selectedEmps.map((e) => ({
    empCode: e.empCode,
    name: e.name,
    qty: safeNum(e.qty),
    extra: e.extra || {},
  })),
  purpose,
  assignedBy: user?.name || "Unknown",
  role: user?.role || "BranchManager",
  branch: user?.branch || "Unknown",
  region: user?.region || "Unknown",
  date: new Date().toLocaleString(),
};
    try {
      const res = await fetch(`${API_BASE}/api/assignments/allocate/bm`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newAssignment),
      });

      if (!res.ok) throw new Error("Failed to save allocation");
      const saved = await res.json();

      setAssignments([saved, ...assignments]);
      setItems((prev) =>
        prev.map((i) =>
          i.name === selectedItem ? { ...i, stock: safeNum(i.stock) - totalQty } : i
        )
      );

      setSelectedEmps([]);
      setPurpose("");
      alert(`✅ Stock allocated successfully!`);
    } catch (err) {
      console.error("Allocation error:", err);
      alert("❌ Failed to allocate");
    }
  };

  /* 🔹 Search assignment by ID */
  const handleSearch = () => {
    if (!searchId) return alert("Please enter Assignment ID");
    const found = assignments.find((a) => a.bmId === searchId || a.rootId === searchId);
    if (found) setSearchResult(found);
    else {
      alert("❌ No assignment found");
      setSearchResult(null);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>📦 Sample Allocation (Branch Manager)</h2>

      {/* 🔹 Search + History Toggle */}
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 15, gap: 8 }}>
        <input
          type="text"
          placeholder="Enter Assignment ID"
          value={searchId}
          onChange={(e) => setSearchId(e.target.value)}
          style={{ padding: "6px" }}
        />
        <button onClick={handleSearch} style={{ padding: "6px 12px" }}>🔍 Search</button>
        <button
          onClick={() => setShowHistory(!showHistory)}
          style={{
            padding: "6px 12px",
            background: "#2196f3",
            color: "white",
            border: "none",
            borderRadius: 4,
          }}
        >
          📑 Allocated Report
        </button>
      </div>

      {/* 🔹 Stock Summary */}
      {items.length > 0 ? (
        <div style={{ marginBottom: 20 }}>
          <h3>📊 My Current Stock (from Regional Allocation)</h3>
          <table border="1" cellPadding="6" style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead style={{ background: "#f5f5f5" }}>
              <tr>
                <th>Item</th>
                <th>Available Qty</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.name}>
                  <td>{item.name}</td>
                  <td>{safeNum(item.stock)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p>⚠️ No stock assigned by Regional Manager</p>
      )}

      

      {/* 🔹 Allocated Report */}
      {showHistory && (
        <div style={{ marginTop: 30 }}>
          <h3>📑 Assignment History</h3>
          <table border="1" cellPadding="6" style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead style={{ background: "#f5f5f5" }}>
              <tr>
                <th>Root ID</th>
                <th>RM ID</th>
                <th>BM ID</th>
                <th>Date</th>
                <th>Item</th>
                <th>Employee</th>
                <th>Qty</th>
                <th>Purpose</th>
                <th>Assigned By</th>
                <th>LR Details (From Vendor)</th> {/* 🔹 NEW */}
              </tr>
            </thead>
            <tbody>
              {assignments.map((a, i) =>
                (a.employees || []).map((emp, j) => (
                  <tr key={`${i}-${j}`}>
                    <td>{a.rootId || "-"}</td>
                    <td>{a.rmId || "-"}</td>
                    <td>{a.bmId || "-"}</td>
                    <td>{a.date}</td>
                    <td>{a.item}</td>
                    <td>{emp.name} ({emp.empCode})</td>
                    <td>{safeNum(emp.qty)}</td>
                    <td>{a.purpose}</td>
                    <td>{a.assignedBy}</td>
                    {/* 🔹 Vendor LR Details Display */}
              <td>{a.lrNo || "-"}</td>
                    

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
      
      

      {/* 🔹 Item Select */}
      {items.length > 0 && (
        <div style={{ margin: "15px 0" }}>
          <label>
            <b>Select Item:</b>{" "}
            <select
              value={selectedItem}
              onChange={(e) => setSelectedItem(e.target.value)}
              style={{ padding: "6px", minWidth: "200px" }}
            >
              <option value="">-- Select Item --</option>
              {items.map((item) => (
                <option key={item.name} value={item.name}>
                  {item.name} (Available: {safeNum(item.stock)})
                </option>
              ))}
            </select>
          </label>
        </div>
      )}

      {/* 🔹 Assign To */}
      {employees.length > 0 && (
        <div style={{ marginBottom: 15 }}>
          <b>Assign To:</b>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
            {employees.map((emp) => (
              <label key={emp.empCode} style={{ border: "1px solid #ccc", borderRadius: 4, padding: "4px 8px" }}>
                <input
                  type="checkbox"
                  checked={!!selectedEmps.find((e) => e.empCode === emp.empCode)}
                  onChange={() => toggleEmployee(emp)}
                />{" "}
                {emp.name} ({emp.empCode})
              </label>
            ))}
          </div>
        </div>
      )}

      {/* 🔹 Allocation Table */}
      {selectedEmps.length > 0 && (
        <>
          <table border="1" cellPadding="6" style={{ width: "100%", marginTop: 15, borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th>Item</th>
                <th>Emp Code</th>
                <th>Name</th>
                {columns.map((col) => (
                  <th key={col}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {selectedEmps.map((emp) => (
                <tr key={emp.empCode}>
                  <td>{selectedItem}</td>
                  <td>{emp.empCode}</td>
                  <td>{emp.name}</td>
                  {columns.map((col) => (
                    <td key={col}>
                      <input
                        type={col === "Qty" ? "number" : "text"}
                        value={col === "Qty" ? safeNum(emp.qty) : emp.extra?.[col] || ""}
                        onChange={(e) =>
                          updateValue(emp.empCode, col === "Qty" ? "qty" : col, e.target.value)
                        }
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>

          {/* Purpose */}
          <div style={{ marginTop: 15 }}>
            <label>
              <b>Purpose:</b>{" "}
              <select value={purpose} onChange={(e) => setPurpose(e.target.value)}>
                <option value="">-- Select Purpose --</option>
                <option value="Team Bifurcation">To bifurcate among the team</option>
                <option value="Project/Marketing">To use Project/Marketing</option>
              </select>
            </label>
          </div>

          {/* Allot Button */}
          <div style={{ marginTop: 20 }}>
            <button
              onClick={handleAllot}
              style={{
                padding: "6px 12px",
                borderRadius: 4,
                border: "1px solid #999",
                background: "#4caf50",
                color: "white",
                cursor: "pointer",
              }}
            >
              ✅ Allot Stock
            </button>
          </div>
        </>
      )}
    </div>
  );
}
