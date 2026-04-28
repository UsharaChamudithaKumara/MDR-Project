import { BellOutlined, UserOutlined, SettingOutlined } from "@ant-design/icons";
import { Badge, Avatar, Dropdown } from "antd";

function Topbar() {
  const userMenu = {
    items: [
      { key: '1', label: 'Profile', icon: <UserOutlined /> },
      { key: '2', label: 'Settings', icon: <SettingOutlined /> },
      { type: 'divider' },
      { key: '3', label: 'Logout', danger: true },
    ]
  };

  return (
    <div className="h-20 glass-card sticky top-0 z-10 w-full flex items-center justify-between px-8 transition-all duration-300 border-b border-transparent">
      <div className="flex items-center">
        <h2 className="text-2xl font-bold text-gradient hidden md:block">
          Material Discrepancy Reporting System
        </h2>
      </div>

      <div className="flex items-center gap-6">
        {/* User requested to remove notification icon and Admin User section from here */}
      </div>
    </div>
  );
}

export default Topbar;
