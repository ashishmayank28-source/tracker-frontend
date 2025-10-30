import { useEffect, useState } from "react";
import { useAuth } from "../auth.jsx";

const API_BASE = import.meta.env.VITE_API_BASE || "http://127.0.0.1:5000";

export default function SampleBoards({ scope = "self" }) {
  const { user, token } = useAuth();
  const [team, setTeam] = useState([]);

  useEffect(() => {
    async function loadTeam() {
      try {
        let list = [];

        if (scope === "self") {
          // Sirf apna record
          list = [
            {
              empCode: user.empCode,
              name: user.name,
              role: user.role,
              area: user.area || "-",
            },
          ];
        } else if (scope === "team") {
          let url = "";

          if (user.role === "Manager") {
            url = `${API_BASE}/api/reports/reportees/${user.empCode}`;
          } else if (user.role === "BranchManager") {
            url = `${API_BASE}/api/users?branch=${encodeURIComponent(user.branch)}`;
          } else if (user.role === "RegionalManager") {
            url = `${API_BASE}/api/users?region=${encodeURIComponent(user.region)}`;
          } else if (user.role === "Admin") {
            url = `${API_BASE}/api/users`;
          }

          const res = await fetch(url, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const data = await res.json();

          // Normalize data (backend fields → frontend expected fields)
          if (Array.isArray(data)) {
            list = data.map((e) => ({
              empCode: e.empCode || e.emp_code || e.id,
              name: e.name || e.empName || e.fullName,
              role: e.role || e.designation,
              area: e.area || e.branch || e.region || "-",
            }));
          } else if (data) {
            list = [
              {
                empCode: data.empCode || data.emp_code || data.id,
                name: data.name || data.empName || data.fullName,
                role: data.role || data.designation,
                area: data.area || data.branch || data.region || "-",
              },
            ];
          }

          // Apna record hamesha top par
          if (user) {
            const selfRecord = {
              empCode: user.empCode,
              name: user.name,
              role: user.role,
              area: user.area || "-",
            };
            const exists = list.some((e) => e.empCode === user.empCode);
            if (!exists) {
              list.unshift(selfRecord);
            } else {
              list = [
                list.find((e) => e.empCode === user.empCode),
                ...list.filter((e) => e.empCode !== user.empCode),
              ];
            }
          }
        }

        setTeam(list);
      } catch (err) {
        console.error("Error loading team:", err);
      }
    }

    if (user?.empCode) loadTeam();
  }, [scope, user, token]);

  return (
    <div>
      <h4>📦 Sample Boards Allocation</h4>
      {team.length > 0 ? (
        <table
          border="1"
          cellPadding="6"
          style={{ width: "100%", marginTop: 10, borderCollapse: "collapse" }}
        >
          <thead>
            <tr style={{ background: "#f3f4f6" }}>
              <th>Emp ID</th>
              <th>Name</th>
              <th>Role</th>
              <th>Area</th>
            </tr>
          </thead>
          <tbody>
            {team.map((e, i) => (
              <tr key={i}>
                <td>{e.empCode}</td>
                <td>{e.name}</td>
                <td>{e.role}</td>
                <td>{e.area}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No employees found.</p>
      )}
    </div>
  );
}
