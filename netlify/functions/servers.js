exports.handler = async (event) => {
  const cookie = event.headers.cookie || "";
  const match = cookie.match(/session=([^;]+)/);

  if (!match) {
    return { statusCode: 401 };
  }

  const session = JSON.parse(
    Buffer.from(match[1], "base64").toString()
  );

  // 1) User guilds (via OAuth token)
  const userGuildsRes = await fetch(
    "https://discord.com/api/users/@me/guilds",
    {
      headers: {
        Authorization: `Bearer ${session.access_token}`
      }
    }
  );

  const userGuilds = await userGuildsRes.json();

  // 2) Bot guilds (via bot token)
  const botGuildsRes = await fetch(
    "https://discord.com/api/users/@me/guilds",
    {
      headers: {
        Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`
      }
    }
  );

  const botGuilds = await botGuildsRes.json();
  const botGuildIds = new Set(botGuilds.map(g => g.id));

  // 3) مشترک servers
  const shared = userGuilds.filter(g => botGuildIds.has(g.id));

  return {
    statusCode: 200,
    body: JSON.stringify(
      shared.map(g => ({
        id: g.id,
        name: g.name,
        icon: g.icon
          ? `https://cdn.discordapp.com/icons/${g.id}/${g.icon}.png`
          : null
      }))
    )
  };
};
