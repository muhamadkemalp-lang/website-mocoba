const { db } = require("../config/firebase");

// Potong stok bahan baku otomatis berdasarkan resep tiap item yang dipesan.
// item.ingredientID di sub-collection "recipe/{id}/ingredients" merujuk ke
// field custom "ingredientID" (kode bisnis, misal "B001") di collection "ingredients",
// BUKAN ke ID dokumen Firestore.
async function processOrder(order) {

    for (const item of order.items) {

        const recipeSnapshot = await db
            .collection("recipe")
            .where("productID", "==", item.productID)
            .get();

        if (recipeSnapshot.empty) {
            throw new Error(`Resep untuk produk "${item.nama || item.productID}" belum dibuat`);
        }

        const recipeDoc = recipeSnapshot.docs[0];

        const ingredientsSnapshot = await recipeDoc.ref
            .collection("ingredients")
            .get();

        for (const ingredientLine of ingredientsSnapshot.docs) {

            const data = ingredientLine.data();

            const ingredientQuery = await db
                .collection("ingredients")
                .where("ingredientID", "==", data.ingredientID)
                .limit(1)
                .get();

            if (ingredientQuery.empty) {
                throw new Error(`Bahan baku dengan kode "${data.ingredientID}" tidak ditemukan`);
            }

            const ingredientDoc = ingredientQuery.docs[0];
            const ingredientData = ingredientDoc.data();

            const totalNeed = data.qty * item.qty;
            const newStock = Number(ingredientData.stok || 0) - totalNeed;

            if (newStock < 0) {
                throw new Error(`Stok "${ingredientData.nama}" tidak cukup`);
            }

            await ingredientDoc.ref.update({
                stok: newStock,
                updatedAt: new Date(),
            });

        }

    }

}

module.exports = {
    processOrder
};
