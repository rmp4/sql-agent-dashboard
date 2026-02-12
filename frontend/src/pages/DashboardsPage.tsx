import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface Dashboard {
  id: string;
  name: string;
  description: string | null;
  layout: Record<string, any> | null;
  charts: any[];
  created_at: string;
  updated_at: string;
}

export function DashboardsPage() {
  const navigate = useNavigate();
  const [dashboards, setDashboards] = useState<Dashboard[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newDashboard, setNewDashboard] = useState({ name: '', description: '' });
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    fetch('http://localhost:8000/api/dashboards')
      .then(res => res.json())
      .then(data => {
        setDashboards(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch dashboards:', err);
        setLoading(false);
      });
  }, []);

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const handleCreateDashboard = async () => {
    if (!newDashboard.name.trim()) return;

    setIsCreating(true);
    try {
      const response = await fetch('http://localhost:8000/api/dashboards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newDashboard.name,
          description: newDashboard.description || null,
          layout: null
        }),
      });

      if (!response.ok) throw new Error('Failed to create dashboard');

      const created = await response.json();
      setDashboards(prev => [...prev, created]);
      setIsDialogOpen(false);
      setNewDashboard({ name: '', description: '' });
    } catch (err) {
      console.error('Failed to create dashboard:', err);
      alert('Failed to create dashboard');
    } finally {
      setIsCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="px-16 py-12">
        <div className="text-center text-[#999999]" style={{ fontFamily: 'Sora' }}>
          Loading dashboards...
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      <div className="flex-shrink-0 px-16 py-12 bg-[#FAFAFA]">
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-5xl font-semibold tracking-tight mb-2" style={{ fontFamily: 'Sora', letterSpacing: '-0.04em' }}>
              Dashboards
            </h1>
            <p className="text-base" style={{ color: '#5E5E5E', fontFamily: 'Sora' }}>
              Manage your analytics and insights
            </p>
          </div>
          <button 
            onClick={() => setIsDialogOpen(true)}
            className="px-5 py-3 bg-[#DC2626] text-white font-medium text-sm hover:bg-[#B91C1C] transition-colors" 
            style={{ fontFamily: 'Sora' }}
          >
            + New Dashboard
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-16 pb-12">
        {dashboards.length === 0 ? (
          <div className="text-center py-20 border border-[#E5E5E5]">
            <p className="text-[#999999]" style={{ fontFamily: 'Sora' }}>
              No dashboards yet. Create your first dashboard to get started.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-6">
            {dashboards.map((dashboard) => (
              <div 
                key={dashboard.id}
                className="border border-[#E5E5E5] p-6 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => navigate(`/dashboards/${dashboard.id}`)}
              >
                <h3 className="text-xl font-semibold mb-2" style={{ fontFamily: 'Sora' }}>
                  {dashboard.name}
                </h3>
                <p className="text-sm mb-4" style={{ color: '#5E5E5E', fontFamily: 'Sora' }}>
                  {dashboard.description || 'No description'}
                </p>
                <div className="flex items-center gap-4 text-xs" style={{ color: '#999999', fontFamily: 'IBM Plex Mono' }}>
                  <span>{dashboard.charts.length} Charts</span>
                  <span>•</span>
                  <span>Updated {formatTimeAgo(dashboard.updated_at)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Dashboard</DialogTitle>
            <DialogDescription>
              Add a new dashboard to organize your analytics and insights.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 my-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ fontFamily: 'Sora' }}>
                Name *
              </label>
              <Input
                value={newDashboard.name}
                onChange={(e) => setNewDashboard(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Sales Dashboard"
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ fontFamily: 'Sora' }}>
                Description
              </label>
              <Textarea
                value={newDashboard.description}
                onChange={(e) => setNewDashboard(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Optional description..."
                rows={3}
                className="w-full"
              />
            </div>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setIsDialogOpen(false);
                setNewDashboard({ name: '', description: '' });
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleCreateDashboard}
              disabled={!newDashboard.name.trim() || isCreating}
              className="bg-[#DC2626] hover:bg-[#B91C1C]"
            >
              {isCreating ? 'Creating...' : 'Create Dashboard'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
