'use client';

import { useState, useRef, useEffect } from 'react';
import { MapPin, AlertCircle } from 'lucide-react';

interface ActivityFormProps {
  onSuccess?: () => void;
}

export function ActivityForm({ onSuccess }: ActivityFormProps) {
  const [type, setType] = useState<'MEETING' | 'SALES' | 'DISTRIBUTION'>('MEETING');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Meeting fields
  const [attendeeName, setAttendeeName] = useState('');
  const [category, setCategory] = useState<'FARMER' | 'SELLER' | 'INFLUENCER'>('FARMER');
  const [duration, setDuration] = useState('');
  const [notes, setNotes] = useState('');

  // Sale fields
  const [productName, setProductName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('kg');
  const [amount, setAmount] = useState('');
  const [buyerName, setBuyerName] = useState('');

  // Distribution fields
  const [distributedTo, setDistributedTo] = useState('');

  const mapRef = useRef<any>(null);

  // Get current location
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
        payload.meeting = {
          attendeeName,
          category,
          duration: duration ? parseInt(duration) : null,
          notes,
        };
      } else if (type === 'SALES') {
        payload.sale = {
          productName,
          quantity: parseFloat(quantity),
          unit,
          amount: parseFloat(amount),
          buyerName,
          notes,
        };
      } else if (type === 'DISTRIBUTION') {
        payload.distribution = {
          productName,
          quantity: parseFloat(quantity),
          unit,
          distributedTo,
          notes,
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
      // Reset form
      setTitle('');
      setDescription('');
      setLatitude('');
      setLongitude('');
      setAttendeeName('');
      setCategory('FARMER');
      setDuration('');
      setNotes('');
      setProductName('');
      setQuantity('');
      setAmount('');
      setBuyerName('');
      setDistributedTo('');

      onSuccess?.();
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to create activity');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
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

      {/* Activity Type */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Activity Type
        </label>
        <div className="grid grid-cols-3 gap-3">
          {['MEETING', 'SALES', 'DISTRIBUTION'].map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setType(t as any)}
              className={`p-4 rounded-lg border-2 font-medium transition ${
                type === t
                  ? 'border-green-600 bg-green-50 text-green-700'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Common Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Title *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
            placeholder="e.g., Farmer John Meeting"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
            placeholder="Optional description"
          />
        </div>
      </div>

      {/* Location Fields */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <MapPin className="w-4 h-4" /> Location
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Latitude
            </label>
            <input
              type="number"
              value={latitude}
              onChange={(e) => setLatitude(e.target.value)}
              step="0.00001"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
              placeholder="e.g., 28.7041"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Longitude
            </label>
            <input
              type="number"
              value={longitude}
              onChange={(e) => setLongitude(e.target.value)}
              step="0.00001"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
              placeholder="e.g., 77.1025"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={getCurrentLocation}
          className="px-4 py-2 bg-blue-100 text-blue-700 font-medium rounded-lg hover:bg-blue-200 transition"
        >
          📍 Use Current Location
        </button>
      </div>

      {/* Type-Specific Fields */}
      {type === 'MEETING' && (
        <div className="space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-gray-800">Meeting Details</h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Attendee Name *
            </label>
            <input
              type="text"
              value={attendeeName}
              onChange={(e) => setAttendeeName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
              placeholder="Name of person met"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category *
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as any)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
            >
              <option value="FARMER">Farmer</option>
              <option value="SELLER">Seller</option>
              <option value="INFLUENCER">Influencer</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Duration (minutes)
            </label>
            <input
              type="number"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
              placeholder="e.g., 30"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
              placeholder="Additional notes about the meeting"
            />
          </div>
        </div>
      )}

      {type === 'SALES' && (
        <div className="space-y-4 p-4 bg-green-50 rounded-lg border border-green-200">
          <h3 className="font-semibold text-gray-800">Sales Details</h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Product Name *
            </label>
            <input
              type="text"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
              placeholder="e.g., Organic Tomatoes"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quantity *
              </label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                step="0.01"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                placeholder="e.g., 50"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Unit *
              </label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
              >
                <option value="kg">kg</option>
                <option value="liter">liter</option>
                <option value="unit">unit</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Amount (₹) *
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              step="0.01"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
              placeholder="e.g., 5000"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Buyer Name *
            </label>
            <input
              type="text"
              value={buyerName}
              onChange={(e) => setBuyerName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
              placeholder="Name of buyer"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
              placeholder="Additional notes about the sale"
            />
          </div>
        </div>
      )}

      {type === 'DISTRIBUTION' && (
        <div className="space-y-4 p-4 bg-orange-50 rounded-lg border border-orange-200">
          <h3 className="font-semibold text-gray-800">Distribution Details</h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Product Name *
            </label>
            <input
              type="text"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
              placeholder="e.g., Fertilizer"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quantity *
              </label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                step="0.01"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                placeholder="e.g., 100"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Unit *
              </label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
              >
                <option value="kg">kg</option>
                <option value="liter">liter</option>
                <option value="unit">unit</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Distributed To *
            </label>
            <input
              type="text"
              value={distributedTo}
              onChange={(e) => setDistributedTo(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
              placeholder="Name or location"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
              placeholder="Additional notes about the distribution"
            />
          </div>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded-lg transition duration-200"
      >
        {loading ? 'Logging Activity...' : '📝 Log Activity'}
      </button>
    </form>
  );
}
