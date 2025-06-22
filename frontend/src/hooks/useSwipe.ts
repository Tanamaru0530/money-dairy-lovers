import { useRef, useEffect, TouchEvent, useState } from 'react';

interface SwipeHandlers {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onSwiping?: (deltaX: number, deltaY: number) => void;
  onSwipeEnd?: () => void;
}

interface SwipeConfig {
  threshold?: number;
  preventDefaultTouchmoveEvent?: boolean;
  trackMouse?: boolean;
  trackTouch?: boolean;
}

interface SwipeState {
  isSwiping: boolean;
  deltaX: number;
  deltaY: number;
  absX: number;
  absY: number;
  velocity: number;
}

const defaultConfig: SwipeConfig = {
  threshold: 50,
  preventDefaultTouchmoveEvent: false,
  trackMouse: false,
  trackTouch: true,
};

export const useSwipe = (
  handlers: SwipeHandlers,
  config: SwipeConfig = {}
) => {
  const { threshold, preventDefaultTouchmoveEvent, trackTouch } = {
    ...defaultConfig,
    ...config,
  };

  const [swipeState, setSwipeState] = useState<SwipeState>({
    isSwiping: false,
    deltaX: 0,
    deltaY: 0,
    absX: 0,
    absY: 0,
    velocity: 0,
  });

  const touchStart = useRef<{ x: number; y: number; time: number } | null>(null);
  const elementRef = useRef<HTMLElement | null>(null);

  const handleTouchStart = (e: TouchEvent) => {
    if (!trackTouch) return;
    
    const touch = e.touches[0];
    touchStart.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now(),
    };
    
    setSwipeState({
      isSwiping: true,
      deltaX: 0,
      deltaY: 0,
      absX: 0,
      absY: 0,
      velocity: 0,
    });
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!trackTouch || !touchStart.current) return;
    
    if (preventDefaultTouchmoveEvent) {
      e.preventDefault();
    }

    const touch = e.touches[0];
    const deltaX = touch.clientX - touchStart.current.x;
    const deltaY = touch.clientY - touchStart.current.y;
    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);
    const time = Date.now() - touchStart.current.time;
    const velocity = Math.sqrt(absX * absX + absY * absY) / time;

    setSwipeState({
      isSwiping: true,
      deltaX,
      deltaY,
      absX,
      absY,
      velocity,
    });

    if (handlers.onSwiping) {
      handlers.onSwiping(deltaX, deltaY);
    }
  };

  const handleTouchEnd = () => {
    if (!trackTouch || !touchStart.current) return;

    const { deltaX, deltaY, absX, absY } = swipeState;

    if (absX > threshold || absY > threshold) {
      if (absX > absY) {
        // Horizontal swipe
        if (deltaX > 0 && handlers.onSwipeRight) {
          handlers.onSwipeRight();
        } else if (deltaX < 0 && handlers.onSwipeLeft) {
          handlers.onSwipeLeft();
        }
      } else {
        // Vertical swipe
        if (deltaY > 0 && handlers.onSwipeDown) {
          handlers.onSwipeDown();
        } else if (deltaY < 0 && handlers.onSwipeUp) {
          handlers.onSwipeUp();
        }
      }
    }

    if (handlers.onSwipeEnd) {
      handlers.onSwipeEnd();
    }

    touchStart.current = null;
    setSwipeState({
      isSwiping: false,
      deltaX: 0,
      deltaY: 0,
      absX: 0,
      absY: 0,
      velocity: 0,
    });
  };

  const attachListeners = (element: HTMLElement) => {
    if (!element) return;
    
    element.addEventListener('touchstart', handleTouchStart as any, { passive: true });
    element.addEventListener('touchmove', handleTouchMove as any, { passive: !preventDefaultTouchmoveEvent });
    element.addEventListener('touchend', handleTouchEnd, { passive: true });
    element.addEventListener('touchcancel', handleTouchEnd, { passive: true });
  };

  const detachListeners = (element: HTMLElement) => {
    if (!element) return;
    
    element.removeEventListener('touchstart', handleTouchStart as any);
    element.removeEventListener('touchmove', handleTouchMove as any);
    element.removeEventListener('touchend', handleTouchEnd);
    element.removeEventListener('touchcancel', handleTouchEnd);
  };

  const ref = (element: HTMLElement | null) => {
    if (elementRef.current && elementRef.current !== element) {
      detachListeners(elementRef.current);
    }
    
    if (element) {
      attachListeners(element);
    }
    
    elementRef.current = element;
  };

  useEffect(() => {
    return () => {
      if (elementRef.current) {
        detachListeners(elementRef.current);
      }
    };
  }, []);

  return {
    ref,
    swipeState,
  };
};