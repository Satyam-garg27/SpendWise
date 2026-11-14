
const Transaction = require("../models/Transaction");

// GET TRANSACTIONS
const getTransactions = async (req, res) => {
    try {
        const {
            search,
            category,
            type,
            sortBy = "date",
            order = "desc",
            page = 1,
            limit = 10
        } = req.query;

        // Every query is restricted to the logged-in user
        const filter = { user: req.user._id };

        if (search) {
            filter.title = {
                $regex: search,
                $options: "i"
            };
        }

        if (category) filter.category = category;
        if (type) filter.type = type;

        const allowedFields = ["date", "amount", "createdAt"];

        const sortField = allowedFields.includes(sortBy)
            ? sortBy
            : "date";

        const sortOrder = order === "asc" ? 1 : -1;
        const currentPage = Math.max(1, Number(page) || 1);
        const pageLimit = Math.min(100, Math.max(1, Number(limit) || 10));
        const skip = (currentPage - 1) * pageLimit;

        const [transactions, total] = await Promise.all([
            Transaction.find(filter)
                .sort({ [sortField]: sortOrder })
                .skip(skip)
                .limit(pageLimit),

            Transaction.countDocuments(filter)
        ]);

        res.status(200).json({
            total,
            currentPage,
            totalPages: Math.ceil(total / pageLimit),
            transactions
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET TRANSACTION BY ID
const getTransactionById = async (req, res) => {
    try {
        const transaction = await Transaction.findOne({
            _id: req.params.id,
            user: req.user._id
        });

        if (!transaction) {
            return res.status(404).json({
                message: "Transaction not found"
            });
        }

        res.json(transaction);

    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// ADD TRANSACTION
const addTransaction = async (req, res) => {
    try {
        const transaction = await Transaction.create({
            ...req.body,
            user: req.user._id
        });

        res.status(201).json({
            message: "Transaction added successfully",
            transaction
        });

    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// UPDATE TRANSACTION
const updateTransaction = async (req, res) => {
    try {
        const { user, _id, ...updates } = req.body;

        const transaction = await Transaction.findOneAndUpdate(
            {
                _id: req.params.id,
                user: req.user._id
            },
            updates,
            {
                new: true,
                runValidators: true
            }
        );

        if (!transaction) {
            return res.status(404).json({
                message: "Transaction not found"
            });
        }

        res.json({
            message: "Transaction updated successfully",
            transaction
        });

    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// DELETE TRANSACTION
const deleteTransaction = async (req, res) => {
    try {
        const transaction = await Transaction.findOneAndDelete({
            _id: req.params.id,
            user: req.user._id
        });

        if (!transaction) {
            return res.status(404).json({
                message: "Transaction not found"
            });
        }

        res.json({
            message: "Transaction deleted successfully"
        });

    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

module.exports = {
    getTransactions,
    getTransactionById,
    addTransaction,
    updateTransaction,
    deleteTransaction
};
