
export default function formatDateTime(date: Date): string {
  const now = new Date();

  const isToday =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();

  const timeFormatter = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  const time = timeFormatter.format(date);

  if (isToday) {
    return `Today, ${time}`;
  }

  const dateFormatter = new Intl.DateTimeFormat("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "2-digit",
  });

  return `${dateFormatter.format(date)}, ${time}`;
}