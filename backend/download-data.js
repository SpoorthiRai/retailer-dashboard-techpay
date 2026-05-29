// ============================================================
// TechPay Dashboard — Data Exporter
//
// Downloads every table / collection used by the dashboard
// from both PostgreSQL and MongoDB, and saves them as JSON
// files in a  downloads/  folder next to this script.
//
// Usage (from the /backend directory):
//   node download-data.js
//
// Requirements:
//   • .env file in /backend with PG_* and MONGO_URI set
//   • npm install  already run (pg, mongodb, dotenv are deps)
// ============================================================

require('dotenv').config();
const { Pool }       = require('pg');
const { MongoClient } = require('mongodb');
const fs             = require('fs');
const path           = require('path');

// ── Output directory ─────────────────────────────────────────
const OUTPUT_DIR = path.join(__dirname, 'downloads');

// ── Helper: save one dataset to disk ─────────────────────────
function save(label, data, ts) {
  const file = path.join(OUTPUT_DIR, `${label}__${ts}.json`);
  fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
  const kb = (fs.statSync(file).size / 1024).toFixed(1);
  console.log(`   ✅  ${path.basename(file)}  —  ${data.length} records  (${kb} KB)`);
  return file;
}

// ── Main ─────────────────────────────────────────────────────
async function main() {
  console.log('\n╔══════════════════════════════════════════════╗');
  console.log('║   TechPay Dashboard  —  Data Exporter        ║');
  console.log('╚══════════════════════════════════════════════╝\n');

  // Timestamp used in every filename so exports don't overwrite each other
  const ts = new Date().toISOString().slice(0, 19).replace(/[T:]/g, '-');

  // Create output folder if it doesn't exist
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }
  console.log(`📁  Output folder: ${OUTPUT_DIR}\n`);

  const manifest = {
    exportedAt: new Date().toISOString(),
    files: [],
  };

  // ──────────────────────────────────────────────────────────
  //  POSTGRESQL
  // ──────────────────────────────────────────────────────────
  const pg = new Pool({
    host:     process.env.PG_HOST,
    port:     Number(process.env.PG_PORT) || 5432,
    database: process.env.PG_DB,
    user:     process.env.PG_USER,
    password: process.env.PG_PASSWORD,
    ssl: false,
    connectionTimeoutMillis: 10000,
  });

  console.log('─── PostgreSQL ───────────────────────────────────');
  try {
    await pg.query('SELECT 1');          // verify connection
    console.log('✅  Connected\n');

    // ── orders_order  (core table — every dashboard metric derives from here)
    console.log('📥  orders_order …');
    const ordersRes = await pg.query(`
      SELECT
        order_id,
        order_no,
        created_at,
        status,
        total_price,
        payment_method,
        payment_status,
        cashfree_payment_status,
        zype_payment_status,
        down_payment,
        net_loan_amount,
        store_id
      FROM orders_order
      ORDER BY created_at DESC
    `);
    manifest.files.push(save('pg__orders_order', ordersRes.rows, ts));

    // ── payment_status distinct values  (useful reference)
    console.log('📥  distinct payment statuses …');
    const statusRes = await pg.query(`
      SELECT DISTINCT
        payment_status,
        cashfree_payment_status,
        zype_payment_status,
        status         AS order_status,
        payment_method
      FROM orders_order
      ORDER BY payment_method, payment_status
    `);
    manifest.files.push(save('pg__distinct_statuses', statusRes.rows, ts));

    // ── monthly aggregation  (matches monthlySeries in dashboard)
    console.log('📥  monthly aggregation …');
    const monthlyRes = await pg.query(`
      SELECT
        TO_CHAR(DATE_TRUNC('month', created_at), 'Mon YYYY') AS month,
        COUNT(*)                                              AS total_orders,
        COUNT(*) FILTER (WHERE
          payment_status IN ('SUCCESS','PAID','COMPLETED')
          OR cashfree_payment_status IN ('SUCCESS','PAID','COMPLETED')
          OR zype_payment_status = 'LOAN_TRANSFERRED'
          OR (payment_method = 'OFFLINE' AND payment_status = 'PAID')
        )                                                     AS successful_orders,
        COALESCE(SUM(total_price), 0)                         AS gmv
      FROM orders_order
      GROUP BY DATE_TRUNC('month', created_at)
      ORDER BY DATE_TRUNC('month', created_at)
    `);
    manifest.files.push(save('pg__monthly_series', monthlyRes.rows, ts));

    // ── store-level order summary
    console.log('📥  per-store order summary …');
    const storeOrderRes = await pg.query(`
      SELECT
        store_id,
        COUNT(*)                                              AS total_orders,
        COUNT(*) FILTER (WHERE status = 'CONFIRMED')          AS confirmed_orders,
        COALESCE(SUM(total_price), 0)                         AS gmv,
        COUNT(*) FILTER (WHERE payment_method = 'CASHFREE_ZYPE') AS emi_orders
      FROM orders_order
      GROUP BY store_id
      ORDER BY gmv DESC
    `);
    manifest.files.push(save('pg__store_order_summary', storeOrderRes.rows, ts));

    // ── payment method breakdown
    console.log('📥  payment method breakdown …');
    const pmRes = await pg.query(`
      SELECT
        payment_method,
        COUNT(*)                                              AS total,
        COUNT(*) FILTER (WHERE
          payment_status IN ('SUCCESS','PAID','COMPLETED')
          OR cashfree_payment_status IN ('SUCCESS','PAID','COMPLETED')
          OR zype_payment_status = 'LOAN_TRANSFERRED'
          OR (payment_method = 'OFFLINE' AND payment_status = 'PAID')
        )                                                     AS success_count
      FROM orders_order
      GROUP BY payment_method
      ORDER BY total DESC
    `);
    manifest.files.push(save('pg__payment_methods', pmRes.rows, ts));

  } catch (err) {
    console.error(`❌  PostgreSQL error: ${err.message}`);
    console.error('    Check PG_HOST / PG_PORT / PG_DB / PG_USER / PG_PASSWORD in .env\n');
  } finally {
    await pg.end();
    console.log('\n🔌  PostgreSQL disconnected\n');
  }

  // ──────────────────────────────────────────────────────────
  //  MONGODB  (stock_service)
  // ──────────────────────────────────────────────────────────
  const mongo = new MongoClient(process.env.MONGO_URI || '', {
    serverSelectionTimeoutMS: 10000,
    connectTimeoutMS: 10000,
  });

  console.log('─── MongoDB (stock_service) ──────────────────────');
  try {
    await mongo.connect();
    console.log('✅  Connected\n');

    const db = mongo.db('stock_service');

    // ── stores
    console.log('📥  stores …');
    const stores = await db.collection('stores').find({}).toArray();
    manifest.files.push(save('mongo__stores', stores, ts));

    // ── products
    console.log('📥  products …');
    const products = await db.collection('products').find({}).toArray();
    manifest.files.push(save('mongo__products', products, ts));

    // ── inventories  (joined with product names for readability)
    console.log('📥  inventories (with product + store names) …');
    const inventories = await db.collection('inventories').aggregate([
      { $lookup: {
          from: 'products',
          localField: 'product',
          foreignField: '_id',
          as: 'productInfo',
      }},
      { $lookup: {
          from: 'stores',
          localField: 'store',
          foreignField: '_id',
          as: 'storeInfo',
      }},
      { $unwind: { path: '$productInfo', preserveNullAndEmptyArrays: true } },
      { $unwind: { path: '$storeInfo',   preserveNullAndEmptyArrays: true } },
      { $project: {
          _id: 1,
          quantity: 1,
          productName:     '$productInfo.name',
          productCategory: '$productInfo.category',
          productBrand:    '$productInfo.manufacturer',
          storeName:       '$storeInfo.name',
          storeCity:       '$storeInfo.city',
          storeState:      '$storeInfo.state',
          rawStoreId:      '$store',
          rawProductId:    '$product',
      }},
    ]).toArray();
    manifest.files.push(save('mongo__inventories_joined', inventories, ts));

    // ── raw inventories  (for reference)
    console.log('📥  inventories (raw) …');
    const invRaw = await db.collection('inventories').find({}).toArray();
    manifest.files.push(save('mongo__inventories_raw', invRaw, ts));

    // ── carts
    console.log('📥  carts …');
    const carts = await db.collection('carts').find({}).toArray();
    manifest.files.push(save('mongo__carts', carts, ts));

  } catch (err) {
    console.error(`❌  MongoDB error: ${err.message}`);
    console.error('    Check MONGO_URI in .env\n');
  } finally {
    await mongo.close();
    console.log('\n🔌  MongoDB disconnected\n');
  }

  // ── Write manifest (index of all exported files)
  const manifestFile = path.join(OUTPUT_DIR, `manifest__${ts}.json`);
  fs.writeFileSync(manifestFile, JSON.stringify(manifest, null, 2), 'utf8');
  console.log(`📋  Manifest written: ${path.basename(manifestFile)}`);
  console.log('\n✅  Export complete — all files saved to downloads/\n');
}

main().catch(err => {
  console.error('\n❌  Fatal error:', err.message);
  process.exit(1);
});
