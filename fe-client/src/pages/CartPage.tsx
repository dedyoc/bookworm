import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import QuantityInput from '@/components/QuantityInput';
import { Separator } from '@/components/ui/separator';
import { Trash2 } from 'lucide-react';
import { Link, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { bookwormApi } from '@/services/bookwormApi';
import type { OrderItemCreate } from '@/lib/types';

export const CartPage: React.FC = () => {
  const { cart, updateQuantity, removeItem, clearCart } = useCart();
  const { token, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);

  const handleQuantityChange = (id: string | number, newQuantity: number) => {
    updateQuantity(id, newQuantity);
  };

  const handleRemoveItem = (id: string | number) => {
    removeItem(id);
  };

  const handlePlaceOrder = async () => {
    if (!isAuthenticated || !token) {
      setOrderError("Please log in to place an order.");
      return;
    }
    if (cart.items.length === 0) {
      setOrderError("Your cart is empty.");
      return;
    }

    setIsPlacingOrder(true);
    setOrderError(null);

    const orderItems: OrderItemCreate[] = cart.items.map(item => ({
      book_id: Number(item.id),
      quantity: item.quantity,
    }));

    try {
      const createdOrder = await bookwormApi.createOrder({ items: orderItems }, token);
      console.log('Order placed successfully:', createdOrder);
      clearCart();
      alert(`Order ${createdOrder.id} placed successfully!`);
    } catch (error: any) {
      console.error("Failed to place order:", error);
      let detail = "Failed to place order. Please try again.";
      if (error.response && typeof error.response.json === 'function') {
        try {
          const errorBody = await error.response.json();
          if (errorBody.detail) {
            detail = errorBody.detail;
          }
        } catch (parseError) {}
      }
      setOrderError(detail);
    } finally {
      setIsPlacingOrder(false);
    }
  };

  const placeholderImage = 'https://picsum.photos/80/120';

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold mb-6">
        Your cart: {cart.totalItems} item{cart.totalItems !== 1 ? 's' : ''}
      </h1>

      {cart.items.length === 0 ? (
        <div className="text-center py-12 border rounded-lg bg-gray-50">
          <h2 className="text-xl text-gray-600 mb-4">Your cart is currently empty.</h2>
          <Button asChild>
            <Link to="/shop">Continue Shopping</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
              <div className="hidden md:grid grid-cols-6 gap-4 items-center p-4 font-medium text-muted-foreground border-b">
                <div className="col-span-3">Product</div>
                <div className="text-right">Price</div>
                <div className="text-center">Quantity</div>
                <div className="text-right">Total</div>
              </div>

              {cart.items.map((item, index) => (
                <div key={item.id} className={`grid grid-cols-4 md:grid-cols-6 gap-4 items-center p-4 ${index < cart.items.length - 1 ? 'border-b' : ''}`}>
                  <div className="col-span-4 md:col-span-3 flex items-center gap-4">
                    <img
                      src={item.imageUrl || placeholderImage}
                      alt={item.title}
                      className="w-16 h-24 object-cover rounded"
                    />
                    <div>
                      <Link to="/product/$id" params={{ id: String(item.id) }} className="font-medium hover:text-blue-700 line-clamp-2">
                        {item.title}
                      </Link>
                      <p className="text-sm text-muted-foreground">{item.authorName}</p>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="md:hidden text-red-500 hover:text-red-700 mt-2"
                        onClick={() => handleRemoveItem(item.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                        <span className="sr-only">Remove item</span>
                      </Button>
                    </div>
                  </div>

                  <div className="text-right font-medium">
                    {item.discountPrice !== undefined ? (
                      <div className="flex flex-col items-end">
                        <span className="text-red-600">${item.discountPrice.toFixed(2)}</span>
                        <span className="text-xs text-gray-500 line-through">${item.price.toFixed(2)}</span>
                      </div>
                    ) : (
                      <span>${item.price.toFixed(2)}</span>
                    )}
                  </div>

                  <div className="flex justify-center items-center">
                    <QuantityInput
                      initialValue={item.quantity}
                      min={1}
                      max={8}
                      onChange={(newQuantity) => handleQuantityChange(item.id, newQuantity)}
                    />
                  </div>

                  <div className="text-right font-medium flex justify-end items-center gap-2">
                    <span>${((item.discountPrice ?? item.price) * item.quantity).toFixed(2)}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="hidden md:inline-flex text-red-500 hover:text-red-700"
                      onClick={() => handleRemoveItem(item.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                      <span className="sr-only">Remove item</span>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm space-y-4 sticky top-24">
              <h2 className="text-lg rounded-t-lg font-semibold border-b p-6 bg-gray-100 pb-2">Cart Totals</h2>
              <div className="p-6 space-y-4">
                <div className="flex justify-between text-xl font-bold">
                  <span>Total</span>
                  <span>${cart.totalPrice.toFixed(2)}</span>
                </div>
                <Separator />
                {orderError && (
                  <p className="text-red-600 text-sm">{orderError}</p>
                )}
                <Button 
                  className="w-full" 
                  size="lg" 
                  disabled={cart.items.length === 0 || isPlacingOrder}
                  onClick={handlePlaceOrder}
                >
                  {isPlacingOrder ? 'Placing Order...' : 'Place Order'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};