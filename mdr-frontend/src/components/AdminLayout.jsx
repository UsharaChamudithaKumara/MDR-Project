import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  DashboardOutlined,
  TeamOutlined,
  LogoutOutlined,
  SafetyOutlined,
  LeftOutlined,
  RightOutlined,
  UserOutlined,
} from "@ant-design/icons";
import AuthService from "../services/AuthService";
import cpcLogo from "../Image/Ceylon_Petroleum_Corporation_logo.png";

const menuItems = [
  { name: "Dashboard", path: "/admin", icon: <DashboardOutlined /> },
  { name: "User Management", path: "/admin/users", icon: <TeamOutlined /> },
  { name: "Profile", path: "/admin/profile", icon: <UserOutlined /> },
];

function AdminLayout({ children }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const user = AuthService.getCurrentUser();

  const handleLogout = () => {
    AuthService.logout();
    navigate("/login");
    window.location.reload();
  };

  return (
    <div className="flex h-screen bg-slate-900 overflow-hidden font-sans">
      {/* Sidebar: Fixed like the main app but with admin-specific items */}
      <div className={`${isCollapsed ? 'w-20' : 'w-64'} bg-[#1e293b] text-white flex flex-col h-screen fixed top-0 left-0 shadow-2xl z-20 transition-all duration-300`}>
        <div className={`py-6 flex flex-col items-center justify-center border-b border-white/10 relative overflow-hidden transition-all duration-300 ${isCollapsed ? 'px-2' : ''}`}>
          <div className="absolute right-0 top-0 w-32 h-32 bg-[#FF0000]/10 rounded-full blur-3xl transform translate-x-12 -translate-y-12"></div>
          <img src={cpcLogo} alt="CPC Logo" className={`${isCollapsed ? 'w-10 h-10' : 'w-16 h-16'} mb-3 z-10 drop-shadow-lg object-contain transition-all duration-300`} />
          {!isCollapsed && (
            <div className="text-center z-10">
              <h1 className="text-xl font-bold tracking-widest text-white mt-1">
                Admin<span className="text-[#FF0000]">Panel</span>
              </h1>
              <div className="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-semibold">Super Admin Control</div>
            </div>
          )}
        </div>

        <div className={`flex-1 py-8 ${isCollapsed ? 'px-2' : 'px-4'} space-y-3 overflow-y-auto`} style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {!isCollapsed && <div className="text-xs font-bold text-slate-510 uppercase tracking-widest px-4 mb-4 text-slate-400">Main Menu</div>}
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== "/admin" && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center ${isCollapsed ? 'justify-center py-4' : 'gap-4 px-4 py-3.5'} rounded-xl font-medium transition-all duration-300 group relative overflow-hidden ${
                  isActive
                    ? "bg-white/10 text-white shadow-[0_4px_12px_rgba(0,0,0,0.1)] border border-white/5"
                    : "text-slate-400 hover:bg-white/5 hover:text-white"
                }`}
                title={isCollapsed ? item.name : ""}
              >
                {isActive && (
                  <div className="absolute left-0 top-0 w-1 h-full bg-[#FF0000] rounded-r-md"></div>
                )}
                <span className={`text-[22px] transition-transform duration-300 ${isActive ? 'scale-110 text-[#FF0000]' : 'group-hover:scale-110 group-hover:text-slate-200'}`}>{item.icon}</span>
                {!isCollapsed && <span className="tracking-wide whitespace-nowrap">{item.name}</span>}
              </Link>
            );
          })}
        </div>

        {/* User Profile in Sidebar */}
        {!isCollapsed && (
          <div className="p-4 border-t border-white/10 bg-black/20">
            <div className="flex items-center gap-3 mb-3 px-2">
              <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center bg-[#FF0000] shadow-lg shadow-red-500/20 border-2 border-white/10">
                {user?.profile_image ? (
                  <img src={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${user.profile_image}`} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="font-bold text-sm text-white">{user?.username?.[0]?.toUpperCase()}</span>
                )}
              </div>
              <div className="overflow-hidden">
                <div className="text-sm font-semibold truncate text-white">{user?.full_name || user?.username}</div>
                <div className="flex items-center gap-1.5">
                  <SafetyOutlined className="text-[#FF0000] text-[10px]" />
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Super Admin</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Control Buttons */}
        <div className="p-4 border-t border-white/10 flex flex-col gap-2 bg-black/20">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="w-full flex items-center gap-3 px-3 py-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-all duration-300 text-sm"
          >
            {isCollapsed ? <RightOutlined className="mx-auto" /> : <><LeftOutlined /> <span>Collapse Sidebar</span></>}
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 text-red-400 hover:text-white hover:bg-red-500/20 rounded-lg transition-all duration-300 text-sm"
          >
            <LogoutOutlined className={isCollapsed ? "mx-auto" : ""} />
            {!isCollapsed && <span>Logout</span>}
          </button>
        </div>
      </div>

      {/* Main Content Area: Compensate for fixed sidebar */}
      <div className={`flex-1 ${isCollapsed ? 'ml-20' : 'ml-64'} flex flex-col h-screen overflow-hidden relative transition-all duration-300`}>
        {/* Top Gradient */}
        <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-red-500/5 to-transparent -z-10 pointer-events-none"></div>
        
        {/* Header Bar */}
        <header className="h-20 flex items-center justify-between px-8 border-b border-white/5 bg-slate-900/50 backdrop-blur-md sticky top-0 z-10 w-full">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#FF0000] animate-pulse"></span>
              Super Admin Dashboard
            </h2>
            <p className="text-xs text-slate-400 font-medium">Ceylon Petroleum Corporation</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex flex-col items-end mr-2">
              <span className="text-sm font-semibold text-white">{user?.full_name || user?.username}</span>
              <span className="text-[10px] text-[#FF0000] font-bold uppercase tracking-widest">System Master</span>
            </div>
            <div className="w-10 h-10 rounded-full border-2 border-[#FF0000]/30 p-0.5 overflow-hidden">
              <div className="w-full h-full rounded-full bg-slate-800 flex items-center justify-center text-white font-bold text-sm overflow-hidden">
                 {user?.profile_image ? (
                   <img src={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${user.profile_image}`} alt="Avatar" className="w-full h-full object-cover" />
                 ) : (
                   user?.username?.[0]?.toUpperCase()
                 )}
              </div>
            </div>
          </div>
        </header>

        {/* Page Main Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-8 z-0">
          <div className="max-w-[1400px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;
