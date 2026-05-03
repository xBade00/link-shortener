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
