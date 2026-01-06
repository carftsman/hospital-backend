import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log(" Seeding database...");

  // 1️⃣ Create a Hospital (required parent)
  const hospital = await prisma.hospital.create({
    data: {
      name: "Demo Hospital",
      location: "Hyderabad",
      place: "Telangana",
      pinCode: "500001",
      ownerEmail: "demo@hospital.com",
      ownerPassword: "hashed-password",
      status: "APPROVED",
      isListed: true,
      isOpen: true
    }
  });

  console.log(" Hospital created:", hospital.id);

  // 2️⃣ Create Categories linked to Hospital
  const categoriesData = [
    { name: "General", hospitalId: hospital.id },
    { name: "Respiratory", hospitalId: hospital.id },
    { name: "Neurology", hospitalId: hospital.id },
    { name: "Cardiology", hospitalId: hospital.id }
  ];

  await prisma.category.createMany({
    data: categoriesData,
    skipDuplicates: true
  });

  console.log("Categories created");

  // 3️⃣ Fetch categories
  const categories = await prisma.category.findMany({
    where: { hospitalId: hospital.id }
  });

  const categoryMap = {};
  categories.forEach(c => {
    categoryMap[c.name] = c.id;
  });

  // 4️⃣ Create Symptoms linked to Categories
  const symptomsData = [
    { name: "fever", categoryId: categoryMap["General"] },
    { name: "cold", categoryId: categoryMap["Respiratory"] },
    { name: "cough", categoryId: categoryMap["Respiratory"] },
    { name: "headache", categoryId: categoryMap["Neurology"] },
    { name: "chest pain", categoryId: categoryMap["Cardiology"] }
  ];

  await prisma.symptom.createMany({
    data: symptomsData,
    skipDuplicates: true
  });

  console.log(" Symptoms created");
}

main()
  .then(async () => {
    console.log("Seeding completed successfully");
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(" Seeding failed:", error);
    await prisma.$disconnect();
    process.exit(1);
  });
