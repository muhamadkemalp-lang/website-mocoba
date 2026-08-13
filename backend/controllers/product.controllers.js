const productService = require("../services/product.service");

// Gabungkan req.body dengan nama file upload (kalau ada) sebelum diteruskan ke service.
// req.file datang dari middleware multer (lihat routes/product.routes.js).
function buildPayload(req) {
    const payload = { ...req.body };

    // Field angka & boolean datang sebagai string dari multipart/form-data, perlu dikonversi
    if (payload.harga !== undefined) payload.harga = Number(payload.harga);
    if (payload.stok !== undefined) payload.stok = Number(payload.stok);
    if (payload.status !== undefined) payload.status = payload.status === "true" || payload.status === true;

    if (req.file) {
        payload.image = req.file.filename;
    }

    return payload;
}

exports.getAll = async (req, res, next) => {
    try {
        const data = await productService.getAll();
        res.json({ success: true, data });
    } catch (err) {
        next(err);
    }
};

exports.getAvailable = async (req, res, next) => {
    try {
        const data = await productService.getAvailable();
        res.json({ success: true, data });
    } catch (err) {
        next(err);
    }
};

exports.getById = async (req, res, next) => {
    try {
        const data = await productService.getById(req.params.id);
        if (!data) {
            return res.status(404).json({ success: false, message: "Produk tidak ditemukan." });
        }
        res.json({ success: true, data });
    } catch (err) {
        next(err);
    }
};

exports.create = async (req, res, next) => {
    try {
        const data = await productService.create(buildPayload(req));
        res.status(201).json({ success: true, message: "Produk berhasil dibuat.", data });
    } catch (err) {
        next(err);
    }
};

exports.update = async (req, res, next) => {
    try {
        const data = await productService.update(req.params.id, buildPayload(req));
        if (!data) {
            return res.status(404).json({ success: false, message: "Produk tidak ditemukan." });
        }
        res.json({ success: true, message: "Produk berhasil diperbarui.", data });
    } catch (err) {
        next(err);
    }
};

exports.remove = async (req, res, next) => {
    try {
        const ok = await productService.remove(req.params.id);
        if (!ok) {
            return res.status(404).json({ success: false, message: "Produk tidak ditemukan." });
        }
        res.json({ success: true, message: "Produk berhasil dihapus." });
    } catch (err) {
        next(err);
    }
};