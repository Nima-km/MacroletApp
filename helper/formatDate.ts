const daysOfWeek = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
];
const monthsOfYear = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
];

export function formatDate(date: Date) {
    const today = new Date();
    var day = daysOfWeek[date.getDay()];
    if (
        today.getDate() == date.getDate() &&
        today.getMonth() == date.getMonth() &&
        today.getFullYear() == date.getFullYear()
    )
        day = "Today";
    return (
        day +
        ", " +
        monthsOfYear[date.getMonth()] +
        " " +
        date.getDate().toString()
    );
}
