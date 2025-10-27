import { useState } from "react";
import { useAuth } from "../auth.jsx";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

export default function AssignSampleGift() {
  const { user, token } = useAuth();
  const [empCode, setEmpCode] = useState("");
  const [giftType, setGiftType] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [msg, setMsg] = useState("");

  async function handleAssign(e) {
    e.preventDefault();
    setMsg("");

    try {
      const res = await fetch(`${API_BASE}/api/assets/assign`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          empCode,
          type: "gift",
          subType: giftType,
          quantity,
          assignedBy: user.empCode,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setMsg(`✅ Gift assigned successfully to ${empCode}`);
        setEmpCode("");
        setGiftType("");
        setQuantity(1);
      } else {
        setMsg(data.message || "❌ Failed to assign");
      }
    } catch (err) {
      console.error("Assign gift error:", err);
      setMsg("❌ Server error");
    }
  }

  return (
    <div className="p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-semibold mb-4">🎁 Assign Sample Gift</h2>

      <form onSubmit={handleAssign} className="space-y-4">
        {/* Employee Code */}
        <div>
          <label className="block text-sm font-medium">Employee Code</label>
          <input
            type="text"
            value={empCode}
            onChange={(e) => setEmpCode(e.target.value)}
            placeholder="Enter Emp Code"
            className="mt-1 w-full border rounded px-3 py-2"
            required
          />
        </div>

        {/* Gift Type */}
        <div>
          <label className="block text-sm font-medium">Gift Type</label>
          <select
            value={giftType}
            onChange={(e) => setGiftType(e.target.value)}
            className="mt-1 w-full border rounded px-3 py-2"
            required
          >
            <option value="">Select Gift Type</option>
            <option value="merchandise">Merchandise Item</option>
            <option value="wrapped">Wrapped Gift</option>
          </select>
        </div>

        {/* Quantity */}
        <div>
          <label className="block text-sm font-medium">Quantity</label>
          <input
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            className="mt-1 w-full border rounded px-3 py-2"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Assign Gift
        </button>
      </form>

      {msg && <p className="mt-4 text-center text-sm text-blue-600">{msg}</p>}
    </div>
  );
}
