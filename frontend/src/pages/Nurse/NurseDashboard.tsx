import { useEffect, useState } from "react";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";

interface Appointment {
  id: string;
  date: string;
  patient: {
    id: string;
    firstName: string;
    lastName: string;
    patientCode?: string;
  };
  physician?: {
    name: string;
  };
}

const initialVitals = {
  bloodPressure: "",
  temperature: "",
  pulse: "",
  weight: "",
  height: "",
  oxygenLevel: "",
  nurseNotes: "",
};

export default function NurseDashboard() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selected, setSelected] = useState<Appointment | null>(null);
  const [form, setForm] = useState(initialVitals);
  const [loading, setLoading] = useState(false);

  const loadAppointments = async () => {
    try {
      const response = await api.get(
        "/appointments?status=CHECKED_IN&limit=100"
      );
      const result = response.data.data ?? response.data;
      setAppointments(Array.isArray(result) ? result : []);
    } catch (error) {
      console.error("Unable to load checked-in appointments", error);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, []);

  const saveVitals = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selected || !user?.id) {
      alert("Unable to identify the selected patient or nurse.");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        patientId: selected.patient.id,
        nurseId: user.id,
        ...Object.fromEntries(
          Object.entries(form)
            .filter(([, value]) => value !== "")
            .map(([key, value]) => [
              key,
              [
                "temperature",
                "pulse",
                "weight",
                "height",
                "oxygenLevel",
              ].includes(key)
                ? Number(value)
                : value,
            ])
        ),
      };

      await api.post("/vitals", payload);

      // Move the patient into the physician's queue.
      await api.put(`/appointments/${selected.id}/status`, {
        status: "IN_CONSULTATION",
      });

      alert("Vitals saved. Patient is now in the physician queue.");

      setSelected(null);
      setForm(initialVitals);
      await loadAppointments();
    } catch (error: any) {
      console.error("Vitals save error:", error.response?.data || error);
      alert(
        error.response?.data?.message ||
        "Unable to save vitals or update appointment."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <h1>Nurse Dashboard</h1>
      <p>Patients waiting for vitals.</p>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Patient</th>
              <th>Patient ID</th>
              <th>Appointment</th>
              <th>Doctor</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {appointments.map((appointment) => (
              <tr key={appointment.id}>
                <td>
                  {appointment.patient.firstName}{" "}
                  {appointment.patient.lastName}
                </td>
                <td>{appointment.patient.id}</td>
                <td>
                  {new Date(appointment.date).toLocaleString("en-IN")}
                </td>
                <td>{appointment.physician?.name || "-"}</td>
                <td>
                  <button onClick={() => setSelected(appointment)}>
                    Enter Vitals
                  </button>
                </td>
              </tr>
            ))}

            {appointments.length === 0 && (
              <tr>
                <td colSpan={5}>No checked-in patients waiting.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {selected && (
        <div className="form-card">
          <h2>
            Vitals — {selected.patient.firstName}{" "}
            {selected.patient.lastName}
          </h2>

          <form className="data-form" onSubmit={saveVitals}>
            {[
              { name: "bloodPressure", label: "Blood Pressure (e.g. 120/80)", type: "text" },
              { name: "temperature", label: "Temperature (°C)", type: "number" },
              { name: "pulse", label: "Pulse (bpm)", type: "number" },
              { name: "weight", label: "Weight (kg)", type: "number" },
              { name: "height", label: "Height (cm)", type: "number" },
              { name: "oxygenLevel", label: "Oxygen Level (%)", type: "number" },
            ].map((field) => (
              <div key={field.name}>
                <label>{field.label}</label>
                <input
                  type={field.type}
                  step={field.type === "number" ? "any" : undefined}
                  value={form[field.name as keyof typeof form]}
                  onChange={(e) =>
                    setForm({ ...form, [field.name]: e.target.value })
                  }
                />
              </div>
            ))}

            <div>
              <label>Nurse Notes</label>
              <textarea
                value={form.nurseNotes}
                onChange={(e) =>
                  setForm({ ...form, nurseNotes: e.target.value })
                }
              />
            </div>

            <button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save Vitals"}
            </button>

            <button
              type="button"
              className="button-secondary"
              onClick={() => setSelected(null)}
            >
              Cancel
            </button>
          </form>
        </div>
      )}
    </div>
  );
}