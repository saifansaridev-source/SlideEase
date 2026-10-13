'use client';

import React, { useState, useRef } from 'react';

const FOOTWEAR_SIZES = ['5', '6', '7', '8', '9', '10', '11'];

const RETURN_REASONS = [
  'Fit: Size too small (Footwear)',
  'Fit: Size too large / loose (Footwear)',
  'Sole or insole cushioning not as expected',
  'Defective or damaged product received',
  'Wrong size or color dispatched',
  'Product differs from description or imagery',
  'Quality issue / Craftsmanship defect',
  'Changed mind / Dislike styling',
];

export default function ReturnExchangeModal({ order, onClose, onSuccess }) {
  const [type, setType] = useState('exchange'); // 'exchange' | 'return'
  const [selectedItem, setSelectedItem] = useState(order.items?.[0] || null);
  const [returnQty, setReturnQty] = useState(1);
  const [replacementSize, setReplacementSize] = useState('8');
  const [reason, setReason] = useState(RETURN_REASONS[0]);
  const [notes, setNotes] = useState('');
  
  // Photo upload states
  const [uploadedPhotos, setUploadedPhotos] = useState([]);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);

  // Review & submission states
  const [step, setStep] = useState(1); // 1: details & photos, 2: review summary
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successResult, setSuccessResult] = useState(null);

  const maxQty = selectedItem?.quantity || selectedItem?.qty || 1;

  // Handle image files upload
  const handleFilesSelected = async (fileList) => {
    if (!fileList || fileList.length === 0) return;
    setUploadError('');

    const filesToUpload = Array.from(fileList);
    if (uploadedPhotos.length + filesToUpload.length > 4) {
      setUploadError('Maximum 4 evidence photographs allowed.');
      return;
    }

    setUploadingPhotos(true);
    try {
      const formData = new FormData();
      filesToUpload.forEach((f) => formData.append('photos', f));

      const res = await fetch('/api/returns/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to upload photographs.');
      }

      setUploadedPhotos((prev) => [...prev, ...data.urls]);
    } catch (err) {
      setUploadError(err.message);
    } finally {
      setUploadingPhotos(false);
    }
  };

  const handleRemovePhoto = (indexToRemove) => {
    setUploadedPhotos((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFilesSelected(e.dataTransfer.files);
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/returns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: order._id || order.orderNumber,
          type,
          itemId: selectedItem?.id || selectedItem?.productId,
          size: selectedItem?.size,
          quantity: returnQty,
          replacementSize: type === 'exchange' ? replacementSize : null,
          reason,
          notes,
          evidencePhotos: uploadedPhotos,
          customerEmail: order.customer?.email,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to submit request.');
      }

      setSuccessResult(data);
      if (onSuccess) onSuccess(data);
    } catch (err) {
      setError(err.message);
      setStep(1); // Return to form step to correct errors
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '1rem',
      backdropFilter: 'blur(5px)',
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '14px',
        maxWidth: '560px',
        width: '100%',
        maxHeight: '92vh',
        overflowY: 'auto',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        padding: '2.2rem',
        boxSizing: 'border-box',
      }}>
        {/* ── SUCCESS VIEW ──────────────────────────────────────────────── */}
        {successResult ? (
          <div style={{ textAlign: 'center', padding: '1rem 0' }}>
            <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>🎉</div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#111827', margin: '0 0 0.6rem 0' }}>
              Request Received!
            </h3>
            <p style={{ color: '#4b5563', fontSize: '0.95rem', marginBottom: '1.5rem', lineHeight: 1.6 }}>
              {successResult.message}
            </p>
            <div style={{
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              padding: '16px',
              borderRadius: '8px',
              marginBottom: '1.8rem',
            }}>
              <div style={{ fontSize: '0.78rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>
                Return Reference Code
              </div>
              <div style={{
                fontFamily: 'monospace',
                fontSize: '1.25rem',
                fontWeight: 800,
                color: '#b45309',
                marginTop: '4px',
              }}>
                {successResult.returnNumber}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '6px' }}>
                Order #{order.orderNumber} &bull; Doorstep pickup will be scheduled upon approval
              </div>
            </div>
            <button
              onClick={onClose}
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.85rem', fontWeight: 700, fontSize: '0.95rem' }}
            >
              Done & Return to Account
            </button>
          </div>
        ) : (
          <div>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.2rem' }}>
              <div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#111827', margin: 0 }}>
                  {step === 1 ? 'Return or Size Exchange' : 'Review Request Summary'}
                </h3>
                <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '4px' }}>
                  Order: <strong style={{ color: '#0f172a' }}>{order.orderNumber}</strong> &bull; Step {step} of 2
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                style={{ background: 'none', border: 'none', fontSize: '1.6rem', cursor: 'pointer', color: '#94a3b8' }}
              >
                &times;
              </button>
            </div>

            {error && (
              <div style={{
                backgroundColor: '#fee2e2',
                color: '#b91c1c',
                padding: '0.85rem 1rem',
                borderRadius: '8px',
                fontSize: '0.88rem',
                marginBottom: '1.2rem',
                border: '1px solid #fca5a5',
              }}>
                {error}
              </div>
            )}

            {/* ── STEP 1: FORM & EVIDENCE ──────────────────────────────── */}
            {step === 1 && (
              <form onSubmit={(e) => { e.preventDefault(); setStep(2); }}>
                {/* Type selector */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.4rem' }}>
                  <button
                    type="button"
                    onClick={() => setType('exchange')}
                    style={{
                      padding: '0.8rem',
                      borderRadius: '8px',
                      border: type === 'exchange' ? '2px solid #b45309' : '1px solid #e2e8f0',
                      backgroundColor: type === 'exchange' ? '#fef3c7' : '#ffffff',
                      color: type === 'exchange' ? '#92400e' : '#334155',
                      fontWeight: 700,
                      fontSize: '0.88rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    🔄 Size Exchange
                  </button>
                  <button
                    type="button"
                    onClick={() => setType('return')}
                    style={{
                      padding: '0.8rem',
                      borderRadius: '8px',
                      border: type === 'return' ? '2px solid #b45309' : '1px solid #e2e8f0',
                      backgroundColor: type === 'return' ? '#fef3c7' : '#ffffff',
                      color: type === 'return' ? '#92400e' : '#334155',
                      fontWeight: 700,
                      fontSize: '0.88rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    ↩️ Return &amp; Refund
                  </button>
                </div>

                {/* Item selector */}
                {order.items && order.items.length > 1 && (
                  <div style={{ marginBottom: '1.2rem' }}>
                    <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#334155', marginBottom: '0.4rem' }}>
                      Select Footwear Item
                    </label>
                    <select
                      value={selectedItem?.id || selectedItem?.productId}
                      onChange={(e) => {
                        const it = order.items.find((i) => (i.id || i.productId) === e.target.value);
                        setSelectedItem(it);
                        setReturnQty(1);
                      }}
                      style={{ width: '100%', padding: '0.65rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                    >
                      {order.items.map((i, idx) => (
                        <option key={idx} value={i.id || i.productId}>
                          {i.name} (UK {i.size}) &bull; Qty {i.quantity || i.qty || 1}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Partial quantity selector */}
                {maxQty > 1 && (
                  <div style={{ marginBottom: '1.2rem' }}>
                    <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#334155', marginBottom: '0.4rem' }}>
                      Quantity to Return (Max {maxQty})
                    </label>
                    <select
                      value={returnQty}
                      onChange={(e) => setReturnQty(Number(e.target.value))}
                      style={{ width: '100%', padding: '0.65rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                    >
                      {Array.from({ length: maxQty }, (_, i) => i + 1).map((q) => (
                        <option key={q} value={q}>{q} pair{q > 1 ? 's' : ''}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Replacement size for exchange */}
                {type === 'exchange' && (
                  <div style={{ marginBottom: '1.3rem', padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>
                      Choose Replacement Size (UK)
                    </label>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      {FOOTWEAR_SIZES.map((sz) => (
                        <button
                          type="button"
                          key={sz}
                          onClick={() => setReplacementSize(sz)}
                          style={{
                            padding: '0.45rem 0.85rem',
                            borderRadius: '6px',
                            border: replacementSize === sz ? '2px solid #b45309' : '1px solid #cbd5e1',
                            backgroundColor: replacementSize === sz ? '#b45309' : '#ffffff',
                            color: replacementSize === sz ? '#ffffff' : '#334155',
                            fontWeight: 700,
                            fontSize: '0.85rem',
                            cursor: 'pointer',
                          }}
                        >
                          UK {sz}
                        </button>
                      ))}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.5rem' }}>
                      Current pair: <strong>UK {selectedItem?.size || '7'}</strong>. Replacement size inventory will be verified upon review.
                    </div>
                  </div>
                )}

                {/* Reason selector */}
                <div style={{ marginBottom: '1.2rem' }}>
                  <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#334155', marginBottom: '0.4rem' }}>
                    Reason for {type === 'exchange' ? 'Exchange' : 'Return'}
                  </label>
                  <select
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    style={{ width: '100%', padding: '0.65rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                  >
                    {RETURN_REASONS.map((r, idx) => (
                      <option key={idx} value={r}>{r}</option>
                    ))}
                  </select>
                </div>

                {/* Additional notes */}
                <div style={{ marginBottom: '1.3rem' }}>
                  <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#334155', marginBottom: '0.4rem' }}>
                    Customer Notes / Explanation
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Describe any fit observations, defect areas, or packaging condition..."
                    rows={2}
                    style={{ width: '100%', padding: '0.65rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem', resize: 'vertical' }}
                  />
                </div>

                {/* ── DRAG & DROP PHOTO EVIDENCE UPLOAD ────────────────── */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                    <label style={{ fontSize: '0.84rem', fontWeight: 700, color: '#334155' }}>
                      Evidence Photographs ({uploadedPhotos.length}/4)
                    </label>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>JPG, PNG, WebP &bull; Max 5MB each</span>
                  </div>

                  <div
                    onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                    onDragLeave={() => setIsDragOver(false)}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      border: `2px dashed ${isDragOver ? '#b45309' : '#cbd5e1'}`,
                      borderRadius: '8px',
                      padding: '1.25rem',
                      textAlign: 'center',
                      backgroundColor: isDragOver ? '#fef3c7' : '#f8fafc',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={(e) => handleFilesSelected(e.target.files)}
                      multiple
                      accept="image/jpeg,image/png,image/webp"
                      style={{ display: 'none' }}
                    />
                    <div style={{ fontSize: '1.8rem', marginBottom: '0.3rem' }}>📸</div>
                    <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#1e293b' }}>
                      {uploadingPhotos ? 'Uploading photographs...' : 'Click to upload or drag & drop photos here'}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>
                      Take photos of sole, tags, and product defect/fit areas
                    </div>
                  </div>

                  {uploadError && (
                    <div style={{ fontSize: '0.8rem', color: '#b91c1c', marginTop: '6px' }}>{uploadError}</div>
                  )}

                  {/* Uploaded photo thumbnails */}
                  {uploadedPhotos.length > 0 && (
                    <div style={{ display: 'flex', gap: '0.6rem', marginTop: '0.8rem', flexWrap: 'wrap' }}>
                      {uploadedPhotos.map((url, idx) => (
                        <div key={idx} style={{ position: 'relative', width: '64px', height: '64px', borderRadius: '6px', overflow: 'hidden', border: '1px solid #cbd5e1' }}>
                          <img src={url} alt={`Evidence ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); handleRemovePhoto(idx); }}
                            style={{
                              position: 'absolute',
                              top: 2,
                              right: 2,
                              width: '18px',
                              height: '18px',
                              borderRadius: '50%',
                              backgroundColor: 'rgba(0,0,0,0.65)',
                              color: '#fff',
                              border: 'none',
                              fontSize: '11px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            &times;
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Form Buttons */}
                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    onClick={onClose}
                    style={{
                      padding: '0.65rem 1.25rem',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      backgroundColor: '#ffffff',
                      color: '#475569',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={uploadingPhotos}
                    style={{
                      padding: '0.65rem 1.5rem',
                      borderRadius: '6px',
                      border: 'none',
                      backgroundColor: '#b45309',
                      color: '#ffffff',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    Review Request &rarr;
                  </button>
                </div>
              </form>
            )}

            {/* ── STEP 2: REVIEW SUMMARY BEFORE SUBMISSION ───────────── */}
            {step === 2 && (
              <div>
                <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1.25rem', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
                    <span style={{ color: '#64748b' }}>Request Type:</span>
                    <strong style={{ color: '#0f172a' }}>{type === 'exchange' ? 'Size Exchange' : 'Return & Refund'}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ color: '#64748b' }}>Item:</span>
                    <strong>{selectedItem?.name}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ color: '#64748b' }}>Quantity & Size:</span>
                    <span>{returnQty} pair &bull; UK {selectedItem?.size}</span>
                  </div>
                  {type === 'exchange' && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', color: '#b45309', fontWeight: 700 }}>
                      <span>New Size Requested:</span>
                      <span>UK {replacementSize}</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ color: '#64748b' }}>Reason:</span>
                    <span style={{ maxWidth: '60%', textAlign: 'right' }}>{reason}</span>
                  </div>
                  {notes && (
                    <div style={{ marginTop: '8px', borderTop: '1px solid #e2e8f0', paddingTop: '8px', color: '#475569', fontSize: '0.85rem' }}>
                      <em>"{notes}"</em>
                    </div>
                  )}
                  {uploadedPhotos.length > 0 && (
                    <div style={{ marginTop: '10px' }}>
                      <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Attached Photos ({uploadedPhotos.length}):</span>
                      <div style={{ display: 'flex', gap: '0.4rem', marginTop: '4px' }}>
                        {uploadedPhotos.map((p, i) => (
                          <img key={i} src={p} alt="" style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #cbd5e1' }} />
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    disabled={submitting}
                    style={{
                      padding: '0.65rem 1.25rem',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      backgroundColor: '#ffffff',
                      color: '#475569',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    &larr; Back / Edit
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={submitting}
                    style={{
                      padding: '0.65rem 1.5rem',
                      borderRadius: '6px',
                      border: 'none',
                      backgroundColor: '#b45309',
                      color: '#ffffff',
                      fontWeight: 700,
                      cursor: submitting ? 'not-allowed' : 'pointer',
                      opacity: submitting ? 0.7 : 1,
                    }}
                  >
                    {submitting ? 'Submitting Request...' : 'Confirm & Submit'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
