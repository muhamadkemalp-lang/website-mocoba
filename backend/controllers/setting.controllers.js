const { db } = require("../config/firebase");

const SETTINGS_DOC = "store"; // dokumen tunggal: settings/store

exports.get = async (req, res, next) => {
    try {
        const doc = await db.collection("settings").doc(SETTINGS_DOC).get();
        const data = doc.exists ? doc.data() : {};
        res.json({ success: true, data });
    } catch (err) {
        next(err);
    }
};

exports.update = async (req, res, next) => {
    try {
        await db.collection("settings").doc(SETTINGS_DOC).set(
            { ...req.body, updatedAt: new Date() },
            { merge: true }
        );
        const doc = await db.collection("settings").doc(SETTINGS_DOC).get();
        res.json({ success: true, message: "Pengaturan berhasil disimpan.", data: doc.data() });
    } catch (err) {
        next(err);
    }
};
