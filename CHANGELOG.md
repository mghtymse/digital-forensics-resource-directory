# Changelog

All notable changes to the Digital Forensics Resource Directory are documented here.

## [0.6.0] — 2026-11-27

### Added
- Expanded the catalogue from 50 to 100 unique digital forensics resources.
- Added coverage for Windows, macOS, Linux, Android and iOS forensic examination.
- Expanded disk, filesystem, mobile, database, multimedia, cloud, network and specialist forensic resources.
- Introduced the **Forensic Tool Validation** and **Document Forensics** domains.
- Added forensic datasets, sample evidence, benchmarking tools and research references.
- Added `scripts/audit_resources.py` for advisory metadata quality checks.

### Improved
- Strengthened duplicate detection using normalised resource names.
- Added warnings for shared website and repository URLs.
- Consolidated validation warnings and failures into an end-of-run summary.
- Improved resource licensing, commercial-use and maintenance classifications.
- Resolved duplicate catalogue entries.

### Validation
- 100 resources passed metadata validation.
- 180 link checks passed with zero errors.
- No resources overdue for verification.
- All 10 Playwright regression tests passed.
- Production build and public website functionality verified.

### Known Review Items
- 19 advisory metadata flags remain across 16 resources for future review.
