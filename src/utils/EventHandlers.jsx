import { useEffect } from 'react';

/**
 * Hook to handle ESC key press
 * @param {Function} callback - Function to call when ESC is pressed
 */
export function useEscapeKey(callback) {
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === 'Escape') {
        callback();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [callback]);
}

/**
 * Hook to handle clicks outside a referenced element
 * @param {React.RefObject} ref - Ref object for the element to watch
 * @param {Function} callback - Function to call when clicked outside
 */
export function useClickAway(ref, callback) {
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        callback();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [ref, callback]);
}

/**
 * Combined hook for dropdown behavior (ESC + clickaway)
 * @param {React.RefObject} ref - Ref object for the dropdown container
 * @param {Function} onClose - Function to call when dropdown should close
 */
export function useDropdown(ref, onClose) {
  useEscapeKey(onClose);
  useClickAway(ref, onClose);
} 