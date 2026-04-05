import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import rateLimit from 'express-rate-limit'
import authRoutes from './routes/auth.js'
import opportunityRoutes from './routes/opportunities.js'
import userRoutes from './routes/users.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
})

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}))
app.use(express.json())
app.use('/api/', apiLimiter)

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/opportunities', opportunityRoutes)
app.use('/api/users', userRoutes)

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'Backend is running' })
})

// Start server
app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`)
})

export default app
