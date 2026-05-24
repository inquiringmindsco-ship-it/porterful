/**
 * Branded music purchase email template for Porterful
 * Premium HTML with mobile-friendly layout
 * Supports multiple tracks in one email
 */

interface TrackAccess {
  trackTitle: string
  artistName: string
  accessUrl: string
  expiresAt: string
}

interface PurchaseEmailData {
  buyerEmail: string
  tracks: TrackAccess[]
}

export function buildPurchaseEmailHTML(data: PurchaseEmailData): string {
  const { tracks } = data

  const trackCards = tracks.map(t => {
    const expiryDate = new Date(t.expiresAt).toLocaleDateString('en-US', {
      month: 'long', day: 'numeric', year: 'numeric'
    })
    const expiryTime = new Date(t.expiresAt).toLocaleTimeString('en-US', {
      hour: '2-digit', minute: '2-digit'
    })
    return `
      <!-- Track Card -->
      <div class="track-card" style="background-color: #1e1e28; border: 1px solid #2a2a35; border-radius: 12px; padding: 24px; margin-bottom: 16px;">
        <p style="margin: 0 0 8px; font-size: 12px; font-weight: 600; color: #ff6b35; text-transform: uppercase; letter-spacing: 0.5px;">TRACK</p>
        <p style="margin: 0 0 4px; font-size: 18px; font-weight: 700; color: #ffffff;">${escapeHtml(t.trackTitle)}</p>
        <p style="margin: 0 0 20px; font-size: 14px; color: #8a8a9a;">by ${escapeHtml(t.artistName)}</p>

        <a href="${t.accessUrl}" class="button" style="display: inline-block; background-color: #ff6b35; color: #ffffff; text-decoration: none; font-size: 15px; font-weight: 700; padding: 14px 32px; border-radius: 10px; text-align: center; letter-spacing: -0.2px;">Download Track</a>

        <p style="margin: 16px 0 0; font-size: 12px; color: #6a6a7a; word-break: break-all;">
          Or copy this link:<br>
          <a href="${t.accessUrl}" style="color: #8a8a9a; text-decoration: underline;">${t.accessUrl}</a>
        </p>

        <p style="margin: 12px 0 0; font-size: 12px; color: #b0a090;">
          <strong style="color: #e0c090;">Link expires:</strong> ${expiryDate} at ${expiryTime}
        </p>
      </div>
    `
  }).join('\n')

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Porterful Music</title>
  <style>
    body, table, td, p, a, li, blockquote { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; outline: none; text-decoration: none; }
    @media screen and (max-width: 600px) {
      .container { width: 100% !important; }
      .content { padding: 24px 20px !important; }
      .track-card { padding: 20px !important; }
      .button { width: 100% !important; display: block !important; text-align: center !important; }
      .footer-text { font-size: 12px !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #0a0a0f; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; -webkit-font-smoothing: antialiased;"
  bgcolor="#0a0a0f">

  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #0a0a0f;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="560" class="container" style="max-width: 560px; width: 100%;">

          <!-- Logo / Header -->
          <tr>
            <td align="center" style="padding-bottom: 32px;">
              <p style="margin: 0; font-size: 24px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px;">
                Porterful<span style="color: #ff6b35;">.</span>
              </p>
              <p style="margin: 4px 0 0; font-size: 13px; color: #8a8a9a;">Music, directly from the artists.</p>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td class="content" style="background-color: #141419; border: 1px solid #2a2a35; border-radius: 16px; padding: 40px;">

              <p style="margin: 0 0 24px; font-size: 22px; font-weight: 700; color: #ffffff; line-height: 1.3;">
                Your music is ready 🎵
              </p>
              <p style="margin: 0 0 32px; font-size: 15px; color: #b0b0c0; line-height: 1.6;">
                Thanks for supporting independent artists. ${tracks.length > 1 ? `You have ${tracks.length} tracks ready for download.` : 'Your purchase is confirmed.'}
              </p>

              ${trackCards}

              <!-- Recovery Help -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #1a1520; border: 1px solid #2a2535; border-radius: 10px; margin-bottom: 32px;">
                <tr>
                  <td style="padding: 16px 20px;">
                    <p style="margin: 0; font-size: 13px; color: #b0a090; line-height: 1.5;">
                      <strong style="color: #e0c090;">Link expired or lost?</strong><br>
                      Visit <a href="https://porterful.com/music/recover" style="color: #ff6b35; text-decoration: none;">porterful.com/music/recover</a> and enter your email to get a fresh link.
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Support -->
              <p style="margin: 0; font-size: 13px; color: #6a6a7a; line-height: 1.5;">
                Questions? Reply to this email or contact <a href="mailto:support@porterful.com" style="color: #8a8a9a; text-decoration: underline;">support@porterful.com</a>
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding-top: 24px;" class="footer-text">
              <p style="margin: 0; font-size: 12px; color: #4a4a5a;">
                Porterful — St. Louis, MO<br>
                <a href="https://porterful.com" style="color: #5a5a6a; text-decoration: none;">porterful.com</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>`
}

export function buildPurchaseEmailText(data: PurchaseEmailData): string {
  const { tracks } = data
  const trackList = tracks.map(t => {
    const expiryDate = new Date(t.expiresAt).toLocaleDateString('en-US', {
      month: 'long', day: 'numeric', year: 'numeric'
    })
    return `Track: ${t.trackTitle}\nArtist: ${t.artistName}\nDownload: ${t.accessUrl}\nExpires: ${expiryDate}`
  }).join('\n---\n')

  return `Porterful — Your music is ready\n\n${trackList}\n\n---\n\nLink expired or lost?\nVisit https://porterful.com/music/recover and enter your email for a fresh link.\n\nQuestions? Reply to this email or contact support@porterful.com\n\n—\nPorterful\nSt. Louis, MO\nhttps://porterful.com\n`
}

function escapeHtml(text: string): string {
  const div = typeof document !== 'undefined' ? document.createElement('div') : null
  if (div) {
    div.textContent = text
    return div.innerHTML
  }
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}
