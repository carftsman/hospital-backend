import prisma from "../src/prisma/client.js";

async function run() {
  const users = await prisma.user.findMany({
    where: { fullName: null }
  });

  for (const u of users) {
    await prisma.user.update({
      where: { id: u.id },
      data: {
        fullName: `${u.firstName} ${u.lastName}`.trim()
      }
    });
  }

  console.log("✅ fullName backfilled successfully");
  process.exit();
}

run();
