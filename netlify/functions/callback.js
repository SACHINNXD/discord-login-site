const fetch = require("node-fetch");

exports.handler = async (event) => {
  const code = event.queryStringParameters.code;

  const tokenRes = await fetch("https://discord.com/api/oauth2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.DISCORD_CLIENT_ID,
      client_secret: process.env.DISCORD_CLIENT_SECRET,
      grant_type: "authorization_code",
      code,
      redirect_uri: `${process.env.SITE_URL}/.netlify/functions/callback`
    })
  });

  const token = await tokenRes.json();

  const userRes = await fetch(
    "https://discord.com/api/users/@me",
    { headers: { Authorization: `Bearer ${token.access_token}` } }
  );

  const user = await userRes.json();

  return {
    statusCode: 302,
    headers: {
      "Set-Cookie":
        `user=${Buffer.from(JSON.stringify(user)).toString("base64")}; ` +
        `Path=/; HttpOnly; Secure; SameSite=Lax`,
      Location: "/"
    }
  };
};
