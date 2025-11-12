# Documentation Setup Guide

This guide explains how to organize and host your project documentation.

## 📁 Current Organization

Your documentation is now organized in the `docs/` directory:

```
docs/
├── README.md                    # Main documentation index
├── setup/                       # Setup and configuration guides
│   ├── FACE_ID_SETUP.md
│   ├── FACE_ID_FIX.md
│   ├── PASSCODE_LOGIN_FIX.md
│   └── REBUILD_INSTRUCTIONS.md
├── api/                         # API documentation
│   ├── README.md
│   ├── BACKEND_REQUIREMENTS.md
│   ├── V2_INTEGRATION_SUMMARY.md
│   └── V2_MIGRATION_GUIDE.md
├── checklists/                  # Progress tracking
│   └── V2_CHECKLIST.md
└── sessions/                    # Development notes
    └── V2_SESSION_SUMMARY.md
```

## 🎯 Documentation Strategy

### Option 1: Keep in Repository (Current - Recommended)

**Pros:**
- ✅ Version controlled with code
- ✅ Easy to update alongside code changes
- ✅ Accessible to all team members
- ✅ No additional hosting needed

**Cons:**
- ❌ Less discoverable than a dedicated site
- ❌ No search functionality

**Best for:** Small teams, internal documentation

---

### Option 2: GitHub Pages (Free & Easy)

Host your docs as a static site on GitHub Pages.

#### Setup with MkDocs (Python-based, simple)

1. **Install MkDocs:**
```bash
pip install mkdocs mkdocs-material
```

2. **Create `mkdocs.yml` in project root:**
```yaml
site_name: GidiNest Mobile Docs
site_url: https://yourusername.github.io/gidinest-mobile
repo_url: https://github.com/yourusername/gidinest-mobile

theme:
  name: material
  features:
    - navigation.tabs
    - search.suggest
    - search.highlight

nav:
  - Home: index.md
  - Getting Started:
    - Setup: setup/REBUILD_INSTRUCTIONS.md
    - Face ID: setup/FACE_ID_SETUP.md
  - API:
    - Overview: api/README.md
    - V2 Integration: api/V2_INTEGRATION_SUMMARY.md
    - Backend Requirements: api/BACKEND_REQUIREMENTS.md
  - Checklists:
    - V2 Checklist: checklists/V2_CHECKLIST.md
  - Swagger API: https://your-api-url.com/api/docs
```

3. **Create `docs/index.md`:**
```markdown
# GidiNest Mobile Documentation

Welcome! Navigate using the sidebar.

[View Swagger API Docs →](https://your-api-url.com/api/docs)
```

4. **Build and deploy:**
```bash
# Build site
mkdocs build

# Deploy to GitHub Pages
mkdocs gh-deploy
```

**Access:** `https://yourusername.github.io/gidinest-mobile`

---

### Option 3: Docusaurus (React-based, feature-rich)

**Best for:** Larger projects, need for advanced features

1. **Install:**
```bash
npx create-docusaurus@latest docs-site classic
cd docs-site
```

2. **Configure `docusaurus.config.js`:**
```javascript
module.exports = {
  title: 'GidiNest Mobile Docs',
  url: 'https://yourusername.github.io',
  baseUrl: '/gidinest-mobile/',
  // ... configure docs path to point to ../docs
};
```

3. **Deploy:**
```bash
npm run build
# Deploy to GitHub Pages or Netlify
```

**Pros:**
- ✅ Great search functionality
- ✅ Versioning support
- ✅ Blog capability
- ✅ Customizable

**Cons:**
- ❌ More setup required
- ❌ Larger bundle size

---

### Option 4: Simple HTML Index (Minimal)

Create a simple `docs/index.html` that links to all your MD files:

```html
<!DOCTYPE html>
<html>
<head>
  <title>GidiNest Mobile Documentation</title>
  <style>
    body { font-family: system-ui; max-width: 800px; margin: 40px auto; }
    a { color: #6b146d; }
  </style>
</head>
<body>
  <h1>GidiNest Mobile Documentation</h1>
  <ul>
    <li><a href="setup/REBUILD_INSTRUCTIONS.md">Setup Guide</a></li>
    <li><a href="api/V2_INTEGRATION_SUMMARY.md">V2 API Integration</a></li>
    <li><a href="checklists/V2_CHECKLIST.md">Integration Checklist</a></li>
    <li><a href="https://your-api-url.com/api/docs">Swagger API Docs</a></li>
  </ul>
</body>
</html>
```

---

## 🔗 Integrating Swagger Docs

Since you're using Swagger on the backend, link to it from your docs:

### In Markdown Files:
```markdown
## API Documentation

- **Interactive API Docs**: [Swagger UI](https://your-api-url.com/api/docs)
- **Backend Requirements**: See [Backend Requirements](./api/BACKEND_REQUIREMENTS.md)
```

### In README:
```markdown
## API Documentation

- [Swagger API Docs](https://your-api-url.com/api/docs) - Interactive API testing
- [Backend Requirements](./docs/api/BACKEND_REQUIREMENTS.md) - Complete API specification
```

---

## 📝 Best Practices

1. **Keep docs close to code** - Store in repo for version control
2. **Link to Swagger** - Don't duplicate API docs, link to Swagger
3. **Update with code** - Update docs when you update code
4. **Use clear structure** - Organize by category (setup, api, etc.)
5. **Add search** - If using a docs site, enable search

---

## 🚀 Recommended Approach

For your project, I recommend:

1. **Keep docs in repo** (current setup) ✅
2. **Add GitHub Pages** with MkDocs for a nice web interface
3. **Link to Swagger** from all relevant docs
4. **Update README.md** with links to docs

This gives you:
- ✅ Version control
- ✅ Easy web access
- ✅ Search functionality
- ✅ Integration with Swagger

---

## 📚 Next Steps

1. ✅ Docs are organized in `docs/` directory
2. ⏭️ Set up GitHub Pages (optional)
3. ⏭️ Update Swagger URL in all docs
4. ⏭️ Add docs link to main README

---

**Questions?** Check the [main docs README](./README.md) for more information.


