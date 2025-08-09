'use client';

import React, { useState } from 'react';
import { Category } from '@/types';
import { IconPicker } from '@/components/IconPicker';
import { ChevronRight, Plus, Edit, Trash2, X, ArrowLeft } from 'lucide-react';
import { getAllCategories, getParentCategories, getChildCategories, isSampleCategory } from '@/lib/defaultCategories';
import { getCategoryIcon } from '@/lib/helpers';

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
  const [showParentSelector, setShowParentSelector] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    icon: 'DollarSign',
    type: 'expense' as 'expense' | 'income' | 'loan',
    isParent: true,
    parentId: '',
    parentName: '',
  });

  // Remove duplicate getCategoryIcon function - now using centralized helper

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

    // Prevent double submissions
    if (currentView !== 'add-category') return;

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

    // Reset form and navigate back immediately
    setFormData({
      name: '',
      icon: 'DollarSign',
      type: 'expense',
      isParent: true,
      parentId: '',
      parentName: '',
    });
    setEditingCategory(null);
    setCurrentView('main');
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    const parentCategory = category.parentId ? categories.find(c => c.id === category.parentId) : null;
    setFormData({
      name: category.name,
      icon: category.icon,
      type: category.type,
      isParent: category.isParent ?? true,
      parentId: category.parentId || '',
      parentName: parentCategory?.name || '',
    });
    setCurrentView('add-category');
  };

  const handleDelete = (categoryId: string) => {
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
              parentName: '',
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
                    <span className="text-lg">{getCategoryIcon(category.icon)}</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{category.name}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {mode === 'management' && (
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
                      <span className="text-xs">{getCategoryIcon(child.icon)}</span>
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
                  parentName: '',
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
              <span className="text-lg">{getCategoryIcon(selectedParentCategory.icon)}</span>
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
              parentName: selectedParentCategory.name,
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
                <span className="text-sm">{getCategoryIcon(child.icon)}</span>
              </div>
              <p className="text-sm text-gray-800">{child.name}</p>
            </div>
            
            {mode === 'management' && (
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
      <div className="space-y-2">
        <div className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg bg-white">
          <button
            type="button"
            onClick={() => setShowIconPicker(true)}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
              formData.type === 'income' ? 'bg-green-500 hover:bg-green-600' : 
              formData.type === 'expense' ? 'bg-red-500 hover:bg-red-600' : 'bg-purple-500 hover:bg-purple-600'
            }`}
          >
            <span className="text-white text-lg">{getCategoryIcon(formData.icon)}</span>
          </button>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Tên nhóm"
            className="flex-1 bg-transparent border-none outline-none text-gray-900 placeholder-gray-500 text-base"
            autoFocus
          />
        </div>
      </div>

      {/* Phân loại */}
      <div className="space-y-2">
        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-white">
          <div className="flex space-x-1">
            <button
              onClick={() => setFormData(prev => ({ 
                ...prev, 
                type: 'income',
                parentId: '',
                parentName: '',
                isParent: true
              }))}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                formData.type === 'income'
                  ? 'bg-green-100 text-green-700 border border-green-300'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              Khoản thu
            </button>
            <button
              onClick={() => setFormData(prev => ({ 
                ...prev, 
                type: 'expense',
                parentId: '',
                parentName: '',
                isParent: true
              }))}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                formData.type === 'expense'
                  ? 'bg-red-100 text-red-700 border border-red-300'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              Khoản chi
            </button>
          </div>
        </div>
      </div>

      {/* Chọn nhóm */}
      <div className="space-y-2">
        <button
          onClick={() => setShowParentSelector(true)}
          className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center space-x-3">
            <span className="text-xl">🏷️</span>
            <span className="text-gray-700 font-medium">Chọn nhóm</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-gray-600 text-sm">
              {formData.parentName || 'Nhóm cha'}
            </span>
            <ChevronRight size={16} className="text-gray-400" />
          </div>
        </button>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-3 pt-4">
        <button
          onClick={goBack}
          className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
        >
          Hủy
        </button>
        <button
          onClick={handleSave}
          disabled={!formData.name.trim()}
          className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          {editingCategory ? 'Cập nhật' : 'Tạo nhóm'}
        </button>
      </div>
    </div>
  );

  const renderParentSelector = () => {
    const parentCategories = getParentCategories(formData.type, categories);
    
    return (
      <div className="space-y-3">
        {/* Tùy chọn Nhóm cha */}
        <div
          onClick={() => {
            setFormData(prev => ({ 
              ...prev, 
              parentId: '', 
              parentName: '',
              isParent: true 
            }));
            setShowParentSelector(false);
          }}
          className={`flex items-center justify-between p-4 border-2 rounded-lg cursor-pointer transition-colors ${
            formData.parentId === '' 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-200 bg-white hover:bg-gray-50'
          }`}
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
              <span className="text-white text-lg">📁</span>
            </div>
            <div>
              <p className="font-medium text-gray-900">Nhóm cha</p>
              <p className="text-sm text-gray-500">Tạo nhóm chính</p>
            </div>
          </div>
          {formData.parentId === '' && (
            <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
              <span className="text-white text-xs">✓</span>
            </div>
          )}
        </div>

        {/* Danh sách nhóm cha có sẵn */}
        {parentCategories.map((parent) => (
          <div
            key={parent.id}
            onClick={() => {
              setFormData(prev => ({ 
                ...prev, 
                parentId: parent.id, 
                parentName: parent.name,
                isParent: false 
              }));
              setShowParentSelector(false);
            }}
            className={`flex items-center justify-between p-4 border-2 rounded-lg cursor-pointer transition-colors ${
              formData.parentId === parent.id 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-200 bg-white hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center space-x-3">
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ backgroundColor: parent.color + '20' }}
              >
                <span className="text-lg">{getCategoryIcon(parent.icon)}</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">{parent.name}</p>
                <p className="text-sm text-gray-500">Tạo nhóm con</p>
              </div>
            </div>
            {formData.parentId === parent.id && (
              <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                <span className="text-white text-xs">✓</span>
              </div>
            )}
          </div>
        ))}

        {parentCategories.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">Chưa có nhóm cha nào cho loại này</p>
          </div>
        )}
      </div>
    );
  };

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
        <div className={`bg-white rounded-2xl w-full flex flex-col overflow-hidden ${
          currentView === 'add-category' ? 'max-w-lg max-h-[90vh]' : 'max-w-md max-h-[80vh]'
        }`}>
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              {currentView !== 'main' && (
                <button
                  onClick={goBack}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ArrowLeft size={20} />
                </button>
              )}
              <h2 className="text-xl font-bold text-gray-900 mx-auto">
                {getViewTitle()}
              </h2>
              <button
                onClick={onClose}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={24} />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className={`flex-1 overflow-y-auto ${
            currentView === 'add-category' ? 'p-6' : 'p-4'
          }`}>
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

      {/* Parent Selector Modal */}
      {showParentSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[80vh] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setShowParentSelector(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ArrowLeft size={20} />
                </button>
                <h2 className="text-xl font-bold text-gray-900 mx-auto">
                  Chọn nhóm
                </h2>
                <button
                  onClick={() => setShowParentSelector(false)}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {renderParentSelector()}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
