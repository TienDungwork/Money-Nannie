'use client';

import React, { useState } from 'react';
import { Category } from '@/types';
import { IconPicker } from '@/components/IconPicker';
import { ChevronRight, Plus, Edit, Trash2, X, ArrowLeft } from 'lucide-react';
import { getAllCategories, getParentCategories, getChildCategories, isSampleCategory } from '@/lib/defaultCategories';

type NavigationView = 'main' | 'category-type' | 'category-parent' | 'category-child' | 'add-category';

interface CategoryManagerProps {
  categories: Category[];
  addCategory?: (category: Omit<Category, 'id'>) => Category | null;
  updateCategory?: (id: string, updatedData: Partial<Category>) => void;
  deleteCategory?: (id: string) => void;
  onSelectCategory?: (category: Category) => void;
  mode?: 'selection' | 'management'; // selection cho TransactionModal, management cho Settings
  isOpen: boolean;
  onClose: () => void;
}

export function CategoryManager({ 
  categories, 
  addCategory, 
  updateCategory, 
  deleteCategory,
  onSelectCategory,
  mode = 'management',
  isOpen,
  onClose
}: CategoryManagerProps) {
  const [currentView, setCurrentView] = useState<NavigationView>('main');
  const [selectedCategoryType, setSelectedCategoryType] = useState<'expense' | 'income' | 'loan' | null>(null);
  const [selectedParentCategory, setSelectedParentCategory] = useState<Category | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [showIconPicker, setShowIconPicker] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    icon: 'DollarSign',
    type: 'expense' as 'expense' | 'income' | 'loan',
    isParent: true,
    parentId: '',
  });

  // Helper functions đã được thay thế bằng import từ shared lib

  const getCategoryIcon = (icon: string): string => {
    const iconMap: { [key: string]: string } = {
      DollarSign: '💲', Banknote: '💵', CreditCard: '💳', Wallet: '👛', 
      PiggyBank: '🐷', TrendingUp: '📈', HandCoins: '🤲', Receipt: '🧾',
      UtensilsCrossed: '🍽️', Coffee: '☕', Pizza: '🍕', ChefHat: '👨‍🍳',
      Car: '🚗', Fuel: '⛽', Bus: '🚌', Taxi: '🚕', 
      ShoppingBag: '🛍️', ShoppingCart: '🛒', Gift: '🎁', Shirt: '👕',
      GameController: '🎮', Music: '🎵', Movie: '🎬', Camera: '📷',
      Hospital: '🏥', Medicine: '💊', Doctor: '👨‍⚕️', Stethoscope: '🩺',
      School: '🏫', BookOpen: '📚', Pencil: '✏️', Computer: '💻',
      Home: '🏠', Zap: '⚡', Droplets: '💧', Phone: '📱', Tv: '📺',
      User: '👤', Family: '👨‍👩‍👧‍👦', HandHeart: '🤝', Settings: '⚙️',
      Sparkles: '✨', Wrench: '🔧', ParkingCircle: '🅿️', Apple: '🍎',
      Sport: '⚽', Travel: '🧳', Gym: '🏋️', Dental: '🦷', Graduation: '🎓',
      Certificate: '📜', Briefcase: '💼', Wifi: '📶', Flame: '🔥'
    };
    return iconMap[icon] || '💰';
  };

  const getViewTitle = () => {
    switch (currentView) {
      case 'main': return mode === 'selection' ? 'Chọn nhóm' : 'Quản lý nhóm';
      case 'category-type': return 'Chọn loại giao dịch';
      case 'category-parent': 
        return selectedCategoryType === 'expense' ? 'Khoản chi' : 
               selectedCategoryType === 'income' ? 'Khoản thu' : 'Vay/Nợ';
      case 'category-child': return selectedParentCategory?.name || '';
      case 'add-category': return editingCategory ? 'Sửa nhóm' : 'Thêm nhóm mới';
      default: return '';
    }
  };

  const handleSave = () => {
    if (!formData.name.trim()) return;

    if (editingCategory) {
      if (updateCategory) {
        updateCategory(editingCategory.id, {
          name: formData.name.trim(),
          icon: formData.icon,
          type: formData.type,
          isParent: formData.isParent,
          parentId: formData.isParent ? undefined : formData.parentId || undefined
        });
      }
    } else {
      if (addCategory) {
        const newCategory = {
          name: formData.name.trim(),
          type: formData.type,
          icon: formData.icon,
          color: formData.type === 'expense' ? '#ef4444' : 
                 formData.type === 'income' ? '#22c55e' : '#8b5cf6',
          isParent: formData.isParent,
          parentId: formData.isParent ? undefined : formData.parentId || undefined
        };
        
        addCategory(newCategory);
      }
    }

    setFormData({
      name: '',
      icon: 'DollarSign',
      type: 'expense',
      isParent: true,
      parentId: '',
    });
    setEditingCategory(null);
    setCurrentView('main');
  };

  const handleEdit = (category: Category) => {
    // Không cho phép edit sample categories
    if (isSampleCategory(category.id)) {
      alert('Không thể sửa đổi nhóm mặc định của hệ thống');
      return;
    }
    
    setEditingCategory(category);
    setFormData({
      name: category.name,
      icon: category.icon,
      type: category.type,
      isParent: category.isParent ?? true,
      parentId: category.parentId || '',
    });
    setCurrentView('add-category');
  };

  const handleDelete = (categoryId: string) => {
    // Không cho phép delete sample categories
    if (isSampleCategory(categoryId)) {
      alert('Không thể xóa nhóm mặc định của hệ thống');
      return;
    }
    
    if (confirm('Bạn có chắc muốn xóa danh mục này?')) {
      if (deleteCategory) {
        deleteCategory(categoryId);
      }
    }
  };

  const goBack = () => {
    if (currentView === 'category-type' || currentView === 'add-category') setCurrentView('main');
    else if (currentView === 'category-parent') setCurrentView('category-type');
    else if (currentView === 'category-child') setCurrentView('category-parent');
  };

  // Render functions
  const renderMainView = () => (
    <div className="space-y-3">
      {/* Khoản chi */}
      <div 
        onClick={() => {
          setSelectedCategoryType('expense');
          setCurrentView('category-parent');
        }}
        className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200 hover:bg-gray-50 cursor-pointer"
      >
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
            <span className="text-xl">💸</span>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Khoản chi</h3>
            <p className="text-sm text-gray-500">Chi tiêu hàng ngày</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <ChevronRight size={20} className="text-gray-400" />
        </div>
      </div>

      {/* Khoản thu */}
      <div 
        onClick={() => {
          setSelectedCategoryType('income');
          setCurrentView('category-parent');
        }}
        className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200 hover:bg-gray-50 cursor-pointer"
      >
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
            <span className="text-xl">💰</span>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Khoản thu</h3>
            <p className="text-sm text-gray-500">Thu nhập, lương thưởng</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <ChevronRight size={20} className="text-gray-400" />
        </div>
      </div>

      {/* Vay/Nợ */}
      <div 
        onClick={() => {
          setSelectedCategoryType('loan');
          setCurrentView('category-parent');
        }}
        className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200 hover:bg-gray-50 cursor-pointer"
      >
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
            <span className="text-xl">🤝</span>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Vay/Nợ</h3>
            <p className="text-sm text-gray-500">Cho vay, đi vay, trả nợ</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <ChevronRight size={20} className="text-gray-400" />
        </div>
      </div>
    </div>
  );

  const renderCategoryParentSelection = () => {
    if (!selectedCategoryType) return null;
    
    const parentCategories = getParentCategories(selectedCategoryType, categories);
    
    return (
      <div className="space-y-3">
        {/* Nút thêm nhóm mới */}
        <div
          onClick={() => {
            setEditingCategory(null);
            setFormData({
              name: '',
              icon: 'DollarSign',
              type: selectedCategoryType,
              isParent: true,
              parentId: '',
            });
            setCurrentView('add-category');
          }}
          className="flex items-center justify-between p-4 bg-green-50 border-2 border-dashed border-green-300 rounded-xl cursor-pointer hover:bg-green-100 transition-colors duration-200"
        >
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center">
              <Plus size={20} className="text-white" />
            </div>
            <p className="font-semibold text-green-700">Thêm nhóm mới</p>
          </div>
        </div>

        {/* Danh sách nhóm cha */}
        {parentCategories.map((category) => {
          const children = getChildCategories(category.id, categories);
          
          return (
            <div key={category.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div 
                onClick={() => {
                  if (mode === 'selection' && onSelectCategory) {
                    onSelectCategory(category);
                    onClose();
                  } else {
                    setSelectedParentCategory(category);
                    setCurrentView('category-child');
                  }
                }}
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50"
              >
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: category.color + '20' }}
                  >
                    <span className="text-lg">{category.icon}</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{category.name}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {mode === 'management' && !isSampleCategory(category.id) && (
                    <div className="flex space-x-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(category);
                        }}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(category.id);
                        }}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  )}
                  <ChevronRight size={20} className="text-gray-400" />
                </div>
              </div>
              
              {/* Child categories preview */}
              {children.slice(0, 2).map((child) => (
                <div key={child.id} className="px-4 py-2 bg-gray-50 border-t border-gray-200">
                  <div className="flex items-center space-x-3 ml-4">
                    <div 
                      className="w-6 h-6 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: child.color + '20' }}
                    >
                      <span className="text-xs">{child.icon}</span>
                    </div>
                    <p className="text-sm text-gray-700">{child.name}</p>
                  </div>
                </div>
              ))}
            </div>
          );
        })}

        {parentCategories.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">Chưa có danh mục nào</p>
            <button
              onClick={() => {
                setEditingCategory(null);
                setFormData({
                  name: '',
                  icon: 'DollarSign',
                  type: selectedCategoryType,
                  isParent: true,
                  parentId: '',
                });
                setCurrentView('add-category');
              }}
              className="text-green-600 hover:text-green-700 font-medium"
            >
              Tạo danh mục đầu tiên
            </button>
          </div>
        )}
      </div>
    );
  };

  const renderCategoryChildSelection = () => {
    if (!selectedParentCategory) return null;
    
    const children = getChildCategories(selectedParentCategory.id, categories);
    
    return (
      <div className="space-y-3">
        {/* Parent category as selectable option */}
        <div 
          onClick={() => {
            if (mode === 'selection' && onSelectCategory) {
              onSelectCategory(selectedParentCategory);
              onClose();
            }
          }}
          className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-xl cursor-pointer hover:bg-blue-100"
        >
          <div className="flex items-center space-x-3">
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ backgroundColor: selectedParentCategory.color + '20' }}
            >
              <span className="text-lg">{selectedParentCategory.icon}</span>
            </div>
            <div>
              <p className="font-medium text-gray-900">{selectedParentCategory.name}</p>
              <p className="text-xs text-gray-500">Nhóm chính</p>
            </div>
          </div>
        </div>

        {/* Add sub-category button */}
        <div
          onClick={() => {
            setEditingCategory(null);
            setFormData({
              name: '',
              icon: 'DollarSign',
              type: selectedParentCategory.type,
              isParent: false,
              parentId: selectedParentCategory.id,
            });
            setCurrentView('add-category');
          }}
          className="flex items-center justify-between p-4 bg-green-50 border-2 border-dashed border-green-300 rounded-xl cursor-pointer hover:bg-green-100 transition-colors duration-200"
        >
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
              <Plus size={16} className="text-white" />
            </div>
            <p className="font-medium text-green-700">Thêm danh mục con</p>
          </div>
        </div>

        {/* Child categories */}
        {children.map((child) => (
          <div 
            key={child.id}
            onClick={() => {
              if (mode === 'selection' && onSelectCategory) {
                onSelectCategory(child);
                onClose();
              }
            }}
            className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50"
          >
            <div className="flex items-center space-x-3">
              <div 
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ backgroundColor: child.color + '20' }}
              >
                <span className="text-sm">{child.icon}</span>
              </div>
              <p className="text-sm text-gray-800">{child.name}</p>
            </div>
            
            {mode === 'management' && !isSampleCategory(child.id) && (
              <div className="flex space-x-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEdit(child);
                  }}
                  className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                >
                  <Edit size={14} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(child.id);
                  }}
                  className="p-1 text-red-600 hover:bg-red-50 rounded"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            )}
          </div>
        ))}

        {children.length === 0 && (
          <div className="text-center py-4">
            <p className="text-gray-500">Chưa có danh mục con nào</p>
          </div>
        )}
      </div>
    );
  };

  const renderAddCategoryForm = () => (
    <div className="space-y-4">
      {/* Tên nhóm */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tên nhóm
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg">$</span>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Tên nhóm"
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg"
          />
        </div>
      </div>

      {/* Loại giao dịch */}
      <div>
        <div className="flex space-x-2">
          <button
            onClick={() => setFormData(prev => ({ ...prev, type: 'income' }))}
            className={`flex-1 py-3 px-4 rounded-lg border transition-colors ${
              formData.type === 'income'
                ? 'border-green-500 bg-green-50 text-green-700'
                : 'border-gray-300 text-gray-600 bg-white'
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <span className="text-lg">⚡</span>
              <span className="font-medium">Khoản thu</span>
            </div>
          </button>
          <button
            onClick={() => setFormData(prev => ({ ...prev, type: 'expense' }))}
            className={`flex-1 py-3 px-4 rounded-lg border transition-colors ${
              formData.type === 'expense'
                ? 'border-red-500 bg-red-50 text-red-700'
                : 'border-gray-300 text-gray-600 bg-white'
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <span className="text-lg">💸</span>
              <span className="font-medium">Khoản chi</span>
            </div>
          </button>
        </div>
      </div>

      {/* Chọn nhóm */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Chọn nhóm
        </label>
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowIconPicker(true)}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 w-6 h-6 rounded bg-gray-100 flex items-center justify-center"
          >
            <span className="text-sm">{getCategoryIcon(formData.icon)}</span>
          </button>
          <select
            value={formData.parentId}
            onChange={(e) => setFormData(prev => ({ 
              ...prev, 
              parentId: e.target.value,
              isParent: e.target.value === ''
            }))}
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg appearance-none bg-white"
          >
            <option value="">Tạo nhóm cha mới</option>
            {getParentCategories(formData.type, categories).map((parent) => (
              <option key={parent.id} value={parent.id}>
                {parent.name}
              </option>
            ))}
          </select>
          <span className="text-xs text-gray-500 mt-1 block pl-12">
            Tạo nhóm cha mới
          </span>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex space-x-3 pt-4">
        <button
          onClick={goBack}
          className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium"
        >
          Hủy
        </button>
        <button
          onClick={handleSave}
          disabled={!formData.name.trim()}
          className="flex-1 py-3 bg-gray-400 text-white rounded-lg font-medium disabled:bg-gray-300"
        >
          Lưu
        </button>
      </div>
    </div>
  );

  const renderCurrentView = () => {
    switch (currentView) {
      case 'main': return renderMainView();
      case 'category-parent': return renderCategoryParentSelection();
      case 'category-child': return renderCategoryChildSelection();
      case 'add-category': return renderAddCategoryForm();
      default: return renderMainView();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl w-full max-w-md max-h-[80vh] flex flex-col overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              {currentView !== 'main' && (
                <button
                  onClick={goBack}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <ArrowLeft size={20} />
                </button>
              )}
              <h2 className="text-lg font-semibold mx-auto">
                {getViewTitle()}
              </h2>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {renderCurrentView()}
          </div>
        </div>
      </div>

      {/* Icon Picker */}
      <IconPicker
        isOpen={showIconPicker}
        onClose={() => setShowIconPicker(false)}
        onSelectIcon={(iconKey) => {
          setFormData(prev => ({ ...prev, icon: iconKey }));
          setShowIconPicker(false);
        }}
        selectedIcon={formData.icon}
      />
    </>
  );
}
