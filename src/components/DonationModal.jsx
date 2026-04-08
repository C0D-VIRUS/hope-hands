import { useState } from 'react';
import { createDonation } from '../lib/api';

const DONATION_UNITS = ['kg', 'grams', 'pieces', 'books', 'kits', 'units', 'boxes', 'packs', 'sets'];

export default function HopeDonationModal({ request, onClose, onSuccess }) {
  const defaultUnit = request?.quantityUnit || 'kg';
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    item: request?.itemName || '',
    quantityValue: '',
    quantityUnit: defaultUnit,
    address: '',
    notes: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [donationResult, setDonationResult] = useState(null);

  const handleChange = (event) => {
    setError('');
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const result = await createDonation({
        ...form,
        quantity: `${form.quantityValue} ${form.quantityUnit}`.trim(),
        requestId: request?.id || null,
        requestUuid: request?.requestUuid || null,
      });

      setDonationResult(result);
      if (onSuccess) {
        await onSuccess(result);
      }
      setSubmitted(true);
    } catch (submissionError) {
      setError(submissionError.message || 'Unable to submit donation.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(event) => event.target === event.currentTarget && onClose()}>
      <div className="modal-box">
        <button className="modal-close" onClick={onClose}>x</button>
        {!submitted ? (
          <>
            <h2>Make a Donation</h2>
            <p className="modal-subtitle">
              {request ? `Donating: ${request.itemName} (${request.category})` : 'Fill in your donation details below'}
            </p>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="form-group">
                <label>Your Full Name *</label>
                <input name="name" required value={form.name} onChange={handleChange} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group">
                  <label>Phone *</label>
                  <input name="phone" required value={form.phone} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label>Gmail *</label>
                  <input
                    name="email"
                    type="email"
                    required
                    pattern="^[a-zA-Z0-9._%+-]+@gmail\.com$"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="you@gmail.com"
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Item to Donate *</label>
                <input name="item" required value={form.item} onChange={handleChange} placeholder="e.g. Rice, Books, Blankets..." />
              </div>
              <div className="form-group">
                <label>Quantity *</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 12 }}>
                  <input name="quantityValue" type="number" min="1" step="0.01" required value={form.quantityValue} onChange={handleChange} placeholder="e.g. 10" />
                  <select name="quantityUnit" value={form.quantityUnit} onChange={handleChange}>
                    {DONATION_UNITS.map((unit) => <option key={unit} value={unit}>{unit}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Pickup Address *</label>
                <input name="address" required value={form.address} onChange={handleChange} placeholder="Your full address for pickup" />
              </div>
              <div className="form-group">
                <label>Additional Notes</label>
                <textarea name="notes" rows={3} value={form.notes} onChange={handleChange} placeholder="Any extra information..." />
              </div>
              {error && (
                <div className="success-msg" style={{ background: '#fee2e2', borderColor: '#fca5a5', color: '#991b1b' }}>
                  {error}
                </div>
              )}
              <button className="btn btn-primary" type="submit" style={{ marginTop: 4 }} disabled={isSubmitting}>
                {isSubmitting ? 'Submitting...' : 'Confirm Donation'}
              </button>
            </form>
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: '2rem', marginBottom: 16 }}>Thank you</div>
            <h2 style={{ marginBottom: 12 }}>Thank You, {form.name}!</h2>
            <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: 24 }}>
              Your donation of <strong>{`${form.quantityValue} ${form.quantityUnit}`} of {form.item}</strong> has been registered.
              Our team will contact you at <strong>{form.phone}</strong> to arrange pickup within 24-48 hours.
            </p>
            <div className="success-msg" style={{ justifyContent: 'center' }}>
              Donation UUID: <strong>{donationResult?.donationUuid}</strong>
            </div>
            {donationResult?.emailStatus && (
              <p style={{ color: 'var(--text-muted)', marginTop: 14 }}>
                Email status: <strong>{donationResult.emailStatus}</strong>
              </p>
            )}
            <button className="btn btn-outline" style={{ marginTop: 20 }} onClick={onClose}>Close</button>
          </div>
        )}
      </div>
    </div>
  );
}
