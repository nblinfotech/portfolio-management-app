
const { Op, Sequelize } = require('sequelize');
const models = require('../../models/core');
const { formatSlug } = require('../../utils/format');
const Modules = models.modules;

/**
 * Retrieves a list of Modules.
 * @returns {Promise<Array>} A promise that resolves to an array of Modules.
 */
const list = async () => {
  const modules = await Modules.findAll();
  return modules;
};



const getByModuleBySlug = async (moduleName) => {

  const formattedSlug = formatSlug(moduleName);

  const module = await Modules.findOne({
    where: {
     slug : formattedSlug
    }
  });
  return module;
};

const getModuleById = async (id) => {
  const module = await Modules.findOne({
    where: {
      id: id
    }
  });
  return module;
};



module.exports = {
  list,
  getByModuleBySlug,
  getModuleById
};
