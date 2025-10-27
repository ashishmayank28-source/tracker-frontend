// src/Pages/admin/SampleBoards.jsx
import { useEffect, useState } from "react";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

export default function SampleBoards({ onBack }) {
  const [users, setUsers] = useState([]);
  const [columns, setColumns] = useState([
    { key: "Sample1", label: "Sample Board 1" },
  ]);

  // 🔹 Load users from backend
  useEffect(() => {
    async function fetchUsers() {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_BASE}/api/users`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to load users");
        const data = await res.json();
        setUsers(data || []);
      } catch (err) {
        console.error("Error fetching users:", err);
      }
    }
    fetchUsers();
  }, []);

  // 🔹 Handle quantity change
  const handleQtyChange = (empCode, colKey, value) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.empCode === empCode ? { ...u, [colKey]: value } : u
      )
    );
  };

  // 🔹 Add new sample column
  const addColumn = () => {
    const newKey = `Sample${columns.length + 1}`;
    setColumns([
      ...columns,
      { key: newKey, label: `Sample Board ${columns.length + 1}` },
    ]);
  };

  // 🔹 Edit sample column name
  const editColumnName = (index, newLabel) => {
    const updated = [...columns];
    updated[index].label = newLabel;
    setColumns(updated);
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">📦 Sample Boards Allocation</h2>

      <div className="flex gap-2 mb-4">
        <button
          onClick={onBack}
          className="px-3 py-1 bg-gray-300 rounded hover:bg-gray-400"
        >
          ← Back
        </button>
        <button
          onClick={addColumn}
          className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          ➕ Add Sample Column
        </button>
      </div>

      {users.length === 0 ? (
        <p className="text-gray-500 italic">No employees found.</p>
      ) : (
        <table className="w-full border-collapse border border-gray-400 text-sm">
          <thead>
            <tr className="bg-gray-200">
              <th className="border px-2 py-1">Emp ID</th>
              <th className="border px-2 py-1">Name</th>
              <th className="border px-2 py-1">Designation</th>
              <th className="border px-2 py-1">Region</th>
              <th className="border px-2 py-1">Branch</th>
              {columns.map((col, i) => (
                <th key={col.key} className="border px-2 py-1">
                  <input
                    type="text"
                    value={col.label}
                    onChange={(e) => editColumnName(i, e.target.value)}
                    className="w-full border rounded px-1 py-0.5 text-xs"
                  />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.empCode}>
                <td className="border px-2 py-1">{u.empCode}</td>
                <td className="border px-2 py-1">{u.name}</td>
                <td className="border px-2 py-1">{u.designation}</td>
                <td className="border px-2 py-1">{u.region}</td>
                <td className="border px-2 py-1">{u.branch}</td>
                {columns.map((col) => (
                  <td key={col.key} className="border px-2 py-1">
                    <input
                      type="number"
                      value={u[col.key] || ""}
                      onChange={(e) =>
                        handleQtyChange(u.empCode, col.key, e.target.value)
                      }
                      className="w-16 border rounded px-1 py-0.5"
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
