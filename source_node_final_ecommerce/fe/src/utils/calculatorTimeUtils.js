import { parseAsUTC } from "./formatTime";

// seconds, minutes, hours, days, input date UTC
const differenceIn= (date) => {
  const now = new Date();
  const diffInMs = Math.abs(now - date);
  
  const seconds = Math.floor(diffInMs / 1000);
  if (seconds < 60) return { value: seconds, unit: 'giây' };
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return { value: minutes, unit: 'phút' };
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return { value: hours, unit: 'giờ' };
  const days = Math.floor(hours / 24);
  return { value: days, unit: 'ngày' };
}

/** Hiển thị khoảng thời gian từ hiện tại đến dateInput kiểu "X phút/ngày/giờ trước" */
export const formatTimeAgo = (dateInput) => {
  if (!dateInput) return "—";
  let d;

  if (typeof dateInput === "string") {
    // YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateInput)) {
      // nếu coi ngày này là UTC:
      d = new Date(dateInput + "T00:00:00Z");
      // nếu muốn coi là 00:00 giờ VN: new Date(dateInput + "T00:00:00+07:00")
    } else {
      // ISO có giờ: dùng parseAsUTC (thêm Z nếu thiếu)
      d = parseAsUTC(dateInput);
    }
  } else {
    d = new Date(dateInput);
  }
  if (Number.isNaN(d.getTime())) return String(dateInput);

  const diff = differenceIn(d);
  return `${diff.value} ${diff.unit} trước`;
}