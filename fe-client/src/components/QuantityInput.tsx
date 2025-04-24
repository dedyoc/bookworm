import { useState, useEffect } from 'react';

interface QuantityInputProps {
  initialValue?: number;
  min?: number;
  max?: number;
  onChange?: (value: number) => void;
}

const QuantityInput = ({
  initialValue = 1,
  min = 1,
  max = 99,
  onChange,
}: QuantityInputProps) => {
  const [quantity, setQuantity] = useState(initialValue);
  
  useEffect(() => {
    setQuantity(initialValue);
  }, [initialValue]);
  
  const handleDecrease = () => {
    if (quantity > min) {
      const newValue = quantity - 1;
      setQuantity(newValue);
      onChange?.(newValue);
    }
  };
  
  const handleIncrease = () => {
    if (quantity < max) {
      const newValue = quantity + 1;
      setQuantity(newValue);
      onChange?.(newValue);
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    
    if (!isNaN(value)) {
      const boundedValue = Math.min(Math.max(value, min), max);
      setQuantity(boundedValue);
      onChange?.(boundedValue);
    }
  };

  return (
    <div className="flex items-center">
      <button
        onClick={handleDecrease}
        disabled={quantity <= min}
        className={`w-8 h-8 flex items-center justify-center rounded-l border border-gray-300 ${
          quantity <= min ? 'bg-gray-100 text-gray-400' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        }`}
        type="button"
      >
        -
      </button>
      
      <input
        type="number"
        min={min}
        max={max}
        value={quantity}
        onChange={handleInputChange}
        className="h-8 w-12 border-t border-b border-gray-300 text-center [-moz-appearance:_textfield] [&::-webkit-outer-spin-button]:m-0 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:m-0 [&::-webkit-inner-spin-button]:appearance-none"
      />
      
      <button
        onClick={handleIncrease}
        disabled={quantity >= max}
        className={`w-8 h-8 flex items-center justify-center rounded-r border border-gray-300 ${
          quantity >= max ? 'bg-gray-100 text-gray-400' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        }`}
        type="button"
      >
        +
      </button>
    </div>
  );
};

export default QuantityInput;
