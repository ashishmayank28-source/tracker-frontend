// frontend/src/pages/MyReports.jsx
import { useState, useEffect } from "react";
import { useAuth } from "../auth.jsx";
import NewVisitForm from "./NewVisitForm.jsx";
import imageCompression from "browser-image-compression";

const API_BASE = import.meta.env.VITE_API_BASE || "http://127.0.0.1:5000";

export default function MyReports() {
  const { user, token } = useAuth();
  const [tab, setTab] = useState("new"); // new | revisit | submitted
  const [historyCustomer, setHistoryCustomer] = useState(null); // for inline history

  return (
    <div style={{ padding: "20px" }}>
      <h2 style={{ fontSize: "20px", fontWeight: "600", marginBottom: "16px" }}>
        
      </h2>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "16px" }}>
        <button onClick={() => { setTab("new"); setHistoryCustomer(null); }}
          style={tabBtnStyle(tab === "new")}>➕ New Visit</button>
        <button onClick={() => { setTab("revisit"); setHistoryCustomer(null); }}
          style={tabBtnStyle(tab === "revisit")}>🔁 Revisit</button>
        <button onClick={() => { setTab("submitted"); setHistoryCustomer(null); }}
          style={tabBtnStyle(tab === "submitted")}>📑 Submitted Reports</button>
      </div>

      {/* Content */}
      {tab === "new" && <NewVisitForm token={token} user={user} />}
      {tab === "revisit" && !historyCustomer &&
        <Revisit token={token} user={user} setHistoryCustomer={setHistoryCustomer} />}
      {tab === "submitted" && !historyCustomer &&
        <SubmittedReports token={token} setHistoryCustomer={setHistoryCustomer} />}
      {historyCustomer &&
        <CustomerHistory token={token} id={historyCustomer} onBack={() => setHistoryCustomer(null)} />}
    </div>
  );
}

function tabBtnStyle(active) {
  return {
    padding: "8px 14px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    background: active ? "#2563eb" : "#f1f1f1",
    color: active ? "#fff" : "#000",
    cursor: "pointer",
  };
}

/* ------------------ Revisit ------------------ */
function Revisit({ token, user, setHistoryCustomer }) {
  const [q, setQ] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [selected, setSelected] = useState(null);
  const [history, setHistory] = useState([]);
  const [msg, setMsg] = useState("");

  // 🔸 dynamic fields
  const [orderStatus, setOrderStatus] = useState("Pending");
  const [remark, setRemark] = useState("");
  const [nextMeeting, setNextMeeting] = useState("");
  const [expectedOrder, setExpectedOrder] = useState("");
  const [lossReason, setLossReason] = useState("");
  const [revForm, setRevForm] = useState({
    distributorName: "",
    distributorCode: "",
    orderType: "Project",
    itemName: "",
    orderValue: "",
    poNumber: "",
    poFile: null,
  });

  useEffect(() => {
    if (q.length < 2) return;
    fetch(`${API_BASE}/api/customers/search?q=${q}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then(setSuggestions)
      .catch(() => setSuggestions([]));
  }, [q, token]);

  async function loadHistory(id) {
    if (!id) return;
    const res = await fetch(`${API_BASE}/api/customers/${id}/history`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setHistory(await res.json());
  }

  // 🔹 Handle PO file compression
  const handlePOFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.type.startsWith("image/")) {
      const compressed = await imageCompression(file, {
        maxSizeMB: 0.3,
        maxWidthOrHeight: 1280,
        useWebWorker: true,
      });
      setRevForm((p) => ({ ...p, poFile: compressed }));
    } else {
      setRevForm((p) => ({ ...p, poFile: file }));
    }
  };

  async function submitRevisit() {
    if (!selected) return;
    try {
      const payload = {
  empCode: user.empCode,
  orderStatus,
  discussion: remark || "NA",
  nextMeetingDate: nextMeeting || null,
  expectedOrderDate: expectedOrder || null,
  orderLossReason: lossReason || "NA",
  meetingType: "Revisit",
  vertical: "EP",

    distributorName: revForm.distributorName || "NA",
  distributorCode: revForm.distributorCode || "NA",
  orderType: revForm.orderType || "NA",
  itemName: revForm.itemName || "NA",
  orderValue: revForm.orderValue || 0,
  poNumber: revForm.poNumber || "NA",
  poFileUrl: revForm.poFile ? revForm.poFile.name : "NA",

  reportedBy: "Employee",
  createdBy: user.empCode,
};


      // 🔸 Send base revisit data
      const res = await fetch(`${API_BASE}/api/customers/${selected}/revisit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to submit revisit");

      // 🔸 If order won, upload PO details
      if (orderStatus === "Won" && revForm.poFile) {
        const fd = new FormData();
        Object.entries(revForm).forEach(([k, v]) => fd.append(k, v));
        fd.append("empCode", user.empCode);
        fd.append("customerId", selected);

        await fetch(`${API_BASE}/api/revenue/upload`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: fd,
        });
      }

      setMsg("✅ Revisit details updated successfully");
      setRemark("");
      setNextMeeting("");
      setExpectedOrder("");
      setLossReason("");
      setRevForm({
        distributorName: "",
        distributorCode: "",
        orderType: "Project",
        itemName: "",
        orderValue: "",
        poNumber: "",
        poFile: null,
      });
      loadHistory(selected);
    } catch (err) {
      console.error(err);
      setMsg("❌ Error updating revisit");
    }
  }

  const handleRevChange = (e) =>
    setRevForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  return (
    <div>
      <input
        placeholder="Search by name or mobile"
        style={inputStyle}
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />

      {/* Suggestions */}
      {suggestions.map((s, i) => (
        <div key={s.customerId || i} style={suggestionStyle}>
          <span
            style={{ cursor: "pointer" }}
            onClick={() => {
              setSelected(s.customerId);
              loadHistory(s.customerId);
            }}
          >
            {s.name} ({s.mobile}) → {s.customerId}
          </span>
          <button
            onClick={() => setHistoryCustomer(s.customerId)}
            style={btnBlueSmall}
          >
            View History
          </button>
        </div>
      ))}

      {/* History + Update Section */}
      {selected && (
        <div style={{ marginTop: "16px" }}>
          <h3 style={{ fontWeight: "600" }}>History for {selected}</h3>
          <ul>
            {history.map((h, i) => (
              <li key={i}>
                {new Date(h.date).toLocaleDateString()} –{" "}
                {h.discussion || h.remark}
              </li>
            ))}
          </ul>

          {/* New revisit entry */}
          <div style={{ marginTop: 20 }}>
            <label style={{ fontWeight: 600 }}>Order Status *</label>
            <select
              value={orderStatus}
              onChange={(e) => setOrderStatus(e.target.value)}
              style={{
                ...inputStyle,
                display: "block",
                marginBottom: "10px",
                width: "100%",
              }}
            >
              <option value="Pending">Pending</option>
              <option value="Won">Won</option>
              <option value="Lost">Lost</option>
            </select>

            {/* Pending Section */}
            {orderStatus === "Pending" && (
              <>
                <textarea
                  style={textareaStyle}
                  placeholder="Follow-up Remark"
                  value={remark}
                  onChange={(e) => setRemark(e.target.value)}
                />
                <label>Next Meeting Date</label>
                <input
                  type="date"
                  style={inputStyle}
                  value={nextMeeting}
                  onChange={(e) => setNextMeeting(e.target.value)}
                />
                <label>Expected Order Date</label>
                <input
                  type="date"
                  style={inputStyle}
                  value={expectedOrder}
                  onChange={(e) => setExpectedOrder(e.target.value)}
                />
              </>
            )}

            {/* Lost Section */}
            {orderStatus === "Lost" && (
              <>
                <label>Reason for Loss *</label>
                <input
                  style={inputStyle}
                  value={lossReason}
                  onChange={(e) => setLossReason(e.target.value)}
                  placeholder="Enter loss reason"
                />
              </>
            )}

            {/* Won Section */}
            {orderStatus === "Won" && (
              <div
                style={{
                  border: "1px solid #ddd",
                  borderRadius: 8,
                  padding: 12,
                  marginTop: 10,
                }}
              >
                <h4>💰 Order Won Details</h4>
                <input
                  name="distributorName"
                  placeholder="Distributor Name"
                  style={inputStyle}
                  onChange={handleRevChange}
                  required
                />
                <input
                  name="distributorCode"
                  placeholder="Distributor Code"
                  style={inputStyle}
                  onChange={handleRevChange}
                  required
                />
                <select
                  name="orderType"
                  style={inputStyle}
                  value={revForm.orderType}
                  onChange={handleRevChange}
                >
                  <option value="Project">Project</option>
                  <option value="Retail">Retail</option>
                </select>
                <input
                  name="itemName"
                  placeholder="Item Name"
                  style={inputStyle}
                  onChange={handleRevChange}
                  required
                />
                <input
                  type="number"
                  name="orderValue"
                  placeholder="Value (₹)"
                  style={inputStyle}
                  onChange={handleRevChange}
                  required
                />
                <input
                  name="poNumber"
                  placeholder="PO No."
                  style={inputStyle}
                  onChange={handleRevChange}
                  required
                />
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    fontWeight: "600",
                  }}
                >
                  Upload PO
                </label>
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png,.pdf"
                  onChange={handlePOFile}
                  style={inputStyle}
                  required
                />
              </div>
            )}

            <button onClick={submitRevisit} style={btnBlue}>
              Submit Revisit
            </button>
            {msg && <p style={{ color: "green", marginTop: "8px" }}>{msg}</p>}
          </div>
        </div>
      )}

    </div>
  );
}

/* ------------------ Submitted Reports ------------------ */
function SubmittedReports({ token, setHistoryCustomer }) {
  const [reports, setReports] = useState([]);
  const [err, setErr] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  async function loadReports() {
    try {
      let url = `${API_BASE}/api/customers/my-reports`;
      if (from && to) url += `?from=${from}&to=${to}`;
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to load reports");
      setReports(data);
    } catch (e) {
      setErr(e.message);
    }
  }
  useEffect(() => { loadReports(); }, [token]);

  if (err) return <p style={{ color: "red" }}>{err}</p>;
  if (!reports.length) return <p>No reports submitted yet.</p>;

  return (
    <div>
      <h3 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "10px" }}>📑 Submitted Reports</h3>
      <div style={{ display: "flex", gap: "10px", marginBottom: "15px" }}>
        <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} style={inputStyle} />
        <input type="date" value={to} onChange={(e) => setTo(e.target.value)} style={inputStyle} />
        <button onClick={loadReports} style={btnBlueSmall}>Filter</button>
      </div>
      <table style={tableStyle}>
        <thead>
          <tr style={{ background: "#f9f9f9" }}>
            <th style={th}>Customer ID</th>
             <th style={th}>Customer Mob No.</th>
            <th style={th}>Name</th>
            <th style={th}>Company</th>
            <th style={th}>Discussion</th>
            <th style={th}>Date</th>
            <th style={th}>History</th>
          </tr>
        </thead>
        <tbody>
          {reports.map((r, i) => (
            <tr key={i}>
              <td style={td}>{r.customerId}</td>
              <td style={td}>{r.customerMobile || "NA"}</td>
              <td style={td}>{r.name}</td>
              <td style={td}>{r.company}</td>
              <td style={td}>{r.discussion}</td>
              <td style={td}>{r.date ? new Date(r.date).toLocaleDateString() : "-"}</td>
              <td style={td}>
                <button onClick={() => setHistoryCustomer(r.customerId)} style={btnBlueSmall}>View</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ------------------ Customer History (Inline) ------------------ */
function CustomerHistory({ token, id, onBack }) {
  const [history, setHistory] = useState([]);
  useEffect(() => {
    async function loadHistory() {
      const res = await fetch(`${API_BASE}/api/customers/${id}/history`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setHistory(await res.json());
    }
    if (id) loadHistory();
  }, [id, token]);

  return (
    <div>
      <button onClick={onBack} style={btnBack}>← Back</button>
      <h3 style={{ marginBottom: 10 }}>📑 Customer History ({id})</h3>
      <table style={tableStyle}>
        <thead>
          <tr>
            <th style={th}>Date</th>
            <th style={th}>Discussion</th>
            <th style={th}>Order Status</th>
            <th style={th}>Order Value</th>
          </tr>
        </thead>
        <tbody>
          {history.map((h, i) => (
            <tr key={i}>
              <td style={td}>{h.date ? new Date(h.date).toLocaleDateString() : "-"}</td>
              <td style={td}>{h.discussion || "-"}</td>
              <td style={td}>{h.orderStatus || "-"}</td>
              <td style={td}>{h.orderValue || "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ---------- Styles ---------- */
const inputStyle = { border: "1px solid #ccc", borderRadius: "6px", padding: "8px" };
const suggestionStyle = { padding: "6px", borderBottom: "1px solid #eee", cursor: "pointer" };
const textareaStyle = { border: "1px solid #ccc", borderRadius: "6px", padding: "8px", width: "100%", marginTop: "10px" };
const btnBlue = { background: "#2563eb", color: "#fff", padding: "8px 16px", borderRadius: "6px", marginTop: "10px", cursor: "pointer", border: "none" };
const btnBlueSmall = { background: "#2563eb", color: "#fff", border: "none", borderRadius: "4px", padding: "4px 10px", cursor: "pointer" };
const btnBack = { marginBottom: "10px", padding: "6px 12px", background: "#eee", border: "1px solid #ccc", borderRadius: 5, cursor: "pointer" };
const tableStyle = { width: "100%", borderCollapse: "collapse", marginBottom: "20px" };
const th = { textAlign: "left", padding: "8px", borderBottom: "1px solid #ddd", fontSize: "13px" };
const td = { padding: "8px", fontSize: "13px" };
