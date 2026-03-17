import { useState } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

function Layout({ children }) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans selection:bg-[#344D67]/20">
      <Sidebar isCollapsed={isSidebarCollapsed} setIsCollapsed={setIsSidebarCollapsed} />
      <div className={`flex-1 ${isSidebarCollapsed ? 'ml-20' : 'ml-64'} flex flex-col h-screen overflow-hidden relative transition-all duration-300`}>
        {/* Subtle background gradient overlay */}
        <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-[#344D67]/5 to-transparent -z-10 pointer-events-none"></div>
        <Topbar />
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-8 z-0">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

export default Layout;
