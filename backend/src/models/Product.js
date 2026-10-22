import mongoose from "mongoose";
// Read schema only. No auto-increment plugin, hooks, index creation or writes.
const schema = new mongoose.Schema(
  {
    productId: Number,
    name: String,
    selling: Number,
    mrp: Number,
    image: String,
  },
  {
    collection: "products",
    autoIndex: false,
    autoCreate: false,
    versionKey: false,
  },
);
export default mongoose.models.WebsitePosProduct ||
  mongoose.model("WebsitePosProduct", schema);
