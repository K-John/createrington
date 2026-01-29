import type { WaitlistConfirmationData } from "../types";
import { BaseEmailTemplate } from "./base.template";

export class WaitlistConfirmationTemplate extends BaseEmailTemplate<WaitlistConfirmationData> {
  protected getSubject(data: WaitlistConfirmationData): string {
    return "You're on the waitlist! 🎮";
  }

  protected getHtml(data: WaitlistConfirmationData): string {
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
              background: #f5f5f5;
            }
            .container {
              background: white;
              border-radius: 10px;
              overflow: hidden;
              box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            .header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 40px 30px;
              text-align: center;
            }
            .header h1 {
              margin: 0;
              font-size: 28px;
            }
            .content {
              padding: 30px;
            }
            .content p {
              margin: 0 0 15px 0;
            }
            .highlight {
              background: #f0f4ff;
              border-left: 4px solid #667eea;
              padding: 15px;
              margin: 20px 0;
              border-radius: 4px;
            }
            .footer {
              text-align: center;
              padding: 20px 30px;
              color: #666;
              font-size: 14px;
              border-top: 1px solid #eee;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Welcome to the Waitlist!</h1>
            </div>
            <div class="content">
              <p>Hey <strong>${data.discordName}</strong>,</p>
              
              <p>Thanks for your interest in joining Createrington! You've been successfully added to our waitlist.</p>
              
              ${
                data.position
                  ? `<div class="highlight">
                      <p style="margin: 0;"><strong>Your Position:</strong> #${data.position}</p>
                    </div>`
                  : ""
              }
              
              <p>We'll notify you via email as soon as a spot opens up. In the meantime, feel free to join our Discord community to stay updated!</p>
              
              <p>See you soon! ⚙️</p>
            </div>
            <div class="footer">
              <p><strong>Createrington</strong> - Minecraft Create Server</p>
              <p>Questions? Contact us on Discord: matejhoz</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  protected getText(data: WaitlistConfirmationData): string {
    return `
        Hey ${data.discordName},

        Thanks for your interest in joining Createrington! You've been successfully added to our waitlist.

        ${data.position ? `Your current position: #${data.position}` : ""}

        We'll notify you via email as soon as a spot opens up.

        See you soon! ⚙️

        ---
        Createrington - Minecraft Create Server
        Questions? Contact us on Discord: matejhoz
            `.trim();
  }
}
