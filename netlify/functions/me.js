exports.handler = async (event) => {
  const cookie = event.headers.cookie || "";
  const match = cookie.match(/session=([^;]+)/);

  if (!match) {
    return { statusCode: 401 };
  }

  const session = JSON.parse(
    Buffer.from(match[1], "base64").toString()
  );

  return {
    statusCode: 200,
    body: JSON.stringify({
      id: session.id,
      username: session.username
    })
  };
};
