import React, { useState } from "react";
import { Form, Input, Button, Typography, message, Checkbox } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import AuthService from "../services/AuthService";
import cpcLogo from "../Image/Ceylon_Petroleum_Corporation_logo.png";

const { Title, Text, Paragraph } = Typography;

const LoginPage = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      await AuthService.login(values.username, values.password);
      message.success("Login successful!");
      navigate("/");
      window.location.reload();
    } catch (error) {
      message.error(error.response?.data?.message || "Login failed");
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
              Streamline Your <span className="text-red-600">MDR</span> Management.
            </Title>
            <Paragraph style={{ color: '#94a3b8', fontSize: '1.25rem', marginBottom: '3rem' }}>
              The official portal for Ceylon Petroleum Corporation Material Discrepancy Reporting. 
              Track, manage, and resolve discrepancies with ease.
            </Paragraph>
          </motion.div>
          
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.5 }}
            className="flex gap-4 items-center"
          >
            <div className="flex -space-x-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="w-12 h-12 rounded-full border-4 border-[#1e293b] bg-slate-700 flex items-center justify-center text-xs font-bold">
                  {String.fromCharCode(64 + i)}
                </div>
              ))}
            </div>
            <Text style={{ color: '#64748b' }}>Trusted by departments across CPC.</Text>
          </motion.div>
        </div>
      </motion.div>

      {/* Right Side - Login Form */}
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
          <motion.div variants={itemVariants} className="mb-12">
            <div className="flex items-center gap-3 mb-6 lg:hidden">
              <img src={cpcLogo} alt="CPC Logo" className="w-10" />
              <Title level={3} style={{ margin: 0 }}>MDR<span className="text-red-600">System</span></Title>
            </div>
            <Title level={2} style={{ marginBottom: 8, fontSize: '2.25rem', fontWeight: 700 }}>Log in.</Title>
            <Text type="secondary" style={{ fontSize: '1rem' }}>
              Enter your credentials to access the management dashboard.
            </Text>
          </motion.div>

          <Form
            name="login"
            onFinish={onFinish}
            layout="vertical"
            size="large"
            requiredMark={false}
          >
            <motion.div variants={itemVariants}>
              <Form.Item
                label={<Text strong>Username or Email</Text>}
                name="username"
                rules={[{ required: true, message: 'Please enter your username' }]}
              >
                <Input 
                  prefix={<UserOutlined className="text-slate-400" />} 
                  placeholder="Enter your username" 
                  className="rounded-xl h-12 border-slate-200 hover:border-slate-300 focus:border-red-600 transition-all"
                />
              </Form.Item>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Form.Item
                label={<Text strong>Password</Text>}
                name="password"
                rules={[{ required: true, message: 'Please enter your password' }]}
              >
                <Input.Password 
                  prefix={<LockOutlined className="text-slate-400" />} 
                  placeholder="Enter your password" 
                  className="rounded-xl h-12 border-slate-200 hover:border-slate-300 focus:border-red-600 transition-all"
                />
              </Form.Item>
            </motion.div>

            <motion.div variants={itemVariants} className="flex justify-between items-center mb-8">
              <Form.Item name="remember" valuePropName="checked" noStyle>
                <Checkbox className="text-slate-500">Keep me signed in</Checkbox>
              </Form.Item>
              <Link to="/forgot-password" style={{ color: '#ef4444', fontWeight: 500 }} className="hover:underline">Forgot Password?</Link>
            </motion.div>

            <motion.div variants={itemVariants} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Form.Item>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  loading={loading} 
                  block 
                  className="h-14 rounded-xl text-lg font-bold bg-[#1e293b] border-[#1e293b] hover:bg-[#334155] transition-all shadow-lg hover:shadow-xl"
                  style={{ backgroundColor: '#1e293b', borderColor: '#1e293b' }}
                >
                  Sign In
                </Button>
              </Form.Item>
            </motion.div>
          </Form>

          <motion.div variants={itemVariants} className="text-center mt-10">
            <Text type="secondary">Don't have an account? </Text>
            <Link to="/signup" style={{ color: '#ef4444', fontWeight: 600 }} className="hover:underline">Sign Up Now</Link>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
