import { Category } from '@/types';

export const sampleCategories: Category[] = [
  // Khoản chi - Hóa đơn và tiện ích
  { id: 'expense-bills', name: 'Hóa đơn & Tiện ích', type: 'expense', color: '#ef4444', icon: '🧾', isParent: true },
  { id: 'expense-bills-rent', name: 'Thuê nhà', type: 'expense', color: '#ef4444', icon: '🏠', parentId: 'expense-bills' },
  { id: 'expense-bills-electric', name: 'Hóa đơn điện', type: 'expense', color: '#ef4444', icon: '⚡', parentId: 'expense-bills' },
  { id: 'expense-bills-water', name: 'Hóa đơn nước', type: 'expense', color: '#ef4444', icon: '💧', parentId: 'expense-bills' },
  { id: 'expense-bills-internet', name: 'Internet', type: 'expense', color: '#ef4444', icon: '📶', parentId: 'expense-bills' },
  { id: 'expense-bills-phone', name: 'Hóa đơn điện thoại', type: 'expense', color: '#ef4444', icon: '📱', parentId: 'expense-bills' },
  { id: 'expense-bills-gas', name: 'Hóa đơn gas', type: 'expense', color: '#ef4444', icon: '🔥', parentId: 'expense-bills' },
  { id: 'expense-bills-tv', name: 'Hóa đơn TV', type: 'expense', color: '#ef4444', icon: '📺', parentId: 'expense-bills' },

  // Khoản chi - Mua sắm
  { id: 'expense-shopping', name: 'Mua sắm', type: 'expense', color: '#f97316', icon: '🛍️', isParent: true },
  { id: 'expense-shopping-personal', name: 'Đồ dùng cá nhân', type: 'expense', color: '#f97316', icon: '👤', parentId: 'expense-shopping' },
  { id: 'expense-shopping-household', name: 'Đồ gia dụng', type: 'expense', color: '#f97316', icon: '🪑', parentId: 'expense-shopping' },
  { id: 'expense-shopping-beauty', name: 'Làm đẹp', type: 'expense', color: '#f97316', icon: '✨', parentId: 'expense-shopping' },

  // Khoản chi - Di chuyển
  { id: 'expense-transport', name: 'Di chuyển', type: 'expense', color: '#3b82f6', icon: '🚗', isParent: true },
  { id: 'expense-transport-fuel', name: 'Xăng xe', type: 'expense', color: '#3b82f6', icon: '⛽', parentId: 'expense-transport' },
  { id: 'expense-transport-maintenance', name: 'Bảo dưỡng xe', type: 'expense', color: '#3b82f6', icon: '🔧', parentId: 'expense-transport' },
  { id: 'expense-transport-parking', name: 'Phí đậu xe', type: 'expense', color: '#3b82f6', icon: '🅿️', parentId: 'expense-transport' },

  // Khoản chi - Ăn uống
  { id: 'expense-food', name: 'Ăn uống', type: 'expense', color: '#10b981', icon: '🍽️', isParent: true },
  { id: 'expense-food-restaurant', name: 'Nhà hàng', type: 'expense', color: '#10b981', icon: '👨‍🍳', parentId: 'expense-food' },
  { id: 'expense-food-fastfood', name: 'Thức ăn nhanh', type: 'expense', color: '#10b981', icon: '🍕', parentId: 'expense-food' },
  { id: 'expense-food-coffee', name: 'Cà phê & Đồ uống', type: 'expense', color: '#10b981', icon: '☕', parentId: 'expense-food' },

  // Khoản chi - Bảo hiểm
  { id: 'expense-insurance', name: 'Bảo hiểm', type: 'expense', color: '#8b5cf6', icon: '🛡️', isParent: true },
  { id: 'expense-insurance-health', name: 'Bảo hiểm y tế', type: 'expense', color: '#8b5cf6', icon: '⚕️', parentId: 'expense-insurance' },
  { id: 'expense-insurance-life', name: 'Bảo hiểm nhân thọ', type: 'expense', color: '#8b5cf6', icon: '👨‍👩‍👧‍👦', parentId: 'expense-insurance' },
  { id: 'expense-insurance-car', name: 'Bảo hiểm xe', type: 'expense', color: '#8b5cf6', icon: '🚗', parentId: 'expense-insurance' },
  { id: 'expense-insurance-house', name: 'Bảo hiểm nhà', type: 'expense', color: '#8b5cf6', icon: '🏠', parentId: 'expense-insurance' },

  // Khoản chi - Giáo dục
  { id: 'expense-education', name: 'Giáo dục', type: 'expense', color: '#f59e0b', icon: '🎓', isParent: true },
  { id: 'expense-education-tuition', name: 'Học phí', type: 'expense', color: '#f59e0b', icon: '🏫', parentId: 'expense-education' },
  { id: 'expense-education-books', name: 'Sách vở', type: 'expense', color: '#f59e0b', icon: '📚', parentId: 'expense-education' },
  { id: 'expense-education-course', name: 'Khóa học', type: 'expense', color: '#f59e0b', icon: '💻', parentId: 'expense-education' },

  // Khoản chi - Y tế
  { id: 'expense-healthcare', name: 'Y tế', type: 'expense', color: '#ef4444', icon: '🏥', isParent: true },
  { id: 'expense-healthcare-doctor', name: 'Khám bác sĩ', type: 'expense', color: '#ef4444', icon: '👨‍⚕️', parentId: 'expense-healthcare' },
  { id: 'expense-healthcare-medicine', name: 'Thuốc men', type: 'expense', color: '#ef4444', icon: '💊', parentId: 'expense-healthcare' },
  { id: 'expense-healthcare-dental', name: 'Nha khoa', type: 'expense', color: '#ef4444', icon: '🦷', parentId: 'expense-healthcare' },

  // Khoản chi - Giải trí
  { id: 'expense-entertainment', name: 'Giải trí', type: 'expense', color: '#ec4899', icon: '🎮', isParent: true },
  { id: 'expense-entertainment-movie', name: 'Xem phim', type: 'expense', color: '#ec4899', icon: '🎬', parentId: 'expense-entertainment' },
  { id: 'expense-entertainment-sport', name: 'Thể thao', type: 'expense', color: '#ec4899', icon: '⚽', parentId: 'expense-entertainment' },
  { id: 'expense-entertainment-travel', name: 'Du lịch', type: 'expense', color: '#ec4899', icon: '✈️', parentId: 'expense-entertainment' },
  { id: 'expense-entertainment-music', name: 'Âm nhạc', type: 'expense', color: '#ec4899', icon: '🎵', parentId: 'expense-entertainment' },

  // Khoản chi - Đầu tư
  { id: 'expense-investment', name: 'Đầu tư', type: 'expense', color: '#059669', icon: '📈', isParent: true },
  { id: 'expense-investment-stocks', name: 'Cổ phiếu', type: 'expense', color: '#059669', icon: '📊', parentId: 'expense-investment' },
  { id: 'expense-investment-crypto', name: 'Tiền điện tử', type: 'expense', color: '#059669', icon: '₿', parentId: 'expense-investment' },
  { id: 'expense-investment-gold', name: 'Vàng', type: 'expense', color: '#059669', icon: '🥇', parentId: 'expense-investment' },

  // Khoản chi - Chi phí khác
  { id: 'expense-others', name: 'Chi phí khác', type: 'expense', color: '#6b7280', icon: '📦', isParent: true },
  { id: 'expense-others-gift', name: 'Quà tặng', type: 'expense', color: '#6b7280', icon: '🎁', parentId: 'expense-others' },
  { id: 'expense-others-donation', name: 'Từ thiện', type: 'expense', color: '#6b7280', icon: '❤️', parentId: 'expense-others' },
  { id: 'expense-others-fine', name: 'Phạt', type: 'expense', color: '#6b7280', icon: '⚠️', parentId: 'expense-others' },
  { id: 'expense-others-tax', name: 'Thuế', type: 'expense', color: '#6b7280', icon: '📋', parentId: 'expense-others' },

  // Khoản thu
  { id: 'income-salary', name: 'Lương', type: 'income', color: '#22c55e', icon: '💵', isParent: true },
  { id: 'income-business', name: 'Kinh doanh', type: 'income', color: '#22c55e', icon: '🏢', isParent: true },
  { id: 'income-investment', name: 'Lợi nhuận đầu tư', type: 'income', color: '#22c55e', icon: '💹', isParent: true },
  { id: 'income-bonus', name: 'Thưởng', type: 'income', color: '#22c55e', icon: '🎉', isParent: true },

  // Vay/Nợ
  { id: 'loan-out', name: 'Cho vay', type: 'loan', color: '#8b5cf6', icon: '💸', isParent: true },
  { id: 'loan-repayment', name: 'Trả nợ', type: 'loan', color: '#8b5cf6', icon: '📤', isParent: true },
  { id: 'loan-collection', name: 'Thu nợ', type: 'loan', color: '#8b5cf6', icon: '💰', isParent: true },
  { id: 'loan-in', name: 'Đi vay', type: 'loan', color: '#8b5cf6', icon: '📥', isParent: true },
];

// Helper function để kết hợp sample categories với user categories
export const getAllCategories = (userCategories: Category[] = []): Category[] => {
  return [...sampleCategories, ...userCategories];
};

// Helper function để kiểm tra xem category có phải sample category không
export const isSampleCategory = (categoryId: string): boolean => {
  return sampleCategories.some(cat => cat.id === categoryId);
};

// Helper functions để lọc categories theo type và parent
export const getParentCategories = (type: 'expense' | 'income' | 'loan', userCategories: Category[] = []): Category[] => {
  return getAllCategories(userCategories).filter(cat => cat.type === type && cat.isParent);
};

export const getChildCategories = (parentId: string, userCategories: Category[] = []): Category[] => {
  return getAllCategories(userCategories).filter(cat => cat.parentId === parentId);
};
