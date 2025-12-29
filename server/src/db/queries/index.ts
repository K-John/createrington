/**
 * Barrel export for all actual query classes
 * 
 * Auto-generated from database schema
 * DO NOT EDIT MANUALLY - regenerate with: npm run generate
 * 
 * @example
 * import { PlayerQueries, AdminLogActionQueries } from "@/db/queries";
 */

export { AdminQueries } from "./admin";
export { AdminLogActionQueries } from "./admin/log/action";
export { DiscordGuildMemberJoinQueries } from "./discord/guild/member/join";
export { PlayerQueries } from "./player";
export { PlayerBalanceQueries } from "./player/balance";
export { PlayerPlaytimeQueries } from "./player/playtime";
export { PlayerPlaytimeDailyQueries } from "./player/playtime/daily";
export { ServerQueries } from "./server";
export { WaitlistEntryQueries } from "./waitlist/entry";
