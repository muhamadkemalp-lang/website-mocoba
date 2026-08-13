const createCrudController = require("../utils/crudController");
const ingredientService = require("../services/ingredient.service");
const stokService = require("../services/stok.service");

const base = createCrudController(ingredientService);

const getLowStock = async (req, res, next) => {
    try {
        const data = await ingredientService.getLowStock(Number(req.query.threshold) || 20);
        res.json({ success: true, data });
    } catch (err) {
        next(err);
    }
};

const adjustStock = async (req, res, next) => {
    try {
        const { qty, type, note } = req.body;
        if (!qty || !["in", "out"].includes(type)) {
            return res.status(400).json({
                success: false,
                message: "qty dan type ('in' atau 'out') wajib diisi.",
            });
        }
        const data = await ingredientService.adjustStock(req.params.id, qty, type, note);
        if (!data) {
            return res.status(404).json({ success: false, message: "Bahan baku tidak ditemukan." });
        }
        res.json({ success: true, message: "Stok berhasil diperbarui.", data });
    } catch (err) {
        next(err);
    }
};

const getStockLogs = async (req, res, next) => {
    try {
        const data = await stokService.getLogs(req.query.ingredientId);
        res.json({ success: true, data });
    } catch (err) {
        next(err);
    }
};

module.exports = { ...base, getLowStock, adjustStock, getStockLogs };
