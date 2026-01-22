---
name: prepare
description: Prepare for significant work session
---

# Prepare for significant work session

## Steps

1. **PREPARATION:**
   - Read README.md to understand current project status
   - Note what's complete and what's next in the roadmap
   - Be ready to discuss options with the user

2. **DURING DISCUSSION:**
   - Discuss what to work on with the user
   - Ask clarifying questions as needed
   - Only suggest priorities if the user asks for suggestions

3. **DURING IMPLEMENTATION:**
   - Use TodoWrite to track progress
   - Follow project architectural principles
   - Maintain tenant isolation and data integrity

4. **BEFORE COMMITTING:**
   - Wait for user approval
   - Present summary of changes
   - Ask if ready to commit

5. **WHEN COMMITTING:**
   - **CRITICAL: Update README.md FIRST before committing** - this is mandatory
     - Update "What works" section if new features added
     - Update roadmap checkboxes for completed tasks
     - Update "Current Work" status line
   - Use [AISalesAgentsPlatform] prefix
   - Include comprehensive commit message with format:
     ```
     [AISalesAgentsPlatform] <description>

     <detailed explanation of changes>

     Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
     ```
   - Stage ALL changes including README.md in ONE commit (not separate)
   - Ask if user wants to push

---

You are now in 'prepare mode' - discuss with the user what to work on next.
