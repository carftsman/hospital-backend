import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log(" Seeding Hyderabad hospitals (10 records)...");

  const hospitals = [
    {
      name: "Demo Hospital",
      location: "Hyderabad",
      place: "Telangana",
      pinCode: "500001",
      ownerEmail: "demo@hospital.com",
      ownerPassword: "hashed-password",
      consultationMode: "BOTH",
      status: "APPROVED",
      isListed: true,
      isOpen: true,
      latitude: 17.385,
      longitude: 78.486
    },
    {
      name: "Apollo Hospitals",
      location: "Hyderabad",
      place: "Jubilee Hills",
      pinCode: "500033",
      ownerEmail: "apollo@hospital.com",
      ownerPassword: "hashed-password",
      consultationMode: "BOTH",
      status: "APPROVED",
      isListed: true,
      isOpen: true,
      latitude: 17.432,
      longitude: 78.407
    },
    {
      name: "Yashoda Hospitals",
      location: "Hyderabad",
      place: "Secunderabad",
      pinCode: "500003",
      ownerEmail: "yashoda@hospital.com",
      ownerPassword: "hashed-password",
      consultationMode: "OFFLINE",
      status: "APPROVED",
      isListed: true,
      isOpen: true,
      latitude: 17.439,
      longitude: 78.498
    },
    {
      name: "Care Hospitals",
      location: "Hyderabad",
      place: "Banjara Hills",
      pinCode: "500034",
      ownerEmail: "care@hospital.com",
      ownerPassword: "hashed-password",
      consultationMode: "BOTH",
      status: "APPROVED",
      isListed: true,
      isOpen: true,
      latitude: 17.412,
      longitude: 78.448
    },
    {
      name: "Continental Hospitals",
      location: "Hyderabad",
      place: "Gachibowli",
      pinCode: "500032",
      ownerEmail: "continental@hospital.com",
      ownerPassword: "hashed-password",
      consultationMode: "ONLINE",
      status: "APPROVED",
      isListed: true,
      isOpen: true,
      latitude: 17.440,
      longitude: 78.348
    },
    {
      name: "Sunshine Hospitals",
      location: "Hyderabad",
      place: "Begumpet",
      pinCode: "500016",
      ownerEmail: "sunshine@hospital.com",
      ownerPassword: "hashed-password",
      consultationMode: "OFFLINE",
      status: "APPROVED",
      isListed: true,
      isOpen: true,
      latitude: 17.444,
      longitude: 78.465
    },
    {
      name: "KIMS-Ushalakshmi Centre",
      location: "Hyderabad",
      place: "Begumpet",
      pinCode: "500016",
      ownerEmail: "kims@hospital.com",
      ownerPassword: "hashed-password",
      consultationMode: "BOTH",
      status: "APPROVED",
      isListed: true,
      isOpen: true,
      latitude: 17.447,
      longitude: 78.462
    },
    {
      name: "AIG Hospitals",
      location: "Hyderabad",
      place: "Gachibowli",
      pinCode: "500032",
      ownerEmail: "aig@hospital.com",
      ownerPassword: "hashed-password",
      consultationMode: "ONLINE",
      status: "APPROVED",
      isListed: true,
      isOpen: true,
      latitude: 17.438,
      longitude: 78.351
    },
    {
      name: "Medicover Hospitals",
      location: "Hyderabad",
      place: "Hitec City",
      pinCode: "500081",
      ownerEmail: "medicover@hospital.com",
      ownerPassword: "hashed-password",
      consultationMode: "OFFLINE",
      status: "APPROVED",
      isListed: true,
      isOpen: true,
      latitude: 17.448,
      longitude: 78.391
    },
    {
      name: "Rainbow Children’s Hospital",
      location: "Hyderabad",
      place: "Banjara Hills",
      pinCode: "500034",
      ownerEmail: "rainbow@hospital.com",
      ownerPassword: "hashed-password",
      consultationMode: "BOTH",
      status: "APPROVED",
      isListed: true,
      isOpen: true,
      latitude: 17.415,
      longitude: 78.452
    }
  ];

  await prisma.hospital.createMany({
    data: hospitals,
    skipDuplicates: true // ownerEmail is unique
  });

  console.log(" 10 Hyderabad hospitals seeded successfully");
}

main()
   .then(async () => {
    await prisma.$disconnect();
    console.log(" Seeding completed");
  })
  .catch(async (error) => {
    console.error("Seeding failed:", error);
    await prisma.$disconnect();
    process.exit(1);
  });
