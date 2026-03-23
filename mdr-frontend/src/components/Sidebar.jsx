import { Link, useLocation, useNavigate } from "react-router-dom";
import { DashboardOutlined, PlusSquareOutlined, UnorderedListOutlined, LeftOutlined, RightOutlined, UserOutlined, LogoutOutlined } from "@ant-design/icons";
import cpcLogo from "../Image/Ceylon_Petroleum_Corporation_logo.png";
import AuthService from "../services/AuthService";

function Sidebar({ isCollapsed, setIsCollapsed }) {
  const location = useLocation();
  const navigate = useNavigate();
  const user = AuthService.getCurrentUser();

  const handleLogout = () => {
    AuthService.logout();
    navigate("/login");
    window.location.reload();
  };

  const menuItems = [
    { name: "Dashboard", path: "/", icon: <DashboardOutlined /> },
    { name: "Create MDR", path: "/create", icon: <PlusSquareOutlined /> },
    { name: "MDR List", path: "/mdr-list", icon: <UnorderedListOutlined /> },
    { name: "Reports", path: "/reports", icon: <UnorderedListOutlined /> },
    { name: "UOM Management", path: "/uom", icon: <UnorderedListOutlined /> },
  ];

  // Add User Management for super_admin
  if (user && user.role === 'super_admin') {
    menuItems.push({ name: "User Management", path: "/users", icon: <UserOutlined /> });
  }

  return (
    <div className={`${isCollapsed ? 'w-20' : 'w-64'} bg-[#1e293b] text-white flex flex-col h-screen fixed top-0 left-0 shadow-2xl z-20 transition-all duration-300`}>
      <div className={`py-6 flex flex-col items-center justify-center border-b border-white/10 relative overflow-hidden transition-all duration-300 ${isCollapsed ? 'px-2' : ''}`}>
        <div className="absolute right-0 top-0 w-32 h-32 bg-[#FF0000]/20 rounded-full blur-3xl transform translate-x-12 -translate-y-12"></div>
        <img src={cpcLogo} alt="CPC Logo" className={`${isCollapsed ? 'w-10 h-10' : 'w-16 h-16'} mb-3 z-10 drop-shadow-lg object-contain transition-all duration-300`} />
        {!isCollapsed && <h1 className="text-2xl font-bold tracking-widest text-white z-10 mt-1">MDR<span className="text-[#FF0000]">System</span></h1>}
      </div>

      <div className={`flex-1 py-8 ${isCollapsed ? 'px-2' : 'px-4'} space-y-3 overflow-y-auto`} style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        {!isCollapsed && <div className="text-xs font-semibold text-slate-500 uppercase tracking-widest px-4 mb-4">Main Menu</div>}
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path || (item.path !== "/" && location.pathname.startsWith(item.path));
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

      {/* Collapse Toggle Button */}
      <div className="flex justify-center items-center py-4 border-t border-white/10 bg-black/20">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors duration-300 border border-white/5"
        >
          {isCollapsed ? <RightOutlined className="text-sm" /> : <LeftOutlined className="text-sm" />}
        </button>
      </div>

      {!isCollapsed && (
        <div className="p-4 border-t border-white/10 bg-black/20">
          <div className="flex items-center gap-3 mb-3 px-2">
            <div className="w-8 h-8 rounded-full bg-[#FF0000] flex items-center justify-center font-bold text-sm">
              {user?.username?.[0]?.toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <div className="text-sm font-medium truncate">{user?.username}</div>
              <div className="text-[10px] text-slate-500 uppercase tracking-wider">{user?.role}</div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-all duration-300 text-sm"
          >
            <LogoutOutlined />
            <span>Logout</span>
          </button>
        </div>
      )}

      {isCollapsed && (
        <div className="py-4 border-t border-white/10 flex flex-col items-center gap-4 bg-black/20">
          <button
            onClick={handleLogout}
            className="text-slate-400 hover:text-white transition-colors"
            title="Logout"
          >
            <LogoutOutlined className="text-lg" />
          </button>
        </div>
      )}

      {!isCollapsed && (
        <div className="p-4 text-center text-[10px] text-slate-600 border-t border-white/5 bg-black/30">
          <div className="font-medium">Ceylon Petroleum Corporation</div>
          <p>&copy; 2026 MDR System</p>
        </div>
      )}
    </div>
  );
}

export default Sidebar;
