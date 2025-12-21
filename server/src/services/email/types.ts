export interface EmailAddress {
  email: string;
  name?: string;
}

export interface EmailAttachment {
  filename: string;
  path?: string;
  content?: Buffer | string;
  contentType?: string;
  cid?: string;
}

export interface EmailOptions {
  to: string | EmailAddress | Array<string | EmailAddress>;
  subject: string;
  html?: string;
  text?: string;
  cc?: string | EmailAddress | Array<string | EmailAddress>;
  bcc?: string | EmailAddress | Array<string | EmailAddress>;
  replyTo?: string | EmailAddress;
  attachments?: EmailAttachment[];
  from?: string | EmailAddress;
}

export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export enum EmailTemplate {
  WAITLIST_CONFIRMATION = "waitlist-confirmation",
  WAITLIST_INVITATION = "waitlist-invitation",
  ADMIN_WAITLIST_NOTIFICATION = "admin-waitlist-notification",
}

export interface WaitlistConfirmationData {
  discordName: string;
  position?: number;
}

export interface WaitlistInvitationData {
  discordName: string;
  token: string;
}

export interface AdminWaitlistNotificationData {
  id: number;
  email: string;
  discordName: string;
}
