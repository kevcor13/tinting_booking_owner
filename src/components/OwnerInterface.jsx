import React, { useState, useEffect } from 'react';
import './OwnerInterface.css'; // Add this import for the CSS

function OwnerInterface() {
  const [availableSlots, setAvailableSlots] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [clientLink, setClientLink] = useState('');

  const API_ENDPOINT = 'https://script.google.com/macros/s/AKfycbzGlIbr7tsxIXNqHWVpH3Jfr-HeGUB5FgtBzcmZZQc36yYCBP_WBPxbHs92NlFY3hJZ/exec';

  // Format date to "Month Name, Day of Week, Year" (e.g., "March 21, Thursday, 2025")
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const options = {
      month: 'long',
      day: 'numeric',
      weekday: 'long',
    };
    return date.toLocaleDateString('en-US', options);
  };

  // Load existing slots when component mounts
  useEffect(() => {
    fetchSlots();
    // The client link will now likely point to a similar client-side React app
    // that also uses the same Google Apps Script API_ENDPOINT, but tailored for clients.
    // For now, let's just make it a placeholder or point to your deployed client app.
    // If your client app needs the API_ENDPOINT as a parameter, you'd pass it here.
    setClientLink(`https://your-client-app.vercel.app/?api=${encodeURIComponent(API_ENDPOINT)}`);
  }, []);

  // Fetch slots from Google Apps Script
const fetchSlots = async () => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      const response = await fetch(API_ENDPOINT); // Standard GET request
      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.statusText}`);
      }
      const data = await response.json();
      // Assuming the script returns an array of objects
      const available = data.filter(slot => slot.status === 'Available');
      setAvailableSlots(available);
    } catch (error) {
      setErrorMessage('Error loading slots: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Add new time slot
  const handleAddSlot = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const date = e.target.date.value;
    const time = e.target.time.value;
    const slotId = `slot_${Date.now()}`; // Unique ID generation

    const newSlot = {
      id: slotId,
      date: date,
      time: time,
      status: 'Available',
      client_name: '',
      client_email: '',
      booking_date: '',
    };

    try {
      const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          action: 'add',      // <-- Specify the 'add' action
          payload: newSlot    // <-- Send the slot data in the payload
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add slot');
      }

      // Re-fetch all slots to ensure local state is in sync with the sheet
      // This is safer than just appending, as the script might have its own logic
      await fetchSlots();
      setSuccessMessage('Slot added successfully! Client page automatically updated.');
      setTimeout(() => setSuccessMessage(''), 3000);
      e.target.reset();
    } catch (error) {
      setErrorMessage('Error adding slot: ' + error.message);
      setTimeout(() => setErrorMessage(''), 5000);
    } finally {
      setIsLoading(false);
    }
  };

  // Delete a time slot
  const handleDeleteSlot = async (slotId) => {
    if (!window.confirm('Are you sure you want to delete this time slot?')) {
      return;
    }

    setIsLoading(true);
    try {
      // Send the ID as a URL parameter for DELETE request
      const response = await fetch(API_ENDPOINT, {
        method: 'POST', // <-- Use POST, not DELETE
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          action: 'delete',          // <-- Specify the 'delete' action
          payload: { id: slotId }    // <-- Send the ID in the payload
        }),
      });


      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete slot');
      }

      // Update the local state after successful deletion
      setAvailableSlots(availableSlots.filter(slot => slot.id !== slotId));
      setSuccessMessage('Slot deleted successfully! Client page automatically updated.');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      setErrorMessage('Error deleting slot: ' + error.message);
      setTimeout(() => setErrorMessage(''), 5000);
    } finally {
      setIsLoading(false);
    }
  };

  // Format time to 12-hour format with AM/PM
  const formatTime = (timeString) => {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${minutes} ${ampm}`;
  };

  return (
    <div className="container">
      <h1 className="title">Enter dates that you are available</h1>

      {/* Add Time Slot Form */}
      <form onSubmit={handleAddSlot} className="section">
        <div className="form-group">
          <label className="label">Date</label>
          <input
            type="date"
            name="date"
            className="input"
            required
          />
        </div>

        <div className="form-group">
          <label className="label">Time</label>
          <input
            type="time"
            name="time"
            className="input"
            required
          />
        </div>

        <button
          type="submit"
          className="button primary-button"
          disabled={isLoading}
        >
          {isLoading ? 'Adding...' : 'Add Time Slot'}
        </button>
      </form>

      {/* Available Slots List */}
      <div className="section">
        <div className="header-with-action">
          <h2 className="subtitle">Available Time Slots</h2>
          <button
            onClick={fetchSlots}
            className="button small-button"
            disabled={isLoading}
          >
            Refresh
          </button>
        </div>

        {availableSlots.length > 0 ? (
          <ul className="slot-list">
            {availableSlots.map(slot => (
              <li key={slot.id} className="slot-item">
                <span>{formatDate(slot.date)} at {formatTime(slot.time)}</span>
                <button
                  onClick={() => handleDeleteSlot(slot.id)}
                  className="delete-button"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="empty-message">No time slots available or still loading...</p>
        )}
      </div>

      {/* Display Client Link */}
      <div className="client-link-section">
        <p className="link-title">Your student booking link:</p>
        <div className="link-container">
          <input
            type="text"
            value={clientLink}
            className="link-input"
            readOnly
          />
          <button
            onClick={() => {
              navigator.clipboard.writeText(clientLink);
              setSuccessMessage('Link copied to clipboard!');
              setTimeout(() => setSuccessMessage(''), 3000);
            }}
            className="copy-button"
          >
            Copy
          </button>
        </div>
        <p className="help-text">
          Share this link with your clients to let them book appointments.
        </p>
      </div>

      {/* Status Messages */}
      {errorMessage && (
        <div className="error-message">
          {errorMessage}
        </div>
      )}

      {successMessage && (
        <div className="success-message">
          {successMessage}
        </div>
      )}
    </div>
  );
}

export default OwnerInterface;