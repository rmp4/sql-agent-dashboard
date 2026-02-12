import { Card } from '@/components/ui/card';

interface TableVisualizationProps {
  columns: string[];
  rows: Record<string, any>[];
  rowCount?: number;
}

export function TableVisualization({ columns, rows, rowCount }: TableVisualizationProps) {
  if (!rows || rows.length === 0) {
    return (
      <Card className="p-4">
        <p className="text-muted-foreground text-center">No data to display</p>
      </Card>
    );
  }

  return (
    <Card className="p-4 overflow-auto">
      <div className="mb-2 text-sm text-muted-foreground">
        {rowCount !== undefined && `${rowCount} row${rowCount !== 1 ? 's' : ''}`}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b">
              {columns.map((column, idx) => (
                <th
                  key={idx}
                  className="px-4 py-2 text-left text-sm font-semibold bg-muted"
                >
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIdx) => (
              <tr key={rowIdx} className="border-b hover:bg-muted/50">
                {columns.map((column, colIdx) => (
                  <td key={colIdx} className="px-4 py-2 text-sm">
                    {formatValue(row[column])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function formatValue(value: any): string {
  if (value === null || value === undefined) {
    return '-';
  }
  if (typeof value === 'object') {
    return JSON.stringify(value);
  }
  return String(value);
}
