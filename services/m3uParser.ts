
import { Channel } from '../types';

export const parseM3U = (text: string): Channel[] => {
  const lines = text.split('\n');
  const channels: Channel[] = [];
  let currentGroup = 'General';
  let currentName = '';
  let currentLogo = '';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.startsWith('#EXTINF:')) {
      const groupMatch = line.match(/group-title="([^"]+)"/i);
      const nameMatch = line.match(/,(.+)$/);
      const logoMatch = line.match(/tvg-logo="([^"]+)"/i);
      
      if (groupMatch) currentGroup = groupMatch[1];
      if (nameMatch) currentName = nameMatch[1].trim();
      if (logoMatch) currentLogo = logoMatch[1];
    } else if (line.startsWith('http')) {
      channels.push({
        id: channels.length,
        name: currentName || `Channel ${channels.length + 1}`,
        group: currentGroup || 'Other',
        url: line,
        logo: currentLogo,
      });
      // Reset for next entry
      currentName = '';
      currentLogo = '';
      currentGroup = 'General';
    }
  }

  return channels.sort((a, b) => a.group.localeCompare(b.group) || a.name.localeCompare(b.name));
};
