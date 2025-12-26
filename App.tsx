
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Channel, PlayerState } from './types';
import { PLAYLIST_URL } from './constants';
import { parseM3U } from './services/m3uParser';
import Sidebar from './components/Sidebar';
import Player from './components/Player';
import Diagnostics from './components/Diagnostics';

const App: React.FC = () => {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [playerState, setPlayerState] = useState<PlayerState>(PlayerState.IDLE);
  const [showDiagnostics, setShowDiagnostics] = useState(false);

  useEffect(() => {
    const fetchPlaylist = async () => {
      try {
        const response = await fetch(PLAYLIST_URL);
        const text = await response.text();
        const parsed = parseM3U(text);
        setChannels(parsed);
      } catch (error) {
        console.error("Failed to load playlist", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPlaylist();
  }, []);

  const categories = useMemo(() => {
    const cats = new Set(channels.map(c => c.group));
    return ['all', ...Array.from(cats).sort()];
  }, [channels]);

  const filteredChannels = useMemo(() => {
    return channels.filter(c => {
      const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || c.group === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [channels, searchTerm, selectedCategory]);

  const handleChannelSelect = useCallback((channel: Channel) => {
    setSelectedChannel(channel);
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  }, []);

  const goToNextChannel = useCallback(() => {
    if (!selectedChannel) return;
    const currentIndex = filteredChannels.findIndex(c => c.id === selectedChannel.id);
    const nextIndex = (currentIndex + 1) % filteredChannels.length;
    handleChannelSelect(filteredChannels[nextIndex]);
  }, [filteredChannels, selectedChannel, handleChannelSelect]);

  const goToPrevChannel = useCallback(() => {
    if (!selectedChannel) return;
    const currentIndex = filteredChannels.findIndex(c => c.id === selectedChannel.id);
    const prevIndex = (currentIndex - 1 + filteredChannels.length) % filteredChannels.length;
    handleChannelSelect(filteredChannels[prevIndex]);
  }, [filteredChannels, selectedChannel, handleChannelSelect]);

  return (
    <div className="flex h-screen w-full bg-black text-white overflow-hidden relative">
      {/* Sidebar */}
      <Sidebar 
        channels={filteredChannels}
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        onSearch={setSearchTerm}
        onSelectChannel={handleChannelSelect}
        activeChannelId={selectedChannel?.id}
        isOpen={sidebarOpen}
        loading={loading}
      />

      {/* Main Player Area */}
      <main className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? 'md:ml-0' : 'ml-0'}`}>
        {/* Top bar for mobile and toggle */}
        <div className="h-14 flex items-center px-4 bg-zinc-900 border-b border-zinc-800 shrink-0">
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
            title="Toggle Sidebar"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          
          <div className="ml-4 font-semibold text-zinc-300 truncate">
            {selectedChannel ? `${selectedChannel.name} • ${selectedChannel.group}` : 'Live TV Pro'}
          </div>

          <div className="ml-auto flex items-center gap-2">
            <button 
              onClick={() => setShowDiagnostics(!showDiagnostics)}
              className={`p-2 rounded-lg transition-colors ${showDiagnostics ? 'bg-indigo-600 text-white' : 'text-zinc-400 hover:bg-zinc-800'}`}
              title="Toggle Diagnostics"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex-1 relative bg-black overflow-hidden flex items-center justify-center">
          <Player 
            channel={selectedChannel} 
            onStateChange={setPlayerState}
            onNext={goToNextChannel}
            onPrev={goToPrevChannel}
          />
          
          {showDiagnostics && (
            <div className="absolute top-4 right-4 z-50">
              <Diagnostics playerState={playerState} />
            </div>
          )}
        </div>
      </main>

      {/* Why freezing explanation - Help Modal Overlay */}
      <div className="fixed bottom-4 left-4 z-[100] group">
        <div className="bg-zinc-900 border border-zinc-700 p-2 rounded-full cursor-help shadow-lg hover:bg-indigo-900 transition-colors">
          <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div className="absolute bottom-full left-0 mb-2 w-64 p-4 bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
          <h4 className="font-bold text-indigo-400 mb-2">¿Por qué se congela?</h4>
          <ul className="text-xs text-zinc-300 space-y-2 list-disc pl-4">
            <li><strong>Conexión:</strong> Tu internet puede tener micro-cortes o baja velocidad para HD.</li>
            <li><strong>Servidor:</strong> El origen del canal (m3u8) puede estar saturado.</li>
            <li><strong>Buffer:</strong> El reproductor necesita llenar datos antes de mostrar. Hemos optimizado esto al máximo.</li>
            <li><strong>Latencia:</strong> Los streams en vivo tienen un retraso natural para evitar cortes.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default App;
