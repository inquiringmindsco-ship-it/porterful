// Porterful Pilot Bot — Gateway mode (WebSocket)
// Handles /verify slash command automatically
// Requires DISCORD_BOT_TOKEN env var
// Run: node scripts/bot-gateway.js

const { WebSocket } = require('ws');

const TOKEN = process.env.DISCORD_BOT_TOKEN;
const APP_ID = process.env.DISCORD_APP_ID;
const GUILD_ID = process.env.DISCORD_GUILD_ID;
const PILOT_ROLE_ID = process.env.DISCORD_PILOT_ROLE_ID;

const API = 'https://discord.com/api/v10';

if (!TOKEN) {
  console.error('DISCORD_BOT_TOKEN environment variable is required');
  process.exit(1);
}

async function discord(method, endpoint, body) {
  const res = await fetch(`${API}${endpoint}`, {
    method,
    headers: { Authorization: `Bot ${TOKEN}`, 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  return res.json();
}

async function handleInteraction(interaction) {
  const { type, data, user } = interaction;
  if (type !== 2) return;
  if (data.name !== 'verify') return;

  const userId = user.id;
  console.log(`[VERIFY] ${user.username} (${userId}) triggered /verify`);

  try {
    if (GUILD_ID && PILOT_ROLE_ID) {
      await discord('PUT', `/guilds/${GUILD_ID}/members/${userId}/roles/${PILOT_ROLE_ID}`, null);
    }

    await fetch(`${API}/interactions/${interaction.id}/${interaction.token}/callback`, {
      method: 'POST',
      headers: { Authorization: `Bot ${TOKEN}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 4,
        data: {
          content: '✅ You\'re in! You now have the **Pilot** role. Check out 🧪 PILOT PROGRAM for your channels. Welcome aboard!',
          flags: 64,
        },
      }),
    });
    console.log(`[OK] Role assigned to ${user.username}`);
  } catch (e) {
    console.log(`[ERROR]`, e.message);
  }
}

async function main() {
  const { url } = await discord('GET', '/gateway/bot');
  console.log('Connecting to gateway...');

  let ws;
  let heartbeatInterval;
  let seq = 0;
  let reconnectAttempts = 0;
  const MAX_RECONNECT = 10;

  async function send(op, d) {
    if (ws?.readyState !== WebSocket.OPEN) return;
    ws.send(JSON.stringify({ op, d }));
  }

  async function connect() {
    return new Promise((resolve) => {
      ws = new WebSocket(url + '?v=10&encoding=json');

      ws.on('open', async () => {
        console.log('WebSocket opened');
        reconnectAttempts = 0;
        resolve(null);
      });

      ws.on('message', (data) => {
        try {
          const payload = JSON.parse(data);
          const { op, d, s, t } = payload;

          if (op === 0) {
            seq = s;
            if (t === 'INTERACTION_CREATE') handleInteraction(d);
          } else if (op === 1) {
            send(1, d);
          } else if (op === 7) {
            ws.close();
          } else if (op === 9) {
            send(2, { token: TOKEN, intents: 1, properties: { os: 'macos', browser: 'porterful-bot', device: 'porterful-bot' } });
          } else if (op === 10) {
            console.log('Gateway connected. Bot is live!');
            heartbeatInterval = setInterval(() => send(1, seq), d.heartbeat_interval);
            send(2, { token: TOKEN, intents: 1, properties: { os: 'macos', browser: 'porterful-bot', device: 'porterful-bot' } });
          }
        } catch { }
      });

      ws.on('close', async (code) => {
        console.log(`Gateway closed (${code}). Reconnecting in 3s...`);
        clearInterval(heartbeatInterval);
        if (reconnectAttempts < MAX_RECONNECT) {
          reconnectAttempts++;
          await new Promise(r => setTimeout(r, 3000));
          connect();
        } else {
          console.log('Max reconnects reached. Restart bot.');
        }
      });

      ws.on('error', (e) => console.error('WS error:', e.message));
    });
  }

  await connect();
  console.log('Bot running. Waiting for /verify calls...\nPress Ctrl+C to stop.');
}

main().catch(console.error);
