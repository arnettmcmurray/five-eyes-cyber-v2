# Smoke Test Checklist

## Admin auth
- Admin login works via password only
- Admin is blocked from OTP‑only learner flow
- Admin lands in admin dashboard
- Refresh preserves admin context

## Learner auth
- Non‑admin OTP send works
- OTP login works
- Learner logout works
- Learner cannot access admin routes
- Refresh preserves learner context

## Learner flow
- Modules load
- Quizzes load
- Weak‑answer path gives useful feedback
- Result/failure flow teaches, not dead‑ends
- Progress persists

## KB/Governance flow
- Learner sees only learner‑safe content
- Draft content is not exposed
- Publish without lineage is blocked
- Publish with lineage works
- Governance pages load

## Admin truth
- Admin sees real score/progress reflections
- Admin data is not fake/stubbed
- Content control pages load
- Package/pricing/content control routes behave
