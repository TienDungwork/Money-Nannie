import { Category } from '@/types';
import { 
  CATEGORY_ICONS, 
  WALLET_ICONS, 
  VIETNAMESE_CATEGORY_ICONS, 
  VIETNAMESE_DAYS, 
  VIETNAMESE_MONTHS 
} from './constants';

/**
 * Get icon for category - centralized logic
 */
export function getCategoryIcon(iconOrCategory: string, categories?: Category[]): string {
  // First try to find by category ID
  if (categories) {
    const categoryById = categories.find(cat => cat.id === iconOrCategory);
    if (categoryById) {
      return categoryById.icon;
    }
  }

  // If the icon is already an emoji (contains non-ASCII characters), return it directly
  if (iconOrCategory && iconOrCategory.length <= 4 && /[^\x00-\x7F]/.test(iconOrCategory)) {
    return iconOrCategory;
  }

  // Try icon key from constants
  if (iconOrCategory in CATEGORY_ICONS) {
    return CATEGORY_ICONS[iconOrCategory as keyof typeof CATEGORY_ICONS];
  }

  // Try Vietnamese category name (for backward compatibility)
  if (iconOrCategory in VIETNAMESE_CATEGORY_ICONS) {
    return VIETNAMESE_CATEGORY_ICONS[iconOrCategory as keyof typeof VIETNAMESE_CATEGORY_ICONS];
  }

  // Fallback
  return iconOrCategory || '📦';
}

/**
 * Get wallet icon - centralized logic
 */
export function getWalletIcon(icon: string): string {
  if (icon in WALLET_ICONS) {
    return WALLET_ICONS[icon as keyof typeof WALLET_ICONS];
  }
  return icon || '👛';
}

/**
 * Format currency with consistent Vietnamese format
 */
export function formatCurrency(amount: number): string {
  const formatted = new Intl.NumberFormat('vi-VN').format(amount);
  return `${formatted} ₫`;
}

/**
 * Format date with Vietnamese locale
 */
export function formatDate(date: string): string {
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(date));
}

/**
 * Format detailed date with Vietnamese day and month names
 */
export function formatDetailedDate(date: string): string {
  const dateObj = new Date(date);
  return new Intl.DateTimeFormat('vi-VN', {
    weekday: 'long',
    day: '2-digit',
    month: 'long', 
    year: 'numeric',
  }).format(dateObj);
}

/**
 * Format date with custom Vietnamese format (used in TransactionModal)
 */
export function formatVietnameseDate(dateString: string): string {
  const date = new Date(dateString);
  const dayName = VIETNAMESE_DAYS[date.getDay()];
  const monthName = VIETNAMESE_MONTHS[date.getMonth()];
  const day = date.getDate().toString().padStart(2, '0');
  const year = date.getFullYear();
  
  return `${dayName}, ${day} ${monthName} ${year}`;
}

/**
 * Format relative date
 */
export function formatRelativeDate(date: string): string {
  const now = new Date();
  const transactionDate = new Date(date);
  const diffInDays = Math.floor((now.getTime() - transactionDate.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffInDays === 0) return 'Hôm nay';
  if (diffInDays === 1) return 'Hôm qua';
  if (diffInDays < 7) return `${diffInDays} ngày trước`;
  
  return formatDate(date);
}

/**
 * Validate form field
 */
export function validateRequired(value: string | number, fieldName: string): string | null {
  if (!value || (typeof value === 'string' && !value.trim())) {
    return `${fieldName} là bắt buộc`;
  }
  return null;
}

/**
 * Validate amount
 */
export function validateAmount(amount: string | number): string | null {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(numAmount) || numAmount <= 0) {
    return 'Số tiền phải lớn hơn 0';
  }
  
  if (numAmount > 999999999) {
    return 'Số tiền quá lớn';
  }
  
  return null;
}

/**
 * Generate unique ID
 */
export function generateId(prefix: string = ''): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 9);
  return prefix ? `${prefix}-${timestamp}-${random}` : `${timestamp}-${random}`;
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

/**
 * Format number input (remove non-numeric characters)
 */
export function formatNumberInput(value: string): string {
  return value.replace(/[^0-9]/g, '');
}

/**
 * Check if value is empty
 */
export function isEmpty(value: any): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim() === '';
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
}
