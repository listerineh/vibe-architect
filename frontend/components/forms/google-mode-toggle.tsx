'use client';

import { Cloud } from 'lucide-react';
import * as Switch from '@radix-ui/react-switch';

interface GoogleModeToggleProps {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  disabled?: boolean;
}

export function GoogleModeToggle({ enabled, onToggle, disabled }: GoogleModeToggleProps) {
  return (
    <div className="flex items-center justify-between p-4 bg-zinc-900 rounded-lg border border-zinc-800">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-zinc-800 rounded-md">
          <Cloud className={`w-5 h-5 ${enabled ? 'text-blue-400' : 'text-zinc-500'}`} />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-zinc-100">Google Mode</h3>
          <p className="text-xs text-zinc-400">
            {enabled ? 'Optimized for Google Cloud Platform' : 'Cloud-agnostic stack'}
          </p>
        </div>
      </div>
      <Switch.Root
        checked={enabled}
        onCheckedChange={onToggle}
        disabled={disabled}
        className="w-11 h-6 bg-zinc-700 rounded-full relative data-[state=checked]:bg-blue-600 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Switch.Thumb className="block w-5 h-5 bg-white rounded-full transition-transform duration-100 translate-x-0.5 will-change-transform data-[state=checked]:translate-x-5.5 pointer-events-none" />
      </Switch.Root>
    </div>
  );
}
