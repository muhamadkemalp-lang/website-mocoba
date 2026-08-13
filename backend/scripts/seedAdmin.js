/**
 * Seed script untuk membuat akun admin pertama.
 *
 * Cara pakai (dari folder backend/):
 *   node scripts/seedAdmin.js
 *
 * Atau langsung isi data lewat argumen:
 *   node scripts/seedAdmin.js "Nama Admin" admin@mocoba.com passwordRahasia123
 *
 * Script ini aman dijalankan berkali-kali: kalau email sudah terdaftar,
 * script akan berhenti dan tidak membuat akun duplikat.
 */

require("dotenv").config();
const readline = require("readline");
const bcrypt = require("bcryptjs");
const { db } = require("../config/firebase");

function ask(question) {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            rl.close();
            resolve(answer.trim());
        });
    });
}

async function main() {
    console.log("=== Seed Akun Admin MOCOBA ===\n");

    let [, , nama, email, password] = process.argv;

    if (!nama) nama = await ask("Nama admin: ");
    if (!email) email = await ask("Email admin: ");
    if (!password) password = await ask("Password admin (min 6 karakter): ");

    if (!nama || !email || !password) {
        console.error("\n❌ Nama, email, dan password wajib diisi.");
        process.exit(1);
    }

    if (password.length < 6) {
        console.error("\n❌ Password minimal 6 karakter.");
        process.exit(1);
    }

    const usersCol = db.collection("users");

    // Cek apakah email sudah dipakai
    const existingSnap = await usersCol.where("email", "==", email).limit(1).get();
    if (!existingSnap.empty) {
        console.error(`\n❌ Email "${email}" sudah terdaftar. Tidak ada akun baru dibuat.`);
        process.exit(1);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const docRef = await usersCol.add({
        nama,
        email,
        password: hashedPassword,
        role: "admin",
        createdAt: new Date(),
        updatedAt: new Date(),
    });

    console.log("\n✅ Akun admin berhasil dibuat!");
    console.log("----------------------------------");
    console.log("ID    :", docRef.id);
    console.log("Nama  :", nama);
    console.log("Email :", email);
    console.log("Role  : admin");
    console.log("----------------------------------");
    console.log("Silakan login lewat POST /api/auth/login dengan email & password di atas.\n");

    process.exit(0);
}

main().catch((err) => {
    console.error("\n❌ Gagal membuat akun admin:", err.message);
    process.exit(1);
});
