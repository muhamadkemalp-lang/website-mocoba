const transactionService = require("../services/transaction.service");

exports.checkout = async (req, res, next) => {
    try {
        const data = await transactionService.checkout(req.body);
        res.status(201).json({ success: true, message: "Transaksi berhasil.", data });
    } catch (err) {
        next(err);
    }
};

exports.getAll = async (req, res, next) => {
    try {
        const data = await transactionService.getAll();
        res.json({ success: true, data });
    } catch (err) {
        next(err);
    }
};

exports.getById = async (req, res, next) => {
    try {
        const data = await transactionService.getById(req.params.id);
        if (!data) {
            return res.status(404).json({ success: false, message: "Transaksi tidak ditemukan." });
        }
        res.json({ success: true, data });
    } catch (err) {
        next(err);
    }
};
