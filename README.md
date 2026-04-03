# 💸 SplitSmart — Smart Expense Splitter

A modern, animated, and user-friendly web app to manage shared expenses and simplify group settlements.

Built as part of the Neev AI Internship assignment — with a strong focus on **clean architecture, UX, and real-world usability**.

---

## 🚀 Live Demo

👉 (Add your deployed link here)

---

## ✨ Features

### 🧾 Expense Management

* Add expenses with description, amount, payer, and participants
* Equal split logic with clean rounding
* Real-time updates using pure functions

### ⚖️ Smart Balance Calculation

* Automatically computes net balances per user
* Clearly shows who owes whom
* Ensures total balances always sum to zero

### 🔄 Debt Simplification

* Minimizes number of transactions using a greedy algorithm
* Generates optimal settlement suggestions

### 👤 Interactive Member Insights

* Click on any member avatar to view:

  * Total paid vs consumed
  * Net balance
  * Personal transaction history
  * Active debts & credits

### 📜 Transaction History

* Full activity log of all expenses and settlements
* Clean and readable UI

### 💰 Settle Up Feature

* One-click settlement of debts
* Automatically records settlement transactions

---

## 🎨 UI/UX Highlights

* 🌈 Glassmorphism + gradient-based modern design
* ✨ Smooth animations powered by Framer Motion
* 📊 Animated number transitions for balances
* 🎯 Micro-interactions (hover, tap, transitions)
* 📱 Responsive layout (desktop + mobile friendly)
* 🎬 Animated onboarding screen with playful elements

---

## 🧠 Architecture & Design

### Core Principles

* Pure functions (no side effects)
* Immutable state updates
* Separation of concerns (logic vs UI)

### Key Modules

#### 🔹 Core Logic (`/core`)

* `addExpense()` — adds expense immutably
* `calculateBalances()` — computes net balances
* `simplifyDebts()` — minimizes transactions
* `getSettlementSummary()` — full pipeline

#### 🔹 Models (`/core/models.js`)

* Plain JS object structures (no classes)
* Extensible for future features (custom splits)

#### 🔹 UI Components (`/components`)

* Modular, reusable React components
* Framer Motion for animations
* Clean separation of concerns

---

## 🛠 Tech Stack

* **Frontend:** React (Vite)
* **Styling:** Custom CSS (Glassmorphism + gradients)
* **Animations:** Framer Motion
* **Icons:** Lucide React
* **Testing:** Vitest

---

## 🧪 Testing

* Unit tests for all core logic functions
* Covers:

  * Expense addition
  * Balance calculation
  * Debt simplification
  * Edge cases

Run tests:

```bash
npm run test
```

---

## ⚙️ Setup & Run Locally

```bash
# Clone repo
git clone <your-repo-url>

# Install dependencies
npm install

# Start dev server
npm run dev
```

---

## 🔮 Future Improvements

* Custom split support (percentage / exact amounts)
* Persistent storage (localStorage / database)
* Multi-group support
* Export reports
* Authentication
---

## 🙌 Final Notes

This project was built with a focus on:

* Clean, testable logic
* Thoughtful UX
* Real-world usability

Rather than just completing requirements, the goal was to build something that **feels like a real product**.

---

## 👤 Author

Your Name
GitHub: (your profile link)](https://github.com/deepikakudari)


