import { useParams } from "react-router-dom";

export default function DumpPlaceholder() {
  const { type } = useParams();
  const labels = {
    reportdump: "📑 Report Dump",
    assetsdump: "🎁 Assets Dump",
    revenuedump: "💰 Revenue Dump",
    retailerdump: "🏬 Retailer Database Dump",
  };

  return (
    <div style={{ padding: 20 }}>
      <h3 style={{ fontSize: "22px", fontWeight: "600" }}>
        {labels[type] || "Unknown Dump"}
      </h3>
      <p>This is a placeholder for <b>{labels[type]}</b>. CSV export or display will go here.</p>
    </div>
  );
}
