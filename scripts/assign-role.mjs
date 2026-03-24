// Assign Pilot role to a user
// Usage: node assign-role.mjs <discord_user_id>
// Requires DISCORD_BOT_TOKEN, DISCORD_GUILD_ID, DISCORD_PILOT_ROLE_ID env vars

const TOKEN = process.env.DISCORD_BOT_TOKEN;
const GUILD_ID = process.env.DISCORD_GUILD_ID;
const PILOT_ROLE_ID = process.env.DISCORD_PILOT_ROLE_ID;

const userId = process.argv[2];
if (!userId) { console.log('Usage: node assign-role.mjs <user_id>'); process.exit(1); }
if (!TOKEN || !GUILD_ID || !PILOT_ROLE_ID) { console.log('Missing env vars: DISCORD_BOT_TOKEN, DISCORD_GUILD_ID, DISCORD_PILOT_ROLE_ID'); process.exit(1); }

fetch(`https://discord.com/api/guilds/${GUILD_ID}/members/${userId}/roles/${PILOT_ROLE_ID}`, {
  method: 'PUT',
  headers: { Authorization: `Bot ${TOKEN}` },
}).then(r => {
  if (r.ok) console.log(`✅ Pilot role assigned to ${userId}`);
  else r.json().then(d => console.log('❌ Failed:', JSON.stringify(d)));
});
