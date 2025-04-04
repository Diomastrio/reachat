import { useChatStore } from "../store/useChatStore";
import { useState, useEffect } from "react";
import { Menu } from "lucide-react";

import Sidebar from "../components/Sidebar";
import NoChatSelected from "../components/NoChatSelected";
import ChatContainer from "../components/ChatContainer";

const HomePage = () => {
  const { selectedUser } = useChatStore();
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Check for mobile screen size and handle resize events
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Initial check
    checkIfMobile();

    // Add resize listener
    window.addEventListener("resize", checkIfMobile);

    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  // On mobile, when a user is selected, close the sidebar automatically
  useEffect(() => {
    if (isMobile && selectedUser) {
      setSidebarOpen(false);
    }
  }, [selectedUser, isMobile]);

  return (
    <div className="h-screen bg-base-200 flex flex-col">
      <div className="flex-1 flex flex-col h-full px-4 pt-4 sm:pt-20">
        <div className="bg-base-100 rounded-lg shadow-cl w-full max-w-6xl mx-auto h-[calc(100vh-2rem)] sm:h-[calc(100vh-8rem)] flex flex-col">
          {/* Mobile header with menu toggle */}
          {isMobile && selectedUser && !isSidebarOpen && (
            <div className="p-2 border-b border-base-300 flex items-center">
              <button
                className="btn btn-sm btn-ghost"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="size-5" />
              </button>
              <span className="ml-2 font-medium">Chat</span>
            </div>
          )}

          <div className="flex flex-col md:flex-row h-full rounded-lg overflow-hidden flex-1">
            {/* Sidebar - full screen on mobile when open */}
            <div
              className={`${
                isSidebarOpen ? "block" : "hidden"
              } md:block md:w-72 ${
                isMobile && isSidebarOpen
                  ? "absolute inset-0 z-10 bg-base-100 h-screen w-[85%]"
                  : "w-full"
              }`}
            >
              <Sidebar onClose={() => setSidebarOpen(false)} />
            </div>

            {/* Chat container */}
            <div
              className={`flex-1 flex flex-col ${
                isMobile && isSidebarOpen ? "hidden" : "flex"
              }`}
            >
              {!selectedUser ? (
                <NoChatSelected onOpenSidebar={() => setSidebarOpen(true)} />
              ) : (
                <ChatContainer onOpenSidebar={() => setSidebarOpen(true)} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default HomePage;
