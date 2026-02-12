import { PieChartVisualization } from './PieChartVisualization';

interface DonutChartVisualizationProps {
  data: Record<string, any>[];
  xKey: string;
  yKeys: string[];
  title?: string;
}

export function DonutChartVisualization({ data, xKey, yKeys, title }: DonutChartVisualizationProps) {
  return (
    <PieChartVisualization 
      data={data} 
      xKey={xKey} 
      yKeys={yKeys} 
      title={title} 
      innerRadius={60}
    />
  );
}
