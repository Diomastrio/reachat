import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import {
  LogOut,
  MessageSquare,
  Settings,
  User,
  BookOpen,
  MessageCircleQuestion,
  Menu,
  X,
} from "lucide-react";

const Navbar = () => {
  const { logout, authUser } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header
      className="bg-base-100 border-b border-base-300 fixed w-full top-0 z-40 
      backdrop-blur-lg bg-base-100/80"
    >
      <div className="container mx-auto px-4 h-16">
        <div className="flex items-center justify-between h-full">
          {/* Logo and brand */}
          <Link
            to="/"
            className="flex items-center gap-2.5 hover:opacity-80 transition-all"
          >
            <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-primary" />
            </div>
            <h1 className="text-lg font-bold">ChatDocente</h1>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-4">
            {authUser && (
              <div className="flex items-center gap-4">
                <Link
                  to="/assignments"
                  className="text-base-content/80 hover:text-base-content transition-colors flex items-center gap-1"
                >
                  <BookOpen className="size-4" />
                  <span>Assignments</span>
                </Link>
                <Link
                  to="/quizzes"
                  className="text-base-content/80 hover:text-base-content transition-colors flex items-center gap-1"
                >
                  <MessageCircleQuestion className="size-4" />
                  <span>Cuestionarios</span>
                </Link>
              </div>
            )}
          </div>

          {/* Desktop User Controls */}
          <div className="hidden md:flex items-center gap-2">
            <Link
              to={"/settings"}
              className="btn btn-sm gap-2 transition-colors"
            >
              <Settings className="w-4 h-4" />
              <span>Ajustes</span>
            </Link>

            {authUser && (
              <>
                <Link to={"/profile"} className="btn btn-sm gap-2">
                  <User className="size-4" />
                  <span>Perfil</span>
                </Link>

                <button className="btn btn-sm gap-2" onClick={logout}>
                  <LogOut className="size-4" />
                  <span>Cerrar sesión</span>
                </button>
              </>
            )}
          </div>

          {/* Mobile Controls */}
          <div className="flex md:hidden items-center gap-2">
            {authUser && (
              <Link to={"/profile"} className="btn btn-circle btn-sm">
                <User className="size-4" />
              </Link>
            )}
            <button
              className="btn btn-circle btn-sm"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="size-4" />
              ) : (
                <Menu className="size-4" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute w-full bg-base-100 border-b border-base-300 shadow-lg">
          <div className="container mx-auto px-4 py-4 space-y-3">
            {authUser && (
              <>
                <Link
                  to="/assignments"
                  className="flex items-center gap-2 p-2 hover:bg-base-200 rounded-lg"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <BookOpen className="size-4" />
                  <span>Assignments</span>
                </Link>
                <Link
                  to="/quizzes"
                  className="flex items-center gap-2 p-2 hover:bg-base-200 rounded-lg"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <MessageCircleQuestion className="size-4" />
                  <span>Cuestionarios</span>
                </Link>
                <Link
                  to="/settings"
                  className="flex items-center gap-2 p-2 hover:bg-base-200 rounded-lg"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Settings className="size-4" />
                  <span>Ajustes</span>
                </Link>
                <button
                  className="flex items-center gap-2 p-2 w-full text-left hover:bg-base-200 rounded-lg text-error"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                  }}
                >
                  <LogOut className="size-4" />
                  <span>Cerrar sesión</span>
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
export default Navbar;
