const { db } = require("../config/firebase");

// Resep per produk: recipe/{recipeId} punya field productID,
// dan sub-collection "ingredients" berisi { ingredientID, qty }

async function getByProduct(productID) {
    const recipeSnap = await db
        .collection("recipe")
        .where("productID", "==", productID)
        .get();

    if (recipeSnap.empty) return null;

    const recipeDoc = recipeSnap.docs[0];
    const ingredientsSnap = await recipeDoc.ref.collection("ingredients").get();

    return {
        id: recipeDoc.id,
        ...recipeDoc.data(),
        ingredients: ingredientsSnap.docs.map((d) => ({ id: d.id, ...d.data() })),
    };
}

// items: [{ ingredientID, qty }]
async function createRecipe(productID, items) {
    const ref = await db.collection("recipe").add({
        productID,
        createdAt: new Date(),
        updatedAt: new Date(),
    });

    const batch = db.batch();
    items.forEach((item) => {
        const itemRef = ref.collection("ingredients").doc();
        batch.set(itemRef, { ingredientID: item.ingredientID, qty: item.qty });
    });
    await batch.commit();

    return getByProduct(productID);
}

// Ganti seluruh daftar bahan pada resep (hapus lalu tulis ulang)
async function updateRecipe(productID, items) {
    const recipeSnap = await db.collection("recipe").where("productID", "==", productID).get();
    if (recipeSnap.empty) {
        return createRecipe(productID, items);
    }

    const recipeDoc = recipeSnap.docs[0];
    const existing = await recipeDoc.ref.collection("ingredients").get();

    const batch = db.batch();
    existing.docs.forEach((d) => batch.delete(d.ref));
    items.forEach((item) => {
        const itemRef = recipeDoc.ref.collection("ingredients").doc();
        batch.set(itemRef, { ingredientID: item.ingredientID, qty: item.qty });
    });
    batch.update(recipeDoc.ref, { updatedAt: new Date() });
    await batch.commit();

    return getByProduct(productID);
}

async function deleteRecipe(productID) {
    const recipeSnap = await db.collection("recipe").where("productID", "==", productID).get();
    if (recipeSnap.empty) return false;

    const recipeDoc = recipeSnap.docs[0];
    const existing = await recipeDoc.ref.collection("ingredients").get();

    const batch = db.batch();
    existing.docs.forEach((d) => batch.delete(d.ref));
    batch.delete(recipeDoc.ref);
    await batch.commit();

    return true;
}

module.exports = { getByProduct, createRecipe, updateRecipe, deleteRecipe };
