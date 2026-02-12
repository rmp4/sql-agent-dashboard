import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, RefreshCw } from 'lucide-react';
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
import type { Dashboard, SavedChart, QueryResult } from '@/types';

export function DashboardDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [chartData, setChartData] = useState<Record<string, QueryResult>>({});
  const [loadingCharts, setLoadingCharts] = useState<Set<string>>(new Set());

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
        
        if (data.charts && data.charts.length > 0) {
          await executeAllCharts(data.charts);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [id]);

  const executeAllCharts = async (charts: SavedChart[]) => {
    for (const chart of charts) {
      await executeChart(chart.id);
    }
  };

  const executeChart = async (chartId: string) => {
    setLoadingCharts(prev => new Set(prev).add(chartId));
    
    try {
      const response = await fetch(`/api/charts/${chartId}/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!response.ok) {
        throw new Error('Failed to execute chart query');
      }
      
      const data = await response.json();
      const queryResult = data.query_result;
      
      setChartData(prev => ({
        ...prev,
        [chartId]: {
          columns: queryResult.columns,
          rows: queryResult.rows,
          rowCount: queryResult.row_count || queryResult.rowCount
        }
      }));
    } catch (err) {
      console.error(`Failed to execute chart ${chartId}:`, err);
    } finally {
      setLoadingCharts(prev => {
        const newSet = new Set(prev);
        newSet.delete(chartId);
        return newSet;
      });
    }
  };

  const renderChart = (chart: SavedChart) => {
    const viz = chart.visualization;
    const queryResult = chartData[chart.id];
    const isLoading = loadingCharts.has(chart.id);

    if (isLoading) {
      return (
        <Card className="p-8">
          <div className="flex items-center justify-center">
            <RefreshCw className="h-5 w-5 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">Loading data...</span>
          </div>
        </Card>
      );
    }

    if (!queryResult) {
      return (
        <Card className="p-8">
          <p className="text-center text-muted-foreground">
            No data available. Click refresh to execute query.
          </p>
          <div className="flex justify-center mt-4">
            <Button variant="outline" size="sm" onClick={() => executeChart(chart.id)}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </Card>
      );
    }

    if (viz.type === 'table') {
      return (
        <TableVisualization
          columns={queryResult.columns}
          rows={queryResult.rows}
          rowCount={queryResult.rowCount}
        />
      );
    }

    if (!viz.xKey || !viz.yKeys || viz.yKeys.length === 0) {
      return (
        <TableVisualization
          columns={queryResult.columns}
          rows={queryResult.rows}
          rowCount={queryResult.rowCount}
        />
      );
    }

    const data = queryResult.rows;

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
        if (queryResult) {
          return (
            <TableVisualization
              columns={queryResult.columns}
              rows={queryResult.rows}
              rowCount={queryResult.rowCount}
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
