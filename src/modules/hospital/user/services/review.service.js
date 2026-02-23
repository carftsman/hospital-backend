import prisma from "../../../../prisma/client.js";

/* ---------------- GET DOCTOR REVIEWS ---------------- */
export const fetchDoctorReviews = async (doctorId, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;

  const reviews = await prisma.review.findMany({
    where: { doctorId },
    orderBy: { createdAt: "desc" },
    skip,
    take: limit
  });

  const total = await prisma.review.count({
    where: { doctorId }
  });

  // average rating
  const avg = await prisma.review.aggregate({
    where: { doctorId },
    _avg: { rating: true }
  });

  return {
    page,
    limit,
    total,
    averageRating: Number(avg._avg.rating || 0).toFixed(1),
    reviews
  };
};

export const addReview = async (userId, doctorId, rating, comment) => {
  // prevent duplicate review
  const exists = await prisma.review.findFirst({
    where: { doctorId, userId }
  });

  if (exists) throw new Error("ALREADY_REVIEWED");

  const review = await prisma.review.create({
    data: {
      doctorId,
      userId,
      rating: Number(rating),
      comment: comment || null
    }
  });

  // ⭐ Update doctor average rating
  const stats = await prisma.review.aggregate({
    where: { doctorId },
    _avg: { rating: true }
  });

  await prisma.doctor.update({
    where: { id: doctorId },
    data: { rating: Number(stats._avg.rating.toFixed(1)) }
  });

  return review;
};