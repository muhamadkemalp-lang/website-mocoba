const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth.routes");
const productRoutes = require("./routes/product.routes");
const categoryRoutes = require("./routes/kategorie.routes");
const recipeRoutes = require("./routes/recipe.routes");
const inventoryRoutes = require("./routes/inventory.routes");
const equipmentRoutes = require("./routes/equipments.routes");
const transactionRoutes = require("./routes/transactions.routes");
const financeRoutes = require("./routes/finance.routes");
const reportRoutes = require("./routes/report.routes");
const settingRoutes = require("./routes/setting.routes");
const userRoutes = require("./routes/user.routes");
const memberRoutes = require("./routes/member.routes");
const dashboardRoutes = require("./routes/dashboard.routes");

const errorHandler = require("./middleware/errorHandler");

const app = express();
app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://website-mocoba.vercel.app",
    "capacitor://localhost",
    "http://localhost",
    "https://localhost",
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
}));
app.use(express.json());
app.use("/uploads", express.static(require("path").join(__dirname, "..", "public", "uploads")));
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
    res.json({
        success: true,
        application: "MOCOBA Backend",
        version: "1.0.0",
    });
});

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/recipes", recipeRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/equipments", equipmentRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/finance", financeRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/settings", settingRoutes);
app.use("/api/users", userRoutes);
app.use("/api/members", memberRoutes);
app.use("/api/dashboard", dashboardRoutes);

// 404 untuk route yang tidak ada
app.use((req, res) => {
    res.status(404).json({ success: false, message: "Endpoint tidak ditemukan." });
});

// Error handler HARUS paling akhir
app.use(errorHandler);

module.exports = app;
