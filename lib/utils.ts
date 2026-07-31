import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format as dateFnsFormat } from "date-fns"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatIST(dateInput: string | Date, formatStr: string = "PPP 'at' p") {
  // Convert the input to a Date object
  const date = new Date(dateInput);
  
  // Format the date strictly in Asia/Kolkata timezone using Intl.DateTimeFormat
  // Since date-fns inherently uses the system's local timezone (which is often UTC on servers like Vercel),
  // we shift the UTC time to IST manually to ensure date-fns formats it as if the system was in IST.
  
  // Get the UTC time in milliseconds
  const utcTime = date.getTime();
  
  // Create a formatter that gives us the exact date and time parts in IST
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric', month: 'numeric', day: 'numeric',
    hour: 'numeric', minute: 'numeric', second: 'numeric',
    hour12: false
  });
  
  // Format to a string like "MM/DD/YYYY, HH:MM:SS"
  const istDateString = formatter.format(date);
  
  // Parse that string back into a Date object (this tells the system "treat this IST time as local")
  const localIstDate = new Date(istDateString);
  
  // Now pass this "shifted" date to date-fns
  return dateFnsFormat(localIstDate, formatStr);
}

export function calculateReadingTime(html: string): number {
  if (!html) return 1;
  const text = html.replace(/<[^>]+>/g, " ");
  const words = text.trim().split(/\s+/).length;
  const readingTime = Math.ceil(words / 200);
  return readingTime > 0 ? readingTime : 1;
}
