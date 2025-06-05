import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';

export interface AutocompleteOption {
  label: string;
  value: any;
  [key: string]: any; // Allow additional properties for templates
}

export interface AutocompleteFieldProps {
  name: string;
  label: string;
  options?: AutocompleteOption[];
  searchEndpoint?: string;
  searchMethod?: 'GET' | 'POST';
  searchHeaders?: Record<string, string>;
  displayKey?: string;
  valueKey?: string;
  debounce?: number;
  minChars?: number;
  maxResults?: number;
  template?: string; // Template string like "{{name}} - {{department}}"
  renderOption?: (option: AutocompleteOption) => React.ReactNode;
  multiple?: boolean;
  value?: any;
  onChange?: (value: any) => void;
  placeholder?: string;
  disabled?: boolean;
  loading?: boolean;
  error?: string;
  description?: string;
  className?: string;
  noOptionsText?: string;
  loadingText?: string;
  clearable?: boolean;
}

export const AutocompleteField: React.FC<AutocompleteFieldProps> = ({
  name,
  label,
  options: staticOptions = [],
  searchEndpoint,
  searchMethod = 'GET',
  searchHeaders = {},
  displayKey = 'label',
  valueKey = 'value',
  debounce = 300,
  minChars = 1,
  maxResults = 10,
  template,
  renderOption,
  multiple = false,
  value,
  onChange,
  placeholder = 'Type to search...',
  disabled = false,
  loading: externalLoading = false,
  error,
  description,
  className = '',
  noOptionsText = 'No options found',
  loadingText = 'Searching...',
  clearable = true,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<AutocompleteOption[]>([]);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  
  const searchTimeoutRef = useRef<NodeJS.Timeout>();
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Combine static options with search results
  const options = useMemo(() => {
    if (searchEndpoint && searchTerm.length >= minChars) {
      return searchResults.slice(0, maxResults);
    }
    
    if (staticOptions.length > 0 && searchTerm) {
      return staticOptions.filter(option => 
        option[displayKey]?.toLowerCase().includes(searchTerm.toLowerCase())
      ).slice(0, maxResults);
    }
    
    return staticOptions.slice(0, maxResults);
  }, [staticOptions, searchResults, searchTerm, searchEndpoint, minChars, maxResults, displayKey]);

  // Get display value for selected items
  const getDisplayValue = useCallback((item: any): string => {
    if (!item) return '';
    
    if (typeof item === 'string' || typeof item === 'number') {
      return String(item);
    }
    
    if (template) {
      return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
        return item[key] || '';
      });
    }
    
    return item[displayKey] || String(item);
  }, [displayKey, template]);

  // Convert value to option object
  const getOptionFromValue = useCallback((val: any): AutocompleteOption | null => {
    if (!val) return null;
    
    // If it's already an option object
    if (typeof val === 'object' && val[valueKey] !== undefined) {
      return val;
    }
    
    // Find in options
    const found = [...staticOptions, ...searchResults].find(opt => 
      opt[valueKey] === val
    );
    
    if (found) return found;
    
    // Create a basic option if not found
    return {
      label: String(val),
      value: val,
      [displayKey]: String(val),
      [valueKey]: val
    };
  }, [valueKey, displayKey, staticOptions, searchResults]);

  // Get selected options for display
  const selectedOptions = useMemo(() => {
    if (!value) return [];
    
    if (multiple) {
      return Array.isArray(value) 
        ? value.map(getOptionFromValue).filter(Boolean) as AutocompleteOption[]
        : [];
    }
    
    const option = getOptionFromValue(value);
    return option ? [option] : [];
  }, [value, multiple, getOptionFromValue]);

  // Search function
  const searchOptions = useCallback(async (query: string) => {
    if (!searchEndpoint || query.length < minChars) {
      setSearchResults([]);
      return;
    }

    setSearchLoading(true);
    
    try {
      const url = searchMethod === 'GET' 
        ? `${searchEndpoint}?q=${encodeURIComponent(query)}`
        : searchEndpoint;
      
      const requestConfig: RequestInit = {
        method: searchMethod,
        headers: {
          'Content-Type': 'application/json',
          ...searchHeaders
        }
      };

      if (searchMethod === 'POST') {
        requestConfig.body = JSON.stringify({ q: query });
      }

      const response = await fetch(url, requestConfig);
      
      if (!response.ok) {
        throw new Error(`Search failed: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Handle different response formats
      const results = Array.isArray(data) 
        ? data 
        : data.results || data.data || [];
      
      setSearchResults(results);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  }, [searchEndpoint, searchMethod, searchHeaders, minChars]);

  // Debounced search
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (searchTerm.length >= minChars || searchTerm === '') {
      searchTimeoutRef.current = setTimeout(() => {
        searchOptions(searchTerm);
      }, debounce);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchTerm, searchOptions, debounce, minChars]);

  // Handle input change
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSearchTerm(newValue);
    setIsOpen(true);
    setHighlightedIndex(-1);
  }, []);

  // Handle option select
  const handleOptionSelect = useCallback((option: AutocompleteOption) => {
    if (multiple) {
      const currentValues = Array.isArray(value) ? value : [];
      const isSelected = currentValues.some(v => 
        (typeof v === 'object' ? v[valueKey] : v) === option[valueKey]
      );
      
      const newValues = isSelected
        ? currentValues.filter(v => 
            (typeof v === 'object' ? v[valueKey] : v) !== option[valueKey]
          )
        : [...currentValues, option[valueKey]];
      
      onChange?.(newValues);
    } else {
      onChange?.(option[valueKey]);
      setSearchTerm('');
      setIsOpen(false);
    }
  }, [multiple, value, valueKey, onChange]);

  // Handle remove selected option
  const handleRemoveOption = useCallback((optionToRemove: AutocompleteOption) => {
    if (multiple) {
      const currentValues = Array.isArray(value) ? value : [];
      const newValues = currentValues.filter(v => 
        (typeof v === 'object' ? v[valueKey] : v) !== optionToRemove[valueKey]
      );
      onChange?.(newValues);
    } else {
      onChange?.(null);
    }
  }, [multiple, value, valueKey, onChange]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        setIsOpen(true);
        e.preventDefault();
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < options.length - 1 ? prev + 1 : 0
        );
        break;
      
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev > 0 ? prev - 1 : options.length - 1
        );
        break;
      
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && options[highlightedIndex]) {
          handleOptionSelect(options[highlightedIndex]);
        }
        break;
      
      case 'Escape':
        setIsOpen(false);
        setHighlightedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  }, [isOpen, options, highlightedIndex, handleOptionSelect]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Render option content
  const renderOptionContent = useCallback((option: AutocompleteOption) => {
    if (renderOption) {
      return renderOption(option);
    }
    
    if (template) {
      return getDisplayValue(option);
    }
    
    return option[displayKey];
  }, [renderOption, template, getDisplayValue, displayKey]);

  const isLoading = externalLoading || searchLoading;

  return (
    <div ref={containerRef} className={`autocomplete-field relative ${className}`}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>

      {description && (
        <p className="text-sm text-gray-600 mb-3">{description}</p>
      )}

      {/* Selected Options (for multiple) */}
      {multiple && selectedOptions.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {selectedOptions.map((option, index) => (
            <span
              key={index}
              className="inline-flex items-center px-2 py-1 rounded-md text-sm bg-blue-100 text-blue-800"
            >
              {getDisplayValue(option)}
              {!disabled && (
                <button
                  type="button"
                  onClick={() => handleRemoveOption(option)}
                  className="ml-1 text-blue-600 hover:text-blue-800"
                >
                  ✕
                </button>
              )}
            </span>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={multiple ? searchTerm : (searchTerm || getDisplayValue(selectedOptions[0]))}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          disabled={disabled}
          className={`
            w-full px-3 py-2 border rounded-md text-sm
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed
            ${error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'}
          `}
        />

        {/* Loading indicator */}
        {isLoading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          </div>
        )}

        {/* Clear button */}
        {!multiple && clearable && value && !disabled && (
          <button
            type="button"
            onClick={() => {
              onChange?.(null);
              setSearchTerm('');
            }}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        )}
      </div>

      {/* Options dropdown */}
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
          {isLoading ? (
            <div className="px-3 py-2 text-sm text-gray-500 text-center">
              {loadingText}
            </div>
          ) : options.length > 0 ? (
            <ul ref={listRef} className="py-1">
              {options.map((option, index) => (
                <li
                  key={index}
                  onClick={() => handleOptionSelect(option)}
                  className={`
                    px-3 py-2 text-sm cursor-pointer
                    ${index === highlightedIndex 
                      ? 'bg-blue-100 text-blue-900' 
                      : 'text-gray-900 hover:bg-gray-100'
                    }
                  `}
                >
                  {renderOptionContent(option)}
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-3 py-2 text-sm text-gray-500 text-center">
              {noOptionsText}
            </div>
          )}
        </div>
      )}

      {/* Error message */}
      {error && (
        <p className="mt-2 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}; 