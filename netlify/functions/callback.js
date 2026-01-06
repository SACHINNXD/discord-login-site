exports.handler = async (event) => {
  const code = event.queryStringParameters.code;

  if (!code) {
    return { statusCode: 400, body: "Missing code" };
  }

  // Exchange code for token
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

  // Get user info
  const userRes = await fetch("https://discord.com/api/users/@me", {
    headers: {
      Authorization: `Bearer ${token.access_token}`
    }
  });

  const user = await userRes.json();

  // Store user + access_token (HttpOnly cookie)
  const payload = {
    id: user.id,
    username: user.username,
    access_token: token.access_token
  };

  return {
    statusCode: 302,
    headers: {
      "Set-Cookie": `session=${Buffer.from(
        JSON.stringify(payload)
      ).toString("base64")}; Path=/; HttpOnly; Secure; SameSite=Lax`,
      Location: "/"
    }
  };
};
