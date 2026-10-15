# Implementation and verification

Updated: 15 October 2026. TypeScript refactor: version 1.1.0.

Implemented the four-step AHP–TOPSIS flow, minimal criterion templates, benefit/cost directions, stable IDs, live priorities/consistency, cards/table input, review, rankings, comparison of raw facts, calculation matrices, sensitivity scenarios, local drafts, JSON import/export, and Markdown reporting.

## Verification performed

- 22 automated TypeScript tests passed: the 19 original calculation/regression checks plus draft persistence, storage failure propagation, and malformed JSON validation. The original supplier result remains 0.998424091203373 for Supplier B.
- Strict TypeScript checking, unused-symbol checking, and the Vite production build passed. Application and test source files are TypeScript; there is no duplicate hand-maintained JavaScript calculation implementation.
- Local browser checks passed: four steps, cards/table switching, blank validation, supplier ranking, six calculation tables, sensitivity, responsive width at 390 px, Markdown download, JSON export, stale report blocking, recalculation, identical inputs, draft restoration, invalid import preserving the draft, and no page errors.
- Screenshots were visually inspected at desktop and mobile sizes.
- In one local Node run, 100 alternatives × 10 criteria plus 20 sensitivity scenarios took about 11 ms. This is a calculation-only measurement on this machine, not a guarantee for every browser/device.

## Implementation choices

- TypeScript source uses native DOM rendering and Vite for development and production bundling. One dependency installation is required; runtime use has no external CDN dependency. Production output is a static website in dist/.
- Calculations, project/import validation, numerical parsing, draft persistence, reporting, HTML helpers, page rendering, and browser event handling have separate typed modules. Public data types describe projects, criteria, alternatives, and calculation results.
- The existing version-1 project format, localStorage draft key, RI table, tolerances, formulas, and result interpretation are preserved. Imported JSON is checked as unknown data before creating a typed project.
- App language is English as specified for MVP.
- Fields accept decimal-point numbers without grouping separators. Scientific notation is supported for finite values. A value such as 1.000 means 1; helper text and interpreted value make the convention explicit.
- Completely identical input produces shared rank 1 and undefined closeness (—), rather than assigning arbitrary scores.
- Report values retain significant precision for reproducibility. UI uses shorter rounded numbers.
- Project drafts preserve partially typed invalid numeric values for correction; strict file import rejects invalid values before replacing the current project.

## Product boundaries

The calculator has no accounts, backend, currency/unit conversion, eligibility filtering, or alternate normalization modes. Rankings are conditional on stated priorities, included alternatives, and the TOPSIS geometry. Relative closeness is not confidence or accuracy. A prototype calculation and passing fixtures do not validate every real-world decision context.
