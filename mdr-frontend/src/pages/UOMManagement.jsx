import { useState, useEffect } from "react";
import axios from "axios";
import { Table, Button, Input, Modal, Form, message, Typography, Space, Popconfirm } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined, SettingOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

function UOMManagement() {
  const [uoms, setUOMs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingUOM, setEditingUOM] = useState(null);
  const [form] = Form.useForm();
  
  // Use the API URL from environment variables, fallback for local dev
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  const fetchUOMs = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/uom`);
      setUOMs(res.data);
    } catch (error) {
      console.error("Failed to fetch UOMs:", error);
      message.error("Failed to fetch Units of Measure");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUOMs();
  }, []);

  const handleOpenModal = (uom = null) => {
    setEditingUOM(uom);
    if (uom) {
      form.setFieldsValue({ name: uom.name });
    } else {
      form.resetFields();
    }
    setIsModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
    setEditingUOM(null);
    form.resetFields();
  };

  const handleSubmit = async (values) => {
    try {
      if (editingUOM) {
        await axios.put(`${API_URL}/api/uom/${editingUOM.id}`, values);
        message.success("UOM updated successfully");
      } else {
        await axios.post(`${API_URL}/api/uom`, values);
        message.success("UOM created successfully");
      }
      handleCloseModal();
      fetchUOMs();
    } catch (error) {
      console.error("Failed to save UOM:", error);
      if (error.response && error.response.data && error.response.data.error) {
        message.error(error.response.data.error);
      } else {
        message.error("Failed to save UOM");
      }
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}/api/uom/${id}`);
      message.success("UOM deleted successfully");
      fetchUOMs();
    } catch (error) {
      console.error("Failed to delete UOM:", error);
      message.error(error.response?.data?.error || "Failed to delete UOM, it may be in use.");
    }
  };

  const columns = [
    {
      title: "No.",
      key: "index",
      width: 80,
      render: (text, record, index) => index + 1,
    },
    {
      title: "Unit of Measure (UOM)",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Actions",
      key: "actions",
      width: 150,
      align: "center",
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleOpenModal(record)}
            className="text-blue-600 hover:bg-blue-50"
          />
          <Popconfirm
            title="Delete this UOM?"
            description="Are you sure you want to delete this Unit of Measure?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes, Delete"
            cancelText="Cancel"
            okButtonProps={{ danger: true, className: "bg-[#FF0000] text-white hover:bg-[#cc0000] border-none" }}
          >
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              className="hover:bg-red-50"
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="font-sans fade-in pb-12">
      <div className="flex justify-between items-center mb-8 pb-6 border-b border-slate-200 backdrop-blur-md">
        <div>
          <Title level={2} className="m-0 text-slate-800 tracking-tight" style={{ marginBottom: 0 }}>
            UOM Management
          </Title>
          <Text className="text-slate-500 font-medium mt-1 block">
            Manage your Units of Measure (UoM) for material items.
          </Text>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => handleOpenModal()}
          className="bg-[#344D67] hover:bg-[#2a3f54] border-none shadow-md font-medium h-10 px-6 rounded-lg text-white"
        >
          Add New UOM
        </Button>
      </div>

      <div className="glass-panel bg-white p-6 sm:p-8 rounded-xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
           <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#344D67]/10 text-[#344D67]">
             <SettingOutlined className="text-xl" />
           </div>
           <span className="text-lg font-bold text-slate-800 tracking-tight">
             Master Data config
           </span>
        </div>
        
        <div className="border border-slate-200 rounded-lg overflow-hidden">
          <Table
            dataSource={uoms}
            columns={columns}
            rowKey="id"
            loading={loading}
            pagination={{ pageSize: 10, showSizeChanger: false }}
            className="mdr-table"
            rowClassName="hover:bg-slate-50 transition-colors"
          />
        </div>
      </div>

      <Modal
        title={
          <span className="text-lg font-bold text-slate-800">
            {editingUOM ? "Edit Unit of Measure (UOM)" : "Add New Unit of Measure (UOM)"}
          </span>
        }
        open={isModalVisible}
        onCancel={handleCloseModal}
        footer={null}
        destroyOnClose
        className="modern-modal"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          className="mt-6"
        >
          <Form.Item
            name="name"
            label={<span className="font-semibold text-slate-700">UOM Name</span>}
            rules={[{ required: true, message: "Please input the UOM name!" }]}
          >
            <Input size="large" placeholder="e.g. Nos, kg, Liters, Meters" className="rounded-lg bg-slate-50 focus:bg-white" />
          </Form.Item>
          
          <div className="flex justify-end gap-3 mt-8">
            <Button onClick={handleCloseModal} size="large" className="rounded-lg h-10 px-6 font-medium text-slate-600 hover:border-slate-400">
              Cancel
            </Button>
            <Button type="primary" htmlType="submit" size="large" className="bg-[#FF0000] hover:bg-[#cc0000] border-none rounded-lg h-10 px-6 font-medium text-white shadow-sm">
              {editingUOM ? "Save Changes" : "Create UOM"}
            </Button>
          </div>
        </Form>
      </Modal>

      <style dangerouslySetInnerHTML={{__html: `
        .fade-in { animation: fadeIn 0.4s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .mdr-table .ant-table-thead > tr > th { background: #f8fafc; color: #475569; font-weight: 600; padding: 16px; border-bottom: 2px solid #e2e8f0; }
        .mdr-table .ant-table-tbody > tr > td { padding: 16px; border-bottom: 1px solid #f1f5f9; }
        .modern-modal .ant-modal-content { border-radius: 16px; padding: 24px; }
        .modern-modal .ant-modal-header { border-bottom: none; margin-bottom: 8px; }
      `}} />
    </div>
  );
}

export default UOMManagement;
