import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { Blog } from './pages/Blog.jsx'
import { Signup } from './pages/Signup.jsx'
import { Login } from './pages/Login.jsx'
import { AuthContextProvider } from './contexts/AuthContext.jsx'
import { io } from 'socket.io-client'

const queryClient = new QueryClient()

const router = createBrowserRouter([
  {
    path: '/',
    element: <Blog />,
  },
  {
    path: '/signup',
    element: <Signup />,
  },
  {
    path: '/login',
    element: <Login />,
  },
])

const socket = io(import.meta.env.VITE_SOCKET_HOST, {
  query: window.location.search.substring(1),
  auth: {
    token: window.localStorage.getItem('token'),
  },
})

socket.on('connect', async () => {
  console.log('Connected to Socket.IO as: ', socket.id)
  const userInfo = await socket.emitWithAck('user.info', socket.id)
  console.log('User info: ', userInfo)
})

socket.on('connect_error', (err) => {
  console.error('Socket.IO connection error: ', err)
})

socket.on('chat.message', (msg) => {
  console.log(`${msg.username}: ${msg.message}`)
})

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthContextProvider>
        <RouterProvider router={router} />
      </AuthContextProvider>
    </QueryClientProvider>
  )
}
