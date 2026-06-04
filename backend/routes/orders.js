const express = require('express');
const { z } = require('zod');

const Order = require('../models/Order');

const router = express.Router();

const ItemSchema = z.object({
    name: z.string().min(1),
    price: z.number().nonnegative(),
    quantity: z.number().int().positive()
});

const CreateOrderSchema = z.object({
    customer: z.string().min(1),
    customerEmail: z.string().email().optional().or(z.literal('')),
    customerMobile: z.string().optional().or(z.literal('')),
    paymentMethod: z.string().min(1),
    items: z.array(ItemSchema).min(1),
    total: z.number().nonnegative(),
    totalItems: z.number().int().nonnegative(),
    // new required address fields
    houseNo: z.string().min(1),
    street: z.string().min(1),
    city: z.string().min(1),
    state: z.string().min(1),
    pincode: z.string().min(1),
    status: z.enum(['pending', 'processing', 'shipped', 'delivered']).optional(),
    date: z.string().optional() // client can send display date; we still store server timestamp
});

router.post('/', async (req, res) => {
    try {
        const parsed = CreateOrderSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({
                error: 'Invalid payload',
                details: parsed.error.flatten()
            });
        }

        const order = await Order.create({
            customer: parsed.data.customer,
            customerEmail: parsed.data.customerEmail || '',
            customerMobile: parsed.data.customerMobile || '',
            paymentMethod: parsed.data.paymentMethod,
            items: parsed.data.items,
            total: parsed.data.total,
            totalItems: parsed.data.totalItems,
            status: parsed.data.status || 'pending',
            houseNo: parsed.data.houseNo,
            street: parsed.data.street,
            city: parsed.data.city,
            state: parsed.data.state,
            pincode: parsed.data.pincode,
            date: parsed.data.date || new Date().toLocaleString('en-IN')
        });

        res.status(201).json({
            ok: true,
            order
        });
    } catch (err) {
        console.error('POST /api/orders failed:', err);
        res.status(500).json({ ok: false, error: 'Server error' });
    }
});

router.get('/', async (req, res) => {
    try {
        const status = req.query.status;
        const query = {};
        if (status === 'pending' || status === 'shipped') query.status = status;

        const orders = await Order.find(query)
            .sort({ createdAt: -1 })
            .lean();

        res.json({ ok: true, orders });
    } catch (err) {
        console.error('GET /api/orders failed:', err);
        res.status(500).json({ ok: false, error: 'Server error' });
    }
});

router.patch('/:id', async (req, res) => {
    try {
        const id = req.params.id;

        const BodySchema = z.object({
            status: z.enum(['pending', 'processing', 'shipped', 'delivered'])
        });

        const parsed = BodySchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({
                error: 'Invalid payload',
                details: parsed.error.flatten()
            });
        }

        const updated = await Order.findByIdAndUpdate(
            id,
            { status: parsed.data.status },
            { new: true }
        ).lean();

        if (!updated) return res.status(404).json({ ok: false, error: 'Order not found' });

        res.json({ ok: true, order: updated });
    } catch (err) {
        console.error('PATCH /api/orders/:id failed:', err);
        res.status(500).json({ ok: false, error: 'Server error' });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const id = req.params.id;

        const deleted = await Order.findByIdAndDelete(id).lean();
        if (!deleted) return res.status(404).json({ ok: false, error: 'Order not found' });

        res.json({ ok: true, deletedId: id });
    } catch (err) {
        console.error('DELETE /api/orders/:id failed:', err);
        res.status(500).json({ ok: false, error: 'Server error' });
    }
});

module.exports = router;

