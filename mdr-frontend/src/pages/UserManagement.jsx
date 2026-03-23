import React, { useState, useEffect } from "react";
import { Table, Button, Card, Typography, Space, Modal, Input, message, Tag, Popconfirm } from "antd";
import { UserOutlined, KeyOutlined, DeleteOutlined, UsergroupAddOutlined } from "@ant-design/icons";
import AuthService from "../services/AuthService";

const { Title, Text } = Typography;

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isPasswordModalVisible, setIsPasswordModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newPassword, setNewPassword] = useState("");

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await AuthService.getAllUsers();
      setUsers(response.data);
    } catch (error) {
      message.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDeleteUser = async (id) => {
    try {
      await AuthService.deleteUser(id);
      message.success("User deleted successfully");
      fetchUsers();
    } catch (error) {
      message.error(error.response?.data?.message || "Failed to delete user");
    }
  };

  const handleChangePassword = async () => {
    if (!newPassword) {
      return message.warning("Please enter a new password");
    }
    try {
      await AuthService.changePassword(selectedUser.id, newPassword);
      message.success("Password changed successfully");
      setIsPasswordModalVisible(false);
      setNewPassword("");
    } catch (error) {
      message.error("Failed to change password");
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await AuthService.updateStatus(id, status);
      message.success(`User ${status} successfully`);
      fetchUsers();
    } catch (error) {
      message.error(error.response?.data?.message || `Failed to ${status} user`);
    }
  };

  const columns = [
    {
      title: 'Username',
      dataIndex: 'username',
      key: 'username',
      render: (text) => <Space><UserOutlined /> {text}</Space>
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (role) => {
        let color = role === 'super_admin' ? 'volcano' : (role === 'admin' ? 'blue' : 'green');
        return <Tag color={color}>{role.toUpperCase()}</Tag>;
      }
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        let color = 'orange';
        if (status === 'approved') color = 'success';
        if (status === 'rejected') color = 'error';
        return <Tag color={color}>{status?.toUpperCase() || 'PENDING'}</Tag>;
      }
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="middle">
          {record.status === 'pending' && (
            <>
              <Button 
                type="primary" 
                size="small"
                style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
                onClick={() => handleUpdateStatus(record.id, 'approved')}
              >
                Approve
              </Button>
              <Button 
                danger 
                size="small"
                onClick={() => handleUpdateStatus(record.id, 'rejected')}
              >
                Reject
              </Button>
            </>
          )}
          {record.status === 'rejected' && (
            <Button 
              size="small"
              onClick={() => handleUpdateStatus(record.id, 'approved')}
            >
              Approve
            </Button>
          )}
          <Button 
            icon={<KeyOutlined />} 
            onClick={() => {
              setSelectedUser(record);
              setIsPasswordModalVisible(true);
            }}
          >
            Password
          </Button>
          <Popconfirm
            title="Are you sure you want to delete this user?"
            onConfirm={() => handleDeleteUser(record.id)}
            okText="Yes"
            cancelText="No"
            disabled={record.role === 'super_admin'}
          >
            <Button 
              danger 
              icon={<DeleteOutlined />} 
              disabled={record.role === 'super_admin'}
            >
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Card 
        title={
          <Space>
            <UsergroupAddOutlined style={{ color: '#1e293b', fontSize: '24px' }} />
            <Title level={3} style={{ margin: 0 }}>System User Management</Title>
          </Space>
        }
        className="shadow-sm border-0"
      >
        <Table 
          columns={columns} 
          dataSource={users} 
          rowKey="id" 
          loading={loading}
        />
      </Card>

      <Modal
        title={`Change Password for ${selectedUser?.username}`}
        open={isPasswordModalVisible}
        onOk={handleChangePassword}
        onCancel={() => setIsPasswordModalVisible(false)}
      >
        <div style={{ marginTop: 16 }}>
          <Text strong>New Password:</Text>
          <Input.Password 
            style={{ marginTop: 8 }}
            prefix={<KeyOutlined />}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Enter new password"
          />
        </div>
      </Modal>
    </div>
  );
};

export default UserManagement;
