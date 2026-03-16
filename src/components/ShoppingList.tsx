import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShoppingCart,
  X,
  Check,
  Trash2,
  Download,
  Copy,
  Plus,
  Printer,
  Share2,
  Minus,
  Search,
  ChevronDown,
  ChevronUp,
  Carrot,
  Milk,
  Beef,
  Fish,
  Package,
  Snowflake,
  Croissant,
  ShoppingBag,
  CheckCircle2,
  MoreVertical,
  Edit3,
} from 'lucide-react';
import { useShoppingListStore } from '../stores/shoppingListStore';
import { SHOPPING_CATEGORIES, ShoppingCategory } from '../types/shopping';

// Icon mapping
const categoryIcons: Record<string, React.ElementType> = {
  Carrot,
  Milk,
  Beef,
  Fish,
  Package,
  Snowflake,
  Croissant,
  ShoppingBag,
};

interface ShoppingListProps {
  ingredients?: any[];
  onRemove?: (index: number) => void;
  onClear?: () => void;
  isOpen?: boolean;
  onToggle?: () => void;
  standalone?: boolean;
}

export const ShoppingList: React.FC<ShoppingListProps> = ({
  ingredients,
  onRemove,
  onClear,
  isOpen: controlledIsOpen,
  onToggle,
  standalone = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemQuantity, setNewItemQuantity] = useState('1');
  const [newItemCategory, setNewItemCategory] = useState<ShoppingCategory>('produce');
  const [showAddForm, setShowAddForm] = useState(false);
  const [copied, setCopied] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(SHOPPING_CATEGORIES.map((c) => c.id))
  );
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [editQuantity, setEditQuantity] = useState('');
  const [showCompleted, setShowCompleted] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    items,
    categories,
    totalItems,
    checkedItems,
    uncheckedItems,
    addItem,
    removeItem,
    toggleChecked,
    updateQuantity,
    updateCategory,
    clearCompleted,
    clearAll,
    addIngredients,
  } = useShoppingListStore();

  // Sync external ingredients when provided
  React.useEffect(() => {
    if (ingredients && ingredients.length > 0 && onRemove) {
      // Legacy mode - use external ingredients
      addIngredients(ingredients);
    }
  }, [ingredients]);

  // Focus input when add form is shown
  useEffect(() => {
    if (showAddForm && inputRef.current) {
      inputRef.current.focus();
    }
  }, [showAddForm]);

  const isControlled = controlledIsOpen !== undefined;
  const isListOpen = isControlled ? controlledIsOpen : isOpen;

  const handleToggle = () => {
    if (onToggle) {
      onToggle();
    } else {
      setIsOpen(!isOpen);
    }
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    addItem({
      name: newItemName.trim(),
      quantity: newItemQuantity.trim() || '1',
      category: newItemCategory,
    });

    setNewItemName('');
    setNewItemQuantity('1');
    setNewItemCategory('produce');
    setShowAddForm(false);
  };

  const handleCopyToClipboard = async () => {
    const text = items
      .map((item) => `${item.checked ? '✓' : '☐'} ${item.quantity} ${item.name}`)
      .join('\n');

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleDownload = () => {
    const text = items
      .map((item) => `${item.checked ? '[x]' : '[ ]'} ${item.quantity} ${item.name}`)
      .join('\n');

    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `shopping-list-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const content = `
      <html>
        <head>
          <title>Shopping List</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { color: #059669; }
            .category { margin-bottom: 20px; }
            .category-title { font-weight: bold; color: #374151; border-bottom: 2px solid #e5e7eb; padding-bottom: 5px; margin-bottom: 10px; }
            .item { padding: 5px 0; }
            .checked { text-decoration: line-through; color: #9ca3af; }
            .checkbox { margin-right: 10px; }
          </style>
        </head>
        <body>
          <h1>🛒 Shopping List</h1>
          <p>Generated on ${new Date().toLocaleDateString()}</p>
          ${Object.entries(categories)
            .filter(([_, items]) => items.length > 0)
            .map(([category, catItems]) => `
              <div class="category">
                <div class="category-title">${category.charAt(0).toUpperCase() + category.slice(1)}</div>
                ${catItems
                  .map(
                    (item) => `
                  <div class="item ${item.checked ? 'checked' : ''}">
                    <span class="checkbox">${item.checked ? '☑' : '☐'}</span>
                    ${item.quantity} ${item.name}
                    ${item.mealName ? `<small>(${item.mealName})</small>` : ''}
                  </div>
                `
                  )
                  .join('')}
              </div>
            `).join('')}
        </body>
      </html>
    `;

    printWindow.document.write(content);
    printWindow.document.close();
    printWindow.print();
  };

  const handleShare = async () => {
    const text = `Shopping List (${uncheckedItems} items remaining):\n\n${items
      .filter((i) => !i.checked)
      .map((item) => `• ${item.quantity} ${item.name}`)
      .join('\n')}`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: 'My Shopping List',
          text,
        });
      } else {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const startEditing = (itemId: string, currentQuantity: string) => {
    setEditingItem(itemId);
    setEditQuantity(currentQuantity);
  };

  const saveEdit = (itemId: string) => {
    if (editQuantity.trim()) {
      updateQuantity(itemId, editQuantity.trim());
    }
    setEditingItem(null);
    setEditQuantity('');
  };

  const filteredCategories = Object.entries(categories).filter(([_, catItems]) => {
    if (!searchQuery) return catItems.length > 0;
    return catItems.some((item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const progress = totalItems > 0 ? Math.round((checkedItems / totalItems) * 100) : 0;

  // If standalone mode, render the full page version
  if (standalone) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="glass rounded-3xl p-6 shadow-soft">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center">
                <ShoppingCart className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-stone-800">Shopping List</h1>
                <p className="text-stone-500 text-sm">
                  {uncheckedItems} items remaining • {checkedItems} completed
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrint}
                className="p-2 rounded-xl bg-stone-100 text-stone-600 hover:bg-stone-200 transition-colors"
                title="Print"
              >
                <Printer className="w-5 h-5" />
              </button>
              <button
                onClick={handleShare}
                className="p-2 rounded-xl bg-stone-100 text-stone-600 hover:bg-stone-200 transition-colors"
                title="Share"
              >
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          {totalItems > 0 && (
            <div className="mb-6">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-stone-600">Progress</span>
                <span className="font-medium text-emerald-600">{progress}%</span>
              </div>
              <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-500"
                />
              </div>
            </div>
          )}

          {/* Search and Actions */}
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <div className="flex-1 min-w-[200px] relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                type="text"
                placeholder="Search items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-stone-100 border-0 text-stone-700 placeholder-stone-400 focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Item
            </button>
            {checkedItems > 0 && (
              <button
                onClick={clearCompleted}
                className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Clear Completed
              </button>
            )}
          </div>

          {/* Add Item Form */}
          <AnimatePresence>
            {showAddForm && (
              <motion.form
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                onSubmit={handleAddItem}
                className="mb-6 p-4 bg-stone-50 rounded-2xl"
              >
                <div className="grid md:grid-cols-3 gap-3">
                  <input
                    ref={inputRef}
                    type="text"
                    placeholder="Item name"
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                    className="px-4 py-2 rounded-xl bg-white border border-stone-200 text-stone-700 placeholder-stone-400 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                  <input
                    type="text"
                    placeholder="Quantity (e.g., 2 cups)"
                    value={newItemQuantity}
                    onChange={(e) => setNewItemQuantity(e.target.value)}
                    className="px-4 py-2 rounded-xl bg-white border border-stone-200 text-stone-700 placeholder-stone-400 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                  <div className="flex gap-2">
                    <select
                      value={newItemCategory}
                      onChange={(e) => setNewItemCategory(e.target.value as ShoppingCategory)}
                      className="flex-1 px-4 py-2 rounded-xl bg-white border border-stone-200 text-stone-700 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    >
                      {SHOPPING_CATEGORIES.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.label}
                        </option>
                      ))}
                    </select>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-colors"
                    >
                      <Check className="w-5 h-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAddForm(false)}
                      className="px-4 py-2 bg-stone-200 text-stone-600 rounded-xl hover:bg-stone-300 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          {/* Categories */}
          <div className="space-y-4">
            {filteredCategories.map(([categoryId, catItems]) => {
              const category = SHOPPING_CATEGORIES.find((c) => c.id === categoryId);
              if (!category) return null;

              const Icon = categoryIcons[category.icon];
              const isExpanded = expandedCategories.has(categoryId);
              const checkedCount = catItems.filter((i) => i.checked).length;

              return (
                <motion.div
                  key={categoryId}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`rounded-2xl border ${category.borderColor} overflow-hidden`}
                >
                  {/* Category Header */}
                  <button
                    onClick={() => toggleCategory(categoryId)}
                    className={`w-full flex items-center justify-between p-4 ${category.bgColor} hover:opacity-90 transition-opacity`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-xl bg-white ${category.color}`}>
                        {Icon && <Icon className="w-5 h-5" />}
                      </div>
                      <div>
                        <h3 className={`font-bold ${category.color}`}>{category.label}</h3>
                        <p className="text-xs text-stone-500">
                          {catItems.length - checkedCount} of {catItems.length} remaining
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {checkedCount === catItems.length && catItems.length > 0 && (
                        <CheckCircle2 className={`w-5 h-5 ${category.color}`} />
                      )}
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-stone-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-stone-400" />
                      )}
                    </div>
                  </button>

                  {/* Items */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: 'auto' }}
                        exit={{ height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="p-2 space-y-1">
                          {catItems.map((item) => (
                            <motion.div
                              key={item.id}
                              layout
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${
                                item.checked ? 'bg-stone-50' : 'bg-white hover:bg-stone-50'
                              }`}
                            >
                              <button
                                onClick={() => toggleChecked(item.id)}
                                className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                                  item.checked
                                    ? 'bg-emerald-500 border-emerald-500 text-white'
                                    : 'border-stone-300 hover:border-emerald-500'
                                }`}
                              >
                                {item.checked && <Check className="w-4 h-4" />}
                              </button>

                              <div className="flex-1 min-w-0">
                                {editingItem === item.id ? (
                                  <div className="flex items-center gap-2">
                                    <input
                                      type="text"
                                      value={editQuantity}
                                      onChange={(e) => setEditQuantity(e.target.value)}
                                      onBlur={() => saveEdit(item.id)}
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter') saveEdit(item.id);
                                        if (e.key === 'Escape') setEditingItem(null);
                                      }}
                                      className="w-24 px-2 py-1 text-sm rounded bg-white border border-emerald-300"
                                      autoFocus
                                    />
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-2">
                                    <span
                                      className={`font-medium ${
                                        item.checked
                                          ? 'line-through text-stone-400'
                                          : 'text-stone-700'
                                      }`}
                                    >
                                      {item.name}
                                    </span>
                                    <button
                                      onClick={() => startEditing(item.id, item.quantity)}
                                      className="text-xs text-stone-400 hover:text-emerald-600"
                                    >
                                      ({item.quantity})
                                    </button>
                                  </div>
                                )}
                                {item.mealName && (
                                  <p className="text-xs text-stone-400">From: {item.mealName}</p>
                                )}
                              </div>

                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => startEditing(item.id, item.quantity)}
                                  className="p-1.5 rounded-lg text-stone-400 hover:bg-stone-100 hover:text-emerald-600 transition-colors"
                                >
                                  <Edit3 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => removeItem(item.id)}
                                  className="p-1.5 rounded-lg text-stone-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>

          {totalItems === 0 && (
            <div className="text-center py-12">
              <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-stone-300" />
              <p className="text-stone-500">Your shopping list is empty</p>
              <p className="text-sm text-stone-400 mt-1">Add items from meal plans or recipes</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Floating button version (legacy mode)
  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleToggle}
        className="relative p-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg hover:shadow-xl transition-shadow"
      >
        <ShoppingCart className="w-6 h-6" />
        {uncheckedItems > 0 && (
          <span className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full text-xs font-bold flex items-center justify-center">
            {uncheckedItems}
          </span>
        )}
      </motion.button>

      {/* Shopping List Panel */}
      <AnimatePresence>
        {isListOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="absolute bottom-16 right-0 w-96 max-h-[80vh] bg-white rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5" />
                  <h3 className="font-bold">Shopping List</h3>
                </div>
                <button
                  onClick={handleToggle}
                  className="p-1 rounded-lg hover:bg-white/20 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex items-center justify-between mt-2">
                <p className="text-sm text-emerald-100">
                  {uncheckedItems} of {totalItems} items
                </p>
                {progress > 0 && (
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1.5 bg-white/30 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-white rounded-full"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <span className="text-xs text-emerald-100">{progress}%</span>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 p-3 border-b border-stone-100">
              <button
                onClick={() => setShowAddForm(true)}
                className="flex items-center gap-1.5 px-3 py-2 bg-emerald-50 rounded-lg text-sm font-medium text-emerald-600 hover:bg-emerald-100 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add
              </button>
              <button
                onClick={handleCopyToClipboard}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-stone-100 rounded-lg text-sm font-medium text-stone-600 hover:bg-stone-200 transition-colors"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
              <button
                onClick={handleDownload}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-stone-100 rounded-lg text-sm font-medium text-stone-600 hover:bg-stone-200 transition-colors"
              >
                <Download className="w-4 h-4" />
                Save
              </button>
              <button
                onClick={handleShare}
                className="p-2 bg-stone-100 rounded-lg text-stone-600 hover:bg-stone-200 transition-colors"
              >
                <Share2 className="w-4 h-4" />
              </button>
              {checkedItems > 0 && (
                <button
                  onClick={clearCompleted}
                  className="p-2 bg-red-50 rounded-lg text-red-500 hover:bg-red-100 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Add Item Form */}
            <AnimatePresence>
              {showAddForm && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="border-b border-stone-100 overflow-hidden"
                >
                  <form onSubmit={handleAddItem} className="p-3 space-y-2">
                    <input
                      ref={inputRef}
                      type="text"
                      placeholder="Item name"
                      value={newItemName}
                      onChange={(e) => setNewItemName(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-stone-50 border-0 text-sm text-stone-700 placeholder-stone-400 focus:ring-2 focus:ring-emerald-500"
                    />
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Qty"
                        value={newItemQuantity}
                        onChange={(e) => setNewItemQuantity(e.target.value)}
                        className="w-20 px-3 py-2 rounded-lg bg-stone-50 border-0 text-sm text-stone-700 placeholder-stone-400 focus:ring-2 focus:ring-emerald-500"
                      />
                      <select
                        value={newItemCategory}
                        onChange={(e) => setNewItemCategory(e.target.value as ShoppingCategory)}
                        className="flex-1 px-3 py-2 rounded-lg bg-stone-50 border-0 text-sm text-stone-700 focus:ring-2 focus:ring-emerald-500"
                      >
                        {SHOPPING_CATEGORIES.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.label}
                          </option>
                        ))}
                      </select>
                      <button
                        type="submit"
                        className="px-3 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Items by Category */}
            <div className="overflow-y-auto max-h-96 p-3 space-y-3">
              {totalItems === 0 ? (
                <div className="text-center py-8 text-stone-400">
                  <ShoppingCart className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Your shopping list is empty</p>
                  <p className="text-xs mt-1">Add ingredients from recipes</p>
                </div>
              ) : (
                Object.entries(categories)
                  .filter(([_, catItems]) => catItems.length > 0)
                  .map(([categoryId, catItems]) => {
                    const category = SHOPPING_CATEGORIES.find((c) => c.id === categoryId);
                    if (!category) return null;

                    const Icon = categoryIcons[category.icon];
                    const isExpanded = expandedCategories.has(categoryId);

                    return (
                      <div key={categoryId} className="space-y-1">
                        <button
                          onClick={() => toggleCategory(categoryId)}
                          className="w-full flex items-center justify-between py-1 px-1"
                        >
                          <div className={`flex items-center gap-2 ${category.color}`}>
                            {Icon && <Icon className="w-4 h-4" />}
                            <span className="text-xs font-bold uppercase tracking-wider">
                              {category.label}
                            </span>
                            <span className="text-stone-400">({catItems.length})</span>
                          </div>
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4 text-stone-400" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-stone-400" />
                          )}
                        </button>

                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0 }}
                              animate={{ height: 'auto' }}
                              exit={{ height: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="space-y-1">
                                {catItems.map((item, idx) => (
                                  <motion.div
                                    key={item.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.03 }}
                                    className={`flex items-center gap-2 p-2 rounded-lg transition-colors ${
                                      item.checked ? 'bg-stone-50' : 'bg-stone-50/50'
                                    }`}
                                  >
                                    <button
                                      onClick={() => toggleChecked(item.id)}
                                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                                        item.checked
                                          ? 'bg-emerald-500 border-emerald-500 text-white'
                                          : 'border-stone-300 hover:border-emerald-500'
                                      }`}
                                    >
                                      {item.checked && <Check className="w-3 h-3" />}
                                    </button>
                                    <span
                                      className={`flex-1 text-sm truncate ${
                                        item.checked
                                          ? 'line-through text-stone-400'
                                          : 'text-stone-700'
                                      }`}
                                    >
                                      {item.quantity} {item.name}
                                    </span>
                                    <button
                                      onClick={() => removeItem(item.id)}
                                      className="p-1 text-stone-300 hover:text-red-500 transition-colors"
                                    >
                                      <X className="w-4 h-4" />
                                    </button>
                                  </motion.div>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
