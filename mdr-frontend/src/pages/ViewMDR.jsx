import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

function ViewMDR() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = () => {
    axios
      .get(`http://localhost:5000/mdr/${id}`)
      .then((res) => setData(res.data))
      .catch((err) => console.error(err));
  };

  const updateStatus = async (newStatus) => {
    try {
      await axios.put(`http://localhost:5000/update-status/${id}`, {
        status: newStatus,
      });
      fetchData();
    } catch (error) {
      console.error(error);
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "Open":
        return "bg-yellow-100 text-yellow-700";
      case "Closed":
        return "bg-red-100 text-red-700";
      case "Complete":
        return "bg-green-100 text-green-700";
      default:
        return "bg-blue-100 text-blue-700";
    }
  };

  if (!data) return <div className="p-8">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto bg-white shadow-xl rounded-2xl p-8">

        {/* Header Section */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">
            MDR Details - {data.header.mdr_number}
          </h2>

          <button
            onClick={() => navigate("/")}
            className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-lg"
          >
            ← Back
          </button>
        </div>

        {/* Header Info */}
        <div className="grid grid-cols-2 gap-6 mb-8">
          <div>
            <p><strong>Supplier:</strong> {data.header.supplier_name}</p>
            <p><strong>PO Number:</strong> {data.header.po_number}</p>
          </div>

          <div>
            <p>
              <strong>Date:</strong>{" "}
              {new Date(data.header.mdr_date).toLocaleDateString()}
            </p>

            <p className="flex items-center gap-3">
              <strong>Status:</strong>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusStyle(
                  data.details?.status
                )}`}
              >
                {data.details?.status}
              </span>
            </p>

            {/* Status Dropdown */}
            <select
              className="mt-2 border rounded px-3 py-1"
              value={data.details?.status}
              onChange={(e) => updateStatus(e.target.value)}
            >
              <option value="Open">Open</option>
              <option value="Closed">Closed</option>
              <option value="Complete">Complete</option>
            </select>
          </div>
        </div>

        {/* Items Table */}
        <h3 className="text-xl font-semibold mb-4">Items</h3>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-200 text-left">
                <th className="p-4">Description</th>
                <th className="p-4">PO Qty</th>
                <th className="p-4">Received</th>
                <th className="p-4">Rejected</th>
                <th className="p-4">Reason</th>
              </tr>
            </thead>

            <tbody>
              {data.items.map((item) => (
                <tr key={item.id} className="border-b hover:bg-gray-50">
                  <td className="p-4">{item.item_description}</td>
                  <td className="p-4">{item.po_quantity}</td>
                  <td className="p-4">{item.received_quantity}</td>
                  <td className="p-4">{item.rejected_quantity}</td>
                  <td className="p-4">{item.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}

export default ViewMDR;
