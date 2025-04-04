import { useChatStore } from "../store/useChatStore";
import { useState } from "react";

import Sidebar from "../components/Sidebar";
import NoChatSelected from "../components/NoChatSelected";
import ChatContainer from "../components/ChatContainer";

const HomePage = () => {
  const { selectedUser } = useChatStore();
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="h-screen bg-base-200">
      <div className="flex items-center justify-center pt-20 px-4">
        <div className="bg-base-100 rounded-lg shadow-cl w-full max-w-6xl h-[calc(100vh-8rem)]">
          <div className="flex flex-col md:flex-row h-full rounded-lg overflow-hidden">
            {/* Make Sidebar collapsible on mobile */}
            <div
              className={`${
                isSidebarOpen ? "block" : "hidden"
              } md:block md:w-72 w-full`}
            >
              <Sidebar onClose={() => setSidebarOpen(false)} />
            </div>
            <div className="flex-1">
              {!selectedUser ? (
                <NoChatSelected onOpenSidebar={() => setSidebarOpen(true)} />
              ) : (
                <ChatContainer />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default HomePage;
