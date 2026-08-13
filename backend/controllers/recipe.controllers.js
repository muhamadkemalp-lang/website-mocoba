const recipeService = require("../services/recipe.service");

exports.getByProduct = async (req, res, next) => {
    try {
        const data = await recipeService.getByProduct(req.params.productID);
        if (!data) {
            return res.status(404).json({ success: false, message: "Resep belum dibuat untuk produk ini." });
        }
        res.json({ success: true, data });
    } catch (err) {
        next(err);
    }
};

exports.create = async (req, res, next) => {
    try {
        const { productID, items } = req.body;
        if (!productID || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ success: false, message: "productID dan items (array) wajib diisi." });
        }
        const data = await recipeService.createRecipe(productID, items);
        res.status(201).json({ success: true, message: "Resep berhasil dibuat.", data });
    } catch (err) {
        next(err);
    }
};

exports.update = async (req, res, next) => {
    try {
        const { items } = req.body;
        if (!Array.isArray(items)) {
            return res.status(400).json({ success: false, message: "items (array) wajib diisi." });
        }
        const data = await recipeService.updateRecipe(req.params.productID, items);
        res.json({ success: true, message: "Resep berhasil diperbarui.", data });
    } catch (err) {
        next(err);
    }
};

exports.remove = async (req, res, next) => {
    try {
        const ok = await recipeService.deleteRecipe(req.params.productID);
        if (!ok) {
            return res.status(404).json({ success: false, message: "Resep tidak ditemukan." });
        }
        res.json({ success: true, message: "Resep berhasil dihapus." });
    } catch (err) {
        next(err);
    }
};
