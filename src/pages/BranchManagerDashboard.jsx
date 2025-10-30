import { useState } from "react";
import { useAuth } from "../auth.jsx";
import { useUserHierarchy } from "../context/UserHierarchyContext.jsx";
import ReportsViewer from "../components/ReportsViewer.jsx";
import SampleBoardsAllocationBranch from "./SampleBoardsAllocationBranch.jsx";   // ✅ नया import
import RevenueTrackerBranch from "./RevenueTrackerBranch.jsx"; 

export default function BranchManagerDashboard() {
  const { user, logout } = useAuth();
  const { getReportees } = useUserHierarchy();
  const [activeTile, setActiveTile] = useState("dashboard");

  const reportees = getReportees(user);

  return (
    <div style={{ padding: 20 }}>
      {/* 🔹 Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20,
        }}
      >
        <h2 style={{ fontSize: "22px", fontWeight: "bold" }}>
          🏢 Branch Manager Dashboard
        </h2>
        {user && (
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span>
              Hi <b>{user.name}</b> · {user.role}
            </span>
            <button
              onClick={logout}
              style={{
                padding: "6px 12px",
                borderRadius: 4,
                background: "#f44336",
                color: "#fff",
                border: "none",
                cursor: "pointer",
              }}
            >
              Logout
            </button>
          </div>
        )}
      </div>

      {/* --- Dashboard Tiles --- */}
      {activeTile === "dashboard" && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
            gap: 20,
            marginTop: 20,
          }}
        >
          <Tile label="📅 Daily Tracker" onClick={() => setActiveTile("daily")} />
          <Tile label="📊 Reports" onClick={() => setActiveTile("reports")} />
          <Tile label="💰 Revenue" onClick={() => setActiveTile("revenue")} />
          <Tile label="👥 My Team" onClick={() => setActiveTile("team")} />
          <Tile label="🎁 Assets" onClick={() => setActiveTile("assets")} />
        </div>
      )}

      {/* --- Daily Tracker --- */}
      {activeTile === "daily" && (
        <TileWrapper onBack={() => setActiveTile("dashboard")}>
          <h3>📅 Daily Tracker (Branch: {user?.branch || "N/A"})</h3>
          <ReportsViewer />
        </TileWrapper>
      )}

      {/* --- Reports --- */}
      {activeTile === "reports" && (
        <TileWrapper onBack={() => setActiveTile("dashboard")}>
          <h3>📊 Submitted & Summary Reports</h3>
          <ReportsViewer />
        </TileWrapper>
      )}

      {/* --- Revenue --- */}
      {activeTile === "revenue" && (
  <TileWrapper onBack={() => setActiveTile("dashboard")}>
    <h3>💰 Revenue Tracker (Branch: {user?.branch || "N/A"})</h3>
    <RevenueTrackerBranch />  {/* 🧩 Load actual page instead of placeholder */}
  </TileWrapper>
)}

      {/* --- My Team --- */}
      {activeTile === "team" && (
        <TileWrapper onBack={() => setActiveTile("dashboard")}>
          <h3>👥 My Team (Branch: {user?.branch || "N/A"})</h3>
          {reportees.length > 0 ? (
            <table
              border="1"
              cellPadding="6"
              style={{ width: "100%", marginTop: 10, borderCollapse: "collapse" }}
            >
              <thead>
                <tr>
                  <th>EmpCode</th>
                  <th>Name</th>
                  <th>Role</th>
                  <th>Branch</th>
                </tr>
              </thead>
              <tbody>
                {reportees.map((u) => (
                  <tr key={u.empCode}>
                    <td>{u.empCode}</td>
                    <td>{u.name}</td>
                    <td>{u.role}</td>
                    <td>{u.branch}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No users found under your branch.</p>
          )}
        </TileWrapper>
      )}

      {/* --- Assets --- */}
      {activeTile === "assets" && (
        <TileWrapper onBack={() => setActiveTile("dashboard")}>
          <h3>🎁 Assets</h3>
          <div style={{ display: "flex", gap: "12px" }}>
            <button onClick={() => setActiveTile("sample")}>📦 Sample Boards</button>
            <button onClick={() => setActiveTile("gifts")}>🎁 Gifts</button>
            <button onClick={() => setActiveTile("merch")}>🛍 Merchandise</button>
            <button onClick={() => setActiveTile("companyAssets")}>🖥️ Company Assets</button>
          </div>
        </TileWrapper>
      )}

      {/* --- Sample Boards --- */}
      {activeTile === "sample" && (
        <TileWrapper onBack={() => setActiveTile("assets")}>
          <SampleBoardsAllocationBranch />   {/* ✅ अब BM का नया allocation page */}
        </TileWrapper>
      )}

      {/* --- Gifts --- */}
      {activeTile === "gifts" && (
        <TileWrapper onBack={() => setActiveTile("assets")}>
          <p>🎁 Gifts allocation table yaha ayega.</p>
        </TileWrapper>
      )}

      {/* --- Merchandise --- */}
      {activeTile === "merch" && (
        <TileWrapper onBack={() => setActiveTile("assets")}>
          <p>🛍 Merchandise allocation table yaha ayega.</p>
        </TileWrapper>
      )}

      {/* --- Company Assets --- */}
      {activeTile === "companyAssets" && (
        <TileWrapper onBack={() => setActiveTile("assets")}>
          <p>🖥️ Company assets allocation table yaha ayega.</p>
        </TileWrapper>
      )}
    </div>
  );
}

/* --- Reusable Tile --- */
function Tile({ label, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        border: "1px solid #ccc",
        borderRadius: 8,
        padding: 20,
        textAlign: "center",
        cursor: "pointer",
        background: "#f9f9f9",
        fontWeight: "bold",
        transition: "all 0.2s ease",
      }}
    >
      {label}
    </div>
  );
}

/* --- Wrapper with Back button --- */
function TileWrapper({ onBack, children }) {
  return (
    <div>
      <button
        onClick={onBack}
        style={{
          marginBottom: 20,
          padding: "5px 12px",
          background: "#eee",
          border: "1px solid #ccc",
          borderRadius: 5,
          cursor: "pointer",
        }}
      >
        ← Back
      </button>
      {children}
    </div>
  );
}
