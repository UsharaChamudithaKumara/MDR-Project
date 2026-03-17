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
        <div className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-slate-100 transition-colors cursor-pointer group">
          <Badge count={3} size="small" offset={[2, -2]}>
            <BellOutlined className="text-[22px] text-slate-600 group-hover:text-[#FF0000] transition-colors" />
          </Badge>
        </div>
        
        <div className="h-8 w-px bg-slate-200"></div>

        <Dropdown menu={userMenu} placement="bottomRight" trigger={['click']}>
          <div className="flex items-center gap-3 cursor-pointer hover:bg-slate-50 px-3 py-1.5 rounded-full transition-all border border-transparent hover:border-slate-200 shadow-sm hover:shadow">
            <Avatar 
              size="large" 
              icon={<UserOutlined />} 
              src="https://api.dicebear.com/7.x/notionists/svg?seed=Admin"
              className="bg-[#344D67]/10 text-[#344D67]" 
            />
            <div className="hidden sm:block text-right">
              <div className="font-semibold text-slate-800 text-sm leading-tight">Admin User</div>
              <div className="text-xs text-slate-500 font-medium">System Manager</div>
            </div>
          </div>
        </Dropdown>
      </div>
    </div>
  );
}

export default Topbar;
