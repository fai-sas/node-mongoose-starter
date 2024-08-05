import cors from 'cors'
import express, { Application, Request, Response } from 'express'
import cookieParser from 'cookie-parser'
import globalErrorHandler from './app/middlewares/globalErrorhandler'
import notFound from './app/middlewares/notFound'
import router from './app/routes'

const app: Application = express()

//parsers
app.use(express.json())
app.use(cors())
app.use(cookieParser())

// application routes
app.use('/api/v1', router)

app.get('/', (req: Request, res: Response) => {
  res.send('Welcome to Node Mongoose Starter Pack')
})

app.use(globalErrorHandler)
app.use(notFound)

export default app
