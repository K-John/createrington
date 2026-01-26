import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "@/contexts/auth";
import {
  Home,
  Server,
  Settings,
  Users,
  ChevronRight,
  ChevronDown,
  Menu,
  X,
  Activity,
  Shield,
  UserCircle,
  LogOut,
} from "lucide-react";
import styles from "./Sidebar.module.scss";

interface NavItem {
  label: string;
  icon: React.ReactNode;
  path?: string;
  onClick?: () => void;
  children?: NavItem[];
  adminOnly?: boolean;
  requiresAuth?: boolean;
}

export const Sidebar: React.FC = () => {
  const { user, login, logout } = useAuth();
  const [manuallyCollapsed, setManuallyCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [sidebarWidth, setSidebarWidth] = useState(280);
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Derive collapsed state from width and manual toggle
  // Auto-collapses when width < 240px, or when manually toggled
  const isCollapsed = manuallyCollapsed || sidebarWidth < 240;

  const navItems: NavItem[] = [
    {
      label: "Home",
      icon: <Home size={20} />,
      path: "/",
    },
    {
      label: "Servers",
      icon: <Server size={20} />,
      children: [
        {
          label: "Server 1",
          icon: <Activity size={16} />,
          path: "/servers/1",
          requiresAuth: true,
        },
        {
          label: "Server 2",
          icon: <Activity size={16} />,
          path: "/servers/2",
          requiresAuth: true,
        },
        {
          label: "Server Status",
          icon: <Activity size={16} />,
          path: "/servers/status",
        },
      ],
    },
    {
      label: "Admin",
      icon: <Shield size={20} />,
      adminOnly: true,
      children: [
        {
          label: "Dashboard",
          icon: <Activity size={16} />,
          path: "/admin/dashboard",
        },
        {
          label: "Waitlist",
          icon: <Users size={16} />,
          path: "/admin/waitlist",
        },
        { label: "Players", icon: <Users size={16} />, path: "/admin/players" },
        {
          label: "Settings",
          icon: <Settings size={16} />,
          path: "/admin/settings",
        },
      ],
    },
  ];

  const getFilteredNavItems = (): NavItem[] => {
    return navItems.filter((item) => {
      if (item.adminOnly && (!user || !user.isAdmin)) {
        return false;
      }
      return true;
    });
  };

  const getFilteredChildren = (children?: NavItem[]): NavItem[] => {
    if (!children) return [];
    return children.filter((child) => {
      if (child.requiresAuth && !user) {
        return false;
      }
      return true;
    });
  };

  const toggleExpanded = (label: string) => {
    setExpandedItems((prev) => {
      const next = new Set(prev);
      if (next.has(label)) {
        next.delete(label);
      } else {
        next.add(label);
      }
      return next;
    });
  };

  const handleNavigation = (path?: string, onClick?: () => void) => {
    if (onClick) {
      onClick();
    } else if (path) {
      window.location.assign(path);
    }
    setIsMobileOpen(false);
  };

  // Resize functionality
  const startResizing = () => {
    setIsResizing(true);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;

      const newWidth = e.clientX;
      if (newWidth >= 200 && newWidth <= 400) {
        setSidebarWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing]);

  const sidebarStyle = {
    width: isCollapsed ? "80px" : `${sidebarWidth}px`,
  };

  return (
    <>
      {/* Mobile Menu Toggle */}
      <button
        className={styles.mobileToggle}
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        aria-label="Toggle menu"
      >
        {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className={styles.mobileOverlay}
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        ref={sidebarRef}
        className={`${styles.sidebar} ${isCollapsed ? styles.collapsed : ""} ${
          isMobileOpen ? styles.mobileOpen : ""
        }`}
        style={sidebarStyle}
      >
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.logo}>
            {!isCollapsed && <span className={styles.logoText}>MyServer</span>}
            {isCollapsed && <span className={styles.logoIcon}>MS</span>}
          </div>
          <button
            className={styles.collapseButton}
            onClick={() => setManuallyCollapsed(!manuallyCollapsed)}
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <ChevronRight
              size={20}
              className={isCollapsed ? styles.rotated : ""}
            />
          </button>
        </div>

        {/* Navigation */}
        <nav className={styles.nav}>
          {getFilteredNavItems().map((item) => (
            <div key={item.label} className={styles.navItem}>
              {item.children ? (
                <>
                  <button
                    className={`${styles.navButton} ${
                      expandedItems.has(item.label) ? styles.expanded : ""
                    }`}
                    onClick={() => toggleExpanded(item.label)}
                    title={isCollapsed ? item.label : undefined}
                  >
                    <span className={styles.navIcon}>{item.icon}</span>
                    {!isCollapsed && (
                      <>
                        <span className={styles.navLabel}>{item.label}</span>
                        <ChevronDown size={16} className={styles.expandIcon} />
                      </>
                    )}
                  </button>
                  {expandedItems.has(item.label) && !isCollapsed && (
                    <div className={styles.subNav}>
                      {getFilteredChildren(item.children).map((child) => (
                        <button
                          key={child.label}
                          className={styles.subNavItem}
                          onClick={() =>
                            handleNavigation(child.path, child.onClick)
                          }
                        >
                          <span className={styles.subNavIcon}>
                            {child.icon}
                          </span>
                          <span className={styles.subNavLabel}>
                            {child.label}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <a
                  href={item.path}
                  className={styles.navButton}
                  onClick={(e) => {
                    if (item.onClick) {
                      e.preventDefault();
                      item.onClick();
                    }
                  }}
                  title={isCollapsed ? item.label : undefined}
                >
                  <span className={styles.navIcon}>{item.icon}</span>
                  {!isCollapsed && (
                    <span className={styles.navLabel}>{item.label}</span>
                  )}
                </a>
              )}
            </div>
          ))}
        </nav>

        {/* User Section */}
        <div className={styles.userSection}>
          {user ? (
            <>
              <div className={styles.userInfo}>
                {user.avatar ? (
                  <img
                    src={`https://cdn.discordapp.com/avatars/${user.discordId}/${user.avatar}.png`}
                    alt={user.username}
                    className={styles.avatar}
                  />
                ) : (
                  <div className={styles.avatarPlaceholder}>
                    {user.username[0].toUpperCase()}
                  </div>
                )}
                {!isCollapsed && (
                  <div className={styles.userDetails}>
                    <span className={styles.username}>{user.username}</span>
                    <span className={styles.minecraftName}>
                      {user.minecraftName}
                    </span>
                  </div>
                )}
              </div>
              <div className={styles.userActions}>
                <button
                  className={styles.userAction}
                  onClick={() => handleNavigation("/profile")}
                  title="Profile"
                >
                  <UserCircle size={20} />
                  {!isCollapsed && <span>Profile</span>}
                </button>
                <button
                  className={styles.userAction}
                  onClick={() => handleNavigation("/settings")}
                  title="Settings"
                >
                  <Settings size={20} />
                  {!isCollapsed && <span>Settings</span>}
                </button>
                <button
                  className={`${styles.userAction} ${styles.logout}`}
                  onClick={logout}
                  title="Logout"
                >
                  <LogOut size={20} />
                  {!isCollapsed && <span>Logout</span>}
                </button>
              </div>
            </>
          ) : (
            <button className={styles.loginButton} onClick={login}>
              {isCollapsed ? <UserCircle size={20} /> : "Login with Discord"}
            </button>
          )}
        </div>

        {/* Resize Handle */}
        <div
          className={styles.resizeHandle}
          onMouseDown={startResizing}
          aria-label="Resize sidebar"
        />
      </aside>
    </>
  );
};
