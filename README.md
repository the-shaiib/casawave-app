# 🛍️ CASAWAVE – Full-Stack E-commerce Platform

Modern full-stack e-commerce web application for clothing brand with customer shopping experience and powerful admin dashboard.

---

## ✨ Features

### 👥 Customer
- Browse & search products by category
- View detailed product pages with images
- Select size (S/M/L/XL) and quantity
- Checkout with email, phone, location
- Track orders by email
- Responsive on mobile, tablet, desktop

### 🔐 Admin Dashboard
- Secure JWT login with passcode
- Add/remove products with multiple images
- View & archive all customer orders
- Upload homepage hero image
- Customize site settings

---

## 💻 Tech Stack

**Frontend**: React 19 • Vite 7.3 • React Router 7 • Axios 1.13 • CSS3

**Backend**: Node.js • Express 5.2 • MongoDB • Mongoose 9.2 • JWT • bcrypt

**Database**: MongoDB with Mongoose ODM

---

## 🚀 Quick Start

### Prerequisites
- Node.js v16+ • MongoDB • Git

### Backend Setup
```bash
cd server
npm install

# Create .env file
# MONGO_URI=your_mongodb_connection
# PORT=5000
# JWT_SECRET=your_secret_key

npm run seed:admin  # Create admin once
npm run dev         # Start server
```

### Frontend Setup
```bash
cd client
npm install
npm run dev         # Start dev server on :5173
```

### Production Build
```bash
cd client
npm run build       # Creates optimized dist/ folder
cd ../server
npm start           # Server serves client build
```

---

## 📚 Available Scripts

**Client**: `npm run dev` | `npm run build` | `npm run lint`

**Server**: `npm start` | `npm run dev` | `npm run seed:admin` | `npm run db:products:list`

---

## 🔌 Key API Endpoints

```
POST   /api/admin/login           - Admin login
GET    /api/products              - Get all products
POST   /api/products/create       - Add product (admin)
DELETE /api/products/:id          - Remove product (admin)
POST   /api/orders/create         - Place order
GET    /api/orders                - Get all orders (admin)
PUT    /api/site-settings         - Update hero image (admin)
```

---

## 📊 Database Models

**Admin**: passcodeHash (bcrypt hashed)

**Product**: name, price, category, image, description, availableSizes, additionalImages

**Order**: customerName, email, phone, location, productId, size, quantity, archived

**SiteSettings**: homeHeroImage

---

## 🌐 Live Demo

🔗 **https://casawave-official.onrender.com/**

---

## 📖 Pages

- **Home**: Hero + featured products
- **Products**: Browse all items
- **Product Details**: Full product info
- **About**: Brand info
- **Contact**: Contact form
- **Orders**: Track orders by email
- **Admin Login**: Secure authentication
- **Admin Dashboard**: Manage products, orders, settings
- **Thank You**: Order confirmation

---

## 🔐 Security

- JWT token-based authentication
- Bcrypt password hashing
- Protected admin routes
- CORS enabled
- Input validation & sanitization

---

## 📁 Project Structure

```
brand-app/
├── client/           (React SPA with 8 routes)
│   └── src/
│       ├── pages/    (8 page components)
│       ├── components/ (Navbar, Footer, Card, etc)
│       └── context/  (State management)
├── server/           (Express API)
│   ├── routes/       (Auth, Products, Orders, Settings)
│   ├── models/       (Admin, Product, Order, Settings)
│   ├── controllers/  (Business logic)
│   └── middleware/   (Auth verification)
└── README.md
```

---

## 🔧 Environment Variables

**Server (.env)**
```
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/casawave
PORT=5000
JWT_SECRET=your_secret_key
```

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| MongoDB connection error | Check connection string in `.env`, verify IP whitelist |
| API 404 errors | Ensure server running on port 5000 |
| Admin login fails | Run `npm run seed:admin`, verify JWT_SECRET |
| Products not loading | Check MongoDB connection, clear cache |

---

## 📄 License

ISC License

---

**Last Updated**: April 2026 | Version: 1.0.0
