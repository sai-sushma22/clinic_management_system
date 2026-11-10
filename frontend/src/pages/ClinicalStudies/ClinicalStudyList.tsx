import DataPage from "../../components/common/DataPage";

export default function ClinicalStudyList() {
  return (
    <DataPage
      title="Clinical Studies"
      endpoint="/clinical-studies"
      create
      fields={[
        { name: "studyName", label: "Study Name", required: true },
        { name: "patientName", label: "Patient Name", required: true },
        { name: "description", label: "Description" },
      ]}
    />
  );
}