export const deriveReportStatusFromSummary = (summary = "") => {
  const text = summary.toLowerCase();

  if (
    text.includes("elevated") ||
    text.includes("high") ||
    text.includes("low") ||
    text.includes("abnormal")
  ) {
    // borderline vs abnormal
    if (text.includes("slightly") || text.includes("borderline")) {
      return "Borderline";
    }
    return "Abnormal";
  }

  return "Normal";
};
