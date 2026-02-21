import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const formatTime = (time) =>
  new Date(time).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true
  });

/**
 * GET LAB AVAILABILITY (14 DAYS)
 */
export const getLabAvailability = async (req, res) => {
  try {
    const labId = Number(req.params.labId);
    const { userId } = req.query;

    if (!labId) {
      return res.status(400).json({ message: "labId required" });
    }

    // ✅ OPTIONAL: enforce cart lab lock
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
    today.setHours(0, 0, 0, 0);

    const endDate = new Date(today);
    endDate.setDate(today.getDate() + 13);
    endDate.setHours(23, 59, 59, 999);

    const grouped = await prisma.labSlot.groupBy({
      by: ["slotDate"],
      where: {
        labId,
        slotDate: { gte: today, lte: endDate }
      },
      _count: { id: true }
    });

    const slotMap = new Map();
    grouped.forEach(s => {
      slotMap.set(s.slotDate.toISOString().slice(0, 10), s._count.id);
    });

    const days = [];
    for (let i = 0; i < 14; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);

      const dateStr = d.toISOString().slice(0, 10);

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

    res.json({ labId, days });
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
        message: "labId, userId and date required"
      });
    }

    /* ==============================
       1️⃣ CART VALIDATION
    ============================== */
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

    /* ==============================
       2️⃣ DATE RANGE
    ============================== */
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);

    const end = new Date(date);
    end.setHours(23, 59, 59, 999);

    const now = new Date();

    /* ==============================
       3️⃣ FETCH SLOTS WITH EXPIRY LOGIC
    ============================== */
    const slots = await prisma.labSlot.findMany({
      where: {
        labId,
        slotDate: { gte: start, lte: end }
      },
      include: {
        bookings: true // fetch all, filter manually
      },
      orderBy: { startTime: "asc" }
    });

    /* ==============================
       4️⃣ FORMAT + EXPIRY HANDLING
    ============================== */
    const unique = new Map();

    slots.forEach(s => {
      const key = `${s.startTime}-${s.endTime}`;

      if (!unique.has(key)) {
        // find active booking
        const activeBooking = s.bookings.find(b => {
          if (b.status === "COMPLETED") return true;
          if (b.status === "HOLD" && b.expiresAt > now) return true;
          return false;
        });

        let expiresIn = null;

        // calculate expiry countdown
        if (activeBooking?.status === "HOLD") {
          expiresIn = Math.max(
            0,
            Math.floor((activeBooking.expiresAt - now) / 1000)
          ); // seconds
        }

        unique.set(key, {
          slotId: s.id,
          startTime: formatTime(s.startTime),
          endTime: formatTime(s.endTime),
          time: `${formatTime(s.startTime)} - ${formatTime(s.endTime)}`,
          isBooked: !!activeBooking,
          expiresIn // ⏳ NEW FIELD
        });
      }
    });

    const formatted = Array.from(unique.values());

    res.json({
      labId,
      date,
      count: formatted.length,
      slots: formatted
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};