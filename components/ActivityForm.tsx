'use client';

import { useState } from 'react';
import { MapPin, AlertCircle, Phone, Mail, TrendingUp, Users } from 'lucide-react';

interface ActivityFormProps {
  onSuccess?: () => void;
}

export function ActivityForm({ onSuccess }: ActivityFormProps) {
  const [type, setType] = useState<'MEETING' | 'SALES' | 'DISTRIBUTION'>('MEETING');
  const [meetingType, setMeetingType] = useState<'INDIVIDUAL' | 'GROUP'>('INDIVIDUAL');
  
  // Common fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Meeting fields - Individual
  const [attendeeName, setAttendeeName] = useState('');
  const [category, setCategory] = useState<'FARMER' | 'SELLER' | 'INFLUENCER'>('FARMER');
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [businessPotential, setBusinessPotential] = useState('');
  const [duration, setDuration] = useState('');
  const [notes, setNotes] = useState('');

  // Meeting fields - Group
  const [groupVillage, setGroupVillage] = useState('');
  const [groupSize, setGroupSize] = useState('');
  const [groupMeetingType, setGroupMeetingType] = useState('Training');

  // Sale fields
  const [productName, setProductName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('kg');
  const [amount, setAmount] = useState('');
  const [buyerName, setBuyerName] = useState('');
  const [saleMode, setSaleMode] = useState('DIRECT');
  const [isRepeatOrder, setIsRepeatOrder] = useState(false);

  // Distribution fields
  const [distProductName, setDistProductName] = useState('');
  const [distQuantity, setDistQuantity] = useState('');
  const [distUnit, setDistUnit] = useState('kg');
  const [distributedTo, setDistributedTo] = useState('');
  const [distNotes, setDistNotes] = useState('');

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLatitude(position.coords.latitude.toString());
          setLongitude(position.coords.longitude.toString());
          setError('');
        },
        (error) => {
          setError('Unable to get current location');
          console.error(error);
        }
      );
    } else {
      setError('Geolocation not supported');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      let payload: any = {
        type,
        title,
        description,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
      };

      if (type === 'MEETING') {
        if (meetingType === 'INDIVIDUAL') {
          payload.meeting = {
            attendeeName,
            category,
            contactPhone: contactPhone || null,
            contactEmail: contactEmail || null,
            businessPotential: businessPotential || null,
            duration: duration ? parseInt(duration) : null,
            notes,
            isGroupMeeting: false,
          };
        } else {
          payload.meeting = {
            attendeeName: groupVillage,
            category: 'FARMER',
            groupSize: groupSize ? parseInt(groupSize) : null,
            meetingType: groupMeetingType,
            notes,
            isGroupMeeting: true,
          };
        }
      } else if (type === 'SALES') {
        payload.sale = {
          productName,
          quantity: parseFloat(quantity),
          unit,
          amount: parseFloat(amount),
          buyerName,
          saleMode,
          isRepeatOrder,
          notes,
        };
      } else if (type === 'DISTRIBUTION') {
        payload.distribution = {
          productName: distProductName,
          quantity: parseFloat(distQuantity),
          unit: distUnit,
          distributedTo,
          notes: distNotes,
        };
      }

      const response = await fetch('/api/activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Failed to create activity');
      }

      setSuccess(true);
      resetForm();
      onSuccess?.();
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to create activity');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setLatitude('');
    setLongitude('');
    setAttendeeName('');
    setCategory('FARMER');
    setContactPhone('');
    setContactEmail('');
    setBusinessPotential('');
    setDuration('');
    setNotes('');
    setGroupVillage('');
    setGroupSize('');
    setProductName('');
    setQuantity('');
    setAmount('');
    setBuyerName('');
    setSaleMode('DIRECT');
    setIsRepeatOrder(false);
    setDistProductName('');
    setDistQuantity('');
    setDistributedTo('');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Success Message */}
      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-700 font-medium">✓ Activity logged successfully!</p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Activity Type Selection */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <label className="block text-sm font-semibold text-gray-700 mb-3">Activity Type</label>
        <div className="flex gap-4">
          {['MEETING', 'SALES', 'DISTRIBUTION'].map((t) => (
            <label key={t} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                value={t}
                checked={type === t}
                onChange={(e) => setType(e.target.value as any)}
                className="w-4 h-4 text-green-600"
              />
              <span className="text-sm font-medium text-gray-700">{t}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Common Fields */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Activity title"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Additional details..."
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Location */}
      <div className="bg-blue-50 p-4 rounded-lg space-y-3">
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-blue-600" />
          <span className="font-medium text-gray-700">Location</span>
        </div>
        <button
          type="button"
          onClick={getCurrentLocation}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition"
        >
          📍 Get Current Location
        </button>
        <div className="grid grid-cols-2 gap-3">
          <input
            type="number"
            value={latitude}
            onChange={(e) => setLatitude(e.target.value)}
            placeholder="Latitude"
            step="0.0001"
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="number"
            value={longitude}
            onChange={(e) => setLongitude(e.target.value)}
            placeholder="Longitude"
            step="0.0001"
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Meeting Type Selection */}
      {type === 'MEETING' && (
        <div className="bg-purple-50 p-4 rounded-lg">
          <label className="block text-sm font-semibold text-gray-700 mb-3">Meeting Type</label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                value="INDIVIDUAL"
                checked={meetingType === 'INDIVIDUAL'}
                onChange={(e) => setMeetingType(e.target.value as any)}
                className="w-4 h-4 text-purple-600"
              />
              <span className="text-sm font-medium text-gray-700">Individual Meeting</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                value="GROUP"
                checked={meetingType === 'GROUP'}
                onChange={(e) => setMeetingType(e.target.value as any)}
                className="w-4 h-4 text-purple-600"
              />
              <span className="text-sm font-medium text-gray-700">Group Meeting</span>
            </label>
          </div>
        </div>
      )}

      {/* Meeting Fields - Individual */}
      {type === 'MEETING' && meetingType === 'INDIVIDUAL' && (
        <div className="space-y-4 bg-purple-50 p-4 rounded-lg">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name of Person</label>
            <input
              type="text"
              value={attendeeName}
              onChange={(e) => setAttendeeName(e.target.value)}
              placeholder="Full name"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            >
              <option value="FARMER">Farmer</option>
              <option value="SELLER">Seller</option>
              <option value="INFLUENCER">Influencer</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 bg-white p-3 rounded-lg border border-gray-300">
              <Phone className="w-4 h-4 text-gray-500" />
              <input
                type="tel"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="Phone"
                className="flex-1 outline-none"
              />
            </div>
            <div className="flex items-center gap-2 bg-white p-3 rounded-lg border border-gray-300">
              <Mail className="w-4 h-4 text-gray-500" />
              <input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="Email"
                className="flex-1 outline-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 bg-white p-3 rounded-lg border border-gray-300">
            <TrendingUp className="w-4 h-4 text-green-600" />
            <input
              type="text"
              value={businessPotential}
              onChange={(e) => setBusinessPotential(e.target.value)}
              placeholder="Business potential (e.g., 5-10 kg, 200 kg, High)"
              className="flex-1 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes)</label>
            <input
              type="number"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="Meeting duration"
              min="1"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Meeting notes..."
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>
      )}

      {/* Meeting Fields - Group */}
      {type === 'MEETING' && meetingType === 'GROUP' && (
        <div className="space-y-4 bg-purple-50 p-4 rounded-lg">
          <div className="flex items-center gap-2 text-sm text-gray-700 mb-4">
            <Users className="w-4 h-4" />
            <span>Farmer Group Meeting Details</span>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Village / Location</label>
            <input
              type="text"
              value={groupVillage}
              onChange={(e) => setGroupVillage(e.target.value)}
              placeholder="Village or location name"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Number of Attendees</label>
              <input
                type="number"
                value={groupSize}
                onChange={(e) => setGroupSize(e.target.value)}
                placeholder="Number of people"
                min="1"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Meeting Type</label>
              <select
                value={groupMeetingType}
                onChange={(e) => setGroupMeetingType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                <option>Training</option>
                <option>Demo</option>
                <option>Feedback</option>
                <option>Promotion</option>
                <option>Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Meeting notes, photos taken, etc..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>
      )}

      {/* Sales Fields */}
      {type === 'SALES' && (
        <div className="space-y-4 bg-green-50 p-4 rounded-lg">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
            <input
              type="text"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="Product SKU or name"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="Qty"
                step="0.1"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              >
                <option value="kg">kg</option>
                <option value="liter">liter</option>
                <option value="unit">unit</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹)</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Amount"
                step="0.01"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Buyer Name</label>
            <input
              type="text"
              value={buyerName}
              onChange={(e) => setBuyerName(e.target.value)}
              placeholder="Name of buyer"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sale Mode</label>
              <select
                value={saleMode}
                onChange={(e) => setSaleMode(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              >
                <option value="DIRECT">Direct (B2C)</option>
                <option value="VIA_DISTRIBUTOR">Via Distributor (B2B)</option>
              </select>
            </div>

            <label className="flex items-center gap-2 cursor-pointer bg-white p-3 rounded-lg border border-gray-300">
              <input
                type="checkbox"
                checked={isRepeatOrder}
                onChange={(e) => setIsRepeatOrder(e.target.checked)}
                className="w-4 h-4 text-green-600"
              />
              <span className="text-sm font-medium text-gray-700">Repeat Order</span>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Sale details..."
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>
      )}

      {/* Distribution Fields */}
      {type === 'DISTRIBUTION' && (
        <div className="space-y-4 bg-orange-50 p-4 rounded-lg">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
            <input
              type="text"
              value={distProductName}
              onChange={(e) => setDistProductName(e.target.value)}
              placeholder="Product SKU or name"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
              <input
                type="number"
                value={distQuantity}
                onChange={(e) => setDistQuantity(e.target.value)}
                placeholder="Qty"
                step="0.1"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
              <select
                value={distUnit}
                onChange={(e) => setDistUnit(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              >
                <option value="kg">kg</option>
                <option value="liter">liter</option>
                <option value="unit">unit</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Distributed To</label>
            <input
              type="text"
              value={distributedTo}
              onChange={(e) => setDistributedTo(e.target.value)}
              placeholder="Farmer / Seller / Person name"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              value={distNotes}
              onChange={(e) => setDistNotes(e.target.value)}
              placeholder="Distribution details..."
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
            />
          </div>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:from-gray-400 disabled:to-gray-400 text-white font-semibold py-3 px-4 rounded-lg transition flex items-center justify-center gap-2"
      >
        {loading ? 'Saving...' : '✓ Log Activity'}
      </button>
    </form>
  );
}
