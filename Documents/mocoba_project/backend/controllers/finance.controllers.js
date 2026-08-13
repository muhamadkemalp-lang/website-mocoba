const financeService = require("../services/finance.service");

exports.getSummary = async (req, res, next) => {
    try {
        const { start, end } = req.query;
        const data = await financeService.getSummary(start, end);
        res.json({ success: true, data });
    } catch (err) {
        next(err);
    }
};

exports.getDailySales = async (req, res, next) => {
    try {
        const data = await financeService.getDailySales(Number(req.query.days) || 7);
        res.json({ success: true, data });
    } catch (err) {
        next(err);
    }
};

exports.getMonthlySales = async (req, res, next) => {
    try {
        const data = await financeService.getMonthlySales(Number(req.query.months) || 12);
        res.json({ success: true, data });
    } catch (err) {
        next(err);
    }
};
