import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

// テスト後のクリーンアップ
afterEach(() => {
  cleanup();
});

// グローバルなモック
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// LocalStorageのモック
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

// Fetchのモックをセットアップのためのユーティリティをエクスポート
export const setupFetchMock = () => {
  global.fetch = vi.fn();
  return global.fetch as ReturnType<typeof vi.fn>;
};