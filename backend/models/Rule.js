const mongoose = require('mongoose');

const RuleSchema = new mongoose.Schema({
    conditionType: String,
    conditionValue: String,
    actionType: String,
    actionValue: String,
});

module.exports = mongoose.model('Rule', RuleSchema); 