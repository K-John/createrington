export interface MinecraftPlayer {
  uuid: string;
  username: string;
}

export interface ActiveSession {
  uuid: string;
  username: string;
  serverId: number;
  sessionStart: Date;
  sessionId?: number;
}

export interface SessionEndEvent {
  sessionId: number;
  uuid: string;
  username: string;
  serverId: number;
  sessionStart: Date;
  sessionEnd: Date;
  secondsPlayed: number;
}

export interface SessionStartEvent {
  uuid: string;
  username: string;
  serverId: number;
  sessionStart: Date;
}

export interface PlaytimeServiceConfig {
  serverIp: string;
  serverPort: number;
  serverId: number;
  pollIntervalMs?: number;
  statusTimeoutMs?: number;
  initialDelayMs?: number;
}

export interface ServerStatusSnapshot {
  onlinePlayers: MinecraftPlayer[];
  playerCount: number;
  maxPlayers: number;
  timestamp: Date;
}
