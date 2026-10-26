import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router';

import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useOrder } from '../../context/OrderContext';

function Checkout() {
  const navigate = useNavigate();

  const { user } = useAuth();

  const {
    cartItems,
    cartSubtotal,
    clearCart,
    buyNowItem,
    clearBuyNow,
  } = useCart();

  const { createOrder } = useOrder();

  /*
   * If Buy Now was used, checkout only that product.
   *
   * Otherwise checkout the normal cart.
   */
  const checkoutItems = buyNowItem
    ? [buyNowItem]
    : cartItems;

  const checkoutSubtotal = buyNowItem
    ? buyNowItem.price * buyNowItem.quantity
    : cartSubtotal;

  const shippingCost =
    checkoutSubtotal >= 2000 ? 0 : 99;

  const total =
    checkoutSubtotal + shippingCost;

  /*
   * If there is nothing to checkout, send the user
   * back to the cart.
   */
  useEffect(() => {
    if (checkoutItems.length === 0) {
      navigate('/cart', { replace: true });
    }
  }, [checkoutItems.length, navigate]);

  /*
   * Saved address handling
   */
  const savedAddresses = Array.isArray(user?.addresses)
    ? user.addresses
    : [];

  const defaultAddress =
    savedAddresses.find(
      (address) => address.isDefault
    ) || savedAddresses[0];

  const [selectedAddressId, setSelectedAddressId] =
    useState(defaultAddress?.id || 'new');

  const [useNewAddress, setUseNewAddress] =
    useState(savedAddresses.length === 0);

  /*
   * Shipping address form
   */
  const [shippingAddress, setShippingAddress] =
    useState({
      recipientName:
        user?.name || '',
      phone:
        user?.phone || '',
      pincode: '',
      addressLine: '',
      city: '',
      state: '',
    });

  const [paymentMethod, setPaymentMethod] =
    useState('COD');

  const [errors, setErrors] = useState({});

  const [isPlacingOrder, setIsPlacingOrder] =
    useState(false);

  /*
   * When the selected saved address changes,
   * populate the shipping address.
   */
  useEffect(() => {
    if (
      !useNewAddress &&
      selectedAddressId !== 'new'
    ) {
      const selectedAddress =
        savedAddresses.find(
          (address) =>
            address.id === selectedAddressId
        );

      if (selectedAddress) {
        setShippingAddress({
          recipientName:
            selectedAddress.recipientName || '',
          phone:
            selectedAddress.phone || '',
          pincode:
            selectedAddress.pincode || '',
          addressLine:
            selectedAddress.addressLine || '',
          city:
            selectedAddress.city || '',
          state:
            selectedAddress.state || '',
        });
      }
    }
  }, [
    selectedAddressId,
    useNewAddress,
    user,
  ]);

  /*
   * Handle address field changes
   */
  const handleAddressChange = (event) => {
    const { name, value } = event.target;

    setShippingAddress((currentAddress) => ({
      ...currentAddress,
      [name]: value,
    }));

    setErrors((currentErrors) => ({
      ...currentErrors,
      [name]: '',
    }));
  };

  /*
   * Select a saved address
   */
  const handleSavedAddressSelect = (
    addressId
  ) => {
    setSelectedAddressId(addressId);
    setUseNewAddress(false);

    setErrors({});
  };

  /*
   * Select a new address
   */
  const handleNewAddress = () => {
    setSelectedAddressId('new');
    setUseNewAddress(true);

    setShippingAddress({
      recipientName:
        user?.name || '',
      phone:
        user?.phone || '',
      pincode: '',
      addressLine: '',
      city: '',
      state: '',
    });

    setErrors({});
  };

  /*
   * Validate checkout form
   */
  const validateForm = () => {
    const newErrors = {};

    const phone = shippingAddress.phone.trim();
    const pincode =
      shippingAddress.pincode.trim();

    if (
      !shippingAddress.recipientName.trim()
    ) {
      newErrors.recipientName =
        'Recipient name is required.';
    }

    if (!phone) {
      newErrors.phone =
        'Phone number is required.';
    } else if (!/^[6-9]\d{9}$/.test(phone)) {
      newErrors.phone =
        'Enter a valid 10-digit Indian phone number.';
    }

    if (!pincode) {
      newErrors.pincode =
        'PIN code is required.';
    } else if (!/^\d{6}$/.test(pincode)) {
      newErrors.pincode =
        'Enter a valid 6-digit PIN code.';
    }

    if (!shippingAddress.addressLine.trim()) {
      newErrors.addressLine =
        'Address is required.';
    }

    if (!shippingAddress.city.trim()) {
      newErrors.city =
        'City is required.';
    }

    if (!shippingAddress.state.trim()) {
      newErrors.state =
        'State is required.';
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  /*
   * Place order
   */
  const handlePlaceOrder = async () => {
    if (!user) {
      navigate('/login', {
        state: {
          from: '/checkout',
        },
      });
      return;
    }

    if (checkoutItems.length === 0 || isPlacingOrder) {
      return;
    }

    const isValid = validateForm();
    if (!isValid) {
      return;
    }

    setIsPlacingOrder(true);
    setErrors((currentErrors) => ({ ...currentErrors, general: '' }));

    try {
      // The backend looks up current product prices and calculates the final total.
      const result = await createOrder({
        items: checkoutItems,
        shippingAddress,
        paymentMethod,
      });

      if (!result?.success || !result.order?.id) {
        setErrors({
          general: result?.message || 'Unable to place the order.',
        });
        return;
      }

      // Only clear the cart after the backend confirms the order was saved.
      // Buy Now clears only its temporary item, not the user's regular cart.
      if (buyNowItem) {
        clearBuyNow();
      } else {
        // Wait for the server-backed cart to clear before navigating.
        // If cart cleanup fails, the order itself is still successful,
        // so do not treat the completed order as a failed checkout.
        try {
          await clearCart();
        } catch (cartError) {
          console.error('Order was placed, but the cart could not be cleared:', cartError);
        }
      }

      navigate('/orders', {
        replace: true,
        state: {
          orderPlaced: true,
          orderId: result.order.id,
        },
      });
    } catch (error) {
      setErrors({
        general:
          error?.response?.data?.message ||
          error?.message ||
          'Unable to place the order. Please try again.',
      });
    } finally {
      setIsPlacingOrder(false);
    }
  };

  if (checkoutItems.length === 0) {
    return null;
  }

  return (
    <section className="bg-[#121212]">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">

        {/* Header */}
        <div className="mb-10">

          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#FF5722]">
            Checkout
          </p>

          <h1 className="mt-2 text-3xl font-black tracking-tight text-[#F5F5F5] sm:text-4xl">
            Complete your order.
          </h1>

          <p className="mt-2 text-[#A3A3A3]">
            Review your details and confirm your
            purchase.
          </p>

          {buyNowItem && (
            <div className="mt-5 inline-flex rounded-lg border border-[#FF5722]/30 bg-[#FF5722]/10 px-4 py-2 text-xs font-semibold text-[#FF7043]">
              Buy Now checkout
            </div>
          )}

        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_380px]">

          {/* Left Side */}
          <div className="space-y-8">

            {/* Shipping Address */}
            <div className="rounded-xl border border-[#333333] bg-[#1F1F1F] p-6">

              <div className="mb-6">
                <h2 className="text-xl font-bold text-[#F5F5F5]">
                  Shipping address
                </h2>

                <p className="mt-1 text-sm text-[#A3A3A3]">
                  Where should we deliver your order?
                </p>
              </div>

              {/* Saved Addresses */}
              {savedAddresses.length > 0 && (
                <div className="space-y-3">

                  {savedAddresses.map(
                    (address) => {
                      const isSelected =
                        !useNewAddress &&
                        selectedAddressId ===
                          address.id;

                      return (
                        <button
                          key={address.id}
                          type="button"
                          onClick={() =>
                            handleSavedAddressSelect(
                              address.id
                            )
                          }
                          className={`w-full rounded-lg border p-4 text-left transition ${
                            isSelected
                              ? 'border-[#FF5722] bg-[#FF5722]/10'
                              : 'border-[#333333] bg-[#121212] hover:border-[#555555]'
                          }`}
                        >

                          <div className="flex items-start gap-3">

                            <div
                              className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                                isSelected
                                  ? 'border-[#FF5722]'
                                  : 'border-[#555555]'
                              }`}
                            >
                              {isSelected && (
                                <div className="h-2.5 w-2.5 rounded-full bg-[#FF5722]" />
                              )}
                            </div>

                            <div className="min-w-0">

                              <div className="flex flex-wrap items-center gap-2">

                                <p className="font-bold text-[#F5F5F5]">
                                  {address.label ||
                                    'Address'}
                                </p>

                                {address.isDefault && (
                                  <span className="rounded-full bg-[#22C55E]/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#22C55E]">
                                    Default
                                  </span>
                                )}

                              </div>

                              <p className="mt-1 text-sm font-medium text-[#F5F5F5]">
                                {address.recipientName}
                              </p>

                              <p className="mt-1 text-sm leading-5 text-[#A3A3A3]">
                                {address.addressLine},{' '}
                                {address.city},{' '}
                                {address.state} -{' '}
                                {address.pincode}
                              </p>

                              <p className="mt-1 text-xs text-[#666666]">
                                {address.phone}
                              </p>

                            </div>
                          </div>

                        </button>
                      );
                    }
                  )}

                  {/* New Address Button */}
                  <button
                    type="button"
                    onClick={handleNewAddress}
                    className={`w-full rounded-lg border p-4 text-left transition ${
                      useNewAddress
                        ? 'border-[#FF5722] bg-[#FF5722]/10'
                        : 'border-[#333333] bg-[#121212] hover:border-[#555555]'
                    }`}
                  >

                    <div className="flex items-center gap-3">

                      <div
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                          useNewAddress
                            ? 'border-[#FF5722]'
                            : 'border-[#555555]'
                        }`}
                      >
                        {useNewAddress && (
                          <div className="h-2.5 w-2.5 rounded-full bg-[#FF5722]" />
                        )}
                      </div>

                      <div>
                        <p className="font-bold text-[#F5F5F5]">
                          Deliver to another address
                        </p>

                        <p className="mt-1 text-xs text-[#A3A3A3]">
                          Use a different address for
                          this order.
                        </p>
                      </div>

                    </div>

                  </button>

                </div>
              )}

              {/* New Address Form */}
              {(savedAddresses.length === 0 ||
                useNewAddress) && (
                <div className="mt-6 space-y-5">

                  {savedAddresses.length > 0 && (
                    <div className="border-t border-[#333333] pt-6">
                      <p className="text-sm font-semibold text-[#F5F5F5]">
                        New shipping address
                      </p>
                    </div>
                  )}

                  {/* Name */}
                  <div>
                    <label
                      htmlFor="recipientName"
                      className="mb-2 block text-sm font-medium text-[#F5F5F5]"
                    >
                      Recipient name
                    </label>

                    <input
                      id="recipientName"
                      name="recipientName"
                      type="text"
                      value={
                        shippingAddress.recipientName
                      }
                      onChange={handleAddressChange}
                      placeholder="Full name"
                      className={`w-full rounded-lg border bg-[#121212] px-4 py-3 text-sm text-[#F5F5F5] outline-none transition placeholder:text-[#666666] ${
                        errors.recipientName
                          ? 'border-[#E63946]'
                          : 'border-[#333333] focus:border-[#FF5722]'
                      }`}
                    />

                    {errors.recipientName && (
                      <p className="mt-1 text-xs text-[#E63946]">
                        {errors.recipientName}
                      </p>
                    )}
                  </div>

                  {/* Phone + Pincode */}
                  <div className="grid gap-5 sm:grid-cols-2">

                    <div>
                      <label
                        htmlFor="phone"
                        className="mb-2 block text-sm font-medium text-[#F5F5F5]"
                      >
                        Phone number
                      </label>

                      <input
                        id="phone"
                        name="phone"
                        type="tel"
                        inputMode="numeric"
                        maxLength={10}
                        value={
                          shippingAddress.phone
                        }
                        onChange={handleAddressChange}
                        placeholder="10-digit mobile number"
                        className={`w-full rounded-lg border bg-[#121212] px-4 py-3 text-sm text-[#F5F5F5] outline-none transition placeholder:text-[#666666] ${
                          errors.phone
                            ? 'border-[#E63946]'
                            : 'border-[#333333] focus:border-[#FF5722]'
                        }`}
                      />

                      {errors.phone && (
                        <p className="mt-1 text-xs text-[#E63946]">
                          {errors.phone}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="pincode"
                        className="mb-2 block text-sm font-medium text-[#F5F5F5]"
                      >
                        PIN code
                      </label>

                      <input
                        id="pincode"
                        name="pincode"
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        value={
                          shippingAddress.pincode
                        }
                        onChange={handleAddressChange}
                        placeholder="6-digit PIN code"
                        className={`w-full rounded-lg border bg-[#121212] px-4 py-3 text-sm text-[#F5F5F5] outline-none transition placeholder:text-[#666666] ${
                          errors.pincode
                            ? 'border-[#E63946]'
                            : 'border-[#333333] focus:border-[#FF5722]'
                        }`}
                      />

                      {errors.pincode && (
                        <p className="mt-1 text-xs text-[#E63946]">
                          {errors.pincode}
                        </p>
                      )}
                    </div>

                  </div>

                  {/* Address */}
                  <div>
                    <label
                      htmlFor="addressLine"
                      className="mb-2 block text-sm font-medium text-[#F5F5F5]"
                    >
                      Address
                    </label>

                    <textarea
                      id="addressLine"
                      name="addressLine"
                      rows={3}
                      value={
                        shippingAddress.addressLine
                      }
                      onChange={handleAddressChange}
                      placeholder="House / building, street, area"
                      className={`w-full resize-none rounded-lg border bg-[#121212] px-4 py-3 text-sm text-[#F5F5F5] outline-none transition placeholder:text-[#666666] ${
                        errors.addressLine
                          ? 'border-[#E63946]'
                          : 'border-[#333333] focus:border-[#FF5722]'
                      }`}
                    />

                    {errors.addressLine && (
                      <p className="mt-1 text-xs text-[#E63946]">
                        {errors.addressLine}
                      </p>
                    )}
                  </div>

                  {/* City + State */}
                  <div className="grid gap-5 sm:grid-cols-2">

                    <div>
                      <label
                        htmlFor="city"
                        className="mb-2 block text-sm font-medium text-[#F5F5F5]"
                      >
                        City
                      </label>

                      <input
                        id="city"
                        name="city"
                        type="text"
                        value={
                          shippingAddress.city
                        }
                        onChange={handleAddressChange}
                        placeholder="City"
                        className={`w-full rounded-lg border bg-[#121212] px-4 py-3 text-sm text-[#F5F5F5] outline-none transition placeholder:text-[#666666] ${
                          errors.city
                            ? 'border-[#E63946]'
                            : 'border-[#333333] focus:border-[#FF5722]'
                        }`}
                      />

                      {errors.city && (
                        <p className="mt-1 text-xs text-[#E63946]">
                          {errors.city}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="state"
                        className="mb-2 block text-sm font-medium text-[#F5F5F5]"
                      >
                        State
                      </label>

                      <input
                        id="state"
                        name="state"
                        type="text"
                        value={
                          shippingAddress.state
                        }
                        onChange={handleAddressChange}
                        placeholder="State"
                        className={`w-full rounded-lg border bg-[#121212] px-4 py-3 text-sm text-[#F5F5F5] outline-none transition placeholder:text-[#666666] ${
                          errors.state
                            ? 'border-[#E63946]'
                            : 'border-[#333333] focus:border-[#FF5722]'
                        }`}
                      />

                      {errors.state && (
                        <p className="mt-1 text-xs text-[#E63946]">
                          {errors.state}
                        </p>
                      )}
                    </div>

                  </div>

                </div>
              )}

              {/* Saved address information */}
              {savedAddresses.length > 0 &&
                !useNewAddress && (
                  <div className="mt-6 rounded-lg border border-[#333333] bg-[#121212] px-4 py-3">
                    <p className="text-xs text-[#A3A3A3]">
                      You're using a saved address.
                      To use a different address for
                      this order, select "Deliver to
                      another address".
                    </p>
                  </div>
                )}

            </div>

            {/* Payment */}
            <div className="rounded-xl border border-[#333333] bg-[#1F1F1F] p-6">

              <div className="mb-6">
                <h2 className="text-xl font-bold text-[#F5F5F5]">
                  Payment method
                </h2>

                <p className="mt-1 text-sm text-[#A3A3A3]">
                  Choose how you'd like to pay.
                </p>
              </div>

              <div className="space-y-3">

                {/* COD */}
                <button
                  type="button"
                  onClick={() =>
                    setPaymentMethod('COD')
                  }
                  className={`w-full rounded-lg border p-4 text-left transition ${
                    paymentMethod === 'COD'
                      ? 'border-[#FF5722] bg-[#FF5722]/10'
                      : 'border-[#333333] bg-[#121212] hover:border-[#555555]'
                  }`}
                >

                  <div className="flex items-center gap-3">

                    <div
                      className={`flex h-5 w-5 items-center justify-center rounded-full border ${
                        paymentMethod === 'COD'
                          ? 'border-[#FF5722]'
                          : 'border-[#555555]'
                      }`}
                    >
                      {paymentMethod ===
                        'COD' && (
                        <div className="h-2.5 w-2.5 rounded-full bg-[#FF5722]" />
                      )}
                    </div>

                    <div>
                      <p className="font-bold text-[#F5F5F5]">
                        Cash on Delivery
                      </p>

                      <p className="mt-1 text-xs text-[#A3A3A3]">
                        Pay when your order arrives.
                      </p>
                    </div>

                  </div>

                </button>

                {/* Online Payment */}
                <button
                  type="button"
                  disabled
                  className="w-full cursor-not-allowed rounded-lg border border-[#333333] bg-[#121212] p-4 text-left opacity-50"
                >

                  <div className="flex items-center gap-3">

                    <div className="flex h-5 w-5 items-center justify-center rounded-full border border-[#555555]" />

                    <div>
                      <div className="flex items-center gap-2">

                        <p className="font-bold text-[#F5F5F5]">
                          Online Payment
                        </p>

                        <span className="rounded-full bg-[#2D2D2D] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#A3A3A3]">
                          Coming soon
                        </span>

                      </div>

                      <p className="mt-1 text-xs text-[#A3A3A3]">
                        UPI, cards, and other online
                        payment methods.
                      </p>
                    </div>

                  </div>

                </button>

              </div>

            </div>

            {/* General Error */}
            {errors.general && (
              <div className="rounded-lg border border-[#E63946]/30 bg-[#E63946]/10 px-4 py-3 text-sm text-[#E63946]">
                {errors.general}
              </div>
            )}

          </div>

          {/* Order Summary */}
          <aside className="lg:sticky lg:top-6 lg:self-start">

            <div className="rounded-xl border border-[#333333] bg-[#1F1F1F] p-6">

              <h2 className="text-xl font-bold text-[#F5F5F5]">
                Order summary
              </h2>

              {/* Items */}
              <div className="mt-6 space-y-4">

                {checkoutItems.map((item) => (
                  <div
                    key={`${item.id}-${item.size}`}
                    className="flex gap-3"
                  >

                    <div className="relative h-16 w-14 shrink-0 overflow-hidden rounded-md bg-[#2D2D2D]">

                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-full w-full object-cover"
                      />

                      <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#FF5722] px-1 text-[10px] font-bold text-white">
                        {item.quantity}
                      </span>

                    </div>

                    <div className="min-w-0 flex-1">

                      <p className="truncate text-sm font-semibold text-[#F5F5F5]">
                        {item.name}
                      </p>

                      <p className="mt-1 text-xs text-[#A3A3A3]">
                        Size: {item.size}
                      </p>

                      <p className="mt-1 text-xs text-[#A3A3A3]">
                        ₹
                        {item.price.toLocaleString(
                          'en-IN'
                        )}{' '}
                        each
                      </p>

                    </div>

                    <p className="shrink-0 text-sm font-bold text-[#F5F5F5]">
                      ₹
                      {(
                        item.price *
                        item.quantity
                      ).toLocaleString('en-IN')}
                    </p>

                  </div>
                ))}

              </div>

              {/* Pricing */}
              <div className="mt-6 space-y-4 border-t border-[#333333] pt-5">

                <div className="flex items-center justify-between text-sm">

                  <span className="text-[#A3A3A3]">
                    Subtotal
                  </span>

                  <span className="font-semibold text-[#F5F5F5]">
                    ₹
                    {checkoutSubtotal.toLocaleString(
                      'en-IN'
                    )}
                  </span>

                </div>

                <div className="flex items-center justify-between text-sm">

                  <span className="text-[#A3A3A3]">
                    Shipping
                  </span>

                  <span className="font-semibold text-[#F5F5F5]">
                    {shippingCost === 0
                      ? 'FREE'
                      : `₹${shippingCost}`}
                  </span>

                </div>

                <div className="border-t border-[#333333] pt-4">

                  <div className="flex items-center justify-between">

                    <span className="font-bold text-[#F5F5F5]">
                      Total
                    </span>

                    <span className="text-2xl font-black text-[#F5F5F5]">
                      ₹
                      {total.toLocaleString(
                        'en-IN'
                      )}
                    </span>

                  </div>

                </div>

              </div>

              {/* Free Shipping */}
              {checkoutSubtotal < 2000 && (
                <div className="mt-5 rounded-lg border border-[#FF5722]/20 bg-[#FF5722]/10 p-3">
                  <p className="text-xs leading-5 text-[#A3A3A3]">
                    Add ₹
                    {(
                      2000 - checkoutSubtotal
                    ).toLocaleString('en-IN')}{' '}
                    more to get free shipping.
                  </p>
                </div>
              )}

              {checkoutSubtotal >= 2000 && (
                <div className="mt-5 rounded-lg border border-[#22C55E]/20 bg-[#22C55E]/10 p-3">
                  <p className="text-xs font-medium text-[#22C55E]">
                    🎉 Free shipping applied.
                  </p>
                </div>
              )}

              {/* Place Order */}
              <button
                type="button"
                onClick={handlePlaceOrder}
                disabled={isPlacingOrder}
                className="mt-6 w-full rounded-lg bg-[#FF5722] px-6 py-3.5 text-sm font-bold uppercase tracking-wide text-white transition hover:bg-[#FF7043] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isPlacingOrder
                  ? 'Placing order...'
                  : 'Place order'}
              </button>

              <p className="mt-4 text-center text-xs leading-5 text-[#666666]">
                By placing your order, you confirm
                that the information provided is
                correct.
              </p>

              <Link
                to="/cart"
                className="mt-4 block text-center text-sm font-semibold text-[#A3A3A3] transition hover:text-[#FF5722]"
              >
                ← Back to cart
              </Link>

            </div>

          </aside>

        </div>
      </div>
    </section>
  );
}

export default Checkout;