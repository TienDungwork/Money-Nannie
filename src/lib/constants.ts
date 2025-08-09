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
  'Beer': '🍺',
  'Apple': '🍎',
  'Bread': '🍞',
  'Rice': '🍚',
  'Noodles': '🍜',

  // Di chuyển
  'Car': '🚗',
  'Fuel': '⛽',
  'Bus': '🚌',
  'Train': '🚊',
  'Plane': '✈️',
  'Bike': '🚲',
  'Motorcycle': '🏍️',
  'Taxi': '�',
  'ParkingCircle': '🅿️',
  'Wrench': '�',

  // Nhà cửa & Tiện ích
  'Home': '🏠',
  'Zap': '⚡',
  'Droplets': '💧',
  'Wifi': '📶',
  'Tv': '📺',
  'Flame': '🔥',
  'Bed': '🛏️',
  'Sofa': '🛋️',
  'Bath': '🛁',
  'Kitchen': '🍳',

  // Mua sắm
  'ShoppingBag': '🛍️',
  'ShoppingCart': '�',
  'Gift': '🎁',
  'Shirt': '�👕',
  'Shoes': '👟',
  'Watch': '⌚',
  'Bag': '🎒',
  'Glasses': '👓',
  'Sparkles': '✨',
  'Perfume': '🧴',

  // Giải trí
  'GameController': '🎮',
  'Music': '🎵',
  'Movie': '🎬',
  'Camera': '📷',
  'Book': '📖',
  'Sport': '⚽',
  'Gym': '🏋️',
  'Swimming': '🏊',
  'Travel': '🧳',
  'Beach': '🏖️',

  // Sức khỏe
  'Hospital': '�',
  'Medicine': '💊',
  'Doctor': '👨‍⚕️',
  'Stethoscope': '🩺',
  'Syringe': '💉',
  'Dental': '🦷',
  'Glasses2': '👓',
  'Heart': '❤️',

  // Giáo dục
  'School': '🏫',
  'BookOpen': '📚',
  'Pencil': '✏️',
  'Calculator': '🔢',
  'Computer': '💻',
  'Graduation': '🎓',
  'Certificate': '📜',

  // Công việc
  'Briefcase': '💼',
  'Office': '🏢',
  'Phone': '📱',
  'Email': '�',
  'Calendar': '📅',
  'Meeting': '👥',
  'Presentation': '📊',

  // Khác
  'User': '👤',
  'Family': '👨‍👩‍👧‍👦',
  'Pet': '🐕',
  'Insurance': '🛡️',
  'Tax': '🧾',
  'Charity': '🤝',
  'Tools': '�',
  'Settings': '⚙️',
  'Star': '⭐',
  'Question': '❓',
  'Building': '🏢',
  'Factory': '🏭',
  'Hammer': '🔨',
  'Scissors': '✂️',

  // Legacy mappings
  'Shield': '🛡️',
  'Other': '📦',
  'Gamepad': '🎮',
  'Shoe': '👟'
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
  { key: 'HandCoins', icon: '🤲', name: 'Trao tiền', category: 'money' },

  // Nhà cửa
  { key: 'Home', icon: '🏠', name: 'Nhà', category: 'home' },
  { key: 'Zap', icon: '⚡', name: 'Điện', category: 'home' },
  { key: 'Droplets', icon: '💧', name: 'Nước', category: 'home' },
  { key: 'Phone', icon: '📱', name: 'Điện thoại', category: 'home' },
  { key: 'Wifi', icon: '📶', name: 'Internet', category: 'home' },
  { key: 'Tv', icon: '📺', name: 'TV', category: 'home' },
  { key: 'Flame', icon: '🔥', name: 'Gas', category: 'home' },
  { key: 'Bed', icon: '🛏️', name: 'Giường', category: 'home' },
  { key: 'Sofa', icon: '🛋️', name: 'Sofa', category: 'home' },
  { key: 'Bath', icon: '🛁', name: 'Tắm', category: 'home' },
  { key: 'Kitchen', icon: '🍳', name: 'Bếp', category: 'home' },

  // Di chuyển
  { key: 'Car', icon: '🚗', name: 'Xe hơi', category: 'transport' },
  { key: 'Fuel', icon: '⛽', name: 'Xăng', category: 'transport' },
  { key: 'Bus', icon: '🚌', name: 'Xe buýt', category: 'transport' },
  { key: 'Train', icon: '🚊', name: 'Tàu', category: 'transport' },
  { key: 'Plane', icon: '✈️', name: 'Máy bay', category: 'transport' },
  { key: 'Bike', icon: '🚲', name: 'Xe đạp', category: 'transport' },
  { key: 'Motorcycle', icon: '🏍️', name: 'Xe máy', category: 'transport' },
  { key: 'Taxi', icon: '🚕', name: 'Taxi', category: 'transport' },
  { key: 'ParkingCircle', icon: '🅿️', name: 'Đỗ xe', category: 'transport' },
  { key: 'Wrench', icon: '🔧', name: 'Sửa chữa', category: 'transport' },

  // Ăn uống
  { key: 'UtensilsCrossed', icon: '🍽️', name: 'Ăn uống', category: 'food' },
  { key: 'Coffee', icon: '☕', name: 'Cà phê', category: 'food' },
  { key: 'Pizza', icon: '🍕', name: 'Pizza', category: 'food' },
  { key: 'ChefHat', icon: '👨‍🍳', name: 'Đầu bếp', category: 'food' },
  { key: 'Cake', icon: '🎂', name: 'Bánh', category: 'food' },
  { key: 'Beer', icon: '🍺', name: 'Bia', category: 'food' },
  { key: 'Apple', icon: '🍎', name: 'Táo', category: 'food' },
  { key: 'Bread', icon: '🍞', name: 'Bánh mì', category: 'food' },
  { key: 'Rice', icon: '🍚', name: 'Cơm', category: 'food' },
  { key: 'Noodles', icon: '🍜', name: 'Mì', category: 'food' },

  // Mua sắm
  { key: 'ShoppingBag', icon: '🛍️', name: 'Mua sắm', category: 'shopping' },
  { key: 'ShoppingCart', icon: '🛒', name: 'Giỏ hàng', category: 'shopping' },
  { key: 'Gift', icon: '🎁', name: 'Quà tặng', category: 'shopping' },
  { key: 'Shirt', icon: '👕', name: 'Áo', category: 'shopping' },
  { key: 'Shoes', icon: '�', name: 'Giày', category: 'shopping' },
  { key: 'Watch', icon: '⌚', name: 'Đồng hồ', category: 'shopping' },
  { key: 'Bag', icon: '🎒', name: 'Túi', category: 'shopping' },
  { key: 'Glasses', icon: '👓', name: 'Kính', category: 'shopping' },
  { key: 'Sparkles', icon: '✨', name: 'Làm đẹp', category: 'shopping' },
  { key: 'Perfume', icon: '🧴', name: 'Nước hoa', category: 'shopping' },

  // Giải trí
  { key: 'GameController', icon: '🎮', name: 'Game', category: 'entertainment' },
  { key: 'Music', icon: '🎵', name: 'Âm nhạc', category: 'entertainment' },
  { key: 'Movie', icon: '🎬', name: 'Phim', category: 'entertainment' },
  { key: 'Camera', icon: '📷', name: 'Máy ảnh', category: 'entertainment' },
  { key: 'Book', icon: '📖', name: 'Sách', category: 'entertainment' },
  { key: 'Sport', icon: '⚽', name: 'Thể thao', category: 'entertainment' },
  { key: 'Gym', icon: '🏋️', name: 'Gym', category: 'entertainment' },
  { key: 'Swimming', icon: '🏊', name: 'Bơi lội', category: 'entertainment' },
  { key: 'Travel', icon: '🧳', name: 'Du lịch', category: 'entertainment' },
  { key: 'Beach', icon: '🏖️', name: 'Biển', category: 'entertainment' },

  // Sức khỏe
  { key: 'Hospital', icon: '🏥', name: 'Bệnh viện', category: 'health' },
  { key: 'Medicine', icon: '💊', name: 'Thuốc', category: 'health' },
  { key: 'Doctor', icon: '👨‍⚕️', name: 'Bác sĩ', category: 'health' },
  { key: 'Stethoscope', icon: '🩺', name: 'Ống nghe', category: 'health' },
  { key: 'Syringe', icon: '💉', name: 'Tiêm', category: 'health' },
  { key: 'Dental', icon: '🦷', name: 'Răng', category: 'health' },
  { key: 'Heart', icon: '❤️', name: 'Tim', category: 'health' },

  // Giáo dục
  { key: 'School', icon: '🏫', name: 'Trường học', category: 'education' },
  { key: 'BookOpen', icon: '📚', name: 'Học tập', category: 'education' },
  { key: 'Pencil', icon: '✏️', name: 'Bút chì', category: 'education' },
  { key: 'Calculator', icon: '🔢', name: 'Máy tính', category: 'education' },
  { key: 'Computer', icon: '💻', name: 'Máy tính', category: 'education' },
  { key: 'Graduation', icon: '🎓', name: 'Tốt nghiệp', category: 'education' },
  { key: 'Certificate', icon: '📜', name: 'Chứng chỉ', category: 'education' },

  // Công việc
  { key: 'Briefcase', icon: '💼', name: 'Công việc', category: 'work' },
  { key: 'Office', icon: '🏢', name: 'Văn phòng', category: 'work' },
  { key: 'Email', icon: '📧', name: 'Email', category: 'work' },
  { key: 'Calendar', icon: '📅', name: 'Lịch', category: 'work' },
  { key: 'Meeting', icon: '👥', name: 'Họp', category: 'work' },
  { key: 'Presentation', icon: '📊', name: 'Thuyết trình', category: 'work' },

  // Khác
  { key: 'User', icon: '👤', name: 'Cá nhân', category: 'other' },
  { key: 'Family', icon: '👨‍👩‍👧‍👦', name: 'Gia đình', category: 'other' },
  { key: 'Pet', icon: '�', name: 'Thú cưng', category: 'other' },
  { key: 'Insurance', icon: '🛡️', name: 'Bảo hiểm', category: 'other' },
  { key: 'Tax', icon: '🧾', name: 'Thuế', category: 'other' },
  { key: 'Charity', icon: '🤝', name: 'Từ thiện', category: 'other' },
  { key: 'Tools', icon: '🔨', name: 'Công cụ', category: 'other' },
  { key: 'Settings', icon: '⚙️', name: 'Cài đặt', category: 'other' },
  { key: 'Star', icon: '⭐', name: 'Đặc biệt', category: 'other' },
  { key: 'Question', icon: '❓', name: 'Khác', category: 'other' }
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
