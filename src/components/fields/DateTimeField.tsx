import React, { useState, useCallback, useMemo } from 'react';
import { format, parse, isValid, isAfter, isBefore, addDays, subDays, isWeekend, getDay } from 'date-fns';

export interface DateTimeFieldProps {
  name: string;
  label: string;
  value?: string | Date;
  onChange?: (value: string | Date | null) => void;
  format?: string;
  displayFormat?: string;
  includeTime?: boolean;
  timezone?: string | 'auto';
  restrictions?: {
    minDate?: string | Date;
    maxDate?: string | Date;
    disabledDays?: string[] | number[]; // ['monday', 'tuesday'] or [0, 6] (0=Sunday, 6=Saturday)
    disabledDates?: (string | Date)[];
    businessDaysOnly?: boolean;
  };
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  description?: string;
  className?: string;
  showWeekNumbers?: boolean;
  locale?: string;
}

const DAYS_OF_WEEK = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

export const DateTimeField: React.FC<DateTimeFieldProps> = ({
  name,
  label,
  value,
  onChange,
  format: inputFormat = 'yyyy-MM-dd',
  displayFormat,
  includeTime = false,
  timezone = 'auto',
  restrictions = {},
  placeholder,
  disabled = false,
  error,
  description,
  className = '',
  showWeekNumbers = false,
  locale = 'en-US',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [viewDate, setViewDate] = useState(new Date());
  const [timeValue, setTimeValue] = useState('');

  // Determine the actual format to use
  const actualFormat = useMemo(() => {
    if (includeTime && !inputFormat.includes('H') && !inputFormat.includes('h')) {
      return inputFormat + ' HH:mm';
    }
    return inputFormat;
  }, [inputFormat, includeTime]);

  const actualDisplayFormat = displayFormat || actualFormat;

  // Parse the current value
  const currentDate = useMemo(() => {
    if (!value) return null;
    
    if (value instanceof Date) {
      return isValid(value) ? value : null;
    }
    
    if (typeof value === 'string') {
      const parsed = parse(value, actualFormat, new Date());
      return isValid(parsed) ? parsed : null;
    }
    
    return null;
  }, [value, actualFormat]);

  // Format date for display
  const formatDate = useCallback((date: Date | null): string => {
    if (!date) return '';
    
    try {
      return format(date, actualDisplayFormat);
    } catch {
      return date.toString();
    }
  }, [actualDisplayFormat]);

  // Check if a date is disabled
  const isDateDisabled = useCallback((date: Date): boolean => {
    const {
      minDate,
      maxDate,
      disabledDays = [],
      disabledDates = [],
      businessDaysOnly = false
    } = restrictions;

    // Check min/max dates
    if (minDate) {
      const min = minDate instanceof Date ? minDate : parse(minDate, actualFormat, new Date());
      if (isValid(min) && isBefore(date, min)) {
        return true;
      }
    }

    if (maxDate) {
      const max = maxDate instanceof Date ? maxDate : parse(maxDate, actualFormat, new Date());
      if (isValid(max) && isAfter(date, max)) {
        return true;
      }
    }

    // Check business days only
    if (businessDaysOnly && isWeekend(date)) {
      return true;
    }

    // Check disabled days
    if (disabledDays.length > 0) {
      const dayOfWeek = getDay(date);
      const dayName = DAYS_OF_WEEK[dayOfWeek];
      
      const hasDisabledDayName = (disabledDays as string[]).includes(dayName);
      const hasDisabledDayNumber = (disabledDays as number[]).includes(dayOfWeek);
      
      if (hasDisabledDayName || hasDisabledDayNumber) {
        return true;
      }
    }

    // Check disabled specific dates
    if (disabledDates.length > 0) {
      const dateString = format(date, 'yyyy-MM-dd');
      const isDisabled = disabledDates.some(disabledDate => {
        if (disabledDate instanceof Date) {
          return format(disabledDate, 'yyyy-MM-dd') === dateString;
        }
        return disabledDate === dateString;
      });
      
      if (isDisabled) {
        return true;
      }
    }

    return false;
  }, [restrictions, actualFormat]);

  // Handle date selection
  const handleDateSelect = useCallback((date: Date) => {
    if (isDateDisabled(date)) {
      return;
    }

    let newDate = date;

    // If includeTime and we have a current time, preserve it
    if (includeTime && currentDate) {
      newDate = new Date(date);
      newDate.setHours(currentDate.getHours());
      newDate.setMinutes(currentDate.getMinutes());
      newDate.setSeconds(currentDate.getSeconds());
    }

    // Handle timezone if specified
    if (timezone === 'auto') {
      // Use local timezone (default behavior)
    } else if (timezone) {
      // TODO: Implement timezone conversion
      // This would require a timezone library like date-fns-tz
    }

    const formattedValue = format(newDate, actualFormat);
    onChange?.(formattedValue);
    
    if (!includeTime) {
      setIsOpen(false);
    }
  }, [isDateDisabled, includeTime, currentDate, timezone, actualFormat, onChange]);

  // Handle time change
  const handleTimeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const time = e.target.value;
    setTimeValue(time);

    if (currentDate && time) {
      const [hours, minutes] = time.split(':').map(Number);
      const newDate = new Date(currentDate);
      newDate.setHours(hours);
      newDate.setMinutes(minutes);

      const formattedValue = format(newDate, actualFormat);
      onChange?.(formattedValue);
    }
  }, [currentDate, actualFormat, onChange]);

  // Handle input change (for manual typing)
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    
    if (!inputValue) {
      onChange?.(null);
      return;
    }

    const parsed = parse(inputValue, actualDisplayFormat, new Date());
    if (isValid(parsed) && !isDateDisabled(parsed)) {
      onChange?.(format(parsed, actualFormat));
    }
  }, [actualDisplayFormat, actualFormat, onChange, isDateDisabled]);

  // Generate calendar days
  const generateCalendarDays = useCallback(() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days: Date[] = [];
    const currentDay = new Date(startDate);

    // Generate 6 weeks of days
    for (let i = 0; i < 42; i++) {
      days.push(new Date(currentDay));
      currentDay.setDate(currentDay.getDate() + 1);
    }

    return days;
  }, [viewDate]);

  const calendarDays = generateCalendarDays();

  // Navigation handlers
  const navigateMonth = useCallback((direction: 'prev' | 'next') => {
    setViewDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  }, []);

  return (
    <div className={`datetime-field relative ${className}`}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>

      {description && (
        <p className="text-sm text-gray-600 mb-3">{description}</p>
      )}

      {/* Input */}
      <div className="relative">
        <input
          type="text"
          value={formatDate(currentDate)}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder || actualDisplayFormat}
          disabled={disabled}
          className={`
            w-full px-3 py-2 border rounded-md text-sm
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed
            ${error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'}
          `}
        />

        {/* Calendar icon */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          disabled={disabled}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          📅
        </button>
      </div>

      {/* Time input (if includeTime) */}
      {includeTime && (
        <div className="mt-2">
          <input
            type="time"
            value={currentDate ? format(currentDate, 'HH:mm') : timeValue}
            onChange={handleTimeChange}
            disabled={disabled}
            className={`
              w-full px-3 py-2 border rounded-md text-sm
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
              disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed
              ${error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'}
            `}
          />
        </div>
      )}

      {/* Calendar popup */}
      {isOpen && (
        <div className="absolute z-10 mt-1 bg-white border border-gray-300 rounded-md shadow-lg p-4">
          {/* Calendar header */}
          <div className="flex items-center justify-between mb-4">
            <button
              type="button"
              onClick={() => navigateMonth('prev')}
              className="p-1 hover:bg-gray-100 rounded"
            >
              ←
            </button>
            
            <h3 className="text-lg font-medium">
              {format(viewDate, 'MMMM yyyy')}
            </h3>
            
            <button
              type="button"
              onClick={() => navigateMonth('next')}
              className="p-1 hover:bg-gray-100 rounded"
            >
              →
            </button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
              <div
                key={day}
                className="text-center text-xs font-medium text-gray-500 p-2"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar days */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, index) => {
              const isCurrentMonth = day.getMonth() === viewDate.getMonth();
              const isSelected = currentDate && format(day, 'yyyy-MM-dd') === format(currentDate, 'yyyy-MM-dd');
              const isToday = format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
              const isDisabled = isDateDisabled(day);

              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleDateSelect(day)}
                  disabled={isDisabled}
                  className={`
                    p-2 text-sm border rounded
                    ${isSelected 
                      ? 'bg-blue-500 text-white border-blue-500' 
                      : isToday 
                        ? 'bg-blue-100 text-blue-800 border-blue-300'
                        : 'bg-white text-gray-900 border-gray-200 hover:bg-gray-100'
                    }
                    ${!isCurrentMonth ? 'text-gray-400' : ''}
                    ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                  `}
                >
                  {day.getDate()}
                </button>
              );
            })}
          </div>

          {/* Quick actions */}
          <div className="flex justify-between mt-4 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => {
                const today = new Date();
                if (!isDateDisabled(today)) {
                  handleDateSelect(today);
                }
              }}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Today
            </button>
            
            <button
              type="button"
              onClick={() => {
                onChange?.(null);
                setIsOpen(false);
              }}
              className="text-sm text-gray-600 hover:text-gray-800"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Error message */}
      {error && (
        <p className="mt-2 text-sm text-red-600">
          {error}
        </p>
      )}

      {/* Click outside to close */}
      {isOpen && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}; 