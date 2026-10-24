import { Router } from 'express';
import { samplePrograms } from '../../samples/samplePrograms.js';

const router = Router();

// GET /api/samples - List preset sample programs
router.get('/samples', (req, res) => {
  res.json({
    success: true,
    samples: samplePrograms
  });
});

export default router;
