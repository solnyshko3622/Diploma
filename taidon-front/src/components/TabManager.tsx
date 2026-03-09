import type { Tab } from '../types';

interface TabManagerProps {
  tabs: Tab[];
  activeTabId: string;
  onTabSelect: (tabId: string) => void;
  onTabClose: (tabId: string) => void;
  onNewTab: () => void;
}

export function TabManager({ tabs, activeTabId, onTabSelect, onTabClose, onNewTab }: TabManagerProps) {
  return (
    <div className="tab-manager">
      <div className="tab-list">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            className={`tab ${tab.id === activeTabId ? 'active' : ''} ${tab.isDirty ? 'dirty' : ''}`}
            onClick={() => onTabSelect(tab.id)}
          >
            <span className="tab-title">{tab.title}</span>
            <button
              className="tab-close"
              onClick={(e) => {
                e.stopPropagation();
                onTabClose(tab.id);
              }}
              title="Close tab"
            >
              ×
            </button>
          </div>
        ))}
        <button className="new-tab-button" onClick={onNewTab} title="New tab">
          +
        </button>
      </div>
    </div>
  );
}