import { useState } from "react";
import { useAuth } from "../../auth.jsx";
import SampleBoardsAllocationAdmin from "./SampleBoardsAllocationAdmin.jsx";

/* --- Reusable Wrapper with Back --- */
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

export default function AssetsTile() {
  const { user } = useAuth();
  const [activeTile, setActiveTile] = useState("assets");

  return (
    <div style={{ padding: 20 }}>
      {/* --- Main Assets Subtile Menu --- */}
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
        <SampleBoardsAllocationAdmin onBack={() => setActiveTile("assets")} />
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
