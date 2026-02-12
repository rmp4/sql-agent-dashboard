import { Card } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface HorizontalBarChartVisualizationProps {
  data: Record<string, any>[];
  xKey: string;
  yKeys: string[];
  title?: string;
}

export function HorizontalBarChartVisualization({ data, xKey, yKeys, title }: HorizontalBarChartVisualizationProps) {
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
      <ResponsiveContainer width="100%" height={Math.max(400, data.length * 50)}>
        <BarChart data={data} layout="horizontal" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis 
            type="number"
            className="text-sm"
            tick={{ fill: 'currentColor' }}
          />
          <YAxis 
            type="category"
            dataKey={xKey}
            className="text-sm"
            tick={{ fill: 'currentColor' }}
            width={100}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '6px'
            }}
          />
          <Legend />
          {yKeys.map((key, idx) => (
            <Bar
              key={key}
              dataKey={key}
              fill={colors[idx % colors.length]}
              radius={[0, 4, 4, 0]}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
      <div className="mt-2 text-sm text-muted-foreground text-center">
        {data.length} data point{data.length !== 1 ? 's' : ''}
      </div>
    </Card>
  );
}
