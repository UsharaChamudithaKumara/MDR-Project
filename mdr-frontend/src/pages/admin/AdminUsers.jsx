import React, { useState, useEffect, useCallback } from "react";
import { Table, Button, Tag, Space, Modal, Input, message, Popconfirm, Tabs } from "antd";
import {
  UserOutlined,
  KeyOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  SafetyOutlined,
} from "@ant-design/icons";
import AuthService from "../../services/AuthService";

const { TabPane } = Tabs;

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [selectedUser, setSelectedUser] = useState(null);
  const [newPassword, setNewPassword] = useState("");
  const [isPasswordModalVisible, setIsPasswordModalVisible] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await AuthService.getAllUsers();
      setUsers(response.data);
    } catch {
      message.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleUpdateStatus = async (id, status) => {
    try {
      await AuthService.updateStatus(id, status);
      message.success(`User updated to ${status}`);
      fetchUsers();
    } catch (error) {
      message.error(error.response?.data?.message || `Failed to update status`);
    }
  };

  const handleChangePassword = async () => {
    if (!newPassword) return message.warning("Please enter a new password");
    try {
      await AuthService.changePassword(selectedUser.id, newPassword);
      message.success("Password updated successfully");
      setIsPasswordModalVisible(false);
      setNewPassword("");
    } catch {
      message.error("Failed to change password");
    }
  };

  const handleDeleteUser = async (id) => {
    try {
      await AuthService.deleteUser(id);
      message.success("User deleted successfully");
      fetchUsers();
    } catch (error) {
      message.error(error.response?.data?.message || "Deletion failed");
    }
  };

  const filteredUsers = activeTab === "all"
    ? users.filter(u => u.role !== "super_admin")
    : users.filter(u => u.role !== "super_admin" && u.status === activeTab);

  const columns = [
    {
      title: "USER DETAILS",
      dataIndex: "username",
      width: 300,
      render: (text, record) => (
        <Space size="middle">
          <div style={{
            width: 42, height: 42, borderRadius: "12px",
            background: record.role === "admin"
              ? "linear-gradient(135deg, #1e293b, #334155)"
              : "linear-gradient(135deg, #0f172a, #1e293b)",
            border: `1px solid ${record.role === "admin" ? "#FF0000" : "#ffffff"}20`,
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#fff", fontWeight: 800, fontSize: "16px", flexShrink: 0,
            boxShadow: "0 4px 10px rgba(0,0,0,0.3)"
          }}>
            {text?.[0]?.toUpperCase()}
          </div>
          <div>
            <div style={{ fontWeight: 700, color: "#f8fafc", fontSize: "15px", letterSpacing: "0.2px" }}>{text}</div>
            <div style={{ color: "#64748b", fontSize: "12px", fontWeight: 500 }}>{record.email}</div>
          </div>
        </Space>
      ),
    },
    {
      title: "ROLE",
      dataIndex: "role",
      width: 120,
      render: (role) => (
        <Tag
          style={{ 
            borderRadius: "6px", 
            fontWeight: 800, 
            fontSize: "10px", 
            padding: "2px 10px", 
            border: "none",
            background: role === "admin" ? "rgba(255, 0, 0, 0.15)" : "rgba(51, 65, 85, 0.4)",
            color: role === "admin" ? "#FF4D4F" : "#94a3b8",
            textTransform: "uppercase",
            letterSpacing: "1px"
          }}
        >
          {role}
        </Tag>
      ),
    },
    {
      title: "STATUS",
      dataIndex: "status",
      width: 150,
      render: (status) => {
        const config = {
          approved: { color: "rgba(16, 185, 129, 0.1)", textColor: "#10b981", icon: <CheckCircleOutlined />, label: "Approved" },
          pending:  { color: "rgba(245, 158, 11, 0.1)", textColor: "#f59e0b", icon: <ClockCircleOutlined />, label: "Pending" },
          rejected: { color: "rgba(239, 68, 68, 0.1)", textColor: "#ef4444", icon: <CloseCircleOutlined />, label: "Rejected" },
        };
        const cfg = config[status] || config.pending;
        return (
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            background: cfg.color, color: cfg.textColor,
            borderRadius: "30px", padding: "4px 14px", fontSize: "11px", fontWeight: 700,
            border: `1px solid ${cfg.textColor}20`
          }}>
            {cfg.icon} {cfg.label.toUpperCase()}
          </span>
        );
      },
    },
    {
      title: "JOINED",
      dataIndex: "created_at",
      width: 160,
      render: (val) => (
        <div style={{ color: "#94a3b8", fontSize: "13px", fontWeight: 500 }}>
          {val ? new Date(val).toLocaleDateString("en-GB", { year: "numeric", month: "short", day: "numeric" }) : "—"}
        </div>
      ),
    },
    {
      title: "ACTIONS",
      key: "actions",
      render: (_, record) => (
        <Space size="middle" wrap>
          {record.status === "pending" && (
            <>
              <Button
                size="small" type="primary"
                style={{ background: "linear-gradient(135deg, #10b981, #059669)", border: "none", borderRadius: 8, fontWeight: 700, height: 32 }}
                icon={<CheckCircleOutlined />}
                onClick={() => handleUpdateStatus(record.id, "approved")}
              >Approve</Button>
              <Button
                size="small" danger icon={<CloseCircleOutlined />}
                style={{ borderRadius: 8, height: 32, fontWeight: 600 }}
                onClick={() => handleUpdateStatus(record.id, "rejected")}
              >Reject</Button>
            </>
          )}
          {record.status === "rejected" && (
            <Button
              size="small" icon={<CheckCircleOutlined />}
              style={{ borderRadius: 8, background: "rgba(16, 185, 129, 0.1)", border: "1px solid #10b981", color: "#10b981", fontWeight: 700, height: 32 }}
              onClick={() => handleUpdateStatus(record.id, "approved")}
            >Approve</Button>
          )}
          {record.status === "approved" && (
            <Button
              size="small" icon={<ClockCircleOutlined />}
              style={{ borderRadius: 8, background: "rgba(245, 158, 11, 0.1)", border: "1px solid #f59e0b", color: "#f59e0b", fontWeight: 600, height: 32 }}
              onClick={() => handleUpdateStatus(record.id, "pending")}
            >Set Pending</Button>
          )}
          
          <Button
            size="small" icon={<KeyOutlined />}
            style={{ borderRadius: 8, height: 32, background: "rgba(255, 255, 255, 0.05)", border: "1px solid rgba(255, 255, 255, 0.1)", color: "#e2e8f0" }}
            onClick={() => { setSelectedUser(record); setIsPasswordModalVisible(true); }}
          >Password</Button>

          <Popconfirm
            title="Permanently delete this user?"
            onConfirm={() => handleDeleteUser(record.id)}
            okText="Delete" cancelText="Cancel"
            okButtonProps={{ danger: true, style: { borderRadius: 6 } }}
            cancelButtonProps={{ style: { borderRadius: 6 } }}
          >
            <Button
              size="small" danger icon={<DeleteOutlined />}
              style={{ borderRadius: 8, height: 32 }}
            >Delete</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ animation: "fadeIn 0.5s ease-out" }}>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .admin-users-table .ant-table { background: transparent !important; }
        .admin-users-table .ant-table-container { background: transparent !important; }
        .admin-users-table .ant-table-thead > tr > th { 
          background: rgba(30, 41, 59, 0.6) !important; 
          border-bottom: 2px solid rgba(255, 255, 255, 0.05) !important;
          color: #94a3b8 !important;
          font-weight: 800 !important;
          text-transform: uppercase !important;
          font-size: 11px !important;
          letter-spacing: 1.5px !important;
          padding: 20px 24px !important;
        }
        .admin-users-table .ant-table-tbody > tr > td { 
          border-bottom: 1px solid rgba(255, 255, 255, 0.05) !important; 
          background: transparent !important;
          padding: 16px 24px !important;
        }
        .admin-users-table .ant-table-tbody > tr:hover > td { background: rgba(255, 255, 255, 0.03) !important; }
        .admin-users-table .ant-tabs-nav { padding: 0 32px !important; border-bottom: 1px solid rgba(255, 255, 255, 0.05) !important; margin-bottom: 0 !important; background: rgba(30, 41, 59, 0.3); }
        .admin-users-table .ant-tabs-tab { color: #64748b !important; padding: 18px 0 !important; margin-right: 32px !important; font-weight: 600 !important; }
        .admin-users-table .ant-tabs-tab-active .ant-tabs-tab-btn { color: #FF0000 !important; font-weight: 800 !important; }
        .admin-users-table .ant-tabs-ink-bar { background: #FF0000 !important; height: 3px !important; }
        .admin-users-table .ant-pagination { padding: 24px !important; margin: 0 !important; }
        .admin-users-table .ant-pagination-item { background: rgba(255, 255, 255, 0.05) !important; border-color: rgba(255, 255, 255, 0.1) !important; border-radius: 8px !important; }
        .admin-users-table .ant-pagination-item a { color: #94a3b8 !important; }
        .admin-users-table .ant-pagination-item-active { border-color: #FF0000 !important; background: rgba(255, 0, 0, 0.1) !important; }
        .admin-users-table .ant-pagination-item-active a { color: #FF0000 !important; }
        .admin-users-table .ant-pagination-prev .ant-pagination-item-link, 
        .admin-users-table .ant-pagination-next .ant-pagination-item-link { background: rgba(255, 255, 255, 0.05) !important; color: #94a3b8 !important; border-color: rgba(255, 255, 255, 0.1) !important; border-radius: 8px !important; }
        .admin-users-table .ant-table-placeholder { background: transparent !important; border: none !important; }
        .admin-users-table .ant-table-placeholder:hover > td { background: transparent !important; }
      `}</style>

      <div style={{ marginBottom: 32 }}>
        <h1 style={{ color: "#ffffff", fontWeight: 900, fontSize: "36px", margin: 0, letterSpacing: "-1px" }}>System Accounts</h1>
        <p style={{ color: "#64748b", margin: "4px 0 0", fontSize: "15px", fontWeight: 500 }}>Control user permissions, verify security roles, and manage access requests.</p>
      </div>

      <div style={{
        background: "rgba(15, 23, 42, 0.4)",
        border: "1px solid rgba(255, 255, 255, 0.05)",
        borderRadius: 24,
        overflow: "hidden",
        backdropFilter: "blur(20px)",
        boxShadow: "0 20px 50px rgba(0,0,0,0.3)"
      }}>
        <div className="admin-users-table">
          <Tabs activeKey={activeTab} onChange={setActiveTab}>
            <TabPane tab="ALL ACCOUNTS" key="all" />
            <TabPane tab="⏳ PENDING" key="pending" />
            <TabPane tab="✅ APPROVED" key="approved" />
            <TabPane tab="❌ REJECTED" key="rejected" />
          </Tabs>

          <Table
            columns={columns}
            dataSource={filteredUsers}
            rowKey="id"
            loading={loading}
            pagination={{ pageSize: 12, showSizeChanger: false, position: ['bottomCenter'] }}
          />
        </div>
      </div>

      <Modal
        title={
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <KeyOutlined style={{ color: "#FF0000" }} />
            <span style={{ fontWeight: 800 }}>RESET USER PASSWORD</span>
          </div>
        }
        open={isPasswordModalVisible}
        onOk={handleChangePassword}
        onCancel={() => { setIsPasswordModalVisible(false); setNewPassword(""); }}
        okText="Update Password"
        okButtonProps={{ 
          style: { background: "linear-gradient(135deg, #FF0000, #CC0000)", border: "none", borderRadius: 8, height: 40, fontWeight: 700 } 
        }}
        cancelButtonProps={{ style: { borderRadius: 8, height: 40 } }}
        centered
      >
        <div style={{ padding: "10px 0" }}>
          <p style={{ color: "#64748b", fontSize: "13px", marginBottom: "16px" }}>
            Updating password for <strong style={{ color: "#334155" }}>{selectedUser?.username}</strong> ({selectedUser?.email})
          </p>
          <Input.Password
            size="large"
            prefix={<KeyOutlined style={{ color: "#94a3b8" }} />}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Enter secure new password"
            style={{ borderRadius: 10 }}
          />
        </div>
      </Modal>
    </div>
  );
}
