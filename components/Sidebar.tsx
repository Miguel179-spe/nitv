
import React from 'react';
import { Channel } from '../types';

interface SidebarProps {
  channels: Channel[];
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  onSearch: (term: string) => void;
  onSelectChannel: (channel: Channel) => void;
  activeChannelId?: number;
  isOpen: boolean;
  loading: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  channels, 
  categories, 
  selectedCategory, 
  onSelectCategory, 
  onSearch, 
  onSelectChannel, 
  activeChannelId, 
  isOpen,
  loading
}) => {
  return (
    <aside className={`
      ${isOpen ? 'translate-x-0' : '-translate-x-full md:w-0'} 
      fixed md:relative z-40 w-72 h-full bg-zinc-950 border-r border-zinc-800 flex flex-col transition-all duration-300 ease-in-out
    `}>
      {/* Header / Search */}
      <div className="p-4 bg-zinc-950 sticky top-0 z-10 space-y-3">
        <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
          Live TV Pro
        </h1>
        <div className="relative">
          <input 
            type="text" 
            placeholder="Buscar canal..." 
            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            onChange={(e) => onSearch(e.target.value)}
          />
          <svg className="w-4 h-4 absolute right-3 top-2.5 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        
        <select 
          value={selectedCategory}
          onChange={(e) => onSelectCategory(e.target.value)}
          className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs focus:outline-none text-zinc-300"
        >
          {categories.map(cat => (
            <option key={cat} value={cat}>
              {cat === 'all' ? '🎬 Todas las categorías' : `📂 ${cat}`}
            </option>
          ))}
        </select>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-2 pb-4 space-y-1">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-10 space-y-4">
            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-zinc-500 text-sm">Cargando canales...</p>
          </div>
        ) : channels.length === 0 ? (
          <div className="text-center py-10 text-zinc-500 text-sm">
            No se encontraron canales
          </div>
        ) : (
          channels.map(channel => (
            <button
              key={channel.id}
              onClick={() => onSelectChannel(channel)}
              className={`
                w-full flex items-center gap-3 p-2.5 rounded-xl transition-all group
                ${activeChannelId === channel.id 
                  ? 'bg-indigo-600 shadow-lg shadow-indigo-900/20 text-white' 
                  : 'hover:bg-zinc-900 text-zinc-400 hover:text-zinc-200'}
              `}
            >
              <div className="w-10 h-10 shrink-0 bg-zinc-800 rounded-lg overflow-hidden flex items-center justify-center border border-zinc-700 group-hover:border-zinc-500 transition-colors">
                {channel.logo ? (
                  <img 
                    src={channel.logo} 
                    alt="" 
                    className="w-full h-full object-contain p-1"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(channel.name)}&background=312e81&color=fff&size=128`;
                    }}
                  />
                ) : (
                  <span className="text-xs font-bold">{channel.name.substring(0, 2).toUpperCase()}</span>
                )}
              </div>
              <div className="flex-1 text-left min-w-0">
                <p className="text-sm font-medium truncate">{channel.name}</p>
                <p className={`text-[10px] uppercase tracking-wider ${activeChannelId === channel.id ? 'text-indigo-200' : 'text-zinc-500'}`}>
                  {channel.group}
                </p>
              </div>
            </button>
          ))
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
