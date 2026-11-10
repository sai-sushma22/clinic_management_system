
import { useEffect, useState } from "react";
import api from "../../services/api";

interface Field {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
}

interface Props {
  title: string;
  endpoint: string;
  createEndpoint?: string;
  fields?: Field[];
  create?: boolean;
  action?: (id: string) => Promise<void>;
}

export default function DataPage({
  title,
  endpoint,
  createEndpoint,
  fields = [],
  create = false,
  action,
}: Props) {
  const [data, setData] = useState<any[]>([]);
  const [form, setForm] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    try {
      setLoading(true);
      const response = await api.get(endpoint);
      const result = response.data.data ?? response.data;
      setData(Array.isArray(result) ? result : []);
      setError("");
    } catch (err: any) {
      setError(err.response?.data?.message || "Unable to load records");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [endpoint]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const payload = Object.fromEntries(
        Object.entries(form).filter(([, value]) => value !== "")
        .map(([key, value]) => {
      if (key === "date" && value) {
        return [key, new Date(value).toISOString()];
      }

      return [key, value];
    })
      );

      await api.post(createEndpoint || endpoint, payload);

      setForm({});
      await load();

      alert("Saved successfully");
    } catch (err: any) {
      console.error("Save error:", err.response?.data || err);

      alert(
        err.response?.data?.message ||
          JSON.stringify(err.response?.data) ||
          "Unable to save record"
      );
    }
  };

  return (
    <div>
      <h1>{title}</h1>

      {create && (
        <form className="data-form" onSubmit={submit}>
          {fields.map((field) => (
            <div key={field.name}>
              <label>{field.label}</label>
              <input
                type={field.type || "text"}
                value={form[field.name] || ""}
                required={field.required}
                onChange={(e) =>
                  setForm({ ...form, [field.name]: e.target.value })
                }
              />
            </div>
          ))}
          <button type="submit">Save</button>
        </form>
      )}

      {error && <p className="error">{error}</p>}
      {loading && <p>Loading...</p>}

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Database ID</th>
              <th>Details</th>
              <th>Record</th>
              {action && <th>Action</th>}
            </tr>
          </thead>

          <tbody>
            {data.map((item) => (
              <tr key={item.id}>
                <td>
                  <span style={{ fontSize: "12px", wordBreak: "break-all" }}>
                    {item.id}
                  </span>
                </td>

                <td>
                  {item.name ||
                    item.studyName ||
                    item.patientCode ||
                    item.id}
                </td>

                <td>
                  {Object.entries(item)
                    .filter(([key]) =>
                      !["id", "createdAt", "updatedAt"].includes(key)
                    )
                    .map(([key, value]) => (
                      <div key={key}>
                        <strong>{key}:</strong>{" "}
                        {typeof value === "object"
                          ? JSON.stringify(value)
                          : String(value ?? "-")}
                      </div>
                    ))}
                </td>

                {action && (
                  <td>
                    <button onClick={() => action(item.id)}>
                      Checkout
                    </button>
                  </td>
                )}
              </tr>
            ))}

            {!loading && data.length === 0 && (
              <tr>
                <td colSpan={action ? 4 : 3}>No records found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
