#!/usr/bin/env bash
# drizzle-kit push wrapper.
# drizzle-kit uses CJS require() for TS files and cannot resolve .js imports.
# This script temporarily strips .js from cross-schema imports, pushes, then restores.
set -euo pipefail

SCHEMA_DIR="src/db/schema"
FILES=(content-chunks.ts kb-revisions.ts lesson-links.ts workflow.ts ingestion-jobs.ts topics.ts quiz-candidates.ts learner-progress.ts groups.ts practice-attempts.ts module-assignments.ts packages.ts auth.ts admin-auth.ts content-blocks.ts access-tiers.ts ttx.ts)

strip_js() {
  for f in "${FILES[@]}"; do
    sed -i.bak "s/from '\(\.\/[^']*\)\.js'/from '\1'/g" "$SCHEMA_DIR/$f"
  done
  sed -i.bak "s/from '\(\.\/[^']*\)\.js'/from '\1'/g" src/db/schema/index.ts
}

restore_js() {
  for f in "${FILES[@]}"; do
    [[ -f "$SCHEMA_DIR/$f.bak" ]] && mv "$SCHEMA_DIR/$f.bak" "$SCHEMA_DIR/$f"
  done
  [[ -f src/db/schema/index.ts.bak ]] && mv src/db/schema/index.ts.bak src/db/schema/index.ts
}

trap restore_js EXIT

strip_js
npx drizzle-kit push --config drizzle.config.ts
