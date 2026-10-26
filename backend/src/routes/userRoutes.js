
import { Router } from 'express';
import crypto from 'node:crypto';

import User from '../models/User.js';
import { authenticateUser } from '../middleware/authMiddleware.js';

const router = Router();

// GET PROFILE
router.get('/profile', authenticateUser, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');

    if (!user) {
      return res.status(404).json({
        message: 'User not found.',
      });
    }

    return res.status(200).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        addresses: user.addresses,
      },
    });
  } catch (error) {
    console.error('Fetch profile error:', error);

    return res.status(500).json({
      message: 'Unable to fetch profile.',
    });
  }
});

// UPDATE PROFILE
router.put('/profile', authenticateUser, async (req, res) => {
  try {
    const { name, phone } = req.body;
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        message: 'User not found.',
      });
    }

    if (name !== undefined) {
      user.name = name.trim();
    }

    if (phone !== undefined) {
      user.phone = phone.trim();
    }

    await user.save();

    return res.status(200).json({
      message: 'Profile updated successfully.',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        addresses: user.addresses,
      },
    });
  } catch (error) {
    console.error('Profile update error:', error);

    return res.status(500).json({
      message: 'Unable to update profile.',
    });
  }
});

// ADD ADDRESS
router.post('/addresses', authenticateUser, async (req, res) => {
  try {
    const {
      label,
      recipientName,
      phone,
      pincode,
      addressLine,
      city,
      state,
      isDefault,
    } = req.body;

    if (
      !label ||
      !recipientName ||
      !phone ||
      !pincode ||
      !addressLine ||
      !city ||
      !state
    ) {
      return res.status(400).json({
        message: 'All address fields are required.',
      });
    }

    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        message: 'User not found.',
      });
    }

    const newAddress = {
      id: crypto.randomUUID(),
      label,
      recipientName: recipientName.trim(),
      phone: phone.trim(),
      pincode: pincode.trim(),
      addressLine: addressLine.trim(),
      city: city.trim(),
      state: state.trim(),
      isDefault: Boolean(isDefault),
    };

    if (newAddress.isDefault || user.addresses.length === 0) {
      user.addresses.forEach((address) => {
        address.isDefault = false;
      });

      newAddress.isDefault = true;
    }

    user.addresses.push(newAddress);
    await user.save();

    return res.status(201).json({
      message: 'Address added successfully.',
      address: newAddress,
    });
  } catch (error) {
    console.error('Add address error:', error);

    return res.status(500).json({
      message: 'Unable to add address.',
    });
  }
});

// UPDATE ADDRESS
router.put('/addresses/:addressId', authenticateUser, async (req, res) => {
  try {
    const { addressId } = req.params;
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        message: 'User not found.',
      });
    }

    const address = user.addresses.find(
      (item) => item.id === addressId
    );

    if (!address) {
      return res.status(404).json({
        message: 'Address not found.',
      });
    }

    const {
      label,
      recipientName,
      phone,
      pincode,
      addressLine,
      city,
      state,
      isDefault,
    } = req.body;

    if (label !== undefined) address.label = label;
    if (recipientName !== undefined) address.recipientName = recipientName.trim();
    if (phone !== undefined) address.phone = phone.trim();
    if (pincode !== undefined) address.pincode = pincode.trim();
    if (addressLine !== undefined) address.addressLine = addressLine.trim();
    if (city !== undefined) address.city = city.trim();
    if (state !== undefined) address.state = state.trim();

    if (isDefault === true) {
      user.addresses.forEach((item) => {
        item.isDefault = false;
      });

      address.isDefault = true;
    }

    await user.save();

    return res.status(200).json({
      message: 'Address updated successfully.',
      address,
    });
  } catch (error) {
    console.error('Update address error:', error);

    return res.status(500).json({
      message: 'Unable to update address.',
    });
  }
});

// DELETE ADDRESS
router.delete('/addresses/:addressId', authenticateUser, async (req, res) => {
  try {
    const { addressId } = req.params;
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        message: 'User not found.',
      });
    }

    const addressIndex = user.addresses.findIndex(
      (item) => item.id === addressId
    );

    if (addressIndex === -1) {
      return res.status(404).json({
        message: 'Address not found.',
      });
    }

    const wasDefault = user.addresses[addressIndex].isDefault;

    user.addresses.splice(addressIndex, 1);

    if (wasDefault && user.addresses.length > 0) {
      user.addresses[0].isDefault = true;
    }

    await user.save();

    return res.status(200).json({
      message: 'Address deleted successfully.',
      addresses: user.addresses,
    });
  } catch (error) {
    console.error('Delete address error:', error);

    return res.status(500).json({
      message: 'Unable to delete address.',
    });
  }
});

export default router;
