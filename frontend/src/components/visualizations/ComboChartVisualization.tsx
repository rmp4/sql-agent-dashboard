import { Card } from '@/components/ui/card';
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ComboChartVisualizationProps {
  data: Record<string, any>[];
  xKey: string;
  yKeys: string[];
  title?: string;
  barKeys?: string[];
  lineKeys?: string[];
}

export function ComboChartVisualization({ 
  data, 
  xKey, 
  yKeys, 
  title,
  barKeys,
  lineKeys
}: ComboChartVisualizationProps) {
  if (!data || data.length === 0) {
    return (
      <Card className="p-4">
        <p className="text-muted-foreground text-center">No data to display</p>
      </Card>
    );
  }

  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];
  
  const effectiveBarKeys = barKeys || yKeys.slice(0, Math.ceil(yKeys.length / 2));
  const effectiveLineKeys = lineKeys || yKeys.slice(Math.ceil(yKeys.length / 2));

  return (
    <Card className="p-4">
      {title && (
        <div className="mb-4">
          <h3 className="text-lg font-semibold">{title}</h3>
        </div>
      )}
      <ResponsiveContainer width="100%" height={400}>
        <ComposedChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis 
            dataKey={xKey} 
            className="text-sm"
            tick={{ fill: 'currentColor' }}
          />
          <YAxis 
            className="text-sm"
            tick={{ fill: 'currentColor' }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '6px'
            }}
          />
          <Legend />
          {effectiveBarKeys.map((key, idx) => (
            <Bar
              key={key}
              dataKey={key}
              fill={colors[idx % colors.length]}
              radius={[4, 4, 0, 0]}
            />
          ))}
          {effectiveLineKeys.map((key, idx) => (
            <Line
              key={key}
              type="monotone"
              dataKey={key}
              stroke={colors[(effectiveBarKeys.length + idx) % colors.length]}
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          ))}
        </ComposedChart>
      </ResponsiveContainer>
      <div className="mt-2 text-sm text-muted-foreground text-center">
        {data.length} data point{data.length !== 1 ? 's' : ''}
      </div>
    </Card>
  );
}
