import type { Entry } from './gdoc.js';
import { Gdoc } from "./gdoc.js";
import type { MangaFetch } from "./suwayomi.js";
import { Suwayuomi } from "./suwayomi.js";
import type { Table } from "./utils.js";

function err({ error, hmr }: { error?: unknown; hmr: string }) {
  let err: string | null = null;
  if (error instanceof Error) err = error.message;
  if (typeof error === "string") err = error;
  return {
    success: false as false,
    error: hmr,
    originalError: err,
  };
}

function success<T>(data: T) {
  return {
    success: true as true,
    data,
  };
}


async function main(
  { fullURL, sheetId, sheetGid, mangadexOnly }: {
    fullURL: string;
    sheetId: undefined;
    sheetGid: undefined;
    mangadexOnly: boolean
  },
): Promise<{
    success: false;
    error: string;
    originalError: string | null;
} | {
    success: true;
    data: Table<true>;
}>
async function main(
  { fullURL, sheetId, sheetGid, mangadexOnly }: {
    fullURL: string;
    sheetId: string | undefined;
    sheetGid: number | undefined;
    mangadexOnly: boolean
  },
): Promise<{
    success: false;
    error: string;
    originalError: string | null;
} | {
    success: true;
    data: Table<true>;
}> {
  let url: URL;
  
  if (!sheetId || !sheetGid) {
    sheetId = '1vxvAHxmLLgAEEq-jWbDw5fxHMdz1N_PNWe3OPXtrin0'
    sheetGid = 0
  }

  try {
    url = new URL(fullURL);
    url.search = "";
    const splitPath = url.pathname.split("/").filter(Boolean);
    url.pathname = splitPath.length > 0 ? splitPath[0] ?? '/' : "/";
    url.hash = "";
  } catch (error) {
    return err({ error, hmr: "Invalid SUWAYOMI URL" });
  }

  let graphql_url: URL;
  let csv_url: URL;

  try {
    graphql_url = new URL(url.toString());
    graphql_url.pathname = graphql_url.pathname === "/"
      ? "/api/graphql"
      : `${graphql_url.pathname}/api/graphql`;
    csv_url = new URL(
      `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&id=${sheetId}&gid=${sheetGid}`,
    );
  } catch (error) {
    return err({ error, hmr: "Invalid Sheet ID/GID" });
  }

  const suwayomi = new Suwayuomi(graphql_url);
  const gdoc = new Gdoc(csv_url);

  let gSheet: Entry[];

  try {
    gSheet = await gdoc.do();
  } catch (error) {
    return err({ error, hmr: "Could not retrieve google sheet's data" });
  }

  let local: MangaFetch[];

  try {
    local = await suwayomi.do(mangadexOnly);
  } catch (error) {
    return err({ error, hmr: "Could not retrieve Suwayomi instance's data" });
  }

  try {
    const res = local
      .map((v) => {
        let type: Table[0]["Detection type"] = "NONE";

        if (gSheet.some((x) => v.realUrl.includes(x.uuid))) type = "DMCA";
        else if (v.missingPercent > 0) type = "SUSPICIOUS";
        

        return {
          "Title": v.title,
          "Categories": v.categories,
          "Source": v.source,
          "Reading status": v.status,
          "Thumbnail": v.thumbnailUrl,
          "Detection type": type,
          "Missing chaps (%)": v.missingPercent,
          "URL": `${url.origin}/manga/${v.id}`,
        };
      })
      .filter((v) => v["Detection type"] !== "NONE") as Table<true>;
    return success(res);
  } catch (error) {
    return err({ error, hmr: "Failed to build the table" });
  }
}

export type { Table } from "./utils.ts";
export { main };