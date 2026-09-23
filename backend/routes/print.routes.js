// backend/routes/print.routes.js
const express = require('express');
const router = express.Router();
const printerService = require('../services/printer.service');

// Print receipt
router.post('/print-receipt', async (req, res) => {
  const result = await printerService.printReceipt(req.body);
  res.json(result);
});

// Check printer status (untuk tablet polling)
router.get('/status', (req, res) => {
  res.json(printerService.getStatus());
});

module.exports = router;