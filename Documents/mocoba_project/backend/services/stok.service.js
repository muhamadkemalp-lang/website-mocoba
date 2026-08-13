const { db } = require("../config/firebase");

// Riwayat perubahan stok (diisi otomatis oleh ingredient.service.adjustStock)
async function getLogs(ingredientId) {
    let query = db.collection("stock_logs").orderBy("createdAt", "desc").limit(100);

    if (ingredientId) {
        query = db
            .collection("stock_logs")
            .where("ingredientId", "==", ingredientId)
            .orderBy("createdAt", "desc")
            .limit(100);
    }

    const snapshot = await query.get();
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

module.exports = { getLogs };
