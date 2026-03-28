import '@/lib/errorReporter';
import { enableMapSet } from "immer";
enableMapSet();
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { RouteErrorBoundary } from '@/components/RouteErrorBoundary';
import '@/index.css'
import { HomePage } from '@/pages/HomePage'
import { RegisterPage } from '@/pages/RegisterPage'
import { ResidentsPage } from '@/pages/ResidentsPage'
import { CompliancePage } from '@/pages/CompliancePage'
import { CustodyPage } from '@/pages/CustodyPage'
import { AnalyticsPage } from '@/pages/AnalyticsPage'
import { HistoryPage } from '@/pages/HistoryPage'
import { LoginPage } from '@/pages/LoginPage'
import { ParkingPage } from '@/pages/ParkingPage'
import { AuthGuard } from '@/components/AuthGuard'
import { Toaster } from '@/components/ui/sonner'
const queryClient = new QueryClient();
const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/",
    element: <AuthGuard><HomePage /></AuthGuard>,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/register",
    element: <AuthGuard><RegisterPage /></AuthGuard>,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/parking",
    element: <AuthGuard><ParkingPage /></AuthGuard>,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/custody",
    element: <AuthGuard><CustodyPage /></AuthGuard>,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/residents",
    element: <AuthGuard><ResidentsPage /></AuthGuard>,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/history",
    element: <AuthGuard><HistoryPage /></AuthGuard>,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/analytics",
    element: <AuthGuard adminOnly={true}><AnalyticsPage /></AuthGuard>,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/compliance",
    element: <AuthGuard adminOnly={true}><CompliancePage /></AuthGuard>,
    errorElement: <RouteErrorBoundary />,
  },
]);
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <RouterProvider router={router} />
        <Toaster richColors closeButton position="top-right" />
      </ErrorBoundary>
    </QueryClientProvider>
  </StrictMode>,
)