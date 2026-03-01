## 🚧 Status: Architectural Refactor (V2 Migration)

I am currently migrating the **MechanicAI** ecosystem from **Remix.js** to **Next.js 16 (App Router)**. 

**Why this migration?**
* **Performance:** Utilizing Next.js Server Actions and Partial Prerendering (PPR) for sub-second AI response times.
* **Modern Standards:** Transitioning to the latest industry-standard stack used by high-growth US startups.

*Note: The current repository contains the stable Remix-based logic for the core AI and Payment modules.*



# 🛠️ MechanicAI
### *AI-Driven Vehicle Diagnostics & Repair SaaS*

**MechanicAI** is a full-stack SaaS platform designed to bridge the gap between complex vehicle telemetrics and actionable repair advice. By leveraging large language models (LLMs) and secure payment processing, it provides car owners with professional-grade diagnostics at a fraction of the cost.


## 🚀 Technical Highlights

* **AI-Powered Diagnostics:** Custom-engineered prompts utilizing the OpenAI API to deliver accurate, context-aware mechanical advice based on user symptoms.
* **Commercial-Ready Payments:** Full integration with **Paddle**, handling global tax compliance, subscriptions, and secure checkout flows.
* **Enterprise-Grade Security:**
    * **Multi-Factor Auth:** Custom Two-Factor Authentication (2FA) via email for high-security user sessions.
    * **Bot Defense:** Implementation of **Honeypot** fields and **CSRF protection** to maintain platform integrity.
    * **Data Safety:** Secure password hashing and role-based access control (RBAC).
* **Modern Data Layer:** Type-safe database interactions using **Prisma ORM** with a PostgreSQL backend.


## 🛠️ Tech Stack

![Remix](https://img.shields.io/badge/remix-%23000.svg?style=for-the-badge&logo=remix&logoColor=white)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![OpenAI](https://img.shields.io/badge/OpenAI-412991?style=for-the-badge&logo=openai&logoColor=white)


## 📦 Local Setup

*Note: Since the platform is currently undergoing a database migration, you will need to provide your own environment variables to run it locally.*

1.  **Clone the repo:**
    ```bash
    git clone [https://github.com/lukaarakic/MechanicAI.git](https://github.com/lukaarakic/MechanicAI.git)
    cd MechanicAI
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Environment Variables:**
    Create a `.env` file and include:
    * `VITE_OPENAI_API_KEY`
    * `VITE_RESEND_API_KEY`
    * `VITE_SESSION_SECRET`
    * `VITE_HONEYPOT_SECRET`

4.  **Run Migrations:**
    ```bash
    npx prisma migrate dev
    ```

5.  **Start Development Server:**
    ```bash
    npm run dev
    ```

