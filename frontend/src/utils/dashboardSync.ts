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

/**
 * Loads pinned widgets from cloud SQLite database, falling back to localStorage.
 */
export async function fetchCloudPinnedWidgets(userId: string): Promise<DashboardWidgetItem[]> {
  try {
    const res = await fetch(`/api/dashboard/widgets?user_id=${userId || 'C001'}`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.widgets) && data.widgets.length > 0) {
        savePinnedWidgets(userId, data.widgets);
        return data.widgets;
      }
    }
  } catch (err) {
    console.warn('Could not fetch cloud pinned widgets:', err);
  }
  return getPinnedWidgets(userId);
}

/**
 * Removes a pinned widget from cloud SQLite and local storage.
 */
export async function removeCloudPinnedWidget(userId: string, widgetId: string): Promise<void> {
  try {
    fetch(`/api/dashboard/widgets?user_id=${userId || 'C001'}&widget_id=${encodeURIComponent(widgetId)}`, {
      method: 'DELETE',
    }).catch(() => {});
  } catch {}
}

/**
 * Clears all pinned widgets from cloud SQLite and local storage.
 */
export async function clearCloudPinnedWidgets(userId: string): Promise<void> {
  try {
    fetch(`/api/dashboard/widgets?user_id=${userId || 'C001'}`, {
      method: 'DELETE',
    }).catch(() => {});
  } catch {}
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

    // 2. Broadcast to other open windows/tabs on the same machine
    if (typeof BroadcastChannel !== 'undefined') {
      try {
        const channel = new BroadcastChannel(SYNC_CHANNEL_NAME);
        channel.postMessage({ type: 'PIN_WIDGET', userId, widget });
        channel.close();
      } catch {}
    }

    // 3. Cross-Device Cloud Sync: Push to remote Cloud Dashboard
    fetch('/api/dashboard/widgets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId || 'C001', widget }),
    }).catch((err) => {
      console.warn('Could not push widget to cloud dashboard:', err);
    });
  } catch (err) {
    console.warn('Could not broadcast widget to dashboard:', err);
  }
}

export function subscribeToDashboardSync(
  userId: string,
  onWidgetReceived: (widget: DashboardWidgetItem) => void
): () => void {
  let isCleanedUp = false;

  // 1. Local Browser Tab Sync (BroadcastChannel)
  let channel: BroadcastChannel | null = null;
  if (typeof BroadcastChannel !== 'undefined') {
    try {
      channel = new BroadcastChannel(SYNC_CHANNEL_NAME);
      channel.addEventListener('message', (event: MessageEvent) => {
        if (event.data?.type === 'PIN_WIDGET') {
          if (!userId || !event.data.userId || event.data.userId === userId) {
            if (event.data.widget) {
              onWidgetReceived(event.data.widget);
            }
          }
        }
      });
    } catch {}
  }

  // 2. Real-Time Cloud SSE Sync (Cross-Device Phone -> Cloud PC)
  let eventSource: EventSource | null = null;
  if (typeof EventSource !== 'undefined') {
    try {
      eventSource = new EventSource(`/api/dashboard/events?user_id=${userId || 'C001'}`);
      eventSource.addEventListener('widget', (event) => {
        if (isCleanedUp) return;
        try {
          const widget = JSON.parse(event.data);
          if (widget && widget.component) {
            onWidgetReceived(widget);
          }
        } catch (err) {
          console.warn('Error parsing cloud widget event:', err);
        }
      });
    } catch (err) {
      console.warn('Could not connect to cloud dashboard SSE:', err);
    }
  }

  return () => {
    isCleanedUp = true;
    if (channel) {
      channel.close();
    }
    if (eventSource) {
      eventSource.close();
    }
  };
}
