export function formatMessageTime(date) {
  return new Date(date).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export function formatDate(dateString) {
  const options = {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };
  return new Date(dateString).toLocaleDateString("en-US", options);
}

export function formatTimeRemaining(dueDate) {
  const now = new Date();
  const due = new Date(dueDate);
  const diffInMs = due - now;

  // If past due, calculate time elapsed since due date
  if (diffInMs < 0) {
    const diffInSec = Math.abs(diffInMs) / 1000;
    const days = Math.floor(diffInSec / 86400);
    const hours = Math.floor((diffInSec % 86400) / 3600);

    if (days > 0) {
      return `${days} day${days !== 1 ? "s" : ""} ${hours} hr${
        hours !== 1 ? "s" : ""
      }`;
    }
    return `${hours} hour${hours !== 1 ? "s" : ""} ${Math.floor(
      (diffInSec % 3600) / 60
    )} min`;
  }

  // Calculate time remaining until due date
  const diffInSec = diffInMs / 1000;
  const days = Math.floor(diffInSec / 86400);
  const hours = Math.floor((diffInSec % 86400) / 3600);
  const minutes = Math.floor((diffInSec % 3600) / 60);

  if (days > 0) {
    return `${days} day${days !== 1 ? "s" : ""} ${hours} hr${
      hours !== 1 ? "s" : ""
    }`;
  }
  if (hours > 0) {
    return `${hours} hour${hours !== 1 ? "s" : ""} ${minutes} min`;
  }
  return `${minutes} minute${minutes !== 1 ? "s" : ""}`;
}
