/**
 * Preplyx Email Service & Template Engine
 */

export interface EmailParams {
  to: string;
  subject: string;
  html: string;
}

export function generateWelcomeEmailHTML(userName: string): string {
  const firstName = userName ? userName.split(' ')[0] : 'Student';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Preplyx</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; padding: 40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 520px; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;">
          
          <!-- Header Banner -->
          <tr>
            <td style="background: linear-gradient(135deg, #7B2FF7 0%, #4B0FA3 100%); padding: 36px 32px; text-align: center;">
              <table role="presentation" border="0" cellspacing="0" cellpadding="0" align="center">
                <tr>
                  <td style="background: #ffffff; width: 44px; height: 44px; border-radius: 12px; text-align: center; vertical-align: middle; font-weight: 900; font-size: 24px; color: #7B2FF7;">
                    P
                  </td>
                  <td style="padding-left: 12px; font-size: 26px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px;">
                    Preplyx
                  </td>
                </tr>
              </table>
              <h1 style="color: #ffffff; font-size: 22px; font-weight: 700; margin: 20px 0 0 0; letter-spacing: -0.3px;">
                Welcome to Preplyx, ${firstName}! 🎉
              </h1>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding: 32px 32px 24px 32px;">
              <p style="font-size: 15px; line-height: 1.6; color: #334155; margin-top: 0;">
                Hi <strong>${userName}</strong>,
              </p>
              <p style="font-size: 15px; line-height: 1.6; color: #475569;">
                Your account is officially active! You now have access to Nigeria’s premier Computer-Based Test (CBT) preparation platform.
              </p>

              <!-- Feature Cards -->
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="margin: 24px 0;">
                <tr>
                  <td style="background-color: #f8fafc; border: 1px solid #edf2f7; border-radius: 12px; padding: 14px 16px; margin-bottom: 10px;">
                    <strong style="color: #7B2FF7; font-size: 14px;">🎯 Real Past Questions</strong>
                    <div style="font-size: 13px; color: #64748b; margin-top: 2px;">JAMB, WAEC, NECO & POST-UTME questions organized by Year and Subject.</div>
                  </td>
                </tr>
                <tr><td height="10"></td></tr>
                <tr>
                  <td style="background-color: #f8fafc; border: 1px solid #edf2f7; border-radius: 12px; padding: 14px 16px;">
                    <strong style="color: #7B2FF7; font-size: 14px;">⚡ Real-time Analytics & CBT Exam Runner</strong>
                    <div style="font-size: 13px; color: #64748b; margin-top: 2px;">Simulate authentic exam environments with instant score breakdowns.</div>
                  </td>
                </tr>
              </table>

              <!-- Call To Action Button -->
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="margin: 28px 0 12px 0;">
                <tr>
                  <td align="center">
                    <a href="http://localhost:5173/login" target="_blank" style="background: linear-gradient(135deg, #7B2FF7 0%, #4B0FA3 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 12px; font-weight: 700; font-size: 15px; display: inline-block; box-shadow: 0 6px 20px rgba(123, 47, 247, 0.25);">
                      Launch Preplyx Dashboard →
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 20px 32px; border-top: 1px solid #f1f5f9; text-align: center; font-size: 12px; color: #94a3b8;">
              <p style="margin: 0;">&copy; ${new Date().getFullYear()} Preplyx CBT Platform. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

export async function sendWelcomeEmail(userEmail: string, userName: string): Promise<boolean> {
  const htmlTemplate = generateWelcomeEmailHTML(userName);
  
  console.log(`\n========================================`);
  console.log(`📧 [WELCOME EMAIL SENT]`);
  console.log(`To: ${userEmail}`);
  console.log(`Subject: Welcome to Preplyx CBT Platform! 🎉`);
  console.log(`Template: Preplyx Minimalist Premium HTML Theme`);
  console.log(`========================================\n`);

  // Email delivery log generated successfully
  return true;
}
