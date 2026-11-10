import { useEffect, useState } from "react";
import api from "../../services/api";

interface Appointment {
  id: string;
  date: string;
  reason?: string;
  patient: {
    id: string;
    firstName: string;
    lastName: string;
    phone?: string;
    patientCode?: string;
  };
  physician?: {
    name: string;
  };
}

interface Consultation {
  id: string;
  diagnosis?: string;
  notes?: string;
  createdAt: string;
}

export default function CheckoutList() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selected, setSelected] = useState<Appointment | null>(null);
  const [consultation, setConsultation] = useState<Consultation | null>(null);
  const [fee, setFee] = useState("500");
  const [loading, setLoading] = useState(false);

  const loadAppointments = async () => {
    try {
      const response = await api.get(
        "/appointments?status=COMPLETED&limit=100"
      );
      const result = response.data.data ?? response.data;
      setAppointments(Array.isArray(result) ? result : []);
    } catch (error) {
      console.error("Unable to load completed appointments", error);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, []);

  const openBill = async (appointment: Appointment) => {
    setSelected(appointment);
    setConsultation(null);

    try {
      setLoading(true);

      const response = await api.get(
        `/consultations/patient/${appointment.patient.id}`
      );

      const result = response.data.data ?? response.data;
      const records = Array.isArray(result) ? result : [];

      if (records.length > 0) {
        // The API may return newest first or oldest first.
        const latest = [...records].sort(
          (a: Consultation, b: Consultation) =>
            new Date(b.createdAt).getTime() -
            new Date(a.createdAt).getTime()
        )[0];

        setConsultation(latest);
      }
    } catch (error) {
      console.error("Unable to load consultation", error);
      alert("Unable to load consultation details.");
    } finally {
      setLoading(false);
    }
  };

  const printBill = () => {
    if (!selected) return;

    if (!fee || Number(fee) < 0) {
      alert("Please enter a valid consultation charge.");
      return;
    }

    window.print();
  };

  return (
    <div className="page-container">
      <div className="no-print">
        <h1>Billing & Checkout</h1>
        <p>Generate bills for completed appointments.</p>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Patient</th>
                <th>Patient ID</th>
                <th>Doctor</th>
                <th>Appointment Date</th>
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
                  <td>{appointment.physician?.name || "-"}</td>
                  <td>
                    {new Date(appointment.date).toLocaleDateString("en-IN")}
                  </td>
                  <td>
                    <button onClick={() => openBill(appointment)}>
                      Generate Bill
                    </button>
                  </td>
                </tr>
              ))}

              {appointments.length === 0 && (
                <tr>
                  <td colSpan={5}>No completed appointments.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {loading && <p className="no-print">Loading bill details...</p>}

      {selected && (
        <div className="bill-preview">
          <div className="bill-header">
            <div>
              <h1>CLINIC</h1>
              <p>Patient Consultation Bill</p>
            </div>
            <div className="bill-number">
              <strong>Appointment ID</strong>
              <p>{selected.id}</p>
              <strong>Bill Date</strong>
              <p>{new Date().toLocaleDateString("en-IN")}</p>
            </div>
          </div>

          <hr />

          <h3>Patient Details</h3>
          <p>
            <strong>Name:</strong>{" "}
            {selected.patient.firstName} {selected.patient.lastName}
          </p>
          <p>
            <strong>Patient ID:</strong> {selected.patient.id}
          </p>
          <p>
            <strong>Phone:</strong> {selected.patient.phone || "-"}
          </p>
          <p>
            <strong>Doctor:</strong> {selected.physician?.name || "-"}
          </p>
          <p>
            <strong>Appointment Date:</strong>{" "}
            {new Date(selected.date).toLocaleString("en-IN")}
          </p>

          <hr />

          <h3>Consultation Summary</h3>
          <p>
            <strong>Diagnosis:</strong>{" "}
            {consultation?.diagnosis || "Not recorded"}
          </p>

          <p>
            <strong>Doctor's Notes:</strong>
          </p>
          <pre className="bill-notes">
            {consultation?.notes || "No additional instructions recorded."}
          </pre>

          <hr />

          <h3>Charges</h3>

          <div className="bill-charge-row">
            <span>Consultation Charges</span>
            <strong>₹{Number(fee || 0).toFixed(2)}</strong>
          </div>

          <div className="bill-total">
            <span>Total Amount</span>
            <strong>₹{Number(fee || 0).toFixed(2)}</strong>
          </div>

          <p className="bill-footer">
            This is a computer-generated bill.
          </p>

          <div className="no-print form-actions">
            <label>
              Consultation Charge (₹)
              <input
                type="number"
                min="0"
                value={fee}
                onChange={(e) => setFee(e.target.value)}
              />
            </label>

            <button onClick={printBill}>Print Bill</button>
            <button
              className="button-secondary"
              onClick={() => {
                setSelected(null);
                setConsultation(null);
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}