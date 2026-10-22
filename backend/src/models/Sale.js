import mongoose from "mongoose";
const schema = new mongoose.Schema(
  {
    date: Date,
    items: [
      {
        product: mongoose.Schema.Types.ObjectId,
        quantity: Number,
        returned: Number,
      },
    ],
  },
  {
    collection: "sales",
    autoIndex: false,
    autoCreate: false,
    versionKey: false,
  },
);
export default mongoose.models.WebsitePosSale ||
  mongoose.model("WebsitePosSale", schema);
