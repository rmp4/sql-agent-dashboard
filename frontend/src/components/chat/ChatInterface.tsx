import { useState, useRef, useEffect } from 'react';
import { Send, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
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
import type { Message, VisualizationConfig } from '@/types';

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [editingConfigForMessage, setEditingConfigForMessage] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
        body: JSON.stringify({ message: input }),
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

  return (
    <div className="flex flex-col h-screen">
      <div className="flex-shrink-0 px-16 py-12 bg-[#FAFAFA]">
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
                    <div className="flex items-center justify-between">
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
    </div>
  );
}
