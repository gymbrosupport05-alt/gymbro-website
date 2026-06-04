const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const ordersRouter = require('./routes/orders');
const productsRouter = require('./routes/products');
const { connectDB } = require('./db');
const { seed } = require('./seedProducts');


const app = express();

app.use(helmet());
app.use(express.json({ limit: '1mb' }));
app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (e.g., curl, mobile apps)
        if (!origin) return callback(null, true);

        const allowedLocalOrigins = new Set([
            'https://gymbro-website-ten.vercel.apphttp://localhost:5500',
            'http://127.0.0.1:5500'
        ]);

        // Railway / production support via env var
        const envOrigin = process.env.CORS_ORIGIN;
        if (envOrigin) {
            // If a single origin string is provided, allow it.
            if (origin === envOrigin) return callback(null, true);

            // If a comma-separated list is provided, allow any match.
            const envList = envOrigin.split(',').map(s => s.trim()).filter(Boolean);
            if (envList.includes(origin)) return callback(null, true);
        }

        if (allowedLocalOrigins.has(origin)) return callback(null, true);

        // Fallback: if no envOrigin is configured, keep prior behavior wide-open.
        if (!envOrigin) return callback(null, true);

        return callback(new Error('Not allowed by CORS')); // blocked
    },
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(morgan('dev'));

app.get('/health', (req, res) => {
    res.json({ ok: true, service: 'gymbro-backend' });
});

app.use('/api/orders', ordersRouter);
app.use('/api/products', productsRouter);

// Startup debug logs to confirm routes are mounted
console.log('Products route mounted at /api/products');
console.log('Orders route mounted at /api/orders');

const PORT = process.env.PORT || 3001;


connectDB()
    .then(async () => {
        try {
            await seed();
        } catch (e) {
            console.error('Seed products failed:', e);
        }
        app.listen(PORT, () => {
            console.log(`gymbro-backend listening on port ${PORT}`);
        });
    })

    .catch((err) => {
        console.error('Failed to connect to MongoDB:', err);
        process.exit(1);
    });

