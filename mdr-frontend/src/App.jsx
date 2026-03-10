import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import MDRList from "./pages/MDRList";
import CreateMDR from "./pages/CreateMDR";
import ViewMDR from "./pages/ViewMDR";
import Dashboard from "./pages/Dashboard";


function App() {
  return (
    <Router>
      {/* Navbar */}
      <div className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-800">
            MDR System
          </h1>

          <div className="space-x-6">
            <Link
              to="/"
              className="text-gray-700 hover:text-blue-600 font-medium"
            >
              MDR List
            </Link>

            <Link
              to="/create"
              className="text-gray-700 hover:text-blue-600 font-medium"
            >
              Create MDR
            </Link>
          </div>
        </div>
      </div>

      {/* Routes */}
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/mdr-list" element={<MDRList />} />
        <Route path="/create" element={<CreateMDR />} />
        <Route path="/mdr/:id" element={<ViewMDR />} />
      </Routes>
    </Router>
  );
}

export default App;
