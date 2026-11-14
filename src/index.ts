import { Elysia, t } from "elysia";

const port = process.env.PORT!;

const users = new Map();

export default new Elysia()
  .get("/", () => "Hello from GET /")
  .ws("/api/ws", {
    body: t.Object({
      message: t.Object({
        type: t.String(),
        data: t.String(),
        to: t.String(),
        from: t.String(),
      }),
    }),
    query: t.Object({
      username: t.String(),
    }),

    open(ws) {
      const { username } = ws.data.query;

      users.set(username, ws);
      console.log(Array.from(users.keys()));

      console.log(`${username} -> connected!`);
    },
    close(ws) {
      const { username } = ws.data.query;

      users.delete(username);
      console.log(Array.from(users.keys()));

      console.log(`${username} -> disconnected!`);
    },
    message(ws, { message }) {
      const { type, data, to, from } = message;

      const user = users.get(to);
      if (!user) {
        ws.send({ type: "error", data: `${to} is not connected!` });
        return;
      }

      if (type === "message") {
        user.send({ type, data, from });
      }
    },
    error(ws) {
      console.log(ws.error);
    },
  })
  .listen(port, () => {
    console.log(`Server started at PORT:${port}`);
  });
