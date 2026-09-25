# Getting Started & Setup Guide

Follow these steps to set up, sync, and configure the project and database locally.

---

## 1. Sync & Pull Latest Changes

If you are working from a fork, sync your repository with the original upstream repository on GitHub first. Then, pull the latest updates to your local terminal:

```bash
git pull origin main
```

---

## 2. Install Dependencies

If this is a fresh clone or you just pulled new changes, install the project dependencies:

```bash
npm install
```

> **Note on `tsx`:** We use **`tsx`** (TypeScript Execute) to run `.ts` scripts directly in Node.js without needing to compile them to JavaScript first. It powers the `npm run db:init` command to run `/scripts/init-db.ts`. 
> 
> If `tsx` is not installed yet, add it as a dev dependency:
> ```bash
> npm install -D tsx
> ```

---

## 3. Environment Configuration

Create a `.env.local` file in the root directory of your project to connect your application to Neon Postgres:

```bash
# Create .env.local in your project root
DATABASE_URL=" "
```

Replace the inside of " "  with your actual connection string from the **Neon Console**.

---

## 4. Database Setup & Management

You can manage your database schema directly from VS Code without needing to run manual SQL queries in the Neon UI.

### Initializing the Database
Run the initialization script to automatically create all required tables:

```bash
npm run db:init
```

### Adding New Tables or Modifying Schema
Whenever you want to add a new table or modify an existing one:

1. Open `/scripts/init-db.ts` in VS Code.
2. Add your new SQL table definition inside the `initDB()` function.
3. Save the file and run:
   ```bash
   npm run db:init
   ```

---

## ⚡ Quick Command Reference

| Action | Command |
| :--- | :--- |
| **Pull updates** | `git pull origin main` |
| **Install dependencies** | `npm install` |
| **Initialize / Update DB** | `npm run db:init` |
| **Start Dev Server** | `npm run dev` |