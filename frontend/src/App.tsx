import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { PrivateRoute } from './components/common/PrivateRoute';
import { Login } from './pages/Auth/Login';
import { Register } from './pages/Auth/Register';
import { ForgotPassword } from './pages/Auth/ForgotPassword';
import { EmailVerification } from './pages/Auth/EmailVerification';
import Dashboard from './pages/Dashboard';
import { Transactions } from './pages/Transactions';
import { AddTransaction } from './pages/Transactions/AddTransaction';
import { EditTransaction } from './pages/Transactions/EditTransaction';
import { Categories } from './pages/Categories';
import { Partnership } from './pages/Partnership';
import { Budgets } from './pages/Budgets';
import { AddBudget } from './pages/Budgets/AddBudget';
import { Terms } from './pages/Legal/Terms';
import { Privacy } from './pages/Legal/Privacy';
import { Notifications } from './pages/Notifications';
import './styles/globals.scss';

// Placeholder pages
const Onboarding = () => (
  <div style={{ padding: '2rem', textAlign: 'center' }}>
    <h1>✨ Welcome to Money Dairy Lovers!</h1>
    <p>Let's set up your profile...</p>
  </div>
);

import { Reports } from './pages/Reports';
import { Love } from './pages/Love';
import { RecurringTransactions } from './pages/RecurringTransactions';
import { AddRecurringTransaction } from './pages/RecurringTransactions/AddRecurringTransaction';
import { Settings } from './pages/Settings';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

// App content that uses auth context
const AppContent = () => {
  return (
    <Router>
      <div className="app">
        <Routes>
          {/* Public routes */}
          <Route path="/auth/login" element={<Login />} />
          <Route path="/auth/register" element={<Register />} />
          <Route path="/auth/forgot-password" element={<ForgotPassword />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          
          {/* Protected routes */}
          <Route
            path="/auth/verify-email"
            element={
              <PrivateRoute>
                <EmailVerification />
              </PrivateRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/transactions"
            element={
              <PrivateRoute>
                <Transactions />
              </PrivateRoute>
            }
          />
          <Route
            path="/transactions/add"
            element={
              <PrivateRoute>
                <AddTransaction />
              </PrivateRoute>
            }
          />
          <Route
            path="/transactions/edit/:id"
            element={
              <PrivateRoute>
                <EditTransaction />
              </PrivateRoute>
            }
          />
          <Route
            path="/categories"
            element={
              <PrivateRoute>
                <Categories />
              </PrivateRoute>
            }
          />
          <Route
            path="/partnership"
            element={
              <PrivateRoute>
                <Partnership />
              </PrivateRoute>
            }
          />
          <Route
            path="/budgets"
            element={
              <PrivateRoute>
                <Budgets />
              </PrivateRoute>
            }
          />
          <Route
            path="/budgets/add"
            element={
              <PrivateRoute>
                <AddBudget />
              </PrivateRoute>
            }
          />
          <Route
            path="/budgets/edit/:id"
            element={
              <PrivateRoute>
                <AddBudget />
              </PrivateRoute>
            }
          />
          <Route
            path="/reports"
            element={
              <PrivateRoute>
                <Reports />
              </PrivateRoute>
            }
          />
          <Route
            path="/love"
            element={
              <PrivateRoute>
                <Love />
              </PrivateRoute>
            }
          />
          <Route
            path="/recurring-transactions"
            element={
              <PrivateRoute>
                <RecurringTransactions />
              </PrivateRoute>
            }
          />
          <Route
            path="/recurring-transactions/add"
            element={
              <PrivateRoute>
                <AddRecurringTransaction />
              </PrivateRoute>
            }
          />
          <Route
            path="/recurring-transactions/edit/:id"
            element={
              <PrivateRoute>
                <AddRecurringTransaction />
              </PrivateRoute>
            }
          />
          <Route
            path="/onboarding"
            element={
              <PrivateRoute>
                <Onboarding />
              </PrivateRoute>
            }
          />
          <Route
            path="/notifications"
            element={
              <PrivateRoute>
                <Notifications />
              </PrivateRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <PrivateRoute>
                <Settings />
              </PrivateRoute>
            }
          />
          
          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/auth/login" replace />} />
          <Route path="*" element={<Navigate to="/auth/login" replace />} />
        </Routes>
      </div>
    </Router>
  );
};

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          <AuthProvider>
            <ThemeProvider>
              <NotificationProvider>
                <AppContent />
                {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
              </NotificationProvider>
            </ThemeProvider>
          </AuthProvider>
        </ToastProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;