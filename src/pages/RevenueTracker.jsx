import { useState } from "react";
import { useAuth } from "../auth.jsx";
import imageCompression from "browser-image-compression";

const API_BASE = import.meta.env.VITE_API_BASE || "http://127.0.0.1:5000";

export default function RevenueTracker() {
  const { user, token } = useAuth();
  const [form, setForm] = useState({
    distributorName: "",
    distributorCode: "",
    orderType: "Project",
    itemName: "",
    orderValue: "",
    poFile: null,
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    // 🔹 compress image before upload
    if (file.type.startsWith("image/")) {
      const compressed = await imageCompression(file, {
        maxSizeMB: 0.3,
        maxWidthOrHeight: 1280,
        useWebWorker: true,
      });
      setForm({ ...form, poFile: compressed });
    } else {
      setForm({ ...form, poFile: file });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.poFile) return alert("Please attach PO file");

    setLoading(true);
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    fd.append("empCode", user?.empCode || "Unknown");

    const res = await fetch(`${API_BASE}/api/revenue/upload`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: fd,
    });

    const data = await res.json();
    setLoading(false);
    alert(data.message || "Upload completed");
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-semibold mb-4">💰 Revenue Tracker</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input type="text" name="distributorName" placeholder="Distributor Name" onChange={handleChange} required />
        <input type="text" name="distributorCode" placeholder="Distributor Code" onChange={handleChange} required />
        <select name="orderType" onChange={handleChange} value={form.orderType}>
          <option value="Project">Project</option>
          <option value="Retail">Retail</option>
        </select>
        <input type="text" name="itemName" placeholder="Item Name" onChange={handleChange} required />
        <input type="number" name="orderValue" placeholder="Order Value" onChange={handleChange} required />
        <input type="file" accept=".jpg,.jpeg,.png,.pdf" onChange={handleFile} required />
        <button disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded">
          {loading ? "Uploading..." : "Submit PO"}
        </button>
      </form>
    </div>
  );
}