const tableService = require("../services/table.service");

exports.getAll = async (req, res, next) => {
  try {
    const data = await tableService.getAll();
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const data = await tableService.getById(req.params.id);
    if (!data) {
      return res.status(404).json({ success: false, message: "Meja tidak ditemukan." });
    }
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const data = await tableService.create(req.body);
    res.status(201).json({ success: true, message: "Meja berhasil ditambahkan.", data });
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const data = await tableService.update(req.params.id, req.body);
    res.json({ success: true, message: "Meja berhasil diupdate.", data });
  } catch (err) {
    next(err);
  }
};

exports.setStatus = async (req, res, next) => {
  try {
    const { status, sessionId } = req.body;
    const data = await tableService.setStatus(req.params.id, status, sessionId);
    res.json({ success: true, message: "Status meja diubah.", data });
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const data = await tableService.remove(req.params.id);
    res.json({ success: true, message: "Meja dinonaktifkan.", data });
  } catch (err) {
    next(err);
  }
};