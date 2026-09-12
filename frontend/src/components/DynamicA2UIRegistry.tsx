import React from 'react';
import { A2UIPayload, ActionContext } from '../types/a2ui';

interface DynamicA2UIRegistryProps {
  payload: A2UIPayload;
  onAction: (actionCtx: ActionContext) => void;
  disabled?: boolean;
}

/**
 * Auto-discover and register ALL .tsx component files in this folder using Vite.
 * Person 2 can drop ANY new card into this directory and it will be
 * dynamically imported and available to Gemini without touching this file!
 */
const componentModules = import.meta.glob<{ [key: string]: any }>('./*.tsx', { eager: true });

const componentRegistry: Record<string, React.ComponentType<any>> = {};

// Register all discovered components
for (const path in componentModules) {
  const mod = componentModules[path];
  const name = path.replace(/^\.\//, '').replace(/\.tsx$/, '');

  // Ignore wrapper shells and layout headers from being rendered as A2UI cards
  if (['DynamicA2UIRegistry', 'BanorteHeader', 'BanorteLogo', 'ChatStream', 'McpInspector'].includes(name)) {
    continue;
  }

  const Component = mod[name] || mod.default || Object.values(mod).find(v => typeof v === 'function');
  if (Component && typeof Component === 'function') {
    componentRegistry[name] = Component;
  }
}

/**
 * Defensive property normalizer ensuring components receive both camelCase,
 * snake_case, and accounts array data regardless of how Gemini formats the payload.
 */
function normalizeProps(component: string, rawProps: Record<string, any>): Record<string, any> {
  const p = { ...rawProps };

  if (component === 'BanorteBalanceCard') {
    const accounts = Array.isArray(p.accounts) ? p.accounts : [];
    const nomina = accounts.find((a: any) => a.type === 'nomina');
    const oro = accounts.find((a: any) => a.type === 'oro');

    p.nominaBalance = p.nominaBalance ?? p.nomina_balance ?? nomina?.available_balance ?? 48650.00;
    p.oroBalance = p.oroBalance ?? p.oro_balance ?? oro?.available_credit ?? 41550.00;
    p.totalDebt = p.totalDebt ?? p.total_debt ?? oro?.current_debt ?? 38450.00;
    p.clientName = p.clientName ?? p.client ?? p.client_name ?? 'Alejandro Ramírez';
  } else if (component === 'DebtRestructureCard') {
    p.totalDebt = p.totalDebt ?? p.total_debt ?? 38450.00;
    p.cardName = p.cardName ?? p.card_name ?? 'Tarjeta Banorte Oro';
    p.cardLast4 = p.cardLast4 ?? p.card_last4 ?? '8842';
    p.minimumPayment = p.minimumPayment ?? p.minimum_payment ?? 3850.00;
    p.dueDate = p.dueDate ?? p.payment_due_date ?? p.due_date ?? '18 Sep 2026';
    p.currentRate = p.currentRate ?? p.interest_rate_annual ?? p.rate ?? '64.8% CAT';
    p.options = p.options || [];
  } else if (component === 'ConfirmationReceipt') {
    p.folio = p.folio || p.folio_convenio || 'FOL-BNTE-2026-R88754';
    p.status = p.status || 'APROBADO';
    p.monthlyPayment = p.monthlyPayment ?? p.monthly_payment ?? 1920.00;
    p.termMonths = p.termMonths ?? p.term_months ?? 24;
    p.nextPaymentDate = p.nextPaymentDate || p.next_payment_date || '15 Oct 2026';
    p.bankSeal = p.bankSeal || p.bank_seal || 'BANORTE-CRYPTO-SHA256-VALID';
    p.clientName = p.clientName || p.client_name || 'Alejandro Ramírez';
  } else if (component === 'SpeiConfirmCard') {
    p.transferId = p.transferId || p.transfer_id || 'prep-spei-101';
    p.beneficiary = p.beneficiary || p.beneficiary_name || 'SOFÍA MENDOZA RÍOS';
    p.bank = p.bank || p.recipient_bank || 'BBVA México';
    p.clabe = p.clabe || '012 180 01594839201 9';
  } else if (component === 'SpeiReceiptCard') {
    p.trackingKey = p.trackingKey || p.tracking_key || 'BNTE202609118492019';
    p.date = p.date || p.execution_timestamp || '11 Sep 2026, 23:45 hrs';
  }

  return p;
}

/**
 * Sleek Banorte Fallback Card for any unmapped or brand-new components.
 */
const GenericBanorteCard: React.FC<{
  componentName: string;
  props: Record<string, any>;
  onAction?: (ctx: ActionContext) => void;
  disabled?: boolean;
}> = ({ componentName, props, onAction, disabled }) => {
  return (
    <div className="bg-slate-900 border border-slate-700/80 rounded-3xl p-5 shadow-2xl text-white space-y-4 my-3 animate-in fade-in">
      <div className="flex justify-between items-center border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#EB0029] flex items-center justify-center font-black text-sm">B</div>
          <div>
            <h4 className="text-xs font-bold text-white">{componentName.replace(/([A-Z])/g, ' $1').trim()}</h4>
            <p className="text-[10px] text-slate-400">Componente Dinámico A2UI • Banorte</p>
          </div>
        </div>
        <span className="text-[10px] text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-2.5 py-0.5 rounded-full font-mono">
          Auto-Registrado
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
        {Object.entries(props).map(([key, val]) => {
          if (typeof val === 'object' || Array.isArray(val) || val === null || val === undefined) return null;
          return (
            <div key={key} className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
              <div className="text-sm font-bold text-white mt-0.5">{String(val)}</div>
            </div>
          );
        })}
      </div>

      {props.action && (
        <button
          disabled={disabled}
          onClick={() =>
            onAction &&
            onAction({
              action: props.action,
              params: props,
              source_component: componentName,
            })
          }
          className="w-full py-3 bg-[#EB0029] hover:bg-[#C70023] text-white rounded-xl font-bold text-xs shadow-md shadow-red-500/20 transition cursor-pointer disabled:opacity-50"
        >
          {props.actionLabel || `Confirmar ${componentName}`}
        </button>
      )}
    </div>
  );
};

/**
 * The Master Dynamic A2UI Component Interpreter.
 * Auto-routes incoming JSON to the matching React component, or gracefully
 * falls back to the generic card.
 */
export const DynamicA2UIRegistry: React.FC<DynamicA2UIRegistryProps> = ({
  payload,
  onAction,
  disabled = false,
}) => {
  const { component, props = {} } = payload;
  const normalized = normalizeProps(component, props);

  const ComponentToRender = componentRegistry[component];

  if (ComponentToRender) {
    return <ComponentToRender {...normalized} onAction={onAction} disabled={disabled} />;
  }

  return (
    <GenericBanorteCard
      componentName={component}
      props={normalized}
      onAction={onAction}
      disabled={disabled}
    />
  );
};
