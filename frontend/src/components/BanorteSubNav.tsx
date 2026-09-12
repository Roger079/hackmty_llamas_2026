import React from 'react';
import { LayoutDashboard, Send, CreditCard, TrendingUp, Sparkles } from 'lucide-react';

export type PortalTab = 'global' | 'transfers' | 'cards' | 'investments' | 'maya';

interface BanorteSubNavProps {
  activeTab: PortalTab;
  onSelectTab: (tab: PortalTab) => void;
  mayaActive?: boolean;
}

export const BanorteSubNav: React.FC<BanorteSubNavProps> = ({
  activeTab,
  onSelectTab,
  mayaActive = true,
}) => {
  const tabs = [
    { id: 'global' as PortalTab, label: 'Posición Global', icon: LayoutDashboard },
    { id: 'transfers' as PortalTab, label: 'Transferencias SPEI', icon: Send },
    { id: 'cards' as PortalTab, label: 'Mis Tarjetas', icon: CreditCard },
    { id: 'investments' as PortalTab, label: 'Inversiones', icon: TrendingUp },
  ];

  return (
    <div className="sticky top-[70px] z-30 w-full border-b border-[#E1EAF2] bg-white shadow-[0_2px_8px_rgba(39,67,95,0.05)]">
      <div className="mx-auto flex h-[46px] max-w-[1536px] items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Navigation Tabs */}
        <div className="flex items-center space-x-2 sm:space-x-4 overflow-x-auto no-scrollbar">
          {tabs.map(({ id, label, icon: Icon }) => {
            const isActive = activeTab === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => onSelectTab(id)}
                className={`flex h-[46px] items-center gap-2 border-b-2 px-3 text-[13px] font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'border-[#EB0029] text-[#EB0029]'
                    : 'border-transparent text-[#526B87] hover:text-[#061D3A] hover:border-slate-300'
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? 'text-[#EB0029]' : 'text-slate-400'}`} />
                <span>{label}</span>
              </button>
            );
          })}
        </div>

        {/* Right side controls: Command Center shortcut & Maya Copiloto Toggle */}
        <div className="flex items-center gap-2">
          <a
            href="/dashboard"
            className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-red-50 hover:bg-red-100/80 text-[#EB0029] border border-red-200 px-3 py-1 text-xs font-bold transition shadow-2xs cursor-pointer"
            title="Abrir Command Center Web para Power Users"
          >
            <LayoutDashboard className="h-3.5 w-3.5" />
            <span>Command Center</span>
          </a>

          <div className="hidden items-center gap-2 sm:flex lg:hidden">
            <button
              type="button"
              onClick={() => onSelectTab(activeTab === 'maya' ? 'global' : 'maya')}
              className={`inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-bold transition shadow-sm ${
                activeTab === 'maya'
                  ? 'bg-[#EB0029] text-white'
                  : 'bg-red-50 text-[#EB0029] border border-red-200 hover:bg-red-100'
              }`}
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Maya Copiloto</span>
              {mayaActive && (
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
