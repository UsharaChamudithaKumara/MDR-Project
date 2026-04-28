import React, { useState, useEffect } from "react";
import axios from "axios";
import { Table, Tag, Button, Typography, Space, DatePicker, Select, Input, message, Tooltip, Popconfirm } from "antd";
import { SearchOutlined, FileExcelOutlined, FilePdfOutlined, ReloadOutlined, EyeOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";
import * as xlsx from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import cpcLogo from "../Image/Ceylon_Petroleum_Corporation_logo.png";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

function Reports() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    startDate: null,
    endDate: null,
    supplier: "",
    status: ""
  });

  const fetchReports = async (showNotification = false) => {
    setLoading(true);
    try {
      const params = {};
      if (filters.status) params.status = filters.status;
      if (filters.supplier) params.supplier_name = filters.supplier;
      if (filters.startDate) params.start_date = filters.startDate.format("YYYY-MM-DD");
      if (filters.endDate) params.end_date = filters.endDate.format("YYYY-MM-DD");

      const response = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/mdr-report`, { params });
      // Add a unique key for the table rows
      const reportsWithKey = response.data.map((item, index) => ({
        ...item,
        key: `${item.mdr_number}-${index}`
      }));
      setData(reportsWithKey);
      
      if (showNotification === true) {
        message.success("Report data loaded successfully");
      }
    } catch (error) {
      console.error("Error fetching report data", error);
      message.error("Failed to load report data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const formatDateDDMMYYYY = (dateString) => {
    if (!dateString) return "";
    const d = new Date(dateString);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/delete-mdr/${id}`);
      message.success("MDR deleted successfully");
      fetchReports();
    } catch (error) {
      message.error("Failed to delete MDR");
    }
  };

  const handleExport = () => {
    if (data.length === 0) {
      message.warning("No data to export");
      return;
    }

    const exportData = data.map(item => ({
      "MDR Number": item.mdr_number,
      "MDR Date": formatDateDDMMYYYY(item.mdr_date),
      "PO Number": item.po_number || "N/A",
      "Supplier Name": item.supplier_name,
      "Item Description": item.item_description,
      "Rejected Quantity": item.rejected_qty,
      "Reason for Rejection": item.rejection_reason,
      "Status": item.status
    }));

    const worksheet = xlsx.utils.json_to_sheet(exportData);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, "MDR Report");
    xlsx.writeFile(workbook, `MDR_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const handleExportPDF = () => {
    if (data.length === 0) {
      message.warning("No data to export");
      return;
    }

    const doc = new jsPDF("landscape");
    
    // Add CPC Logo
    const img = new Image();
    img.src = cpcLogo;
    doc.addImage(img, 'PNG', 14, 10, 20, 20); // x, y, width, height

    doc.setFontSize(16);
    doc.text("Material Discrepancy Report", 40, 22);
    
    const tableColumn = ["MDR Number", "MDR Date", "PO Number", "Supplier Name", "Item Description", "Rejected Qty", "Reason for Rejection", "Status"];
    const tableRows = [];

    data.forEach(item => {
      const rowData = [
        item.mdr_number,
        formatDateDDMMYYYY(item.mdr_date),
        item.po_number || "N/A",
        item.supplier_name,
        item.item_description,
        item.rejected_qty,
        item.rejection_reason,
        item.status
      ];
      tableRows.push(rowData);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 35,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [52, 77, 103] } // matches #344D67 (primary color)
    });

    doc.save(`MDR_Report_${new Date().toISOString().split('T')[0]}.pdf`);
  };

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
      title: "MDR Number",
      dataIndex: "mdr_number",
      key: "mdr_number",
      render: text => <span className="font-semibold text-slate-700">{text}</span>
    },
    {
      title: "MDR Date",
      dataIndex: "mdr_date",
      key: "mdr_date",
      render: date => <span className="text-slate-600 font-medium">{formatDateDDMMYYYY(date)}</span>
    },
    {
      title: "PO Number",
      dataIndex: "po_number",
      key: "po_number",
      render: text => text || "N/A"
    },
    {
      title: "Supplier Name",
      dataIndex: "supplier_name",
      key: "supplier_name"
    },
    {
      title: "Item Description",
      dataIndex: "item_description",
      key: "item_description",
      ellipsis: true,
      width: 250
    },
    {
      title: "Rejected Qty",
      dataIndex: "rejected_qty",
      key: "rejected_qty",
      align: "center",
      render: val => <span className="font-mono text-red-500 font-semibold">{val}</span>
    },
    {
      title: "Reason for Rejection",
      dataIndex: "rejection_reason",
      key: "rejection_reason",
      ellipsis: true
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      align: "center",
      width: 130,
      render: status => (
        <Tag color={getStatusColor(status)} className="px-3 py-1 rounded-full font-semibold border-none shadow-sm">
          {status ? status.toUpperCase() : "OPEN"}
        </Tag>
      )
    },
    {
      title: "Actions",
      key: "actions",
      align: "center",
      width: 140,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="View Report">
            <Link to={`/mdr/${record.id}`}>
              <Button type="primary" size="small" icon={<EyeOutlined />} className="bg-[#344D67] hover:bg-[#2a3e52]" />
            </Link>
          </Tooltip>
          <Tooltip title="Edit Report">
            <Link to={`/edit/${record.id}`}>
              <Button size="small" icon={<EditOutlined />} className="text-[#344D67] border-[#344D67] hover:text-[#FF0000] hover:border-[#FF0000]" />
            </Link>
          </Tooltip>
          <Tooltip title="Delete Report">
            <Popconfirm
              title="Are you sure you want to delete this MDR?"
              onConfirm={() => handleDelete(record.id)}
              okText="Yes"
              cancelText="No"
              okButtonProps={{ danger: true, type: 'primary', className: 'bg-red-500 hover:bg-red-600 text-white border-none' }}
            >
              <Button danger size="small" icon={<DeleteOutlined />} />
            </Popconfirm>
          </Tooltip>
        </Space>
      )
    }
  ];

  return (
    <div className="font-sans fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <Title level={2} className="m-0 text-slate-800 tracking-tight" style={{ marginBottom: 0 }}>MDR Reports</Title>
          <Text className="text-slate-500 font-medium text-base">Generate status, supplier, and date-wise reports</Text>
        </div>
        <Space className="w-full sm:w-auto">
          <Button 
            type="primary" 
            icon={<FilePdfOutlined />} 
            onClick={handleExportPDF}
            className="bg-[#e74c3c] hover:bg-[#c0392b] border-none shadow-lg shadow-[#e74c3c]/30 font-semibold px-6 h-10 flex items-center"
            disabled={data.length === 0}
          >
            Export to PDF
          </Button>
          <Button 
            type="primary" 
            icon={<FileExcelOutlined />} 
            onClick={handleExport}
            className="bg-[#217346] hover:bg-[#1e603a] border-none shadow-lg shadow-[#217346]/30 font-semibold px-6 h-10 flex items-center"
            disabled={data.length === 0}
          >
            Export to Excel
          </Button>
        </Space>
      </div>

      <div className="glass-panel rounded-2xl p-6 sm:p-8 mb-8 backdrop-blur-md bg-white/60 border border-white/20 shadow-xl">
        <Title level={5} className="mb-4 text-slate-700">Filter Report Data</Title>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <span className="block text-sm font-medium text-slate-500 mb-1">Date Range</span>
            <RangePicker 
              className="w-full text-base" 
              size="large"
              onChange={(dates) => {
                setFilters({
                  ...filters,
                  startDate: dates ? dates[0] : null,
                  endDate: dates ? dates[1] : null
                })
              }}
            />
          </div>
          <div>
            <span className="block text-sm font-medium text-slate-500 mb-1">Status</span>
            <Select 
              className="w-full" 
              size="large" 
              placeholder="All Statuses" 
              allowClear
              onChange={(val) => setFilters({...filters, status: val})}
            >
              <Option value="Open">Open</Option>
              <Option value="Pending Supplier Response">Pending Supplier Response</Option>
              <Option value="Complete">Complete</Option>
              <Option value="Closed">Closed</Option>
            </Select>
          </div>
          <div>
            <span className="block text-sm font-medium text-slate-500 mb-1">Supplier Name</span>
            <Input 
              placeholder="Search supplier..." 
              size="large" 
              allowClear
              onChange={(e) => setFilters({...filters, supplier: e.target.value})}
            />
          </div>
          <div className="flex items-end gap-2">
            <Button 
              type="primary" 
              size="large" 
              icon={<SearchOutlined />} 
              onClick={() => fetchReports(true)}
              loading={loading}
              className="bg-[#344D67] hover:bg-[#2c4055] border-none flex-1"
            >
              Generate
            </Button>
            <Button 
              size="large" 
              icon={<ReloadOutlined />} 
              onClick={() => {
                setFilters({ startDate: null, endDate: null, supplier: "", status: "" });
                // Note: data is automatically re-fetched by the user interacting with the clear inputs
              }}
              title="Reset Filters"
            />
          </div>
        </div>
      </div>

      <div className="glass-panel rounded-2xl p-6 sm:p-8">
        <div className="overflow-x-auto">
          <Table
            columns={columns}
            dataSource={data}
            loading={loading}
            pagination={{ pageSize: 15, showSizeChanger: true, className: "mt-6" }}
            rowClassName="hover:bg-slate-50 cursor-pointer transition-colors"
            size="middle"
            className="modern-table"
            scroll={{ x: 'max-content' }}
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
        .glass-panel { background: rgba(255, 255, 255, 0.7); backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.3); box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03); }
      `}} />
    </div>
  );
}

export default Reports;
