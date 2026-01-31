---
name: commit-locally
description: Commit changes locally without pushing
---

# Commit Changes Locally

Commit all staged and unstaged changes to git without pushing to remote.

## Steps

1. **Analyze changes:**
   - Run `git status` to see all changed/untracked files
   - Run `git diff` to understand what changed

2. **Check README.md:**
   - Read README.md to understand current documentation granularity
   - Decide if the changes warrant a README update based on:
     - Is this a significant feature, new capability, or architectural change? → Update README
     - Is this a small fix, nit, or minor UI tweak? → Probably no README update needed
   - If README update is needed, make the update first

3. **Stage and commit:**
   - Stage ALL changes together (including README if updated)
   - Commit with format:
     ```
     [AISalesAgentsPlatform] <short description>

     <detailed explanation of what changed and why>
     ```

4. **Do NOT push** - this skill only commits locally
