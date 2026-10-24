# Contributing resources

Thanks for helping to build the Digital Forensics Resource Directory. Our goal is a **curated, searchable catalogue** of useful digital forensics tools, websites, blogs, training, datasets and related resources—not a general-purpose wiki.

## Add a resource

1. Check the `resources/` directory to avoid duplicates.
2. Copy `templates/resource.yml` to a new file at `resources/<resource-name>.yml`. Use lowercase letters, numbers and hyphens in filenames (for example, `resources/example-tool.yml`).
3. Fill in the resource's details. Use the exact vocabulary values in `taxonomy/vocabulary.yml` for `type`, `domains`, `runs_on`, `analyses`, `artefacts`, `pricing.model` and `status`.
4. Visit the official resource page, check the information you can verify and set `last_verified` to today's date in `YYYY-MM-DD` format, **quoted** (for example, `"2026-10-24"`). Never enter a verification date unless you performed the check.
5. Save the file, then propose the change through a pull request (or use GitHub's normal commit workflow if you maintain the repository). Explain why the resource belongs in the directory and mention anything uncertain.

### Required before publishing

- `name`: the resource's correct name
- `type`: at least one value from `resource_types`
- `description`: a brief, original summary of what the resource provides
- `website`: a working primary resource URL (usually the official site)
- `last_verified`: date the URL and core details were actually checked

Also include `domains` when possible and set `status` accurately. The other classification fields can be empty lists when they are not applicable or not yet established.

## How the fields work

| Field | Meaning |
| --- | --- |
| `type` | What kind of resource it is (usually one main type) |
| `domains` | Forensic disciplines covered, such as `Memory Forensics` |
| `runs_on` | Where software runs; `Browser` also applies to a locally run browser application |
| `analyses` | Technology or environment the resource examines; not where it runs |
| `artefacts` | Evidence/data types it helps examine, such as `Prefetch` or `PCAP` |
| `keywords` | Useful additional discovery terms; flexible, unlike the controlled lists |
| `pricing.model` | `Free`, `Paid`, `Freemium` or `Unknown` |
| `pricing.commercial_use` | `true`, `false`, or `null` when not established; free does **not** imply permitted commercial use |
| `open_source` | `true`, `false`, or `null` when unknown; do not infer from price |
| `licence` | Verified licensing label when known; otherwise leave blank |
| `status` | Activity/availability status from the controlled vocabulary |
| `last_verified` | Date core details were last **actually checked**, not the date the record was edited |

Use `[]` for an empty classification list; use `null` for unknown boolean-like values; use `""` for unknown optional text values. `last_verified: null` is allowed in the **blank template only**, not a published record. All dates use `YYYY-MM-DD`.

## A few quality rules

- Prefer original project sites, official documentation and primary repositories. Avoid dead or misleading links.
- Write descriptions in your own words; don't copy whole vendor descriptions.
- Do not guess platform support, permissions, licence, pricing or maintenance status.
- An old `last_verified` date calls for review; it does not automatically make the resource discontinued.
- Use broad artefact terms (for example, `Browser History`) rather than inventing product-specific artefacts (for example, `Chrome History`). Put relevant details in the description or keywords.
- If a category is missing, propose an update to `taxonomy/vocabulary.yml` and explain why an existing value is insufficient. Avoid changing old labels casually: it affects filtering across all records.

## Editing through the GitHub website

For beginners: open the repository, choose **Add file → Create new file**, and type a filename with its folder prefix, such as `templates/resource.yml`. GitHub will create the folder if needed. Paste the contents, then use **Commit changes**. Repeat for the other files, or upload the files using **Add file → Upload files** while inside the desired directory.

## Project stage

This is the first, deliberately small contribution standard. The website and automatic schema validation are still to come. We'll test the metadata against a small, varied set of real resources and refine the rules before scaling up.
