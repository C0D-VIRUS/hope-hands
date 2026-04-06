# HopeHands

HopeHands is a React + Vite frontend with a Node.js/Express backend connected to MySQL for NGO requests and donation records.

## What works

- NGOs can post donation requests.
- Donors can submit donations.
- Every donation is stored with a generated UUID.
- Confirmation email logic is included through Nodemailer.
- Gmail-only validation is enforced for NGO and donor email fields.
- MySQL tables are created automatically when the backend starts.

## Backend setup

1. Copy [.env.example](/C:/Users/Dinesh/hope-hands/.env.example) to `.env`.
2. Fill in your local MySQL credentials.
3. If you want real confirmation emails, fill in the SMTP values too.

Example:

```env
PORT=4000
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=your_mysql_password
MYSQL_DATABASE=hope_hands
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=yourgmail@gmail.com
SMTP_PASS=your-gmail-app-password
SMTP_FROM=yourgmail@gmail.com
```

## Run locally

Start the API:

```bash
npm run server
```

Start the React app in another terminal:

```bash
npm run dev
```

The frontend expects the API at `http://localhost:4000/api`.

## API routes

- `GET /api/health`
- `GET /api/requests`
- `POST /api/requests`
- `POST /api/donations`

## Database schema

The SQL reference is in [server/schema.sql](/C:/Users/Dinesh/hope-hands/server/schema.sql).

## Notes

- If SMTP is not configured, donation emails are generated in preview mode and logged by the backend instead of being sent.
- The backend startup will fail until valid MySQL credentials are supplied in `.env`.
