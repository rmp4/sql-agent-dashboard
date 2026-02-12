export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: Record<string, any>;
  sql?: string;
  queryResult?: QueryResult;
  visualization?: VisualizationConfig;
}

export interface QueryResult {
  columns: string[];
  rows: Record<string, any>[];
  rowCount: number;
}

export interface VisualizationConfig {
  type: 'table' | 'bar' | 'line' | 'area' | 'pie' | 'donut' | 'horizontalBar' | 'stackedBar' | 'scatter' | 'combo';
  xKey?: string;
  yKeys?: string[];
  title?: string;
  barKeys?: string[];
  lineKeys?: string[];
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  dataSourceId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface DataSource {
  id: string;
  name: string;
  type: 'postgresql' | 'mysql' | 'snowflake' | 'bigquery';
  connectionString?: string;
  config: Record<string, any>;
  enabled: boolean;
  tables: Table[];
}

export interface Table {
  id: string;
  name: string;
  schema?: string;
  columns: Column[];
  enabled: boolean;
}

export interface Column {
  name: string;
  type: string;
  nullable: boolean;
}

export interface Instruction {
  id: string;
  title: string;
  content: string;
  category: 'general' | 'code_gen' | 'visualization' | 'dashboard' | 'system';
  loadMode: 'always' | 'intelligent' | 'disabled';
  scope: 'all' | 'datasource' | 'table';
  status: 'draft' | 'suggested' | 'approved' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
}

export interface AgentTrace {
  id: string;
  conversationId: string;
  messageId: string;
  steps: TraceStep[];
  context: Record<string, any>;
  sqlGenerated?: string;
  error?: string;
  timestamp: Date;
}

export interface TraceStep {
  type: 'planning' | 'tool_call' | 'sql_gen' | 'execution' | 'response';
  description: string;
  data?: Record<string, any>;
  timestamp: Date;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
}

export interface A2UIComponent {
  type: 'card' | 'table' | 'chart' | 'metric' | 'tabs' | 'accordion';
  properties: Record<string, any>;
  children?: A2UIComponent[];
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string;
    borderColor?: string;
  }[];
}

// Dashboard Types
export interface Dashboard {
  id: string;
  name: string;
  description?: string;
  charts: SavedChart[];
  layout?: DashboardLayout;
  createdAt: Date;
  updatedAt: Date;
}

export interface SavedChart {
  id: string;
  title: string;
  sql: string;
  visualization: VisualizationConfig;
  queryResult?: QueryResult;
  refreshInterval?: number; // in seconds
  createdAt: Date;
}

export interface DashboardLayout {
  type: 'grid' | 'flex';
  columns?: number;
  gap?: number;
}

// Data Source Types (extended from existing)
export interface DataSourceConnection {
  id: string;
  name: string;
  type: 'postgresql' | 'mysql' | 'sqlite';
  host: string;
  port: number;
  database: string;
  username: string;
  status: 'connected' | 'disconnected';
  createdAt: Date;
  updatedAt: Date;
}

// Rule Types
export interface Rule {
  id: string;
  name: string;
  description: string;
  scope: 'global' | 'table' | 'query_type';
  prompt: string; // Injected into LLM system prompt
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type RuleScope = 'global' | 'table' | 'query_type';
export type RuleScopeLabel = 'SQL Style' | 'Business Logic' | 'Chart Preference';
