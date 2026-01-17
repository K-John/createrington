import { Discord } from "@/discord/constants";
import {
  PlaytimeRoleRule,
  RoleCheckInterval,
  RoleConditionType,
  RoleNotificationConfig,
} from "./types";

/**
 * Playtime-based role hierarchy configuration
 *
 * Roles are assigned based on cumulative playtime across all servers
 * When a player qualifies for a higher role, lower roles are automatically removed
 */
export const PLAYTIME_ROLE_HIERARCHY: PlaytimeRoleRule[] = [
  {
    roleId: Discord.Roles.SHAFT_SCRAPER,
    requiredSeconds: 0, // Starting role - everyone gets this
    checkInterval: RoleCheckInterval.REALTIME,
    label: "Shaft Scraper",
    conditionType: RoleConditionType.PLAYTIME,
    removesRoles: [],
    enabled: true,
  },
  {
    roleId: Discord.Roles.COG_CARRIER,
    requiredSeconds: 72000, // 20 hours
    checkInterval: RoleCheckInterval.REALTIME,
    label: "Cog Carrier",
    conditionType: RoleConditionType.PLAYTIME,
    removesRoles: [Discord.Roles.SHAFT_SCRAPER],
    enabled: true,
  },
  {
    roleId: Discord.Roles.KINETIC_OPERATOR,
    requiredSeconds: 144000, // 40 hours
    checkInterval: RoleCheckInterval.REALTIME,
    label: "Kinetic Operator",
    conditionType: RoleConditionType.PLAYTIME,
    removesRoles: [Discord.Roles.COG_CARRIER],
    enabled: true,
  },
  {
    roleId: Discord.Roles.MECHANICAL_ASSEMBLER,
    requiredSeconds: 216000, // 60 hours
    checkInterval: RoleCheckInterval.REALTIME,
    label: "Mechanical Assembler",
    conditionType: RoleConditionType.PLAYTIME,
    removesRoles: [Discord.Roles.KINETIC_OPERATOR],
    enabled: true,
  },
  {
    roleId: Discord.Roles.BRASS_TECHNICIAN,
    requiredSeconds: 360000, // 100 hours
    checkInterval: RoleCheckInterval.REALTIME,
    label: "Brass Technician",
    conditionType: RoleConditionType.PLAYTIME,
    removesRoles: [Discord.Roles.MECHANICAL_ASSEMBLER],
    enabled: true,
  },
  {
    roleId: Discord.Roles.STEAM_ENGINEER,
    requiredSeconds: 720000, // 200 hours
    checkInterval: RoleCheckInterval.REALTIME,
    label: "Steam Engineer",
    conditionType: RoleConditionType.PLAYTIME,
    removesRoles: [Discord.Roles.BRASS_TECHNICIAN],
    enabled: true,
  },
  {
    roleId: Discord.Roles.FACTORY_OVERSEER,
    requiredSeconds: 1080000, // 300 hours
    checkInterval: RoleCheckInterval.REALTIME,
    label: "Factory Overseer",
    conditionType: RoleConditionType.PLAYTIME,
    removesRoles: [Discord.Roles.STEAM_ENGINEER],
    enabled: true,
  },
  {
    roleId: Discord.Roles.MASTER_AUTOMATON,
    requiredSeconds: 1440000, // 400 hours
    checkInterval: RoleCheckInterval.REALTIME,
    label: "Master Automaton",
    conditionType: RoleConditionType.PLAYTIME,
    removesRoles: [Discord.Roles.FACTORY_OVERSEER],
    enabled: true,
  },
  {
    roleId: Discord.Roles.CLOCKWORK_ARCHITECT,
    requiredSeconds: 3600000, // 1000 hours
    checkInterval: RoleCheckInterval.REALTIME,
    label: "Clockwork Architect",
    conditionType: RoleConditionType.PLAYTIME,
    removesRoles: [Discord.Roles.MASTER_AUTOMATON],
    enabled: true,
  },
];

/**
 * Gets all role assignment rules
 *
 * @returns Array of all configured role rules
 */
export function getAllRoleRules(): PlaytimeRoleRule[] {
  return PLAYTIME_ROLE_HIERARCHY.filter((rule) => rule.enabled !== false);
}

/**
 * Gets role rules that should be checked in realtime
 *
 * @returns Array of realtime role rules
 */
export function getRealtimeRoleRules(): PlaytimeRoleRule[] {
  return getAllRoleRules().filter(
    (rule) => rule.checkInterval === RoleCheckInterval.REALTIME
  );
}

/**
 * Gets role rules that should be checked daily
 *
 * @returns Array of daily role rules
 */
export function getDailyRoleRules(): PlaytimeRoleRule[] {
  return getAllRoleRules().filter(
    (rule) => rule.checkInterval === RoleCheckInterval.DAILY
  );
}

/**
 * Default notification configuration
 */
export const DEFAULT_NOTIFICATION_CONFIG: RoleNotificationConfig = {
  enabled: true,
  channelId: Discord.Channels.HALL_OF_FAME,
  isMilestone: false,
};

/**
 * Notification configuration for specific roles
 * Override defaults here for special roles
 */
export const ROLE_NOTIFICATION_CONFIGS: Record<
  string,
  Partial<RoleNotificationConfig>
> = {
  [Discord.Roles.SHAFT_SCRAPER]: {
    enabled: true,
    emoji: "⛏️",
    isMilestone: false,
  },
  [Discord.Roles.COG_CARRIER]: {
    enabled: true,
    emoji: "⚙️",
    isMilestone: false,
  },
  [Discord.Roles.KINETIC_OPERATOR]: {
    enabled: true,
    emoji: "🔧",
    isMilestone: false,
  },
  [Discord.Roles.MECHANICAL_ASSEMBLER]: {
    enabled: true,
    emoji: "🔩",
    isMilestone: false,
  },
  [Discord.Roles.BRASS_TECHNICIAN]: {
    enabled: true,
    emoji: "🛠️",
    isMilestone: true,
  },
  [Discord.Roles.STEAM_ENGINEER]: {
    enabled: true,
    emoji: "🚂",
    isMilestone: true,
  },
  [Discord.Roles.FACTORY_OVERSEER]: {
    enabled: true,
    emoji: "🏭",
    isMilestone: true,
  },
  [Discord.Roles.MASTER_AUTOMATON]: {
    enabled: true,
    emoji: "🤖",
    isMilestone: true,
  },
  [Discord.Roles.CLOCKWORK_ARCHITECT]: {
    enabled: true,
    emoji: "👑",
    isMilestone: true,
    customMessage:
      "has reached the pinnacle of automation mastery and earned the legendary title of",
  },
};

/**
 * Gets notification configuration for a specific role
 *
 * @param roleId - Discord role ID
 * @returns Merged notification configuration
 */
export function getNotificationConfig(roleId: string): RoleNotificationConfig {
  const customConfig = ROLE_NOTIFICATION_CONFIGS[roleId] || {};
  return {
    ...DEFAULT_NOTIFICATION_CONFIG,
    ...customConfig,
  };
}
