const { validationResult } = require("express-validator");
const userModel = require("../models/user.model");
const orderModel = require("../models/order.model");
const cartModel = require("../models/cart.model");
const { createUser } = require("../services/user.service");
const blacklistTokenModel = require("../models/blacklistToken.model");
const { generateOrderNumber } = require("../utils/helper");

module.exports.registerUser = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { fullName, company, contactNo, email, password, confirmPassword, gstNo } = req.body;

        const userByEmail = await userModel.findOne({ email });
        const userByContactNo = await userModel.findOne({ contactNo });

        if (userByEmail) {
            return res
                .status(404)
                .json({ message: "User with this email is already registered" });
        }

        if (userByContactNo) {
            return res
                .status(404)
                .json({ message: "User with this contact number is already registered" });
        }

        const hashPassword = await userModel.hashPassword(password);

        const user = await createUser({
            fullName,
            email,
            contactNo,
            password: hashPassword,
            companyName: company,
            gstNo
        });

        const userData = {
            fullName: user.fullName,
            email: user.email,
            role: user.role,
            contactNo: user.contactNo,
            companyName: user.companyName
        }

        const token = user.generateAuthToken();

        res.cookie("token", token, {
            httpOnly: true,
            secure: true,      // set true in production (HTTPS required)
            sameSite: "none",
            maxAge: 24 * 60 * 60 * 1000, // 24 hour
        });

        return res.status(200).json({ token, userData });

    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

module.exports.loginUser = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password } = req.body;

        const user = await userModel.findOne({ email }).select("+password");

        if (!user) {
            return res.status(401).json({ message: "Invalid email and password" });
        }

        const isMatch = await user.comparePassword(password);

        if (!isMatch) {
            return res.status(401).json({ message: "Invalid email and password" });
        }

        const userData = {
            fullName: user.fullName,
            email: user.email,
            role: user.role,
            contactNo: user.contactNo,
            companyName: user.companyName
        }

        const token = user.generateAuthToken();

        res.cookie("token", token, {
            httpOnly: true,
            secure: true,      // set true in production (HTTPS required)
            sameSite: "none",
            maxAge: 24 * 60 * 60 * 1000, // 24 hour
        });

        return res.status(200).json({ token, userData });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}

module.exports.getUserProfile = async (req, res) => {
    return res.status(200).json(req.user);
};

module.exports.logoutUser = async (req, res) => {
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
    res.clearCookie("token");

    const blacklistToken = await blacklistTokenModel.create({ token });

    return res.status(200).json({ message: "Logout user" });
};

module.exports.cartData = async (req, res) => {
    try {
        const cartData = await cartModel.findOne({ userId: req.user._id })
            .lean();

        if (!cartData) {
            return res.status(200).json({ status: false, cart: [] });
        }

        return res.status(200).json({ status: true, cart: cartData ? cartData : [] });
    } catch (err) {
        return res.status(500).json({ status: false, message: err.message });
    }
}

module.exports.createOrder = async (req, res) => {
    try {
        const userId = req.user._id;
        const orderData = req.body;
        const orderNumber = generateOrderNumber();

        if (!orderData.cart || orderData.cart.length === 0) {
            return res.status(400).json({ message: "Cart cannot be empty" });
        }

        const generateOrderItems = (cart) => {
            return cart.map(item => {
                const itemTotal = item.unitPrice * item.quantity;

                // Calculate tax
                let taxAmount = 0;
                if (item.taxType === 'exclusive') {
                    taxAmount = (item.taxRate / 100) * itemTotal;
                } else if (item.taxType === 'inclusive') {
                    taxAmount = (item.taxRate / (100 + item.taxRate)) * itemTotal;
                }

                return {
                    productId: item.productId,
                    productName: item.productName,
                    unitPrice: item.unitPrice,
                    taxRate: item.taxRate,
                    taxType: item.taxType,
                    mainImage: item.mainImage,
                    taxAmount: parseFloat(taxAmount.toFixed(2)),
                    quantity: item.quantity,
                    total: parseFloat((itemTotal + taxAmount).toFixed(2)),
                };
            });
        };

        const orderItems = generateOrderItems(orderData.cart);

        const order = await orderModel.create({
            userId,
            orderNumber,
            orderItems,
            grandTotal: orderData.total,
            shippingAddress: orderData.address,
        });

        if (!order) {
            return res.status(400).json({ status: false, message: "Order not created" });
        }

        await cartModel.deleteOne({ userId });

        return res.status(200).json({ status: true, message: "Order Created Successfully", orderNumber });
    } catch (err) {
        return res.status(500).json({ status: false, message: "Internal Server Error" });
    }
};

module.exports.getOrderDetail = async (req, res) => {
    try {
        const orderNumber = req.query.orderNumber;
        const order = await orderModel.find({ orderNumber });
        return res.status(200).json({ status: true, order: order[0] });
    } catch (err) {
        return res.status(500).json({ status: false, message: "Internal Server Error" });
    }
};