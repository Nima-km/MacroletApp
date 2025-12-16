export function formatAMPM(hours: number): string {
  let minutes = 0;
  const ampm = hours >= 12 ? 'PM' : 'AM';
  
  hours = hours % 12;
  hours = hours ? hours : 12; // 0 should be 12
  const strHours = hours < 10 ? '' + hours : hours.toString();
  const strMinutes = minutes < 10 ? '0' + minutes : minutes.toString();
  
  return `${strHours}:${strMinutes} ${ampm}`;
}

export function formatTime(timestamp: Date) {
  const result = (timestamp.getHours() < 10 ? '0': '') + timestamp.getHours().toString() + ':' + (timestamp.getMinutes() < 10 ? '0': '') + timestamp?.getMinutes().toString()
  return result
}