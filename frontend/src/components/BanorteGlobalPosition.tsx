import React, { useState } from 'react';
import {
  Wallet,
  CreditCard,
  ArrowUpRight,
  Download,
  Filter,
  Sparkles,
  Zap,
  TrendingUp,
  Send,
  CheckCircle2,
  X,
  ShieldCheck,
  UserPlus,
  Trash2,
  Brain,
  Info,
} from 'lucide-react';
import heroImage from '../assets/12ui/banorte-hero.png';
import investmentTrend from '../assets/12ui/investment-trend.png';
import { PortalTab } from './BanorteSubNav';
import { ActionContext, UserCognitiveProfile } from '../types/a2ui';
import { SpendingDonutCard } from './SpendingDonutCard';
import { FinancialHealthGauge } from './FinancialHealthGauge';
import { DebtRestructureCard } from './DebtRestructureCard';
import { InvestmentSimulatorCard } from './InvestmentSimulatorCard';

export interface TransactionItem {
  id: string;
  description: string;
  date: string;
  account: string;
  amount: number;
  type: 'credit' | 'debit';
  status: string;
  category: string;
}

interface AccountData {
  nominaBalance?: number;
  oroBalance?: number;
  totalDebt?: number;
  accountLast4?: string;
  cardLast4?: string;
}

interface BanorteGlobalPositionProps {
  clientName?: string;
  selectedUserId?: string;
  accounts?: AccountData;
  transactions?: TransactionItem[];
  cognitiveProfile?: UserCognitiveProfile | null;
  activeTab?: PortalTab;
  onSelectTab?: (tab: PortalTab) => void;
  onTriggerMayaPrompt: (prompt: string) => void;
  onAction?: (actionCtx: ActionContext) => Promise<boolean>;
  hasActiveRestructure?: boolean;
}

export const BanorteGlobalPosition: React.FC<BanorteGlobalPositionProps> = ({
  clientName = 'Ana Martínez',
  selectedUserId = 'C001',
  accounts,
  transactions = [],
  cognitiveProfile,
  activeTab = 'global',
  onSelectTab,
  onTriggerMayaPrompt,
  onAction,
  hasActiveRestructure = false,
}) => {
  const nominaBalance = Number(accounts?.nominaBalance ?? 27900.0) || 0;
  const cardDebt = Number(accounts?.totalDebt ?? 0.0) || 0;
  const accountLast4 =
    accounts?.accountLast4 ||
    (selectedUserId === 'C002' ? '7721' : selectedUserId === 'C003' ? '8359' : '4582');
  const cardLast4 = accounts?.cardLast4 || (selectedUserId === 'C002' ? '8812' : '');

  const isCarlos = selectedUserId === 'C002' || clientName.includes('Carlos');
  const isSilvia = selectedUserId === 'C003' || clientName.includes('Silvia');
  const isAna = !isCarlos && !isSilvia;

  const [isCognitiveModalOpen, setIsCognitiveModalOpen] = useState(false);
  const [isAddingContactModalOpen, setIsAddingContactModalOpen] = useState(false);
  const [newContactName, setNewContactName] = useState('');
  const [newContactClabe, setNewContactClabe] = useState('');
  const [newContactAlias, setNewContactAlias] = useState('');
  const [contactSuccessMsg, setContactSuccessMsg] = useState('');

  const [contacts, setContacts] = useState([
    { name: 'Sofía Mendoza', bank: 'BBVA (*2019)', amount: 850, prompt: 'Transfiere $850 a Sofía Mendoza para la cena.' },
    { name: 'Raúl Salinas', bank: 'Nu (*7777)', amount: 500, prompt: 'Transfiere $500 a Raúl Salinas.' },
    { name: 'Alejandro R.', bank: 'Banorte (*4582)', amount: 1200, prompt: 'Transfiere $1,200 a Alejandro Ramírez.' },
  ]);

  const handleAddContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanClabe = newContactClabe.replace(/\s/g, '');
    if (cleanClabe.length !== 18 || !/^\d+$/.test(cleanClabe)) {
      alert('La cuenta CLABE debe contener exactamente 18 dígitos numéricos.');
      return;
    }

    const detectedBank = cleanClabe.startsWith('012')
      ? 'BBVA México'
      : cleanClabe.startsWith('638')
      ? 'Nu México'
      : 'Institución SPEI';

    const aliasName = newContactAlias || newContactName.split(' ')[0];
    const newEntry = {
      name: newContactName,
      bank: `${detectedBank} (*${cleanClabe.slice(-4)})`,
      amount: 500,
      prompt: `Transfiere $500 a ${newContactName} con CLABE ${cleanClabe}.`,
    };

    setContacts([newEntry, ...contacts]);
    setContactSuccessMsg(`¡Contacto ${newContactName} (${detectedBank}) registrado exitosamente!`);
    setTimeout(() => {
      setContactSuccessMsg('');
      setIsAddingContactModalOpen(false);
      setNewContactName('');
      setNewContactClabe('');
      setNewContactAlias('');
    }, 1500);

    onTriggerMayaPrompt(`Registra a mi contacto ${newContactName} con CLABE ${cleanClabe} en mi agenda SPEI`);
  };

  const handlePurgeMemory = async () => {
    if (confirm('¿Deseas ejercer tu Derecho al Olvido y limpiar la memoria cognitiva almacenada en SQLite?')) {
      try {
        await fetch(`/api/chat/history?user_id=${selectedUserId}`, { method: 'DELETE' });
        alert('Memoria cognitiva e historial de fricción purgados de forma segura.');
        setIsCognitiveModalOpen(false);
      } catch (err) {
        console.warn('Could not purge memory:', err);
      }
    }
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* 1. Cognitive Memory & Adaptation Banner (Clickable) */}
      <div
        onClick={() => setIsCognitiveModalOpen(true)}
        className="group flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-slate-200/80 bg-white px-4 py-2.5 shadow-xs hover:border-emerald-300 hover:bg-emerald-50/20 transition cursor-pointer"
        title="Ver detalles de Memoria Cognitiva y Transparencia AI"
      >
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 group-hover:scale-105 transition">
            <Zap className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-800">
                Adaptabilidad Cognitiva Activa
              </span>
              <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.2 text-[10px] font-bold text-emerald-800">
                SQLite Sincronizado
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              {isCarlos
                ? 'Perfil detectado: Enfoque en Reestructuración de Deuda y Salud Crediticia'
                : isSilvia
                ? 'Perfil detectado: Enfoque Patrimonial y Maximización de Inversiones'
                : 'Perfil detectado: Visualización de Flujo de Efectivo y Transferencias SPEI'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {cognitiveProfile?.recommended_tone && (
            <span className="hidden rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-600 sm:inline-block">
              Tono: {cognitiveProfile.recommended_tone}
            </span>
          )}
          <span className="rounded-lg bg-red-50 px-2.5 py-1 text-[11px] font-bold text-[#EB0029] border border-red-100">
            {cognitiveProfile?.visual_preferences || (isCarlos ? 'Proyecciones & Tablas' : isSilvia ? 'Rendimientos & Simulador' : 'Gráficos & Donas')}
          </span>
          <Info className="h-4 w-4 text-slate-400 group-hover:text-emerald-600 transition" />
        </div>
      </div>

      {/* 2. Welcome & Banking Overview Banner */}
      <div
        className="banorte-hero relative z-0 flex min-h-[162px] flex-col justify-center gap-5 bg-cover bg-center p-5 sm:flex-row sm:items-center sm:justify-between sm:px-6"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="relative z-10 max-w-[54%]">
          <span className="text-[13px] font-bold uppercase tracking-[0.04em] text-[#5D7694]">
            {activeTab === 'transfers'
              ? 'Módulo de Transferencias y Pagos'
              : activeTab === 'cards'
              ? 'Módulo de Tarjetas y Líneas de Crédito'
              : activeTab === 'investments'
              ? 'Módulo de Inversiones y Pagarés'
              : 'Resumen Integral de Posición Global'}
          </span>
          <h2 className="mt-2 text-[27px] font-bold leading-none tracking-tight text-[#061D3A]">
            Hola, {clientName.split(' ')[0]}
          </h2>
          <p className="mt-2 text-[13px] leading-5 text-[#6D85A1]">
            Último acceso a Banca en Línea: Hoy, 09:14 hrs desde Torreón, Coah.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-3 sm:mr-16 sm:self-center">
          <button
            type="button"
            onClick={() => onTriggerMayaPrompt('¿Cuánto saldo disponible tengo en mis cuentas?')}
            className="inline-flex min-h-14 min-w-[145px] items-center justify-center gap-1.5 rounded-2xl border border-white/80 bg-white/90 px-5 py-3 text-center text-[13px] font-bold text-[#203956] shadow-[0_4px_12px_rgba(39,67,95,0.10)] backdrop-blur-sm transition hover:bg-white cursor-pointer"
          >
            <span>Consultar saldos</span>
          </button>
          <button
            type="button"
            onClick={() =>
              onTriggerMayaPrompt(
                isCarlos
                  ? '¿Cómo reestructurar mi tarjeta de crédito?'
                  : isSilvia
                  ? 'Quiero simular una inversión en Pagaré Banorte.'
                  : 'Muestra una gráfica de mis gastos del mes.'
              )
            }
            className="inline-flex min-h-14 min-w-[190px] items-center justify-center gap-1.5 rounded-2xl bg-[#E4003B] px-5 py-3 text-center text-[13px] font-bold text-white shadow-[0_5px_14px_rgba(180,0,45,0.24)] transition hover:bg-[#C70032] cursor-pointer"
          >
            <Sparkles className="h-3.5 w-3.5 text-amber-300" />
            <span>
              {isCarlos
                ? 'Reestructurar con Maya'
                : isSilvia
                ? 'Invertir con Maya'
                : 'Analizar con Maya'}
            </span>
          </button>
        </div>
      </div>

      {/* 3. Account KPI Cards Strip */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {/* Nomina / Debit Card */}
        <div className="banorte-card flex min-h-[230px] flex-col justify-between p-5 transition hover:-translate-y-0.5 hover:border-[#CBD9E6]">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-bold text-[#203956]">
                {isSilvia
                  ? 'Cuenta Ahorro Patrimonial'
                  : isCarlos
                  ? 'Cuenta de Ahorro Banorte'
                  : 'Débito Enlace Nómina'}
              </span>
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-50 font-bold text-emerald-600">
                <Wallet className="h-4 w-4" />
              </div>
            </div>
            <p className="mt-1 text-[13px] text-[#6D85A1]">Cuenta: &nbsp;••••&nbsp; {accountLast4}</p>
            <div className="mt-3">
              <span className="text-[13px] font-medium text-[#6D85A1]">Saldo disponible</span>
              <div className="mt-1 text-[27px] font-bold text-[#061D3A] tabular-nums">
                ${nominaBalance.toLocaleString('es-MX', { minimumFractionDigits: 2 })}{' '}
                <span className="text-xs font-semibold text-slate-500">MXN</span>
              </div>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between border-t border-[#E6EDF4] pt-4">
            <button
              type="button"
              onClick={() => onTriggerMayaPrompt('Transfiere $850 a Sofía Mendoza para la cena.')}
              className="flex items-center gap-1 text-[13px] font-bold text-[#E4003B] hover:underline cursor-pointer"
            >
              <span>Transferir por SPEI</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </button>
            <span className="rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
              En Línea
            </span>
          </div>
        </div>

        {/* Credit Card */}
        <div className="banorte-card flex min-h-[230px] flex-col justify-between p-5 transition hover:-translate-y-0.5 hover:border-[#CBD9E6]">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-bold text-[#203956]">
                {cardLast4
                  ? isCarlos
                    ? 'Tarjeta Banorte Clásica'
                    : 'Tarjeta Banorte Oro'
                  : 'Línea de Crédito Banorte'}
              </span>
              <div
                className={`grid h-10 w-10 place-items-center rounded-xl font-bold ${
                  cardDebt > 0 ? 'bg-red-50 text-[#EB0029]' : 'bg-emerald-50 text-emerald-600'
                }`}
              >
                <CreditCard className="h-4 w-4" />
              </div>
            </div>
            <p className="mt-1 text-[13px] text-[#6D85A1]">
              {cardLast4 ? `Crédito: •••• ${cardLast4}` : 'Sin tarjetas de crédito activas'}
            </p>
            <div className="mt-3">
              <span className="text-[13px] font-medium text-[#6D85A1]">
                {cardDebt > 0 ? 'Saldo total a la fecha' : 'Saldo deudor'}
              </span>
              <div className="mt-1 text-[27px] font-bold text-[#061D3A] tabular-nums">
                ${cardDebt.toLocaleString('es-MX', { minimumFractionDigits: 2 })}{' '}
                <span className="text-xs font-semibold text-slate-500">MXN</span>
              </div>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between border-t border-[#E6EDF4] pt-4">
            <button
              type="button"
              onClick={() =>
                onTriggerMayaPrompt(
                  cardDebt > 0
                    ? '¿Cómo reestructurar mi tarjeta de crédito?'
                    : '¿Cuáles son mis gastos del mes?'
                )
              }
              className="flex items-center gap-1 text-[13px] font-bold text-[#E4003B] hover:underline cursor-pointer"
            >
              <span>{cardDebt > 0 ? 'Ver plan de pago fijo' : 'Sin saldo deudor'}</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </button>
            <span
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
                cardDebt > 0 ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'
              }`}
            >
              {cardDebt > 0 ? 'Vence 27 Sep' : 'Al Corriente'}
            </span>
          </div>
        </div>

        {/* Investment Card */}
        <div className="banorte-card flex min-h-[230px] flex-col justify-between p-5 transition hover:-translate-y-0.5 hover:border-[#CBD9E6]">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-bold text-[#203956]">
                {isSilvia ? 'Pagaré Altos Rendimientos' : 'Pagaré Banorte a Plazo'}
              </span>
              <img src={investmentTrend} alt="" className="h-10 w-10 object-contain" />
            </div>
            <p className="mt-1 text-[13px] text-[#6D85A1]">
              {isSilvia ? 'Tasa preferencial 9.8% Anual' : 'Tasa garantizada 9.1% Anual'}
            </p>
            <div className="mt-3">
              <span className="text-[13px] font-medium text-[#6D85A1]">
                {isSilvia ? 'Patrimonio para Inversión' : 'Inversión sugerida'}
              </span>
              <div className="mt-1 text-[27px] font-bold text-[#061D3A] tabular-nums">
                {isSilvia ? '$116,614.10' : '$25,000.00'}{' '}
                <span className="text-xs font-semibold text-slate-500">MXN</span>
              </div>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between border-t border-[#E6EDF4] pt-4">
            <button
              type="button"
              onClick={() => onTriggerMayaPrompt('Quiero simular una inversión a plazo fijo.')}
              className="flex items-center gap-1 text-[13px] font-bold text-blue-700 hover:underline cursor-pointer"
            >
              <span>Simular rendimientos</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </button>
            <span className="rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
              {isSilvia ? '+9.8% Rend.' : '+9.1% Rend.'}
            </span>
          </div>
        </div>
      </div>

      {/* 4. Tab-Aware & Cognitive Adaptive Canvas */}

      {/* TAB: TRANSFERS SPEI */}
      {activeTab === 'transfers' && (
        <div className="space-y-4">
          <div className="banorte-card p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-50 text-[#EB0029]">
                  <Send className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-[#061D3A]">
                    Transferencias Rápidas y Contactos Frecuentes
                  </h3>
                  <p className="text-xs text-slate-500">
                    Envío seguro SPEI validado con Token en tiempo real
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddingContactModalOpen(true)}
                className="rounded-xl bg-[#EB0029] px-4 py-2 text-xs font-bold text-white hover:bg-[#C70023] transition cursor-pointer flex items-center gap-1.5"
              >
                <UserPlus className="h-3.5 w-3.5" />
                <span>+ Agregar Contacto SPEI</span>
              </button>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {contacts.map((contact, idx) => (
                <div
                  key={idx}
                  className="flex flex-col justify-between rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 hover:border-red-200 hover:bg-white transition"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="grid h-8 w-8 place-items-center rounded-full bg-slate-200 font-bold text-slate-700 text-xs">
                        {contact.name.charAt(0)}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-800">{contact.name}</div>
                        <div className="text-[10px] text-slate-400">{contact.bank}</div>
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onTriggerMayaPrompt(contact.prompt)}
                    className="mt-3 flex items-center justify-between rounded-lg bg-white px-3 py-2 text-xs font-bold text-[#EB0029] border border-red-100 hover:bg-red-50 transition cursor-pointer"
                  >
                    <span>Enviar ${contact.amount}</span>
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB: CARDS */}
      {activeTab === 'cards' && (
        <div className="space-y-4">
          {cardDebt > 0 ? (
            <DebtRestructureCard
              totalDebt={cardDebt}
              cardName={isCarlos ? 'Tarjeta Banorte Clásica' : 'Tarjeta Banorte Mastercard'}
              cardLast4={cardLast4 || '8812'}
              minimumPayment={2500.0}
              dueDate="27 Sep 2026"
              currentRate="64.8% CAT"
              onAction={onAction}
            />
          ) : (
            <div className="banorte-card p-6 text-center space-y-3">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Línea de Crédito 100% Disponible
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                No tienes saldo deudor pendiente en tus tarjetas de crédito Banorte. Tu puntaje crediticio se encuentra en nivel óptimo.
              </p>
            </div>
          )}
        </div>
      )}

      {/* TAB: INVESTMENTS */}
      {activeTab === 'investments' && (
        <div className="space-y-4">
          <InvestmentSimulatorCard
            initialAmount={isSilvia ? 50000 : 25000}
            initialTermDays={91}
            annualRate={isSilvia ? '9.8%' : '9.1%'}
          />

          <div className="banorte-card p-5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">
              Tasas Vigentes Pagaré Banorte 2026
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 uppercase font-bold">28 Días</span>
                <p className="text-base font-black text-slate-800 mt-1">8.50%</p>
                <span className="text-[10px] text-emerald-600">GAT Nominal</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 uppercase font-bold">91 Días</span>
                <p className="text-base font-black text-slate-800 mt-1">9.10%</p>
                <span className="text-[10px] text-emerald-600">Recomendado</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 uppercase font-bold">182 Días</span>
                <p className="text-base font-black text-slate-800 mt-1">9.50%</p>
                <span className="text-[10px] text-emerald-600">GAT Nominal</span>
              </div>
              <div className="bg-red-50 p-3 rounded-xl border border-red-200">
                <span className="text-[10px] text-red-500 uppercase font-bold">360 Días</span>
                <p className="text-base font-black text-[#EB0029] mt-1">{isSilvia ? '9.80%' : '9.60%'}</p>
                <span className="text-[10px] text-red-700 font-bold">Tasa Preferente</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB: GLOBAL (Adaptive per User Persona) */}
      {activeTab === 'global' && (
        <>
          {/* CARLOS ADAPTIVE EXPERIENCE: Debt Stress Focus */}
          {isCarlos && (
            <div className="space-y-4 animate-in fade-in duration-300">
              {/* Financial Health Diagnostic */}
              <FinancialHealthGauge
                overallScore={64}
                status="MODERADO"
                statusColor="#F59E0B"
                metrics={{
                  credit_utilization_pct: 76.9,
                  available_liquidity: nominaBalance,
                  current_debt: cardDebt,
                  savings_capacity_monthly: 4200.0,
                }}
                interest_trap_warning={{
                  is_at_risk: cardDebt > 0,
                  minimum_payment: 2500.0,
                  months_to_liquidate_minimum: 64,
                  projected_interest_minimum: 36200.0,
                  recommendation: 'Reestructurar a 24 meses te ahorra más de $21,400 MXN en intereses.',
                }}
              />

              {/* Directly Interactive Restructure Card */}
              {cardDebt > 0 && (
                <DebtRestructureCard
                  totalDebt={cardDebt}
                  cardName="Tarjeta Banorte Clásica"
                  cardLast4={cardLast4 || '8812'}
                  minimumPayment={2500.0}
                  dueDate="27 Sep 2026"
                  currentRate="64.8% CAT"
                  onAction={onAction}
                />
              )}
            </div>
          )}

          {/* ANA ADAPTIVE EXPERIENCE: Spending Donut & Cash Flow */}
          {isAna && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <SpendingDonutCard
                period="Septiembre 2026"
                totalSpent={6450.0}
                previousPeriodSpent={7200.0}
                trend_pct={-10.4}
                summary="Excelente liquidez. Tus gastos disminuyeron un 10.4% respecto al mes anterior."
                categories={[
                  { name: 'Supermercado (HEB)', amount: 2850.0, percentage: 44.2, color: '#EB0029' },
                  { name: 'Servicios del Hogar', amount: 1600.0, percentage: 24.8, color: '#4A5568' },
                  { name: 'Restaurantes & Cafés', amount: 1200.0, percentage: 18.6, color: '#FF5A70' },
                  { name: 'Transporte Digital', amount: 800.0, percentage: 12.4, color: '#718096' },
                ]}
              />

              {/* Quick Transfer Station */}
              <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                    Accesos Directos SPEI
                  </span>
                  <span className="text-[11px] text-slate-400">1-clic con Maya</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {contacts.map((c, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => onTriggerMayaPrompt(c.prompt)}
                      className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 hover:border-red-200 hover:bg-red-50/50 transition cursor-pointer text-left"
                    >
                      <div>
                        <div className="text-xs font-bold text-slate-800">{c.name}</div>
                        <div className="text-[10px] text-slate-400">${c.amount} MXN</div>
                      </div>
                      <Send className="h-3.5 w-3.5 text-[#EB0029]" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* SILVIA ADAPTIVE EXPERIENCE: Wealth Growth & Investments */}
          {isSilvia && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <InvestmentSimulatorCard
                initialAmount={50000}
                initialTermDays={91}
                annualRate="9.8%"
              />

              <div className="rounded-2xl border border-blue-200 bg-gradient-to-r from-blue-50/80 via-white to-blue-50/80 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-blue-900">
                      Portafolio Patrimonial Preferente
                    </h4>
                    <p className="text-xs text-blue-700 mt-0.5">
                      Tienes $116,614.10 MXN disponibles con rendimiento diario sugerido.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onTriggerMayaPrompt('Simular inversión en Pagaré Banorte con $50,000')}
                    className="rounded-xl bg-blue-700 px-4 py-2 text-xs font-bold text-white hover:bg-blue-800 transition cursor-pointer"
                  >
                    Simular con Maya
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* 5. Recent Transactions Table (Always synchronized with SQLite) */}
      <div className="banorte-card overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-[#061D3A]">Últimos Movimientos de Cuentas</h3>
            <p className="text-[13px] text-[#6D85A1]">
              Transacciones y transferencias auditadas por SPEI en tiempo real desde SQLite
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              <Filter className="h-3.5 w-3.5 text-slate-500" />
              <span>Filtrar</span>
            </button>
            <button
              type="button"
              onClick={() => alert('Descargando estado de cuenta oficial Banorte en PDF')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50 cursor-pointer"
            >
              <Download className="h-3.5 w-3.5 text-slate-500" />
              <span className="hidden sm:inline">Estado de Cuenta</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#E1EAF2] bg-[#F6F9FC] text-xs font-bold uppercase tracking-wide text-[#617A96]">
                <th className="py-3 px-4">Descripción / Comercio</th>
                <th className="py-3 px-4 hidden sm:table-cell">Cuenta</th>
                <th className="py-3 px-4 hidden md:table-cell">Fecha y Hora</th>
                <th className="py-3 px-4 text-right">Monto</th>
                <th className="py-3 px-4 text-center">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {transactions && transactions.length > 0 ? (
                transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-800">{tx.description}</div>
                      <div className="text-[10px] text-slate-400 sm:hidden">
                        {tx.account} • {tx.date}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-600 hidden sm:table-cell font-mono text-[11px]">
                      {tx.account}
                    </td>
                    <td className="py-3 px-4 text-slate-500 hidden md:table-cell text-[11px]">
                      {tx.date}
                    </td>
                    <td className="py-3 px-4 text-right font-black tabular-nums text-xs">
                      <span className={tx.type === 'credit' ? 'text-emerald-700' : 'text-slate-900'}>
                        {tx.type === 'credit' ? '+' : ''}$
                        {Math.abs(Number(tx.amount) || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                        {tx.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500 text-xs">
                    No hay movimientos registrados en la base de datos para este cliente.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: COGNITIVE TRANSPARENCY & DERECHO AL OLVIDO */}
      {isCognitiveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl border border-slate-200">
            <header className="flex items-center justify-between border-b border-slate-100 bg-[#F6F9FC] px-6 py-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
                  <Brain className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-[#061D3A]">
                    Memoria Cognitiva & Transparencia AI
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Transparencia y Regulación Banorte • SQLite Almacenamiento Seguro
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCognitiveModalOpen(false)}
                className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </header>

            <div className="space-y-4 p-6 text-xs text-slate-700">
              <div className="rounded-xl bg-emerald-50/80 border border-emerald-200 p-3 flex items-start gap-2.5">
                <ShieldCheck className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                <div className="text-[11px] leading-relaxed text-emerald-950">
                  Maya adapta el tono, las gráficas y las recomendaciones según la interacción real almacenada en SQLite para el cliente <strong className="font-bold text-emerald-900">{clientName} ({selectedUserId})</strong>.
                </div>
              </div>

              <div className="space-y-2 font-mono">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Resumen del Perfil</span>
                  <p className="text-slate-800 font-sans text-xs mt-1">
                    {cognitiveProfile?.memory_summary || 'Cliente con interacción ágil y sin antecedentes severos de estrés.'}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Visual Preferida</span>
                    <span className="font-bold text-slate-800 text-xs">
                      {cognitiveProfile?.visual_preferences || (isCarlos ? 'Proyecciones & Tablas' : isSilvia ? 'Rendimientos & Simulador' : 'Gráficos & Donas')}
                    </span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Tono de Maya</span>
                    <span className="font-bold text-slate-800 text-xs">
                      {cognitiveProfile?.recommended_tone || 'Empático y transparente'}
                    </span>
                  </div>
                </div>

                {cognitiveProfile?.sensitivities && (
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Sensibilidades Detectadas</span>
                    <p className="text-slate-800 font-sans text-xs mt-1">{cognitiveProfile.sensitivities}</p>
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={handlePurgeMemory}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-red-50 text-[#EB0029] border border-red-200 px-3.5 py-2 text-xs font-bold hover:bg-red-100 transition cursor-pointer"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Derecho al Olvido (Borrar Memoria)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsCognitiveModalOpen(false)}
                  className="rounded-xl bg-slate-100 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200 transition cursor-pointer"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: REGISTRO NUEVO CONTACTO SPEI */}
      {isAddingContactModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl border border-slate-200">
            <header className="flex items-center justify-between border-b border-slate-100 bg-[#EB0029] px-6 py-4 text-white">
              <div className="flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-white" />
                <h3 className="text-sm font-extrabold">Nuevo Contacto Frecuente SPEI</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddingContactModalOpen(false)}
                className="rounded-xl p-1.5 text-white/80 hover:bg-white/20 hover:text-white transition"
              >
                <X className="h-5 w-5" />
              </button>
            </header>

            <form onSubmit={handleAddContactSubmit} className="space-y-4 p-6 text-xs">
              {contactSuccessMsg ? (
                <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-center text-emerald-800 font-bold">
                  {contactSuccessMsg}
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Nombre completo del beneficiario:
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. María Fernández"
                      value={newContactName}
                      onChange={(e) => setNewContactName(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 p-3 text-xs focus:border-[#EB0029] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Cuenta CLABE (18 dígitos numéricos):
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={18}
                      placeholder="Ej. 012180001234567890"
                      value={newContactClabe}
                      onChange={(e) => setNewContactClabe(e.target.value.replace(/\D/g, ''))}
                      className="w-full font-mono rounded-xl border border-slate-300 p-3 text-xs focus:border-[#EB0029] focus:outline-none"
                    />
                    {newContactClabe.length === 18 && (
                      <span className="mt-1 inline-block text-[11px] font-bold text-emerald-600">
                        ✓ CLABE válida • Banco:{' '}
                        {newContactClabe.startsWith('012')
                          ? 'BBVA México'
                          : newContactClabe.startsWith('638')
                          ? 'Nu México'
                          : 'Institución SPEI'}
                      </span>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Alias (opcional):
                    </label>
                    <input
                      type="text"
                      placeholder="Ej. Mamá / Renta"
                      value={newContactAlias}
                      onChange={(e) => setNewContactAlias(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 p-3 text-xs focus:border-[#EB0029] focus:outline-none"
                    />
                  </div>

                  <div className="pt-2 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setIsAddingContactModalOpen(false)}
                      className="rounded-xl bg-slate-100 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-200"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="rounded-xl bg-[#EB0029] px-5 py-2.5 text-xs font-bold text-white hover:bg-[#C70023] shadow-xs cursor-pointer"
                    >
                      Guardar y Validar
                    </button>
                  </div>
                </>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

