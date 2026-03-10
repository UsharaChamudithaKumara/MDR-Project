import { useState } from "react";
import axios from "axios";

function CreateMDR() {
  const [header, setHeader] = useState({
    mdr_number: "",
    mdr_date: "",
    po_number: "",
    supplier_type: "Local",
    supplier_name: "",
    supplier_reference_no: "",
    grn_no: ""
  });

  const [items, setItems] = useState([
    {
      item_description: "",
      po_quantity: "",
      received_quantity: "",
      rejected_quantity: "",
      unit: "",
      received_date: "",
      return_date: "",
      gate_pass_reference: "",
      reason: "",
      remarks: ""
    }
  ]);

  const [details, setDetails] = useState({
    inspection_done_by: "",
    department: "",
    corrective_action: "Return to Supplier",
    status: "Open"
  });

  const addItem = () => {
    setItems([...items, { ...items[0] }]);
  };

  const handleItemChange = (index, e) => {
    const updatedItems = [...items];
    updatedItems[index][e.target.name] = e.target.value;
    setItems(updatedItems);
  };

  const handleSubmit = async () => {
    try {
      await axios.post("http://localhost:5000/create-mdr", {
        header,
        items,
        details
      });
      alert("MDR Created Successfully");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto bg-white shadow-xl rounded-2xl p-8">
        
        <h2 className="text-3xl font-bold mb-8 text-gray-800">
          Create Material Discrepancy Report
        </h2>

        {/* ================= HEADER ================= */}
        <div className="grid grid-cols-2 gap-6 mb-8">
          <input
            type="text"
            placeholder="MDR Number"
            className="input-style"
            onChange={(e) => setHeader({ ...header, mdr_number: e.target.value })}
          />

          <input
            type="date"
            className="input-style"
            onChange={(e) => setHeader({ ...header, mdr_date: e.target.value })}
          />

          <input
            type="text"
            placeholder="PO Number"
            className="input-style"
            onChange={(e) => setHeader({ ...header, po_number: e.target.value })}
          />

          <select
            className="input-style"
            onChange={(e) => setHeader({ ...header, supplier_type: e.target.value })}
          >
            <option value="Local">Local</option>
            <option value="Foreign">Foreign</option>
          </select>

          <input
            type="text"
            placeholder="Supplier Name"
            className="input-style col-span-2"
            onChange={(e) => setHeader({ ...header, supplier_name: e.target.value })}
          />
        </div>

        {/* ================= ITEMS ================= */}
        <h3 className="text-xl font-semibold mb-4 text-gray-700">
          Items
        </h3>

        {items.map((item, index) => (
          <div
            key={index}
            className="grid grid-cols-5 gap-4 mb-4 p-4 bg-gray-50 rounded-xl"
          >
            <input
              placeholder="Description"
              name="item_description"
              className="input-style"
              onChange={(e) => handleItemChange(index, e)}
            />

            <input
              placeholder="PO Qty"
              name="po_quantity"
              className="input-style"
              onChange={(e) => handleItemChange(index, e)}
            />

            <input
              placeholder="Received Qty"
              name="received_quantity"
              className="input-style"
              onChange={(e) => handleItemChange(index, e)}
            />

            <input
              placeholder="Rejected Qty"
              name="rejected_quantity"
              className="input-style"
              onChange={(e) => handleItemChange(index, e)}
            />

            <select
              name="reason"
              className="input-style"
              onChange={(e) => handleItemChange(index, e)}
            >
              <option value="">Reason</option>
              <option>Damaged</option>
              <option>Quantity Shortage</option>
              <option>Quantity Excess</option>
              <option>Wrong Item</option>
              <option>Quality Issue</option>
              <option>Specification Mismatch</option>
              <option>Expired Material</option>
              <option>Packing Damage</option>
            </select>
          </div>
        ))}

        <button
          onClick={addItem}
          className="mb-8 bg-blue-500 hover:bg-blue-600 text-white px-5 py-2 rounded-lg transition"
        >
          + Add Another Item
        </button>

        {/* ================= DETAILS ================= */}
        <h3 className="text-xl font-semibold mb-4 text-gray-700">
          Inspection Details
        </h3>

        <div className="grid grid-cols-2 gap-6 mb-8">
          <input
            placeholder="Inspection Done By"
            className="input-style"
            onChange={(e) =>
              setDetails({ ...details, inspection_done_by: e.target.value })
            }
          />

          <input
            placeholder="Department"
            className="input-style"
            onChange={(e) =>
              setDetails({ ...details, department: e.target.value })
            }
          />
        </div>

        {/* ================= SUBMIT ================= */}
        <div className="text-right">
          <button
            onClick={handleSubmit}
            className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-xl shadow-lg transition"
          >
            Save MDR
          </button>
        </div>
      </div>
    </div>
  );
}

export default CreateMDR;
