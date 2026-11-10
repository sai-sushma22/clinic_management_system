import { useState } from "react";
import api from "../../services/api";
import DataPage from "../../components/common/DataPage";

export default function PatientList() {
  const [search, setSearch] = useState("");

  return (
    <>
      <div className="page-heading">
        <h1>Patients</h1>
        <input
          placeholder="Search patients..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <DataPage
        title="Patient Records"
        endpoint={`/patients?search=${encodeURIComponent(search)}&limit=100`}
        create
        fields={[
          { name: "firstName", label: "First Name", required: true },
          { name: "lastName", label: "Last Name", required: true },
          { name: "dateOfBirth", label: "Date of Birth", type: "date" },
          { name: "gender", label: "Gender", required: true },
          { name: "phone", label: "Phone", required: true },
          { name: "email", label: "Email", type: "email" },
          { name: "address", label: "Address" },
        ]}
      />
    </>
  );
}