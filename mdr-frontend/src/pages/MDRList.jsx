import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { Table, Tag, Button, Typography, Space } from "antd";
import { PlusOutlined, FileTextOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

function MDRList() {
  const [mdrs, setMdrs] = useState([]);

  useEffect(() => {
    axios
      .get("http://localhost:5000/mdr-list")
      .then((res) => setMdrs(res.data))
      .catch((err) => console.error(err));
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case "Open": return "red";
      case "Pending":
      case "Pending Supplier Response": return "orange";
      case "Closed": return "default";
      case "Complete": return "green";
      default: return "blue";
    }
  };

  const columns = [
    { 
      title: "ID", 
      dataIndex: "id", 
      key: "id", 
      width: 80,
      render: (id) => <span className="text-slate-400 font-mono text-xs">#{id}</span>
    },
    {
      title: "MDR Number", dataIndex: "mdr_number", key: "mdr",
      render: (text, record) => (
        <Space>
          <FileTextOutlined className="text-slate-400" />
          <Link to={`/mdr/${record.id}`} className="text-[#344D67] font-semibold hover:text-[#FF0000] hover:underline transition-colors">{text}</Link>
        </Space>
      )
    },
    { 
      title: "Supplier", 
      dataIndex: "supplier_name", 
      key: "supplier",
      render: (text) => <span className="font-semibold text-slate-700">{text}</span>
    },
    { 
      title: "Date", 
      dataIndex: "mdr_date", 
      key: "date", 
      render: date => <span className="text-slate-600 font-medium">{new Date(date).toLocaleDateString()}</span> 
    },
    {
      title: "Status", dataIndex: "status", key: "status",
      render: status => (
        <Tag color={getStatusColor(status)} className="px-3 py-1 rounded-full font-semibold border-none shadow-sm">
          {status ? status.toUpperCase() : "OPEN"}
        </Tag>
      )
    },
    { 
      title: "Total Items", 
      dataIndex: "total_items", 
      key: "items", 
      align: "center",
      render: (val) => <Tag className="rounded-full px-3 bg-slate-100 text-slate-700 border-none">{val}</Tag>
    }
  ];

  return (
    <div className="font-sans fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <Title level={2} className="m-0 text-slate-800 tracking-tight" style={{ marginBottom: 0 }}>Material Discrepancy Reports</Title>
          <Text className="text-slate-500 font-medium text-base">View and filter all existing reports</Text>
        </div>
        <Link to="/create">
          <Button type="primary" size="large" icon={<PlusOutlined />} className="bg-[#FF0000] hover:bg-[#cc0000] border-none shadow-lg shadow-[#FF0000]/30 font-semibold px-6 rounded-xl flex items-center h-12">
            Create MDR
          </Button>
        </Link>
      </div>

      <div className="glass-panel rounded-2xl p-6 sm:p-8">
        <div className="overflow-x-auto">
          <Table
            columns={columns}
            dataSource={mdrs}
            rowKey="id"
            pagination={{ pageSize: 15, showSizeChanger: true, className: "mt-6" }}
            rowClassName="hover:bg-slate-50 cursor-pointer transition-colors"
            size="middle"
            className="modern-table"
          />
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        .fade-in { animation: fadeIn 0.5s ease-in-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .modern-table .ant-table-thead > tr > th { text-transform: uppercase; font-size: 0.75rem; letter-spacing: 0.05em; color: #64748b; background: white; border-bottom: 2px solid #f1f5f9; padding-top: 1rem; padding-bottom: 1rem; }
        .modern-table .ant-table-tbody > tr > td { padding-top: 1rem; padding-bottom: 1rem; border-bottom: 1px solid #f1f5f9; }
        .modern-table .ant-table-wrapper { background: transparent; }
        .modern-table .ant-table { background: transparent; }
      `}} />
    </div>
  );
}

export default MDRList;
