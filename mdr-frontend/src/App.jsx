import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ConfigProvider } from "antd";
import MDRList from "./pages/MDRList";
import CreateMDR from "./pages/CreateMDR";
import ViewMDR from "./pages/ViewMDR";
import UOMManagement from "./pages/UOMManagement";
import Dashboard from "./pages/Dashboard";
import Layout from "./components/Layout";

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
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/mdr-list" element={<MDRList />} />
            <Route path="/create" element={<CreateMDR />} />
            <Route path="/mdr/:id" element={<ViewMDR />} />
            <Route path="/uom" element={<UOMManagement />} />
          </Routes>
        </Layout>
      </Router>
    </ConfigProvider>
  );
}

export default App;
