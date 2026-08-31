# RetinaRetail

> AI-Powered Retail Intelligence, Built at the Edge — Smart India Hackathon 2026 (PS #26179)

RetinaRetail is an edge-AI retail intelligence platform delivering real-time shopper analytics, inventory tracking, and queue intelligence directly on edge compute.

---

## 📁 Repository Structure

```
retina-retail/
├── apps/
│   └── web/                  # Vite + React + TypeScript frontend (dashboard & placeholder)
├── ml/                       # Edge-AI model & inference pipelines (multi-task vision backbone, ByteTrack, SNPE/QNN)
├── docs/                     # Architecture specifications, SIH PS documentation, and presentation assets
├── .github/
│   └── workflows/
│       └── deploy.yml        # GitHub Actions CI/CD deployment to Cloudflare Pages
├── .gitignore                # Git ignore configuration
├── .nvmrc                    # Pinned Node.js LTS version (20)
├── .prettierrc               # Code formatting rules
├── package.json              # Root monorepo workspace configuration
└── README.md                 # Project documentation
```

---

## 🛠️ Local Development

### Prerequisites

- **Node.js**: `20.x` (LTS recommended, see `.nvmrc`)
- **npm**: `10.x` or later

### Getting Started

1. **Clone the repository:**
   ```bash
   git clone https://github.com/kritik8/retina-retail.git
   cd retina-retail
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the local development server:**
   ```bash
   npm run dev
   ```

4. **Build for production:**
   ```bash
   npm run build
   ```

5. **Run linter:**
   ```bash
   npm run lint
   ```

---

## 🚀 Deployment

The web application is configured for automated continuous deployment to **Cloudflare Pages** using GitHub Actions.

### Branch Strategy
- **`main`**: The primary development branch.
- **`production`**: The release branch. Pushes to `production` automatically trigger the GitHub Actions workflow to build and deploy `apps/web` to Cloudflare Pages.

### Required GitHub Secrets
To enable the deployment pipeline, configure the following secrets in **GitHub Repository Settings → Secrets and variables → Actions**:

| Secret Name | Description |
|---|---|
| `CLOUDFLARE_API_TOKEN` | Cloudflare API Token with `Cloudflare Pages: Edit` permissions |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare Account ID from your Cloudflare Dashboard |

*Note: The GitHub Actions workflow targets the Cloudflare Pages project named `retina-retail`.*
