# 2026-03-15 — Admin module curation layer

## Completed
- Schema: learning_modules + published/displayOrder/nextModuleId; module_prerequisites table
- ModuleService: list/listPublished, publish/unpublish, update(displayOrder+nextModuleId), getPrerequisites/setPrerequisites
- Admin routes: PATCH (with new fields), POST publish/unpublish, GET/PUT prerequisites
- Learner endpoints: listPublished only; getModuleStudy gates on published; response includes nextModuleId
- ModuleManager UI: publish toggle, display order, next module selector, prerequisites checkbox panel
- LearnModule: "Next module →" button uses admin-set nextModuleId after passing practice

## What's still missing
- Prerequisites not enforced in learner flow (no learner progress tracking)
- Module admin doesn't show linked KB items inline (managed via item detail)
