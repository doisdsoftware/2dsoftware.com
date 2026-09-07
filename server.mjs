/**
 * Servidor estático para Railway: ads.txt, páginas legais e fallback SPA.
 */
import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dist = path.join(__dirname, "dist");
const port = Number(process.env.PORT) || 3000;

const TXT_ADS = ["/ads.txt", "/app-ads.txt"];

/** Páginas legais estáticas (antes do fallback SPA). */
const LEGAL_PAGES = {
  "/privacidade": "privacidade/index.html",
  "/privacidade/": "privacidade/index.html",
  "/privacidade.html": "privacidade/index.html",
  "/termos": "termos/index.html",
  "/termos/": "termos/index.html",
  "/termos.html": "termos/index.html",
  "/exclusao-dados": "exclusao-dados/index.html",
  "/exclusao-dados/": "exclusao-dados/index.html",
  "/exclusao-dados.html": "exclusao-dados/index.html",
};

const app = express();

function servirTxt(rota) {
  app.get(rota, (_req, res, next) => {
    const arquivo = path.join(dist, rota.slice(1));
    if (!fs.existsSync(arquivo)) return next();
    res
      .type("text/plain")
      .set("Cache-Control", "public, max-age=3600")
      .sendFile(arquivo, (err) => {
        if (err) next(err);
      });
  });
}

TXT_ADS.forEach(servirTxt);

Object.entries(LEGAL_PAGES).forEach(([rota, relativo]) => {
  app.get(rota, (_req, res, next) => {
    const arquivo = path.join(dist, relativo);
    if (!fs.existsSync(arquivo)) return next();
    res
      .type("html")
      .set("Cache-Control", "public, max-age=300")
      .sendFile(arquivo, (err) => {
        if (err) next(err);
      });
  });
});

app.use(express.static(dist, { index: false }));

app.use((req, res, next) => {
  if (req.method !== "GET" && req.method !== "HEAD") {
    next();
    return;
  }
  res.sendFile(path.join(dist, "index.html"), (err) => {
    if (err) next(err);
  });
});

app.listen(port, "0.0.0.0", () => {
  console.log(`[2dsoftware] http://0.0.0.0:${port} (dist: ${dist})`);
});
