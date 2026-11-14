
const mongoose = require("mongoose");


const transactionSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        title: {
            type: String,
            required: [true, "Transaction title is required"],
            trim: true,
            minlength: 2,
            maxlength: 50
        },

        amount: {
            type: Number,
            required: [true, "Amount is required"],
            min: [0.01, "Amount must be greater than zero"]
        },

        type: {
            type: String,
            required: true,
            enum: ["Income", "Expense"]
        },

        category: {
            type: String,
            required: [true, "Category is required"],
            trim: true
        },

        date: {
            type: Date,
            required: true,
            default: Date.now
        },

        description: {
            type: String,
            trim: true,
            maxlength: 200,
            default: ""
        }
    },
    {
        timestamps: true
    }
);

const Transaction = mongoose.model(
    "Transaction",
    transactionSchema
);

module.exports = Transaction;
