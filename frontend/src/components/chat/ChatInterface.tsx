import { useState, useRef, useEffect } from 'react';
import { Send, Settings, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
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
import { ChartConfigPanel } from '@/components/visualizations/ChartConfigPanel';
import { CodeBlock } from '@/components/visualizations/CodeBlock';
import type { Message, VisualizationConfig, Dashboard, Rule, DataSourceConnection } from '@/types';

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [editingConfigForMessage, setEditingConfigForMessage] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const [rules, setRules] = useState<Rule[]>([]);
  const [dashboards, setDashboards] = useState<Dashboard[]>([]);
  const [dataSources, setDataSources] = useState<DataSourceConnection[]>([]);
  const [selectedDataSourceId, setSelectedDataSourceId] = useState<string>('');
  const [savingChartMessage, setSavingChartMessage] = useState<Message | null>(null);
  const [selectedDashboardId, setSelectedDashboardId] = useState<string>('');
  const [chartTitle, setChartTitle] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string>('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const fetchDashboards = async () => {
      try {
        const response = await fetch('/api/dashboards');
        if (response.ok) {
          const data = await response.json();
          setDashboards(data);
        }
      } catch (error) {
        console.error('Failed to fetch dashboards:', error);
      }
    };

    const fetchRules = async () => {
      try {
        const response = await fetch('/api/rules');
        if (response.ok) {
          const data = await response.json();
          setRules(data);
        }
      } catch (error) {
        console.error('Failed to fetch rules:', error);
      }
    };

    const fetchDataSources = async () => {
      try {
        const response = await fetch('/api/data-sources');
        if (response.ok) {
          const data = await response.json();
          setDataSources(data);
          const connected = data.find((ds: DataSourceConnection) => ds.status === 'connected');
          if (connected) {
            setSelectedDataSourceId(connected.id);
          }
        }
      } catch (error) {
        console.error('Failed to fetch data sources:', error);
      }
    };

    fetchDashboards();
    fetchRules();
    fetchDataSources();
  }, []);

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: input,
          rules: rules.filter(r => r.active),
          data_source_id: selectedDataSourceId || undefined
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
        metadata: data.metadata,
        sql: data.sql,
        queryResult: data.query_result,
        visualization: data.visualization,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Failed to send message:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Error: ${error instanceof Error ? error.message : 'Failed to send message'}`,
        timestamp: new Date(),
        metadata: { error: true },
      };
      
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleConfigUpdate = (messageId: string, newConfig: VisualizationConfig) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId ? { ...msg, visualization: newConfig } : msg
      )
    );
    setEditingConfigForMessage(null);
  };

  const handleOpenSaveDialog = (message: Message) => {
    setSavingChartMessage(message);
    const titlePreview = message.content.length > 50 
      ? message.content.substring(0, 50) + '...' 
      : message.content;
    setChartTitle(titlePreview);
    setSelectedDashboardId('');
    setSaveError('');
    setSaveSuccess(false);
  };

  const handleSaveChart = async () => {
    if (!selectedDashboardId || !chartTitle.trim() || !savingChartMessage) {
      setSaveError('Please select a dashboard and enter a chart title');
      return;
    }

    setIsSaving(true);
    setSaveError('');

    try {
      const response = await fetch(
        `/api/dashboards/${selectedDashboardId}/charts`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            dashboard_id: selectedDashboardId,
            title: chartTitle,
            sql: savingChartMessage.sql,
            visualization: savingChartMessage.visualization,
            refresh_interval: null
          })
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to save chart');
      }

      setSaveSuccess(true);
      setTimeout(() => {
        setSavingChartMessage(null);
        setSelectedDashboardId('');
        setChartTitle('');
        setSaveSuccess(false);
      }, 1500);
    } catch (error) {
      console.error('Failed to save chart:', error);
      setSaveError(error instanceof Error ? error.message : 'Failed to save chart');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <div className="flex-shrink-0 px-16 py-12 bg-[#FAFAFA]">
        {dataSources.length > 0 && (
          <div className="mb-4">
            <Select value={selectedDataSourceId} onValueChange={setSelectedDataSourceId}>
              <SelectTrigger className="w-[300px]">
                <SelectValue placeholder="Select data source" />
              </SelectTrigger>
              <SelectContent>
                {dataSources.map((ds) => (
                  <SelectItem key={ds.id} value={ds.id}>
                    {ds.name} ({ds.status})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        <h1 className="text-5xl font-semibold tracking-tight mb-2" style={{ fontFamily: 'Sora', letterSpacing: '-0.04em' }}>
          Chat
        </h1>
        <p className="text-base" style={{ color: '#5E5E5E', fontFamily: 'Sora' }}>
          Ask questions about your data
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-16 pb-4">
        <div className="max-w-4xl mx-auto">
          <div className="space-y-4 min-h-[200px]">
            {messages.length === 0 ? (
              <div className="h-full flex items-center justify-center text-muted-foreground py-20">
                <div className="text-center space-y-2">
                  <h2 className="text-2xl font-semibold">Welcome to Bag of Words</h2>
                  <p>Ask a question about your data to get started</p>
                </div>
              </div>
          ) : (
            messages.map((message) => (
              <div key={message.id} className="space-y-2">
                <Card
                  className={`p-4 ${
                    message.role === 'user'
                      ? 'ml-auto bg-primary text-primary-foreground max-w-[80%]'
                      : message.metadata?.error
                      ? 'mr-auto bg-destructive/10 text-destructive max-w-[80%]'
                      : 'mr-auto bg-muted max-w-[80%]'
                  }`}
                >
                  <div className="text-sm font-medium mb-1">
                    {message.role === 'user' ? 'You' : 'Assistant'}
                  </div>
                  <div className="whitespace-pre-wrap">{message.content}</div>
                </Card>
                
                {message.sql && (
                  <div className="mr-auto max-w-[80%]">
                    <CodeBlock code={message.sql} language="sql" />
                  </div>
                )}
                
                {message.queryResult && message.visualization && (
                  <div className="mr-auto max-w-[80%] space-y-2">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingConfigForMessage(
                          editingConfigForMessage === message.id ? null : message.id
                        )}
                      >
                        <Settings className="h-4 w-4 mr-1" />
                        {editingConfigForMessage === message.id ? 'Hide Config' : 'Configure Chart'}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenSaveDialog(message)}
                      >
                        <Save className="h-4 w-4 mr-1" />
                        Save to Dashboard
                      </Button>
                    </div>

                    {editingConfigForMessage === message.id && (
                      <ChartConfigPanel
                        queryResult={message.queryResult}
                        currentConfig={message.visualization}
                        onApply={(config) => handleConfigUpdate(message.id, config)}
                        onCancel={() => setEditingConfigForMessage(null)}
                      />
                    )}

                    {(() => {
                      const viz = message.visualization;
                      const data = message.queryResult.rows;
                      const columns = message.queryResult.columns;
                      
                      if (viz.type === 'table') {
                        return (
                          <TableVisualization
                            columns={columns}
                            rows={data}
                            rowCount={message.queryResult.rowCount}
                          />
                        );
                      }
                      
                      if (!viz.xKey || !viz.yKeys || viz.yKeys.length === 0) {
                        return (
                          <TableVisualization
                            columns={columns}
                            rows={data}
                            rowCount={message.queryResult.rowCount}
                          />
                        );
                      }
                      
                      switch (viz.type) {
                        case 'line':
                          return (
                            <LineChartVisualization
                              data={data}
                              xKey={viz.xKey}
                              yKeys={viz.yKeys}
                              title={viz.title}
                            />
                          );
                        case 'bar':
                          return (
                            <BarChartVisualization
                              data={data}
                              xKey={viz.xKey}
                              yKeys={viz.yKeys}
                              title={viz.title}
                            />
                          );
                        case 'area':
                          return (
                            <AreaChartVisualization
                              data={data}
                              xKey={viz.xKey}
                              yKeys={viz.yKeys}
                              title={viz.title}
                            />
                          );
                        case 'pie':
                          return (
                            <PieChartVisualization
                              data={data}
                              xKey={viz.xKey}
                              yKeys={viz.yKeys}
                              title={viz.title}
                            />
                          );
                        case 'donut':
                          return (
                            <DonutChartVisualization
                              data={data}
                              xKey={viz.xKey}
                              yKeys={viz.yKeys}
                              title={viz.title}
                            />
                          );
                        case 'horizontalBar':
                          return (
                            <HorizontalBarChartVisualization
                              data={data}
                              xKey={viz.xKey}
                              yKeys={viz.yKeys}
                              title={viz.title}
                            />
                          );
                        case 'stackedBar':
                          return (
                            <StackedBarChartVisualization
                              data={data}
                              xKey={viz.xKey}
                              yKeys={viz.yKeys}
                              title={viz.title}
                            />
                          );
                        case 'scatter':
                          return (
                            <ScatterPlotVisualization
                              data={data}
                              xKey={viz.xKey}
                              yKeys={viz.yKeys}
                              title={viz.title}
                            />
                          );
                        case 'combo':
                          return (
                            <ComboChartVisualization
                              data={data}
                              xKey={viz.xKey}
                              yKeys={viz.yKeys}
                              title={viz.title}
                              barKeys={viz.barKeys}
                              lineKeys={viz.lineKeys}
                            />
                          );
                        default:
                          return (
                            <TableVisualization
                              columns={columns}
                              rows={data}
                              rowCount={message.queryResult.rowCount}
                            />
                          );
                      }
                    })()}
                  </div>
                )}

                {message.queryResult && !message.visualization && (
                  <div className="mr-auto max-w-[80%]">
                    <TableVisualization
                      columns={message.queryResult.columns}
                      rows={message.queryResult.rows}
                      rowCount={message.queryResult.rowCount}
                    />
                  </div>
                )}
              </div>
            ))
          )}
          {isLoading && (
            <Card className="p-4 mr-auto bg-muted max-w-[80%]">
              <div className="flex items-center space-x-2">
                <div className="h-2 w-2 bg-current rounded-full animate-bounce [animation-delay:-0.3s]" />
                <div className="h-2 w-2 bg-current rounded-full animate-bounce [animation-delay:-0.15s]" />
                <div className="h-2 w-2 bg-current rounded-full animate-bounce" />
              </div>
            </Card>
          )}
          <div ref={messagesEndRef} />
          </div>
        </div>
      </div>

      <div className="flex-shrink-0 border-t bg-[#FAFAFA] px-16 py-4">
        <div className="max-w-4xl mx-auto flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a question about your data..."
            className="resize-none"
            rows={3}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!input.trim() || isLoading}
            size="icon"
            className="h-full"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Dialog open={!!savingChartMessage} onOpenChange={(open) => !open && setSavingChartMessage(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Chart to Dashboard</DialogTitle>
            <DialogDescription>
              Select a dashboard and give your chart a title
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Dashboard</label>
              <Select value={selectedDashboardId} onValueChange={setSelectedDashboardId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a dashboard" />
                </SelectTrigger>
                <SelectContent>
                  {dashboards.map((dashboard) => (
                    <SelectItem key={dashboard.id} value={dashboard.id}>
                      {dashboard.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Chart Title</label>
              <Input
                value={chartTitle}
                onChange={(e) => setChartTitle(e.target.value)}
                placeholder="Enter chart title"
              />
            </div>

            {saveError && (
              <div className="text-sm text-destructive">{saveError}</div>
            )}

            {saveSuccess && (
              <div className="text-sm text-green-600">Chart saved successfully!</div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setSavingChartMessage(null)}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveChart}
              disabled={isSaving || !selectedDashboardId || !chartTitle.trim()}
            >
              {isSaving ? 'Saving...' : 'Save Chart'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
