import { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';

// Define the cart item type
export interface CartItem {
  id: string | number;
  title: string;
  authorName: string;
  imageUrl?: string;
  price: number;
  discountPrice?: number;
  quantity: number;
}

// Define the cart state
interface CartState {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
}

// Define cart actions
type CartAction =
  | { type: 'ADD_ITEM'; payload: CartItem }
  | { type: 'REMOVE_ITEM'; payload: { id: string | number } }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string | number; quantity: number } }
  | { type: 'CLEAR_CART' };

// Create the context
interface CartContextType {
  cart: CartState;
  addItem: (item: Omit<CartItem, 'quantity'>, quantity: number) => void;
  removeItem: (id: string | number) => void;
  updateQuantity: (id: string | number, quantity: number) => void;
  clearCart: () => void;
  isItemInCart: (id: string | number) => boolean;
  getCartItem: (id: string | number) => CartItem | undefined;
  getItemQuantity: (id: string | number) => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// Initial state
const initialState: CartState = {
  items: [],
  totalItems: 0,
  totalPrice: 0,
};

// Calculate totals based on items
const calculateTotals = (items: CartItem[]): Pick<CartState, 'totalItems' | 'totalPrice'> => {
  return {
    totalItems: items.reduce((total, item) => total + item.quantity, 0),
    totalPrice: items.reduce((total, item) => total + (item.discountPrice??item.price) * item.quantity, 0),
  };
};

// Reducer function
const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existingItemIndex = state.items.findIndex(
        (item) => item.id === action.payload.id
      );

      let updatedItems;

      if (existingItemIndex >= 0) {
        // Item exists in the cart, update quantity
        updatedItems = [...state.items];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + action.payload.quantity,
        };
      } else {
        // Item doesn't exist in the cart, add it
        updatedItems = [...state.items, action.payload];
      }

      return {
        ...state,
        items: updatedItems,
        ...calculateTotals(updatedItems),
      };
    }

    case 'REMOVE_ITEM': {
      const updatedItems = state.items.filter((item) => item.id !== action.payload.id);
      
      return {
        ...state,
        items: updatedItems,
        ...calculateTotals(updatedItems),
      };
    }

    case 'UPDATE_QUANTITY': {
      const { id, quantity } = action.payload;
      
      if (quantity <= 0) {
        // If quantity is 0 or less, remove the item
        return cartReducer(state, { type: 'REMOVE_ITEM', payload: { id } });
      }

      const updatedItems = state.items.map((item) =>
        item.id === id ? { ...item, quantity } : item
      );

      return {
        ...state,
        items: updatedItems,
        ...calculateTotals(updatedItems),
      };
    }

    case 'CLEAR_CART':
      return initialState;

    default:
      return state;
  }
};

// Persist cart to localStorage
const saveCartToLocalStorage = (cart: CartState) => {
  localStorage.setItem('bookworm-cart', JSON.stringify(cart));
};

// Load cart from localStorage
const loadCartFromLocalStorage = (): CartState => {
  const savedCart = localStorage.getItem('bookworm-cart');
  return savedCart ? JSON.parse(savedCart) : initialState;
};
 
// Provider component
export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, dispatch] = useReducer(cartReducer, loadCartFromLocalStorage());

  useEffect(() => {
    saveCartToLocalStorage(cart);
  }, [cart]);

  // Action creators
  const addItem = (item: Omit<CartItem, 'quantity'>, quantity: number) => {
    dispatch({ type: 'ADD_ITEM', payload: { ...item, quantity } });
  };

  const removeItem = (id: string | number) => {
    dispatch({ type: 'REMOVE_ITEM', payload: { id } });
  };

  const updateQuantity = (id: string | number, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  // Additional utility functions
  const isItemInCart = (id: string | number) => {
    return cart.items.some(item => item.id === id);
  };

  const getCartItem = (id: string | number) => {
    return cart.items.find(item => item.id === id);
  };

  const getItemQuantity = (id: string | number) => {
    const item = getCartItem(id);
    return item ? item.quantity : 0;
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        isItemInCart,
        getCartItem,
        getItemQuantity,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

/**
 * Custom hook for using the cart context throughout the application.
 * Must be used within a CartProvider component.
 * 
 * @returns CartContextType - All cart state and methods
 * @throws Error if used outside of CartProvider
 */
export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider. Ensure your component is wrapped in the CartProvider.');
  }
  return context;
};
