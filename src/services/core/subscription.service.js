const models = require('../../models/core');
const Subscription = models.subscription;

const list = async () => {
  const subscriptionPlans = await Subscription.findAll();
  return subscriptionPlans;
};

module.exports = {
  list,
};
