// Icon mappings - centralized source of truth
export const CATEGORY_ICONS = {
  // Tiền tệ
  'DollarSign': '💲',
  'Banknote': '💵', 
  'CreditCard': '💳',
  'Wallet': '👛',
  'PiggyBank': '🐷',
  'TrendingUp': '📈',
  'HandCoins': '🤲',
  'Receipt': '🧾',

  // Ăn uống
  'UtensilsCrossed': '🍽️',
  'Coffee': '☕',
  'Pizza': '🍕',
  'ChefHat': '👨‍🍳',
  'Cake': '🎂',
  'Apple': '🍎',

  // Di chuyển
  'Car': '🚗',
  'Fuel': '⛽',
  'Plane': '✈️',
  'Train': '🚆',
  'Bus': '🚌',

  // Nhà cửa & Tiện ích
  'Home': '🏠',
  'Zap': '⚡',
  'Droplets': '💧',
  'Phone': '📱',
  'Wifi': '📶',
  'Tv': '📺',
  'Flame': '🔥',

  // Mua sắm
  'ShoppingBag': '🛍️',
  'Shirt': '👕',
  'Shoe': '👟',
  'Watch': '⌚',
  'Gift': '🎁',

  // Giải trí
  'Music': '🎵',
  'Camera': '📷',
  'Gamepad': '🎮',
  'Sparkles': '✨',

  // Y tế & Giáo dục
  'Hospital': '🏥',
  'Graduation': '🎓',
  'Book': '📚',
  'Heart': '❤️',

  // Khác
  'User': '👤',
  'Shield': '🛡️',
  'Star': '⭐',
  'Other': '📦'
} as const;

export const WALLET_ICONS = {
  'Wallet': '👛',
  'CreditCard': '💳',
  'DollarSign': '💲',
  'Banknote': '💵',
  'PiggyBank': '🐷'
} as const;

// Vietnamese category name to icon mapping (for backward compatibility)
export const VIETNAMESE_CATEGORY_ICONS = {
  'Ăn uống': '🍽️',
  'Di chuyển': '🚗',
  'Mua sắm': '🛍️',
  'Giải trí': '🎬',
  'Y tế': '🏥',
  'Học tập': '📚',
  'Sinh hoạt': '🏠',
  'Hoá đơn & Tiện ích': '📄',
  'Thuê nhà': '🏘️',
  'Hoá đơn nước': '💧',
  'Hoá đơn điện thoại': '📱',
  'Hoá đơn điện': '⚡',
  'Hoá đơn gas': '🔥',
  'Hoá đơn TV': '📺',
  'Hoá đơn internet': '🌐',
  'Hoá đơn tiện ích khác': '🔧',
  'Lương': '💰',
  'Freelance': '💻',
  'Đầu tư': '📈',
  'Khác': '📦',
  // English fallback
  'food': '🍽️',
  'transport': '🚗',
  'shopping': '🛍️',
  'entertainment': '🎬',
  'health': '🏥',
  'education': '📚',
  'bills': '💡',
  'investment': '📈',
  'salary': '💰',
  'freelance': '💼',
  'business': '🏢',
  'gift': '🎁',
  'other': '📦'
} as const;

// Color schemes
export const CATEGORY_COLORS = {
  expense: '#ef4444',
  income: '#22c55e', 
  loan: '#8b5cf6'
} as const;

export const WALLET_COLORS = [
  '#3b82f6', // blue
  '#10b981', // emerald
  '#f59e0b', // amber
  '#ef4444', // red
  '#8b5cf6', // violet
  '#06b6d4', // cyan
  '#84cc16', // lime
  '#f97316'  // orange
] as const;

// Available icons for selection
export interface IconItem {
  key: string;
  icon: string;
  name: string;
  category?: string;
}

export const AVAILABLE_ICONS: IconItem[] = [
  // Tiền tệ
  { key: 'DollarSign', icon: '💲', name: 'Tiền', category: 'money' },
  { key: 'Receipt', icon: '🧾', name: 'Hóa đơn', category: 'money' },
  { key: 'Banknote', icon: '💵', name: 'Tiền mặt', category: 'money' },
  { key: 'CreditCard', icon: '💳', name: 'Thẻ tín dụng', category: 'money' },
  { key: 'Wallet', icon: '👛', name: 'Ví', category: 'money' },
  { key: 'PiggyBank', icon: '🐷', name: 'Tiết kiệm', category: 'money' },
  { key: 'TrendingUp', icon: '📈', name: 'Đầu tư', category: 'money' },

  // Nhà cửa
  { key: 'Home', icon: '🏠', name: 'Nhà', category: 'home' },
  { key: 'Zap', icon: '⚡', name: 'Điện', category: 'home' },
  { key: 'Droplets', icon: '💧', name: 'Nước', category: 'home' },
  { key: 'Phone', icon: '📱', name: 'Điện thoại', category: 'home' },
  { key: 'Wifi', icon: '📶', name: 'Internet', category: 'home' },
  { key: 'Tv', icon: '📺', name: 'TV', category: 'home' },

  // Di chuyển
  { key: 'Car', icon: '🚗', name: 'Xe', category: 'transport' },
  { key: 'Fuel', icon: '⛽', name: 'Xăng', category: 'transport' },
  { key: 'Plane', icon: '✈️', name: 'Du lịch', category: 'transport' },

  // Ăn uống
  { key: 'UtensilsCrossed', icon: '🍽️', name: 'Ăn uống', category: 'food' },
  { key: 'Coffee', icon: '☕', name: 'Cà phê', category: 'food' },

  // Mua sắm
  { key: 'ShoppingBag', icon: '🛍️', name: 'Mua sắm', category: 'shopping' },
  { key: 'Gift', icon: '🎁', name: 'Quà tặng', category: 'shopping' },

  // Cá nhân
  { key: 'User', icon: '👤', name: 'Cá nhân', category: 'personal' },
  { key: 'Sparkles', icon: '✨', name: 'Làm đẹp', category: 'personal' },

  // Khác
  { key: 'Star', icon: '⭐', name: 'Đặc biệt', category: 'other' },
  { key: 'Heart', icon: '❤️', name: 'Yêu thích', category: 'other' },
  { key: 'Other', icon: '📦', name: 'Khác', category: 'other' }
];

// Vietnamese days and months for date formatting
export const VIETNAMESE_DAYS = [
  'Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 
  'Thứ năm', 'Thứ sáu', 'Thứ bảy'
] as const;

export const VIETNAMESE_MONTHS = [
  'tháng 1', 'tháng 2', 'tháng 3', 'tháng 4',
  'tháng 5', 'tháng 6', 'tháng 7', 'tháng 8', 
  'tháng 9', 'tháng 10', 'tháng 11', 'tháng 12'
] as const;
