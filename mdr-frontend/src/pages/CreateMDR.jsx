import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { Form, Input, Select, DatePicker, Button, Radio, Upload, message, Table, Typography, Space, AutoComplete, Steps, Popconfirm } from "antd";
import { InboxOutlined, PlusOutlined, DeleteOutlined, ArrowLeftOutlined, BuildOutlined, SettingOutlined, PictureOutlined, ProfileOutlined, ClearOutlined } from "@ant-design/icons";

const { Dragger } = Upload;
const { Title, Text } = Typography;
const { Option } = Select;

function CreateMDR() {
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const [currentStep, setCurrentStep] = useState(0);

  const defaultItem = {
    key: "0",
    item_description: "",
    po_qty: null,
    received_qty: null,
    rejected_qty: null,
    uom: "Nos",
    received_date: null,
    return_date: null,
    gate_pass_ref: "",
    rejection_reason: "",
    rejection_remarks: ""
  };

  const [items, setItems] = useState([{ ...defaultItem }]);

  const [fileList, setFileList] = useState([]);
  const [uomOptions, setUomOptions] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasDraft, setHasDraft] = useState(false);

  const stateRef = useRef({ currentStep, items });
  useEffect(() => {
    stateRef.current = { currentStep, items };
  }, [currentStep, items]);

  useEffect(() => {
    const draft = localStorage.getItem("draftMDR");
    if (draft) {
      try {
        const parsed = JSON.parse(draft);
        let loadedDraft = false;

        if (parsed.currentStep !== undefined) {
          setCurrentStep(parsed.currentStep);
          loadedDraft = true;
        }
        if (parsed.items && parsed.items.length > 0) {
          const restoredItems = parsed.items.map(item => ({
            ...item,
            received_date: item.received_date ? dayjs(item.received_date) : null,
            return_date: item.return_date ? dayjs(item.return_date) : null,
          }));
          setItems(restoredItems);
          loadedDraft = true;
        }
        if (parsed.formValues) {
          const formVals = { ...parsed.formValues };
          if (formVals.mdr_date) formVals.mdr_date = dayjs(formVals.mdr_date);
          form.setFieldsValue(formVals);
          loadedDraft = true;
        }

        if (loadedDraft) {
          setHasDraft(true);
        }
      } catch (error) {
        console.error("Failed to parse draft MDR", error);
      }
    }
  }, [form]);

  const saveDraft = (formValues = null) => {
    const draft = {
      currentStep: stateRef.current.currentStep,
      items: stateRef.current.items,
      formValues: formValues || form.getFieldsValue()
    };
    localStorage.setItem("draftMDR", JSON.stringify(draft));
    setHasDraft(true);
  };

  useEffect(() => {
    saveDraft();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep, items]);

  const handleValuesChange = (_, allValues) => {
    saveDraft(allValues);
  };

  const handleClearDraft = () => {
    localStorage.removeItem("draftMDR");
    form.resetFields();
    setCurrentStep(0);
    setItems([{ ...defaultItem, key: new Date().getTime().toString() }]);
    setHasDraft(false);
    message.success("Draft cleared. Started fresh.");
  };

  useEffect(() => {
    const fetchUOMs = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
        const res = await axios.get(`${API_URL}/api/uom`);
        // Map to { value: 'Nos' } format for AutoComplete
        setUomOptions(res.data.map(u => ({ value: u.name })));
      } catch (error) {
        console.error("Failed to fetch UOMs:", error);
      }
    };
    fetchUOMs();
  }, []);

  const handleAddItem = () => {
    const newKey = new Date().getTime().toString();
    setItems([
      ...items,
      {
        ...defaultItem,
        key: newKey
      }
    ]);
  };

  const handleRemoveItem = (key) => {
    if (items.length > 1) {
      setItems(items.filter((item) => item.key !== key));
    }
  };

  const handleItemChange = (key, field, value) => {
    const newItems = items.map((item) => {
      if (item.key === key) {
        return { ...item, [field]: value };
      }
      return item;
    });
    setItems(newItems);
  };

  const next = async () => {
    try {
      if (currentStep === 0) {
        await form.validateFields(['po_number', 'supplier_type', 'supplier_name', 'supplier_ref', 'grn_no', 'mdr_date']);
      } else if (currentStep === 1) {
        for (const item of items) {
          if (!item.item_description || !item.received_qty || !item.rejected_qty) {
            message.error("Please fill required fields (Description, Recv Qty, Rej Qty) for all items.");
            return;
          }
          if (Number(item.rejected_qty) > Number(item.received_qty)) {
            message.error(`Rejected Quantity cannot be greater than Received Quantity for ${item.item_description || "an item"}.`);
            return;
          }
          if (item.rejection_reason === "Others" && !item.rejection_remarks?.trim()) {
            message.error(`Remarks are mandatory when Rejection Reason is 'Others' for ${item.item_description || "an item"}.`);
            return;
          }
        }
      } else if (currentStep === 2) {
        await form.validateFields(['inspection_by', 'department', 'corrective_action']);
      }
      setCurrentStep(currentStep + 1);
    } catch (error) {
      console.log('Validation Failed:', error);
    }
  };

  const prev = () => {
    setCurrentStep(currentStep - 1);
  };

  const onFinish = async (values) => {
    setIsSubmitting(true);
    try {
      // Validate items (Reject Qty <= Received Qty, and 'Other' requires remarks)
      for (const item of items) {
        if (!item.item_description || !item.received_qty || !item.rejected_qty) {
          message.error("Please fill required fields (Description, Recv Qty, Rej Qty) for all items.");
          return;
        }
        if (Number(item.rejected_qty) > Number(item.received_qty)) {
          message.error(`Rejected Quantity cannot be greater than Received Quantity for ${item.item_description || "an item"}.`);
          return;
        }
        if (item.rejection_reason === "Others" && !item.rejection_remarks?.trim()) {
          message.error(`Remarks are mandatory when Rejection Reason is 'Others' for ${item.item_description || "an item"}.`);
          return;
        }
      }

      const formData = new FormData();

      const headerData = {
        mdr_date: values.mdr_date ? values.mdr_date.format('YYYY-MM-DD') : null,
        po_number: values.po_number,
        supplier_type: values.supplier_type,
        supplier_name: values.supplier_name,
        supplier_ref: values.supplier_ref,
        grn_no: values.grn_no,
        inspection_by: values.inspection_by,
        department: values.department,
        status: values.status || "Open",
        corrective_action: values.corrective_action
      };

      const itemsData = items.map(item => ({
        ...item,
        received_date: item.received_date ? item.received_date.format('YYYY-MM-DD') : null,
        return_date: item.return_date ? item.return_date.format('YYYY-MM-DD') : null
      }));

      formData.append("header", JSON.stringify(headerData));
      formData.append("items", JSON.stringify(itemsData));

      fileList.forEach((file) => {
        formData.append("evidence_photos", file.originFileObj);
      });

      const res = await axios.post("http://localhost:5000/create-mdr", formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });

      message.success(`MDR ${res.data.mdr_number} Created Successfully`);
      localStorage.removeItem("draftMDR");
      navigate("/");
    } catch (error) {
      console.error(error);
      message.error(error.response?.data?.error || "Failed to create MDR");
    } finally {
      setIsSubmitting(false);
    }
  };

  const uploadProps = {
    onRemove: (file) => {
      const index = fileList.indexOf(file);
      const newFileList = fileList.slice();
      newFileList.splice(index, 1);
      setFileList(newFileList);
    },
    beforeUpload: (file) => {
      const isImage = file.type.startsWith('image/');
      if (!isImage) {
        message.error(`${file.name} is not an image file`);
        return Upload.LIST_IGNORE;
      }
      return true; // Allow upload to trigger customRequest
    },
    customRequest: ({ file, onSuccess, onProgress }) => {
      // Simulate upload progress
      let percent = 0;
      const interval = setInterval(() => {
        percent += 10;
        if (percent >= 100) {
          clearInterval(interval);
          onProgress({ percent: 100 });
          onSuccess("ok");
          // Add to fileList with success status
          const newFile = { ...file, status: 'done', originFileObj: file };
          setFileList(prev => [...prev, newFile]);
        } else {
          onProgress({ percent });
        }
      }, 100);
    },
    fileList,
    listType: "picture",
    accept: "image/*",
    multiple: true,
    showUploadList: {
      showRemoveIcon: true,
      showPreviewIcon: true,
    }
  };


  const SectionTitle = ({ step, title, icon }) => (
    <div className="flex items-center gap-3 mb-6">
      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#344D67]/10 text-[#344D67] font-bold text-sm">
        {step}
      </div>
      <span className="text-lg font-bold text-slate-800 tracking-tight flex items-center gap-2">
        {icon}
        {title}
      </span>
    </div>
  );

  return (
    <div className="font-sans fade-in pb-12">
      <div className="flex items-center mb-8">
        <Button 
          type="text" 
          onClick={() => navigate("/")} 
          icon={<ArrowLeftOutlined className="text-lg" />} 
          className="mr-4 hover:bg-slate-200 text-slate-600 w-10 h-10 flex items-center justify-center rounded-full transition-colors" 
        />
        <div className="flex-1 flex justify-between items-center">
          <div>
            <Title level={2} className="m-0 text-slate-800 tracking-tight" style={{ marginBottom: 0 }}>Create New MDR</Title>
            <Text className="text-slate-500 font-medium text-base">Fill out the details below to log a new material discrepancy report</Text>
          </div>
          {hasDraft && (
            <Popconfirm
              title="Clear Draft"
              description="Are you sure you want to discard your unsaved progress?"
              onConfirm={handleClearDraft}
              okText="Yes, Clear"
              cancelText="No"
              okButtonProps={{ className: "bg-red-500 hover:bg-red-600 text-white border-none shadow-sm" }}
            >
              <Button type="default" danger icon={<ClearOutlined />}>
                Clear Draft
              </Button>
            </Popconfirm>
          )}
        </div>
      </div>

      <div className="glass-panel rounded-2xl p-6 sm:p-10 border border-white/40 shadow-xl">
        <div className="mb-10 max-w-3xl mx-auto">
          <Steps
            current={currentStep}
            items={[
              { title: 'Header Information' },
              { title: 'Item Details' },
              { title: 'Inspection' },
              { title: 'Evidence' },
            ]}
          />
        </div>
        
        <Form form={form} layout="vertical" onFinish={onFinish} requiredMark={false} className="modern-form" onValuesChange={handleValuesChange}>

          {/* Section 1: Basic Info */}
          <div className={`mb-10 bg-white p-6 sm:p-8 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow ${currentStep !== 0 ? 'hidden' : ''}`}>
            <SectionTitle step="1" title="PO & Supplier Information" icon={<BuildOutlined className="text-slate-400" />} />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-4">
              <Form.Item label={<span className="font-semibold text-slate-700">MDR Number</span>}>
                <Input size="large" className="rounded-lg bg-slate-100 text-slate-500 font-medium cursor-not-allowed" placeholder="Auto-generated on submit" disabled />
              </Form.Item>
              <Form.Item name="po_number" label={<span className="font-semibold text-slate-700">PO Number</span>} rules={[{ required: true, message: 'Required' }]}>
                <Input size="large" className="rounded-lg bg-slate-50 focus:bg-white" placeholder="e.g. PO-2026-001" />
              </Form.Item>
              <Form.Item name="supplier_type" label={<span className="font-semibold text-slate-700">Supplier Type</span>} rules={[{ required: true }]} initialValue="Local">
                <Select size="large" className="rounded-lg bg-slate-50 focus:bg-white">
                  <Option value="Local">Local</Option>
                  <Option value="Foreign">Foreign</Option>
                </Select>
              </Form.Item>
              <Form.Item name="supplier_name" label={<span className="font-semibold text-slate-700">Supplier Name</span>} rules={[{ required: true, message: 'Required' }]}>
                <Input size="large" className="rounded-lg bg-slate-50 focus:bg-white" placeholder="Enter Supplier Name" />
              </Form.Item>
              <Form.Item name="supplier_ref" label={<span className="font-semibold text-slate-700">Supplier Ref No</span>}>
                <Input size="large" className="rounded-lg bg-slate-50 focus:bg-white" placeholder="Optional" />
              </Form.Item>
              <Form.Item name="grn_no" label={<span className="font-semibold text-slate-700">GRN Number</span>}>
                <Input size="large" className="rounded-lg bg-slate-50 focus:bg-white" placeholder="Optional" />
              </Form.Item>
              <Form.Item name="mdr_date" label={<span className="font-semibold text-slate-700">MDR Date</span>} rules={[{ required: true, message: 'Required' }]}>
                <DatePicker size="large" style={{ width: '100%' }} className="rounded-lg bg-slate-50 focus:bg-white" />
              </Form.Item>
            </div>
          </div>

          {/* Section 2: Items Table - Card Based Layout */}
          <div className={`mb-10 bg-transparent ${currentStep !== 1 ? 'hidden' : ''}`}>
            <div className="flex justify-between items-center mb-6 bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
              <SectionTitle step="2" title="Item Details" icon={<ProfileOutlined className="text-slate-400" />} />
              <Button type="primary" icon={<PlusOutlined />} onClick={handleAddItem} className="bg-[#344D67] hover:bg-[#2a3e52] flex items-center h-10 px-4 font-medium rounded-lg shadow-sm">
                Add Item
              </Button>
            </div>

            <div className="flex flex-col gap-6">
              {items.map((item, index) => (
                <div key={item.key} className="bg-white p-6 sm:p-8 rounded-xl border border-slate-100 shadow-sm relative hover:shadow-md transition-shadow">
                  <div className="absolute top-6 right-6 flex items-center gap-4">
                    <div className="text-slate-400 font-medium text-sm">Item #{index + 1}</div>
                    <Button 
                      type="text" 
                      danger 
                      onClick={() => handleRemoveItem(item.key)} 
                      icon={<DeleteOutlined className="text-lg" />} 
                      disabled={items.length === 1}
                      className="hover:bg-red-50 flex items-center justify-center w-8 h-8 rounded-full"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-x-6 gap-y-5 mt-2">
                    
                    {/* Row 1: Description and UoM */}
                    <div className="lg:col-span-8">
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Item Description <span className="text-red-500">*</span></label>
                      <Input 
                        size="large" 
                        className="rounded-lg bg-slate-50 focus:bg-white w-full" 
                        value={item.item_description} 
                        onChange={e => handleItemChange(item.key, "item_description", e.target.value)} 
                        placeholder="Enter detailed description"
                      />
                    </div>
                    <div className="lg:col-span-4">
                      <label className="block text-sm font-semibold text-slate-700 mb-2">UoM</label>
                      <AutoComplete
                        options={uomOptions}
                        value={item.uom}
                        onChange={v => handleItemChange(item.key, "uom", v)}
                        filterOption={(inputValue, option) => option.value.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1}
                        className="w-full"
                      >
                        <Input size="large" className="rounded-lg bg-slate-50 focus:bg-white w-full" />
                      </AutoComplete>
                    </div>

                    {/* Row 2: Quantities */}
                    <div className="lg:col-span-4">
                      <label className="block text-sm font-semibold text-slate-700 mb-2">PO Quantity</label>
                      <Input 
                        size="large" 
                        className="rounded-lg bg-slate-50 focus:bg-white w-full" 
                        type="number" 
                        value={item.po_qty} 
                        onChange={e => handleItemChange(item.key, "po_qty", e.target.value)} 
                        placeholder="0"
                      />
                    </div>
                    <div className="lg:col-span-4">
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Received Qty <span className="text-red-500">*</span></label>
                      <Input 
                        size="large" 
                        className="rounded-lg bg-slate-50 focus:bg-white w-full" 
                        type="number" 
                        value={item.received_qty} 
                        onChange={e => handleItemChange(item.key, "received_qty", e.target.value)} 
                        placeholder="0"
                      />
                    </div>
                    <div className="lg:col-span-4">
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Rejected Qty <span className="text-red-500">*</span></label>
                      <Input 
                        size="large" 
                        className="rounded-lg bg-slate-50 focus:bg-white border-red-200 w-full" 
                        type="number" 
                        value={item.rejected_qty} 
                        onChange={e => handleItemChange(item.key, "rejected_qty", e.target.value)} 
                        placeholder="0"
                      />
                    </div>

                    {/* Row 3: Dates */}
                    <div className="lg:col-span-4">
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Received Date</label>
                      <DatePicker 
                        size="large" 
                        className="rounded-lg bg-slate-50 focus:bg-white w-full" 
                        value={item.received_date} 
                        onChange={d => handleItemChange(item.key, "received_date", d)} 
                      />
                    </div>
                    <div className="lg:col-span-4">
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Return Date</label>
                      <DatePicker 
                        size="large" 
                        className="rounded-lg bg-slate-50 focus:bg-white w-full" 
                        value={item.return_date} 
                        onChange={d => handleItemChange(item.key, "return_date", d)} 
                      />
                    </div>
                    <div className="lg:col-span-4">
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Gate Pass Ref</label>
                      <Input 
                        size="large" 
                        className="rounded-lg bg-slate-50 focus:bg-white w-full" 
                        value={item.gate_pass_ref} 
                        onChange={e => handleItemChange(item.key, "gate_pass_ref", e.target.value)} 
                        placeholder="Reference number"
                      />
                    </div>

                    {/* Row 4: Rejection Details */}
                    <div className="lg:col-span-5">
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Rejection Reason <span className="text-red-500">*</span></label>
                      <Select 
                        size="large" 
                        className="w-full rounded-lg" 
                        placeholder="Select Reason" 
                        value={item.rejection_reason || undefined} 
                        onChange={v => handleItemChange(item.key, "rejection_reason", v)}
                      >
                        <Option value="Damaged">Damaged</Option>
                        <Option value="Quantity Shortage">Quantity Shortage</Option>
                        <Option value="Quantity Excess">Quantity Excess</Option>
                        <Option value="Wrong Item">Wrong Item</Option>
                        <Option value="Quality Issue">Quality Issue</Option>
                        <Option value="Specification Mismatch">Specification Mismatch</Option>
                        <Option value="Expired Material">Expired Material</Option>
                        <Option value="Packing Damage">Packing Damage</Option>
                        <Option value="Others">Others</Option>
                      </Select>
                    </div>
                    <div className="lg:col-span-7">
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Remarks</label>
                      <Input
                        size="large"
                        className="rounded-lg bg-slate-50 focus:bg-white w-full"
                        status={item.rejection_reason === "Others" && !item.rejection_remarks?.trim() ? "error" : ""}
                        placeholder={item.rejection_reason === "Others" ? "Mandatory when 'Others' selected" : "Optional remarks"}
                        value={item.rejection_remarks}
                        onChange={e => handleItemChange(item.key, "rejection_remarks", e.target.value)}
                      />
                    </div>

                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            {/* Section 3: Inspection Details */}
            <div className={`mb-10 bg-white p-6 sm:p-8 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow flex flex-col ${currentStep !== 2 ? 'hidden' : ''}`}>
              <SectionTitle step="3" title="Inspection & Action" icon={<SettingOutlined className="text-slate-400" />} />
              <Form.Item name="inspection_by" label={<span className="font-semibold text-slate-700">Inspection Done By</span>} rules={[{ required: true, message: 'Required' }]}>
                <Input size="large" className="rounded-lg bg-slate-50 focus:bg-white" placeholder="Inspector Name" />
              </Form.Item>
              <Form.Item name="department" label={<span className="font-semibold text-slate-700">Department</span>}>
                <Input size="large" className="rounded-lg bg-slate-50 focus:bg-white" placeholder="e.g. Quality Control" />
              </Form.Item>
              <Form.Item name="corrective_action" label={<span className="font-semibold text-slate-700 mb-2 block">Corrective Action Required</span>} initialValue="Return to Supplier">
                <Radio.Group className="flex flex-col gap-3 w-full">
                  <div className="p-3 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"><Radio value="Return to Supplier" className="w-full font-medium">Return to Supplier</Radio></div>
                  <div className="p-3 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"><Radio value="Replacement Required" className="w-full font-medium">Replacement Required</Radio></div>
                  <div className="p-3 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"><Radio value="Credit Note Required" className="w-full font-medium">Credit Note Required</Radio></div>
                </Radio.Group>
              </Form.Item>
              <Form.Item name="status" label={<span className="font-semibold text-slate-700 mb-2 block">Status</span>} initialValue="Open">
                <Select size="large" className="rounded-lg bg-slate-50 focus:bg-white w-full">
                  <Option value="Open">Open</Option>
                  <Option value="Pending Supplier Response">Pending Supplier Response</Option>
                  <Option value="Closed">Closed</Option>
                  <Option value="Complete">Complete</Option>
                </Select>
              </Form.Item>
            </div>

            {/* Section 4: Media Upload */}
            <div className={`mb-10 bg-white p-6 sm:p-8 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow flex flex-col ${currentStep !== 3 ? 'hidden' : ''}`}>
              <SectionTitle step="4" title="Photographic Evidence" icon={<PictureOutlined className="text-slate-400" />} />
              <Text className="text-slate-500 mb-6 block">Upload distinct images of the damaged or non-conforming items to support your discrepancy report.</Text>
              <div className="flex-1">
                <Dragger {...uploadProps} className="rounded-xl overflow-hidden custom-dragger border-2 border-dashed border-slate-300 hover:border-[#344D67] bg-slate-50 hover:bg-[#344D67]/5 transition-colors">
                  <p className="ant-upload-drag-icon pt-6">
                    <InboxOutlined className="text-[#344D67] text-5xl opacity-50" />
                  </p>
                  <p className="ant-upload-text font-bold text-slate-700 text-lg mt-4">Click or drag file to this area to upload</p>
                  <p className="ant-upload-hint text-slate-500 px-8 pb-8 mt-2">
                    Support for a single or bulk upload. Strictly prohibited from uploading company data or other banned files.
                  </p>
                </Dragger>
              </div>
            </div>
          </div>

          <div className="bg-slate-100 h-px w-full my-8"></div>

          {/* Form Actions */}
          <div className="flex justify-end gap-4 mt-8">
            {currentStep > 0 && (
              <Button size="large" onClick={prev} className="px-8 font-medium h-12 rounded-xl text-slate-600 hover:text-slate-800 border-slate-300">
                Previous
              </Button>
            )}
            {currentStep < 3 && (
              <Button type="primary" size="large" onClick={next} className="bg-[#344D67] hover:bg-[#2a3e52] shadow-md border-none font-bold outline-none px-12 h-12 rounded-xl flex items-center">
                Next Step
              </Button>
            )}
            {currentStep === 3 && (
              <>
                <Button size="large" onClick={() => navigate("/")} className="px-8 font-medium h-12 rounded-xl text-slate-600 hover:text-slate-800 border-slate-300">
                  Cancel
                </Button>
                <Button type="primary" htmlType="submit" size="large" loading={isSubmitting} className="bg-[#FF0000] hover:bg-[#cc0000] shadow-md border-none font-bold outline-none px-12 h-12 rounded-xl flex items-center">
                  Submit MDR
                </Button>
              </>
            )}
          </div>

        </Form>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .fade-in { animation: fadeIn 0.5s ease-in-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .nested-form-table .ant-table-thead > tr > th { background: #f8fafc; color: #475569; font-weight: 600; padding: 12px; border-bottom: 1px solid #e2e8f0; }
        .nested-form-table .ant-table-tbody > tr > td { padding: 12px; border-bottom: 1px solid #f1f5f9; }
        .modern-form .ant-form-item-label > label { color: #334155; }
        .custom-dragger .ant-upload-btn { padding: 0 !important; }
      `}} />
    </div>
  );
}

export default CreateMDR;
