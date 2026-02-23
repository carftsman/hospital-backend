import prisma from "../../../../prisma/client.js";

export const createReview = async (req, res) => {
  try {
    const { doctorId, rating, comment, userId } = req.body;

    if (!doctorId || !rating || !userId) {
      return res.status(400).json({
        message: "doctorId, rating and userId required"
      });
    }

    // ✅ fetch user from DB
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        fullName: true,   // ✅ correct field
        phone: true       // optional
      }
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // prevent duplicate review
    const existing = await prisma.review.findFirst({
      where: { doctorId, userId }
    });

    if (existing) {
      return res.status(409).json({
        message: "You already reviewed this doctor"
      });
    }

    const review = await prisma.review.create({
      data: {
        doctorId,
        userId,
        rating,
        comment,
        userName: user.fullName,   // ✅ mapped
        userImage: null            // until you add avatar
      }
    });

    res.status(201).json({
      message: "Review added successfully",
      review
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getDoctorReviews = async (req, res) => {
  try {
    const doctorId = Number(req.params.doctorId);

    const reviews = await prisma.review.findMany({
      where: { doctorId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        rating: true,
        comment: true,
        userName: true,
        userImage: true,
        createdAt: true
      }
    });

    res.json({ doctorId, reviews });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};