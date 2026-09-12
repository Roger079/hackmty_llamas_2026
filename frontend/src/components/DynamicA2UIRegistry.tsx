import React from 'react';
import { A2UIPayload, ActionContext } from '../types/a2ui';
import { DebtRestructureCard } from './DebtRestructureCard';
import { ConfirmationReceipt } from './ConfirmationReceipt';
import { SpeiConfirmCard } from './SpeiConfirmCard';
import { SpeiReceiptCard } from './SpeiReceiptCard';
import { BanorteBalanceCard } from './BanorteBalanceCard';
import { InvestmentSimulatorCard } from './InvestmentSimulatorCard';

interface DynamicA2UIRegistryProps {
  payload: A2UIPayload;
  onAction: (actionCtx: ActionContext) => Promise<boolean>;
  disabled?: boolean;
}

/**
 * Person 2 Dynamic Component Interpreter / Registry.
 * Matches declarative JSON component names to Banorte React components
 * and attaches the feedback loop callback.
 */
export const DynamicA2UIRegistry: React.FC<DynamicA2UIRegistryProps> = ({
  payload,
  onAction,
  disabled = false,
}) => {
  const { component, props = {} } = payload;
  const value = (camel: string, snake: string) => props[camel] ?? props[snake];

  switch (component) {
    case 'DebtRestructureCard':
      return (
        <DebtRestructureCard
          totalDebt={value('totalDebt', 'total_debt')}
          cardName={value('cardName', 'card_name')}
          cardLast4={value('cardLast4', 'card_last4')}
          minimumPayment={value('minimumPayment', 'minimum_payment')}
          dueDate={value('dueDate', 'due_date')}
          currentRate={value('currentRate', 'current_rate')}
          options={(props.options || []).map((option: Record<string, unknown>, index: number) => ({
            plan_id: option.plan_id ?? `plan_${option.months ?? option.term_months ?? index}`,
            months: option.months ?? option.term_months,
            monthly_payment: option.monthly_payment,
            annual_rate: option.annual_rate ?? option.rate,
            total_savings: option.total_savings ?? 0,
            label: option.label,
          }))}
          onAction={onAction}
          disabled={disabled}
        />
      );

    case 'ConfirmationReceipt':
      return (
        <ConfirmationReceipt
          folio={props.folio}
          status={props.status}
          monthlyPayment={value('monthlyPayment', 'monthly_payment')}
          termMonths={value('termMonths', 'term_months')}
          nextPaymentDate={value('nextPaymentDate', 'next_payment_date')}
          bankSeal={value('bankSeal', 'bank_seal')}
          clientName={value('clientName', 'client_name')}
        />
      );

    case 'SpeiConfirmCard':
      return (
        <SpeiConfirmCard
          transferId={value('transferId', 'transfer_id')}
          amount={props.amount}
          beneficiary={props.beneficiary}
          bank={props.bank}
          clabe={props.clabe}
          concept={props.concept}
          onAction={onAction}
          disabled={disabled}
        />
      );

    case 'SpeiReceiptCard':
      return (
        <SpeiReceiptCard
          amount={props.amount}
          beneficiary={props.beneficiary}
          bank={props.bank}
          clabe={props.clabe}
          trackingKey={value('trackingKey', 'tracking_key')}
          date={props.date}
        />
      );

    case 'BanorteBalanceCard':
      return (
        <BanorteBalanceCard
          clientName={value('clientName', 'client_name')}
          nominaBalance={value('nominaBalance', 'nomina_balance')}
          oroBalance={value('oroBalance', 'oro_balance')}
          totalDebt={value('totalDebt', 'total_debt')}
          onAction={onAction}
        />
      );

    case 'InvestmentSimulatorCard':
      return (
        <InvestmentSimulatorCard
          initialAmount={value('initialAmount', 'initial_amount')}
          initialTermDays={value('initialTermDays', 'initial_term_days')}
          annualRate={value('annualRate', 'annual_rate')}
          estimatedGain={value('estimatedGain', 'estimated_gain')}
          totalMaturity={value('totalMaturity', 'total_maturity')}
        />
      );

    default:
      return (
        <div className="p-3 bg-slate-800 text-xs text-slate-300 rounded-2xl border border-slate-700">
          Componente A2UI desconocido: <code>{component}</code>
        </div>
      );
  }
};
