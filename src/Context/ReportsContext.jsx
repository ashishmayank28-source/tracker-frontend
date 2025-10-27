// src/context/ReportsContext.jsx
import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useAuth } from "../auth.jsx";

const ReportsContext = createContext();

export function ReportsProvider({ children }) {
  const { token, user } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);

  // 🔄 Fetch reports from backend
  const fetchReports = useCallback(async () => {
    if (!token || !user?.empCode) return;
    setLoading(true);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE || "http://127.0.0.1:5000"}/api/reports/hierarchy?empCode=${user.empCode}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      setReports(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch reports:", err);
    } finally {
      setLoading(false);
    }
  }, [token, user]);

  // First load
  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  return (
    <ReportsContext.Provider value={{ reports, loading, refreshReports: fetchReports }}>
      {children}
    </ReportsContext.Provider>
  );
}

export const useReports = () => useContext(ReportsContext);
