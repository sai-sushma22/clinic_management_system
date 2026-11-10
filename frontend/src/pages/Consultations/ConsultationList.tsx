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
}

interface Vital {
  id: string;
  bloodPressure?: string;
  temperature?: number;
  pulse?: number;
  weight?: number;
  height?: number;
  oxygenLevel?: number;
  recordedAt: string;
}

interface Medicine {
  medicineName: string;
  dosage: string;
  frequency: string;
  duration: string;
}

const emptyMedicine: Medicine = {
  medicineName: "",
  dosage: "",
  frequency: "",
  duration: "",
};

export default function ConsultationList() {
  const { user } = useAuth();

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selected, setSelected] = useState<Appointment | null>(null);
  const [vitals, setVitals] = useState<Vital[]>([]);
  const [diagnosis, setDiagnosis] = useState("");
  const [notes, setNotes] = useState("");
  const [followUpRequired, setFollowUpRequired] = useState("NO");
  const [followUpDate, setFollowUpDate] = useState("");
  const [followUpInstructions, setFollowUpInstructions] = useState("");
  const [tests, setTests] = useState("");
  const [medicines, setMedicines] = useState<Medicine[]>([
    { ...emptyMedicine },
  ]);
  const [loading, setLoading] = useState(false);

  const loadAppointments = async () => {
    try {
      const response = await api.get(
        "/appointments?status=IN_CONSULTATION&limit=100"
      );
      const result = response.data.data ?? response.data;
      setAppointments(Array.isArray(result) ? result : []);
    } catch (error) {
      console.error("Unable to load physician queue", error);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, []);

  const openPatient = async (appointment: Appointment) => {
    setSelected(appointment);
    setVitals([]);
    try {
      const response = await api.get(
        `/vitals/patient/${appointment.patient.id}`
      );
      const result = response.data.data ?? response.data;
      setVitals(Array.isArray(result) ? result : []);
    } catch (error) {
      console.error("Unable to load patient vitals", error);
      alert("Unable to load this patient's vitals.");
    }
  };

  const updateMedicine = (
    index: number,
    field: keyof Medicine,
    value: string
  ) => {
    setMedicines((current) =>
      current.map((medicine, i) =>
        i === index ? { ...medicine, [field]: value } : medicine
      )
    );
  };

  const saveConsultation = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selected || !user?.id) {
      alert("Unable to identify the physician or patient.");
      return;
    }

    if (vitals.length === 0) {
      alert("The nurse must record vitals before consultation.");
      return;
    }

    try {
      setLoading(true);

      const consultationNotes = [
        notes,
        `Follow-up required: ${followUpRequired}`,
        followUpRequired === "YES" && followUpDate
          ? `Follow-up date: ${followUpDate}`
          : "",
        followUpInstructions
          ? `Follow-up instructions: ${followUpInstructions}`
          : "",
        tests ? `Tests required: ${tests}` : "",
      ]
        .filter(Boolean)
        .join("\n");

      // Uses existing consultation API and existing schema fields.
      const consultationResponse = await api.post("/consultations", {
        patientId: selected.patient.id,
        physicianId: user.id,
        diagnosis,
        notes: consultationNotes,
      });

      const consultation =
        consultationResponse.data.data ?? consultationResponse.data;

      if (!consultation?.id) {
        throw new Error("Consultation was saved but no consultation ID was returned.");
      }

      // Save each medicine as a separate prescription for this consultation.
      const validMedicines = medicines.filter(
        (medicine) =>
          medicine.medicineName.trim() &&
          medicine.dosage.trim() &&
          medicine.frequency.trim()
      );

      for (const medicine of validMedicines) {
        await api.post("/prescriptions", {
          consultationId: consultation.id,
          medicineName: medicine.medicineName,
          dosage: medicine.dosage,
          frequency: medicine.frequency,
          duration: medicine.duration || undefined,
        });
      }

      // Mark the appointment completed only after consultation/prescriptions save.
      await api.put(`/appointments/${selected.id}/status`, {
        status: "COMPLETED",
      });

      alert("Consultation and prescriptions saved successfully.");

      setSelected(null);
      setDiagnosis("");
      setNotes("");
      setFollowUpRequired("NO");
      setFollowUpDate("");
      setFollowUpInstructions("");
      setTests("");
      setMedicines([{ ...emptyMedicine }]);

      await loadAppointments();
    } catch (error: any) {
      console.error("Consultation save error:", error.response?.data || error);
      alert(
        error.response?.data?.message ||
        error.message ||
        "Unable to save consultation."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <h1>Physician Dashboard</h1>
      <p>Patients waiting for physician consultation.</p>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Patient</th>
              <th>Patient ID</th>
              <th>Appointment</th>
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
                <td>
                  <button onClick={() => openPatient(appointment)}>
                    Review Patient
                  </button>
                </td>
              </tr>
            ))}

            {appointments.length === 0 && (
              <tr>
                <td colSpan={4}>No patients waiting for consultation.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {selected && (
        <div className="form-card">
          <h2>
            Consultation — {selected.patient.firstName}{" "}
            {selected.patient.lastName}
          </h2>

          <h3>Nurse Recorded Vitals</h3>

          {vitals.length === 0 ? (
            <p>No vitals have been recorded for this patient.</p>
          ) : (
            <div className="vitals-grid">
              {vitals.map((vital) => (
                <div className="vital-card" key={vital.id}>
                  <p><strong>Blood Pressure:</strong> {vital.bloodPressure || "-"}</p>
                  <p><strong>Temperature:</strong> {vital.temperature ?? "-"} °C</p>
                  <p><strong>Pulse:</strong> {vital.pulse ?? "-"} bpm</p>
                  <p><strong>Weight:</strong> {vital.weight ?? "-"} kg</p>
                  <p><strong>Height:</strong> {vital.height ?? "-"} cm</p>
                  <p><strong>Oxygen:</strong> {vital.oxygenLevel ?? "-"}%</p>
                  <small>
                    Recorded: {new Date(vital.recordedAt).toLocaleString("en-IN")}
                  </small>
                </div>
              ))}
            </div>
          )}

          <form className="data-form" onSubmit={saveConsultation}>
            <h3>Consultation Details</h3>

            <div>
              <label>Diagnosis</label>
              <textarea
                required
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
              />
            </div>

            <div>
              <label>Doctor Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            <h3>Follow-up</h3>

            <div>
              <label>Is another visit required?</label>
              <select
                value={followUpRequired}
                onChange={(e) => setFollowUpRequired(e.target.value)}
              >
                <option value="NO">No</option>
                <option value="YES">Yes</option>
              </select>
            </div>

            {followUpRequired === "YES" && (
              <>
                <div>
                  <label>Follow-up Date</label>
                  <input
                    type="date"
                    value={followUpDate}
                    onChange={(e) => setFollowUpDate(e.target.value)}
                  />
                </div>

                <div>
                  <label>Follow-up Instructions</label>
                  <textarea
                    value={followUpInstructions}
                    onChange={(e) =>
                      setFollowUpInstructions(e.target.value)
                    }
                  />
                </div>
              </>
            )}

            <div>
              <label>Tests Required</label>
              <textarea
                placeholder="Enter tests, if any"
                value={tests}
                onChange={(e) => setTests(e.target.value)}
              />
            </div>

            <h3>Prescriptions</h3>

            {medicines.map((medicine, index) => (
              <div className="medicine-card" key={index}>
                <h4>Medicine {index + 1}</h4>

                <div>
                  <label>Medicine Name</label>
                  <input
                    required={index === 0}
                    value={medicine.medicineName}
                    onChange={(e) =>
                      updateMedicine(index, "medicineName", e.target.value)
                    }
                  />
                </div>

                <div>
                  <label>Dosage</label>
                  <input
                    placeholder="e.g. 500 mg"
                    value={medicine.dosage}
                    onChange={(e) =>
                      updateMedicine(index, "dosage", e.target.value)
                    }
                  />
                </div>

                <div>
                  <label>Frequency</label>
                  <input
                    placeholder="e.g. Twice daily"
                    value={medicine.frequency}
                    onChange={(e) =>
                      updateMedicine(index, "frequency", e.target.value)
                    }
                  />
                </div>

                <div>
                  <label>Duration</label>
                  <input
                    placeholder="e.g. 5 days"
                    value={medicine.duration}
                    onChange={(e) =>
                      updateMedicine(index, "duration", e.target.value)
                    }
                  />
                </div>

                {medicines.length > 1 && (
                  <button
                    type="button"
                    className="button-danger"
                    onClick={() =>
                      setMedicines((current) =>
                        current.filter((_, i) => i !== index)
                      )
                    }
                  >
                    Remove Medicine
                  </button>
                )}
              </div>
            ))}

            <button
              type="button"
              className="button-secondary"
              onClick={() =>
                setMedicines((current) => [
                  ...current,
                  { ...emptyMedicine },
                ])
              }
            >
              + Add Another Medicine
            </button>

            <div className="form-actions">
              <button type="submit" disabled={loading}>
                {loading ? "Saving..." : "Save Consultation & Complete Visit"}
              </button>

              <button
                type="button"
                className="button-secondary"
                onClick={() => setSelected(null)}
              >
                Close
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}