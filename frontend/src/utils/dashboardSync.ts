import { DashboardWidgetItem } from '../types/a2ui';

const SYNC_CHANNEL_NAME = 'banorte_dashboard_sync_channel';

function getStorageKey(userId: string): string {
  return `banorte_dashboard_widgets_${userId || 'default'}`;
}

export function getPinnedWidgets(userId: string): DashboardWidgetItem[] {
  try {
    const raw = localStorage.getItem(getStorageKey(userId));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.warn('Could not read pinned widgets from localStorage:', err);
    return [];
  }
}

export function savePinnedWidgets(userId: string, widgets: DashboardWidgetItem[]): void {
  try {
    localStorage.setItem(getStorageKey(userId), JSON.stringify(widgets));
  } catch (err) {
    console.warn('Could not save pinned widgets to localStorage:', err);
  }
}

export function broadcastWidgetToDashboard(userId: string, widget: DashboardWidgetItem): void {
  try {
    // 1. Persist to localStorage
    const existing = getPinnedWidgets(userId);
    const index = existing.findIndex((w) => w.id === widget.id || (w.component === widget.component && w.title === widget.title));
    let updated: DashboardWidgetItem[];
    if (index >= 0) {
      updated = [...existing];
      updated[index] = widget;
    } else {
      updated = [widget, ...existing];
    }
    savePinnedWidgets(userId, updated);

    // 2. Broadcast to other open windows/tabs (e.g. /dashboard)
    if (typeof BroadcastChannel !== 'undefined') {
      const channel = new BroadcastChannel(SYNC_CHANNEL_NAME);
      channel.postMessage({ type: 'PIN_WIDGET', userId, widget });
      channel.close();
    }
  } catch (err) {
    console.warn('Could not broadcast widget to dashboard:', err);
  }
}

export function subscribeToDashboardSync(
  userId: string,
  onWidgetReceived: (widget: DashboardWidgetItem) => void
): () => void {
  if (typeof BroadcastChannel === 'undefined') {
    return () => {};
  }

  const channel = new BroadcastChannel(SYNC_CHANNEL_NAME);

  const handleMessage = (event: MessageEvent) => {
    if (event.data?.type === 'PIN_WIDGET') {
      // If no specific userId filter, or matches the current user
      if (!userId || !event.data.userId || event.data.userId === userId) {
        if (event.data.widget) {
          onWidgetReceived(event.data.widget);
        }
      }
    }
  };

  channel.addEventListener('message', handleMessage);

  return () => {
    channel.removeEventListener('message', handleMessage);
    channel.close();
  };
}
