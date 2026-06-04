const mongoose = require('mongoose');

const ItemSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true }
    },
    { _id: false }
);

const OrderSchema = new mongoose.Schema(
    {
        // keep your existing admin-friendly fields
        customer: { type: String, required: true },
        customerEmail: { type: String, default: '' },
        customerMobile: { type: String, default: '' },
        paymentMethod: { type: String, required: true },

        items: { type: [ItemSchema], required: true },
        total: { type: Number, required: true },
        totalItems: { type: Number, required: true },

        status: { type: String, enum: ['pending', 'processing', 'shipped', 'delivered'], default: 'pending' },

        // shipping address
        houseNo: { type: String, default: '' },
        street: { type: String, default: '' },
        city: { type: String, default: '' },
        state: { type: String, default: '' },
        pincode: { type: String, default: '' },

        // client display date; we also have createdAt from mongoose
        date: { type: String, default: '' }
    },
    { timestamps: true }
);

module.exports = mongoose.model('Order', OrderSchema);

