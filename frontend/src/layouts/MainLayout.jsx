import { useAuth } from '../context/AuthContext';
import { AppShell } from './AppShell';

export const MainLayout = ({ children }) => {
  const { user } = useAuth();

  if (!user) {
    return <div className="min-h-screen">{children}</div>;
  }

  return <AppShell>{children}</AppShell>;
};
