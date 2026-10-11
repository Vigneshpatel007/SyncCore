# SyncCore: Integrated Business Management System

A centralized Java backend with a React front end for managing **products, inventory, customers,
suppliers, employees and sales** in one platform, protected by **JWT + Spring Security**.

**Tech stack:** React (Vite) · Spring Boot 3 (Web, Data JPA, Security) · MySQL 8 · JWT · Maven · Docker

## 1. Run it (choose one)

### Option A: Docker (one command)
```bash
docker compose up --build
```
- Website: http://localhost
- Swagger API docs: http://localhost:8080/swagger-ui.html

### Option B: Run each part yourself
**Requirements:** Java 17, Maven, Node 18+, MySQL 8 running on port 3306.

```bash
# 1) Backend  (edit DB password in backend/src/main/resources/application.properties if yours is not "root")
cd backend
mvn spring-boot:run          # starts on http://localhost:8080 and creates the "synccore" database + tables

# 2) Frontend (new terminal)
cd frontend
npm install
npm run dev                  # opens on http://localhost:5173
```

### Demo accounts (created automatically on first start)
| Username | Password   | Role          |
|----------|------------|---------------|
| admin    | admin123   | Administrator |
| staff    | staff123   | Employee      |

An **Employee** cannot open Employees/Reports, cannot delete records, and gets `403` from the API if they try.

## 2. Project structure
```
synccore/
├── backend/                    Spring Boot (Java)
│   └── src/main/java/com/synccore/
│       ├── entity/             Java classes mapped to MySQL tables
│       ├── repository/         Spring Data JPA interfaces (database access)
│       ├── dto/                Request/response shapes + validation rules
│       ├── service/            Business logic (stock check, totals, reports)
│       ├── controller/         REST endpoints
│       ├── security/           JWT creation, JWT filter, user loading
│       ├── config/             SecurityConfig, Swagger config, demo-data seeder
│       └── exception/          Global error handling
├── frontend/                   React (Vite)
│   └── src/
│       ├── api/axios.js        HTTP client + token interceptors
│       ├── context/            AuthContext (login state)
│       ├── hooks/useFetch.js   Data-fetching hook
│       ├── components/         Layout, CrudPage, Modal, Pagination, ErrorBoundary...
│       └── pages/              Login, Dashboard, Products, Inventory, Orders, Reports...
├── docker-compose.yml          MySQL + backend + frontend
└── STUDY_GUIDE.md              Explains every part of the code (read this before your viva)
```

## 3. API summary
| Area | Endpoints | Who |
|------|-----------|-----|
| Auth | `POST /api/auth/login`, `GET /api/auth/me` | public / any logged-in user |
| Customers, Suppliers | `GET/POST/PUT /api/customers`, `/api/suppliers`; `DELETE` | all roles; delete = Admin |
| Products | `GET/POST/PUT /api/products`; `DELETE` | all roles; delete = Admin |
| Inventory | `GET /api/inventory`, `GET /api/inventory/low-stock`, `PUT /api/inventory/{id}` | all roles |
| Orders | `GET/POST /api/orders`, `PUT /api/orders/{id}/cancel` | all roles |
| Employees | `GET/POST/PUT/DELETE /api/employees` | Admin only |
| Reports | `GET /api/reports/summary`, `/sales-by-date`, `/top-products` | Admin only |

Health check: `GET /actuator/health` · Metrics: `/actuator/metrics` (login required).

## 4. Run the tests
```bash
cd backend && mvn test       # JUnit 5 + Mockito unit tests for the order/stock business rule
```

## 5. Deploying
- **Backend** (Render / Railway): deploy the `backend` folder using its Dockerfile. Set env variables
  `DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD, JWT_SECRET` (use a managed MySQL).
- **Frontend** (Netlify / Vercel): build command `npm run build`, publish folder `dist`, and set
  `VITE_API_URL=https://<your-backend-url>/api`. Add that site's address to `allowedOrigins`
  in `SecurityConfig.java`.
