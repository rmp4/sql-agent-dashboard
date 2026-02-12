import { Card } from '@/components/ui/card';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ZAxis } from 'recharts';

interface ScatterPlotVisualizationProps {
  data: Record<string, any>[];
  xKey: string;
  yKeys: string[];
  title?: string;
}

export function ScatterPlotVisualization({ data, xKey, yKeys, title }: ScatterPlotVisualizationProps) {
  if (!data || data.length === 0) {
    return (
      <Card className="p-4">
        <p className="text-muted-foreground text-center">No data to display</p>
      </Card>
    );
  }

  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

  return (
    <Card className="p-4">
      {title && (
        <div className="mb-4">
          <h3 className="text-lg font-semibold">{title}</h3>
        </div>
      )}
      <ResponsiveContainer width="100%" height={400}>
        <ScatterChart margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis 
            type="number"
            dataKey={xKey}
            name={xKey}
            className="text-sm"
            tick={{ fill: 'currentColor' }}
          />
          <YAxis 
            type="number"
            dataKey={yKeys[0]}
            name={yKeys[0]}
            className="text-sm"
            tick={{ fill: 'currentColor' }}
          />
          <ZAxis range={[60, 400]} />
          <Tooltip 
            cursor={{ strokeDasharray: '3 3' }}
            contentStyle={{ 
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '6px'
            }}
          />
          <Legend />
          {yKeys.map((key, idx) => (
            <Scatter
              key={key}
              name={key}
              data={data}
              fill={colors[idx % colors.length]}
            />
          ))}
        </ScatterChart>
      </ResponsiveContainer>
      <div className="mt-2 text-sm text-muted-foreground text-center">
        {data.length} data point{data.length !== 1 ? 's' : ''}
      </div>
    </Card>
  );
}
