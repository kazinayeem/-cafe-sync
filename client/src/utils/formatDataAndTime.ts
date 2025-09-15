// --- Date helpers ---
const formatDateWithTZ = (date: Date, isEnd = false) => {
  if (isEnd) {
    date.setHours(23, 59, 59, 999);
  } else {
    date.setHours(0, 0, 0, 0);
  }
  return new Date(
    `${date.toISOString().split("T")[0]}T${
      date.toTimeString().split(" ")[0]
    }+06:00`
  ).toISOString();
};

export const getDateRange = (filter: string, start?: string, end?: string) => {
  const now = new Date();
  let startDate: string;
  let endDate: string;

  switch (filter) {
    case "today": {
      const s = new Date();
      const e = new Date();
      startDate = formatDateWithTZ(s, false);
      endDate = formatDateWithTZ(e, true);
      break;
    }
    case "week": {
      const first = new Date(now);
      const last = new Date(now);
      const day = now.getDay();
      const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Monday start
      first.setDate(diff);
      last.setDate(diff + 6);
      startDate = formatDateWithTZ(first, false);
      endDate = formatDateWithTZ(last, true);
      break;
    }
    case "month": {
      const first = new Date(now.getFullYear(), now.getMonth(), 1);
      const last = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      startDate = formatDateWithTZ(first, false);
      endDate = formatDateWithTZ(last, true);
      break;
    }
    case "custom": {
      startDate = new Date(`${start}T00:00:00+06:00`).toISOString();
      endDate = new Date(`${end}T23:59:59+06:00`).toISOString();
      break;
    }
    default: {
      const s = new Date(0);
      const e = new Date();
      startDate = formatDateWithTZ(s, false);
      endDate = formatDateWithTZ(e, true);
    }
  }

  return { startDate, endDate };
};
