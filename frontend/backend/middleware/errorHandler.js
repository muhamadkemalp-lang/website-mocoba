// Error handler terpusat. Dipasang paling akhir di app.js: app.use(errorHandler)
function errorHandler(err, req, res, next) {
    console.error(err);

    const statusCode = err.statusCode || 500;

    res.status(statusCode).json({
        success: false,
        message: err.message || "Terjadi kesalahan pada server.",
    });
}

module.exports = errorHandler;
