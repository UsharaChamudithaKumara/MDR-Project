import { useState, useEffect } from "react";
import { 
  Card, 
  Avatar, 
  Descriptions, 
  Button, 
  Upload, 
  message, 
  Input, 
  Form, 
  Row, 
  Col, 
  Divider, 
  Tag,
  Typography,
  Space,
  Skeleton
} from "antd";
import { 
  UserOutlined, 
  UploadOutlined, 
  MailOutlined, 
  PhoneOutlined, 
  IdcardOutlined, 
  BankOutlined, 
  SafetyCertificateOutlined,
  EditOutlined,
  SaveOutlined,
  CloseOutlined
} from "@ant-design/icons";
import UserService from "../services/UserService";
import AuthService from "../services/AuthService";

const { Title, Text } = Typography;

function ProfilePage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form] = Form.useForm();
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await UserService.getProfile();
      setUser(data);
      form.setFieldsValue(data);
    } catch (error) {
      message.error("Failed to fetch profile details");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (values) => {
    try {
      setLoading(true);
      const result = await UserService.updateProfile(values);
      setUser(result.user);
      AuthService.updateLocalUser(result.user);
      setEditing(false);
      message.success("Profile updated successfully");
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Failed to update profile";
      message.error(errorMsg);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (info) => {
    if (info.file.status === 'uploading') {
      setUploading(true);
      return;
    }
    if (info.file.status === 'done' || info.file.status === 'error') {
        // Since we are using a custom manual update, we handle it differently
        setUploading(false);
    }
  };

  const customRequest = async ({ file, onSuccess, onError }) => {
    try {
      setUploading(true);
      const result = await UserService.updateProfile({ profile_image: file });
      setUser(result.user);
      AuthService.updateLocalUser(result.user);
      message.success("Profile picture updated");
      onSuccess("ok");
    } catch (error) {
      message.error("Upload failed");
      onError(error);
    } finally {
      setUploading(false);
    }
  };

  if (loading && !user) {
    return (
      <div className="p-8">
        <Card>
          <Skeleton avatar active paragraph={{ rows: 4 }} />
        </Card>
      </div>
    );
  }

  const profileImageUrl = user?.profile_image 
    ? `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${user.profile_image}` 
    : null;

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      <Title level={2} className="mb-8 text-slate-800 flex items-center gap-3">
        <UserOutlined className="text-red-600" /> User Profile
      </Title>

      <Row gutter={[24, 24]}>
        <Col xs={24} md={8}>
          <Card 
            className="text-center shadow-md border-none rounded-2xl overflow-hidden bg-white/80 backdrop-blur-sm"
            cover={
              <div className="h-32 bg-gradient-to-r from-slate-800 to-slate-900 relative">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
              </div>
            }
          >
            <div className="-mt-16 mb-4 flex justify-center relative">
              <div className="p-1 bg-white rounded-full shadow-xl">
                <Avatar 
                  size={120} 
                  src={profileImageUrl}
                  icon={<UserOutlined />} 
                  className="border-2 border-slate-100"
                />
                <Upload
                  showUploadList={false}
                  customRequest={customRequest}
                  className="absolute bottom-1 right-1/2 translate-x-14"
                >
                  <Button 
                    type="primary" 
                    shape="circle" 
                    icon={<UploadOutlined />} 
                    size="small" 
                    loading={uploading}
                    className="bg-red-600 border-red-600 hover:bg-red-700 shadow-lg"
                  />
                </Upload>
              </div>
            </div>
            
            <Title level={4} className="m-0 mb-1">{user?.full_name || user?.username}</Title>
            <Text type="secondary" className="block mb-4">{user?.designation || "Member"}</Text>
            
            <div className="flex justify-center gap-2 mb-6">
              <Tag color={user?.role === 'super_admin' ? 'red' : user?.role === 'admin' ? 'blue' : 'green'} className="rounded-full px-3 font-semibold uppercase text-[10px]">
                {user?.role}
              </Tag>
              <Tag color={user?.status === 'approved' ? 'success' : 'warning'} className="rounded-full px-3 font-semibold uppercase text-[10px]">
                {user?.status}
              </Tag>
            </div>

            <Divider className="my-4" />

            <div className="text-left px-2">
               <div className="flex items-center gap-3 mb-3">
                  <MailOutlined className="text-slate-400" />
                  <Text className="text-slate-600 truncate">{user?.email}</Text>
               </div>
               <div className="flex items-center gap-3 mb-3">
                  <PhoneOutlined className="text-slate-400" />
                  <Text className="text-slate-600">{user?.phone_number || "Not provided"}</Text>
               </div>
               <div className="flex items-center gap-3">
                  <BankOutlined className="text-slate-400" />
                  <Text className="text-slate-600">{user?.department || "General"}</Text>
               </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} md={16}>
          <Card 
            className="shadow-md border-none rounded-2xl bg-white/80 backdrop-blur-sm"
            title={
              <div className="flex justify-between items-center py-2">
                <span className="font-bold text-slate-800">Account Information</span>
                {!editing ? (
                  <Button 
                    type="primary" 
                    icon={<EditOutlined />} 
                    onClick={() => setEditing(true)}
                    className="bg-slate-800 border-slate-800 hover:bg-slate-700"
                  >
                    Edit Profile
                  </Button>
                ) : (
                  <Space>
                    <Button 
                      icon={<CloseOutlined />} 
                      onClick={() => setEditing(false)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="primary" 
                      icon={<SaveOutlined />} 
                      onClick={() => form.submit()}
                      className="bg-green-600 border-green-600 hover:bg-green-700"
                    >
                      Save Changes
                    </Button>
                  </Space>
                )}
              </div>
            }
          >
            {!editing ? (
              <Descriptions column={1} bordered size="middle" className="custom-descriptions">
                <Descriptions.Item label={<><IdcardOutlined className="mr-2" /> Username</>}>
                  {user?.username}
                </Descriptions.Item>
                <Descriptions.Item label={<><MailOutlined className="mr-2" /> Email Address</>}>
                  {user?.email}
                </Descriptions.Item>
                <Descriptions.Item label={<><UserOutlined className="mr-2" /> Full Name</>}>
                  {user?.full_name || <Text type="secondary" italic>Not set</Text>}
                </Descriptions.Item>
                <Descriptions.Item label={<><PhoneOutlined className="mr-2" /> Phone Number</>}>
                  {user?.phone_number || <Text type="secondary" italic>Not set</Text>}
                </Descriptions.Item>
                <Descriptions.Item label={<><SafetyCertificateOutlined className="mr-2" /> EPF Number</>}>
                  {user?.epf_number || <Text type="secondary" italic>Not set</Text>}
                </Descriptions.Item>
                <Descriptions.Item label={<><BankOutlined className="mr-2" /> Department</>}>
                  {user?.department || <Text type="secondary" italic>Not set</Text>}
                </Descriptions.Item>
                <Descriptions.Item label={<><UserOutlined className="mr-2" /> Designation</>}>
                  {user?.designation || <Text type="secondary" italic>Not set</Text>}
                </Descriptions.Item>
                <Descriptions.Item label={<><UserOutlined className="mr-2" /> Member Since</>}>
                  {user?.created_at ? new Date(user.created_at).toLocaleDateString() : "N/A"}
                </Descriptions.Item>
              </Descriptions>
            ) : (
              <Form
                form={form}
                layout="vertical"
                onFinish={handleUpdate}
                initialValues={user}
                className="mt-2"
              >
                <Row gutter={16}>
                  <Col span={24}>
                    <Form.Item label="Full Name" name="full_name">
                      <Input prefix={<UserOutlined />} placeholder="Enter your full name" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item label="Email" name="email" rules={[{ type: 'email', message: 'Invalid email' }]}>
                      <Input prefix={<MailOutlined />} placeholder="Enter email" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item label="Phone Number" name="phone_number">
                      <Input prefix={<PhoneOutlined />} placeholder="Enter phone number" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item label="EPF Number" name="epf_number">
                      <Input prefix={<SafetyCertificateOutlined />} placeholder="Enter EPF number" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item label="Department" name="department">
                      <Input prefix={<BankOutlined />} placeholder="Enter department" />
                    </Form.Item>
                  </Col>
                  <Col span={24}>
                    <Form.Item label="Designation" name="designation">
                      <Input prefix={<UserOutlined />} placeholder="Enter designation (e.g. Manager, Engineer)" />
                    </Form.Item>
                  </Col>
                  <Col span={24}>
                    <Divider className="my-2">Change Password (Optional)</Divider>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item 
                      label="New Password" 
                      name="new_password"
                      rules={[
                        { 
                          pattern: /^[A-Z](?=.*[a-z])(?=.*\d)(?=.*[^a-zA-Z0-9\s]).*$/, 
                          message: "Must start with a capital letter and contain at least one lowercase, one number, and one symbol" 
                        }
                      ]}
                    >
                      <Input.Password placeholder="Leave blank to keep current" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item 
                      label="Confirm Password" 
                      name="confirm_password"
                      dependencies={['new_password']}
                      rules={[
                        ({ getFieldValue }) => ({
                          validator(_, value) {
                            if (!value || getFieldValue('new_password') === value) {
                              return Promise.resolve();
                            }
                            return Promise.reject(new Error('The two passwords do not match!'));
                          },
                        }),
                      ]}
                    >
                      <Input.Password placeholder="Confirm new password" />
                    </Form.Item>
                  </Col>
                </Row>
              </Form>
            )}
          </Card>
        </Col>
      </Row>
      
      <style jsx>{`
        .custom-descriptions .ant-descriptions-item-label {
          background-color: #f8fafc;
          min-width: 140px;
          white-space: nowrap;
          color: #64748b;
          font-weight: 600;
        }
        .custom-descriptions .ant-descriptions-item-content {
          color: #1e293b;
        }
      `}</style>
    </div>
  );
}

export default ProfilePage;
