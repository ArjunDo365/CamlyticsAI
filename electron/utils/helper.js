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

function to12HourFormat(dateValue) {
  if (!dateValue) return "";

  const d = new Date(dateValue);

  const day = String(d.getDate()).padStart(2, "0");
  const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const month = monthNames[d.getMonth()];
  const year = d.getFullYear();

  let hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, "0");
  const seconds = String(d.getSeconds()).padStart(2, "0");

  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;  
  hours = String(hours).padStart(2, "0");

  return `${day}-${month}-${year} ${hours}:${minutes}:${seconds} ${ampm}`;
}


module.exports = { convertToMySQLDate, formatFromMySQLDate,to12HourFormat };
