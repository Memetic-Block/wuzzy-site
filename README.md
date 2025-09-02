# Wuzzy Site

A Vue.js frontend application for the Wuzzy platform, providing a user interface for browsing and interacting with nests, crawlers, and search functionality.

Check it out at [https://wuzzy.arweave.net](https://wuzzy.arweave.net)

## Prerequisites

- **Node.js** (v22 or higher)
- **npm** or **yarn**
- **Arweave wallet keyfile** (for deployment)

## Installation

1. Clone the repository and navigate to the project directory:
```bash
cd wuzzy-site
```

2. Install dependencies:
```bash
npm install
```

## Environment Variables
The following environment variables are used in the webapp:
### Required
- `VITE_REGISTRY_PROCESS_ID` - A deploy Wuzzy Nest Registry Process
- `VITE_PRIMARY_NEST_ID` - The primary Wuzzy Nest that will used for the homepage search
- `VITE_HYPERBEAM_ENDPOINT` - The hyperbeam node you'd like to use

The following environment variables are used for deployment:
### Required
- `PRIVATE_KEY` - Path to your Arweave wallet keyfile
### Optional
- `GATEWAY` - Arweave gateway URL (default: `https://arweave.net`)

## Running for Development
Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally

## Deployment

The project uses a custom deployment script that uploads the built application to Arweave using Turbo.

### Build and Deploy

Before building, make sure you have the appropriate environment variables set, as described above.

1. First, build the application:
```bash
npm run build
```

2. Deploy to Arweave:
```bash
PRIVATE_KEY=path/to/your/wallet.json npx tsx operations/deploy.ts
```

The deployment script will:
1. Upload the `dist` folder to Arweave via Turbo
2. Create a manifest with `index.html` as both index and fallback
3. Return the manifest transaction ID for accessing the deployed site

## Project Structure

- `src/` - Vue.js application source code
  - `components/` - Reusable Vue components
  - `views/` - Page components
  - `composables/` - Vue composition functions
  - `types/` - TypeScript type definitions
- `public/` - Static assets
- `operations/` - Deployment and operational scripts
- `dist/` - Built application (generated)
