import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

function MDRList() {
  const [mdrs, setMdrs] = useState([]);

  useEffect(() => {
    axios
      .get("http://localhost:5000/mdr-list")
      .then((res) => setMdrs(res.data))
      .catch((err) => console.error(err));
  }, []);

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

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto bg-white shadow-xl rounded-2xl p-8">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-gray-800">
            Material Discrepancy Reports
          </h2>

          <Link
            to="/create"
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg transition"
          >
            + Create MDR
          </Link>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-200 text-left">
                <th className="p-4 font-semibold">ID</th>
                <th className="p-4 font-semibold">MDR Number</th>
                <th className="p-4 font-semibold">Supplier</th>
                <th className="p-4 font-semibold">Date</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold text-center">Total Items</th>
              </tr>
            </thead>

            <tbody>
              {mdrs.map((mdr) => (
                <tr
                  key={mdr.id}
                  className="border-b hover:bg-gray-50 transition"
                >
                  <td className="p-4">{mdr.id}</td>

                  {/* Clickable MDR Number */}
                  <td className="p-4 font-medium">
                    <Link
                      to={`/mdr/${mdr.id}`}
                      className="text-blue-600 hover:underline"
                    >
                      {mdr.mdr_number}
                    </Link>
                  </td>

                  <td className="p-4">{mdr.supplier_name}</td>

                  <td className="p-4">
                    {new Date(mdr.mdr_date).toLocaleDateString()}
                  </td>

                  <td className="p-4">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusStyle(
                        mdr.status
                      )}`}
                    >
                      {mdr.status}
                    </span>
                  </td>

                  <td className="p-4 text-center">
                    {mdr.total_items}
                  </td>
                </tr>
              ))}

              {mdrs.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center p-6 text-gray-500">
                    No MDR Records Found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default MDRList;
