import { AdminWaitlistNotificationData } from "../types";
import { BaseEmailTemplate } from "./base.template";

export class AdminWaitlistNotificationTemplate extends BaseEmailTemplate<AdminWaitlistNotificationData> {
  protected getSubject(data: AdminWaitlistNotificationData): string {
    return `📥 New Waitlist Submission: ${data.discordName}`;
  }

  protected getHtml(data: AdminWaitlistNotificationData): string {
    return `
      <p><strong>New waitlist submission received!</strong></p>
      <ul>
        <li><strong>ID:</strong> ${data.id}</li>
        <li><strong>Discord:</strong> ${data.discordName}</li>
        <li><strong>Email:</strong> ${data.email}</li>
      </ul>
    `;
  }

  protected getText(data: AdminWaitlistNotificationData): string {
    return `
        New waitlist entry:
        Discord: ${data.discordName}
        Email: ${data.email}
            `.trim();
  }
}
