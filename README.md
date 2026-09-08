# HopeBox — A Donation Website

A donation platform where users can create an account, donate items to NGOs, and download a PDF receipt for their donation.

Built as a team project (Team 17).

## Features

- User authentication (signup, login, logout) with hashed passwords
- Item donation form with server-side validation
- Automatic PDF receipt generation
- NGO Bazaar — browse products with cart, wishlist, search and filters
- Volunteer and Celebrate Moments information pages

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Node.js, Express |
| Database | MongoDB Atlas |
| Frontend | HTML, CSS, JavaScript, Bootstrap 5 |
| Authentication | express-session, bcryptjs |
| PDF generation | pdfkit |

## Requirements

- Node.js (v18 or higher)
- A MongoDB Atlas account
- An internet connection — the database is cloud-hosted and Bootstrap is loaded from a CDN

## Setup

1. Clone the repository and install dependencies:

```bash
   npm install
```

2. Create a `.env` file in the root folder:

```
   MONGODB_URL=<your MongoDB Atlas connection string>
   SESSION_SECRET=<a long random string>
```

   Generate a session secret with:

```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

3. In MongoDB Atlas, add your machine's IP address to the project's IP Access List.

4. Start the server:

```bash
   npm start
```

5. Open `http://localhost:3000` in your browser.

The database and collections are created automatically on first run.

## API Routes

| Method | Route | Description | Auth required |
|---|---|---|---|
| POST | `/api/signup` | Create a new account | No |
| POST | `/api/login` | Log in | No |
| POST | `/api/logout` | Log out | No |
| GET | `/api/profile` | Get the logged-in user's details | Yes |
| GET | `/api/auth/status` | Check whether the user is logged in | No |
| POST | `/api/donate-item` | Submit an item donation | No |
| GET | `/api/generate-receipt` | Download a PDF receipt | No |

## Database Schema

**Users**
```
{ username, email, password (bcrypt hash), createdAt }
```

**Donations**
```
{ donationId, name, contact, email, location, category,
  description, quantity, date, status, type }
```

## Security Notes

- Passwords are hashed with bcrypt before being stored — plain text passwords are never saved
- Database credentials and the session secret are kept in environment variables, not in the source code
- Database access is restricted to a specific IP allowlist (`0.0.0.0/0` is not used)
- All POST routes validate input on the server, not just in the browser
- Request fields are explicitly whitelisted before being written to the database
- Login returns the same error message for an unknown email and a wrong password, so the API does not reveal which emails are registered

## Current Limitations

These are known gaps, not bugs:

- **Payments are simulated.** No payment gateway is integrated. The UPI QR codes and card forms are for demonstration only, and no money is processed.
- **Monetary donations are not stored.** The donate-now page generates a receipt from form data without saving anything to the database.
- **The NGO Bazaar cart and wishlist are client-side only.** They are held in browser memory and are lost on refresh. Orders are not persisted.
- **Sessions are stored in server memory**, so all users are logged out when the server restarts.
- **The receipt endpoint does not verify ownership.** It generates a PDF from query parameters without checking that a matching donation exists.
- **No rate limiting** on the login and signup routes.
- **No automated tests.**

## Possible Next Steps

- Store sessions in MongoDB using `connect-mongo` so they survive restarts
- Add rate limiting to the authentication routes
- Tie receipt generation to real donation records
- Integrate a payment gateway (Razorpay) in test mode
- Move static files into a `public/` folder so server source files are not served to the browser
- Add automated tests