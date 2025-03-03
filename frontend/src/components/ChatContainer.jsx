import { useChatStore } from "../store/useChatStore";
import { useEffect, useRef, useState } from "react";

import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { useAuthStore } from "../store/useAuthStore";
import { formatMessageTime } from "../lib/utils";
import { Check, CheckCheck, Filter } from "lucide-react";

const ChatContainer = () => {
  const {
    messages,
    getMessages,
    isMessagesLoading,
    selectedUser,
    subscribeToMessages,
    unsubscribeFromMessages,
    markMessageAsRead,
  } = useChatStore();
  const [searchQuery, setSearchQuery] = useState("");
  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);
  const [messageFilter, setMessageFilter] = useState("todos"); // Options: "all", "urgent", "normal"

  const filteredMessages = messages.filter((message) => {
    const typeMatch =
      messageFilter === "todos" ||
      (messageFilter === "urgentes" && message.isUrgent) ||
      (messageFilter === "normales" && !message.isUrgent);

    const searchMatch =
      !searchQuery ||
      (message.text &&
        message.text.toLowerCase().includes(searchQuery.toLowerCase()));

    return typeMatch && searchMatch;
  });

  useEffect(() => {
    getMessages(selectedUser._id);
    subscribeToMessages();
    return () => unsubscribeFromMessages();
  }, [
    selectedUser._id,
    getMessages,
    subscribeToMessages,
    unsubscribeFromMessages,
  ]);

  useEffect(() => {
    if (messageEndRef.current && messages) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Mark incoming messages as read when viewed
  useEffect(() => {
    if (messages && messages.length > 0) {
      const unreadMessages = messages.filter(
        (message) =>
          message.senderId === selectedUser._id && message.status === "unread"
      );

      if (unreadMessages.length > 0) {
        unreadMessages.forEach((message) => {
          markMessageAsRead(message._id);
        });
      }
    }
  }, [messages, selectedUser._id, markMessageAsRead]);

  if (isMessagesLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-auto">
      <ChatHeader />
      <div className="px-4 py-2 border-b border-base-300 flex items-center justify-between gap-2">
        {/* Search input - add this */}
        <div className="relative max-w-md flex-1">
          <input
            type="text"
            placeholder="Buscar mensajes..."
            className="input input-bordered input-sm w-full max-w-xs pl-3"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              className="absolute right-2 top-1/2 -translate-y-1/2"
              onClick={() => setSearchQuery("")}
            >
              <span className="text-xs opacity-60">×</span>
            </button>
          )}
        </div>

        <div className="dropdown dropdown-end">
          <div
            tabIndex={0}
            role="button"
            className="btn btn-sm btn-ghost gap-1"
          >
            <Filter size={16} />
            <span className="text-xs">
              {messageFilter === "todos"
                ? "todos los mensajes"
                : messageFilter === "urgentes"
                ? "Urgentes Nadamas"
                : "Normales Nadamas"}
            </span>
          </div>
          <ul
            tabIndex={0}
            className="dropdown-content z-10 menu p-2 shadow bg-base-200 rounded-box w-52"
          >
            <li>
              <a
                onClick={() => setMessageFilter("todos")}
                className={messageFilter === "todos" ? "active" : ""}
              >
                Todos los Mensajes
              </a>
            </li>
            <li>
              <a
                onClick={() => setMessageFilter("urgentes")}
                className={messageFilter === "urgentes" ? "active" : ""}
              >
                Urgentes Nadamas
              </a>
            </li>
            <li>
              <a
                onClick={() => setMessageFilter("normales")}
                className={messageFilter === "normales" ? "active" : ""}
              >
                Normales Nadamas
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {filteredMessages.map((message, index) => (
          <div
            key={message._id}
            className={`chat ${
              message.senderId === authUser._id ? "chat-end" : "chat-start"
            }`}
            ref={index === messages.length - 1 ? messageEndRef : null}
          >
            <div className="chat-image avatar">
              <div className="size-10 rounded-full border">
                <img
                  src={
                    message.senderId === authUser._id
                      ? authUser.profilePic || "/avatar.png"
                      : selectedUser.profilePic || "/avatar.png"
                  }
                  alt="profile pic"
                />
              </div>
            </div>
            <div className="chat-header mb-1">
              <time className="text-xs opacity-50 ml-1">
                {formatMessageTime(message.createdAt)}
              </time>
              {message.isUrgent && (
                <span className="badge badge-xs badge-error ml-2 text-xs font-medium">
                  URGENTE
                </span>
              )}
            </div>
            <div
              className={`chat-bubble flex flex-col ${
                message.isUrgent ? "border-2 border-error/50" : ""
              }`}
            >
              {message.image && (
                <img
                  src={message.image}
                  alt="Attachment"
                  className="sm:max-w-[200px] rounded-md mb-2"
                />
              )}
              {message.text && <p>{message.text}</p>}
            </div>
            {message.senderId === authUser._id && (
              <div className="chat-footer opacity-70 flex justify-end mt-1">
                {message.status === "read" ? (
                  <CheckCheck className="size-4" />
                ) : (
                  <Check className="size-4" />
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      <MessageInput />
    </div>
  );
};
export default ChatContainer;
