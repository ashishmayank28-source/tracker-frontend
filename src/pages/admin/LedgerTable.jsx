import { useEffect, useState } from "react";
import { useAuth } from "../../auth.jsx";

const API_BASE = import.meta.env.VITE_API_BASE || "http://127.0.0.1:5000";

export default function LedgerTable({ category }) {
  const { token } = useAuth();
  const [ledger, setLedger] = useState([]);

  useEffect(() => {
    fetch(`${API_BASE}/api/assets/ledger?category=${category}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => setLedger(d.ledger || []))
      .catch((e) => console.error("ledger error", e));
  }, [category, token]);

  if (!ledger.length) return <p>No ledger entries yet</p>;

  return (
    <table className="w-full border">
      <thead className="bg-gray-100">
        <tr>
          <th className="border px-3 py-2">Item</th>
          <th className="border px-3 py-2">Qty</th>
          <th className="border px-3 py-2">Assigned To</th>
          <th className="border px-3 py-2">Assigned By</th>
          <th className="border px-3 py-2">Date</th>
        </tr>
      </thead>
      <tbody>
        {ledger.map((l, i) => (
          <tr key={i}>
            <td className="border px-3 py-1">{l.name}</td>
            <td className="border px-3 py-1">{l.quantity}</td>
            <td className="border px-3 py-1">{l.assignedTo?.name || "-"}</td>
            <td className="border px-3 py-1">{l.assignedBy?.empCode}</td>
            <td className="border px-3 py-1">{new Date(l.date).toLocaleString()}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
