import { app } from './app'
import { env } from './env'

app.listen(env.port, () => {
  console.log(`Server listening on http://localhost:${env.port}`)
})
