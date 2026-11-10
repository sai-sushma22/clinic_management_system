import { useEffect, useState } from "react";
import api from "../../services/api";

export default function Dashboard() {
  const [patients, setPatients] = useState(0);
  const [appointments, setAppointments] = useState(0);
  const [pending, setPending] = useState(0);

  useEffect(() => {
    const load = async () => {
      try {
        const [p, a] = await Promise.all([
          api.get("/patients?limit=1"),
          api.get("/appointments?limit=100"),
        ]);

        setPatients(p.data.pagination?.total ?? p.data.data?.length ?? 0);

        const records = a.data.data ?? [];
        setAppointments(records.length);
        setPending(records.filter(
          (item: any) => item.status === "COMPLETED" && !item.checkedOutAt
        ).length);
      } catch (error) {
        console.error("Dashboard loading failed", error);
      }
    };

    load();
  }, []);

  return (
    <>
      <h1>Dashboard</h1>

      <div className="stats-grid">
        <div className="stat-card">
          <span>Total Patients</span>
          <h2>{patients}</h2>
        </div>

        <div className="stat-card">
          <span>Appointments Loaded</span>
          <h2>{appointments}</h2>
        </div>

        <div className="stat-card">
          <span>Pending Checkouts</span>
          <h2>{pending}</h2>
        </div>
      </div>
    </>
  );
}