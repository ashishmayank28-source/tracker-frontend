import { useState, useEffect } from "react";
import { useAuth } from "../auth.jsx";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

export default function AdminAssets() {
  const { token } = useAuth();
  const [tab, setTab] = useState("sample");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newRow, setNewRow] = useState({ item: "", qty: 1, assignedTo: "" });

  useEffect(() => {
    loadData();
  }, [tab]);

  async function loadData() {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/assets/all?type=${tab}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const d = await res.json();
      setData(d || []);
    } catch {
      setData([]);
    }
    setLoading(false);
  }

  async function addAsset() {
    if (!newRow.item || !newRow.assignedTo) return alert("Fill all fields");
    const res = await fetch(`${API_BASE}/api/assets/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ ...newRow, type: tab }),
    });
    const d = await res.json();
    if (d.success) {
      setNewRow({ item: "", qty: 1, assignedTo: "" });
      loadData();
    } else {
      alert("Failed to add");
    }
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">📦 Asset Management</h2>

      {/* Tabs */}
      <div className="flex gap-4 mb-4">
        <button
          onClick={() => setTab("sample")}
          className={`px-3 py-1 rounded ${
            tab === "sample" ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
        >
          Sample Boards
        </button>
        <button
          onClick={() => setTab("merchandise")}
          className={`px-3 py-1 rounded ${
            tab === "merchandise" ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
        >
          Merchandise Items
        </button>
        <button
          onClick={() => setTab("gift")}
          className={`px-3 py-1 rounded ${
            tab === "gift" ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
        >
          Wrapped Gifts
        </button>
      </div>

      {/* Add new */}
      <div className="flex gap-2 mb-4">
        <input
          placeholder="Item name"
          value={newRow.item}
          onChange={(e) => setNewRow({ ...newRow, item: e.target.value })}
          className="border p-2 flex-1"
        />
        <input
          type="number"
          placeholder="Qty"
          value={newRow.qty}
          onChange={(e) => setNewRow({ ...newRow, qty: e.target.value })}
          className="border p-2 w-24"
        />
        <input
          placeholder="Assign To (EmpCode)"
          value={newRow.assignedTo}
          onChange={(e) => setNewRow({ ...newRow, assignedTo: e.target.value })}
          className="border p-2 flex-1"
        />
        <button
          onClick={addAsset}
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          Add
        </button>
      </div>

      {/* Table */}
      {loading ? (
        <p>Loading...</p>
      ) : (
        <table className="w-full border">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-2 py-1">Item</th>
              <th className="border px-2 py-1">Qty</th>
              <th className="border px-2 py-1">Assigned To</th>
              <th className="border px-2 py-1">Assigned By</th>
              <th className="border px-2 py-1">Date</th>
            </tr>
          </thead>
          <tbody>
            {data.map((a, i) => (
              <tr key={i}>
                <td className="border px-2 py-1">{a.item}</td>
                <td className="border px-2 py-1">{a.qty}</td>
                <td className="border px-2 py-1">{a.assignedTo}</td>
                <td className="border px-2 py-1">{a.assignedBy}</td>
                <td className="border px-2 py-1">
                  {new Date(a.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
