const dashboardService = require("../services/dashboard.service");

exports.getSummary = async (req, res) => {

    try{

        const data = await dashboardService.getDashboardSummary();

        res.json({

            success:true,

            data

        });

    }catch(err){

        console.log(err);

        res.status(500).json({

            success:false,

            message:err.message

        });

    }

};

exports.getLowStock = async (req, res) => {
    try {
        const data = await dashboardService.getLowStock();
        res.json({ success: true, data });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.getTopProducts = async (req, res) => {
    try {
        const data = await dashboardService.getTopProducts();
        res.json({ success: true, data });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.getRecentOrders = async (req, res) => {
    try {
        const data = await dashboardService.getRecentOrders();
        res.json({ success: true, data });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};