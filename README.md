# Vmax.mn — Real Estate Marketplace Platform

**Vmax.mn** is a modern real estate marketplace platform built with a NestJS backend REST API, PostgreSQL database, and a React + Vite frontend.

---

## 🏗️ Architecture & Tech Stack

| Component | Technology | Description |
|---|---|---|
| **Client (Frontend)** | React 19, Vite, TypeScript, Tailwind CSS, Zustand, Framer Motion | Web application interface |
| **API (Backend)** | NestJS 11, TypeORM, Passport JWT, Schedule Cron, Swagger | RESTful API & authentication |
| **Database** | PostgreSQL 16 | Relational database (Docker container) |

---

## 🌟 Key Features

- 🏢 **Property Search & Filters**: Search by sale/rent, apartment/house/land, district, khoroo, price, and area.
- 🗺️ **Interactive Maps**: Leaflet map integration for location discovery and picker.
- ⭐ **VIP & Top Urgent Promotions**: Boost properties with gold VIP badges or flame red Top Urgent badges to rank first in search results.
- 👑 **Agent & Agency Subscriptions**: Tiered membership packages (`FREE`, `PRO_AGENT`, `AGENCY`) with automated active listing quotas.
- 📊 **Listing Analytics**: View counters, share tracking, and inquiry management.

---

## 🚀 Quick Start Guide

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+)
- [Docker & Docker Compose](https://www.docker.com/)

---

### Step 1: Start Database (PostgreSQL)

From the project root directory, launch the PostgreSQL database container:

```bash
docker compose up -d
```
> PostgreSQL will run on port `5432` (Database: `vmax`, User: `postgres`, Password: `postgres`).

---

### Step 2: Start Backend API (`/api`)

Open a terminal window:

```bash
cd api
npm install
npm run start:dev
```
- **Backend Server**: `http://localhost:5000`
- **Swagger Documentation**: `http://localhost:5000/api/docs`

---

### Step 3: Start Frontend Client (`/client`)

Open another terminal window:

```bash
cd client
npm install
npm run dev
```
- **Frontend App**: `http://localhost:3000`

---

## 📂 Project Structure

```
vmax/
├── api/                  # NestJS backend API (users, listings, subscriptions, auth, favorites, mail)
├── client/               # React + Vite frontend client (pages, components, stores, hooks)
├── docker-compose.yml    # Docker services (PostgreSQL)
└── README.md             # Project documentation
```

