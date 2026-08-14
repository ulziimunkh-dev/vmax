import React, { useState, useEffect, useRef } from 'react';
import { DollarSign, X, Sparkles } from 'lucide-react';
import { formatPriceWithCommas, parsePrice, formatPriceMongolianWords } from '@/utils/formatPrice';

export interface PriceInputProps {
  value: string | number | undefined | null;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  showWordsBadge?: boolean;
  showQuickAmounts?: boolean;
  mode?: 'sale' | 'rent' | 'general';
  size?: 'sm' | 'md' | 'lg';
  id?: string;
  name?: string;
}

export const PriceInput: React.FC<PriceInputProps> = ({
  value,
  onChange,
  label,
  placeholder = 'Үнэ оруулах...',
  className = '',
  inputClassName = '',
  error,
  disabled = false,
  required = false,
  showWordsBadge = true,
  showQuickAmounts = false,
  mode = 'general',
  size = 'md',
  id,
  name,
}) => {
  const [displayValue, setDisplayValue] = useState<string>('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Synchronize internal display formatted value when prop value changes
  useEffect(() => {
    if (value === undefined || value === null || value === '') {
      setDisplayValue('');
    } else {
      const raw = parsePrice(value.toString());
      setDisplayValue(formatPriceWithCommas(raw));
    }
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = parsePrice(e.target.value);
    
    // Prevent exceedingly large inputs (> 15 digits)
    if (rawVal.length > 15) return;

    setDisplayValue(formatPriceWithCommas(rawVal));
    onChange(rawVal);
  };

  const handleClear = () => {
    setDisplayValue('');
    onChange('');
    inputRef.current?.focus();
  };

  const handleAddAmount = (amountToAdd: number) => {
    const currentRaw = Number(parsePrice(displayValue)) || 0;
    const newTotal = currentRaw + amountToAdd;
    const strTotal = newTotal.toString();
    setDisplayValue(formatPriceWithCommas(strTotal));
    onChange(strTotal);
  };

  const rawNumeric = Number(parsePrice(displayValue)) || 0;
  const verbalMongolian = formatPriceMongolianWords(rawNumeric);

  const sizeClasses = {
    sm: 'py-2 pl-9 pr-8 text-xs rounded-xl',
    md: 'py-3 pl-10 pr-9 text-sm rounded-xl',
    lg: 'py-3.5 pl-11 pr-10 text-base rounded-2xl',
  };

  const iconSizes = {
    sm: 13,
    md: 16,
    lg: 18,
  };

  const quickAmounts = mode === 'rent'
    ? [
        { label: '+500 мянга', value: 500_000 },
        { label: '+1 сая', value: 1_000_000 },
        { label: '+2 сая', value: 2_000_000 },
        { label: '+5 сая', value: 5_000_000 },
      ]
    : [
        { label: '+10 сая', value: 10_000_000 },
        { label: '+50 сая', value: 50_000_000 },
        { label: '+100 сая', value: 100_000_000 },
        { label: '+500 сая', value: 500_000_000 },
      ];

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className="block text-xs font-semibold text-nebula-text mb-1.5 flex items-center justify-between">
          <span className="flex items-center">
            <DollarSign size={13} className="mr-1 text-plasma" />
            <span>{label}</span>
            {required && <span className="text-rose-400 ml-1">*</span>}
          </span>
          {verbalMongolian && showWordsBadge && (
            <span className="text-plasma font-bold text-xs bg-plasma/10 px-2 py-0.5 rounded-md border border-plasma/20 animate-fadeIn">
              {verbalMongolian}
            </span>
          )}
        </label>
      )}

      <div className="relative">
        {/* Currency Prefix Icon */}
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-nebula-text">
          <span className="font-bold text-plasma text-sm">₮</span>
        </div>

        {/* Formatted Number Input */}
        <input
          ref={inputRef}
          id={id}
          name={name}
          type="text"
          inputMode="numeric"
          pattern="[0-9,]*"
          value={displayValue}
          onChange={handleInputChange}
          placeholder={placeholder}
          disabled={disabled}
          className={`block w-full bg-void/50 border ${
            error ? 'border-rose-500 ring-1 ring-rose-500' : 'border-white/10 focus:border-plasma focus:ring-1 focus:ring-plasma'
          } text-starlight placeholder-nebula-text/60 focus:outline-none transition-all font-medium tracking-wide ${sizeClasses[size]} ${inputClassName}`}
        />

        {/* Clear Button */}
        {displayValue && !disabled && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-nebula-text hover:text-white transition-colors"
            title="Цэвэрлэх"
          >
            <X size={iconSizes[size]} />
          </button>
        )}
      </div>

      {/* Helper / Verbal Mongolian readout below (if no label top badge) */}
      {!label && verbalMongolian && showWordsBadge && (
        <div className="mt-1 flex items-center space-x-1.5 text-xs text-plasma font-semibold bg-plasma/10 px-2.5 py-1 rounded-lg border border-plasma/20 w-fit animate-fadeIn">
          <Sparkles size={11} />
          <span>{verbalMongolian}</span>
        </div>
      )}

      {/* Quick Amount Add Chips */}
      {showQuickAmounts && !disabled && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {quickAmounts.map((qa) => (
            <button
              key={qa.label}
              type="button"
              onClick={() => handleAddAmount(qa.value)}
              className="text-[11px] font-medium px-2.5 py-1 rounded-lg bg-white/5 hover:bg-plasma/20 hover:text-plasma border border-white/10 hover:border-plasma/40 text-nebula-text transition-all active:scale-95"
            >
              {qa.label}
            </button>
          ))}
        </div>
      )}

      {/* Error Message */}
      {error && <p className="text-xs text-rose-400 mt-1">{error}</p>}
    </div>
  );
};

export default PriceInput;
