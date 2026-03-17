import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { Table, Tag, Input, Button, Space, Typography } from "antd";
import { SearchOutlined, PlusOutlined, AppstoreOutlined, AlertOutlined, ClockCircleOutlined, CheckCircleOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

function Dashboard() {
  const [mdrs, setMdrs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMDRs();
  }, []);

  const fetchMDRs = () => {
    setLoading(true);
    axios
      .get("http://localhost:5000/mdr-list")
      .then((res) => {
        setMdrs(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  const total = mdrs.length;
  const open = mdrs.filter((m) => m.status === "Open").length;
  const pending = mdrs.filter((m) => m.status === "Pending").length;
  const closed = mdrs.filter((m) => m.status === "Closed").length;
  const complete = mdrs.filter((m) => m.status === "Complete").length;

  const Card = ({ title, value, gradientClass, icon }) => (
    <div className={`p-6 rounded-2xl premium-shadow text-white ${gradientClass} flex items-center justify-between transition-all duration-300 transform hover:-translate-y-1 hover:shadow-2xl relative overflow-hidden group`}>
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-500"></div>
      <div className="relative z-10">
        <h3 className="text-sm font-semibold opacity-90 uppercase tracking-wider mb-1">{title}</h3>
        <p className="text-5xl font-extrabold">{value}</p>
      </div>
      <div className="text-6xl opacity-30 transform group-hover:scale-110 transition-transform duration-300 relative z-10">
        {icon}
      </div>
    </div>
  );

  const getStatusColor = (status) => {
    switch (status) {
      case "Open": return "red";
      case "Pending": return "orange";
      case "Closed": return "default";
      case "Complete": return "green";
      default: return "blue";
    }
  };

  const columns = [
    {
      title: "MDR Number",
      dataIndex: "mdr_number",
      key: "mdr_number",
      sorter: (a, b) => a.mdr_number.localeCompare(b.mdr_number),
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
        <div style={{ padding: 8 }}>
          <Input
            placeholder="Search MDR"
            value={selectedKeys[0]}
            onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
            onPressEnter={() => confirm()}
            style={{ marginBottom: 8, display: "block" }}
          />
          <Space>
            <Button
              type="primary"
              onClick={() => confirm()}
              icon={<SearchOutlined />}
              size="small"
              style={{ width: 90 }}
            >
              Search
            </Button>
            <Button onClick={() => clearFilters()} size="small" style={{ width: 90 }}>
              Reset
            </Button>
          </Space>
        </div>
      ),
      filterIcon: (filtered) => <SearchOutlined style={{ color: filtered ? "#344D67" : undefined }} />,
      onFilter: (value, record) =>
        record.mdr_number.toString().toLowerCase().includes(value.toLowerCase()),
    },
    {
      title: "Date",
      dataIndex: "mdr_date",
      key: "mdr_date",
      render: (date) => <span className="text-slate-600 font-medium">{new Date(date).toLocaleDateString()}</span>,
      sorter: (a, b) => new Date(a.mdr_date) - new Date(b.mdr_date),
    },
    {
      title: "PO Number",
      dataIndex: "po_number",
      key: "po_number",
      render: (text) => <span className="text-slate-600">{text || "-"}</span>,
    },
    {
      title: "Supplier Name",
      dataIndex: "supplier_name",
      key: "supplier_name",
      render: (text) => <span className="font-semibold text-slate-700">{text}</span>,
    },
    {
      title: "Items",
      dataIndex: "total_items",
      key: "total_items",
      align: "center",
      render: (val) => <Tag className="rounded-full px-3">{val}</Tag>
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={getStatusColor(status)} key={status} className="px-3 py-1 rounded-full font-semibold border-none shadow-sm">
          {status ? status.toUpperCase() : "OPEN"}
        </Tag>
      ),
      filters: [
        { text: "Open", value: "Open" },
        { text: "Pending", value: "Pending" },
        { text: "Closed", value: "Closed" },
        { text: "Complete", value: "Complete" },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: "Action",
      key: "action",
      align: "center",
      render: (_, record) => (
        <Link to={`/mdr/${record.id}`}>
           <Button type="link" size="small" className="text-[#344D67] font-semibold hover:text-[#FF0000]">
             View Detail
           </Button>
        </Link>
      ),
    },
  ];

  return (
    <div className="font-sans fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <Title level={2} className="m-0 text-slate-800 tracking-tight" style={{ marginBottom: 0 }}>Dashboard Overview</Title>
          <Text className="text-slate-500 font-medium text-base">Monitor and manage your material discrepancy reports</Text>
        </div>
        <Link to="/create">
          <Button type="primary" size="large" icon={<PlusOutlined />} className="bg-[#FF0000] hover:bg-[#cc0000] border-none shadow-lg shadow-[#FF0000]/30 font-semibold px-6 rounded-xl flex items-center h-12">
            New MDR
          </Button>
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <Card title="Total MDRs" value={total} gradientClass="bg-gradient-to-br from-[#1e293b] to-[#334155]" icon={<AppstoreOutlined />} />
        <Card title="Open MDRs" value={open} gradientClass="bg-gradient-to-br from-[#ef4444] to-[#b91c1c]" icon={<AlertOutlined />} />
        <Card title="Pending MDRs" value={pending} gradientClass="bg-gradient-to-br from-[#f59e0b] to-[#b45309]" icon={<ClockCircleOutlined />} />
        <Card title="Complete MDRs" value={complete} gradientClass="bg-gradient-to-br from-[#10b981] to-[#047857]" icon={<CheckCircleOutlined />} />
      </div>

      {/* Fancy Table */}
      <div className="glass-panel rounded-2xl p-6 sm:p-8">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold border-l-4 border-[#FF0000] pl-3 text-slate-800">Recent Reports</h3>
        </div>
        <div className="overflow-x-auto">
          <Table
            columns={columns}
            dataSource={mdrs}
            rowKey="id"
            loading={loading}
            pagination={{ pageSize: 10, showSizeChanger: true, className: "mt-6" }}
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

export default Dashboard;
