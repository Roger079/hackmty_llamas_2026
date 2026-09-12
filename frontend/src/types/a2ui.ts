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

export interface FrictionLog {
  id: string;
  category: string;
  trigger_message: string;
  severity: string;
  timestamp: string;
}

export interface UserCognitiveProfile {
  user_id: string;
  client_name?: string;
  memory_summary?: string;
  sensitivities?: string;
  visual_preferences?: string;
  information_preferences?: string;
  recommended_tone?: string;
  total_friction_events?: number;
  last_updated?: string;
  friction_logs?: FrictionLog[];
}

export interface DashboardWidgetItem {
  id: string;
  title: string;
  component: string;
  payload: A2UIPayload;
  source: 'system' | 'mobile' | 'studio';
  chartType?: string;
  colorTheme?: string;
  pinnedAt: string;
  isCustomizable?: boolean;
}


