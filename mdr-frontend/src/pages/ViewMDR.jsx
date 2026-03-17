import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Table, Tag, Typography, Button, Space, Select, Spin, message, Image, DatePicker } from "antd";
import { PrinterOutlined, FilePdfOutlined, FileExcelOutlined, ArrowLeftOutlined, CheckCircleOutlined, ClockCircleOutlined, ExclamationCircleOutlined, SaveOutlined, ProfileOutlined } from "@ant-design/icons";
import { useReactToPrint } from "react-to-print";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import dayjs from "dayjs";

const { Title, Text } = Typography;
const { Option } = Select;

function ViewMDR() {
   const { id } = useParams();
   const navigate = useNavigate();
   const [data, setData] = useState(null);
   const [loading, setLoading] = useState(true);
   const printRef = useRef();

   useEffect(() => {
      fetchData();
   }, [id]);

   const fetchData = () => {
      setLoading(true);
      axios
         .get(`http://localhost:5000/mdr/${id}`)
         .then((res) => {
            setData(res.data);
            setLoading(false);
         })
         .catch((err) => {
            console.error(err);
            message.error("Failed to fetch MDR details.");
            setLoading(false);
         });
   };

   const updateStatus = async (newStatus) => {
      try {
         await axios.put(`http://localhost:5000/update-status/${id}`, {
            status: newStatus,
         });
         message.success(`Status updated to ${newStatus}`);
         fetchData();
      } catch (error) {
         console.error(error);
         message.error("Failed to update status.");
      }
   };

   const updateItemReturnDate = async (itemId, returnDate) => {
      try {
         await axios.put(`http://localhost:5000/update-item-return-date/${itemId}`, {
            return_date: returnDate ? dayjs(returnDate).format('YYYY-MM-DD') : null,
         });
         message.success("Return date updated");
         fetchData();
      } catch (error) {
         console.error(error);
         message.error("Failed to update return date.");
      }
   };

   const getStatusTag = (status) => {
      let icon = null;
      let colorClass = "";
      switch (status) {
         case "Open": 
           icon = <ExclamationCircleOutlined />;
           colorClass = "text-red-600 bg-red-100";
           break;
         case "Pending": 
         case "Pending Supplier Response":
           icon = <ClockCircleOutlined />;
           colorClass = "text-orange-600 bg-orange-100";
           break;
         case "Closed": 
           colorClass = "text-slate-600 bg-slate-100";
           break;
         case "Complete": 
           icon = <CheckCircleOutlined />;
           colorClass = "text-emerald-600 bg-emerald-100";
           break;
         default: 
           colorClass = "text-blue-600 bg-blue-100";
      }

      return (
         <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-bold tracking-wide uppercase ${colorClass}`}>
            {icon}
            {status || 'OPEN'}
         </div>
      );
   };

   // --- Export Functions ---
   const handlePrint = useReactToPrint({
      content: () => printRef.current,
      documentTitle: data ? `MDR-${data.header.mdr_number}` : "MDR_Print",
   });

   const exportPDF = () => {
      if (!data) return;
      const doc = new jsPDF();

      doc.setFontSize(18);
      doc.text(`Material Discrepancy Report: ${data.header.mdr_number}`, 14, 22);

      doc.setFontSize(11);
      doc.text(`Date: ${new Date(data.header.mdr_date).toLocaleDateString()}`, 14, 32);
      doc.text(`Supplier: ${data.header.supplier_name} (${data.header.supplier_type})`, 14, 38);
      doc.text(`PO Number: ${data.header.po_number || 'N/A'}`, 14, 44);

      const tableData = data.items.map(item => [
         item.item_description,
         item.uom,
         item.po_qty ? Math.round(item.po_qty) : "-",
         item.received_qty ? Math.round(item.received_qty) : "0",
         item.received_date ? dayjs(item.received_date).format('DD/MM/YYYY') : "-",
         item.rejected_qty ? Math.round(item.rejected_qty) : "0",
         item.return_date ? dayjs(item.return_date).format('DD/MM/YYYY') : "-",
         item.gate_pass_ref || "-",
         item.rejection_reason,
         item.rejection_remarks || "N/A"
      ]);

      autoTable(doc, {
         startY: 50,
         head: [["Description", "UoM", "PO Qty", "Recv Qty", "Recv Date", "Rej Qty", "Ret Date", "Gate Pass", "Reason", "Remarks"]],
         body: tableData,
         theme: 'grid',
         headStyles: { fillColor: [52, 77, 103], fontSize: 8 },
         styles: { fontSize: 8 }
      });

      doc.save(`MDR-${data.header.mdr_number}.pdf`);
   };

   const exportExcel = () => {
      if (!data) return;
      const worksheet = XLSX.utils.json_to_sheet(data.items.map(item => ({
         Description: item.item_description,
         UoM: item.uom,
         "PO Qty": item.po_qty ? Math.round(item.po_qty) : 0,
         "Received Qty": item.received_qty ? Math.round(item.received_qty) : 0,
         "Received Date": item.received_date ? dayjs(item.received_date).format('YYYY-MM-DD') : "-",
         "Rejected Qty": item.rejected_qty ? Math.round(item.rejected_qty) : 0,
         "Return Date": item.return_date ? dayjs(item.return_date).format('YYYY-MM-DD') : "-",
         "Gate Pass Ref": item.gate_pass_ref || "-",
         "Reason": item.rejection_reason,
         "Remarks": item.rejection_remarks
      })));

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Discrepancy Items");
      XLSX.writeFile(workbook, `MDR-${data.header.mdr_number}.xlsx`);
   };

   const exportOfficialPDF = () => {
      if (!data) return;
      const doc = new jsPDF({
         orientation: "landscape",
         unit: "mm",
         format: "a4"
      });
      
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 14;

      // Header - Centered (Page width in landscape is ~297mm)
      doc.setFont("helvetica", "normal");
      doc.setFontSize(12);
      doc.text("CEYLON PETROLEUM CORPORATION", pageWidth / 2, 20, { align: "center" });
      doc.text("REFINERY DIVISION", pageWidth / 2, 26, { align: "center" });
      doc.text("MATERIALS DISCREPANCY REPORT", pageWidth / 2, 32, { align: "center" });

      // Sub-header info - One Horizontal Line (Distributed across landscape)
      doc.setFontSize(10);
      const yPos = 45;
      
      doc.text("MATERIALS DEPT.", margin, yPos);
      
      doc.text("RMA/LOCAL REF.NO.", 60, yPos);
      doc.setFont("helvetica", "normal");
      doc.text(data.header.grn_no || "", 105, yPos);
      
      doc.text("PO.NO.", 155, yPos);
      doc.text(data.header.po_number || "", 170, yPos);
      
      doc.text("MDR. NO.", 220, yPos);
      doc.text(data.header.mdr_number || "", 240, yPos);

      // Table mapping
      const tableData = data.items.map((item, index) => [
         index + 1,
         item.item_description,
         item.rejection_reason
      ]);

      // Fill remaining rows to reach at least 5 rows
      while (tableData.length < 5) {
         tableData.push(["", "", ""]);
      }

      autoTable(doc, {
         startY: 50,
         head: [["PO ITEM NO", "DESCRIPTION", "REASON FOR THE REJECTION"]],
         body: tableData,
         theme: "grid",
         styles: {
            fontSize: 10,
            cellPadding: 4,
            lineColor: [0, 0, 0],
            lineWidth: 0.1,
            textColor: [0, 0, 0],
            font: "helvetica"
         },
         headStyles: {
            fillColor: [255, 255, 255],
            textColor: [0, 0, 0],
            fontStyle: "normal",
            lineWidth: 0.1,
         },
         columnStyles: {
            0: { cellWidth: 35 },
            1: { cellWidth: 140 },
            2: { cellWidth: "auto" }
         },
         margin: { left: margin, right: margin }
      });

      const finalY = doc.lastAutoTable.finalY + 20;

      // Signature area (Distributed across landscape)
      doc.setFontSize(10);
      
      const sigY = finalY;
      const colW = (pageWidth - margin * 2) / 4;
      
      // Lines - Using solid lines instead of dots if possible, or just removing the dots
      // The user said "no need dot lines for this parts" showing metadata. 
      // I'll check if they meant signature lines too. Usually signature lines are solid or dotted.
      // I'll remove them or make them solid lines.
      doc.line(margin, sigY, margin + 40, sigY);
      doc.line(margin + colW, sigY, margin + colW + 40, sigY);
      doc.line(margin + colW * 2, sigY, margin + colW * 2 + 40, sigY);
      doc.line(margin + colW * 3, sigY, margin + colW * 3 + 40, sigY);

      // Labels
      doc.text("DATE", margin, sigY + 6);
      doc.text("RECEIVING S.K", margin + colW, sigY + 6);
      doc.text("E(W)", margin + colW * 2, sigY + 6);
      doc.text("ORIGINAL RECEIVED", margin + colW * 3, sigY + 6);

      // Message
      doc.setFontSize(10);
      const messageText = "Please review the reason stated for the MDR and take the appropriate corrective actions to resolve the issue and ensure the order is completed without further delay.";
      const splitMessage = doc.splitTextToSize(messageText, pageWidth - (margin * 2));
      doc.text(splitMessage, margin, sigY + 18);

      // Footer - One Line (Centered at bottom)
      doc.setFontSize(9);
      doc.text("ORIGINAL : FOREIGN/LOCAL PROCUREMENT", margin, pageHeight - 15);
      doc.text("COPY           : FILE", pageWidth / 2, pageHeight - 15);

      doc.save(`Official-MDR-${data.header.mdr_number}.pdf`);
   };

   if (loading) return <div className="p-20 flex justify-center items-center h-[60vh]"><Spin size="large" /></div>;
   if (!data) return <div className="p-20 text-center font-medium text-slate-500">No Data Found</div>;

   const itemColumns = [
      { title: "Description", dataIndex: "item_description", key: "desc", render: t => <span className="font-medium text-slate-700">{t}</span> },
      { title: "UoM", dataIndex: "uom", key: "uom", align: "center" },
      { title: "PO Qty", dataIndex: "po_qty", key: "po", align: "center", render: t => <span className="text-slate-500">{t ? Math.round(t) : "-"}</span> },
      { title: "Recv Qty", dataIndex: "received_qty", key: "recv", align: "center", render: t => <span>{t ? Math.round(t) : "0"}</span> },
      { title: "Recv Date", dataIndex: "received_date", key: "recv_date", align: "center", render: t => <span className="text-slate-400 text-xs">{t ? dayjs(t).format('DD/MM/YYYY') : "-"}</span> },
      { title: "Rej Qty", dataIndex: "rejected_qty", key: "rej", align: "center", render: t => <span className="text-[#FF0000] font-bold">{t ? Math.round(t) : "0"}</span> },
      { 
         title: "Return Date", 
         dataIndex: "return_date", 
         key: "ret_date", 
         align: "center", 
         render: (t, record) => (
            <DatePicker 
               value={t ? dayjs(t) : null} 
               onChange={(date) => updateItemReturnDate(record.id, date)} 
               className="w-32 text-xs"
               size="small"
               format="DD/MM/YYYY"
            />
         ) 
      },
      { title: "Gate Pass", dataIndex: "gate_pass_ref", key: "gate", align: "center", render: t => <span className="text-slate-400 text-xs font-mono">{t || "-"}</span> },
      { title: "Reason", dataIndex: "rejection_reason", key: "reason", render: t => <Tag className="border-none bg-slate-100 text-slate-700">{t}</Tag> },
      { title: "Remarks", dataIndex: "rejection_remarks", key: "remarks", render: t => <span className="text-slate-500 text-sm italic">{t || "-"}</span> },
   ];

   const InfoBlock = ({ label, value, highlight, icon }) => (
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-start gap-4 transition-all hover:shadow-md hover:border-slate-300">
         <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg ${highlight ? 'bg-red-50 text-red-500' : 'bg-slate-100 text-slate-500'}`}>
            {icon || <ExclamationCircleOutlined />}
         </div>
         <div className="flex-1 min-w-0">
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em] mb-1">{label}</span>
            <span className={`block text-[15px] truncate ${highlight ? 'text-red-600 font-bold' : 'text-slate-800 font-semibold'}`} title={value}>
               {value || "N/A"}
            </span>
         </div>
      </div>
   );

   return (
      <div className="font-sans fade-in pb-12">
         <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div className="flex items-center">
               <Button 
                 type="text" 
                 onClick={() => navigate("/")} 
                 icon={<ArrowLeftOutlined className="text-lg" />} 
                 className="mr-4 hover:bg-slate-200 text-slate-600 w-10 h-10 flex items-center justify-center rounded-full transition-colors" 
               />
               <div>
                 <Title level={2} className="m-0 text-slate-800 tracking-tight" style={{ marginBottom: 0 }}>Report Details</Title>
                 <Text className="text-slate-500 font-medium text-base">View and manage discrepancy report information</Text>
               </div>
            </div>
            <div className="w-full md:w-auto mt-4 md:mt-0 glass-card p-1.5 rounded-xl flex items-center gap-1.5 border border-slate-200 shadow-lg">
               <Button 
                  type="primary" 
                  className="bg-[#107c41] hover:bg-[#0e6b38] border-none font-semibold text-xs transition-all h-9 rounded-lg flex items-center gap-1.5 px-4" 
                  icon={<FileExcelOutlined />} 
                  onClick={exportExcel}
               >
                  Excel
               </Button>
               <Button 
                  type="primary" 
                  className="bg-[#344D67] hover:bg-[#2a3e52] border-none font-semibold text-xs transition-all h-9 rounded-lg flex items-center gap-1.5 px-4" 
                  icon={<FilePdfOutlined />} 
                  onClick={exportPDF}
               >
                  Standard PDF
               </Button>
               <Button 
                  type="primary" 
                  className="bg-[#2d3a4b] hover:bg-[#1a2331] border-none font-semibold text-xs transition-all h-9 rounded-lg flex items-center gap-1.5 px-4" 
                  icon={<FilePdfOutlined />} 
                  onClick={exportOfficialPDF}
               >
                  Official PDF
               </Button>
               <Button 
                  className="border-slate-200 text-slate-600 hover:text-[#344D67] hover:border-[#344D67] font-semibold text-xs transition-all h-9 rounded-lg flex items-center gap-1.5 px-4" 
                  icon={<PrinterOutlined />} 
                  onClick={handlePrint}
               >
                  Print
               </Button>
            </div>
         </div>

         <div className="glass-panel rounded-2xl p-6 sm:p-10 border border-white/40 shadow-xl print-container" ref={printRef}>
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center pb-8 border-b border-slate-200 mb-8">
               <div className="mb-6 md:mb-0">
                  <div className="flex items-center gap-3 mb-2">
                    <Title level={2} className="m-0 text-[#344D67] font-black tracking-tight">{data.header.mdr_number}</Title>
                  </div>
                  <Text className="text-slate-500 font-medium text-base flex items-center gap-2">
                     <ClockCircleOutlined /> Documented on {new Date(data.header.mdr_date).toLocaleDateString()}
                  </Text>
               </div>
               
               <div className="flex flex-col items-start md:items-end gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm min-w-[260px]">
                  <div className="flex items-center justify-between w-full mb-1">
                     <Text className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.15em]">Current Status</Text>
                     {getStatusTag(data.header.status)}
                  </div>
                  
                  <div className="no-print w-full pt-4 border-t border-slate-100 mt-2">
                     <div className="flex items-center gap-2 mb-3">
                        <div className="w-1 h-3 bg-slate-300 rounded-full"></div>
                        <Text className="text-slate-500 font-bold text-[10px] uppercase tracking-wider">Update Status</Text>
                     </div>
                     <Select
                        value={data.header.status || 'Open'}
                        onChange={updateStatus}
                        className="w-full text-sm font-semibold status-select"
                        size="large"
                        variant="filled"
                        style={{ borderRadius: '10px' }}
                     >
                        <Option value="Open">Mark Open</Option>
                        <Option value="Pending Supplier Response">Mark Pending</Option>
                        <Option value="Closed">Mark Closed</Option>
                        <Option value="Complete">Mark Complete</Option>
                     </Select>
                  </div>
               </div>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-10">
               <InfoBlock label="Supplier Type" value={data.header.supplier_type} icon={<ExclamationCircleOutlined />} />
               <InfoBlock label="Supplier Name" value={data.header.supplier_name} icon={<CheckCircleOutlined />} />
               <InfoBlock label="Supplier Ref No" value={data.header.supplier_ref} icon={<ProfileOutlined />} />
               <InfoBlock label="PO Number" value={data.header.po_number} icon={<FilePdfOutlined />} />
               <InfoBlock label="GRN Number" value={data.header.grn_no} icon={<PrinterOutlined />} />
               <InfoBlock label="Inspection By" value={data.header.inspection_by} icon={<ClockCircleOutlined />} />
               <InfoBlock label="Department" value={data.header.department} icon={<CheckCircleOutlined />} />
               <div className="col-span-2 md:col-span-3 lg:col-span-2">
                  <InfoBlock label="Corrective Action" value={data.header.corrective_action} highlight={true} icon={<ExclamationCircleOutlined />} />
               </div>
            </div>

            {/* Items Table */}
            <div className="mb-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-1 h-6 bg-[#344D67] rounded-full"></div>
                <Title level={4} className="m-0 text-slate-800 tracking-tight">Rejected Items Manifest</Title>
              </div>
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                <Table
                  columns={itemColumns}
                  dataSource={data.items}
                  rowKey="id"
                  pagination={false}
                  size="middle"
                  className="modern-table no-bg-table"
                />
              </div>
            </div>

            {/* Evidence Section */}
            {data.attachments && data.attachments.length > 0 && (
               <div className="no-print">
                  <div className="flex items-center gap-3 mb-6 pt-10 border-t border-slate-100 mt-6">
                    <div className="w-1.5 h-6 bg-[#344D67] rounded-full"></div>
                    <Title level={4} className="m-0 text-slate-800 tracking-tight font-bold">Photographic Evidence</Title>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                     {data.attachments.map((att, index) => (
                        <div key={att.id} className="group relative transition-all duration-300">
                           <div className="aspect-square rounded-2xl overflow-hidden border-2 border-slate-100 shadow-sm hover:shadow-xl hover:border-[#344D67]/30 transition-all bg-white p-1.5 relative group">
                             <div className="absolute top-3 left-3 z-10 bg-black/40 backdrop-blur-md text-white text-[10px] font-black px-2 py-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                               Evidence #{index + 1}
                             </div>
                             <div className="w-full h-full rounded-xl overflow-hidden bg-slate-50 flex items-center justify-center">
                               <Image
                                  src={`http://localhost:5000${att.file_path}`}
                                  alt={`Evidence ${index + 1}`}
                                   className="object-cover w-full h-full transform group-hover:scale-110 transition-transform duration-700"
                                   classNames={{ 
                                     mask: "rounded-xl",
                                     cover: "rounded-xl"
                                   }}
                               />
                             </div>
                           </div>
                           <div className="mt-3 px-1 text-center">
                             <Text className="text-[11px] text-slate-500 font-bold uppercase tracking-widest opacity-80 group-hover:opacity-100 transition-opacity">
                                Attachment {index + 1}
                             </Text>
                           </div>
                        </div>
                     ))}
                  </div>
               </div>
            )}
         </div>

         <style dangerouslySetInnerHTML={{
            __html: `
        .fade-in { animation: fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1); }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        
        .modern-table .ant-table-thead > tr > th { 
          text-transform: uppercase; 
          font-size: 0.7rem; 
          letter-spacing: 0.1em; 
          color: #94a3b8; 
          background: #ffffff; 
          border-bottom: 2px solid #f1f5f9; 
          padding-top: 1.25rem; 
          padding-bottom: 1.25rem;
          font-weight: 800;
        }
        .modern-table .ant-table-tbody > tr > td { 
          padding-top: 1.25rem; 
          padding-bottom: 1.25rem; 
          border-bottom: 1px solid #f8fafc;
          transition: all 0.2s;
        }
        .modern-table .ant-table-tbody > tr:hover > td {
          background-color: #f8fafc !important;
        }
        .no-bg-table .ant-table { background: transparent !important; }
        
        .glass-panel {
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(10px);
        }

        @media print {
          body { 
            background: white !important; 
            padding: 0 !important; 
          }
          #root { display: block !important; }
          .print-container { 
            box-shadow: none !important; 
            border: none !important; 
            padding: 0 !important;
            margin: 0 !important;
            border-radius: 0 !important;
          }
          .no-print { display: none !important; }
          /* Reset info blocks for print */
          .bg-slate-50, .bg-white { background-color: transparent !important; border-bottom: 1px solid #eee !important; border-radius: 0 !important; box-shadow: none !important; }
          .min-w-\\[250px\\] { border: none !important; }
        }
      `}} />
      </div>
   );
}

export default ViewMDR;
