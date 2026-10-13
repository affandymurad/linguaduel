require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const express = require('express');
const cors    = require('cors');

const questionRoute = require('./routes/question');
const evaluateRoute = require('./routes/evaluate');
const reportRoute   = require('./routes/report');

const app  = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  methods: ['POST'],
}));
app.use(express.json({ limit: '10kb' }));

// Routes
app.use('/api/question', questionRoute);
app.use('/api/evaluate', evaluateRoute);
app.use('/api/report',   reportRoute);

// Avvia il server solo se eseguito direttamente (non richiesto da test)
if (require.main === module) {
  app.listen(PORT, () => {
    const mode = process.env.MOCK_MODE === 'true' ? 'MOCK' : 'LLM';
    console.log(`[server] berjalan di http://localhost:${PORT}  mode=${mode}`);
  });
}

module.exports = app;
