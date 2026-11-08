const { Client } = require('pg');
const client = new Client({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASS || 'postgres',
  database: process.env.DB_NAME || 'vmax',
});

async function run() {
  await client.connect();
  console.log('Connected to Postgres');

  // Check column type
  const colRes = await client.query(`
    SELECT column_name, data_type, udt_name 
    FROM information_schema.columns 
    WHERE table_name = 'listings' AND column_name = 'type';
  `);
  console.log('Column info:', colRes.rows);

  if (colRes.rows.length > 0 && colRes.rows[0].data_type === 'USER-DEFINED') {
    const enumType = colRes.rows[0].udt_name;
    console.log('Enum type name:', enumType);
    const enumVals = await client.query(`
      SELECT enumlabel FROM pg_enum 
      WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = $1);
    `, [enumType]);
    console.log('Existing enum values:', enumVals.rows.map(r => r.enumlabel));

    const hasDaily = enumVals.rows.some(r => r.enumlabel === 'DAILY_RENT');
    if (!hasDaily) {
      console.log(`Adding 'DAILY_RENT' to ${enumType}...`);
      await client.query(`ALTER TYPE "${enumType}" ADD VALUE 'DAILY_RENT';`);
      console.log('Added DAILY_RENT successfully!');
    } else {
      console.log('DAILY_RENT already exists in enum.');
    }
  }

  await client.end();
}

run().catch((err) => {
  console.error('Error:', err.message);
  process.exit(1);
});
