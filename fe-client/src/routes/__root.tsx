import { Outlet, createRootRoute } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import RootLayout from '@/layouts/RootLayout'
import { CartProvider } from '@/contexts/CartContext'
import { AuthProvider } from '@/contexts/AuthContext'

export const Route = createRootRoute({
  component: () => (
    <CartProvider>
      <AuthProvider>
        <RootLayout>
          <Outlet />
          <TanStackRouterDevtools />
        </RootLayout>
      </AuthProvider>
    </CartProvider>
  ),
})
