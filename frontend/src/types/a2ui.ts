export interface ActionContext {
  action: string;
  params: Record<string, any>;
  source_component?: string;
}

export interface A2UIPayload {
  component: string;
  props: Record<string, any>;
  action_schema?: Record<string, any>;
}

export interface McpCallLog {
  tool_name: string;
  arguments: Record<string, any>;
  result: any;
  latency_ms: number;
  timestamp: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  a2ui?: A2UIPayload;
  timestamp: string;
}

export interface RestructureOption {
  plan_id: string;
  months: number;
  monthly_payment: number;
  annual_rate: string;
  total_savings: number;
  label?: string;
}
