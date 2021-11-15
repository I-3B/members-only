const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const MessageSchema = new Schema({
    sender: String,
    content: String,
    timestamp: Date,
});
module.exports = mongoose.model("Message", MessageSchema);
