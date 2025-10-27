
import { useState, useEffect } from "react";
import { useAuth } from "../auth.jsx";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

export default function AssetsPage() {
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState("SampleBoard");
  const [assets, setAssets] = useState([]);
  const [form, setForm] = useState({
    category: "SampleBoard",
    item: "",
    quantity: 1,
    assignedTo: ""
  });
  const [msg, setMsg] = useState("");

  // 🔹 Fetch all assets
  useEffect(() => {
    loadAssets();
  }, [activeTab]);

  async function loadAssets() {
    try {
      const res = await fetch(`${API_BASE}/api/assets/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        setAssets(data.filter((a) => a.category === activeTab));
      }
    } catch (e) {
      console.error("Error loading assets:", e);
    }
  }

  // 🔹 Handle input changes
  const handleChange = (field, val) => {
    setForm((prev) => ({ ...prev, [field]: val }));
  };

  // 🔹 Submit new asset
  async function submitAsset() {
    setMsg("");
    try {
      const res = await fetch(`${API_BASE}/api/assets`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...form, category: activeTab }),
      });
      const data = await res.json();
      if (res.ok) {
        setMsg("✅ Assigned successfully");
        setForm({ category: activeTab, item: "", quantity: 1, assignedTo: "" });
        loadAssets();
      } else {
        setMsg(data.message || "❌ Failed");
      }
    } catch (err) {
      setMsg("❌ Error submitting");
    }
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">🛠️ Admin – Assets Management</h2>

      {/* Tabs */}
      <div className="flex gap-3 mb-6">
        {["SampleBoard", "MerchandiseItem", "WrappedGift"].map((t) => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={`px-4 py-2 rounded-lg ${
              activeTab === t ? "bg-blue-600 text-white" : "bg-gray-200"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Form */}
      <div className="bg-white p-4 rounded-lg shadow mb-6 space-y-3">
        <h3 className="font-semibold">➕ Assign New {activeTab}</h3>
        <input
          className="border p-2 w-full"
          placeholder="Item name"
          value={form.item}
          onChange={(e) => handleChange("item", e.target.value)}
        />
        <input
          type="number"
          min="1"
          className="border p-2 w-full"
          placeholder="Quantity"
          value={form.quantity}
          onChange={(e) => handleChange("quantity", e.target.value)}
        />
        <input
          className="border p-2 w-full"
          placeholder="Assign To (empCode)"
          value={form.assignedTo}
          onChange={(e) => handleChange("assignedTo", e.target.value)}
        />
        <button
          onClick={submitAsset}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Assign
        </button>
        {msg && <p className="text-blue-600">{msg}</p>}
      </div>

      {/* Table */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="font-semibold mb-2">{activeTab} List</h3>
        <table className="w-full border">
<thead className="bg-gray-100">
      <tr>
        <th className="p-2 border">Root ID</th>
        <th className="p-2 border">RM ID</th>
        <th className="p-2 border">BM ID</th>
        <th className="p-2 border">Item</th>
        <th className="p-2 border">Qty</th>
        <th className="p-2 border">Assigned To</th>
        <th className="p-2 border">Assigned By</th>
        <th className="p-2 border">Purpose</th>
        <th className="p-2 border">Date</th>
        <th className="p-2 border">LR Details (From Vendor)</th>
      </tr>
    </thead>
           <tbody>
            {assets.map((a) => (
              <tr key={a._id} className="text-center">
          <td className="border p-2">{a.rootId || "-"}</td>
          <td className="border p-2">{a.rmId || "-"}</td>
          <td className="border p-2">{a.bmId || "-"}</td>
          <td className="border p-2">{a.item}</td>
          <td className="border p-2">{a.quantity}</td>
          <td className="border p-2">{a.assignedTo}</td>
          <td className="border p-2">{a.assignedBy}</td>
          <td className="border p-2">{a.purpose || "-"}</td>
          <td className="border p-2">
            {new Date(a.createdAt).toLocaleString()}
          </td>
          <td className="border p-2">{a.lrNo || "-"}</td>
        </tr>
            ))}
            {assets.length === 0 && (
              <tr>
                <td colSpan="10" className="text-gray-500 p-4">
                  No {activeTab} assigned yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
