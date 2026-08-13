const createCrudController = require("../utils/crudController");
const categoryService = require("../services/kategorie.service");
module.exports = createCrudController(categoryService);
