import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const bookings = await prisma.booking.findMany({
    where: { patientProfileId: null },
    include: { user: true },
  });

  for (const booking of bookings) {
    // find or create SELF profile
    let profile = await prisma.patientProfile.findFirst({
      where: {
        userId: booking.userId,
        isSelf: true,
      },
    });

    if (!profile) {
      profile = await prisma.patientProfile.create({
        data: {
          userId: booking.userId,
          fullName: booking.user.fullName ?? "Self",
          phone: booking.user.phone,
          isSelf: true,
        },
      });
    }

    // update booking
    await prisma.booking.update({
      where: { id: booking.id },
      data: { patientProfileId: profile.id },
    });
  }

  console.log("✅ Backfill completed successfully");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
