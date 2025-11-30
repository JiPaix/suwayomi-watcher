# suwayomi-watcher

Web & CLI utility for identifying manga entries in your Suwayomi library that
are either missing chapters or have been removed due to takedowns.

It uses a community-maintained Google Sheet —
[**“The MangaDex Massacre”**](https://docs.google.com/spreadsheets/d/1vxvAHxmLLgAEEq-jWbDw5fxHMdz1N_PNWe3OPXtrin0)
— which lists entries under DMCA notices.

Entries are flagged in two categories:

- **DMCA**: entries that are part of the DMCA list.
- **SUSPICIOUS**: entries that miss more than 10% of their chapters.

---

## 🌐 Web Interface (Recommended)

No installation needed—open your browser for a full GUI experience:

[https://mangadex.jipai.fr](https://mangadex.jipai.fr)

- Interactive GUI for selecting your Suwayomi instance
- Displays all results in a sortable table

<details>
  <summary><h3>📸 Screenshots</h3></summary>

<br/>

![Step 1](./docs/step1.png)\
_Step 1: Open the interface and select your Suwayomi instance_

<br/>

![Step 2](./docs/step2.png)\
_Step 2: Select the Google Sheet source (or use the one by default)_

<br/>

![Step 3](./docs/step3.png)\
_Step 3: Explore the list_

</details>

---

## 📦 CLI
see the [client's README](./src/README.md)