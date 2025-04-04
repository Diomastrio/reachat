import { useEffect, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";
import { Users, Search, MoreVertical, X } from "lucide-react";

const ChatActionsModal = ({
  isOpen,
  onClose,
  onArchive,
  isArchived,
  userId,
  position,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed z-50"
      style={{
        top: position.top,
        left: position.left,
      }}
    >
      <div className="bg-base-100 rounded-lg shadow-xl w-48 overflow-hidden">
        <div className="p-0">
          <button
            className="w-full text-left px-4 py-2 hover:bg-base-200 transition-colors"
            onClick={() => {
              onArchive(userId);
              onClose();
            }}
          >
            {isArchived ? "Unarchive Chat" : "Archive Chat"}
          </button>
        </div>
        <div className="p-1 border-t border-base-300 flex justify-end">
          <button className="btn btn-sm btn-ghost" onClick={onClose}>
            X
          </button>
        </div>
      </div>
    </div>
  );
};

const Sidebar = ({ onClose }) => {
  const {
    getUsers,
    users,
    selectedUser,
    setSelectedUser,
    isUsersLoading,
    archivedUserIds,
    showArchived,
    toggleShowArchived,
    archiveChat,
    unarchiveChat,
  } = useChatStore();
  const { onlineUsers } = useAuthStore();
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [activeUserId, setActiveUserId] = useState(null);
  const [modalPosition, setModalPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    getUsers();
  }, [getUsers]);

  const filteredUsers = users
    .filter((user) => {
      // Filter based on archived status
      if (showArchived) {
        return archivedUserIds.includes(user._id);
      } else {
        return !archivedUserIds.includes(user._id);
      }
    })
    .filter((user) => (showOnlineOnly ? onlineUsers.includes(user._id) : true))
    .filter((user) =>
      user.fullName.toLowerCase().includes(searchQuery.toLowerCase())
    );

  if (isUsersLoading) return <SidebarSkeleton />;

  return (
    <aside className="h-full w-full md:w-72 border-r border-base-300 flex flex-col transition-all duration-200 relative">
      {/* Close button for mobile only */}
      <button
        onClick={onClose}
        className="md:hidden absolute top-2 right-2 btn btn-sm btn-circle"
      >
        <X className="size-4" />
      </button>

      {/* Sidebar content */}
      <div className="border-b border-base-300 w-full p-5">
        <div className="flex items-center gap-2">
          <Users className="size-6" />
          <span className="font-medium">Docentes</span>
        </div>
        <div className="mt-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-base-content/50" />
            <input
              type="text"
              placeholder="Buscar docente..."
              className="input input-bordered input-sm w-full pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <div className="mt-3 flex items-center gap-2">
          <label className="cursor-pointer flex items-center gap-2">
            <input
              type="checkbox"
              checked={showOnlineOnly}
              onChange={(e) => setShowOnlineOnly(e.target.checked)}
              className="checkbox checkbox-sm"
            />
            <span className="text-sm">Mostrar solo en línea</span>
          </label>
          <span className="text-xs text-zinc-500">
            ({onlineUsers.length - 1} online)
          </span>
        </div>
        <div className="mt-3">
          <button
            onClick={toggleShowArchived}
            className="btn btn-ghost btn-sm text-xs flex items-center gap-2"
          >
            {showArchived
              ? "Mostrar Chats Activos"
              : "Mostrar Chats Archivados"}
          </button>
        </div>
      </div>

      <div className="px-3 py-2 text-xs font-semibold text-zinc-500">
        {showArchived ? "Archived Chats" : "Active Chats"}
      </div>

      <div className="overflow-y-auto w-full py-3">
        {filteredUsers.length > 0 ? (
          filteredUsers.map((user) => (
            <div key={user._id} className="relative">
              <button
                onClick={() => setSelectedUser(user)}
                className={`
                  w-full p-3 flex items-center gap-3
                  hover:bg-base-300 transition-colors
                  ${
                    selectedUser?._id === user._id
                      ? "bg-base-300 ring-1 ring-base-300"
                      : ""
                  }
                `}
              >
                <div className="relative">
                  <img
                    src={user.profilePic || "/avatar.png"}
                    alt={user.name}
                    className="size-12 object-cover rounded-full"
                  />
                  {onlineUsers.includes(user._id) && (
                    <span
                      className="absolute bottom-0 right-0 size-3 bg-green-500 
                      rounded-full ring-2 ring-zinc-900"
                    />
                  )}
                </div>

                {/* User info - visible on all screens */}
                <div className="text-left min-w-0 flex-1">
                  <div className="font-medium truncate">{user.fullName}</div>
                  <div className="text-sm text-zinc-400">
                    {onlineUsers.includes(user._id) ? "Online" : "Offline"}
                  </div>
                </div>

                {/* 3-dot icon */}
                <button
                  type="button"
                  className="btn btn-ghost btn-circle"
                  onClick={(e) => {
                    e.stopPropagation();
                    const rect = e.target.getBoundingClientRect();
                    setModalPosition({
                      top: rect.top + window.scrollY - 50,
                      left: rect.left + window.scrollX - 100,
                    });
                    setActiveUserId(user._id);
                    setModalOpen(true);
                  }}
                >
                  <MoreVertical className="size-5" />
                </button>
              </button>
            </div>
          ))
        ) : (
          <div className="text-center text-zinc-500 py-4">
            {showArchived
              ? "No hay chats archivados"
              : "Ningún usuario en línea"}
          </div>
        )}
      </div>
      <ChatActionsModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onArchive={(userId) => {
          if (archivedUserIds.includes(userId)) {
            unarchiveChat(userId);
          } else {
            archiveChat(userId);
          }
        }}
        isArchived={
          activeUserId ? archivedUserIds.includes(activeUserId) : false
        }
        userId={activeUserId}
        position={modalPosition}
      />
    </aside>
  );
};

export default Sidebar;
