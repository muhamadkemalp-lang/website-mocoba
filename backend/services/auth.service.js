const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const userService = require("./user.service");

const JWT_EXPIRES_IN = "7d";

function sign(user) {
    return jwt.sign(
        { uid: user.id, role: user.role, name: user.nama },
        process.env.JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
    );
}

// role default "member" -> dipakai untuk pendaftaran mandiri di app user.
// Untuk bikin akun admin/kasir, dipanggil lewat endpoint khusus admin (lihat user.controllers).
async function register({ nama, email, password, role = "member" }) {
    const existing = await userService.findByEmail(email);
    if (existing) {
        const err = new Error("Email sudah terdaftar.");
        err.statusCode = 409;
        throw err;  
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await userService.createUser({
        nama,
        email,
        password: hashed,
        role,
        points: role === "member" ? 0 : undefined,
    });

    const token = sign(user);
    const { password: _, ...safeUser } = user;
    return { user: safeUser, token };
}

async function login({ email, password }) {
    const user = await userService.findByEmail(email);
    if (!user) {
        const err = new Error("Email atau password salah.");
        err.statusCode = 401;
        throw err;
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
        const err = new Error("Email atau password salah.");
        err.statusCode = 401;
        throw err;
    }

    const token = sign(user);
    const { password: _, ...safeUser } = user;
    return { user: safeUser, token };
}

module.exports = { register, login };
