/**
 * Convert snake_case to camelCase
 */
export function snakeToCamel(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

/**
 * Convert camelCase to snake_case
 */
export function camelToSnake(str: string): string {
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
}

/**
 * Recursively convert object keys from snake_case to camelCase
 */
export function convertKeysToCamelCase<T = any>(obj: any): T {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (obj instanceof Date) {
    return obj as any;
  }

  if (Array.isArray(obj)) {
    return obj.map(convertKeysToCamelCase) as any;
  }

  if (typeof obj === 'object') {
    const converted: any = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const camelKey = snakeToCamel(key);
        converted[camelKey] = convertKeysToCamelCase(obj[key]);
      }
    }
    return converted;
  }

  return obj;
}

/**
 * Recursively convert object keys from camelCase to snake_case
 */
export function convertKeysToSnakeCase<T = any>(obj: any): T {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (obj instanceof Date) {
    return obj as any;
  }

  if (Array.isArray(obj)) {
    return obj.map(convertKeysToSnakeCase) as any;
  }

  if (typeof obj === 'object') {
    const converted: any = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const snakeKey = camelToSnake(key);
        converted[snakeKey] = convertKeysToSnakeCase(obj[key]);
      }
    }
    return converted;
  }

  return obj;
}