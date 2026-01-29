import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Home,
  Store,
  Coins,
  MessageSquare,
  Users,
  Map,
  UserPlus,
  Shield,
  AlertCircle,
  LayoutDashboard,
  ShoppingCart,
  Briefcase,
  ClipboardList,
  ArrowLeftCircle,
  ChevronLeft,
  ChevronRight,
  Server,
} from "lucide-react";
import { useServerData, usePlayerData } from "@/contexts/socket";
import { useSidebar } from "@/contexts/sidebar";
import styles from "./Sidebar.module.scss";

interface NavItem {
  label: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  requiresAuth?: boolean;
  badge?: string | number;
}

export const Sidebar: React.FC = () => {
  const location = useLocation();
  const { isCollapsed, toggleCollapsed } = useSidebar();
  const sidebarMode: "main" | "market" = location.pathname.startsWith("/market")
    ? "market"
    : "main";

  // Get WebSocket data
  const { servers, stats: serverStats } = useServerData();
  const { stats: playerStats } = usePlayerData();

  // Check if single server or multiple
  const isSingleServer = servers.length === 1;
  const singleServer = isSingleServer ? servers[0] : null;

  // Navigation configurations
  const mainNavItems: NavItem[] = [
    {
      label: "Home",
      path: "/",
      icon: Home,
    },
    {
      label: "Market",
      path: "/market",
      icon: Store,
    },
    {
      label: "Crypto",
      path: "/crypto",
      icon: Coins,
    },
    {
      label: "Chat",
      path: "/server-chat",
      icon: MessageSquare,
    },
    {
      label: "Players",
      path: "/online-players",
      icon: Users,
      badge: playerStats.total > 0 ? playerStats.total : undefined,
    },
    {
      label: "Map",
      path: "/blue-map",
      icon: Map,
    },
    {
      label: "Apply",
      path: "/apply-to-join",
      icon: UserPlus,
    },
    {
      label: "Team",
      path: "/team",
      icon: Shield,
    },
    {
      label: "Rules",
      path: "/rules",
      icon: AlertCircle,
    },
  ];

  const marketNavItems: NavItem[] = [
    {
      label: "Dashboard",
      path: "/market",
      icon: LayoutDashboard,
    },
    {
      label: "Marketplace",
      path: "/marketplace",
      icon: ShoppingCart,
    },
    {
      label: "Companies",
      path: "/market/companies",
      icon: Briefcase,
    },
    {
      label: "Shops",
      path: "/market/shops",
      icon: Store,
    },
    {
      label: "Requests",
      path: "/market/requests",
      icon: ClipboardList,
    },
  ];

  const currentNavItems =
    sidebarMode === "main" ? mainNavItems : marketNavItems;

  return (
    <aside
      className={`${styles.sidebar} ${isCollapsed ? styles.collapsed : ""}`}
    >
      {/* Header */}
      <div className={styles.header}>
        <NavLink to="/" className={styles.logoLink}>
          <div className={styles.logo}>
            <img
              src="/assets/logo/logo.png"
              alt="Createrington Logo"
              className={styles.logoImage}
            />
          </div>
          {!isCollapsed && <span className={styles.title}>Createrington</span>}
        </NavLink>
        <button
          className={styles.collapseToggle}
          onClick={toggleCollapsed}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? (
            <ChevronRight className={styles.collapseIcon} />
          ) : (
            <ChevronLeft className={styles.collapseIcon} />
          )}
        </button>
      </div>

      {/* Server Status */}
      <div className={styles.serverStatus}>
        {isSingleServer && singleServer ? (
          // Single server display
          <>
            <div className={styles.statusIndicator}>
              <div
                className={`${styles.statusDot} ${
                  singleServer.online ? styles.online : styles.offline
                }`}
              />
              {!isCollapsed && (
                <span
                  className={styles.statusText}
                  style={{
                    color: singleServer.online ? "#22c55e" : "#ef4444",
                  }}
                >
                  {singleServer.online ? "Online" : "Offline"}
                </span>
              )}
            </div>
            {!isCollapsed && singleServer.online && (
              <div className={styles.playerCount}>
                {singleServer.playerCount} / {singleServer.maxPlayers} Players
              </div>
            )}
          </>
        ) : (
          // Multiple servers display
          <>
            <div className={styles.statusIndicator}>
              <Server className={styles.serverIcon} />
              {!isCollapsed && (
                <span className={styles.statusText}>Servers</span>
              )}
            </div>
            {!isCollapsed && (
              <div className={styles.serverStats}>
                <div className={styles.statRow}>
                  <span className={styles.statLabel}>Online:</span>
                  <span className={styles.statValue}>
                    {serverStats.online} / {serverStats.total}
                  </span>
                </div>
                <div className={styles.statRow}>
                  <span className={styles.statLabel}>Players:</span>
                  <span className={styles.statValue}>
                    {serverStats.totalPlayers} / {serverStats.totalCapacity}
                  </span>
                </div>
              </div>
            )}
            {isCollapsed && (
              <div className={styles.collapsedStats}>
                <div
                  className={styles.miniStat}
                  title={`${serverStats.online}/${serverStats.total} servers online`}
                >
                  {serverStats.online}/{serverStats.total}
                </div>
                <div
                  className={styles.miniStat}
                  title={`${serverStats.totalPlayers} players online`}
                >
                  {serverStats.totalPlayers}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Navigation */}
      <nav className={styles.nav}>
        <ul className={styles.navList}>
          {currentNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.path} className={styles.navItem}>
                <NavLink
                  to={item.path}
                  end={item.path === "/" || item.path === "/market"}
                  className={({ isActive }) =>
                    `${styles.navLink} ${isActive ? styles.active : ""}`
                  }
                  title={isCollapsed ? item.label : undefined}
                >
                  <Icon className={styles.navIcon} />
                  {!isCollapsed && (
                    <>
                      <span className={styles.navLabel}>{item.label}</span>
                      {item.badge !== undefined && (
                        <span className={styles.badge}>{item.badge}</span>
                      )}
                    </>
                  )}
                  {isCollapsed && item.badge !== undefined && (
                    <span className={styles.badgeDot} />
                  )}
                </NavLink>
              </li>
            );
          })}

          {/* Back button for market mode */}
          {sidebarMode === "market" && (
            <li className={styles.navItem}>
              <NavLink
                to="/"
                className={styles.navLink}
                title={isCollapsed ? "Back to Main" : undefined}
              >
                <ArrowLeftCircle className={styles.navIcon} />
                {!isCollapsed && (
                  <span className={styles.navLabel}>Back to Main</span>
                )}
              </NavLink>
            </li>
          )}
        </ul>
      </nav>

      {/* Footer */}
      {!isCollapsed && (
        <div className={styles.footer}>
          <button className={styles.loginButton}>
            <svg
              className={styles.loginIcon}
              viewBox="0 0 24 24"
              fill="currentColor"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z" />
            </svg>
            Login with Discord
          </button>
        </div>
      )}
    </aside>
  );
};
