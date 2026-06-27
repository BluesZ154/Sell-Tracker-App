import mongoose from "mongoose";

const ProductSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },

    price: {
      type: Number,
      required: true
    },

    stock: {
      type: Number,
      default: 0
    },

    isDeleted: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true,
  }
)

const ProductModel = mongoose.model('Product', ProductSchema);

export default ProductModel;