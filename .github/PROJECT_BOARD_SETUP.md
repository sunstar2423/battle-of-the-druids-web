# GitHub Project Board Setup Guide

This guide helps you set up project boards for Titanblade Games development tracking.

## 📋 Recommended Project Boards

### 1. Main Development Board
**Name:** "Titanblade Games Development"
**Purpose:** Track feature development, bug fixes, and general improvements

**Columns:**
1. **📥 Backlog** - Planned features and identified issues
2. **🔄 In Progress** - Currently being worked on
3. **👀 Review** - Awaiting code review or testing
4. **✅ Done** - Completed and merged

**Configuration:**
- Link to repository: `sunstar2423/titanblade-games`
- Auto-add issues: Enable
- Auto-add pull requests: Enable

### 2. Game-Specific Boards (Optional)

#### Battle of the Druids Board
**Name:** "Battle of the Druids Roadmap"
**Columns:**
1. **🎮 Gameplay Features** - New game mechanics
2. **🎨 Visual Improvements** - Graphics and UI enhancements  
3. **🔧 Technical Debt** - Code improvements and optimizations
4. **🐛 Bug Fixes** - Known issues and fixes
5. **✅ Completed** - Finished features

#### Isle of Adventure Board
**Name:** "Isle of Adventure Development"
**Columns:**
1. **📖 Story Content** - New scenes and narrative
2. **🧩 Puzzles & Mechanics** - Game logic improvements
3. **🎵 Audio/Visual** - Music and graphics
4. **🔄 In Development** - Active work
5. **✅ Ready for Release** - Completed features

## 🛠️ Manual Setup Instructions

### Using GitHub Web Interface

1. **Navigate to Projects**
   - Go to `https://github.com/sunstar2423/titanblade-games`
   - Click the "Projects" tab
   - Click "New project"

2. **Create Board**
   - Choose "Board" template
   - Enter project name and description
   - Set visibility to "Private" or "Public" as desired

3. **Configure Columns**
   - Delete default columns
   - Add columns as specified above
   - Configure automation rules for each column

4. **Set Up Automation**
   - **Backlog**: Auto-add new issues
   - **In Progress**: Move here when assignee is added
   - **Review**: Move here when PR is opened
   - **Done**: Move here when issue is closed/PR is merged

### Using GitHub CLI (After Authentication)

```bash
# Create main development board
gh project create --owner sunstar2423 --title "Titanblade Games Development"

# Add items to project (replace PROJECT_ID with actual ID)
gh project item-add PROJECT_ID --owner sunstar2423 --repo titanblade-games --content-type issue

# Create custom fields (examples)
gh project field-create PROJECT_ID --name "Priority" --data-type "single_select" --option "High" --option "Medium" --option "Low"
gh project field-create PROJECT_ID --name "Game" --data-type "single_select" --option "Battle of Druids" --option "Isle of Adventure" --option "Doom Riders" --option "General"
```

### Using GitHub API (Advanced)

```bash
# Create project via API
curl -X POST \\
  -H "Accept: application/vnd.github+json" \\
  -H "Authorization: Bearer $GITHUB_TOKEN" \\
  https://api.github.com/repos/sunstar2423/titanblade-games/projects \\
  -d '{
    "name": "Titanblade Games Development",
    "body": "Project board for tracking game development and improvements"
  }'
```

## 🏷️ Recommended Labels for Issues

Create these labels in your repository for better organization:

### Priority Labels
- `priority:high` - Critical issues requiring immediate attention
- `priority:medium` - Important features or significant bugs  
- `priority:low` - Nice-to-have improvements

### Game Labels
- `game:battle-of-druids` - Specific to Battle of the Druids
- `game:isle-of-adventure` - Specific to Isle of Adventure
- `game:doom-riders` - Specific to Doom Riders
- `game:general` - Affects multiple games or infrastructure

### Type Labels
- `type:feature` - New feature requests
- `type:bug` - Bug reports
- `type:enhancement` - Improvements to existing features
- `type:docs` - Documentation updates
- `type:security` - Security-related issues

### Status Labels
- `status:needs-design` - Requires design work
- `status:needs-feedback` - Waiting for user/maintainer input
- `status:blocked` - Cannot proceed due to dependencies
- `status:help-wanted` - Looking for contributors

## 🔄 Workflow Automation

### GitHub Actions Integration

Add this to your workflow files to automatically move project cards:

```yaml
- name: Move to In Progress
  if: github.event.action == 'assigned'
  uses: alex-page/github-project-automation-plus@v0.8.1
  with:
    project: Titanblade Games Development
    column: In Progress
    repo-token: ${{ secrets.GITHUB_TOKEN }}

- name: Move to Done
  if: github.event.action == 'closed'
  uses: alex-page/github-project-automation-plus@v0.8.1
  with:
    project: Titanblade Games Development
    column: Done
    repo-token: ${{ secrets.GITHUB_TOKEN }}
```

### Project Templates

Save common project configurations:

```json
{
  "name": "Game Feature Template",
  "columns": [
    {"name": "📋 Planning", "preset": "todo"},
    {"name": "🔄 Development", "preset": "in_progress"},
    {"name": "🧪 Testing", "preset": "review"},
    {"name": "✅ Complete", "preset": "done"}
  ],
  "automation": {
    "todo": "auto_add_issues",
    "in_progress": "auto_assign",
    "review": "auto_pr",
    "done": "auto_close"
  }
}
```

## 📊 Project Metrics and Reports

### Useful Views to Create

1. **Sprint Planning View**
   - Filter by priority and assignee
   - Group by game/component
   - Sort by due date

2. **Bug Triage View**  
   - Filter by `type:bug` label
   - Group by priority
   - Sort by creation date

3. **Feature Roadmap View**
   - Filter by `type:feature` label
   - Group by milestone
   - Sort by priority

### Automation Rules

Set up these automation rules for efficient project management:

- **New Issue** → Add to Backlog
- **Issue Assigned** → Move to In Progress  
- **PR Opened** → Move to Review
- **PR Merged** → Move to Done
- **Issue Closed** → Move to Done

## 🔗 Integration with Other Tools

### Link to Development Workflow
- Connect issues to pull requests automatically
- Reference issues in commit messages using `#issue-number`
- Use keywords like "Fixes #123" to auto-close issues

### Connect to Documentation
- Link project items to wiki pages
- Reference documentation in issue descriptions
- Update project status in README badges

---

**Next Steps:**
1. Create the main "Titanblade Games Development" project board
2. Set up basic automation rules
3. Add existing issues to the board
4. Configure labels and milestones
5. Start using the board for all development work

This project board system will help track progress, prioritize work, and maintain visibility into the development process across all Titanblade Games projects.