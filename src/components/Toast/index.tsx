// src/components/Toast/index.tsx
import { useEffect } from 'react';

interface ToastProps {
  type: 'success' | 'error';
  message: string;
  onClose: () => void;
  duration?: number;
}

const Toast = ({ type, message, onClose, duration = 3000 }: ToastProps) => {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div className={`
      fixed bottom-4 right-4 p-4 rounded-lg shadow-lg
      ${type === 'success' ? 'bg-green-500' : 'bg-red-500'}
      text-white
    `}>
      {message}
    </div>
  );
};

export default Toast;

