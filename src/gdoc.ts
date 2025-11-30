import { parse } from 'csv/browser/esm/sync';

export type Entry = {
  title: string;
  originalTitle: string;
  uuid: string;
};

export class Gdoc {
  #CSV_URL: URL;
  constructor(CSV_URL: URL) {
    this.#CSV_URL = CSV_URL;
  }

  async #fetch(): Promise<string> {
    try {
      const res = await fetch(this.#CSV_URL);
      if (!res.ok) throw new Error(res.statusText);
      return res.text();
    } catch (e) {
      throw e;
    }
  }

  async #parse(text: string): Promise<Entry[]> {
    try {
      const records: string[][] = parse(text);
      const sliced = records.slice(2); // start from A3
      const data: Entry[] = [];

      for (const row of sliced) {
        const [title, originalTitle, uuid] = row;

        if (title && originalTitle && uuid) {
          data.push({ title, originalTitle, uuid });
        }
      }

      return data;
    } catch (e) {
      throw e;
    }
  }

  async do(): Promise<Entry[]> {
    try {
      const data = await this.#fetch();
      return this.#parse(data);
    } catch (e) {
      throw e;
    }
  }
}
