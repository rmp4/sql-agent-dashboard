import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { TableVisualization } from '@/components/visualizations/TableVisualization';
import { LineChartVisualization } from '@/components/visualizations/LineChartVisualization';
import { BarChartVisualization } from '@/components/visualizations/BarChartVisualization';
import { AreaChartVisualization } from '@/components/visualizations/AreaChartVisualization';
import { PieChartVisualization } from '@/components/visualizations/PieChartVisualization';
import { DonutChartVisualization } from '@/components/visualizations/DonutChartVisualization';
import { HorizontalBarChartVisualization } from '@/components/visualizations/HorizontalBarChartVisualization';
import { StackedBarChartVisualization } from '@/components/visualizations/StackedBarChartVisualization';
import { ScatterPlotVisualization } from '@/components/visualizations/ScatterPlotVisualization';
import { ComboChartVisualization } from '@/components/visualizations/ComboChartVisualization';
import type { Dashboard, SavedChart } from '@/types';

export function DashboardDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchDashboard = async () => {
      if (!id) return;

      try {
        const response = await fetch(`/api/dashboards/${id}`);
        if (!response.ok) {
          throw new Error('Dashboard not found');
        }
        const data = await response.json();
        setDashboard(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [id]);

  const renderChart = (chart: SavedChart) => {
    const viz = chart.visualization;

    if (viz.type === 'table' && chart.queryResult) {
      return (
        <TableVisualization
          columns={chart.queryResult.columns}
          rows={chart.queryResult.rows}
          rowCount={chart.queryResult.rowCount}
        />
      );
    }

    if (!viz.xKey || !viz.yKeys || viz.yKeys.length === 0 || !chart.queryResult) {
      return (
        <Card className="p-8">
          <p className="text-center text-muted-foreground">
            No data available. Execute query to see visualization.
          </p>
        </Card>
      );
    }

    const data = chart.queryResult.rows;

    switch (viz.type) {
      case 'line':
        return (
          <LineChartVisualization
            data={data}
            xKey={viz.xKey}
            yKeys={viz.yKeys}
            title={chart.title}
          />
        );
      case 'bar':
        return (
          <BarChartVisualization
            data={data}
            xKey={viz.xKey}
            yKeys={viz.yKeys}
            title={chart.title}
          />
        );
      case 'area':
        return (
          <AreaChartVisualization
            data={data}
            xKey={viz.xKey}
            yKeys={viz.yKeys}
            title={chart.title}
          />
        );
      case 'pie':
        return (
          <PieChartVisualization
            data={data}
            xKey={viz.xKey}
            yKeys={viz.yKeys}
            title={chart.title}
          />
        );
      case 'donut':
        return (
          <DonutChartVisualization
            data={data}
            xKey={viz.xKey}
            yKeys={viz.yKeys}
            title={chart.title}
          />
        );
      case 'horizontalBar':
        return (
          <HorizontalBarChartVisualization
            data={data}
            xKey={viz.xKey}
            yKeys={viz.yKeys}
            title={chart.title}
          />
        );
      case 'stackedBar':
        return (
          <StackedBarChartVisualization
            data={data}
            xKey={viz.xKey}
            yKeys={viz.yKeys}
            title={chart.title}
          />
        );
      case 'scatter':
        return (
          <ScatterPlotVisualization
            data={data}
            xKey={viz.xKey}
            yKeys={viz.yKeys}
            title={chart.title}
          />
        );
      case 'combo':
        return (
          <ComboChartVisualization
            data={data}
            xKey={viz.xKey}
            yKeys={viz.yKeys}
            title={chart.title}
            barKeys={viz.barKeys}
            lineKeys={viz.lineKeys}
          />
        );
      default:
        if (chart.queryResult) {
          return (
            <TableVisualization
              columns={chart.queryResult.columns}
              rows={chart.queryResult.rows}
              rowCount={chart.queryResult.rowCount}
            />
          );
        }
        return (
          <Card className="p-8">
            <p className="text-center text-muted-foreground">
              Unsupported visualization type
            </p>
          </Card>
        );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-lg" style={{ fontFamily: 'Sora', color: '#5E5E5E' }}>
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (error || !dashboard) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-lg text-destructive mb-4" style={{ fontFamily: 'Sora' }}>
            {error || 'Dashboard not found'}
          </p>
          <Button onClick={() => navigate('/dashboards')} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboards
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      <div className="flex-shrink-0 px-16 py-12 bg-[#FAFAFA]">
        <div className="mb-4">
          <Button
            onClick={() => navigate('/dashboards')}
            variant="ghost"
            size="sm"
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboards
          </Button>
        </div>
        <h1 className="text-5xl font-semibold tracking-tight mb-2" style={{ fontFamily: 'Sora', letterSpacing: '-0.04em' }}>
          {dashboard.name}
        </h1>
        {dashboard.description && (
          <p className="text-base" style={{ color: '#5E5E5E', fontFamily: 'Sora' }}>
            {dashboard.description}
          </p>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-16 pb-12">
        {dashboard.charts.length === 0 ? (
          <div className="text-center py-20 border border-[#E5E5E5]">
            <p className="text-[#999999]" style={{ fontFamily: 'Sora' }}>
              No charts in this dashboard yet. Save charts from the Chat interface to see them here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dashboard.charts.map((chart) => (
              <div key={chart.id} className="space-y-2">
                {renderChart(chart)}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
