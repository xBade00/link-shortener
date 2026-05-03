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
   // Health Check (wichtig für Docker & später AWS)
   app.get('/health', (req, res) => res.json({ status: 'ok' }));

   // Weiterleiten
   app.get('/:id', (req, res) => {
     const url = links[req.params.id];
     if (!url) return res.status(404).json({ error: 'Not found' });
     res.redirect(url);
   });

   const PORT = process.env.PORT || 3001;
   app.listen(PORT, () => console.log(`API läuft auf Port ${PORT}`));

   module.exports = app;
   