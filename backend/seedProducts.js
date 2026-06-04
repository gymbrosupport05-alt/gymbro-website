const Product = require('./models/Product');

const sampleProducts = [
    {
        name: 'Gym Bro Hoodie',
        price: 4949,
        category: 'hoodies',
        description: 'Premium heavyweight gym hoodie with a soft inner fleece.',
        image: "images/gym-bro-hoodie.webp",
        stock: 50
    },
    {
        name: 'Sleeveless Tank Tee',
        price: 2474,
        category: 'oversized',
        description: 'Breathable performance tank tee for intense workouts.',
        image: "images/oversized-gym-tshirt.webp",
        stock: 40
    },
    {
        name: 'Siren Crop Tee',
        price: 2199,
        category: 'oversized',
        description: 'Cropped street-gym tee with a flattering fit.',
        image:
            "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=400",
        stock: 35
    },
    {
        name: 'Beast Track Pants',
        price: 3849,
        category: 'trackpants',
        description: 'Flexible track pants built for movement and comfort.',
        image: "images/track-pants.jpg",
        stock: 60
    },
    {
        name: 'Pro Lift Gloves',
        price: 1649,
        category: 'accessories',
        description: 'Grip-enhancing training gloves for heavy sets.',
        image: "images/pro-lift-gloves.jpg",
        stock: 70
    },
    {
        name: 'Warrior Leggings',
        price: 4124,
        category: 'trackpants',
        description: 'High-stretch leggings for strength, cardio, and recovery.',
        image: "images/warrior-leggings.webp",
        stock: 45
    },
    {
        name: 'Lifting Straps',
        price: 1099,
        category: 'accessories',
        description: 'Support straps to help you lock in form and reps.',
        image: "images/lifting-straps.jpg",
        stock: 80
    },
    {
        name: 'Deadlift Belt',
        price: 2749,
        category: 'accessories',
        description: 'Stable support belt for safer and stronger deadlifts.',
        image: "images/deadlift-belt.jpg",
        stock: 25
    }
];

async function seed() {
    // Prevent duplicates even if DB already contains partial/duplicate data.
    // We dedupe by product name (as requested).
    const upserted = [];

    for (const p of sampleProducts) {
        const name = String(p.name || '').trim();
        if (!name) continue;

        // Use findOne() + update/insert semantics (no schema changes required).
        const existing = await Product.findOne({ name }).select('_id');
        if (existing?._id) {
            await Product.updateOne(
                { _id: existing._id },
                {
                    $set: {
                        price: p.price,
                        category: p.category,
                        description: p.description,
                        image: p.image,
                        stock: p.stock
                    }
                }
            );
            upserted.push({ name, action: 'updated' });
        } else {
            await Product.create(p);
            upserted.push({ name, action: 'inserted' });
        }
    }

    console.log(`Seed complete: ${upserted.length} products upserted.`);
}


module.exports = { seed, sampleProducts };

