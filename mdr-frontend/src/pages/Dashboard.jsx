import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

function Dashboard() {
  const [mdrs, setMdrs] = useState([]);

  useEffect(() => {
    axios
      .get("http://localhost:5000/mdr-list")
      .then((res) => setMdrs(res.data))
      .catch((err) => console.error(err));
  }, []);

  const total = mdrs.length;
  const open = mdrs.filter((m) => m.status === "Open").length;
  const closed = mdrs.filter((m) => m.status === "Closed").length;
  const complete = mdrs.filter((m) => m.status === "Complete").length;

  const Card = ({ title, value, color }) => (
    <div className={`p-6 rounded-2xl shadow-lg text-white ${color}`}>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="text-3xl font-bold mt-2">{value}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">

        <h2 className="text-3xl font-bold mb-8 text-gray-800">
          Dashboard Overview
        </h2>

        {/* Summary Cards */}
        <div className="grid grid-cols-4 gap-6 mb-10">
          <Card title="Total MDRs" value={total} color="bg-blue-600" />
          <Card title="Open MDRs" value={open} color="bg-yellow-500" />
          <Card title="Closed MDRs" value={closed} color="bg-red-500" />
          <Card title="Complete MDRs" value={complete} color="bg-green-600" />
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-xl font-semibold mb-4">Quick Actions</h3>

          <div className="flex gap-6">
            <Link
              to="/create"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl transition"
            >
              + Create New MDR
            </Link>

            <Link
              to="/"
              className="bg-gray-800 hover:bg-gray-900 text-white px-6 py-3 rounded-xl transition"
            >
              View All MDRs
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Dashboard;
