export const PageHeader = ({ title, subtitle }) => {
  return (
    <div className="space-y-1 mb-6">
      <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
      {subtitle && <p className="text-gray-600">{subtitle}</p>}
    </div>
  );
};
