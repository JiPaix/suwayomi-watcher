# suwayomi-watcher

A Node.js & CLI utility for analyzing your **Suwayomi** library and detecting:

- Manga entries missing a significant number of chapters  
- MangaDex titles affected by DMCA takedowns (via a community-maintained list)

The library supports **all sources**, but **DMCA detection only applies to MangaDex**.  
Other sources are flagged as **SUSPICIOUS** if they are missing more than 10% of chapters.

---

## ✨ Features

- ✅ Fetches and analyzes your Suwayomi library  
- ✅ Detects **DMCA-listed MangaDex titles**  
- ✅ Detects **SUSPICIOUS titles** (>10% missing chapters)  
- ✅ Supports **all sources** (MangaDex, MangaSee, MangaLife, etc.)  
- ✅ Outputs a structured result array  
- ✅ Saves results to `./suwayomi.csv`  
- ✅ Provides both a CLI and a programmatic API  

---

## 📦 Installation

```cmd
npm install suwayomi-watcher
```

Or with bun:

```cmd
bun add suwayomi-watcher
```

---

## 🖥️ CLI Usage

Run directly with npx:

```cmd
npx suwayomi-watcher "http://127.0.0.1:4567"
```

With authentication:

```cmd
npx suwayomi-watcher "http://username:password@127.0.0.1:4567"
```

This generates:

- A console table  
- A CSV file saved as `./suwayomi.csv`

### Example output
| Title                      | Categories     | Thumbnail                     | Source     | Reading status | Detection type | Missing chaps (%) | URL                                      |
|---------------------------|----------------|--------------------------------|------------|----------------|----------------|--------------------|-------------------------------------------|
| DMCA-Listed Manga         | Drama          | /api/v1/manga/11111/cover.png | MangaDex   | COMPLETED      | DMCA           | 100.00             | http://127.0.0.1:4567/manga/11111         |
| Manga >10% Missing chaps  | Action, Shonen | /api/v1/manga/22222/cover.png | MangaSee   | ONGOING        | SUSPICIOUS     | 41.20              | http://127.0.0.1:4567/manga/22222         |

```cmd
CSV saved to ./suwayomi.csv
```

---

## 📘 API

### `main(options)`

```ts
export function main({
  fullURL,
  sheetId,
  sheetGid,
  mangadexOnly
}: {
  fullURL: string;
  sheetId: string | undefined;
  sheetGid: number | undefined;
  mangadexOnly: boolean;
}): Promise<
  | {
      success: false;
      error: string;
      originalError: string | null;
    }
  | {
      success: true;
      data: Table<true>;
    }
>;
```

### `Table<T>`

```ts
export type Table<T extends boolean = false> = {
  Title: string;
  Categories: string[] | undefined;
  Thumbnail: string;
  Source: string;
  "Reading status": string;
  "Detection type": T extends false
    ? "NONE" | "SUSPICIOUS" | "DMCA"
    : "SUSPICIOUS" | "DMCA";
  "Missing chaps (%)": number;
  URL: string;
}[];
```

### Example
```ts
import { main } from "suwayomi-watcher";

async function run() {
  const pull = await main({
    fullURL: "http://127.0.0.1:4567",
    sheetId: "YOUR_SHEET_ID", // leave empty to use defaut
    sheetGid: 0,
    mangadexOnly: false
  });

  if (!pull.success) {
    console.error("Error:", pull.error);
    if (pull.originalError) {
      console.error("Details:", pull.originalError);
    }
    return;
  }

  // Example: convert missing chapters ratio → percentage
  const processed = pull.data.map(entry => ({
    ...entry,
    "Missing chaps (%)": Number(
      (
        (entry["Detection type"] === "DMCA" ? 1 : entry["Missing chaps (%)"]) *
        100
      ).toFixed(2)
    )
  }));

  console.table(processed);
}

run();
```
### Detection rules

- **DMCA** → Only for MangaDex titles listed in the community DMCA spreadsheet  
- **SUSPICIOUS** → Any source missing **>10%** of chapters


