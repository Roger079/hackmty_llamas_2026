import React, { useState } from 'react';
import {
  Code,
  Eye,
  Smartphone,
  Monitor,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  ArrowLeft,
  Terminal,
  Layers,
  Search,
  Filter,
  CreditCard,
  PieChart,
  Send,
  TrendingUp,
  ShieldCheck,
  Activity,
  FileSpreadsheet,
  Table,
  GitCommit,
  MapPin,
  BarChart3,
  Target,
  Calendar,
  Clock,
} from 'lucide-react';
import { BanorteLogo } from './BanorteLogo';
import { DynamicA2UIRegistry } from './DynamicA2UIRegistry';
import { A2UIPayload, ActionContext } from '../types/a2ui';

interface A2UINotebookProps {
  onNavigateHome?: () => void;
}

interface ComponentEntry {
  id: string;
  name: string;
  category: 'cuentas' | 'credito' | 'gastos' | 'spei' | 'inversion' | 'tablas' | 'kpis' | 'graficos';
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  payload: A2UIPayload;
}

const NOTEBOOK_COMPONENTS: ComponentEntry[] = [
  {
    id: 'balance-card-nomina',
    name: 'BanorteBalanceCard (Nómina & Débito)',
    category: 'cuentas',
    description: 'Resumen financiero de cuenta de nómina principal con tarjeta de débito asociada y saldo disponible.',
    icon: CreditCard,
    payload: {
      component: 'BanorteBalanceCard',
      props: {
        clientName: 'Ana Martínez',
        primaryAccountName: 'Cuenta Enlace Digital Banorte',
        primaryAccountLast4: '4582',
        primaryAccountBalance: 27900.0,
        secondaryType: 'card',
        cardName: 'Débito Nómina Banorte',
        cardLast4: '9274',
        secondaryBalance: 1450.0,
        status: 'active',
      },
    },
  },
  {
    id: 'balance-card-credito',
    name: 'BanorteBalanceCard (Con Tarjeta de Crédito)',
    category: 'cuentas',
    description: 'Vista de cuentas de cliente con tarjeta de crédito Banorte y saldo deudor en seguimiento.',
    icon: CreditCard,
    payload: {
      component: 'BanorteBalanceCard',
      props: {
        clientName: 'Carlos Ramírez',
        primaryAccountName: 'Cuenta Preferente Banorte',
        primaryAccountLast4: '7721',
        primaryAccountBalance: 4200.0,
        secondaryType: 'card',
        cardName: 'Tarjeta Banorte Clásica',
        cardLast4: '8812',
        totalDebt: 45200.0,
        oroBalance: 12500.0,
      },
    },
  },
  {
    id: 'debt-restructure',
    name: 'DebtRestructureCard (Plan de Reestructura)',
    category: 'credito',
    description: 'Propuesta formal de renegociación de pasivos con opciones de plazo (12, 24, 36 meses), tasa preferencial y ahorro proyectado.',
    icon: Layers,
    payload: {
      component: 'DebtRestructureCard',
      props: {
        totalDebt: 45200.0,
        cardName: 'Tarjeta Banorte Clásica Oro',
        cardLast4: '8812',
        minimumPayment: 3850.0,
        dueDate: '28 Sep 2026',
        currentRate: '68.5% CAT',
        options: [
          {
            plan_id: 'plan_12',
            months: 12,
            monthly_payment: 4150.0,
            annual_rate: '19.5%',
            total_savings: 6200.0,
            label: '12 meses - Mayor rapidez',
          },
          {
            plan_id: 'plan_24',
            months: 24,
            monthly_payment: 2280.0,
            annual_rate: '18.9%',
            total_savings: 9800.0,
            label: '24 meses - Equilibrado',
          },
          {
            plan_id: 'plan_36',
            months: 36,
            monthly_payment: 1580.0,
            annual_rate: '17.9%',
            total_savings: 12400.0,
            label: '36 meses - Menor mensualidad',
          },
        ],
      },
    },
  },
  {
    id: 'spending-donut',
    name: 'SpendingDonutCard (Desglose de Gastos)',
    category: 'gastos',
    description: 'Gráfica interactiva Donut de consumos clasificados por categoría con montos y porcentajes.',
    icon: PieChart,
    payload: {
      component: 'SpendingDonutCard',
      props: {
        title: 'Desglose de Gastos de Agosto 2026',
        totalSpent: 14850.0,
        period: '01 al 31 de Agosto 2026',
        categories: [
          { label: 'Supermercado & Despensa', amount: 5200.0, percentage: 35, color: '#EB0029' },
          { label: 'Servicios & Telefonía', amount: 3100.0, percentage: 21, color: '#004B87' },
          { label: 'Restaurantes & Cafeterías', amount: 2800.0, percentage: 19, color: '#00A859' },
          { label: 'Transporte & Gasolina', amount: 2250.0, percentage: 15, color: '#F7931A' },
          { label: 'Farmacia & Salud', amount: 1500.0, percentage: 10, color: '#7E57C2' },
        ],
      },
    },
  },
  {
    id: 'financial-health',
    name: 'FinancialHealthGauge (Salud Financiera)',
    category: 'gastos',
    description: 'Indicador tipo velocímetro del score de bienestar financiero con nivel de solvencia y recomendaciones.',
    icon: Activity,
    payload: {
      component: 'FinancialHealthGauge',
      props: {
        score: 84,
        tier: 'Saludable',
        summary: 'Tu capacidad de pago y liquidez se encuentran en rango óptimo. Mantienes menos del 30% de tus líneas crediticias en uso.',
        debtRatio: '22%',
        savingsCapacity: '$8,400 MXN / mes',
        emergencyFundMonths: 3.5,
      },
    },
  },
  {
    id: 'spei-transfer-form',
    name: 'SpeiTransferFormCard (Formulario de Envío)',
    category: 'spei',
    description: 'Formulario interactivo para capturar transferencia SPEI inmediata con validación en tiempo real.',
    icon: Send,
    payload: {
      component: 'SpeiTransferFormCard',
      props: {
        defaultRecipient: 'Sofía Mendoza Ríos',
        defaultClabe: '012 180 01594839201 9',
        defaultAmount: 2500.0,
        defaultConcept: 'Pago de colegiatura',
        maxDailyLimit: 50000.0,
      },
    },
  },
  {
    id: 'spei-confirm-card',
    name: 'SpeiConfirmCard (Confirmación SPEI con Token)',
    category: 'spei',
    description: 'Pantalla previa al envío para validar los datos del beneficiario, cuenta CLABE y autorización 2FA.',
    icon: ShieldCheck,
    payload: {
      component: 'SpeiConfirmCard',
      props: {
        recipientName: 'Silvia Carrasco Alvarado',
        recipientBank: 'BBVA Bancomer',
        clabe: '012 180 00456789012 3',
        amount: 3850.0,
        fee: 0.0,
        concept: 'Honorarios profesionales',
        accountDebitLast4: '4582',
        trackingKey: 'BNTE-20260912-77291',
      },
    },
  },
  {
    id: 'spei-receipt-card',
    name: 'SpeiReceiptCard (Comprobante Oficial SPEI)',
    category: 'spei',
    description: 'Recibo oficial emitido con clave de rastreo de Banco de México, sello digital y folio de autorización.',
    icon: Check,
    payload: {
      component: 'SpeiReceiptCard',
      props: {
        folio: 'SPEI-883920194',
        trackingKey: '202609120800123901928301',
        authorizationCode: 'AUTH-9921',
        status: 'Liquidada Exitosamente',
        amount: 3850.0,
        senderName: 'Ana Martínez',
        senderAccount: '•••• 4582',
        recipientName: 'Silvia Carrasco Alvarado',
        recipientBank: 'BBVA Bancomer',
        recipientClabe: '••••••••••• 0123',
        concept: 'Honorarios profesionales',
        timestamp: '12 Sep 2026, 15:28 hrs',
        digitalSeal: 'BANORTE-SHA256-A83F9102B4D',
      },
    },
  },
  {
    id: 'confirmation-receipt',
    name: 'ConfirmationReceipt (Recibo de Convenio)',
    category: 'credito',
    description: 'Comprobante formal emitido tras aceptar una reestructuración de pasivo o liquidación acordada.',
    icon: ShieldCheck,
    payload: {
      component: 'ConfirmationReceipt',
      props: {
        folio: 'FOL-BNTE-2026-R8812',
        status: 'CONVENIO ACTIVADO',
        clientName: 'Carlos Ramírez',
        monthlyPayment: 1580.0,
        termMonths: 36,
        nextPaymentDate: '15 Oct 2026',
        bankSeal: 'BANORTE-CRYPTO-SHA256-VALID',
      },
    },
  },
  {
    id: 'amortization-schedule',
    name: 'AmortizationScheduleCard (Tabla de Amortización)',
    category: 'credito',
    description: 'Tabla desglosada mensual con desglose de amortización a capital, intereses devengados e IVA.',
    icon: FileSpreadsheet,
    payload: {
      component: 'AmortizationScheduleCard',
      props: {
        totalPrincipal: 45200.0,
        monthlyPayment: 1580.0,
        termMonths: 36,
        annualRate: 17.9,
        schedule: [
          { month: 1, payment: 1580, principal: 905, interest: 675, balance: 44295 },
          { month: 2, payment: 1580, principal: 919, interest: 661, balance: 43376 },
          { month: 3, payment: 1580, principal: 932, interest: 648, balance: 42444 },
          { month: 4, payment: 1580, principal: 946, interest: 634, balance: 41498 },
          { month: 5, payment: 1580, principal: 960, interest: 620, balance: 40538 },
          { month: 6, payment: 1580, principal: 975, interest: 605, balance: 39563 },
        ],
      },
    },
  },
  {
    id: 'investment-simulator',
    name: 'InvestmentSimulatorCard (Simulador de Inversión)',
    category: 'inversion',
    description: 'Calculadora interactiva de Pagaré Banorte con ajuste de capital, plazos (28 a 360 días) y cálculo de GAT.',
    icon: TrendingUp,
    payload: {
      component: 'InvestmentSimulatorCard',
      props: {
        initialAmount: 50000.0,
        initialTermDays: 91,
        annualRate: '11.25%',
        estimatedGain: 1412.33,
        totalMaturity: 51412.33,
        productName: 'Pagaré Altos Rendimientos Banorte',
      },
    },
  },
  {
    id: 'banorte-chart-sankey',
    name: 'BanorteChartCard (Flujo de Dinero Sankey)',
    category: 'gastos',
    description: 'Visualización de flujo financiero desde fuentes de ingreso hacia partidas de gasto e inversión.',
    icon: Activity,
    payload: {
      component: 'BanorteChartCard',
      props: {
        chartType: 'sankey',
        title: 'Flujo de Liquidez Banorte',
        data: {
          nodes: [
            { id: 'Ingresos Nómina' },
            { id: 'Cuenta Operativa' },
            { id: 'Ahorro Inversión' },
            { id: 'Gastos Fijos' },
            { id: 'Tarjeta de Crédito' },
          ],
          links: [
            { source: 'Ingresos Nómina', target: 'Cuenta Operativa', value: 27900 },
            { source: 'Cuenta Operativa', target: 'Ahorro Inversión', value: 7000 },
            { source: 'Cuenta Operativa', target: 'Gastos Fijos', value: 14500 },
            { source: 'Cuenta Operativa', target: 'Tarjeta de Crédito', value: 6400 },
          ],
        },
      },
    },
  },
  {
    id: 'data-table-movimientos',
    name: 'DataTable (Movimientos y Estados de Cuenta)',
    category: 'tablas',
    description: 'Tabla dinámica de movimientos y transacciones bancarias con ordenamiento de columnas, filtro en vivo y badges de estatus.',
    icon: Table,
    payload: {
      component: 'DataTable',
      props: {
        title: 'Últimos Movimientos y Transferencias Registradas',
        sortable: true,
        filterable: true,
        pageSize: 5,
        columns: [
          { key: 'fecha', label: 'Fecha', type: 'date', sortable: true },
          { key: 'concepto', label: 'Concepto / Comercio', type: 'text', sortable: true },
          { key: 'categoria', label: 'Categoría', type: 'text', sortable: true },
          { key: 'monto', label: 'Monto', type: 'currency', sortable: true },
          { key: 'estado', label: 'Estado', type: 'status' },
        ],
        rows: [
          { id: '1', fecha: '12 Sep 2026', concepto: 'Superama Valle Oriente', categoria: 'Supermercado', monto: -1850.5, estado: 'good' },
          { id: '2', fecha: '11 Sep 2026', concepto: 'Depósito Nómina Banorte', categoria: 'Ingresos', monto: 27900.0, estado: 'good' },
          { id: '3', fecha: '10 Sep 2026', concepto: 'CFE Suministrador Básico', categoria: 'Servicios', monto: -820.0, estado: 'neutral' },
          { id: '4', fecha: '09 Sep 2026', concepto: 'Gasolinera Oxxo Gas Valle', categoria: 'Transporte', monto: -950.0, estado: 'good' },
          { id: '5', fecha: '08 Sep 2026', concepto: 'SPEI Enviado - Silvia Carrasco', categoria: 'Transferencias', monto: -3850.0, estado: 'good' },
          { id: '6', fecha: '05 Sep 2026', concepto: 'Farmacias Benavides San Pedro', categoria: 'Salud', monto: -340.0, estado: 'good' },
        ],
      },
    },
  },
  {
    id: 'comparison-table-tarjetas',
    name: 'ComparisonTable (Comparativa de Tarjetas)',
    category: 'tablas',
    description: 'Matriz comparativa de características, tasas CAT, costos de anualidad y beneficios entre productos Banorte.',
    icon: FileSpreadsheet,
    payload: {
      component: 'ComparisonTable',
      props: {
        title: 'Comparativa de Tarjetas de Crédito Banorte',
        columns: [
          { key: 'clasica', label: 'Banorte Clásica' },
          { key: 'oro', label: 'Banorte Oro (Recomendada)', highlight: true },
          { key: 'platinum', label: 'Banorte Platinum' },
        ],
        rows: [
          { attribute: 'Anualidad titular', values: { clasica: '$690 MXN', oro: '$1,150 MXN (1er año gratis)', platinum: '$2,450 MXN' } },
          { attribute: 'Tasa de Interés CAT', values: { clasica: '68.5% prom.', oro: '54.2% preferente', platinum: '38.9% exclusiva' } },
          { attribute: 'Puntos Recompensa', values: { clasica: '1 pt por $10 MXN', oro: '1.5 pts por $10 MXN', platinum: '2.0 pts por $10 MXN' } },
          { attribute: 'Línea de crédito inicial', values: { clasica: '$15,000 - $35,000', oro: '$35,000 - $90,000', platinum: '$90,000+' } },
          { attribute: 'Seguro de viajes Visa', values: { clasica: 'Básico', oro: 'Cobertura médica $25k USD', platinum: 'Cobertura médica $150k USD' } },
        ],
      },
    },
  },
  {
    id: 'timeline-aclaracion',
    name: 'Timeline (Seguimiento de Trámites y Folios)',
    category: 'tablas',
    description: 'Visualización de estados secuenciales de un proceso bancario (aclaraciones, solicitudes de crédito o créditos hipotecarios).',
    icon: Clock,
    payload: {
      component: 'Timeline',
      props: {
        title: 'Estatus de Aclaración de Cargo No Reconocido',
        orientation: 'vertical',
        steps: [
          { label: 'Reporte Registrado', date: '08 Sep 2026, 14:10 hrs', status: 'completed', description: 'Folio BNTE-AC-2026-8941 generado vía Maya Chat.' },
          { label: 'Bloqueo Preventivo de Plástico', date: '08 Sep 2026, 14:12 hrs', status: 'completed', description: 'Tarjeta terminación 8812 bloqueada y reexpedición emitida.' },
          { label: 'Dictamen de Análisis Técnico', date: '11 Sep 2026, 10:30 hrs', status: 'completed', description: 'Comprobación de geolocalización y ausencia de chip físico.' },
          { label: 'Abono Provisional en Cuenta', date: '12 Sep 2026, 17:00 hrs', status: 'current', description: 'Abono de $3,850.00 MXN en validación de liquidación.' },
          { label: 'Cierre Definitivo de Aclaración', date: '16 Sep 2026', status: 'pending', description: 'Resolución final y emisión de carta finiquito por correo.' },
        ],
      },
    },
  },
  {
    id: 'geomap-sucursales',
    name: 'GeoMap (Red de Cajeros y Sucursales Banorte)',
    category: 'tablas',
    description: 'Mapa interactivo con coordenadas de sucursales, cajeros inteligentes y módulos de retiro sin tarjeta.',
    icon: MapPin,
    payload: {
      component: 'GeoMap',
      props: {
        centerLat: 25.6698,
        centerLng: -100.3521,
        zoom: 12,
        markers: [
          { lat: 25.6866, lng: -100.3161, label: 'Sucursal Matriz Monterrey (Padre Mier 450 - Abierta hasta 16:00)', value: 1 },
          { lat: 25.6514, lng: -100.3598, label: 'Cajero Banorte Valle Oriente (24 hrs - Retiro sin tarjeta)', value: 2 },
          { lat: 25.6698, lng: -100.3621, label: 'Sucursal San Pedro Gómez Morín (Atención Clientes Preferente)', value: 3 },
          { lat: 25.6489, lng: -100.334, label: 'Cajero Plaza Fiesta San Agustín (Depósito en Efectivo)', value: 4 },
        ],
      },
    },
  },
  {
    id: 'kpi-card-rendimiento',
    name: 'KpiCard (Rendimiento Ponderado Anual)',
    category: 'kpis',
    description: 'Indicador métrico ejecutivo con valor porcentual, variación delta positiva y estado semafórico de salud.',
    icon: TrendingUp,
    payload: {
      component: 'KpiCard',
      props: {
        label: 'Rendimiento Ponderado de Inversiones (Anual)',
        value: 11.45,
        valueFormat: 'percent',
        deltaValue: 1.8,
        deltaDirection: 'up',
        status: 'good',
      },
    },
  },
  {
    id: 'kpi-card-liquidez',
    name: 'KpiCard (Liquidez Inmediata Disponible)',
    category: 'kpis',
    description: 'Tarjeta KPI de liquidez operativa disponible en cuentas a la vista con seguimiento mensual.',
    icon: CreditCard,
    payload: {
      component: 'KpiCard',
      props: {
        label: 'Liquidez Disponible en Cuentas a la Vista',
        value: 32100.0,
        valueFormat: 'currency',
        currency: 'MXN',
        deltaValue: 3400.0,
        deltaDirection: 'up',
        status: 'good',
      },
    },
  },
  {
    id: 'progress-indicator-ahorro',
    name: 'ProgressIndicator (Meta Fondo de Emergencia - Barra)',
    category: 'kpis',
    description: 'Barra de progreso de meta financiera con objetivo, monto ahorrado y porcentaje de completitud.',
    icon: Target,
    payload: {
      component: 'ProgressIndicator',
      props: {
        variant: 'bar',
        label: 'Meta Fondo de Emergencia (4 Meses de Gastos)',
        value: 42500,
        min: 0,
        max: 60000,
        target: 60000,
        valueFormat: 'currency',
        currency: 'MXN',
        status: 'good',
      },
    },
  },
  {
    id: 'progress-indicator-presupuesto',
    name: 'ProgressIndicator (Control de Presupuesto - Anillo)',
    category: 'kpis',
    description: 'Indicador de anillo circular que muestra la velocidad de consumo del presupuesto mensual asignado.',
    icon: Activity,
    payload: {
      component: 'ProgressIndicator',
      props: {
        variant: 'ring',
        label: 'Ejecución del Presupuesto Mensual',
        value: 18200,
        min: 0,
        max: 25000,
        target: 25000,
        valueFormat: 'currency',
        currency: 'MXN',
        status: 'warning',
      },
    },
  },
  {
    id: 'calendar-heatmap-gastos',
    name: 'BanorteChartCard (Mapa de Calor de Gastos Diarios)',
    category: 'graficos',
    description: 'Matriz de calendario mensual con gradiente de color según la intensidad del gasto efectuado cada día.',
    icon: Calendar,
    payload: {
      component: 'BanorteChartCard',
      props: {
        chartType: 'calendarHeatmap',
        title: 'Mapa de Calor: Intensidad de Gastos por Día (Agosto 2026)',
        height: 260,
        daily_spending: [
          { date: '2026-08-01', value: 1200 }, { date: '2026-08-02', value: 350 }, { date: '2026-08-03', value: 2800 },
          { date: '2026-08-04', value: 150 }, { date: '2026-08-05', value: 920 }, { date: '2026-08-06', value: 450 },
          { date: '2026-08-07', value: 3100 }, { date: '2026-08-08', value: 600 }, { date: '2026-08-09', value: 180 },
          { date: '2026-08-10', value: 1400 }, { date: '2026-08-11', value: 2100 }, { date: '2026-08-12', value: 500 },
          { date: '2026-08-13', value: 750 }, { date: '2026-08-14', value: 980 }, { date: '2026-08-15', value: 4800 },
          { date: '2026-08-16', value: 620 }, { date: '2026-08-17', value: 300 }, { date: '2026-08-18', value: 1250 },
          { date: '2026-08-19', value: 890 }, { date: '2026-08-20', value: 410 }, { date: '2026-08-21', value: 2200 },
          { date: '2026-08-22', value: 3400 }, { date: '2026-08-23', value: 510 }, { date: '2026-08-24', value: 930 },
          { date: '2026-08-25', value: 1100 }, { date: '2026-08-26', value: 450 }, { date: '2026-08-27', value: 780 },
          { date: '2026-08-28', value: 3900 }, { date: '2026-08-29', value: 1650 }, { date: '2026-08-30', value: 2400 },
          { date: '2026-08-31', value: 5200 },
        ],
      },
    },
  },
  {
    id: 'multi-line-tendencia',
    name: 'MultiLineChart (Histórico: Ingresos vs Egresos)',
    category: 'graficos',
    description: 'Líneas superpuestas que contrastan los ingresos netos de nómina frente a los egresos totales por mes.',
    icon: TrendingUp,
    payload: {
      component: 'MultiLineChart',
      props: {
        title: 'Histórico Mensual: Ingresos vs Egresos (Últimos 6 Meses)',
        height: 260,
        categoryKey: 'mes',
        series: [
          { name: 'Ingresos Nómina', dataPath: '/data', xKey: 'mes', yKey: 'ingresos', color: '#008A5A' },
          { name: 'Egresos Totales', dataPath: '/data', xKey: 'mes', yKey: 'egresos', color: '#E4003B' },
        ],
        data: {
          data: [
            { mes: 'Mar', ingresos: 27900, egresos: 18400 },
            { mes: 'Abr', ingresos: 29500, egresos: 21100 },
            { mes: 'May', ingresos: 33400, egresos: 22800 },
            { mes: 'Jun', ingresos: 27900, egresos: 19500 },
            { mes: 'Jul', ingresos: 28200, egresos: 24300 },
            { mes: 'Ago', ingresos: 31000, egresos: 20100 },
          ],
        },
      },
    },
  },
  {
    id: 'bar-horizontal-comercios',
    name: 'BarHorizontalChart (Top Comercios con Mayor Gasto)',
    category: 'graficos',
    description: 'Barras horizontales con clasificación de los establecimientos comerciales con mayor volumen de facturación.',
    icon: BarChart3,
    payload: {
      component: 'BarHorizontalChart',
      props: {
        title: 'Top 5 Comercios con Mayor Gasto Acumulado',
        height: 250,
        categoryKey: 'comercio',
        valueKey: 'total',
        valueFormat: 'currency',
        data: {
          data: [
            { comercio: 'Walmart Supercenter', total: 6850 },
            { comercio: 'Costco Wholesale', total: 5400 },
            { comercio: 'Gasolineras OXXO Gas', total: 3200 },
            { comercio: 'Amazon México', total: 2950 },
            { comercio: 'Restaurante Sonora Grill', total: 2100 },
          ],
        },
      },
    },
  },
  {
    id: 'stacked-bar-presupuesto',
    name: 'StackedBarChart (Presupuesto Planeado vs Ejercido)',
    category: 'graficos',
    description: 'Barras apiladas que visualizan el presupuesto ejercido y el remanente disponible en cada categoría de gasto.',
    icon: BarChart3,
    payload: {
      component: 'StackedBarChart',
      props: {
        title: 'Presupuesto Planeado vs Ejercido por Categoría',
        height: 260,
        categoryKey: 'categoria',
        series: [
          { name: 'Gasto Ejercido', dataPath: '/data', xKey: 'categoria', yKey: 'ejercido', color: '#E4003B' },
          { name: 'Disponible Presupuestado', dataPath: '/data', xKey: 'categoria', yKey: 'remanente', color: '#0A5CA8' },
        ],
        data: {
          data: [
            { categoria: 'Supermercado', ejercido: 5200, remanente: 1800 },
            { categoria: 'Servicios', ejercido: 3100, remanente: 900 },
            { categoria: 'Restaurantes', ejercido: 2800, remanente: 700 },
            { categoria: 'Transporte', ejercido: 2250, remanente: 750 },
            { categoria: 'Salud', ejercido: 1500, remanente: 1500 },
          ],
        },
      },
    },
  },
  {
    id: 'stacked-area-portafolio',
    name: 'StackedAreaChart (Evolución de Portafolio de Inversión)',
    category: 'inversion',
    description: 'Evolución de áreas apiladas mostrando el crecimiento del patrimonio diversificado en Pagarés, Fondos y Ahorro.',
    icon: Layers,
    payload: {
      component: 'StackedAreaChart',
      props: {
        title: 'Evolución de Portafolio de Ahorro e Inversión (2026)',
        height: 260,
        categoryKey: 'mes',
        series: [
          { name: 'Pagaré Altos Rendimientos', dataPath: '/data', xKey: 'mes', yKey: 'pagare', color: '#E4003B' },
          { name: 'Fondos Banorte Renta Fija', dataPath: '/data', xKey: 'mes', yKey: 'fondos', color: '#0A5CA8' },
          { name: 'Cuenta de Ahorro Enlace', dataPath: '/data', xKey: 'mes', yKey: 'ahorro', color: '#008A5A' },
        ],
        data: {
          data: [
            { mes: 'Ene', pagare: 30000, fondos: 15000, ahorro: 10000 },
            { mes: 'Feb', pagare: 32000, fondos: 16200, ahorro: 11500 },
            { mes: 'Mar', pagare: 35000, fondos: 18000, ahorro: 12000 },
            { mes: 'Abr', pagare: 40000, fondos: 20500, ahorro: 14000 },
            { mes: 'May', pagare: 45000, fondos: 23000, ahorro: 15500 },
            { mes: 'Jun', pagare: 50000, fondos: 26500, ahorro: 18000 },
          ],
        },
      },
    },
  },
  {
    id: 'projection-chart-ahorro',
    name: 'ProjectionChart (Proyección de Crecimiento a 5 Años)',
    category: 'inversion',
    description: 'Proyección futura con modelo de interés compuesto y bandas de certidumbre (escenarios optimista y conservador).',
    icon: TrendingUp,
    payload: {
      component: 'ProjectionChart',
      props: {
        title: 'Proyección de Rendimiento con Interés Compuesto (5 Años)',
        height: 270,
        categoryKey: 'año',
        valueKey: 'estimado',
        series: [
          { name: 'Rendimiento Esperado (11.25% anual)', dataPath: '/data', xKey: 'año', yKey: 'estimado', color: '#008A5A' },
        ],
        scenarios: [
          { name: 'Banda de Certidumbre (Conservador vs Agresivo)', dataPath: '/data', xKey: 'año', yKey: 'estimado', confidenceLowKey: 'bajo', confidenceHighKey: 'alto' },
        ],
        data: {
          data: [
            { año: '2026 (Actual)', estimado: 50000, bajo: 50000, alto: 50000 },
            { año: '2027 (+1 Año)', estimado: 55625, bajo: 54000, alto: 57200 },
            { año: '2028 (+2 Años)', estimado: 61882, bajo: 58500, alto: 65400 },
            { año: '2029 (+3 Años)', estimado: 68844, bajo: 63200, alto: 74800 },
            { año: '2030 (+4 Años)', estimado: 76589, bajo: 68400, alto: 85500 },
            { año: '2031 (+5 Años)', estimado: 85205, bajo: 74000, alto: 98000 },
          ],
        },
      },
    },
  },
  {
    id: 'waterfall-conciliacion',
    name: 'BanorteChartCard (Conciliación de Flujo Waterfall)',
    category: 'gastos',
    description: 'Gráfica de cascada para conciliar el balance inicial, entradas de efectivo, deducciones y saldo neto de cierre.',
    icon: Layers,
    payload: {
      component: 'BanorteChartCard',
      props: {
        chartType: 'waterfall',
        title: 'Conciliación Mensual de Flujo de Efectivo',
        height: 260,
        categoryKey: 'concepto',
        valueKey: 'monto',
        waterfallStartLabel: 'Saldo Inicial',
        waterfallEndLabel: 'Saldo Final',
        data: {
          data: [
            { concepto: 'Saldo Inicial', monto: 12500 },
            { concepto: '+ Nómina', monto: 27900 },
            { concepto: '- Tarjeta Crédito', monto: -6400 },
            { concepto: '- Transferencias', monto: -3850 },
            { concepto: '- Servicios / Retiros', monto: -4250 },
            { concepto: '+ Rendimientos', monto: 850 },
            { concepto: 'Saldo Final', monto: 26750 },
          ],
        },
      },
    },
  },
];

export const A2UINotebook: React.FC<A2UINotebookProps> = ({ onNavigateHome }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [containerWidth, setContainerWidth] = useState<'mobile' | 'wide'>('mobile');
  const [activeTabPerComponent, setActiveTabPerComponent] = useState<Record<string, 'preview' | 'json' | 'edit'>>({});
  const [customPayloads, setCustomPayloads] = useState<Record<string, A2UIPayload>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [actionLogs, setActionLogs] = useState<Array<{ timestamp: string; action: string; data: any }>>([]);
  const [isConsoleOpen, setIsConsoleOpen] = useState(false);

  const filteredComponents = NOTEBOOK_COMPONENTS.filter((comp) => {
    const matchesCat = selectedCategory === 'all' || comp.category === selectedCategory;
    const matchesSearch =
      comp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      comp.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      comp.payload.component.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleAction = async (actionCtx: ActionContext): Promise<boolean> => {
    const time = new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setActionLogs((prev) => [
      {
        timestamp: time,
        action: actionCtx.action,
        data: actionCtx.params || (actionCtx as any).data || {},
      },
      ...prev.slice(0, 49),
    ]);
    return true;
  };

  const handleCopyJson = (payload: A2UIPayload, id: string) => {
    navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
    setCopiedId(id);
    window.setTimeout(() => setCopiedId(null), 1500);
  };

  const handleResetPayload = (id: string) => {
    setCustomPayloads((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const handleJsonEdit = (id: string, text: string) => {
    try {
      const parsed = JSON.parse(text);
      if (parsed && typeof parsed === 'object' && parsed.component) {
        setCustomPayloads((prev) => ({ ...prev, [id]: parsed }));
      }
    } catch {
      // Allow user to continue editing malformed JSON without crash
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#F4F6F9] text-slate-900 flex flex-col antialiased selection:bg-[#EB0029] selection:text-white">
      {/* 1. Notebook Top Bar */}
      <header className="sticky top-0 z-40 bg-[#EB0029] text-white px-4 sm:px-6 py-3 shadow-md border-b border-[#C70023]">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {onNavigateHome && (
              <button
                type="button"
                onClick={onNavigateHome}
                className="inline-flex items-center gap-1 rounded-xl bg-white/10 hover:bg-white/20 px-2.5 py-1.5 text-xs font-bold text-white transition border border-white/20 cursor-pointer"
                title="Regresar a la aplicación"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Regresar</span>
              </button>
            )}
            <BanorteLogo className="h-5 w-auto shrink-0" theme="red" />
            <span className="hidden h-4 w-px bg-white/30 sm:block" />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-white">
                  A2UI Component Notebook
                </span>
                <span className="rounded-full bg-white/20 px-2 py-0.2 text-[9px] font-mono font-bold text-white">
                  v1.2 Debugger
                </span>
              </div>
              <p className="hidden text-[10px] text-red-100 sm:block">
                Visualizador interactivo de todos los componentes declarativos A2UI Banorte
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Viewport Width Switcher */}
            <div className="flex items-center rounded-xl bg-black/20 p-0.5 border border-white/20">
              <button
                type="button"
                onClick={() => setContainerWidth('mobile')}
                className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-bold transition cursor-pointer ${
                  containerWidth === 'mobile'
                    ? 'bg-white text-[#EB0029] shadow-xs'
                    : 'text-white/80 hover:text-white'
                }`}
                title="Ver en ancho de Smartphone (390px)"
              >
                <Smartphone className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Móvil (390px)</span>
              </button>
              <button
                type="button"
                onClick={() => setContainerWidth('wide')}
                className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-bold transition cursor-pointer ${
                  containerWidth === 'wide'
                    ? 'bg-white text-[#EB0029] shadow-xs'
                    : 'text-white/80 hover:text-white'
                }`}
                title="Ver en contenedor amplio (100%)"
              >
                <Monitor className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Desktop</span>
              </button>
            </div>

            {/* Action Console Toggle */}
            <button
              type="button"
              onClick={() => setIsConsoleOpen(!isConsoleOpen)}
              className={`flex items-center gap-1.5 rounded-xl border px-3 py-1 text-xs font-bold transition cursor-pointer ${
                isConsoleOpen || actionLogs.length > 0
                  ? 'bg-white text-slate-900 border-white shadow-xs'
                  : 'bg-white/10 text-white border-white/20 hover:bg-white/20'
              }`}
              title="Abrir consola de eventos interactivos A2UI"
            >
              <Terminal className="h-3.5 w-3.5 text-emerald-600" />
              <span>Acciones</span>
              {actionLogs.length > 0 && (
                <span className="rounded-full bg-[#EB0029] text-white px-1.5 py-0.2 text-[10px] font-mono font-bold">
                  {actionLogs.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* 2. Search & Category Filter Toolbar */}
      <div className="sticky top-[53px] z-30 bg-white border-b border-slate-200 shadow-2xs px-4 sm:px-6 py-2.5">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3">
          {/* Category Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {[
              { id: 'all', label: 'Todos' },
              { id: 'cuentas', label: 'Cuentas & Saldos' },
              { id: 'credito', label: 'Crédito & Deuda' },
              { id: 'gastos', label: 'Analítica & Gastos' },
              { id: 'spei', label: 'Transferencias SPEI' },
              { id: 'inversion', label: 'Inversiones' },
              { id: 'tablas', label: 'Tablas & Procesos' },
              { id: 'kpis', label: 'KPIs & Metas' },
              { id: 'graficos', label: 'Gráficos Avanzados' },
            ].map((cat) => {
              const count = cat.id === 'all'
                ? NOTEBOOK_COMPONENTS.length
                : NOTEBOOK_COMPONENTS.filter((c) => c.category === cat.id).length;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-bold transition cursor-pointer ${
                    selectedCategory === cat.id
                      ? 'bg-[#EB0029] text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat.label} ({count})
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar componente o prop..."
              className="h-8 w-full rounded-full border border-slate-200 bg-slate-50 pl-8 pr-3 text-xs font-medium text-slate-900 outline-none focus:border-[#EB0029] focus:bg-white focus:ring-1 focus:ring-[#EB0029]"
            />
          </div>
        </div>
      </div>

      {/* 3. Main Showcase Canvas */}
      <main className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-6 py-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="text-base font-extrabold text-slate-900">
              Catálogo de Componentes Visuales ({filteredComponents.length})
            </h1>
            <p className="text-xs text-slate-500">
              Prueba interacciones táctiles, valida respuestas de botón e inspecciona esquemas JSON en vivo.
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400">
            Modo de vista: {containerWidth === 'mobile' ? 'Simulador Smartphone 390px' : 'Contenedor Completo'}
          </span>
        </div>

        {/* Grid of Components */}
        <div
          className={
            containerWidth === 'mobile'
              ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 items-start'
              : 'grid grid-cols-1 lg:grid-cols-2 gap-6 items-start'
          }
        >
          {filteredComponents.map((item) => {
            const Icon = item.icon;
            const currentTab = activeTabPerComponent[item.id] || 'preview';
            const activePayload = customPayloads[item.id] || item.payload;
            const isModified = Boolean(customPayloads[item.id]);

            return (
              <div
                key={item.id}
                className="rounded-2xl border border-slate-200/90 bg-white shadow-xs overflow-hidden transition hover:shadow-md flex flex-col"
              >
                {/* Component Card Header */}
                <div className="border-b border-slate-100 bg-slate-50/70 p-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="h-8 w-8 rounded-xl bg-red-50 text-[#EB0029] grid place-items-center shrink-0 border border-red-100">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h2 className="text-xs font-extrabold text-slate-900 truncate">
                          {item.name}
                        </h2>
                        {isModified && (
                          <span className="rounded-md bg-amber-100 px-1.5 py-0.2 text-[9px] font-bold text-amber-800">
                            Editado
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 truncate">{item.description}</p>
                    </div>
                  </div>

                  {/* Component Tab Toggles */}
                  <div className="flex items-center rounded-lg bg-slate-200/60 p-0.5 text-[11px] shrink-0">
                    <button
                      type="button"
                      onClick={() => setActiveTabPerComponent((prev) => ({ ...prev, [item.id]: 'preview' }))}
                      className={`flex items-center gap-1 rounded-md px-2 py-0.5 font-bold transition cursor-pointer ${
                        currentTab === 'preview'
                          ? 'bg-white text-[#EB0029] shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                      title="Ver componente interactivo en vivo"
                    >
                      <Eye className="h-3 w-3" />
                      <span>Vista</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTabPerComponent((prev) => ({ ...prev, [item.id]: 'json' }))}
                      className={`flex items-center gap-1 rounded-md px-2 py-0.5 font-bold transition cursor-pointer ${
                        currentTab === 'json'
                          ? 'bg-white text-slate-900 shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                      title="Ver esquema JSON A2UI"
                    >
                      <Code className="h-3 w-3" />
                      <span>JSON</span>
                    </button>
                  </div>
                </div>

                {/* Component Body */}
                <div className="p-4 bg-slate-50/40 flex-1 flex flex-col justify-center">
                  {currentTab === 'preview' ? (
                    <div
                      className={
                        containerWidth === 'mobile'
                          ? 'max-w-[390px] mx-auto w-full transition-all'
                          : 'w-full transition-all'
                      }
                    >
                      <DynamicA2UIRegistry
                        payload={activePayload}
                        onAction={handleAction}
                      />
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span className="font-mono text-[10px]">A2UIPayload Declarativo</span>
                        <div className="flex items-center gap-1.5">
                          {isModified && (
                            <button
                              type="button"
                              onClick={() => handleResetPayload(item.id)}
                              className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold text-amber-700 hover:bg-amber-50 cursor-pointer"
                              title="Restablecer a valores iniciales"
                            >
                              <RotateCcw className="h-3 w-3" />
                              <span>Restablecer</span>
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleCopyJson(activePayload, item.id)}
                            className="inline-flex items-center gap-1 rounded-md bg-slate-200 px-2 py-0.5 text-[10px] font-bold text-slate-700 hover:bg-slate-300 transition cursor-pointer"
                            title="Copiar JSON al portapapeles"
                          >
                            {copiedId === item.id ? (
                              <>
                                <Check className="h-3 w-3 text-emerald-600" />
                                <span>Copiado</span>
                              </>
                            ) : (
                              <>
                                <Copy className="h-3 w-3" />
                                <span>Copiar</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                      <textarea
                        value={JSON.stringify(activePayload, null, 2)}
                        onChange={(e) => handleJsonEdit(item.id, e.target.value)}
                        rows={14}
                        className="w-full rounded-xl bg-slate-900 p-3 font-mono text-xs text-emerald-400 leading-relaxed outline-none border border-slate-800 resize-y"
                        spellCheck={false}
                      />
                    </div>
                  )}
                </div>

                {/* Component Card Footer */}
                <div className="border-t border-slate-100 bg-white px-3.5 py-2 flex items-center justify-between text-[11px] text-slate-500">
                  <span className="font-mono text-[10px] text-slate-400">
                    ID: {item.id}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* 4. Real-time Action Dispatch Console Drawer */}
      {isConsoleOpen && (
        <div className="fixed bottom-0 right-0 left-0 sm:left-auto sm:right-6 sm:bottom-6 sm:w-[480px] bg-slate-950 text-white rounded-t-2xl sm:rounded-2xl border border-slate-800 shadow-2xl z-50 overflow-hidden flex flex-col max-h-[380px] animate-in slide-in-from-bottom duration-200">
          <header className="flex items-center justify-between border-b border-white/10 px-4 py-3 bg-slate-900">
            <div className="flex items-center gap-2">
              <Terminal className="h-4 w-4 text-emerald-400" />
              <h3 className="text-xs font-extrabold tracking-wide uppercase">
                Consola de Despacho de Acciones ({actionLogs.length})
              </h3>
            </div>
            <div className="flex items-center gap-2">
              {actionLogs.length > 0 && (
                <button
                  type="button"
                  onClick={() => setActionLogs([])}
                  className="text-[10px] text-slate-400 hover:text-white cursor-pointer"
                >
                  Limpiar
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsConsoleOpen(false)}
                className="text-xs text-slate-400 hover:text-white cursor-pointer px-1"
              >
                ✕
              </button>
            </div>
          </header>

          <div className="p-3 overflow-y-auto space-y-2 flex-1 font-mono text-xs">
            {actionLogs.length === 0 ? (
              <p className="text-slate-500 italic text-[11px] p-2 text-center">
                Interactúa con los botones de cualquier componente A2UI para ver los eventos despachados aquí.
              </p>
            ) : (
              actionLogs.map((log, i) => (
                <div
                  key={i}
                  className="rounded-lg bg-black/40 p-2 border border-slate-800/80 space-y-1"
                >
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span className="font-bold text-emerald-400">{log.action}</span>
                    <span>{log.timestamp}</span>
                  </div>
                  <pre className="text-[11px] text-slate-300 overflow-x-auto">
                    {JSON.stringify(log.data, null, 2)}
                  </pre>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* 5. Minimalist Footer */}
      <footer className="py-4 border-t border-slate-200 bg-white text-center text-[11px] text-slate-400 font-medium">
        Banorte A2UI Architecture · Entorno de pruebas y validación visual
      </footer>
    </div>
  );
};
