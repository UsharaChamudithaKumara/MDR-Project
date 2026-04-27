import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ConfigProvider } from "antd";
import MDRList from "./pages/MDRList";
import CreateMDR from "./pages/CreateMDR";
import ViewMDR from "./pages/ViewMDR";
import UOMManagement from "./pages/UOMManagement";
import Dashboard from "./pages/Dashboard";
import Layout from "./components/Layout";
import AdminLayout from "./components/AdminLayout";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import UserManagement from "./pages/UserManagement";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import ProtectedRoute from "./components/ProtectedRoute";
import Reports from "./pages/Reports";
import ProfilePage from "./pages/ProfilePage";

function App() {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#344D67',
          colorInfo: '#217346',
          borderRadius: 8,
          fontFamily: '"Inter", "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
          colorBgContainer: '#ffffff',
          colorTextBase: '#1f2937',
        },
        components: {
          Button: {
            controlHeight: 40,
            controlHeightLG: 48,
          },
          Card: {
            boxShadowTertiary: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
          },
          Table: {
            headerBg: '#f8fafc',
            headerColor: '#475569',
            rowHoverBg: '#f1f5f9',
          }
        }
      }}
    >
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          {/* Super Admin Area — completely separate */}
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute roles={["super_admin"]}>
                <AdminLayout>
                  <Routes>
                    <Route path="/" element={<AdminDashboard />} />
                    <Route path="/users" element={<AdminUsers />} />
                    <Route path="/profile" element={<ProfilePage />} />
                  </Routes>
                </AdminLayout>
              </ProtectedRoute>
            }
          />

          {/* Main MDR System — for users and admins */}
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <Layout>
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/mdr-list" element={<MDRList />} />
                    <Route path="/create" element={<CreateMDR />} />
                    <Route path="/mdr/:id" element={<ViewMDR />} />
                    <Route path="/uom" element={<UOMManagement />} />
                    <Route path="/reports" element={<Reports />} />
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="/users" element={
                      <ProtectedRoute roles={['super_admin']}>
                        <UserManagement />
                      </ProtectedRoute>
                    } />
                  </Routes>
                </Layout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </ConfigProvider>
  );
}

export default App;
