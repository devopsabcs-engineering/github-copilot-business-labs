import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { createServer } from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "out");
const port = Number.parseInt(process.env.PORT ?? "3000", 10);
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "/github-copilot-business-labs";
const contentTypes = new Map([
  [".css", "text/css; charset=utf-8"],
  [".html", "text/html; charset=utf-8"],
  [".ico", "image/x-icon"],
  [".js", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".map", "application/json; charset=utf-8"],
  [".png", "image/png"],
  [".svg", "image/svg+xml"],
  [".txt", "text/plain; charset=utf-8"],
  [".woff", "font/woff"],
  [".woff2", "font/woff2"],
  [".pdf", "application/pdf"],
  [".pptx", "application/vnd.openxmlformats-officedocument.presentationml.presentation"],
]);

async function resolveFile(requestPath) {
  const relativePath = decodeURIComponent(requestPath).replace(/^\/+/, "");
  const candidate = path.resolve(root, relativePath || "index.html");
  if (candidate !== root && !candidate.startsWith(`${root}${path.sep}`)) return null;

  for (const filePath of [
    candidate,
    ...(!basePath ? [`${candidate}.html`] : []),
    path.join(candidate, "index.html"),
  ]) {
    if (!filePath) continue;
    try {
      if ((await stat(filePath)).isFile()) return filePath;
    } catch {
      // Try the next static-export convention.
    }
  }
  return null;
}

const server = createServer(async (request, response) => {
  const url = new URL(request.url ?? "/", `http://${request.headers.host ?? "localhost"}`);
  if (basePath && url.pathname === basePath) {
    response.writeHead(301, { Location: `${basePath}/${url.search}` });
    response.end();
    return;
  }
  if (basePath && !url.pathname.startsWith(`${basePath}/`)) {
    response.writeHead(404);
    response.end("Not found");
    return;
  }
  const requestPath = url.pathname.slice(basePath.length) || "/";
  let filePath;
  try { filePath = await resolveFile(requestPath); } catch {
    response.writeHead(400);
    response.end("Invalid path");
    return;
  }
  if (!filePath) {
    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Not found");
    return;
  }
  if (basePath && path.basename(filePath) === "index.html" && !url.pathname.endsWith("/")) {
    response.writeHead(301, { Location: `${url.pathname}/${url.search}` });
    response.end();
    return;
  }

  response.writeHead(200, {
    "Cache-Control": "no-store",
    "Content-Type": contentTypes.get(path.extname(filePath).toLowerCase()) ?? "application/octet-stream",
  });
  if (request.method === "HEAD") response.end();
  else createReadStream(filePath).pipe(response);
});

server.listen(port, "127.0.0.1", () => {
  console.log(`Serving static export from ${root} at http://127.0.0.1:${port}${basePath}/`);
});