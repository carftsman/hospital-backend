import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const formatTime = (time) =>
  new Date(time).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true
  });

export const getLabAvailability = async (req, res) => {
  try {
    const labId = Number(req.params.labId);
    const { userId } = req.query;

    if (!labId) {
      return res.status(400).json({ message: "labId required" });
    }

    // 🔒 Cart lock
    if (userId) {
      const cart = await prisma.labCart.findFirst({
        where: { userId: Number(userId) },
        select: { labId: true }
      });

      if (cart && cart.labId !== labId) {
        return res.status(409).json({
          message: `Availability only for Lab ${cart.labId}`
        });
      }
    }

    const today = new Date();
    today.setHours(0,0,0,0);

    const endDate = new Date(today);
    endDate.setDate(today.getDate() + 13);
    endDate.setHours(23,59,59,999);

    const now = new Date();

    /* 1️⃣ Get all slots */
    const slots = await prisma.labSlot.findMany({
      where: {
        labId,
        slotDate: { gte: today, lte: endDate }
      },
      include: {
        bookings: true
      }
    });

    /* 2️⃣ Count ONLY free slots */
    const slotMap = new Map();

    slots.forEach(slot => {

      const activeBooking = slot.bookings.find(b =>
        ["CONFIRMED","SAMPLE_COLLECTED","COMPLETED"].includes(b.status) ||
        (b.status === "HOLD" && b.expiresAt > now)
      );

      if (!activeBooking) {
        const key = slot.slotDate.toISOString().split("T")[0];

        slotMap.set(key, (slotMap.get(key) || 0) + 1);
      }

    });

    /* 3️⃣ Build 14 days */
    const days = [];

    for (let i = 0; i < 14; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);

      const dateStr =
        d.getFullYear() +
        "-" +
        String(d.getMonth() + 1).padStart(2, "0") +
        "-" +
        String(d.getDate()).padStart(2, "0");

      days.push({
        date: dateStr,
        label:
          i === 0
            ? "Today"
            : i === 1
            ? "Tomorrow"
            : d.toLocaleDateString("en-IN", { weekday: "short" }),
        slotsAvailable: slotMap.get(dateStr) || 0
      });
    }

    res.json({
      labId,
      days
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getLabSlots = async (req, res) => {
  try {

    const labId = Number(req.params.labId);
    const { date, userId } = req.query;

    if (!labId || !date || !userId) {
      return res.status(400).json({
        message: "labId, date and userId required"
      });
    }

    /* ==========================
       1️⃣ CART VALIDATION
    ========================== */

    const cart = await prisma.labCart.findFirst({
      where: { userId: Number(userId) },
      select: { labId: true }
    });

    if (!cart) {
      return res.status(400).json({
        message: "Cart empty. Add package first"
      });
    }

    if (cart.labId !== labId) {
      return res.status(409).json({
        message: `Slots available only for Lab ${cart.labId}`
      });
    }

    /* ==========================
       2️⃣ DATE RANGE
    ========================== */

    const start = new Date(`${date}T00:00:00`);
    const end = new Date(`${date}T23:59:59`);

    const now = new Date();

    /* ==========================
       3️⃣ FETCH SLOTS
    ========================== */

    const slots = await prisma.labSlot.findMany({
      where: {
        labId,
        slotDate: {
          gte: start,
          lte: end
        }
      },
      include: {
        bookings: true
      },
      orderBy: {
        startTime: "asc"
      }
    });

    /* ==========================
       4️⃣ FORMAT SLOTS
    ========================== */

    const formatted = slots.map(slot => {

      const activeBooking = slot.bookings.find(b =>
        ["CONFIRMED","SAMPLE_COLLECTED","COMPLETED"].includes(b.status) ||
        (b.status === "HOLD" && b.expiresAt > now)
      );

      let expiresIn = null;

      if (activeBooking?.status === "HOLD") {
        expiresIn = Math.max(
          0,
          Math.floor((activeBooking.expiresAt - now) / 1000)
        );
      }

      const formatTime = (time) =>
        new Date(time).toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true
        });

      return {
        slotId: slot.id,
        startTime: formatTime(slot.startTime),
        endTime: formatTime(slot.endTime),
        time: `${formatTime(slot.startTime)} - ${formatTime(slot.endTime)}`,
        isBooked: !!activeBooking,
        expiresIn
      };

    });

    /* ==========================
       5️⃣ RESPONSE
    ========================== */

    res.json({
      labId,
      date,
      count: formatted.length,
      slots: formatted
    });

  } catch (error) {

    console.error("getLabSlots error:", error);

    res.status(500).json({
      message: "Internal server error"
    });

  }
};
export const holdLabSlot = async (req, res) => {
  try {
    const { userId, slotId } = req.body;

    const slot = await prisma.labSlot.findUnique({
      where: { id: Number(slotId) },
      include: { bookings: true }
    });

    if (!slot) {
      return res.status(404).json({ message: "Slot not found" });
    }

    const now = new Date();

    const activeBooking = slot.bookings.find(b =>
      ["CONFIRMED", "SAMPLE_COLLECTED", "COMPLETED"].includes(b.status) ||
      (b.status === "HOLD" && b.expiresAt > now)
    );

    if (activeBooking) {
      return res.status(409).json({
        message: "Slot already booked"
      });
    }

    const expiresAt = new Date(now.getTime() + 5 * 60 * 1000);

    const holdBooking = await prisma.labBooking.create({
      data: {
        userId,
        labId: slot.labId,
        slotId: slot.id,
        sampleDate: slot.slotDate,
        status: "HOLD",
        expiresAt
      }
    });

    res.json({
      message: "Slot locked for 5 minutes",
      bookingId: holdBooking.id,
      expiresAt
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};