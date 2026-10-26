import { useState } from 'react';
import { useNavigate } from 'react-router';

import { useAuth } from '../../context/AuthContext';

const emptyAddress = {
  label: 'Home',
  recipientName: '',
  phone: '',
  addressLine: '',
  city: '',
  state: '',
  pincode: '',
};

function Profile() {
  const navigate = useNavigate();

  const {
    user,
    logout,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
    updateAccount,
  } = useAuth();

  const [editingAddressId, setEditingAddressId] =
    useState(null);

  const [showAddressForm, setShowAddressForm] =
    useState(false);

  const [addressForm, setAddressForm] =
    useState(emptyAddress);

  const [phone, setPhone] = useState(user?.phone || '');

  const [message, setMessage] = useState('');

  if (!user) {
    return (
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-lg rounded-2xl border border-[#333333] bg-[#1F1F1F] p-8 text-center">
          <h1 className="text-2xl font-bold text-[#F5F5F5]">
            You are not signed in
          </h1>

          <p className="mt-3 text-sm text-[#A3A3A3]">
            Sign in to view your profile.
          </p>

          <button
            type="button"
            onClick={() => navigate('/login')}
            className="mt-6 rounded-lg bg-[#FF5722] px-6 py-3 text-sm font-bold uppercase tracking-wide text-white transition hover:bg-[#FF7043]"
          >
            Sign in
          </button>
        </div>
      </section>
    );
  }

  const handlePhoneSave = () => {
    const cleanedPhone = phone.trim();

    if (
      cleanedPhone &&
      !/^[6-9]\d{9}$/.test(cleanedPhone)
    ) {
      setMessage('Please enter a valid 10-digit phone number.');
      return;
    }

    updateAccount({
      phone: cleanedPhone,
    });

    setMessage('Personal information saved.');

    setTimeout(() => {
      setMessage('');
    }, 2500);
  };

  const handleAddressChange = (event) => {
    const { name, value } = event.target;

    setAddressForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleAddressSubmit = (event) => {
    event.preventDefault();

    if (
      !addressForm.label.trim() ||
      !addressForm.recipientName.trim() ||
      !addressForm.phone.trim() ||
      !addressForm.addressLine.trim() ||
      !addressForm.city.trim() ||
      !addressForm.state.trim() ||
      !addressForm.pincode.trim()
    ) {
      setMessage('Please fill in all address fields.');
      return;
    }

    if (!/^[6-9]\d{9}$/.test(addressForm.phone)) {
      setMessage('Please enter a valid 10-digit phone number.');
      return;
    }

    if (!/^\d{6}$/.test(addressForm.pincode)) {
      setMessage('Please enter a valid 6-digit pincode.');
      return;
    }

    if (editingAddressId) {
      updateAddress(
        editingAddressId,
        addressForm
      );

      setMessage('Address updated successfully.');
    } else {
      addAddress(addressForm);

      setMessage('Address added successfully.');
    }

    setAddressForm(emptyAddress);
    setEditingAddressId(null);
    setShowAddressForm(false);

    setTimeout(() => {
      setMessage('');
    }, 2500);
  };

  const handleEditAddress = (address) => {
    setAddressForm({
      label: address.label,
      recipientName: address.recipientName,
      phone: address.phone,
      addressLine: address.addressLine,
      city: address.city,
      state: address.state,
      pincode: address.pincode,
    });

    setEditingAddressId(address.id);
    setShowAddressForm(true);

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const handleDeleteAddress = (addressId) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this address?'
    );

    if (!confirmed) {
      return;
    }

    deleteAddress(addressId);

    setMessage('Address deleted.');

    setTimeout(() => {
      setMessage('');
    }, 2500);
  };

  const handleSetDefault = (addressId) => {
    setDefaultAddress(addressId);

    setMessage('Default address updated.');

    setTimeout(() => {
      setMessage('');
    }, 2500);
  };

  const handleCancelAddress = () => {
    setAddressForm(emptyAddress);
    setEditingAddressId(null);
    setShowAddressForm(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-10">
        <p className="text-sm font-semibold uppercase tracking-widest text-[#FF5722]">
          Account
        </p>

        <h1 className="mt-2 text-3xl font-black text-[#F5F5F5] sm:text-4xl">
          My Profile
        </h1>

        <p className="mt-3 text-[#A3A3A3]">
          Manage your personal information and delivery
          addresses.
        </p>
      </div>

      {message && (
        <div className="mb-6 rounded-lg border border-[#22C55E]/30 bg-[#22C55E]/10 px-4 py-3 text-sm text-[#22C55E]">
          {message}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Personal information */}
        <div className="rounded-2xl border border-[#333333] bg-[#1F1F1F] p-6 lg:col-span-2">
          <div className="flex items-center gap-5">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-[#FF5722] text-2xl font-black text-white">
              {user.name.charAt(0).toUpperCase()}
            </div>

            <div>
              <h2 className="text-2xl font-bold text-[#F5F5F5]">
                {user.name}
              </h2>

              <p className="mt-1 text-[#A3A3A3]">
                {user.email}
              </p>
            </div>
          </div>

          <div className="mt-8 border-t border-[#333333] pt-6">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[#F5F5F5]">
              Personal information
            </h3>

            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <div>
                <p className="text-xs uppercase tracking-wider text-[#666666]">
                  Full name
                </p>

                <p className="mt-1 text-sm text-[#F5F5F5]">
                  {user.name}
                </p>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wider text-[#666666]">
                  Email address
                </p>

                <p className="mt-1 text-sm text-[#F5F5F5]">
                  {user.email}
                </p>
              </div>
            </div>

            <div className="mt-6">
              <label
                htmlFor="profile-phone"
                className="mb-2 block text-xs uppercase tracking-wider text-[#666666]"
              >
                Phone number
              </label>

              <div className="flex flex-col gap-3 sm:flex-row">
                <input
                  id="profile-phone"
                  type="tel"
                  value={phone}
                  onChange={(event) =>
                    setPhone(event.target.value)
                  }
                  placeholder="10-digit phone number"
                  className="w-full rounded-lg border border-[#333333] bg-[#121212] px-4 py-3 text-sm text-[#F5F5F5] outline-none transition placeholder:text-[#666666] focus:border-[#FF5722]"
                />

                <button
                  type="button"
                  onClick={handlePhoneSave}
                  className="rounded-lg bg-[#FF5722] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#FF7043]"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Quick actions */}
        <div className="rounded-2xl border border-[#333333] bg-[#1F1F1F] p-6">
          <h2 className="text-lg font-bold text-[#F5F5F5]">
            Quick actions
          </h2>

          <div className="mt-5 space-y-3">
            <button
              type="button"
              onClick={() => navigate('/orders')}
              className="w-full rounded-lg border border-[#333333] px-4 py-3 text-left text-sm font-medium text-[#F5F5F5] transition hover:border-[#FF5722] hover:text-[#FF5722]"
            >
              View my orders
            </button>

            <button
              type="button"
              onClick={() => navigate('/cart')}
              className="w-full rounded-lg border border-[#333333] px-4 py-3 text-left text-sm font-medium text-[#F5F5F5] transition hover:border-[#FF5722] hover:text-[#FF5722]"
            >
              View my cart
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="w-full rounded-lg border border-[#E63946]/40 px-4 py-3 text-left text-sm font-medium text-[#E63946] transition hover:border-[#E63946] hover:bg-[#E63946]/10"
            >
              Log out
            </button>
          </div>
        </div>
      </div>

      {/* Saved addresses */}
      <div className="mt-8 rounded-2xl border border-[#333333] bg-[#1F1F1F] p-6 sm:p-8">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-2xl font-bold text-[#F5F5F5]">
              Saved addresses
            </h2>

            <p className="mt-1 text-sm text-[#A3A3A3]">
              Save addresses for faster checkout.
            </p>
          </div>

          {!showAddressForm && (
            <button
              type="button"
              onClick={() => {
                setAddressForm(emptyAddress);
                setEditingAddressId(null);
                setShowAddressForm(true);
              }}
              className="rounded-lg bg-[#FF5722] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#FF7043]"
            >
              + Add address
            </button>
          )}
        </div>

        {/* Address form */}
        {showAddressForm && (
          <form
            onSubmit={handleAddressSubmit}
            className="mt-8 rounded-xl border border-[#333333] bg-[#121212] p-5 sm:p-6"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-[#F5F5F5]">
                {editingAddressId
                  ? 'Edit address'
                  : 'Add new address'}
              </h3>

              <button
                type="button"
                onClick={handleCancelAddress}
                className="text-sm text-[#A3A3A3] transition hover:text-[#F5F5F5]"
              >
                Cancel
              </button>
            </div>

            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="label"
                  className="mb-2 block text-sm text-[#A3A3A3]"
                >
                  Address label
                </label>

                <select
                  id="label"
                  name="label"
                  value={addressForm.label}
                  onChange={handleAddressChange}
                  className="w-full rounded-lg border border-[#333333] bg-[#1F1F1F] px-4 py-3 text-sm text-[#F5F5F5] outline-none focus:border-[#FF5722]"
                >
                  <option value="Home">Home</option>
                  <option value="College">College</option>
                  <option value="Work">Work</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="recipientName"
                  className="mb-2 block text-sm text-[#A3A3A3]"
                >
                  Recipient name
                </label>

                <input
                  id="recipientName"
                  name="recipientName"
                  value={addressForm.recipientName}
                  onChange={handleAddressChange}
                  placeholder="Full name"
                  className="w-full rounded-lg border border-[#333333] bg-[#1F1F1F] px-4 py-3 text-sm text-[#F5F5F5] outline-none placeholder:text-[#666666] focus:border-[#FF5722]"
                />
              </div>

              <div>
                <label
                  htmlFor="addressPhone"
                  className="mb-2 block text-sm text-[#A3A3A3]"
                >
                  Phone number
                </label>

                <input
                  id="addressPhone"
                  name="phone"
                  type="tel"
                  value={addressForm.phone}
                  onChange={handleAddressChange}
                  placeholder="10-digit phone number"
                  className="w-full rounded-lg border border-[#333333] bg-[#1F1F1F] px-4 py-3 text-sm text-[#F5F5F5] outline-none placeholder:text-[#666666] focus:border-[#FF5722]"
                />
              </div>

              <div>
                <label
                  htmlFor="pincode"
                  className="mb-2 block text-sm text-[#A3A3A3]"
                >
                  Pincode
                </label>

                <input
                  id="pincode"
                  name="pincode"
                  value={addressForm.pincode}
                  onChange={handleAddressChange}
                  placeholder="6-digit pincode"
                  maxLength={6}
                  className="w-full rounded-lg border border-[#333333] bg-[#1F1F1F] px-4 py-3 text-sm text-[#F5F5F5] outline-none placeholder:text-[#666666] focus:border-[#FF5722]"
                />
              </div>

              <div className="sm:col-span-2">
                <label
                  htmlFor="addressLine"
                  className="mb-2 block text-sm text-[#A3A3A3]"
                >
                  Address
                </label>

                <textarea
                  id="addressLine"
                  name="addressLine"
                  value={addressForm.addressLine}
                  onChange={handleAddressChange}
                  placeholder="House number, street, area..."
                  rows={3}
                  className="w-full resize-none rounded-lg border border-[#333333] bg-[#1F1F1F] px-4 py-3 text-sm text-[#F5F5F5] outline-none placeholder:text-[#666666] focus:border-[#FF5722]"
                />
              </div>

              <div>
                <label
                  htmlFor="city"
                  className="mb-2 block text-sm text-[#A3A3A3]"
                >
                  City
                </label>

                <input
                  id="city"
                  name="city"
                  value={addressForm.city}
                  onChange={handleAddressChange}
                  placeholder="City"
                  className="w-full rounded-lg border border-[#333333] bg-[#1F1F1F] px-4 py-3 text-sm text-[#F5F5F5] outline-none placeholder:text-[#666666] focus:border-[#FF5722]"
                />
              </div>

              <div>
                <label
                  htmlFor="state"
                  className="mb-2 block text-sm text-[#A3A3A3]"
                >
                  State
                </label>

                <input
                  id="state"
                  name="state"
                  value={addressForm.state}
                  onChange={handleAddressChange}
                  placeholder="State"
                  className="w-full rounded-lg border border-[#333333] bg-[#1F1F1F] px-4 py-3 text-sm text-[#F5F5F5] outline-none placeholder:text-[#666666] focus:border-[#FF5722]"
                />
              </div>
            </div>

            <button
              type="submit"
              className="mt-6 rounded-lg bg-[#FF5722] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#FF7043]"
            >
              {editingAddressId
                ? 'Update address'
                : 'Save address'}
            </button>
          </form>
        )}

        {/* Address list */}
        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {user.addresses.length === 0 ? (
            <div className="rounded-xl border border-dashed border-[#333333] px-6 py-12 text-center md:col-span-2">
              <p className="text-[#F5F5F5]">
                You don't have any saved addresses yet.
              </p>

              <p className="mt-2 text-sm text-[#A3A3A3]">
                Add one to make checkout faster.
              </p>
            </div>
          ) : (
            user.addresses.map((address) => (
              <div
                key={address.id}
                className="rounded-xl border border-[#333333] bg-[#121212] p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-bold text-[#F5F5F5]">
                        {address.label}
                      </h3>

                      {address.isDefault && (
                        <span className="rounded-full bg-[#FF5722]/15 px-2.5 py-1 text-xs font-semibold text-[#FF5722]">
                          Default
                        </span>
                      )}
                    </div>

                    <p className="mt-4 text-sm font-medium text-[#F5F5F5]">
                      {address.recipientName}
                    </p>

                    <p className="mt-1 text-sm leading-6 text-[#A3A3A3]">
                      {address.addressLine}
                      <br />
                      {address.city}, {address.state}
                      <br />
                      {address.pincode}
                    </p>

                    <p className="mt-3 text-sm text-[#A3A3A3]">
                      {address.phone}
                    </p>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-3 border-t border-[#333333] pt-4">
                  <button
                    type="button"
                    onClick={() =>
                      handleEditAddress(address)
                    }
                    className="text-sm font-medium text-[#A3A3A3] transition hover:text-[#FF5722]"
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleDeleteAddress(address.id)
                    }
                    className="text-sm font-medium text-[#A3A3A3] transition hover:text-[#E63946]"
                  >
                    Delete
                  </button>

                  {!address.isDefault && (
                    <button
                      type="button"
                      onClick={() =>
                        handleSetDefault(address.id)
                      }
                      className="text-sm font-medium text-[#FF5722] transition hover:text-[#FF7043]"
                    >
                      Set as default
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}

export default Profile;