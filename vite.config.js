import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import os from "os";

const c = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  cyan: "\x1b[36m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  magenta: "\x1b[35m",
  red: "\x1b[31m",
  bgBlue: "\x1b[44m\x1b[97m",
  bgGreen: "\x1b[42m\x1b[30m",
  bgYellow: "\x1b[43m\x1b[30m",
  bgRed: "\x1b[41m\x1b[97m",
  bgCyan: "\x1b[46m\x1b[30m",
};

const formatMem = (bytes) => `${(bytes / 1024 / 1024).toFixed(1)} MB`;

function superFastLogger() {
  const startTime = Date.now();
  return {
    name: "vite-super-fast-logger",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const start = Date.now();
        res.on("finish", () => {
          const duration = Date.now() - start;
          const url = req.url || "/";

          if (
            !url.startsWith("/@") &&
            !url.includes("node_modules") &&
            !url.endsWith(".map") &&
            !url.includes(".vite/deps")
          ) {
            let statusBadge = `${c.bgGreen}${c.bold} ${res.statusCode} ${c.reset}`;
            if (res.statusCode >= 500) statusBadge = `${c.bgRed}${c.bold} ${res.statusCode} ${c.reset}`;
            else if (res.statusCode >= 400) statusBadge = `${c.bgYellow}${c.bold} ${res.statusCode} ${c.reset}`;
            else if (res.statusCode >= 300) statusBadge = `${c.bgCyan}${c.bold} ${res.statusCode} ${c.reset}`;

            const timeStr = `${c.dim}[${new Date().toLocaleTimeString()}]${c.reset}`;
            const methodStr = `${c.bold}${c.magenta}${req.method.padEnd(6)}${c.reset}`;
            const durationStr = duration > 100 ? `${c.yellow}${duration}ms${c.reset}` : `${c.dim}${duration}ms${c.reset}`;

            console.log(`${timeStr} ${methodStr} ${statusBadge} ${url} ${c.dim}—${c.reset} ${durationStr}`);
          }
        });
        next();
      });

      server.httpServer?.once("listening", () => {
        setTimeout(() => {
          const address = server.httpServer?.address();
          const port = typeof address === "object" && address ? address.port : 5173;
          const bootTime = Date.now() - startTime;
          const mem = process.memoryUsage();
          const cpuCores = os.cpus().length;
          const cpuModel = os.cpus()[0]?.model ? os.cpus()[0].model.trim() : "CPU";

          console.log("\n" + `${c.cyan}╔${"═".repeat(64)}╗${c.reset}`);
          console.log(`${c.cyan}║${c.reset} ${c.bgBlue}${c.bold}  ⚡ MAVI PORTALE — ULTRA FAST DEV SERVER READY  ${c.reset}${" ".repeat(15)}${c.cyan}║${c.reset}`);
          console.log(`${c.cyan}╠${"═".repeat(64)}╣${c.reset}`);
          console.log(`${c.cyan}║${c.reset}  ${c.bold}🚀 Local URL:${c.reset}      ${c.bold}${c.green}http://localhost:${port}/${c.reset}${" ".repeat(23 - port.toString().length)}${c.cyan}║${c.reset}`);
          console.log(`${c.cyan}║${c.reset}  ${c.bold}⏱️  Tempo Avvio:${c.reset}    ${c.yellow}${bootTime} ms${c.reset}${" ".repeat(36 - bootTime.toString().length)}${c.cyan}║${c.reset}`);
          console.log(`${c.cyan}║${c.reset}  ${c.bold}🧠 Memoria RAM:${c.reset}    ${c.magenta}${formatMem(mem.heapUsed)}${c.reset} / ${c.dim}${formatMem(mem.rss)} (RSS)${c.reset}${" ".repeat(17)}${c.cyan}║${c.reset}`);
          console.log(`${c.cyan}║${c.reset}  ${c.bold}💻 CPU & OS:${c.reset}       ${c.dim}${cpuCores} Core (${os.platform()})${c.reset}${" ".repeat(35 - cpuCores.toString().length - os.platform().length)}${c.cyan}║${c.reset}`);
          console.log(`${c.cyan}║${c.reset}  ${c.bold}📦 Node.js:${c.reset}        ${process.version}${" ".repeat(34 - process.version.length)}${c.cyan}║${c.reset}`);
          console.log(`${c.cyan}╠${"═".repeat(64)}╣${c.reset}`);
          console.log(`${c.cyan}║${c.reset}  ${c.green}⚡ Pre-bundling & Log HTTP in tempo reale attivi${c.reset}${" ".repeat(16)}${c.cyan}║${c.reset}`);
          console.log(`${c.cyan}╚${"═".repeat(64)}╝${c.reset}\n`);
        }, 50);
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), superFastLogger()],
  base: "./",
  clearScreen: false,
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "react-router-dom",
      "exceljs",
      "file-saver",
    ],
  },
  server: {
    port: 5173,
    open: true,
    warmup: {
      clientFiles: [
        "./src/main.jsx",
        "./src/App.jsx",
      ],
    },
    fs: {
      strict: true,
    },
  },
});