import React, { useState, useEffect, useCallback } from "react";
import { Button, Table, Tag, Space, message, Card } from "antd";
import {
  UserOutlined,
  TeamOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  ArrowRightOutlined,
  SafetyOutlined,
} from "@ant-design/icons";
import AuthService from "../../services/AuthService";
import { useNavigate } from "react-router-dom";

const StatCard = ({ title, value, icon, gradient, accentColor, sub }) => (
  <div style={{
    background: "rgba(30, 41, 59, 0.7)",
    border: `1px solid ${accentColor}30`,
    borderRadius: 20,
    padding: "24px 28px",
    position: "relative",
    overflow: "hidden",
    backdropFilter: "blur(12px)",
    flex: 1,
    minWidth: "240px",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    cursor: "default",
    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.3)",
  }}
  onMouseEnter={e => {
    e.currentTarget.style.transform = "translateY(-5px)";
    e.currentTarget.style.boxShadow = `0 20px 40px ${accentColor}25`;
    e.currentTarget.style.borderColor = accentColor;
  }}
  onMouseLeave={e => {
    e.currentTarget.style.transform = "translateY(0)";
    e.currentTarget.style.boxShadow = "0 10px 25px -5px rgba(0, 0, 0, 0.3)";
    e.currentTarget.style.borderColor = `${accentColor}30`;
  }}
  >
    {/* Decorative blur element */}
    <div style={{
      position: "absolute",
      top: -30,
      right: -30,
      width: 120,
      height: 120,
      background: `radial-gradient(circle, ${accentColor}25 0%, transparent 70%)`,
      borderRadius: "50%",
    }} />

    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", position: "relative", zIndex: 1 }}>
      <div>
        <p style={{ color: "#94a3b8", fontSize: "12px", fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase", margin: 0, opacity: 0.8 }}>
          {title}
        </p>
        <p style={{ color: "#ffffff", fontSize: "42px", fontWeight: 800, margin: "10px 0 4px", lineHeight: 1, letterSpacing: "-1px" }}>
          {value ?? "0"}
        </p>
        {sub && <p style={{ color: "#64748b", fontSize: "13px", fontWeight: 500, margin: 0 }}>{sub}</p>}
      </div>
      <div style={{
        width: 54,
        height: 54,
        borderRadius: 16,
        background: gradient,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "24px",
        color: "#ffffff",
        flexShrink: 0,
        boxShadow: `0 8px 20px ${accentColor}40`,
      }}>
        {icon}
      </div>
    </div>
  </div>
);

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const currentUser = AuthService.getCurrentUser();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes] = await Promise.all([
        AuthService.getUserStats(),
        AuthService.getAllUsers(),
      ]);
      setStats(statsRes.data);
      setPendingUsers(usersRes.data.filter(u => u.status === "pending"));
    } catch {
      message.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleUpdateStatus = async (id, status) => {
    try {
      await AuthService.updateStatus(id, status);
      message.success(`User updated to ${status}`);
      fetchData();
    } catch (error) {
      message.error(error.response?.data?.message || "Action failed");
    }
  };

  const pendingColumns = [
    {
      title: <span style={{ color: "#94a3b8", fontWeight: 700, textTransform: "uppercase", fontSize: "11px", letterSpacing: "1px" }}>User Details</span>,
      dataIndex: "username",
      render: (text, record) => (
        <Space size="middle">
          <div style={{
            width: 40,
            height: 40,
            borderRadius: "12px",
            background: record.role === "admin"
              ? "linear-gradient(135deg, #1e293b, #334155)"
              : "linear-gradient(135deg, #0f172a, #1e293b)",
            border: `1px solid ${record.role === "admin" ? "#FF4D4F" : "#FF0000"}40`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            fontWeight: 800,
            fontSize: "14px",
            shadow: "0 4px 10px rgba(0,0,0,0.3)"
          }}>
            {text?.[0]?.toUpperCase()}
          </div>
          <div>
            <div style={{ fontWeight: 700, color: "#f1f5f9", fontSize: "15px" }}>{text}</div>
            <div style={{ color: "#64748b", fontSize: "12px", fontWeight: 500 }}>{record.email}</div>
          </div>
        </Space>
      ),
    },
    {
      title: <span style={{ color: "#94a3b8", fontWeight: 700, textTransform: "uppercase", fontSize: "11px", letterSpacing: "1px" }}>Role</span>,
      dataIndex: "role",
      width: 120,
      render: (role) => (
        <Tag color={role === "admin" ? "volcano" : "blue"}
          style={{ borderRadius: "6px", fontWeight: 700, border: "none", padding: "2px 10px", textTransform: "uppercase", fontSize: "10px" }}>
          {role}
        </Tag>
      ),
    },
    {
      title: <span style={{ color: "#94a3b8", fontWeight: 700, textTransform: "uppercase", fontSize: "11px", letterSpacing: "1px" }}>Requested On</span>,
      dataIndex: "created_at",
      width: 160,
      render: (val) => (
        <div style={{ color: "#94a3b8", fontSize: "13px", fontWeight: 500 }}>
          {val ? new Date(val).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—"}
        </div>
      ),
    },
    {
      title: <span style={{ color: "#94a3b8", fontWeight: 700, textTransform: "uppercase", fontSize: "11px", letterSpacing: "1px" }}>Quick Actions</span>,
      width: 220,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="primary"
            icon={<CheckCircleOutlined />}
            style={{ 
              background: "linear-gradient(135deg, #FF0000, #CC0000)", 
              border: "none", 
              borderRadius: "8px",
              fontWeight: 700,
              fontSize: "12px",
              height: "34px",
              boxShadow: "0 4px 10px rgba(255, 0, 0, 0.2)"
            }}
            onClick={() => handleUpdateStatus(record.id, "approved")}
          >
            Approve
          </Button>
          <Button
            danger
            icon={<CloseCircleOutlined />}
            style={{ 
              borderRadius: "8px",
              fontWeight: 600,
              fontSize: "12px",
              height: "34px",
              border: "1px solid rgba(255, 77, 79, 0.3)",
              background: "rgba(255, 77, 79, 0.05)"
            }}
            onClick={() => handleUpdateStatus(record.id, "rejected")}
          >
            Reject
          </Button>
        </Space>
      ),
    },
  ];

  const now = new Date();
  const greeting = now.getHours() < 12 ? "Good Morning" : now.getHours() < 18 ? "Good Afternoon" : "Good Evening";

  return (
    <div style={{ animation: "fadeIn 0.5s ease-out" }}>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .admin-table .ant-table { background: transparent !important; color: #fff !important; }
        .admin-table .ant-table-container { background: transparent !important; }
        .admin-table .ant-table-content { background: transparent !important; }
        .admin-table .ant-table-thead > tr > th { 
          background: rgba(30, 41, 59, 0.6) !important; 
          border-bottom: 1px solid rgba(255, 255, 255, 0.08) !important;
          color: #94a3b8 !important;
        }
        .admin-table .ant-table-tbody > tr > td { 
          border-bottom: 1px solid rgba(255, 255, 255, 0.05) !important; 
          background: transparent !important;
          color: #f1f5f9 !important;
        }
        .admin-table .ant-table-tbody > tr:hover > td { 
          background: rgba(255, 255, 255, 0.03) !important; 
        }
        .admin-table .ant-empty-description { color: #64748b !important; }
        .admin-table .ant-table-placeholder { background: transparent !important; border: none !important; }
        .admin-table .ant-table-placeholder:hover > td { background: transparent !important; }
      `}</style>

      {/* Hero Section */}
      <div style={{ marginBottom: 40 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
           <SafetyOutlined style={{ color: "#FF0000", fontSize: "20px" }} />
           <span style={{ color: "#FF0000", fontWeight: 800, fontSize: "12px", letterSpacing: "3px", textTransform: "uppercase" }}>
             {greeting}
           </span>
        </div>
        <h1 style={{ color: "#ffffff", fontWeight: 900, fontSize: "42px", margin: "0 0 10px", letterSpacing: "-1.5px" }}>
          Welcome, <span style={{ background: "linear-gradient(to right, #ffffff, #94a3b8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{currentUser?.username}</span>
        </h1>
        <p style={{ color: "#94a3b8", margin: 0, fontSize: "16px", fontWeight: 500, maxWidth: "600px" }}>
           System Overview: Manage users, approve accounts, and maintain security certificates.
        </p>
      </div>

      {/* Dashboard Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24, marginBottom: 40 }}>
        <StatCard
          title="Total System Users"
          value={stats?.total}
          sub="Verified accounts in database"
          icon={<TeamOutlined />}
          gradient="linear-gradient(135deg, #1e293b, #334155)"
          accentColor="#ffffff"
        />
        <StatCard
          title="Awaiting Approval"
          value={stats?.pending}
          sub="Requires immediate attention"
          icon={<ClockCircleOutlined />}
          gradient="linear-gradient(135deg, #FF0000, #CC0000)"
          accentColor="#FF0000"
        />
        <StatCard
          title="Active Admins"
          value={stats?.admins}
          sub="System managers authorized"
          icon={<SafetyOutlined />}
          gradient="linear-gradient(45deg, #1e293b, #FF0000)"
          accentColor="#FF0000"
        />
        <StatCard
          title="Access Requests"
          value={stats?.users}
          sub="Regular workforce accounts"
          icon={<UserOutlined />}
          gradient="linear-gradient(135deg, #0f172a, #1e293b)"
          accentColor="#94a3b8"
        />
      </div>

      {/* Main Panel */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 30, alignItems: "start" }}>
        
        {/* Pending Approvals Table */}
        <div style={{
          background: "rgba(15, 23, 42, 0.4)",
          border: "1px solid rgba(255, 255, 255, 0.05)",
          borderRadius: 24,
          overflow: "hidden",
          backdropFilter: "blur(20px)",
          boxShadow: "0 20px 50px rgba(0,0,0,0.2)"
        }}>
          <div style={{
            padding: "24px 32px",
            borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "rgba(30, 41, 59, 0.2)"
          }}>
            <div>
              <h2 style={{ color: "#ffffff", fontWeight: 800, fontSize: "20px", margin: 0 }}>
                Pending Registration Requests
              </h2>
              <p style={{ color: "#64748b", fontSize: "13px", margin: "4px 0 0", fontWeight: 500 }}>
                New users waiting for system access authorization
              </p>
            </div>
            {pendingUsers.length > 0 && (
              <div style={{
                background: "#FF0000",
                color: "#fff",
                borderRadius: "30px",
                padding: "4px 16px",
                fontSize: "12px",
                fontWeight: 900,
                boxShadow: "0 0 20px rgba(255, 0, 0, 0.3)",
                animation: "pulse 2s infinite"
              }}>
                {pendingUsers.length} NEW
              </div>
            )}
          </div>

          <div style={{ padding: "0" }} className="admin-table">
            <Table
              columns={pendingColumns}
              dataSource={pendingUsers}
              rowKey="id"
              loading={loading}
              pagination={false}
              locale={{ emptyText: (
                <div style={{ padding: "60px 0", textAlign: "center" }}>
                   <div style={{ 
                     width: 60, height: 60, borderRadius: "50%", background: "rgba(16, 185, 129, 0.1)", 
                     display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" 
                   }}>
                      <CheckCircleOutlined style={{ fontSize: "28px", color: "#10b981" }} />
                   </div>
                   <h3 style={{ color: "#f1f5f9", fontWeight: 700, margin: 0 }}>Zero Pending Requests</h3>
                   <p style={{ color: "#64748b", margin: "4px 0 0" }}>All user accounts have been processed.</p>
                </div>
              )}}
            />
          </div>
        </div>

        {/* Action Sidebar */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{
            background: "linear-gradient(135deg, #1e293b, #0f172a)",
            border: "1px solid #FF000040",
            borderRadius: 24,
            padding: "28px",
            boxShadow: "0 15px 35px rgba(255, 0, 0, 0.05)"
          }}>
             <h3 style={{ color: "#fff", fontWeight: 800, fontSize: "18px", marginBottom: "16px" }}>Manage System</h3>
             <p style={{ color: "#94a3b8", fontSize: "13px", lineHeight: "1.6", marginBottom: "24px" }}>
                Full access to user credentials, password resets, and account termination procedures.
             </p>
             <Button
               block
               type="primary"
               size="large"
               icon={<TeamOutlined />}
               onClick={() => navigate("/admin/users")}
               style={{
                 height: "50px",
                 background: "linear-gradient(135deg, #FF0000, #990000)",
                 border: "none",
                 borderRadius: "12px",
                 fontWeight: 700,
                 display: "flex",
                 alignItems: "center",
                 justifyContent: "center",
                 gap: "10px",
                 boxShadow: "0 8px 20px rgba(255, 0, 0, 0.2)"
               }}
             >
               Go to User Management <ArrowRightOutlined />
             </Button>
          </div>

          <div style={{
            background: "rgba(30, 41, 59, 0.3)",
            border: "1px solid rgba(255, 255, 255, 0.05)",
            borderRadius: 24,
            padding: "24px",
          }}>
             <h4 style={{ color: "#f1f5f9", fontWeight: 700, fontSize: "15px", marginBottom: "8px" }}>Security Audit</h4>
             <p style={{ color: "#64748b", fontSize: "12px", margin: 0 }}>
               Last Login: {new Date().toLocaleString()} from {window.location.hostname}
             </p>
          </div>
        </div>

      </div>

      <style>{`
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(255, 0, 0, 0.4); }
          70% { box-shadow: 0 0 0 10px rgba(255, 0, 0, 0); }
          100% { box-shadow: 0 0 0 0 rgba(255, 0, 0, 0); }
        }
      `}</style>
    </div>
  );
}
