/*
  Dedupe Products Script
  ----------------------
  Removes duplicate Product documents from MongoDB.

  Keying strategy (per request): by product name.

  Usage (safe):
    node backend/scripts/dedupeProducts.js

  Usage (apply deletions):
    node backend/scripts/dedupeProducts.js --apply

  Requires env:
    - MONGODB_URI
    - (optional) MONGODB_DB
*/

require('dotenv').config();

const mongoose = require('mongoose');
const Product = require('../models/Product');

async function run({ apply }) {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
        throw new Error(
            'Missing MONGODB_URI env var. Set it in backend/.env or your shell before running the script.'
        );
    }

    // Use the same connection strategy as backend/db.js
    await mongoose.connect(mongoUri, { dbName: process.env.MONGODB_DB });


    // Group duplicates by name, keep the oldest doc (_id ascending by creation time).
    // Note: _id ordering works for ObjectId createdAt.
    const groups = await Product.aggregate([
        { $match: { name: { $type: 'string', $ne: '' } } },
        {
            $group: {
                _id: '$name',
                ids: { $push: '$_id' },
                count: { $sum: 1 }
            }
        },
        { $match: { count: { $gt: 1 } } },
        { $sort: { count: -1 } }
    ]);

    console.log(`Found ${groups.length} duplicate name group(s).`);

    let deletedCount = 0;
    let keptCount = 0;

    for (const g of groups) {
        const ids = g.ids;

        // Keep first, delete rest. Since we didn't sort in pipeline,
        // we'll perform a stable keep by selecting min _id as 'oldest'.
        const keepId = ids
            .slice()
            .sort((a, b) => String(a).localeCompare(String(b)))[0];

        const deleteIds = ids.filter(id => String(id) !== String(keepId));

        keptCount += 1;

        if (apply) {
            const result = await Product.deleteMany({ _id: { $in: deleteIds } });
            deletedCount += result.deletedCount || 0;
            console.log(`- ${g._id}: kept 1, deleted ${result.deletedCount || 0}`);
        } else {
            console.log(`- ${g._id}: would keep 1, delete ${deleteIds.length}`);
        }
    }

    console.log(`Done. keptGroups=${keptCount}, deletedCount=${deletedCount} (apply=${apply})`);

    await mongoose.disconnect();
}

const apply = process.argv.includes('--apply');

run({ apply })
    .then(() => process.exit(0))
    .catch(err => {
        console.error('Dedupe failed:', err);
        process.exit(1);
    });

