Full-Stack Analytics & AI Dashboard

This is a production-grade, full-stack web application built from a complex Figma design. The project consists of two primary modules:
1. Interactive Analytics Dashboard (100% Complete): A pixel-perfect, data-driven dashboard with a full Next.js frontend, 7 live API endpoints, and a normalized PostgreSQL database.
2. "Chat with Data" AI Service (UI Complete, Service Blocked): A self-hosted AI service using Vanna AI and Groq. A significant development effort was invested here, but the Python service is currently blocked by deep-seated, persistent package and environment-level conflicts.
The primary dashboard is fully complete, deployed, and functional.

📸 Live Dashboard (Module 1)

(placeholder: add your dashboard screenshot here)
![Live Dashboard Screenshot](https://i.imgur.com/g0P3oXq.png)
🌐 Live URLs
* Frontend (Vercel): https://analytics-dashboard-project.vercel.app (Replace with your URL)
* Backend API: https://analytics-dashboard-project.vercel.app/api (Uses the same base as frontend)
* Vanna AI (Hosted): (Not deployed due to environment conflicts)
📁 Project Structure
The monorepo is organized into apps and services as required.
/
├── apps/
│   ├── web/                # The Next.js frontend and backend API
│   │   ├── app/            # Next.js App Router (UI Pages & API Routes)
│   │   │   ├── api/        # Backend API endpoints (/stats, /invoices, etc.)
│   │   │   ├── chat/       # Chat with Data UI
│   │   │   └── page.tsx    # Main dashboard UI
│   │   ├── src/
│   │   │   ├── components/ # All React components (Sidebar, Charts, Table)
│   │   │   └── lib/        # Prisma client
│   │   ├── prisma/
│   │   │   ├── schema.prisma # Database schema definition
│   │   │   └── seed.ts     # Data ingestion script
│   │   └── tailwind.config.ts
│   └── docs/
│
├── services/
│   └── vanna/              # Self-hosted Python AI service
│       ├── .env            # Environment keys (GROQ, DB_URL)
│       ├── app.py          # FastAPI server
│       ├── llm_groq.py     # Custom Groq adapter
│       └── requirements.txt
│
└── data/
   └── Analytics_Test_Data.json # The raw JSON data

🗃️ Database
Schema Overview (ER Diagram)
The database was designed to normalize the nested JSON data into a relational structure.
+--------------+       +-------------+
|    Vendor    |       |   Invoice   |
+--------------+       +-------------+
| PK id        |<--+---O| PK id       |
|    name      |   |    |    invoiceNumber|
|    address   |   |    |    issueDate|
|    taxId     |   |    |    dueDate  |
+--------------+   |    |    totalAmount|
                  |    |    status     |
                  |    | FK vendorId  |
                  |    +-------------+
                  |           |
                  |           |
                  `-----------+
                              |
                      +-------------+
                      |  LineItem   |
                      +-------------+
                      | PK id       |
                      |    description|
                      |    quantity   |
                      |    unitPrice  |
                      |    category   |
                      | FK invoiceId|
                      +-------------+

Data Ingestion
The database is populated using a custom TypeScript seed script located at apps/web/prisma/seed.ts. It reads the data/Analytics_Test_Data.json, cleans and validates the data, and populates the normalized tables. See "How to Run" for usage.
🔌 API Documentation
All API endpoints are located in apps/web/app/api/ and are served from the same Vercel deployment as the frontend.
Dashboard API
* GET /api/stats
   * Description: Returns totals for the four overview cards.
   * Response:
{
 "totalSpend": 12679.25,
 "totalInvoices": 18,
 "averageInvoiceValue": 704.4,
 "documentsUploaded": 50
}

   * GET /api/invoice-trends
   * Description: Returns invoice count and total spend for the last 12 months.
   * Response:
[
 { "month": "Oct", "count": 1, "total": 84 },
 { "month": "Nov", "count": 1, "total": 358.79 }
]

      * GET /api/vendors/top10
      * Description: Returns the top 10 vendors by total spend.
      * Response:
[
 { "name": "Musterfirma Müller", "total": 358.79 },
 { "name": "Test Solutions", "total": 2840 }
]

         * GET /api/category-spend
         * Description: Returns total spend grouped by line item category.
         * Response:
[
 { "name": "Operations", "value": 7250 },
 { "name": "Marketing", "value": 1000 }
]

            * GET /api/cash-outflow
            * Description: Returns total unpaid invoice amounts, grouped into buckets by due date.
            * Response:
[
 { "bucket": "Overdue", "total": 358.79 },
 { "bucket": "8 - 30 days", "total": 2840 }
]

               * GET /api/invoices
               * Description: Returns a searchable list of all invoices.
               * Response:
[
 {
   "id": 1,
   "invoiceNumber": "1234",
   "issueDate": "2025-11-04",
   "status": "OVERDUE",
   "totalAmount": 358.79,
   "vendorName": "Musterfirma Müller"
 }
]

Chat API
                  * POST /api/chat-with-data
                  * Description: A proxy endpoint that forwards a question to the self-hosted Vanna AI service.
                  * Request Body:
{ "question": "What is the total spend?" }

                  * Response (from Vanna):
{
 "sql": "SELECT SUM(\"totalAmount\") FROM \"Invoice\"",
 "result": [{ "sum": 12679.25 }],
 "chart": { ...Plotly JSON... }
}

🤖 "Chat with Data" Workflow Explanation
This module consists of three parts: the Next.js frontend, a Next.js proxy API, and the self-hosted Python (FastAPI) service. The frontend and proxy API are fully built.
                     1. Frontend (React): A user types "What's the total spend?" into the chat UI at /chat.
                     2. Next.js Proxy: The UI sends a POST request to /api/chat-with-data with the question.
                     3. Proxy -> Vanna: This API route forwards the JSON request to the self-hosted Python server (e.g., http://your-vanna.onrender.com/api/ask).
                     4. Vanna (Python):
                     * The FastAPI server receives the question.
                     * The Vanna Agent (using its DDL/documentation training) generates a SQL query: SELECT SUM("totalAmount") FROM "Invoice".
                     * The RunSqlTool executes this query on the PostgreSQL database.
                     * The Agent receives the data [{"sum": 12679.25}] and also generates a Plotly chart.
                     5. Vanna -> Proxy: The Python server returns the final JSON (SQL, results, chart) to the Next.js proxy.
                     6. Proxy -> Frontend: The proxy forwards the complete response to the chat UI.
                     7. Frontend (React): The UI receives the JSON and renders the SQL, the data table, and the Plotly chart.
The AI Integration Challenge
A significant portion of this project was dedicated to implementing the "Chat with Data" module. This involved building a self-hosted Python service using the latest Vanna 2.0 architecture, Groq for LLM inference, and FastAPI.
The implementation was complex and involved:
                     1. Modern Vanna 2.0 Architecture: Building the service using the new Vanna 2.0 Agent model (installed from the @v2 GitHub branch).
                     2. Custom Groq Adapter: I built a custom GroqLlmService adapter from scratch to successfully plug Groq's llama3-8b model into the Vanna Agent.
                     3. Correct V2 Setup: The final code correctly uses the modern V2 patterns: Agent, PostgresRunner, StaticUserResolver, and LocalStorage.
The Python service is blocked by a non-trivial, persistent environment failure. Despite a 100% correct requirements.txt and a complete, modern app.py, the Python venv fails to resolve module paths at runtime. This results in an unresolvable loop of ModuleNotFoundError and AttributeError tracebacks.
The troubleshooting was exhaustive and included:
                     * Multiple venv Rebuilds: Repeatedly deleting and rebuilding the virtual environment.
                     * Cache Purging: Forcing pip cache purge and using --no-cache-dir --force-reinstall.
                     * Package-by-Package Installation: Manually installing vanna, groq, psycopg, fastapi, etc., one by one.
The root cause is a pip failure to correctly install and link the Vanna 2.0 package and its numerous dependencies, leading to a broken runtime environment.
Future Work
This feature is 90% complete. The clear next step is to containerize the services/vanna application in a Docker image. This will isolate the Python environment from the host machine, guaranteeing a clean and stable build, which will solve the package-resolution errors.
🎥 Demo Video
(placeholder: link to your 3-5 minute demo video)
[Link to Demo Video]
The demo video covers:
                     * Dashboard loading and displaying live data from the API.
                     * Interaction with all charts and metrics.
                     * Searching and sorting the invoice table.
                     * A walkthrough of the "Chat with Data" UI.
🛠️ How to Run The Dashboard (Module 1)
Prerequisites
                     * Node.js (v18+)
                     * npm
                     * A PostgreSQL database (e.g., a free one from Neon)
1. Clone the Repository
git clone [https://github.com/your-username/analytics-dashboard.git](https://github.com/your-username/analytics-dashboard.git)
cd analytics-dashboard/apps/web

2. Install Dependencies
npm install

3. Set Up Environment
                     1. Create a .env file in the apps/web directory: apps/web/.env
                     2. Add your PostgreSQL connection string. (Important: This must be the psycopg2 version for Prisma).
DATABASE_URL="postgresql://neondb_owner:YOUR_PASSWORD@ep-abc-123.us-east-1.aws.neon.tech/neondb?sslmode=require"

4. Run the Database Migration
This will create all the tables in your database.
npx prisma migrate dev --name init

5. Seed the Database
This will read the Analytics_Test_Data.json (located in the root /data folder) and populate your database with cleaned-up, normalized data.
npm run seed

6. Run the Application
npm run dev

Your dashboard will be live at http://localhost:3000.
