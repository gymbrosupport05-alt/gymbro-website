const Product = require('../models/Product');

function normalizeCategory(category) {
    return String(category || '').trim();
}

function asyncHandler(fn) {
    return function (req, res, next) {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
}

// GET /api/products
const getAllProducts = asyncHandler(async (req, res) => {
    const { category } = req.query;
    const query = {};
    if (category) query.category = normalizeCategory(category);

    const products = await Product.find(query).sort({ createdAt: -1 }).lean();
    res.json({ ok: true, products });
});

// GET /api/products/:id
const getProductById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const product = await Product.findById(id).lean();
    if (!product) return res.status(404).json({ ok: false, error: 'Product not found' });
    res.json({ ok: true, product });
});

// POST /api/products
const createProduct = asyncHandler(async (req, res) => {
    const { name, price, category, description, image, stock } = req.body || {};

    if (!name || typeof name !== 'string') return res.status(400).json({ ok: false, error: 'name is required' });
    if (price === undefined || typeof price !== 'number' || Number.isNaN(price)) {
        return res.status(400).json({ ok: false, error: 'price must be a number' });
    }
    if (!category || typeof category !== 'string') return res.status(400).json({ ok: false, error: 'category is required' });
    if (!description || typeof description !== 'string') return res.status(400).json({ ok: false, error: 'description is required' });
    if (!image || typeof image !== 'string') return res.status(400).json({ ok: false, error: 'image is required' });
    if (stock === undefined || typeof stock !== 'number' || Number.isNaN(stock)) {
        return res.status(400).json({ ok: false, error: 'stock must be a number' });
    }

    const product = await Product.create({
        name: name.trim(),
        price,
        category: normalizeCategory(category),
        description: description.trim(),
        image: image.trim(),
        stock
    });

    res.status(201).json({ ok: true, product });
});

// PUT /api/products/:id
const updateProduct = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const body = req.body || {};

    const update = {};
    if (body.name !== undefined) {
        if (!body.name || typeof body.name !== 'string') return res.status(400).json({ ok: false, error: 'name must be a string' });
        update.name = body.name.trim();
    }
    if (body.price !== undefined) {
        if (typeof body.price !== 'number' || Number.isNaN(body.price)) return res.status(400).json({ ok: false, error: 'price must be a number' });
        update.price = body.price;
    }
    if (body.category !== undefined) {
        if (!body.category || typeof body.category !== 'string') return res.status(400).json({ ok: false, error: 'category must be a string' });
        update.category = normalizeCategory(body.category);
    }
    if (body.description !== undefined) {
        if (!body.description || typeof body.description !== 'string') return res.status(400).json({ ok: false, error: 'description must be a string' });
        update.description = body.description.trim();
    }
    if (body.image !== undefined) {
        if (!body.image || typeof body.image !== 'string') return res.status(400).json({ ok: false, error: 'image must be a string' });
        update.image = body.image.trim();
    }
    if (body.stock !== undefined) {
        if (typeof body.stock !== 'number' || Number.isNaN(body.stock)) return res.status(400).json({ ok: false, error: 'stock must be a number' });
        update.stock = body.stock;
    }

    const updated = await Product.findByIdAndUpdate(id, update, { new: true }).lean();
    if (!updated) return res.status(404).json({ ok: false, error: 'Product not found' });
    res.json({ ok: true, product: updated });
});

// DELETE /api/products/:id
const deleteProduct = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const deleted = await Product.findByIdAndDelete(id).lean();
    if (!deleted) return res.status(404).json({ ok: false, error: 'Product not found' });
    res.json({ ok: true, deletedId: id });
});

module.exports = {
    getAllProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct
};

