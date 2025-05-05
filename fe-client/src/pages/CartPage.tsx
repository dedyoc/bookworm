import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import QuantityInput from '@/components/QuantityInput';
import { Separator } from '@/components/ui/separator';
import { Trash2 } from 'lucide-react';
import { Link, useNavigate } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { bookwormApi } from '@/services/bookwormApi';
import type { OrderItemCreate, OrderResponse } from '@/lib/types';
import SignInModal from '@/components/SignInModal';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";

export const CartPage: React.FC = () => {
  const { cart, updateQuantity, removeItem, clearCart } = useCart();
  const { token, isAuthenticated, login } = useAuth();
  const navigate = useNavigate();

  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<OrderResponse | null>(null);
  const [isCheckingCart, setIsCheckingCart] = useState(false);
  const [showUpdateDialog, setShowUpdateDialog] = useState(false);
  const [updateDialogMessages, setUpdateDialogMessages] = useState<string[]>([]);
  const [isSignInModalOpen, setIsSignInModalOpen] = useState(false);

  const handleQuantityChange = (id: string | number, newQuantity: number) => {
    if (newQuantity < 1) {
      handleRemoveItem(id);
    } else {
      updateQuantity(id, newQuantity);
    }
  };

  const handleRemoveItem = (id: string | number) => {
    removeItem(id);
  };

  const handlePlaceOrder = async () => {
    if (!isAuthenticated || !token) {
      setIsSignInModalOpen(true);
      return;
    }
    if (cart.items.length === 0) {
      setOrderError("Your cart is empty.");
      return;
    }

    setIsCheckingCart(true);
    setIsPlacingOrder(true);
    setOrderError(null);
    setUpdateDialogMessages([]);
    let cartNeedsUpdate = false;
    const itemsToRemove: (string | number)[] = [];
    const validationMessages: string[] = [];

    try {
      const validationPromises = cart.items.map(item =>
        bookwormApi.getBook(parseInt(item.id as string))
          .then(fetchedBook => ({ type: 'success' as const, fetchedBook, originalItem: item }))
          .catch(error => ({ type: 'error' as const, error, originalItem: item }))
      );

      const results = await Promise.all(validationPromises);

      results.forEach(result => {
        if (result.type === 'success') {
          const { fetchedBook, originalItem } = result;
          const fetchedPrice = parseFloat(fetchedBook.book_price);
          const fetchedDiscountPrice = fetchedBook.discount_price ? parseFloat(fetchedBook.discount_price) : undefined;

          let itemUpdated = false;
          let updateReason = "";

          if (originalItem.price !== fetchedPrice) {
            itemUpdated = true;
            updateReason += ` Price changed from $${originalItem.price.toFixed(2)} to $${fetchedPrice.toFixed(2)}.`;
          }
          if (originalItem.discountPrice !== fetchedDiscountPrice) {
            if (originalItem.discountPrice === undefined && fetchedDiscountPrice !== undefined) {
              updateReason += ` Now on sale for $${fetchedDiscountPrice.toFixed(2)}.`;
            } else if (originalItem.discountPrice !== undefined && fetchedDiscountPrice === undefined) {
              updateReason += ` No longer on sale (was $${originalItem.discountPrice.toFixed(2)}).`;
            } else if (originalItem.discountPrice !== undefined && fetchedDiscountPrice !== undefined && originalItem.discountPrice !== fetchedDiscountPrice) {
              updateReason += ` Sale price changed from $${originalItem.discountPrice.toFixed(2)} to $${fetchedDiscountPrice.toFixed(2)}.`;
            }
            itemUpdated = true;
          }
          if (originalItem.title !== fetchedBook.book_title) {
            itemUpdated = true;
            updateReason += ` Title updated.`;
          }

          if (itemUpdated) {
            cartNeedsUpdate = true;
            validationMessages.push(`"${originalItem.title}":${updateReason}`);
          }
        } else {
          const { error, originalItem } = result;
          let isNotFoundError = false;
          if (error?.response?.status === 404) {
            isNotFoundError = true;
          } else if (error instanceof Error && error.message.toLowerCase().includes("not found")) {
            isNotFoundError = true;
          }

          if (isNotFoundError) {
            cartNeedsUpdate = true;
            itemsToRemove.push(originalItem.id);
            validationMessages.push(`"${originalItem.title}" is no longer available and has been removed from your cart.`);
          } else {
            console.error(`Failed to validate item ${originalItem.id}:`, error);
            cartNeedsUpdate = true;
            validationMessages.push(`Could not verify "${originalItem.title}". Please check your connection or try again later.`);
          }
        }
      });

      setIsCheckingCart(false);

      if (cartNeedsUpdate) {
        itemsToRemove.forEach(id => removeItem(id));
        setUpdateDialogMessages(validationMessages);
        setShowUpdateDialog(true);
        setIsPlacingOrder(false);
        return;
      }

      const orderItems: OrderItemCreate[] = cart.items.map(item => ({
        book_id: Number(item.id),
        quantity: item.quantity,
      }));

      const order = await bookwormApi.createOrder({ items: orderItems }, token);
      console.log('Order placed successfully:', order);
      setCreatedOrder(order);
      clearCart();
      setShowSuccessDialog(true);
    } catch (error: any) {
      console.error("Failed to place order or validation processing error:", error);
      let detail = "Failed to place order. Please try again.";
      if (error.response && typeof error.response.json === 'function') {
        try {
          const errorBody = await error.response.json();
          if (errorBody.detail) {
            detail = typeof errorBody.detail === 'string' ? errorBody.detail : JSON.stringify(errorBody.detail);
          }
        } catch (parseError) {
          console.error("Failed to parse error response body:", parseError);
        }
      } else if (error instanceof Error) {
        detail = error.message;
      }
      setOrderError(detail);
      setIsCheckingCart(false);
      setIsPlacingOrder(false);
    }
  };

  const handleSignIn = async (email: string, password: string) => {
    try {
      await login(email, password);
      setIsSignInModalOpen(false);
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (showSuccessDialog) {
      timer = setTimeout(() => {
        setShowSuccessDialog(false);
        navigate({ to: '/shop' });
      }, 10000);
    }
    return () => clearTimeout(timer);
  }, [showSuccessDialog, navigate]);

  const placeholderImage = 'https://picsum.photos/80/120';

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold mb-6">
        Your cart: {cart.totalItems} item{cart.totalItems !== 1 ? 's' : ''}
      </h1>

      {cart.items.length === 0 && !showSuccessDialog ? (
        <div className="text-center py-12 border rounded-lg bg-gray-50">
          <h2 className="text-xl text-gray-600 mb-4">Your cart is currently empty.</h2>
          <Button asChild>
            <Link to="/shop">Continue Shopping</Link>
          </Button>
        </div>
      ) : cart.items.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
              <div className="hidden md:grid grid-cols-6 gap-4 items-center p-4 font-medium text-muted-foreground border-b">
                <div className="col-span-3">Product</div>
                <div className="text-right">Price</div>
                <div className="text-center">Quantity</div>
                  <div className="text-right">Total</div>
                  <div></div>
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
                      <Link to="/product/$id" params={{ id: String(item.id) }} target='_blank' className="font-medium hover:text-blue-700 line-clamp-2">
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
                      min={0}
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
                  disabled={cart.items.length === 0 || isPlacingOrder || isCheckingCart}
                  onClick={handlePlaceOrder}
                >
                  {isCheckingCart ? 'Checking Cart...' : (isPlacingOrder ? 'Placing Order...' : 'Place Order')}
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : null }

      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Order Placed Successfully!</DialogTitle>
            <DialogDescription>
              {createdOrder ? `Your order #${createdOrder.id} has been placed.` : 'Your order has been placed.'}
              <br />
              You will be redirected to the shop page shortly.
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      <Dialog open={showUpdateDialog} onOpenChange={setShowUpdateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cart Updated</DialogTitle>
            <DialogDescription>
              Some items in your cart have been updated due to changes in availability or details:
              <ul className="list-disc pl-5 mt-2 space-y-1 text-sm">
                {updateDialogMessages.map((msg, index) => (
                  <li key={index}>{msg}</li>
                ))}
              </ul>
              Please review your updated cart before proceeding.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" onClick={() => setShowUpdateDialog(false)}>
                OK
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <SignInModal
        isOpen={isSignInModalOpen}
        onClose={() => setIsSignInModalOpen(false)}
        onSignIn={handleSignIn}
      />
    </div>
  );
};