import React, { useState } from "react";
import styles from "./PlayerSearch.module.scss";

interface Player {
  id: number;
  discordId: string;
  minecraftUuid: string;
  minecraftUsername: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export const PlayerSearch: React.FC = () => {
  const [search, setSearch] = useState("");
  const [players, setPlayers] = useState<Player[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Search players
  const handleSearch = async () => {
    if (!search.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      params.append("minecraft_username", search);
      params.append("limit", "10");

      const response = await fetch(`/api/players?${params}`);
      const data = await response.json();

      if (data.success) {
        setPlayers(data.data.players);
        setPagination(data.data.pagination);
      } else {
        setError(data.error?.message || "Failed to fetch players");
      }
    } catch (err) {
      setError("Network error - is the server running?");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Get player by ID
  const handleGetPlayer = async (id: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/players/${id}`);
      const data = await response.json();

      if (data.success) {
        setSelectedPlayer(data.data);
      } else {
        setError(data.error?.message || "Player not found");
      }
    } catch (err) {
      setError("Network error - is the server running?");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Get all players (paginated)
  const handleGetAll = async (page: number = 0) => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      params.append("page", String(page));
      params.append("limit", "20");
      params.append("sort_by", "createdAt");
      params.append("sort_order", "desc");

      const response = await fetch(`/api/players?${params}`);
      const data = await response.json();

      if (data.success) {
        setPlayers(data.data.players);
        setPagination(data.data.pagination);
      } else {
        setError(data.error?.message || "Failed to fetch players");
      }
    } catch (err) {
      setError("Network error - is the server running?");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Player API Test</h1>
        <p className={styles.subtitle}>Test the new /api/players endpoints</p>
      </div>

      {/* Search Section */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Search Players</h2>
        <div className={styles.searchBox}>
          <input
            type="text"
            placeholder="Search by username..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSearch()}
            className={styles.input}
          />
          <button
            onClick={handleSearch}
            disabled={loading || !search.trim()}
            className={styles.button}
          >
            {loading ? "Searching..." : "Search"}
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Quick Actions</h2>
        <div className={styles.actions}>
          <button
            onClick={() => handleGetAll(0)}
            disabled={loading}
            className={styles.buttonSecondary}
          >
            Get All Players
          </button>
          <button
            onClick={() => handleGetPlayer("123456789012345678")}
            disabled={loading}
            className={styles.buttonSecondary}
          >
            Test Discord ID
          </button>
          <button
            onClick={() =>
              handleGetPlayer("550e8400-e29b-41d4-a716-446655440000")
            }
            disabled={loading}
            className={styles.buttonSecondary}
          >
            Test UUID
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className={styles.error}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          {error}
        </div>
      )}

      {/* Selected Player Detail */}
      {selectedPlayer && (
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Selected Player</h2>
          <div className={styles.card}>
            <div className={styles.cardRow}>
              <span className={styles.label}>ID:</span>
              <span className={styles.value}>{selectedPlayer.id}</span>
            </div>
            <div className={styles.cardRow}>
              <span className={styles.label}>Username:</span>
              <span className={styles.value}>
                {selectedPlayer.minecraftUsername}
              </span>
            </div>
            <div className={styles.cardRow}>
              <span className={styles.label}>Discord ID:</span>
              <span className={styles.value}>{selectedPlayer.discordId}</span>
            </div>
            <div className={styles.cardRow}>
              <span className={styles.label}>UUID:</span>
              <span className={styles.valueSmall}>
                {selectedPlayer.minecraftUuid}
              </span>
            </div>
            <div className={styles.cardRow}>
              <span className={styles.label}>Active:</span>
              <span
                className={`${styles.badge} ${
                  selectedPlayer.isActive
                    ? styles.badgeSuccess
                    : styles.badgeError
                }`}
              >
                {selectedPlayer.isActive ? "Active" : "Inactive"}
              </span>
            </div>
            <div className={styles.cardRow}>
              <span className={styles.label}>Created:</span>
              <span className={styles.value}>
                {new Date(selectedPlayer.createdAt).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Players List */}
      {players.length > 0 && (
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>
            Players
            {pagination && (
              <span className={styles.count}> ({pagination.total} total)</span>
            )}
          </h2>

          <div className={styles.grid}>
            {players.map((player) => (
              <div
                key={player.id}
                className={styles.playerCard}
                onClick={() => setSelectedPlayer(player)}
              >
                <div className={styles.playerHeader}>
                  <h3 className={styles.playerName}>
                    {player.minecraftUsername}
                  </h3>
                  <span
                    className={`${styles.badge} ${
                      player.isActive ? styles.badgeSuccess : styles.badgeError
                    }`}
                  >
                    {player.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
                <div className={styles.playerInfo}>
                  <span className={styles.infoLabel}>ID: {player.id}</span>
                  <span className={styles.infoLabel}>
                    Discord: {player.discordId.slice(0, 8)}...
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className={styles.pagination}>
              <button
                onClick={() => handleGetAll(pagination.page - 1)}
                disabled={loading || pagination.page === 0}
                className={styles.paginationButton}
              >
                Previous
              </button>
              <span className={styles.paginationInfo}>
                Page {pagination.page + 1} of {pagination.totalPages}
              </span>
              <button
                onClick={() => handleGetAll(pagination.page + 1)}
                disabled={
                  loading || pagination.page >= pagination.totalPages - 1
                }
                className={styles.paginationButton}
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className={styles.loading}>
          <div className={styles.spinner} />
          <p>Loading...</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && players.length === 0 && !selectedPlayer && (
        <div className={styles.empty}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
            <path
              d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2" />
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
          <h3>No Players Found</h3>
          <p>Search for players or click "Get All Players" to start</p>
        </div>
      )}
    </div>
  );
};
