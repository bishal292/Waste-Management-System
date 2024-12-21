
# Waste Management System 🌱

A MERN stack-based platform promoting environmental sustainability through waste reporting, collection, and rewards. The project leverages modern technologies and integrates **Gemini 1.5 Flash Vision** for image verification to make waste management efficient and impactful.

## Features
- **Home Page**: Displays total waste collected, reports submitted, tokens earned, and CO2 offset.
- **Report Page**: Upload waste images for verification, earn tokens based on waste weight.
- **Collect Page**: Collect waste reported by others and earn rewards upon successful collection verification.
- **Rewards Page**: View and redeem rewards from tokens earned.
- **Leaderboard**: Top 100 users ranked by level, based on total points.

---

## Project Structure

### Client-Side (Frontend)
**Directory Structure**:
```
/src
  /assets           -> Contains static assets (images, styles).
  /components       -> Shared UI components and ShadCN UI components.
  /lib              -> Axios API setup.
  /pages            -> Application pages (Home, Report, Collect, Rewards, Leaderboard).
  /store            -> Zustand state management setup.
  /utils            -> Constants and utility functions (e.g., reward point creation).
```

**Environment Variables** (`.env`):
```env
VITE_HOST=<backend_host_url>
VITE_GEMINI_API_KEY=<your_gemini_api_key>
```

**Third-Party Packages**:
- `@google/generative-ai`
- `axios`
- `lucide-react`
- `react-router-dom`
- `tailwindcss`
- `zustand`

---

### Server-Side (Backend)
**Directory Structure**:
```
/controllers   -> Application backend API controller functions.
/db            -> Database connection and schemas.
/middleware    -> Middleware for request handling.
/routes        -> API routes.
/index.js      -> Main entry point for the backend.
```

**Environment Variables** (`.env`):
```env
DB_URL=<database_url>
PORT=<server_running_port>
CLIENT_URL=<frontend_url>
JWT_KEY=<jwt_secret_key>
```

**Third-Party Packages**:
- `bcrypt`
- `cookie-parser`
- `cors`
- `dotenv`
- `express`
- `jsonwebtoken`
- `mongoose`

---

## Setup and Installation

### Prerequisites
- Node.js (v16 or later)
- MongoDB (local or cloud instance) //prefer using local for now for this project.
- Git

### Steps to Run the Project

#### 1. Clone the Repository
```bash
git clone https://github.com/bishal292/Waste-Management-System.git
cd waste-management-system
```

#### 2. Set Up Environment Variables
Create `.env` files for both **client** and **server** as described above.

#### 3. Install Dependencies
**For Client**:
```bash
cd client
npm install
```

**For Server**:
```bash
cd server
npm install
```

#### 4. Start the Application
**Run Backend/Server**:
```bash
cd server
npm run dev
```
Backend server will run at `http://localhost:3000` if PORT is not defined in the env variable.

**Run Frontend/Client**:
```bash
cd client
npm run dev
```
Frontend will run at `http://localhost:5173`.

---

## Contributing
Contributions are welcome! Feel free to fork the repo and submit a pull request along with the improvements details.

---

## License
This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---
# Want to see the full Backend Documentation ? [click Here](/Server/README.MD#api-documentation)