import { stringify } from 'csv/browser/esm/sync';

export type Table<T extends boolean = false> = {
  Title: string;
  Categories: string[] | undefined;
  Thumbnail: string;
  "Source": string,
  "Reading status": string;
  "Detection type": T extends false ? "NONE" | "SUSPICIOUS" | "DMCA"
    : "SUSPICIOUS" | "DMCA";
  "Missing chaps (%)": number;
  URL: string;
}[];

export const ERROR = `Usage: node index.js "<SUWAYOMI_URL>"

If your Suwayomi server requires basic authentication, include it in the URL:
  e.g. http://username:password@127.0.0.1:4567`;

export function printError(
  e: unknown,
  additionalMessage?: { text: string; position: 0 | 1 },
) {
  let message = "";
  if (!e) return;
  else if (e instanceof Error) message = e.message;
  else if (typeof e === "string") message = e;
  else return;

  if (!message.length) return;

  if (!additionalMessage) message = message; // lol
  else if (additionalMessage?.position === 0) {
    message = `${additionalMessage.text}: ${message}`;
  } else if (additionalMessage?.position === 1) {
    message = `${message}: ${additionalMessage.text}`;
  }

  console.error(`${message}
____
${ERROR}`);
}

export function toCSV(results: Table): string {
  return stringify([
    Object.keys(results[0]).filter(v => v !== 'Thumbnail'),
    ...results.map((item) => [
      item.Title,
      item.Categories?.join(" "),
      item.Source,
      item["Reading status"],
      item["Detection type"],
      item["Missing chaps (%)"],
      item.URL,
    ]),
  ]);
}

export function truncateString(str: string, maxLength: number): string {
  if (str.length <= maxLength) {
    return str;
  }
  let truncated = str.substring(0, maxLength);
  let lastSpaceIndex = truncated.lastIndexOf(" ");
  let lastCommaSpaceIndex = truncated.lastIndexOf(", ");

  // Vérifier si la chaîne tronquée se termine par une virgule
  if (lastCommaSpaceIndex > 0 && lastCommaSpaceIndex + 1 === lastSpaceIndex) {
    truncated = truncated.substring(0, lastCommaSpaceIndex);
  } else if (lastSpaceIndex > 0) {
    truncated = truncated.substring(0, lastSpaceIndex);
  }

  return truncated + "…";
}
