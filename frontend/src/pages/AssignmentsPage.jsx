import { useEffect, useState } from "react";
import { useAssignmentStore } from "../store/useAssignmentStore";
import { useAuthStore } from "../store/useAuthStore";
import { Link } from "react-router-dom";
import {
  Book,
  BookPlus,
  Calendar,
  CheckCircle,
  Clock,
  Loader,
} from "lucide-react";
import { formatDate } from "../lib/utils";

const AssignmentsPage = () => {
  const {
    assignments,
    getAssignments,
    isLoading,
    subscribeToAssignmentEvents,
    unsubscribeFromAssignmentEvents,
  } = useAssignmentStore();
  const { authUser } = useAuthStore();
  const [filter, setFilter] = useState("all"); // "all", "created", "assigned", "pending", "completed"

  useEffect(() => {
    getAssignments();
    subscribeToAssignmentEvents();
    return () => unsubscribeFromAssignmentEvents();
  }, [
    getAssignments,
    subscribeToAssignmentEvents,
    unsubscribeFromAssignmentEvents,
  ]);

  const filteredAssignments = assignments.filter((assignment) => {
    const isCreator = assignment.creatorId._id === authUser._id;
    const isAssignedToMe = assignment.assignedTo.some(
      (user) => user._id === authUser._id
    );
    const hasSubmitted = assignment.submissions.some(
      (sub) => sub.userId === authUser._id
    );

    switch (filter) {
      case "created":
        return isCreator;
      case "assigned":
        return isAssignedToMe;
      case "pending":
        return isAssignedToMe && !hasSubmitted;
      case "completed":
        return isAssignedToMe && hasSubmitted;
      default:
        return true;
    }
  });

  return (
    <div className="h-screen pt-20">
      <div className="max-w-6xl mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Assignments</h1>
          <Link to="/assignments/create" className="btn btn-primary btn-sm">
            <BookPlus className="size-4 mr-2" />
            Create Assignment
          </Link>
        </div>

        <div className="flex gap-2 mb-6 flex-wrap">
          <button
            className={`btn btn-sm ${
              filter === "all" ? "btn-primary" : "btn-outline"
            }`}
            onClick={() => setFilter("all")}
          >
            All
          </button>
          <button
            className={`btn btn-sm ${
              filter === "created" ? "btn-primary" : "btn-outline"
            }`}
            onClick={() => setFilter("created")}
          >
            Created By Me
          </button>
          <button
            className={`btn btn-sm ${
              filter === "assigned" ? "btn-primary" : "btn-outline"
            }`}
            onClick={() => setFilter("assigned")}
          >
            Assigned To Me
          </button>
          <button
            className={`btn btn-sm ${
              filter === "pending" ? "btn-primary" : "btn-outline"
            }`}
            onClick={() => setFilter("pending")}
          >
            Pending
          </button>
          <button
            className={`btn btn-sm ${
              filter === "completed" ? "btn-primary" : "btn-outline"
            }`}
            onClick={() => setFilter("completed")}
          >
            Completed
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader className="size-8 animate-spin" />
          </div>
        ) : filteredAssignments.length === 0 ? (
          <div className="text-center py-12 bg-base-200 rounded-lg">
            <Book className="size-12 mx-auto mb-4 text-base-content/50" />
            <h3 className="text-lg font-medium mb-2">No assignments found</h3>
            <p className="text-base-content/60">
              {filter === "all"
                ? "There are no assignments yet."
                : `No assignments match the "${filter}" filter.`}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAssignments.map((assignment) => {
              const isCreator = assignment.creatorId._id === authUser._id;
              const hasSubmitted = assignment.submissions.some(
                (sub) => sub.userId === authUser._id
              );
              const isPastDue = new Date(assignment.dueDate) < new Date();
              const totalSubmissions = assignment.submissions.length;
              const totalAssigned = assignment.assignedTo.length;

              return (
                <Link
                  key={assignment._id}
                  to={`/assignments/${assignment._id}`}
                  className="card bg-base-100 hover:shadow-md transition-shadow border"
                >
                  <div className="card-body">
                    <div className="flex justify-between items-start">
                      <h2 className="card-title text-base">
                        {assignment.title}
                      </h2>
                      {isCreator ? (
                        <span className="badge badge-primary">
                          Your Assignment
                        </span>
                      ) : hasSubmitted ? (
                        <span className="badge badge-success">Submitted</span>
                      ) : isPastDue ? (
                        <span className="badge badge-error">Past Due</span>
                      ) : (
                        <span className="badge badge-warning">Pending</span>
                      )}
                    </div>

                    <p className="text-sm line-clamp-2 mb-2">
                      {assignment.description}
                    </p>

                    <div className="flex flex-col gap-1 text-xs">
                      <div className="flex items-center gap-1 text-base-content/70">
                        <Calendar className="size-3" />
                        <span>Due: {formatDate(assignment.dueDate)}</span>
                      </div>

                      {isCreator && (
                        <div className="flex items-center gap-1 text-base-content/70">
                          <CheckCircle className="size-3" />
                          <span>
                            Submissions: {totalSubmissions}/{totalAssigned}
                          </span>
                        </div>
                      )}

                      <div className="flex items-center gap-1 text-base-content/70">
                        <Clock className="size-3" />
                        <span>Created: {formatDate(assignment.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AssignmentsPage;
