const httpStatus = require('http-status');
const models = require('../../models/core');
const SubscriptionPlan = models.subscriptionPlan
const ApiError = require('../../utils/ApiError');


//get all subscriptions [id - optional], if id is passed gives the respective entity


const getSubscriptionPlans = async () => {

    const subscriptionPlans = await SubscriptionPlan.findAll();
    return subscriptionPlans;

};


//create a subscription plan

const createSubscriptionPlan = async (requestBody) => {
    if (await SubscriptionPlan.findOne({ where: { title: requestBody.title } })) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Subscription plan title already taken');
    }
    return SubscriptionPlan.create(requestBody);
};

const updateSubscriptionPlan = async (requestBody) => {
    if (await SubscriptionPlan.findOne({ where: { id: requestBody.id } })) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Subscription plan not found!');
    }
    return SubscriptionPlan.update(requestBody);
};

const deleteSubscriptionPlan = async (requestBody) => {
    if (await SubscriptionPlan.findOne({ where: { id: requestBody.id } })) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Subscription plan not found!');
    }
    return SubscriptionPlan.delete(requestBody);
};


module.exports = {
    getSubscriptionPlans,
    createSubscriptionPlan,
    updateSubscriptionPlan,
    deleteSubscriptionPlan
};
