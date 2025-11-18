// utils/helper.ts

// Convert DD-MM-YYYY -> YYYY-MM-DD for MySQL insertion
function convertToMySQLDate(ddmmyyyy) {
  if (!ddmmyyyy) throw new Error("Date is required");
  const parts = ddmmyyyy.split("-");
  if (parts.length !== 3) throw new Error("Invalid date format, expected DD-MM-YYYY");

  let [day, month, year] = parts;
  day = day.padStart(2, "0");
  month = month.padStart(2, "0");

  return `${year}-${month}-${day}`;
}

// Convert YYYY-MM-DD -> DD-MM-YYYY for display
function formatFromMySQLDate(yyyy_mm_dd) {
  if (!yyyy_mm_dd) return null;
  const [year, month, day] = yyyy_mm_dd.split("-");
  return `${day}-${month}-${year}`;
}

module.exports = { convertToMySQLDate, formatFromMySQLDate };
