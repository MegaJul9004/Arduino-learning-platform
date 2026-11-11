import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useCircuitStore } from '@/store/circuitStore';
import { sfx } from '@/lib/sound';

export function Toast() {
  const message = useCircuitStore((s) => s.message);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (!message) return;
    setVisible(true);
    message.type === 'ok' ? sfx.connect() : sfx.error();
    const t = setTimeout(() => setVisible(false), 3200);
    return () => clearTimeout(t);
  }, [message]);
  return (
    <AnimatePresence>
      {visible && message && (
        <motion.div
          key={message.at}
          role="status"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className={`pointer-events-none absolute left-1/2 top-4 z-10 max-w-md -translate-x-1/2 rounded-lg px-4 py-2 text-sm shadow-lg ${message.type === 'ok' ? 'bg-emerald-600' : 'bg-red-600'}`}
        >
          {message.text}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
