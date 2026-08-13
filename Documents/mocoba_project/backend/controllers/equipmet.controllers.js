const createCrudController = require("../utils/crudController");
const equipmentService = require("../services/equipments.service");
module.exports = createCrudController(equipmentService);
