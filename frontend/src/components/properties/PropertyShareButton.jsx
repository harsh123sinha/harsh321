import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Share2, MessageCircle, Send, Mail, Link2, X } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  getPropertyListingUrl,
  getPropertyShareMailto,
  getPropertyShareTelegramHref,
  getPropertyShareWhatsAppHref,
} from '../../utils/helpers';

const sizeMap = {
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-6 w-6',
};

const SHARE_OPTIONS = [
  { id: 'whatsapp', label: 'WhatsApp', Icon: MessageCircle, accent: 'text-[#25D366]' },
  { id: 'telegram', label: 'Telegram', Icon: Send, accent: 'text-[#229ED9]' },
  { id: 'gmail', label: 'Gmail', Icon: Mail, accent: 'text-red-600' },
  { id: 'copy', label: 'Copy link', Icon: Link2, accent: 'text-navy' },
];

export default function PropertyShareButton({
  property,
  size = 'md',
  className = '',
  showLabel = false,
}) {
  const [open, setOpen] = useState(false);
  const [panelStyle, setPanelStyle] = useState(null);
  const triggerRef = useRef(null);
  const panelRef = useRef(null);

  const updatePanelPosition = () => {
    const trigger = triggerRef.current;
    if (!trigger) return;
    const rect = trigger.getBoundingClientRect();
    const margin = 12;
    const viewportW = window.innerWidth;
    const isMobile = viewportW < 640;
    const width = isMobile ? viewportW - margin * 2 : Math.min(220, viewportW - margin * 2);
    const left = isMobile
      ? margin
      : Math.max(margin, Math.min(rect.right - width, viewportW - width - margin));
    setPanelStyle({
      top: rect.bottom + 8,
      left,
      width,
    });
  };

  useLayoutEffect(() => {
    if (!open) {
      setPanelStyle(null);
      return;
    }
    updatePanelPosition();
    const onReflow = () => updatePanelPosition();
    window.addEventListener('resize', onReflow);
    window.addEventListener('scroll', onReflow, true);
    return () => {
      window.removeEventListener('resize', onReflow);
      window.removeEventListener('scroll', onReflow, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e) => {
      if (triggerRef.current?.contains(e.target)) return;
      if (panelRef.current?.contains(e.target)) return;
      setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  const handleToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!property?.id) return;
    setOpen((v) => !v);
  };

  const copyLink = async () => {
    const url = getPropertyListingUrl(property);
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Link copied');
    } catch {
      toast.error('Could not copy link');
    }
    setOpen(false);
  };

  const handleShare = async (channel) => {
    if (channel === 'copy') {
      await copyLink();
      return;
    }
    if (channel === 'whatsapp') {
      const href = getPropertyShareWhatsAppHref(property);
      if (href) window.open(href, '_blank', 'noopener,noreferrer');
      setOpen(false);
      return;
    }
    if (channel === 'telegram') {
      const href = getPropertyShareTelegramHref(property);
      if (href) window.open(href, '_blank', 'noopener,noreferrer');
      setOpen(false);
      return;
    }
    if (channel === 'gmail') {
      window.location.href = getPropertyShareMailto(property);
      setOpen(false);
    }
  };

  const panel =
    open &&
    panelStyle &&
    typeof document !== 'undefined' &&
    createPortal(
      <div
        ref={panelRef}
        className="fixed z-[10050] overflow-hidden rounded-xl border border-stone-200 bg-white shadow-xl"
        style={{
          top: panelStyle.top,
          left: panelStyle.left,
          width: panelStyle.width,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-stone-100 bg-navy px-3 py-2 text-white">
          <span className="text-xs font-semibold">Share property</span>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="rounded p-0.5 hover:bg-white/10"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <ul className="py-1">
          {SHARE_OPTIONS.map(({ id, label, Icon, accent }) => (
            <li key={id}>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleShare(id);
                }}
                className="flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm text-navy transition-colors hover:bg-stone-50 touch-manipulation"
              >
                <Icon className={`h-5 w-5 shrink-0 ${accent}`} aria-hidden />
                {label}
              </button>
            </li>
          ))}
        </ul>
      </div>,
      document.body,
    );

  if (!property?.id) return null;

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={handleToggle}
        aria-label="Share property"
        aria-expanded={open}
        title="Share property"
        className={`inline-flex items-center gap-1.5 rounded-full transition-colors hover:text-gold ${className}`}
      >
        <Share2 className={sizeMap[size] || sizeMap.md} aria-hidden />
        {showLabel && <span className="text-sm font-medium">Share</span>}
      </button>
      {panel}
    </div>
  );
}
