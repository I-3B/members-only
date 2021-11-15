const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const UserSchema = new Schema(
    {
        username: String,
        password: String,
        member: { type: Boolean, default: false },
        admin: { type: Boolean, default: false },
    },
    { toObject: { virtuals: true }, toJSON: { virtuals: true } }
);
UserSchema.virtual("type").get(function () {
    if (this.admin) return "admin";
    else if (this.member) return "member";
    else return "user";
});
module.exports = mongoose.model("User", UserSchema);
