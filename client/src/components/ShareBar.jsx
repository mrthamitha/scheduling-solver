/**
 * components/ShareBar.jsx
 * ==================================================================
 * "Save & share" කොටස — fullstack එකේ ලස්සනම feature එක.
 *
 *   1) User "Save & share" ඔබනවා
 *   2) App එක POST /api/solutions කරනවා (input + result)
 *   3) Server එක කෙටි id එකක් දෙනවා (උදා: 9f3c1a7b)
 *   4) අපි /s/9f3c1a7b link එක හදලා copy කරන්න දෙනවා
 *   5) ඒ link එකට ගිය ඕන කෙනෙකුට ඒ solution එක ආයෙත් පෙන්නනවා
 * ==================================================================
 */

import { useEffect, useState } from 'react';
import { saveSolution } from '../api.js';

export default function ShareBar({ lastInput, result }) {
  const [shareId, setShareId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  // අලුත් solve එකක් කරාම පරණ link එක අදාළ නෑ — ඒ නිසා අයින් කරනවා
  useEffect(() => {
    setShareId(null);
  }, [lastInput, result]);

  // result එකක් නැත්නම් ShareBar එක පේන්නේම නෑ
  if (!result) return null;

  const shareLink = shareId ? `${window.location.origin}/s/${shareId}` : '';

  async function handleShareClick() {
    setSaving(true);
    setError('');
    try {
      const { id } = await saveSolution({ input: lastInput, result });
      setShareId(id);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(shareLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // තත්පර 2කට පස්සේ නැවත "Copy"
    } catch {
      setCopied(false); // clipboard අවසර නැත්නම් link එක input එකේ තියෙනවා
    }
  }

  return (
    <div className="share-bar">
      {!shareId ? (
        <button type="button" className="btn-ghost" onClick={handleShareClick} disabled={saving}>
          {saving ? 'Saving…' : 'Save & share this solution'}
        </button>
      ) : (
        <>
          <span className="share-label">Share link:</span>
          <input className="share-link" readOnly value={shareLink} onFocus={(e) => e.target.select()} />
          <button type="button" className="btn-primary" onClick={handleCopy}>
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </>
      )}
      {error && <span className="share-error">{error}</span>}
    </div>
  );
}