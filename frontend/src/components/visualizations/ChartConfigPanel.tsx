import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { QueryResult, VisualizationConfig } from '@/types';

interface ChartConfigPanelProps {
  queryResult: QueryResult;
  currentConfig: VisualizationConfig;
  onApply: (config: VisualizationConfig) => void;
  onCancel: () => void;
}

export function ChartConfigPanel({
  queryResult,
  currentConfig,
  onApply,
  onCancel,
}: ChartConfigPanelProps) {
  const [config, setConfig] = useState<VisualizationConfig>(currentConfig);

  const handleApply = () => {
    if (config.type !== 'table' && (!config.xKey || !config.yKeys || config.yKeys.length === 0)) {
      alert('Please select X axis and at least one Y axis column');
      return;
    }
    onApply(config);
  };

  const handleTypeChange = (type: VisualizationConfig['type']) => {
    setConfig({
      ...config,
      type,
      xKey: type === 'table' ? undefined : config.xKey || queryResult.columns[0],
      yKeys: type === 'table' ? undefined : config.yKeys || [queryResult.columns[1]],
    });
  };

  const toggleYKey = (column: string) => {
    const currentYKeys = config.yKeys || [];
    const newYKeys = currentYKeys.includes(column)
      ? currentYKeys.filter((k) => k !== column)
      : [...currentYKeys, column];
    setConfig({ ...config, yKeys: newYKeys });
  };

  const availableYKeys = queryResult.columns.filter((col) => col !== config.xKey);

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <CardTitle className="text-base">Chart Configuration</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">Chart Type</label>
          <Select value={config.type} onValueChange={handleTypeChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="table">Table</SelectItem>
              <SelectItem value="bar">Bar Chart</SelectItem>
              <SelectItem value="horizontalBar">Horizontal Bar Chart</SelectItem>
              <SelectItem value="stackedBar">Stacked Bar Chart</SelectItem>
              <SelectItem value="line">Line Chart</SelectItem>
              <SelectItem value="area">Area Chart</SelectItem>
              <SelectItem value="pie">Pie Chart</SelectItem>
              <SelectItem value="donut">Donut Chart</SelectItem>
              <SelectItem value="scatter">Scatter Plot</SelectItem>
              <SelectItem value="combo">Combo Chart (Bar + Line)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {config.type !== 'table' && (
          <>
            <div>
              <label className="text-sm font-medium mb-2 block">
                X Axis {queryResult.columns.length > 0 && `(${queryResult.columns.length} columns available)`}
              </label>
              <Select
                value={config.xKey}
                onValueChange={(xKey) => setConfig({ ...config, xKey })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select column" />
                </SelectTrigger>
                <SelectContent>
                  {queryResult.columns.map((col) => (
                    <SelectItem key={col} value={col}>
                      {col}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                Y Axis (Multi-select) {availableYKeys.length > 0 && `(${availableYKeys.length} columns available)`}
              </label>
              <div className="space-y-2 max-h-32 overflow-y-auto border rounded-md p-2">
                {availableYKeys.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No columns available (select X-axis first)</p>
                ) : (
                  availableYKeys.map((col) => (
                    <label key={col} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={config.yKeys?.includes(col) || false}
                        onChange={() => toggleYKey(col)}
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm">{col}</span>
                    </label>
                  ))
                )}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Chart Title</label>
              <Input
                value={config.title || ''}
                onChange={(e) => setConfig({ ...config, title: e.target.value })}
                placeholder="Optional chart title"
              />
            </div>
          </>
        )}

        <div className="flex gap-2 pt-2">
          <Button onClick={handleApply} className="flex-1">
            Apply
          </Button>
          <Button onClick={onCancel} variant="outline" className="flex-1">
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
