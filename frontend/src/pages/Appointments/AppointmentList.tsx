
import { useEffect, useState } from "react";
import api from "../../services/api";

interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  patientCode: string;
}

interface Physician {
  id: string;
  name: string;
  role: string;
}

interface Appointment {
  id: string;
  date: string;
  reason?: string;
  status: string;
  patient?: Patient;
  physician?: Physician;
}

export default function AppointmentList() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [physicians, setPhysicians] = useState<Physician[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    patientId: "",
    physicianId: "",
    date: "",
    reason: "",
  });

  const loadAppointments = async () => {
    try {
      const response = await api.get("/appointments?limit=100");
      const result = response.data.data ?? response.data;
      setAppointments(Array.isArray(result) ? result : []);
    } catch (error: any) {
      console.error("Appointments:", error.response?.data || error);
    }
  };

  const loadDropdowns = async () => {
  // Load patients independently
  try {
    const response = await api.get("/patients?limit=100");
    const result = response.data.data ?? response.data;

    setPatients(Array.isArray(result) ? result : []);
  } catch (error: any) {
    console.error("Patient API error:", error.response?.data || error);
  }

  // Load physicians independently
  setPhysicians([
  {
    id: "ec0a51a3-4df9-4e6e-9978-01ac7048f0ce",
    name: "Dr. Ravi",
    role: "PHYSICIAN",
  },
]);
};

  useEffect(() => {
    loadAppointments();
    loadDropdowns();
  }, []);

  const createAppointment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.patientId || !form.physicianId || !form.date) {
      alert("Please select patient, physician and appointment date.");
      return;
    }

    try {
      setLoading(true);

      await api.post("/appointments", {
        patientId: form.patientId,
        physicianId: form.physicianId,
        date: new Date(form.date).toISOString(),
        reason: form.reason,
      });

      alert("Appointment created successfully!");

      setForm({
        patientId: "",
        physicianId: "",
        date: "",
        reason: "",
      });

      setShowForm(false);
      await loadAppointments();
    } catch (error: any) {
      console.error("Create appointment:", error.response?.data || error);

      alert(
        error.response?.data?.message ||
        JSON.stringify(error.response?.data) ||
        "Unable to create appointment."
      );
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      await api.put(`/appointments/${id}/status`, { status });
      await loadAppointments();
    } catch (error: any) {
      alert(
        error.response?.data?.message ||
        "Unable to update appointment status."
      );
    }
  };

  return (
    <div className="page-container">
      <div className="page-heading">
        <div>
          <h1>Appointments</h1>
          <p>Schedule and manage patient appointments.</p>
        </div>

        <button onClick={() => setShowForm(!showForm)}>
          {showForm ? "Close Form" : "+ Create Appointment"}
        </button>
      </div>

      {showForm && (
        <div className="form-card">
          <h2>Schedule Appointment</h2>

          <form className="data-form" onSubmit={createAppointment}>
            <div>
              <label>Patient</label>
              <select
                required
                value={form.patientId}
                onChange={(e) =>
                  setForm({ ...form, patientId: e.target.value })
                }
              >
                <option value="">Select Patient</option>
                {patients.map((patient) => (
                  <option key={patient.id} value={patient.id}>
                    {patient.firstName} {patient.lastName} (
                    {patient.patientCode})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label>Physician</label>
              <select
                required
                value={form.physicianId}
                onChange={(e) =>
                  setForm({ ...form, physicianId: e.target.value })
                }
              >
                <option value="">Select Physician</option>
                {physicians.map((physician) => (
                  <option key={physician.id} value={physician.id}>
                    {physician.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label>Appointment Date & Time</label>
              <input
                type="datetime-local"
                required
                value={form.date}
                onChange={(e) =>
                  setForm({ ...form, date: e.target.value })
                }
              />
            </div>

            <div>
              <label>Reason for Visit</label>
              <input
                value={form.reason}
                placeholder="General consultation"
                onChange={(e) =>
                  setForm({ ...form, reason: e.target.value })
                }
              />
            </div>

            <button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Save Appointment"}
            </button>
          </form>
        </div>
      )}

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Patient</th>
              <th>Doctor</th>
              <th>Date & Time</th>
              <th>Reason</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {appointments.map((appointment) => (
              <tr key={appointment.id}>
                <td>
                  {appointment.patient
                    ? `${appointment.patient.firstName} ${appointment.patient.lastName}`
                    : "-"}
                </td>

                <td>{appointment.physician?.name || "-"}</td>

                <td>
                  {new Date(appointment.date).toLocaleString("en-IN")}
                </td>

                <td>{appointment.reason || "-"}</td>

                <td>
                  <span className={`status status-${appointment.status.toLowerCase()}`}>
                    {appointment.status.replaceAll("_", " ")}
                  </span>
                </td>

                <td>
                  <div className="action-buttons">
                    {appointment.status === "SCHEDULED" && (
                      <>
                        <button
                          onClick={() =>
                            updateStatus(appointment.id, "CHECKED_IN")
                          }
                        >
                          Check In
                        </button>

                        <button
                          className="button-danger"
                          onClick={() =>
                            updateStatus(appointment.id, "CANCELLED")
                          }
                        >
                          Cancel
                        </button>
                      </>
                    )}

                    {appointment.status === "CHECKED_IN" && (
                      <button
                        className="button-danger"
                        onClick={() =>
                          updateStatus(appointment.id, "CANCELLED")
                        }
                      >
                        Cancel
                      </button>
                    )}

                    {appointment.status === "IN_CONSULTATION" &&
                      "With Physician"}

                    {appointment.status === "COMPLETED" &&
                      "Ready for Billing"}

                    {appointment.status === "CANCELLED" && "Cancelled"}
                  </div>
                </td>
              </tr>
            ))}

            {appointments.length === 0 && (
              <tr>
                <td colSpan={6}>No appointments found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
