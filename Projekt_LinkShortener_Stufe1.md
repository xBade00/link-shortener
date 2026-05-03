# 🔗 Projekt: Link Shortener — Stufe 1
## Docker + Docker Hub + GitHub Actions Quality Gate

---

## 🎯 Ziel dieser Stufe

Am Ende hast du:
- Eine kleine Web-App mit zwei Services (Frontend + Backend) lokal mit Docker am Laufen
- Beide Services als Docker Images auf Docker Hub hochgeladen
- Eine GitHub Actions Pipeline die bei jedem Push automatisch Tests ausführt und bei Erfolg die Images baut & pusht

---

## 📁 Projektstruktur die du aufbauen wirst

```
link-shortener/
├── services/
│   ├── web/          ← Next.js Frontend (Link eingeben)
│   │   ├── Dockerfile
│   │   └── ...
│   └── api/          ← Node.js/Express Backend (Links speichern & weiterleiten)
│       ├── Dockerfile
│       └── ...
├── docker-compose.yml
└── .github/
    └── workflows/
        └── ci.yml    ← Deine Pipeline
```

---

## ✅ Schritt-für-Schritt Anleitung

### Schritt 1 — GitHub Repository erstellen

1. Gehe auf [github.com](https://github.com) und erstelle ein neues **public** Repository mit dem Namen `link-shortener`
2. Klone es lokal auf deinen Computer:
   ```bash
   git clone https://github.com/DEIN-USERNAME/link-shortener.git
   cd link-shortener
   ```

---

### Schritt 2 — API Service aufbauen (Node.js/Express)

1. Ordner anlegen und Node-Projekt initialisieren:
   ```bash
   mkdir -p services/api
   cd services/api
   npm init -y
   npm install express
   npm install --save-dev jest eslint
   ```

2. Erstelle `services/api/src/index.js` mit diesem Inhalt:
   ```js
   const express = require('express');
   const app = express();
   app.use(express.json());

   const links = {}; // Einfacher In-Memory-Speicher

   // Link kürzen
   app.post('/shorten', (req, res) => {
     const { url } = req.body;
     const id = Math.random().toString(36).substring(2, 7);
     links[id] = url;
     res.json({ shortUrl: `http://localhost:3001/${id}` });
   });

   // Weiterleiten
   app.get('/:id', (req, res) => {
     const url = links[req.params.id];
     if (!url) return res.status(404).json({ error: 'Not found' });
     res.redirect(url);
   });

   // Health Check (wichtig für Docker & später AWS)
   app.get('/health', (req, res) => res.json({ status: 'ok' }));

   const PORT = process.env.PORT || 3001;
   app.listen(PORT, () => console.log(`API läuft auf Port ${PORT}`));

   module.exports = app;
   ```

3. Erstelle `services/api/src/index.test.js` mit einem einfachen Test:
   ```js
   const request = require('supertest');
   const app = require('./index');

   test('Health Check gibt 200 zurück', async () => {
     const res = await request(app).get('/health');
     expect(res.statusCode).toBe(200);
   });

   test('Link kürzen funktioniert', async () => {
     const res = await request(app)
       .post('/shorten')
       .send({ url: 'https://google.com' });
     expect(res.statusCode).toBe(200);
     expect(res.body.shortUrl).toBeDefined();
   });
   ```
   > Dafür brauchst du noch `supertest`: `npm install --save-dev supertest`

4. Füge in `services/api/package.json` folgendes hinzu:
   ```json
   "scripts": {
     "start": "node src/index.js",
     "test": "jest",
     "lint": "eslint src/"
   }
   ```

5. Erstelle `services/api/Dockerfile`:
   ```dockerfile
   FROM node:20-alpine
   WORKDIR /app
   COPY package*.json ./
   RUN npm install --production
   COPY src/ ./src/
   EXPOSE 3001
   CMD ["node", "src/index.js"]
   ```

---

### Schritt 3 — Web Service aufbauen (Next.js)

1. Next.js App erstellen:
   ```bash
   cd ../../  # zurück ins Hauptverzeichnis
   cd services
   npx create-next-app@latest web --typescript --eslint --tailwind --app --no-src-dir --import-alias "@/*"
   ```

2. Ersetze den Inhalt von `services/web/app/page.tsx` mit einem einfachen Formular:
   ```tsx
   'use client';
   import { useState } from 'react';

   export default function Home() {
     const [url, setUrl] = useState('');
     const [result, setResult] = useState('');

     const shorten = async () => {
       const res = await fetch('http://localhost:3001/shorten', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ url }),
       });
       const data = await res.json();
       setResult(data.shortUrl);
     };

     return (
       <main className="flex flex-col items-center justify-center min-h-screen gap-4">
         <h1 className="text-3xl font-bold">🔗 Link Shortener</h1>
         <input
           className="border p-2 rounded w-80"
           placeholder="https://deine-lange-url.de"
           value={url}
           onChange={(e) => setUrl(e.target.value)}
         />
         <button
           className="bg-blue-500 text-white px-4 py-2 rounded"
           onClick={shorten}
         >
           Kürzen
         </button>
         {result && <p>Dein Link: <a href={result} className="text-blue-500">{result}</a></p>}
       </main>
     );
   }
   ```

3. Erstelle `services/web/Dockerfile`:
   ```dockerfile
   FROM node:20-alpine AS builder
   WORKDIR /app
   COPY package*.json ./
   RUN npm install
   COPY . .
   RUN npm run build

   FROM node:20-alpine AS runner
   WORKDIR /app
   COPY --from=builder /app/.next/standalone ./
   COPY --from=builder /app/.next/static ./.next/static
   EXPOSE 3000
   CMD ["node", "server.js"]
   ```

---

### Schritt 4 — Docker Compose aufsetzen

Erstelle `docker-compose.yml` im Hauptverzeichnis:
```yaml
services:
  api:
    build: ./services/api
    ports:
      - "3001:3001"

  web:
    build: ./services/web
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://localhost:3001
```

Testen:
```bash
docker compose up --build
```
Öffne dann `http://localhost:3000` — deine App sollte laufen!

---

### Schritt 5 — Images auf Docker Hub pushen (manuell, zum Testen)

```bash
# Einloggen
docker login

# Images bauen und taggen
docker build -t DEIN-DOCKERHUB-USERNAME/link-shortener-api ./services/api
docker build -t DEIN-DOCKERHUB-USERNAME/link-shortener-web ./services/web

# Pushen
docker push DEIN-DOCKERHUB-USERNAME/link-shortener-api:latest
docker push DEIN-DOCKERHUB-USERNAME/link-shortener-web:latest
```

---

### Schritt 6 — GitHub Actions Pipeline (das Herzstück)

1. Erstelle den Ordner und die Datei:
   ```bash
   mkdir -p .github/workflows
   touch .github/workflows/ci.yml
   ```

2. Füge in Docker Hub deine Zugangsdaten als GitHub Secrets ein:
   - Gehe in deinem GitHub Repo zu **Settings → Secrets and variables → Actions**
   - Erstelle zwei Secrets:
     - `DOCKERHUB_USERNAME` → dein Docker Hub Benutzername
     - `DOCKERHUB_TOKEN` → ein Access Token (erstellen unter: hub.docker.com → Account Settings → Personal Access Tokens)

3. Fülle `.github/workflows/ci.yml`:
   ```yaml
   name: CI/CD Pipeline

   on:
     push:
       branches: ["**"]  # Bei jedem Push auf jeden Branch

   jobs:
     quality:
       name: Tests & Lint
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v4

         - name: Node.js einrichten
           uses: actions/setup-node@v4
           with:
             node-version: "20"

         - name: API – Abhängigkeiten installieren & testen
           working-directory: services/api
           run: |
             npm install
             npm run lint
             npm test

     docker:
       name: Docker Build & Push
       runs-on: ubuntu-latest
       needs: quality          # Läuft NUR wenn quality erfolgreich war
       if: github.ref == 'refs/heads/main'   # Und NUR auf dem main Branch
       steps:
         - uses: actions/checkout@v4

         - name: In Docker Hub einloggen
           uses: docker/login-action@v3
           with:
             username: ${{ secrets.DOCKERHUB_USERNAME }}
             password: ${{ secrets.DOCKERHUB_TOKEN }}

         - name: API Image bauen & pushen
           uses: docker/build-push-action@v5
           with:
             context: ./services/api
             push: true
             tags: |
               ${{ secrets.DOCKERHUB_USERNAME }}/link-shortener-api:latest
               ${{ secrets.DOCKERHUB_USERNAME }}/link-shortener-api:${{ github.sha }}

         - name: Web Image bauen & pushen
           uses: docker/build-push-action@v5
           with:
             context: ./services/web
             push: true
             tags: |
               ${{ secrets.DOCKERHUB_USERNAME }}/link-shortener-web:latest
               ${{ secrets.DOCKERHUB_USERNAME }}/link-shortener-web:${{ github.sha }}
   ```

---

### Schritt 7 — Pipeline testen

1. **Feature Branch** (nur Tests sollen laufen, kein Docker Push):
   ```bash
   git checkout -b test-pipeline
   git add .
   git commit -m "feat: initial project setup"
   git push origin test-pipeline
   ```
   → Auf GitHub unter **Actions** prüfen: nur der `quality` Job sollte grün werden, `docker` sollte übersprungen werden.

2. **Main Branch** (Tests + Docker Push):
   ```bash
   git checkout main
   git merge test-pipeline
   git push origin main
   ```
   → Jetzt sollten beide Jobs laufen und am Ende die Images auf Docker Hub erscheinen.

---

## 🏁 Abnahmekriterien — Stufe 1 bestanden wenn:

- [ ] `docker compose up --build` startet beide Services fehlerfrei
- [ ] Die App ist unter `http://localhost:3000` erreichbar
- [ ] Ein Push auf einen Feature-Branch führt Tests aus, baut aber **keine** Images
- [ ] Ein Push auf `main` baut und pusht beide Images auf Docker Hub
- [ ] Auf hub.docker.com sind `link-shortener-api` und `link-shortener-web` mit Tags `latest` und dem Git-Hash sichtbar

---

## 🧠 Verständnisfragen für dich (wie in deiner Quiz-App Übung)

1. Warum pushen wir Images nur auf `main` und nicht auf jedem Branch?
2. Was bedeutet `needs: quality` in der Pipeline — was passiert wenn die Tests fehlschlagen?
3. Warum taggen wir das Image zusätzlich mit dem `github.sha` (Git-Hash)?

---

*Viel Erfolg! Bei Fragen einfach Claude fragen* 🚀
