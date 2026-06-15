type ArtistWelcomeEmailInput = {
  artistName: string
  dashboardUrl: string
  artistPageUrl?: string | null
  genre?: string | null
  city?: string | null
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export function buildArtistWelcomeEmailHTML(input: ArtistWelcomeEmailInput) {
  const artistName = escapeHtml(input.artistName)
  const dashboardUrl = input.dashboardUrl
  const artistPageUrl = input.artistPageUrl || dashboardUrl
  const genre = input.genre ? escapeHtml(input.genre) : null
  const city = input.city ? escapeHtml(input.city) : null

  return `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Welcome to Porterful</title>
  </head>
  <body style="margin:0;background:#08080b;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#f3f3f3;">
    <div style="max-width:640px;margin:0 auto;padding:40px 20px;">
      <div style="background:#111114;border:1px solid #26262d;border-radius:20px;padding:32px;">
        <div style="color:#ff6a3d;font-size:12px;letter-spacing:.18em;text-transform:uppercase;margin-bottom:16px;">Porterful</div>
        <h1 style="margin:0 0 14px;font-size:32px;line-height:1.1;">Welcome to Porterful, ${artistName}</h1>
        <p style="margin:0 0 14px;color:#c7c7cf;font-size:16px;line-height:1.6;">
          Your account is now set up for artist access. You can manage your profile, music, and future releases from your dashboard.
        </p>
        ${genre || city ? `
        <p style="margin:0 0 14px;color:#c7c7cf;font-size:15px;line-height:1.6;">
          ${genre ? `Genre: <strong style="color:#ffffff;">${genre}</strong>` : ''}
          ${genre && city ? ' · ' : ''}
          ${city ? `City: <strong style="color:#ffffff;">${city}</strong>` : ''}
        </p>
        ` : ''}
        <div style="display:flex;gap:12px;flex-wrap:wrap;margin:24px 0 8px;">
          <a href="${dashboardUrl}" style="display:inline-block;background:#ff6a3d;color:#fff;text-decoration:none;padding:14px 20px;border-radius:999px;font-weight:700;">Open Dashboard</a>
          <a href="${artistPageUrl}" style="display:inline-block;background:transparent;color:#f3f3f3;text-decoration:none;padding:14px 20px;border-radius:999px;font-weight:700;border:1px solid #3a3a44;">View Artist Page</a>
        </div>
        <p style="margin:18px 0 0;color:#9c9ca6;font-size:14px;line-height:1.6;">
          If your artist page is still hidden, a founder may still be finishing the public setup. Your artist access is ready either way.
        </p>
      </div>
    </div>
  </body>
</html>
  `.trim()
}

export function buildArtistWelcomeEmailText(input: ArtistWelcomeEmailInput) {
  const lines = [
    `Welcome to Porterful, ${input.artistName}`,
    '',
    'Your account is now set up for artist access.',
    input.genre ? `Genre: ${input.genre}` : null,
    input.city ? `City: ${input.city}` : null,
    '',
    `Dashboard: ${input.dashboardUrl}`,
    input.artistPageUrl ? `Artist page: ${input.artistPageUrl}` : null,
    '',
    'If your artist page is still hidden, a founder may still be finishing the public setup.',
  ].filter(Boolean)

  return lines.join('\n')
}
