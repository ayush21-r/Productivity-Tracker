import { Header } from '../components/Header';

export const AppShell = ({ children }) => {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <Header />

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-8 py-6">
        {children}
      </div>
    </div>
  );
};
