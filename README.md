# AutoAuction LT — Full Stack Project
### Vytautas Magnus University · Faculty of Informatics
### Term Paper by Fazle Rabbi Mahim · Supervisor: Prof. Gintarė Kaminskienė

---

## Project Overview

A web-based automobile auction platform designed for small business owners and rural
vehicle sellers in Lithuania. Connects sellers with competitive buyers through real-time
bidding, transparent pricing, and an admin-moderated workflow.

---

## Full Stack Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    BROWSER (Port 3000)                   │
│                    React JS Frontend                      │
│   src/pages/  src/components/  src/api/  src/hooks/      │
└────────────────────────┬────────────────────────────────┘
                         │
              HTTP (REST)│  WebSocket (ws://)
                         │
┌────────────────────────▼────────────────────────────────┐
│                  DJANGO (Port 8000)                       │
│          Django REST Framework + Django Channels          │
│   apps/users/  apps/listings/  apps/auctions/             │
│   apps/bids/   apps/comments/  apps/messages/             │
└──────────┬──────────────────────────┬───────────────────┘
           │                          │
    ┌──────▼──────┐           ┌───────▼──────┐
    │    MySQL     │           │    Redis      │
    │  (Port 3306) │           │  (Port 6379)  │
    │  Main data   │           │  WebSockets   │
    └─────────────┘           └──────────────┘
```

---

## Project Structure

```
autoauction-complete/
│
├── README.md                        ← YOU ARE HERE
│
├── frontend/                        ← React JS App
│   ├── package.json
│   ├── public/
│   │   └── index.html
│   └── src/
│       ├── App.jsx                  ← Root component + routing
│       ├── index.js                 ← React entry point
│       ├── api/                     ← All Django API calls
│       │   ├── config.js            ← Base URL, fetch wrapper
│       │   ├── auth.js              ← Login, register, logout
│       │   ├── auctions.js          ← Listings & auctions
│       │   ├── bids.js              ← Place & review bids
│       │   ├── comments.js          ← Comments & likes
│       │   └── messages.js          ← User → Admin messages
│       ├── components/              ← Reusable UI components
│       │   ├── Nav.jsx
│       │   ├── Footer.jsx
│       │   ├── CarCard.jsx
│       │   ├── Countdown.jsx
│       │   ├── StatusBadge.jsx
│       │   └── Toast.jsx
│       ├── hooks/
│       │   └── useWebSocket.js      ← Real-time bid updates
│       ├── pages/                   ← Full page views
│       │   ├── HomePage.jsx
│       │   ├── AuctionsPage.jsx
│       │   ├── CarDetailPage.jsx
│       │   ├── LoginPage.jsx
│       │   ├── SignupPage.jsx
│       │   ├── DashboardPage.jsx
│       │   └── AdminDashboard.jsx
│       ├── data/
│       │   └── mockData.js          ← Fallback demo data
│       └── styles/
│           ├── global.css
│           └── theme.js
│
└── backend/                         ← Django Backend
    ├── manage.py
    ├── requirements.txt
    ├── setup_db.sql                 ← Run this first in MySQL
    ├── .env.example                 ← Copy to .env
    ├── autoauction_backend/
    │   ├── settings.py
    │   ├── urls.py
    │   └── asgi.py
    └── apps/
        ├── users/                   ← Custom User model + auth
        ├── listings/                ← Vehicle listings
        ├── auctions/                ← Auction sessions + WebSocket
        ├── bids/                    ← Bid submission + approval
        ├── comments/                ← Comments + likes
        └── messages/                ← User → Admin inbox
```

---

## Installation Guide

### Requirements
| Tool    | Version  | Download                          |
|---------|----------|-----------------------------------|
| Node.js | 16+      | https://nodejs.org                |
| Python  | 3.10+    | https://python.org                |
| MySQL   | 8.0+     | https://dev.mysql.com/downloads   |
| Redis   | 6+       | https://redis.io/download         |

---

### STEP 1 — Create the MySQL Database

Open Terminal and run:
```bash
mysql -u root -p < backend/setup_db.sql
```
This creates the `autoauction_db` database automatically.

---

### STEP 2 — Set up the Django Backend

```bash
# Go into the backend folder
cd backend

# Create a Python virtual environment
python3 -m venv venv

# Activate it
source venv/bin/activate        # Mac / Linux
venv\Scripts\activate           # Windows

# Install all Python packages
pip install -r requirements.txt

# Copy the environment config file
cp .env.example .env
```

Open `.env` and set your MySQL password:
```
DB_PASSWORD=your_mysql_password_here
```

```bash
# Create all database tables
python manage.py makemigrations
python manage.py migrate

# Create your admin account
python manage.py createsuperuser
```

After creating the superuser, set the role to admin:
```bash
python manage.py shell
```
```python
from apps.users.models import User
u = User.objects.get(username='your_username')
u.role = 'admin'
u.save()
exit()
```

---

### STEP 3 — Set up the React Frontend

```bash
# Open a new terminal tab, go into frontend folder
cd frontend

# Install all JavaScript packages
npm install
```

---

### STEP 4 — Start Redis (required for WebSockets)

```bash
# Mac (with Homebrew):
brew install redis
brew services start redis

# Linux:
sudo apt install redis-server
sudo systemctl start redis

# Windows: download Redis from https://redis.io/download
```

---

### STEP 5 — Run the Application

You need **3 terminal tabs** open at the same time:

**Tab 1 — Django Backend:**
```bash
cd backend
source venv/bin/activate
python manage.py runserver
```
→ Runs at http://localhost:8000

**Tab 2 — React Frontend:**
```bash
cd frontend
npm start
```
→ Opens automatically at http://localhost:3000

**Tab 3 — Redis (if not running as a service):**
```bash
redis-server
```

---

## Using the Application

Open **http://localhost:3000** in your browser.

### Demo Flow
1. Register a new account via Sign Up
2. Browse live auctions on the Auctions page
3. Click a vehicle → Place a bid
4. Open a second browser tab, log in as **admin**
5. Go to Admin Dashboard → Bids tab → Approve the bid
6. Watch the price update live on the auction page via WebSocket

### Admin Panel
- Django Admin UI: http://localhost:8000/admin/
- React Admin Dashboard: log in as admin → click "Admin" in the nav

---

## REST API Reference

| Method | Endpoint                        | Description                  |
|--------|---------------------------------|------------------------------|
| POST   | `/api/auth/register/`           | Create new account           |
| POST   | `/api/auth/login/`              | Login → get token            |
| POST   | `/api/auth/logout/`             | Logout                       |
| GET    | `/api/auth/me/`                 | Get own profile              |
| GET    | `/api/auctions/`                | List all auctions            |
| GET    | `/api/auctions/<id>/`           | Single auction detail        |
| GET    | `/api/listings/`                | List all vehicle listings    |
| POST   | `/api/listings/`                | Create listing (admin)       |
| POST   | `/api/bids/`                    | Submit a bid                 |
| GET    | `/api/bids/pending/`            | Pending bids (admin)         |
| POST   | `/api/bids/<id>/approve/`       | Approve bid (admin)          |
| POST   | `/api/bids/<id>/reject/`        | Reject bid (admin)           |
| GET    | `/api/comments/?auction=<id>`   | Get comments for auction     |
| POST   | `/api/comments/`                | Post a comment               |
| POST   | `/api/messages/send/`           | Send message to admin        |

**WebSocket:**
```
ws://localhost:8000/ws/auction/<id>/
```

---

## Database Tables (MySQL)

| Table            | Description                                        |
|------------------|----------------------------------------------------|
| `users`          | All user accounts (role: user / admin)             |
| `listings`       | Vehicle details — make, model, VIN, specs          |
| `listing_images` | Vehicle photos                                     |
| `auctions`       | Timed auction sessions linked to listings          |
| `bids`           | All bids with pending / approved / rejected status |
| `comments`       | User comments on auctions                          |
| `comment_likes`  | One like per user per comment                      |
| `messages`       | User → Admin contact messages                      |

---

*© 2025 Fazle Rabbi Mahim · Vytautas Magnus University*
*Informatics Systems study programme, state code 6121BX016*
