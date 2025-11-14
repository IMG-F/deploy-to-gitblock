**Overview**
- **Purpose:** This repository implements a GitHub Action that uploads Scratch (.sb3) projects to GitBlock and publishes them. The action runs Node (see `action.yaml`) and the runtime entrypoint is `dist/index.js` produced by `ncc`.

**Architecture & Key Files**
- **Action manifest:** `action.yaml` — lists inputs required by the action (`projectId`, `sb3FilePath`, `username`, `password`, etc.).
- **Action entry:** `dist/index.js` — compiled bundle used at runtime. Source is `src/main.js`.
- **API helpers & flows:** `src/public/*.js` contains upload/update flows (`uploadProject.js`, `uploadAssets.js`, `publish.js`, `updateTitle.js`, `updateDescp.js`, `updateTags.js`, `login.js`). Look here to follow the request sequences.
- **Utils:** `src/utils/request.js` and `src/utils/secret.js` — centralised HTTP and credential handling.

**Build / Run / Test**
- Build: `npm run build` — runs `ncc build src/main.js -o dist`. Always build before publishing the action so `dist/index.js` matches `src/`.
- Local run (simulate inputs): set `INPUT_` env vars used by `@actions/core` and run the bundle:
  ```bash
  INPUT_PROJECTID=1409826 \
  INPUT_SB3FILEPATH=./test/KanonBloss.sb3 \
  INPUT_USERNAME=myuser \
  INPUT_PASSWORD=mypwd \
  node dist/index.js
  ```
- Notes: `@actions/core.getInput('name')` reads from env vars named `INPUT_<UPPERCASE_NAME>`. Passing `GITHUB_*` environment variables may be required for code paths that read `context`.

**Conventions & Patterns**
- Inputs vs secrets: the action exposes `username`/`password` as inputs in `action.yaml`. Workflows should pass `secrets.GITBLOCK_USERNAME` and `secrets.GITBLOCK_PASSWORD` into these inputs (example: `.github/workflows/deploy-to-gitblock.yml`).
- Compiled dist checked in: the action uses `dist/index.js` at runtime. Source changes in `src/` require re-building `dist/` before release.
- HTTP flows are centralised in `src/utils/request.js` — prefer following its pattern (retry, headers, JSON body) when adding new calls.

**Developer Workflows**
- To prepare a release branch:
  1. Update `src/` code.
 2. Run `npm run build` and verify `dist/index.js` changed.
 3. Commit `src/` and `dist/` together.
- To run the action in CI: use a workflow like `.github/workflows/deploy-to-gitblock.yml` and pass credentials as repository secrets:
  ```yaml
  with:
    username: "${{ secrets.GITBLOCK_USERNAME }}"
    password: "${{ secrets.GITBLOCK_PASSWORD }}"
  ```

**Integration Points / External Dependencies**
- Relies on network APIs exposed by GitBlock — see request patterns in `src/public/*.js`.
- Uses `@vercel/ncc` for bundle; runtime deps include `@actions/core`, `axios`, `archiver`, `unzipper`.

**When You Edit**
- If you change action inputs in `action.yaml`, update all workflows under `.github/workflows/` and update local run examples.
- If you add new HTTP flows, extend `src/utils/request.js` or follow its conventions to keep consistent error handling.

**Quick References**
- Entry: `src/main.js` -> build -> `dist/index.js`
- Manifest: `action.yaml`
- Workflow example: `.github/workflows/deploy-to-gitblock.yml`

If any section is unclear or you want more examples (unit tests, local runner script, or a Docker-based integration test), tell me which area to expand.
