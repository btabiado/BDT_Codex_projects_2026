# Assumptions

- The source workbook `shark_tank_MASTER_CLEAN.xlsx` is imported from `/Users/bryandtabiadon/Downloads/Claude Handoff/shark_tank_MASTER_CLEAN.xlsx`.
- The workbook's first note rows are skipped by reading `All_Pitches_Master` with `header=2`.
- One normalized row represents one company pitch.
- Multi-shark deals attribute full company revenue to every participating Shark for MVP rankings, matching the specification's allowed assumption.
- Guest Sharks are retained by the normalization layer, but the homepage focuses on the six recurring Sharks.
- The workbook does not include an industry column, so MVP industries are derived from company names and descriptions using deterministic keyword rules.
- Revenue values are parsed conservatively from currency strings and compact values such as `$12M`; undisclosed/TBD rows remain null.
- The user-facing build is dependency-free. The folder keeps the same module boundaries that can migrate into a Next.js app.
