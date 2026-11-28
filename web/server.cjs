// Passenger (cPanel's Software -> Setup Node.js App) loads this file directly, so it
// must be CommonJS and must not pin a port: Passenger replaces the socket that
// `listen()` binds to. The FTP workflow uploads it as `server.cjs` next to `.next`.
const http = require('node:http');
const next = require('next');

const app = next({ dev: false, dir: __dirname });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  http
    .createServer((req, res) => handle(req, res))
    .listen(process.env.PORT || 3000, () => {
      console.log(`listening on ${process.env.PORT || 3000}`);
    });
});
