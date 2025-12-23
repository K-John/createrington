/**
 * Re-export everything under a namespace
 *
 * This acts as a convenient wrapper around config values,
 * providing better autocomplete organization
 */
import { DiscordRoles, getRoleName, isValidRole } from "./roles";
import { DiscordChannels, getChannelName, isValidChannel } from "./channels";
import {
  DiscordCategories,
  getCategoryName,
  isValidCategory,
} from "./categories";
import { DiscordMessageService } from "@/services/discord/messages/message.service";

let messageService: DiscordMessageService | null = null;

// Unified namespace for better autocomplete
export const Discord = {
  Roles: DiscordRoles,
  Channels: DiscordChannels,
  Categories: DiscordCategories,

  // Validation helpers
  isValidRole: isValidRole,
  isValidChannel: isValidChannel,
  isValidCategory: isValidCategory,

  // Name lookups
  getRoleName,
  getChannelName,
  getCategoryName,

  // Getter for message service
  get messages(): DiscordMessageService {
    if (!messageService) {
      throw new Error("Discord message service not initialized");
    }
    return messageService;
  },

  // Internal setter
  _setMessageService(service: DiscordMessageService) {
    messageService = service;
  },
};

export * from "./roles";
export * from "./channels";
