import path from "node:path";
import { fileURLToPath } from "node:url";
import { BaseEmailTemplate } from "./base.template";
import { EmailAttachment, WaitlistInvitationData } from "../types";
import config from "@/config";

const links = config.meta.links;

export class WaitlistInvitationTemplate extends BaseEmailTemplate<WaitlistInvitationData> {
  protected getSubject(data: WaitlistInvitationData): string {
    return "🎉 Your Invitation to Createrington is Ready!";
  }

  protected getHtml(data: WaitlistInvitationData): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            h3 {
              color: #2c3e50;
              margin-top: 25px;
            }
            ul {
              padding-left: 20px;
            }
            li {
              margin: 8px 0;
            }
            a {
              color: #3498db;
              text-decoration: none;
            }
            a:hover {
              text-decoration: underline;
            }
            .token {
              background: #f8f9fa;
              padding: 12px;
              border-left: 4px solid #3498db;
              margin: 20px 0;
              font-family: 'Courier New', monospace;
              font-size: 16px;
            }
            .footer {
              margin-top: 30px;
              padding-top: 20px;
              border-top: 2px solid #e9ecef;
            }
            .logo {
              width: 200px;
              margin-top: 20px;
            }
          </style>
        </head>
        <body>
          <p>Hi <strong>${data.discordName}</strong>,</p>
          
          <p>Great news — a spot has just opened up on <strong>Createrington</strong>, and you're next in line! We're excited to welcome you to the server and can't wait to see what you'll create.</p>
        
          <h3>🌍 What is Createrington?</h3>
          <p>Createrington is a carefully curated Minecraft Create mod server focused on mechanical innovation, aesthetic building, and quality-of-life improvements. With a Vanilla+ feel and a vibrant, collaborative community, it's the perfect place to bring your most imaginative ideas to life.</p>
        
          <h3>🛠️ Highlights of the Experience:</h3>
          <ul>
            <li>Advanced automation with Create & its add-ons</li>
            <li>Gorgeous builds using Macaw's, Chipped, and Rechiseled</li>
            <li>Expanded food options with Farmer's Delight and more</li>
            <li>Optimized performance and smooth visuals</li>
            <li>Seamless multiplayer with FTB Teams and Simple Voice Chat</li>
          </ul>
        
          <p>We're currently running our latest modpack on CurseForge, built specifically to enhance both creativity and performance.</p>
        
          <h3>🔗 Next Steps:</h3>
          <p>To join, follow the instructions in the invite link below. If we don't hear back within 48 hours, the spot may be offered to the next person in the queue.</p>
        
          <p><a href="${links.discordInvite}">Join our Discord</a></p>
          
          <div class="token">
            <em>Your verification token:</em> <strong>${data.token}</strong>
          </div>
        
          <p>Looking forward to seeing you in-game and watching your creations come to life!</p>
          
          <p><em>This is an automated message, please do not reply</em><br>
          If you need help, contact me on Discord: <strong>matejhoz</strong></p>
        
          <div class="footer">
            <p>Best regards,<br />
            <strong>saunhardy</strong><br />
            Server Admin – Createrington<br />
            <a href="${links.website}">${links.website}</a></p>
          
            <img src="cid:createrington-logo" alt="Createrington Logo" class="logo" />
          </div>
        </body>
      </html>
    `;
  }

  protected getText(data: WaitlistInvitationData): string {
    return `
        Hi ${data.discordName},

        Great news — a spot has just opened up on Createrington, and you're next in line! We're excited to welcome you to the server and can't wait to see what you'll create.

        🌍 What is Createrington?

        Createrington is a carefully curated Minecraft Create mod server focused on mechanical innovation, aesthetic building, and quality-of-life improvements. With a Vanilla+ feel and a vibrant, collaborative community, it's the perfect place to bring your most imaginative ideas to life.

        🛠️ Highlights of the Experience:

        - Advanced automation with Create & its add-ons
        - Gorgeous builds using Macaw's, Chipped, and Rechiseled
        - Expanded food options with Farmer's Delight and more
        - Optimized performance and smooth visuals
        - Seamless multiplayer with FTB Teams and Simple Voice Chat

        We're currently running our latest modpack on CurseForge, built specifically to enhance both creativity and performance.

        🔗 Next Steps:

        To join, follow the instructions in the invite link below. If we don't hear back within 48 hours, the spot may be offered to the next person in the queue.

        Join our Discord: ${links.discordInvite}

        Your verification token: ${data.token}

        Looking forward to seeing you in-game and watching your creations come to life!

        This is an automated message, please do not reply
        If you need help, contact me on Discord: matejhoz

        Best regards,
        saunhardy
        Server Admin – Createrington
        ${links.website}
    `.trim();
  }

  protected getAttachments(data: WaitlistInvitationData): EmailAttachment[] {
    const logoPath = path.join(
      path.dirname(fileURLToPath(import.meta.url)),
      "..",
      "..",
      "assets",
      "logo.png"
    );

    return [
      {
        filename: "logo.png",
        path: logoPath,
        cid: "createrington-logo",
      },
    ];
  }
}
