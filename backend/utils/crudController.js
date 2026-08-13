// Generator controller generik dari service CRUD (lihat utils/firestoreCrud.js).
// Dipakai untuk entitas sederhana yang cuma butuh operasi get/create/update/delete standar.
function createCrudController(service) {
    return {
        getAll: async (req, res, next) => {
            try {
                const data = await service.getAll();
                res.json({ success: true, data });
            } catch (err) {
                next(err);
            }
        },

        getById: async (req, res, next) => {
            try {
                const data = await service.getById(req.params.id);
                if (!data) {
                    return res.status(404).json({ success: false, message: "Data tidak ditemukan." });
                }
                res.json({ success: true, data });
            } catch (err) {
                next(err);
            }
        },

        create: async (req, res, next) => {
            try {
                const data = await service.create(req.body);
                res.status(201).json({ success: true, message: "Berhasil dibuat.", data });
            } catch (err) {
                next(err);
            }
        },

        update: async (req, res, next) => {
            try {
                const data = await service.update(req.params.id, req.body);
                if (!data) {
                    return res.status(404).json({ success: false, message: "Data tidak ditemukan." });
                }
                res.json({ success: true, message: "Berhasil diperbarui.", data });
            } catch (err) {
                next(err);
            }
        },

        remove: async (req, res, next) => {
            try {
                const ok = await service.remove(req.params.id);
                if (!ok) {
                    return res.status(404).json({ success: false, message: "Data tidak ditemukan." });
                }
                res.json({ success: true, message: "Berhasil dihapus." });
            } catch (err) {
                next(err);
            }
        },
    };
}

module.exports = createCrudController;
