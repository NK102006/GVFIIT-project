import { useAuth } from '../../contexts/AuthContext';
import MetricsTracker from '../../components/MetricsTracker';

export default function ClientMetrics() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto">
      <h1 className="text-3xl font-heading font-bold mb-2">Fitness Metrics</h1>
      <p className="text-gray-400 mb-8">Log your body metrics and track your progress over time.</p>
      
      <MetricsTracker clientId={user.uid} />
    </div>
  );
}
