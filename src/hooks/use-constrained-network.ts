/**
 * Hook to detect constrained networks (cellular, slow connections)
 * where direct Supabase WebSocket connections may be blocked/throttled.
 */
import { useState, useEffect } from 'react';

interface NavigatorConnection extends EventTarget {
  effectiveType?: string;
  rtt?: number;
  downlink?: number;
  type?: string;
  saveData?: boolean;
}

interface NavigatorWithConnection extends Navigator {
  connection?: NavigatorConnection;
  mozConnection?: NavigatorConnection;
  webkitConnection?: NavigatorConnection;
}

export function isConstrainedNetwork(): boolean {
  if (typeof navigator === 'undefined') return false;

  const nav = navigator as NavigatorWithConnection;
  const connection = nav.connection ?? nav.mozConnection ?? nav.webkitConnection;
  if (!connection) return false;

  const effectiveType = String(connection.effectiveType ?? '').toLowerCase();
  const rtt = Number(connection.rtt ?? 0);
  const downlink = Number(connection.downlink ?? 0);
  const type = String(connection.type ?? '').toLowerCase();

  return (
    Boolean(connection.saveData) ||
    effectiveType.includes('2g') ||
    effectiveType.includes('3g') ||
    type === 'cellular' ||
    (rtt > 0 && rtt >= 300) ||
    (downlink > 0 && downlink <= 3)
  );
}

export function useConstrainedNetwork(): boolean {
  const [constrained, setConstrained] = useState(() => isConstrainedNetwork());

  useEffect(() => {
    const nav = navigator as NavigatorWithConnection;
    const connection = nav.connection ?? nav.mozConnection ?? nav.webkitConnection;
    
    if (!connection) return;

    const handleChange = () => setConstrained(isConstrainedNetwork());
    
    connection.addEventListener('change', handleChange);
    return () => connection.removeEventListener('change', handleChange);
  }, []);

  return constrained;
}
