import express from 'express';
import cors from 'cors';
import compileRouter from './routes/compileRoute.js';
import analysisRouter from './routes/analysisRoute.js';
import samplesRouter from './routes/samplesRoute.js';
import { NativeCompilerRunner } from './services/nativeCompiler.js';

const app = express();
const PORT = process.env.PORT || 5000;
const nativeRunner = new NativeCompilerRunner();

app.use(cors());
app.use(express.json({ limit: '5mb' }));

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'FlowCode Compiler Backend',
    nativeCompilerAvailable: nativeRunner.isNativeAvailable(),
    version: '1.0.0'
  });
});

// API Routes
app.use('/api', compileRouter);
app.use('/api', analysisRouter);
app.use('/api', samplesRouter);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Endpoint not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('[FlowCode Server Error]', err);
  res.status(500).json({ success: false, error: err.message || 'Internal Server Error' });
});

app.listen(PORT, () => {
  console.log(`[FlowCode Backend] Running at http://localhost:${PORT}`);
  console.log(`[FlowCode Backend] Native compiler status: ${nativeRunner.isNativeAvailable() ? 'Ready' : 'Fallback Engine Active'}`);
});
