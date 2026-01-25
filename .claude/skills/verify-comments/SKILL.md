---
name: verify-comments
description: Scan codebase and fix comments that don't match the code
---

# Verify and Fix Code Comments

Scan the codebase module by module, verify that comments accurately reflect what the code does, and fix any mismatches.

## Workflow

### 1. DISCOVERY
- Identify all Python modules in the project (api/, agent/, tools/, storage/, tenants/, config/, scripts/)
- Create a todo list of modules to scan
- Skip test files and __pycache__

### 2. SCAN EACH MODULE
For each Python file, analyze:
- **Docstrings** (module, class, function/method level)
- **Inline comments** (# comments explaining code blocks)
- **Type hints** vs actual behavior (if comments reference types)

Check for these issues:
- Comment says one thing, code does another
- Outdated comments referencing removed/changed functionality
- Misleading parameter descriptions
- Incorrect return value descriptions
- Comments referencing old variable/function names
- TODOs that are already done

### 3. FIX MISMATCHES
For each issue found:
- Read the surrounding code carefully to understand actual behavior
- Update the comment to accurately reflect the code
- Preserve the original intent/style of commenting
- Do NOT add new comments where none existed
- Do NOT remove comments unless completely obsolete

### 4. TRACK CHANGES
Keep a record of every change:
- File path
- Original comment
- New comment
- Reason for change

### 5. OUTPUT SUMMARY TABLE
After all modules are scanned, print a markdown table:

```
## Comment Verification Summary

| File | Location | Original | Updated | Reason |
|------|----------|----------|---------|--------|
| agent/orchestrator.py:45 | `process_message` docstring | "Handles single message" | "Processes message with tool loop" | Added tool loop in recent update |
| ... | ... | ... | ... | ... |

**Total:** X comments fixed across Y files
```

If bugs are discovered during the scan, add a separate section:

```
## Bugs Found (not fixed - report only)

| File | Location | Issue |
|------|----------|-------|
| agent/profile_context.py:50 | `build_customer_context` | Uses `item.get('name')` but order items use `product_name` field |
| ... | ... | ... |
```

## Important Rules

1. **Read before edit** - Always read the full function/class before changing its comments
2. **Conservative changes** - Only fix comments that are clearly wrong, not style preferences
3. **No new comments** - This tool fixes existing comments, not adds documentation
4. **Preserve voice** - Keep the same tone/style as the original comment
5. **Context matters** - Consider the full file context before deciding a comment is wrong
6. **NEVER change code** - Only update comments/docstrings. If you find a bug where code doesn't match intent, report it in the summary table but do NOT fix the code itself. This skill is strictly for comment maintenance.
7. **Report bugs separately** - If code appears buggy (e.g., wrong field names, incorrect logic), add a "Bugs Found" section to the summary instead of changing the code

## Module Scan Order

Process in this order (core → periphery):
1. `storage/` - Data layer (models, repositories)
2. `tools/` - Agent tools
3. `agent/` - AI orchestration
4. `api/` - HTTP layer
5. `tenants/` - Multi-tenant config
6. `config/` - Business configs
7. `scripts/` - Utility scripts

## Example Issues to Catch

**Wrong behavior description:**
```python
# BAD: Comment says "returns None" but code returns empty list
def get_items(self):
    """Returns None if no items found."""  # WRONG
    return self.items or []  # Actually returns []
```

**Outdated parameter:**
```python
# BAD: Comment mentions removed parameter
def create_order(self, items, customer_id):
    """
    Create order with items and optional discount.  # discount param removed
    """
```

**Stale TODO:**
```python
# TODO: Add error handling  # Already has try/except below
try:
    ...
except Exception:
    ...
```

---

Begin scanning now. Use TodoWrite to track progress through modules.
