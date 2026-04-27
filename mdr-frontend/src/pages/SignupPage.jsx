import React, { useState } from "react";
import { Form, Input, Button, Typography, message, Select, Row, Col } from "antd";
import { UserOutlined, LockOutlined, MailOutlined, UserAddOutlined, PhoneOutlined, BankOutlined, SafetyCertificateOutlined, IdcardOutlined } from "@ant-design/icons";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import AuthService from "../services/AuthService";
import cpcLogo from "../Image/Ceylon_Petroleum_Corporation_logo.png";

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

const SignupPage = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      await AuthService.register(values);
      message.success("Registration successful! Please login.");
      navigate("/login");
    } catch (error) {
      message.error(error.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { duration: 0.6, staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5 } }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 overflow-hidden">
      {/* Left Side - Image/Content */}
      <motion.div 
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="hidden lg:flex lg:w-3/5 bg-[#1e293b] relative overflow-hidden items-center justify-center p-20"
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2"></div>
        
        <div className="z-10 text-white max-w-xl">
          <motion.img 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            src={cpcLogo} alt="CPC Logo" className="w-24 mb-10 drop-shadow-2xl" 
          />
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            <Title level={1} style={{ color: 'white', fontSize: '3.5rem', fontWeight: 800, marginBottom: '1.5rem', lineHeight: 1.1 }}>
              Join the <span className="text-red-600">MDR</span> Team.
            </Title>
            <Paragraph style={{ color: '#94a3b8', fontSize: '1.25rem', marginBottom: '3rem' }}>
              Create your account to start managing Material Discrepancy Reports. 
              Join our network of inspectors and administrators today.
            </Paragraph>
          </motion.div>
          
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.5 }}
            className="flex bg-white/5 backdrop-blur-sm p-6 rounded-2xl border border-white/10"
          >
            <div className="mr-4">
              <div className="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center text-xl shadow-lg">
                <UserAddOutlined />
              </div>
            </div>
            <div>
              <Text strong style={{ color: 'white', display: 'block', fontSize: '1.1rem' }}>Quick onboarding.</Text>
              <Text style={{ color: '#94a3b8' }}>Get set up and ready to report in less than 2 minutes.</Text>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Right Side - Signup Form */}
      <motion.div 
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full lg:w-2/5 flex items-center justify-center p-8 bg-white lg:rounded-l-[40px] shadow-2xl z-20"
      >
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="w-full max-w-md"
        >
          <motion.div variants={itemVariants} className="mb-10">
            <div className="flex items-center gap-3 mb-6 lg:hidden">
              <img src={cpcLogo} alt="CPC Logo" className="w-10" />
              <Title level={3} style={{ margin: 0 }}>MDR<span className="text-red-600">System</span></Title>
            </div>
            <Title level={2} style={{ marginBottom: 8, fontSize: '2.25rem', fontWeight: 700 }}>Create Account.</Title>
            <Text type="secondary" style={{ fontSize: '1rem' }}>
              Fill in your details to register for the MDR dashboard.
            </Text>
          </motion.div>

          <Form
            name="register"
            onFinish={onFinish}
            layout="vertical"
            size="large"
            requiredMark={false}
            initialValues={{ role: 'user' }}
          >
            <Row gutter={16}>
              <Col span={24}>
                <motion.div variants={itemVariants}>
                  <Form.Item
                    label={<Text strong>Username</Text>}
                    name="username"
                    rules={[{ required: true, message: 'Please enter your username' }]}
                  >
                    <Input 
                      prefix={<IdcardOutlined className="text-slate-400" />} 
                      placeholder="Choose a username" 
                      className="rounded-xl h-12 border-slate-200 hover:border-slate-300 focus:border-red-600 transition-all"
                    />
                  </Form.Item>
                </motion.div>
              </Col>

              <Col span={24}>
                <motion.div variants={itemVariants}>
                  <Form.Item
                    label={<Text strong>Full Name</Text>}
                    name="full_name"
                    rules={[{ required: true, message: 'Please enter your full name' }]}
                  >
                    <Input 
                      prefix={<UserOutlined className="text-slate-400" />} 
                      placeholder="Enter your full name" 
                      className="rounded-xl h-12 border-slate-200 hover:border-slate-300 focus:border-red-600 transition-all"
                    />
                  </Form.Item>
                </motion.div>
              </Col>

              <Col xs={24} sm={12}>
                <motion.div variants={itemVariants}>
                  <Form.Item
                    label={<Text strong>Email Address</Text>}
                    name="email"
                    rules={[
                      { required: true, message: 'Please enter your email' },
                      { type: 'email', message: 'Please enter a valid email' }
                    ]}
                  >
                    <Input 
                      prefix={<MailOutlined className="text-slate-400" />} 
                      placeholder="Enter your email" 
                      className="rounded-xl h-12 border-slate-200 hover:border-slate-300 focus:border-red-600 transition-all"
                    />
                  </Form.Item>
                </motion.div>
              </Col>

              <Col xs={24} sm={12}>
                <motion.div variants={itemVariants}>
                  <Form.Item
                    label={<Text strong>Phone Number</Text>}
                    name="phone_number"
                    rules={[
                      { 
                        pattern: /^\+?[0-9]{9,15}$/, 
                        message: "Invalid phone number format. Use 9-15 digits, optionally starting with '+'" 
                      }
                    ]}
                  >
                    <Input 
                      prefix={<PhoneOutlined className="text-slate-400" />} 
                      placeholder="Enter phone number" 
                      className="rounded-xl h-12 border-slate-200 hover:border-slate-300 focus:border-red-600 transition-all"
                    />
                  </Form.Item>
                </motion.div>
              </Col>

              <Col xs={24} sm={12}>
                <motion.div variants={itemVariants}>
                  <Form.Item
                    label={<Text strong>EPF Number</Text>}
                    name="epf_number"
                  >
                    <Input 
                      prefix={<SafetyCertificateOutlined className="text-slate-400" />} 
                      placeholder="Enter EPF number" 
                      className="rounded-xl h-12 border-slate-200 hover:border-slate-300 focus:border-red-600 transition-all"
                    />
                  </Form.Item>
                </motion.div>
              </Col>

              <Col xs={24} sm={12}>
                <motion.div variants={itemVariants}>
                  <Form.Item
                    label={<Text strong>Department</Text>}
                    name="department"
                  >
                    <Input 
                      prefix={<BankOutlined className="text-slate-400" />} 
                      placeholder="Enter department" 
                      className="rounded-xl h-12 border-slate-200 hover:border-slate-300 focus:border-red-600 transition-all"
                    />
                  </Form.Item>
                </motion.div>
              </Col>

              <Col xs={24} sm={12}>
                <motion.div variants={itemVariants}>
                  <Form.Item
                    label={<Text strong>Designation</Text>}
                    name="designation"
                  >
                    <Input 
                      prefix={<UserOutlined className="text-slate-400" />} 
                      placeholder="Enter designation" 
                      className="rounded-xl h-12 border-slate-200 hover:border-slate-300 focus:border-red-600 transition-all"
                    />
                  </Form.Item>
                </motion.div>
              </Col>

              <Col xs={24} sm={12}>
                <motion.div variants={itemVariants}>
                  <Form.Item
                    label={<Text strong>Role</Text>}
                    name="role"
                  >
                    <Select className="rounded-xl h-12 border-slate-200 transition-all focus:border-red-600">
                      <Option value="user">User</Option>
                      <Option value="admin">Admin</Option>
                    </Select>
                  </Form.Item>
                </motion.div>
              </Col>

              <Col span={24}>
                <motion.div variants={itemVariants}>
                  <Form.Item
                    label={<Text strong>Password</Text>}
                    name="password"
                    rules={[
                      { required: true, message: 'Please enter a password' },
                      { 
                        pattern: /^[A-Z](?=.*[a-z])(?=.*\d)(?=.*[^a-zA-Z0-9\s]).*$/, 
                        message: 'Password must start with a capital letter and contain at least one lowercase letter, one number, and one symbol' 
                      }
                    ]}
                  >
                    <Input.Password 
                      prefix={<LockOutlined className="text-slate-400" />} 
                      placeholder="Create a password" 
                      className="rounded-xl h-12 border-slate-200 hover:border-slate-300 focus:border-red-600 transition-all"
                    />
                  </Form.Item>
                </motion.div>
              </Col>
            </Row>

            <motion.div variants={itemVariants} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} style={{ marginTop: 24 }}>
              <Form.Item>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  loading={loading} 
                  block 
                  className="h-14 rounded-xl text-lg font-bold bg-[#1e293b] border-[#1e293b] hover:bg-[#334155] transition-all shadow-lg hover:shadow-xl"
                  style={{ backgroundColor: '#1e293b', borderColor: '#1e293b' }}
                >
                  Sign Up
                </Button>
              </Form.Item>
            </motion.div>
          </Form>

          <motion.div variants={itemVariants} className="text-center mt-8">
            <Text type="secondary">Already have an account? </Text>
            <Link to="/login" style={{ color: '#ef4444', fontWeight: 600 }} className="hover:underline">Log In Here</Link>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default SignupPage;
