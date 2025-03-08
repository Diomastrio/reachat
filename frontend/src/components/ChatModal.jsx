const ChatModal = ({
  user,
  archivedUserIds,
  archiveChat,
  unarchiveChat,
  onClose,
}) => {
  if (!user) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div
        className="absolute inset-0 bg-black opacity-50"
        onClick={onClose}
      ></div>
      <div className="bg-white rounded-md shadow-lg z-10 p-4">
        <button
          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          onClick={() => {
            if (archivedUserIds.includes(user._id)) {
              unarchiveChat(user._id);
            } else {
              archiveChat(user._id);
            }
            onClose();
          }}
        >
          {archivedUserIds.includes(user._id)
            ? "Unarchive Chat"
            : "Archive Chat"}
        </button>
      </div>
    </div>
  );
};

export default ChatModal;
