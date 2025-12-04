import prisma from "../src/prisma/client.js";

async function main() {
  await prisma.$executeRawUnsafe(`CREATE EXTENSION IF NOT EXISTS pg_trgm;`);
  await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS idx_hospital_name_trgm ON "Hospital" USING gin (name gin_trgm_ops);`);
  await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS idx_doctor_name_trgm ON "Doctor" USING gin (name gin_trgm_ops);`);
  await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS idx_category_name_trgm ON "Category" USING gin (name gin_trgm_ops);`);

  console.log("Indexes created.");
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
