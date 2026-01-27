import React, { useState } from "react";
import { useAuth } from "@/contexts/auth";
import styles from "./Sidebar.module.scss";

interface NavItem {
  label: string;
  path?: string;
  icon: React.ReactNode;
  onClick?: () => void;
  children?: NavItem[];
  adminOnly?: boolean;
  requiresAuth?: boolean;
}

export const Sidebar: React.FC = () => {
  const { user, login } = useAuth();
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Mock server status - replace with actual API later
  const serverStatus = {
    online: 2,
    total: 3,
    players: 156,
    maxPlayers: 500,
  };

  const navItems: NavItem[] = [
    {
      label: "Home",
      path: "/",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path
            d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <polyline
            points="9 22 9 12 15 12 15 22"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
    },
    {
      label: "Servers",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <rect
            x="2"
            y="2"
            width="20"
            height="8"
            rx="2"
            ry="2"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <rect
            x="2"
            y="14"
            width="20"
            height="8"
            rx="2"
            ry="2"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <line
            x1="6"
            y1="6"
            x2="6.01"
            y2="6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <line
            x1="6"
            y1="18"
            x2="6.01"
            y2="18"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
      children: [
        {
          label: "Server 1",
          path: "/servers/1",
          requiresAuth: true,
          icon: <></>,
        },
        {
          label: "Server 2",
          path: "/servers/2",
          requiresAuth: true,
          icon: <></>,
        },
        {
          label: "Server Status",
          path: "/servers/status",
          icon: <></>,
        },
      ],
    },
    {
      label: "Community",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path
            d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle
            cx="9"
            cy="7"
            r="4"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M23 21v-2a4 4 0 0 0-3-3.87"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M16 3.13a4 4 0 0 1 0 7.75"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
      children: [
        {
          label: "Discord",
          path: "https://discord.gg/yourserver",
          icon: <></>,
        },
        {
          label: "Forum",
          path: "/forum",
          icon: <></>,
        },
        {
          label: "Leaderboard",
          path: "/leaderboard",
          icon: <></>,
        },
      ],
    },
    {
      label: "Shop",
      path: "/shop",
      requiresAuth: true,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <circle
            cx="9"
            cy="21"
            r="1"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle
            cx="20"
            cy="21"
            r="1"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
    },
    {
      label: "Admin",
      adminOnly: true,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
      children: [
        {
          label: "Dashboard",
          path: "/admin/dashboard",
          icon: <></>,
        },
        {
          label: "Waitlist",
          path: "/admin/waitlist",
          icon: <></>,
        },
        {
          label: "Players",
          path: "/admin/players",
          icon: <></>,
        },
        {
          label: "Settings",
          path: "/admin/settings",
          icon: <></>,
        },
      ],
    },
  ];

  const getFilteredNavItems = (): NavItem[] => {
    return navItems.filter((item) => {
      if (item.adminOnly && (!user || !user.isAdmin)) {
        return false;
      }
      if (item.requiresAuth && !user) {
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
      const newSet = new Set(prev);
      if (newSet.has(label)) {
        newSet.delete(label);
      } else {
        newSet.add(label);
      }
      return newSet;
    });
  };

  const handleNavigation = (path?: string, onClick?: () => void) => {
    if (onClick) {
      onClick();
    } else if (path) {
      if (path.startsWith("http")) {
        window.open(path, "_blank");
      } else {
        window.location.assign(path);
      }
    }
  };

  return (
    <aside
      className={`${styles.sidebar} ${isCollapsed ? styles.collapsed : ""}`}
    >
      {/* Header with Logo, Status & Toggle */}
      <div className={styles.header}>
        <a href="/" className={styles.logoLink}>
          <div className={styles.logoIcon}>
            <img
              src="https://assets.create-rington.com/logo/logo.png"
              alt="Createrington Logo"
              className={styles.logoImage}
            />
          </div>
          {!isCollapsed && (
            <span className={styles.logoText}>Createrington</span>
          )}
        </a>

        {!isCollapsed && (
          <div className={styles.statusInfo}>
            <div className={styles.statusRow}>
              <div className={styles.statusIndicator}>
                <span
                  className={`${styles.statusDot} ${
                    serverStatus.online > 0 ? styles.online : styles.offline
                  }`}
                />
                <span className={styles.statusText}>
                  {serverStatus.online}/{serverStatus.total} Servers
                </span>
              </div>
            </div>
            <div className={styles.statusRow}>
              <svg
                className={styles.statusIcon}
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle
                  cx="9"
                  cy="7"
                  r="4"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span className={styles.statusText}>
                {serverStatus.players}/{serverStatus.maxPlayers}
              </span>
            </div>
          </div>
        )}

        {/* Toggle Button */}
        <button
          className={styles.toggleButton}
          onClick={() => setIsCollapsed(!isCollapsed)}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            {isCollapsed ? (
              <path
                d="M9 18l6-6-6-6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ) : (
              <path
                d="M15 18l-6-6 6-6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}
          </svg>
        </button>
      </div>

      {/* Navigation */}
      <nav className={styles.navigation}>
        <div className={styles.navList}>
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
                      <span className={styles.navLabel}>{item.label}</span>
                    )}
                    {!isCollapsed && (
                      <svg
                        className={styles.expandIcon}
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                      >
                        <path
                          d="M6 9l2 2 2-2"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </button>
                  {!isCollapsed && expandedItems.has(item.label) && (
                    <div className={styles.subNav}>
                      {getFilteredChildren(item.children).map((child) => (
                        <button
                          key={child.label}
                          className={styles.subNavButton}
                          onClick={() =>
                            handleNavigation(child.path, child.onClick)
                          }
                        >
                          <span className={styles.navLabel}>{child.label}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <button
                  className={styles.navButton}
                  onClick={() => handleNavigation(item.path, item.onClick)}
                  title={isCollapsed ? item.label : undefined}
                >
                  <span className={styles.navIcon}>{item.icon}</span>
                  {!isCollapsed && (
                    <span className={styles.navLabel}>{item.label}</span>
                  )}
                </button>
              )}
            </div>
          ))}
        </div>
      </nav>

      {/* Bottom Section */}
      <div className={styles.bottomSection}>
        {user ? (
          <div
            className={styles.userCard}
            title={isCollapsed ? user.username : undefined}
          >
            <div className={styles.userInfo}>
              {user.avatar ? (
                <img
                  src={`https://cdn.discordapp.com/avatars/${user.discordId}/${user.avatar}.png`}
                  alt={user.username}
                  className={styles.userAvatar}
                />
              ) : (
                <div className={styles.userAvatarPlaceholder}>
                  {user.username[0].toUpperCase()}
                </div>
              )}
              {!isCollapsed && (
                <div className={styles.userDetails}>
                  <span className={styles.userName}>{user.username}</span>
                  <span className={styles.userMinecraft}>
                    {user.minecraftName}
                  </span>
                </div>
              )}
            </div>
          </div>
        ) : (
          <button
            className={styles.loginButton}
            onClick={login}
            title={isCollapsed ? "Login with Discord" : undefined}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <polyline
                points="10 17 15 12 10 7"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <line
                x1="15"
                y1="12"
                x2="3"
                y2="12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {!isCollapsed && <span>Login with Discord</span>}
          </button>
        )}
      </div>
    </aside>
  );
};
