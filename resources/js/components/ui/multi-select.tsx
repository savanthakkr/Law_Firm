import React, { useState, useRef, useEffect } from 'react';
import { Check, ChevronDown, X } from 'lucide-react';

/**
 * MultiSelect Component
 * 
 * A reusable multi-select dropdown component with search functionality
 * 
 * @param {Array} options - Array of objects with 'label' and 'value' properties
 * @param {Array} value - Array of selected values
 * @param {Function} onChange - Callback function called when selection changes
 * @param {string} placeholder - Placeholder text when no items are selected
 * @param {boolean} disabled - Whether the component is disabled
 * @param {string} className - Additional CSS classes
 * @param {number} maxDisplay - Maximum number of tags to display before showing "+X more"
 * @param {string} searchPlaceholder - Placeholder text for search input
 * @param {boolean} showClearAll - Whether to show "Clear All" button
 * @param {number} maxHeight - Maximum height of dropdown in pixels
 * @param {string} noOptionsText - Text to show when no options are found
 */
const MultiSelect = ({ 
  options = [], 
  value = [], 
  onChange, 
  placeholder = "Select options...", 
  disabled = false,
  className = "",
  maxDisplay = 2,
  searchPlaceholder = "Search options...",
  showClearAll = true,
  maxHeight = 192, // 12rem in pixels
  noOptionsText = "No options found"
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);

  // Filter options based on search term
  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle option selection
  const handleOptionSelect = (optionValue) => {
    const newValue = value.includes(optionValue)
      ? value.filter(v => v !== optionValue)
      : [...value, optionValue];
    onChange(newValue);
  };

  // Handle remove tag
  const handleRemoveTag = (optionValue, e) => {
    e.stopPropagation();
    const newValue = value.filter(v => v !== optionValue);
    onChange(newValue);
  };

  // Handle clear all
  const handleClearAll = () => {
    onChange([]);
  };

  // Get display text for selected items
  const getDisplayText = () => {
    if (value.length === 0) return placeholder;
    
    const selectedLabels = value.map(v => {
      const option = options.find(opt => opt.value === v);
      return option ? option.label : v;
    });

    if (selectedLabels.length <= maxDisplay) {
      return selectedLabels;
    }

    return [...selectedLabels.slice(0, maxDisplay), `+${selectedLabels.length - maxDisplay} more`];
  };

  const displayItems = getDisplayText();

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        className={`flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
          disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
        }`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
      >
        <div className="flex flex-wrap items-center gap-1 flex-1 min-w-0">
          {Array.isArray(displayItems) ? (
            displayItems.map((item, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-1 rounded-md bg-secondary px-2 py-1 text-xs font-medium text-secondary-foreground"
              >
                {item}
                {index < value.length && (
                  <div
                    className="ml-1 h-3 w-3 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2 cursor-pointer"
                    onClick={(e) => handleRemoveTag(value[index], e)}
                  >
                    <X className="h-3 w-3" />
                  </div>
                )}
              </span>
            ))
          ) : (
            <span className="text-muted-foreground">{displayItems}</span>
          )}
        </div>
        <ChevronDown className={`h-4 w-4 opacity-50 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full z-50 mt-1 w-full rounded-md border bg-popover p-0 text-popover-foreground shadow-md">
          {/* Search Input */}
          <div className="p-2 border-b">
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-transparent border-none outline-none placeholder:text-muted-foreground"
            />
          </div>

          {/* Options List */}
          <div className="overflow-y-auto" style={{ maxHeight: `${maxHeight}px` }}>
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-2 text-sm text-muted-foreground">{noOptionsText}</div>
            ) : (
              filteredOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className="flex w-full items-center justify-between px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground outline-none"
                  onClick={() => handleOptionSelect(option.value)}
                >
                  <span>{option.label}</span>
                  {value.includes(option.value) && (
                    <Check className="h-4 w-4 text-primary" />
                  )}
                </button>
              ))
            )}
          </div>

          {/* Clear All Button */}
          {showClearAll && value.length > 0 && (
            <div className="p-2 border-t">
              <button
                type="button"
                className="w-full px-3 py-2 text-sm text-muted-foreground hover:text-foreground focus:text-foreground outline-none"
                onClick={handleClearAll}
              >
                Clear All
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MultiSelect;