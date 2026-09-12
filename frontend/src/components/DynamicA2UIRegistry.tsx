import React from 'react';
import { A2UIPayload, ActionContext } from '../types/a2ui';
import { DebtRestructureCard } from './DebtRestructureCard';
import { ConfirmationReceipt } from './ConfirmationReceipt';
import { SpeiConfirmCard } from './SpeiConfirmCard';
import { SpeiReceiptCard } from './SpeiReceiptCard';
import { BanorteBalanceCard } from './BanorteBalanceCard';

interface DynamicA2UIRegistryProps {
  payload: A2UIPayload;
  onAction: (actionCtx: ActionContext) => void;
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

  switch (component) {
    case 'DebtRestructureCard':
      return (
        <DebtRestructureCard
          totalDebt={props.totalDebt}
          cardName={props.cardName}
          cardLast4={props.cardLast4}
          minimumPayment={props.minimumPayment}
          dueDate={props.dueDate}
          currentRate={props.currentRate}
          options={props.options || []}
          onAction={onAction}
          disabled={disabled}
        />
      );

    case 'ConfirmationReceipt':
      return (
        <ConfirmationReceipt
          folio={props.folio}
          status={props.status}
          monthlyPayment={props.monthlyPayment}
          termMonths={props.termMonths}
          nextPaymentDate={props.nextPaymentDate}
          bankSeal={props.bankSeal}
          clientName={props.clientName}
        />
      );

    case 'SpeiConfirmCard':
      return (
        <SpeiConfirmCard
          transferId={props.transferId}
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
          trackingKey={props.trackingKey}
          date={props.date}
        />
      );

    case 'BanorteBalanceCard':
      return (
        <BanorteBalanceCard
          clientName={props.clientName}
          nominaBalance={props.nominaBalance}
          oroBalance={props.oroBalance}
          totalDebt={props.totalDebt}
          onAction={onAction}
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
