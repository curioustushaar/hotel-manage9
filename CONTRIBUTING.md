# 🤝 Contributing Guidelines

Thank you for considering contributing to Hotel Management System! This document provides guidelines and instructions for contributing.

---

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Commit Messages](#commit-messages)
- [Pull Requests](#pull-requests)
- [Reporting Issues](#reporting-issues)

---

## Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inspiring community for all.

### Expected Behavior

✅ **DO:**
- Use welcoming and inclusive language
- Be respectful of differing opinions
- Accept constructive criticism
- Focus on what is best for the community
- Show empathy towards other community members

❌ **DON'T:**
- Use offensive language
- Engage in harassing behavior
- Tolerate exclusionary remarks
- Attack individuals for their opinions
- Be rude or dismissive

---

## Getting Started

### 1. Fork the Repository

```bash
# Visit GitHub repo and click "Fork" button
# This creates your personal copy
```

### 2. Clone Your Fork

```bash
git clone https://github.com/YOUR_USERNAME/Hotel-Management.git
cd Hotel-Management
```

### 3. Add Upstream Remote

```bash
# Add original repo as upstream
git remote add upstream https://github.com/curioustushaar/Hotel-Management.git

# Verify remotes
git remote -v
# origin    -> your fork
# upstream  -> original repo
```

### 4. Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend (in new terminal from root)
npm install
```

---

## Development Workflow

### Step 1: Create Feature Branch

```bash
# Update main branch
git checkout main
git pull upstream main

# Create feature branch
git checkout -b feature/YourFeatureName

# Examples:
# git checkout -b feature/add-room-validation
# git checkout -b feature/improve-login
# git checkout -b bugfix/fix-cors-issue
```

### Step 2: Make Changes

1. **Edit files** as needed
2. **Test locally** to ensure code works
3. **Follow coding standards** (see below)
4. **Write clear code** with comments where needed

### Step 3: Commit Changes

```bash
# Stage changes
git add .

# Commit with descriptive message (see Commit Messages section)
git commit -m "feat: add room validation"

# Multiple commits are OK for complex features
git commit -m "feat: add room validation"
git commit -m "test: add room validation tests"
```

### Step 4: Push to Your Fork

```bash
git push origin feature/YourFeatureName
```

### Step 5: Create Pull Request

1. Go to original repo: https://github.com/curioustushaar/Hotel-Management
2. Click **"Compare & pull request"** button
3. Select **base branch** `main`
4. Select **compare branch** `feature/YourFeatureName`
5. Write **descriptive PR title and description**
6. Click **"Create pull request"**

### Step 6: PR Review & Merge

- Maintainers will review your PR
- Respond to feedback and make changes if needed
- Once approved, PR will be merged
- Delete your feature branch after merge

---

## Coding Standards

### React/JSX

**File Naming:**
```
PascalCase for components: MyComponent.jsx
camelCase for utilities: helper.js

Example:
✅ UserProfile.jsx
✅ getUserData.js
❌ user-profile.jsx
❌ GetUserData.js
```

**Component Structure:**
```jsx
// ✅ Good
import React, { useState } from 'react';
import './MyComponent.css';

export default function MyComponent() {
    const [state, setState] = useState(null);

    return (
        <div className="my-component">
            {/* content */}
        </div>
    );
}

// ❌ Bad
export default function mycomponent() {
    // no imports
    // unclear naming
}
```

### JavaScript/Node.js

**Variable Naming:**
```javascript
// ✅ Good - descriptive names
const userEmail = 'user@example.com';
const isUserActive = true;
const calculateTotalPrice = (items) => {...};

// ❌ Bad - unclear names
const x = 'user@example.com';
const a = true;
const calc = (i) => {...};
```

**Arrow Functions vs Regular:**
```javascript
// ✅ Use arrow functions
const handleClick = () => {...};
array.map((item) => item.id);

// ✅ Use regular for constructors
function User(name) {
    this.name = name;
}
```

### CSS/Styling

**Naming Convention:**
```css
/* ✅ Good - BEM notation */
.button { }
.button__primary { }
.button--disabled { }

/* ✅ Good - descriptive names */
.navbar-header { }
.card-content { }

/* ❌ Bad - vague names */
.style1 { }
.big { }
.red-text { }
```

### Comments

```javascript
// ✅ Good - explain WHY
// User must be authenticated before accessing dashboard
if (!user.isAuthenticated) {
    return <LoginPage />;
}

// ✅ Good - complex logic
// Calculate discount: 10% off for orders > 100
const discount = totalPrice > 100 ? totalPrice * 0.1 : 0;

// ❌ Bad - obvious comments
// Set state
setState(true);
```

---

## Commit Messages

### Format

```
<type>: <subject>

<body>

<footer>
```

### Type

```
feat:     New feature
fix:      Bug fix
docs:     Documentation
style:    Code style (formatting, semicolons)
refactor: Code restructuring
perf:     Performance improvement
test:     Test additions/changes
chore:    Build, dependencies, tooling
```

### Subject

- Use imperative mood ("add" not "adds" or "added")
- Don't capitalize first letter
- No period at end
- Max 50 characters
- Be specific

### Examples

```bash
# ✅ Good
git commit -m "feat: add room availability filter"
git commit -m "fix: resolve CORS error in production"
git commit -m "docs: update setup instructions"
git commit -m "refactor: extract room list component"

# ❌ Bad
git commit -m "Update code"
git commit -m "Fixed bug"
git commit -m "Added stuff"
git commit -m "CHANGES"
```

### With Body (for complex commits)

```bash
git commit -m "feat: add room booking validation

- Validate dates before booking
- Check room availability
- Handle double bookings
- Send confirmation email

Fixes #123"
```

---

## Pull Requests

### PR Title Format

```
[Type] Short description

Examples:
✅ [Feature] Add room booking confirmation
✅ [Fix] Resolve login page styling issues
✅ [Docs] Update API documentation
```

### PR Description Template

```markdown
## Description
Brief description of changes

## Motivation & Context
Why is this change needed?

## Type of Change
- [ ] New feature
- [ ] Bug fix
- [ ] Documentation
- [ ] Refactoring

## Testing
How have you tested this?

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] No new warnings generated
- [ ] Tests added/pass
- [ ] Related issues linked

## Related Issue
Fixes #123
```

### PR Review Guidelines

- PRs must be reviewed before merging
- At least 1 approval required
- All CI checks must pass
- Keep discussions respectful
- Address feedback promptly

---

## Reporting Issues

### Creating Issue

**Title Format:**
```
[Type] Short description

Examples:
✅ [Bug] Login page not responsive on mobile
✅ [Feature] Add email notifications
✅ [Question] How to customize theme?
```

**Description Template:**

```markdown
## Description
Clear description of the issue

## Steps to Reproduce
1. Go to...
2. Click on...
3. Observe error

## Expected Behavior
What should happen?

## Actual Behavior
What actually happens?

## Screenshots/Logs
Attach screenshots or error logs

## Environment
- Browser: Chrome 120.0
- OS: Windows 11
- Version: 1.0.0
```

### Issue Labels

- `bug` - Something isn't working
- `feature` - New feature request
- `documentation` - Improvements needed
- `good first issue` - For new contributors
- `help wanted` - Need assistance
- `question` - Questions/clarifications

---

## Local Testing

### Before Submitting PR

```bash
# Backend tests
cd backend
npm test

# Frontend tests
npm test

# Linting
npm run lint

# Build
npm run build

# Manual testing
npm run dev
# Test your changes in http://localhost:5173
```

---

## Common Questions

### How do I update my fork?

```bash
git fetch upstream
git rebase upstream/main
git push origin main
```

### Can I work on an existing issue?

```bash
# Comment on the issue first
# "I'm working on this"

# After discussion, create PR
```

### What if my PR conflicts?

```bash
# Fetch latest
git fetch upstream

# Rebase on main
git rebase upstream/main

# Resolve conflicts in editor
# Then push
git push origin feature/YourFeature --force-with-lease
```

---

## Resources

- [GitHub Docs](https://docs.github.com)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [React Best Practices](https://react.dev/learn)
- [Node.js Best Practices](https://nodejs.org/en/docs/guides/nodejs-performance-gc/)

---

## Questions?

- Check existing issues first
- Review closed PRs for similar changes
- Ask in issue discussions
- Email: support@example.com

---

**Thank you for contributing!** 🙏

Your contributions make this project better for everyone.

---

**Last Updated:** February 8, 2026  
**Version:** 1.0.0
