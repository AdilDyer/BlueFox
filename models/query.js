const mongoose = require("mongoose");
const querySchema = new mongoose.Schema({
  name: { type: String },
  mobno: { type: Number },
  email: { type: String },
  typeOfAdvertising: { type: String },
  message: { type: String },
});

const Query = mongoose.model("Query", querySchema);

module.exports = Query;
