exports.handler = async (event) => {
  const cookie = event.headers.cookie || "";
  const match = cookie.match(/user=([^;]+)/);

  if (!match) {
    return { statusCode: 401 };
  }

  const user = JSON.parse(
    Buffer.from(match[1], "base64").toString()
  );

  return {
    statusCode: 200,
    body: JSON.stringify({
      id: user.id,
      username: user.username
    })
  };
};
