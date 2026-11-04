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

## Resource Verification Procedure

All resources submitted to the Digital Forensics Resource Directory must undergo verification before inclusion.

The purpose of verification is to maintain an accurate, consistent and useful catalogue of digital forensics resources.

Verification confirms that the resource exists, is relevant, has been classified appropriately and contains reliable metadata. Inclusion does not constitute endorsement or independent validation of a resource's forensic accuracy.

### 1. Resource eligibility

Before adding a resource, confirm that:

- [ ] The resource is relevant to digital forensics, incident response, forensic research, education or a related discipline.
- [ ] The resource has a publicly accessible official website, repository or authoritative reference.
- [ ] The resource is not already listed under another name.
- [ ] The resource's purpose can be established from reliable information.
- [ ] The resource is suitable for inclusion in a directory that prioritises free and publicly accessible resources.

Preference should be given to official project websites, developer repositories, publisher pages and other authoritative sources.

### 2. Source verification

Verify the following information where applicable:

- [ ] Resource name and official URL.
- [ ] Author, developer, organisation or publisher.
- [ ] Resource purpose and advertised functionality.
- [ ] Supported operating systems or execution environments.
- [ ] Supported forensic analyses, evidence types or artefacts.
- [ ] Availability, maintenance status and relevant usage restrictions.
- [ ] Pricing and licensing information.

Do not infer functionality, compatibility or licensing permissions solely from a resource's name or category.

Use official documentation wherever possible.

### 3. Metadata and classification

Resource records must follow `templates/resource.yml` and use values defined in `taxonomy/vocabulary.yml`.

Check that:

- [ ] `name` accurately identifies the resource.
- [ ] `type` correctly describes the resource format or category.
- [ ] `description` is concise, factual and neutral.
- [ ] `domains` describes relevant forensic disciplines.
- [ ] `runs_on` identifies where a tool executes, when applicable.
- [ ] `analyses` identifies the evidence or environments a resource can analyse, when applicable.
- [ ] `artefacts` identifies relevant forensic artefacts or evidence types.
- [ ] Resource links and optional fields are appropriate to the resource type.

Apply the following distinctions consistently:

**Resource Type vs Domain:** Resource Type describes what the resource is (such as Tool, Website or Blog). Domain describes the forensic discipline it relates to.

**Domain vs Platform:** Windows Forensics describes a forensic discipline. Windows under `runs_on` indicates an execution environment.

**Website vs Blog:** Use the controlled vocabulary to distinguish general websites from blogs.

**Sample Evidence vs Dataset:** Classify these according to the resource's nature and intended use.

**Not applicable vs Unknown:** Omit or leave inapplicable optional fields empty as permitted by the schema. Do not invent values for information that cannot be verified.

### 4. Pricing and licensing

Pricing, source-code availability and commercial-use permissions are separate considerations.

- [ ] Verify the pricing model against an official source.
- [ ] Confirm whether source code is publicly available before marking a resource as open source.
- [ ] Record a specific licence only when supported by reliable information.
- [ ] Verify commercial-use permissions before recording them as permitted or prohibited.
- [ ] Leave unverified permissions unknown rather than making assumptions.

A resource being free of charge does not necessarily mean it is open source or permitted for unrestricted commercial use.

### 5. Status and verification date

Every accepted resource must include a `last_verified` date in `YYYY-MM-DD` format.

The date must reflect when the resource's information was actually checked, not when its YAML file was last edited.

Review the current availability and maintenance status, using the permitted values in the controlled vocabulary.

If a resource becomes unavailable, abandoned or discontinued, investigate before updating its status.

### 6. Validation before publication

After creating or modifying a YAML resource record:

- [ ] Confirm the file follows the resource template.
- [ ] Run the repository's automated resource validator.
- [ ] Resolve validation errors.
- [ ] Confirm that the resource appears correctly in the generated catalogue.
- [ ] Check the resource detail page and classification links.
- [ ] Verify that the Docusaurus production build succeeds.
- [ ] Submit or commit the verified changes.

Validation confirms that records meet technical and structural requirements. It does not replace manual verification of their factual accuracy.

### 7. Periodic review

Resource information should be reviewed periodically to reduce the risk of outdated links, classifications and compatibility information.

The initial target review interval is **180 days**.

During a review:

- [ ] Recheck official URLs.
- [ ] Confirm the resource remains available.
- [ ] Check for significant changes in functionality or supported platforms.
- [ ] Recheck pricing and licensing where relevant.
- [ ] Update descriptions and classifications if required.
- [ ] Update `last_verified` only after completing the review.

Automated link checking and stale-entry reports may identify resources requiring attention.

HTTP errors, temporary connection failures and rate limiting should be investigated rather than automatically treated as evidence that a resource has been discontinued.

### 8. Verification outcomes

A review may result in one of the following decisions:

- **Accept:** The resource meets the directory's requirements and can be published.
- **Request changes:** Additional information or corrections are needed.
- **Defer:** Important details cannot currently be verified.
- **Decline:** The resource is outside the directory's scope, is an unsuitable duplicate or fails its inclusion requirements.
- **Update existing record:** The resource is already listed and its metadata needs correction.

The reviewer should explain significant decisions in the associated GitHub Issue or pull request.

Verification is an ongoing process. Previously accepted resources may require updates or reconsideration as new information becomes available.