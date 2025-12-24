/**
 * Re-export everything under a namespace
 *
 * This acts as a convenient wrapper around config values,
 * providing better autocomplete organization
 */

import { DiscordMessageService } from "@/services/discord/messages/message.service";
import { DiscordUsers } from "./users";
import { DiscordRolesNamespace } from "./roles";
import { DiscordChannelsNamespace } from "./channels";
import { DiscordCategoriesNamespace } from "./categories";

let messageService: DiscordMessageService | null = null;

// Unified namespace for better autocomplete
export const Discord = {
  Roles: DiscordRolesNamespace,
  Channels: DiscordChannelsNamespace,
  Categories: DiscordCategoriesNamespace,
  Users: DiscordUsers,

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
