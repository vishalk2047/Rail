# Live Train Running Status & Tracking App

A high-fidelity Indian Railways live train tracking web application with real-time station timeline, arrival & departure separation with color-coded on-time/delay tracking, platform updates, and coach layouts.

## Quick Start (Running Locally)

Follow these steps once you extract the downloaded zip file:

### 1. Open Terminal in the project folder
Open your terminal or command prompt and make sure you are inside the extracted directory (where `package.json` is located).

### 2. Install dependencies
```bash
npm install
```

### 3. Start the development server
```bash
npm run dev
```

### 4. Open in your browser
Once running, open your browser and navigate to:
```
http://localhost:3000
```
(or the port shown in your terminal, usually `http://localhost:3000` or `http://localhost:5173`).

---

## Build & GitHub Pages Deployment

### Why did the site show a white screen on GitHub Pages previously?
By default, Vite tries to load scripts from the domain root `/assets/...`. When deployed on GitHub Pages at `https://<username>.github.io/<repo-name>/`, the browser fails to find `/assets/...` (resulting in a 404), causing a blank white page.
We have updated `vite.config.ts` with `base: './'` so all assets use relative paths and load seamlessly anywhere.

### Option A: Automatic GitHub Pages Deployment (Recommended)
1. On your GitHub repository page, go to **Settings** > **Pages** (in the left sidebar).
2. Under **Build and deployment** > **Source**, select **GitHub Actions**.
3. Push your code or click **Actions** tab > **Deploy to GitHub Pages** > **Run workflow**.
4. GitHub will automatically build and publish your site!

### Option B: Deploying manually via `dist` branch
1. Run:
   ```bash
   npm run build
   ```
2. Deploy the generated `dist/` folder to GitHub Pages.

---

## Quick Start (Running Locally)
- **Live Train Tracking Timeline**: Clean stations list with major stop toggling.
- **Arrival & Departure Separation**: Distinct Scheduled and Actual timings.
  - **Green**: On-time or early arrival/departure.
  - **Red**: Delayed / late arrival/departure with minute calculations.
- **Station Detail Card**: Click any station to inspect platform numbers, distance, halt duration, and set wake-up alarms.
- **Coach Position & Seat Layout**: Visual coach sequence (Engine, Sleeper, 3AC, 2AC, etc.).
- **Live Station Board & Train Search**: Query trains by number or station pairs.
