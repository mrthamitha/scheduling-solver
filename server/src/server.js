// server.js - API entrance
import express from 'express';
const app = express();

//first route
app.get('/api/health', (req, res) =>{
    res.json({status: 'ok', time: new Date().toISOString() });
});

//Give hosting services from PORT
const port = process.env.PORT ?? 4000;

app.listen(port, () => {
  console.log(`✅ API listening on http://localhost:${port}`);
});