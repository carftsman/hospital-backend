import * as repo from "../repositories/timeslot.repository.js";

/**
 * options:
 *  - doctorIds: number[] | null
 *  - hospitalId: number | null
 *  - mode: "ONLINE"|"OFFLINE"|"BOTH"
 *  - from: Date | null
 *  - to: Date | null
 *  - limitPerDoctor: number
 *
 * Returns:
 * {
 *   requestedDoctorIds: [...],
 *   timeslotsByDoctor: {
 *     "<doctorId>": [ { id, start, end, consultationMode, isActive, createdAt }... ],
 *     ...
 *   }
 * }
 */
export const fetchTimeslots = async (options) => {
  const {
    doctorIds = null,
    hospitalId = null,
    mode = "BOTH",
    from = null,
    to = null,
    limitPerDoctor = 5
  } = options;

  // if hospitalId provided, fetch doctor ids for that hospital
  let targetDoctorIds = doctorIds;
  if (!targetDoctorIds || targetDoctorIds.length === 0) {
    if (hospitalId) {
      targetDoctorIds = await repo.getDoctorIdsByHospital(hospitalId);
    } else {
      targetDoctorIds = [];
    }
  }

  if (!targetDoctorIds || targetDoctorIds.length === 0) {
    return { requestedDoctorIds: [], timeslotsByDoctor: {} };
  }

  // fetch timeslots using single optimized query (row_number per doctor)
  const rows = await repo.getTimeslotsForDoctors(
    targetDoctorIds,
    mode,
    from,
    to,
    limitPerDoctor
  );

  // map rows into doctorId => timeslots array
  const timeslotsByDoctor = {};
  for (const r of rows) {
    const docId = Number(r.doctorId);
    if (!timeslotsByDoctor[docId]) timeslotsByDoctor[docId] = [];
    timeslotsByDoctor[docId].push({
      id: r.id,
      start: r.start,
      end: r.end,
      consultationMode: r.consultationMode,
      isActive: r.isActive,
      createdAt: r.createdAt
    });
  }

  return {
    requestedDoctorIds: targetDoctorIds,
    timeslotsByDoctor
  };
};
