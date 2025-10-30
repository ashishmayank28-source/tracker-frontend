import { Link } from "react-router-dom";

function SubTile({ to, label }) {
  return (
    <Link
      to={to}
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "20px",
        border: "1px solid #ccc",
        borderRadius: "8px",
        textDecoration: "none",
        background: "#f9f9f9",
        color: "#333",
        fontWeight: "600",
        transition: "all 0.2s ease",
      }}
    >
      {label}
    </Link>
  );
}

export default function DumpTile() {
  return (
    <div style={{ padding: 20 }}>
      <h3 style={{ fontSize: "20px", fontWeight: "600", marginBottom: "20px" }}>
        🗂 Dump Management
      </h3>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          gap: "20px",
        }}
      >
        <SubTile to="reportdump" label="📑 Report Dump" />
        <SubTile to="assetsdump" label="🎁 Assets Dump" />
        <SubTile to="revenuedump" label="💰 Revenue Dump" />
        <SubTile to="retailerdump" label="🏬 Retailer Database Dump" />
      </div>
    </div>
  );
}
