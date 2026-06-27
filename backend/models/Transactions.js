import mongoose from "mongoose";

const TransactionSchema = mongoose.Schema(
  {
    items: [
      {
        productId: {
          type: String,
          required: true
        },

        name: {
          type: String,
          required: true
        },

        quantity: {
          type: Number,
          required: true
        },

        price: {
          type: Number,
          required: true
        },
      }
    ],

    total: {
      type: Number,
      required: true
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

const TransactionModel = mongoose.model('Transaction', TransactionSchema);

export default TransactionModel;