import React, { useState } from 'react';
import { Download, Check, Copy } from 'lucide-react';
import { motion } from 'motion/react';

interface GiftSectionProps {
  lang: 'ENG' | 'VIE';
  siteContent: Record<string, any>;
  isModal?: boolean;
}

export const GiftSection: React.FC<GiftSectionProps> = ({
  lang,
  siteContent,
  isModal = false,
}) => {
  const [copiedAccount, setCopiedAccount] = useState<string | null>(null);
  const [downloading, setDownloading] = useState<string | null>(null);

  // Default values matching the requested layout and screenshot
  const brideTitle = siteContent.giftBrideTitle || (siteContent.brideName ? `Cô Dâu - ${siteContent.brideName.toUpperCase()}` : "Cô Dâu - VU NGOC HAN");
  const brideBank = siteContent.giftBrideBank || "Techcombank";
  const brideAccount = siteContent.giftBrideAccount || "19099887766554";
  const brideAccountName = siteContent.giftBrideName || (siteContent.brideName ? siteContent.brideName.toUpperCase() : "VU NGOC HAN");
  const brideQr = siteContent.brideGiftQrUrl || "https://img.vietqr.io/image/TCB-19099887766554-compact.png?accountName=VU%20NGOC%20HAN";
  const brideBtnText = siteContent.giftBrideBtnTextVie || (lang === 'VIE' ? "Lưu QR" : "Save QR");

  const groomTitle = siteContent.giftGroomTitle || (siteContent.groomName ? `Chú Rể - ${siteContent.groomName.toUpperCase()}` : "Chú Rể - LE DUC ANH");
  const groomBank = siteContent.giftGroomBank || "Vietcombank";
  const groomAccount = siteContent.giftGroomAccount || "0071000445566";
  const groomAccountName = siteContent.giftGroomName || (siteContent.groomName ? siteContent.groomName.toUpperCase() : "LE DUC ANH");
  const groomQr = siteContent.groomGiftQrUrl || "https://img.vietqr.io/image/VCB-0071000445566-compact.png?accountName=LE%20DUC%20ANH";
  const groomBtnText = siteContent.giftGroomBtnTextVie || (lang === 'VIE' ? "Lưu QR" : "Save QR");

  const sectionTitle = lang === 'VIE' 
    ? (siteContent.giftSectionTitleVie || "HỘP MỪNG CƯỚI")
    : (siteContent.giftSectionTitleEng || "WEDDING GIFT BOX");

  const sectionSubtitle = lang === 'VIE'
    ? (siteContent.giftSectionSubtitleVie || "Sự hiện diện của bạn là món quà quý giá nhất. Nếu bạn muốn gửi tặng món quà chúc phúc, xin gửi qua thông tin dưới đây:")
    : (siteContent.giftSectionSubtitleEng || "Your presence is our greatest gift. If you wish to celebrate with a gift, you may send it via the account details below:");

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAccount(label);
    setTimeout(() => {
      setCopiedAccount(null);
    }, 2000);
  };

  const handleDownloadQr = async (url: string, filename: string) => {
    try {
      setDownloading(filename);
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `${filename}-qr.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch {
      // Fallback if cross-origin fetch is restricted
      const newWin = window.open(url, '_blank');
      if (!newWin) {
        window.location.href = url;
      }
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div className={`w-full ${isModal ? 'py-2 px-1' : 'py-12 px-4'} flex flex-col items-center justify-center`}>
      {/* Optional intro headers if rendered outside or top of modal */}
      {!isModal && (
        <div className="text-center max-w-xl mx-auto mb-10">
          <span 
            className="block text-[#B86B77] leading-none mb-2 select-none text-center"
            style={{
              fontFamily: '"Luxurious Script", cursive',
              fontSize: '54px',
              lineHeight: '60px'
            }}
          >
            {lang === 'VIE' ? "Gửi trao yêu thương," : "Warmest wishes,"}
          </span>
          <h2 className="font-serif text-[#362223] text-xl sm:text-2xl uppercase tracking-[0.2em] font-semibold mb-3">
            {sectionTitle}
          </h2>
          <p className="font-serif italic text-stone-600 text-sm sm:text-base leading-relaxed">
            {sectionSubtitle}
          </p>
          <div className="w-12 h-[1px] bg-[#B86B77]/30 mx-auto mt-6" />
        </div>
      )}

      {/* Main Container without background to sit seamlessly on canvas */}
      <div className={`w-full ${isModal ? 'max-w-md' : 'max-w-lg'} mx-auto bg-transparent space-y-8 sm:space-y-10 py-2`}>
        
        {/* Intro note following stationery aesthetic */}
        <div className="px-2 sm:px-4 text-center flex flex-col items-center">
          <p 
            className="text-[#362223]/80 font-serif italic max-w-full mx-auto select-none"
            style={{ 
              fontFamily: '"Crimson Pro", serif',
              fontSize: '16px',
              lineHeight: '18px',
              width: '340px',
              maxWidth: '100%'
            }}
          >
            {lang === 'VIE' && siteContent.giftSectionSubtitleVie
              ? siteContent.giftSectionSubtitleVie
              : "Your presence and well wishes mean the world to us. Should you wish to send a token of love, you may do so using the details below. With all our love and gratitude."}
          </p>
        </div>
        
        {/* ===================== BRIDE SECTION ===================== */}
        <div className="flex flex-col items-center text-center space-y-3.5">
          {/* Header Title: Cô Dâu - VU NGOC HAN */}
          <h3 
            className="text-[#B86B77] font-serif text-base sm:text-lg uppercase tracking-[0.08em] font-normal"
            style={{ fontFamily: '"Crimson Pro", serif' }}
          >
            {brideTitle}
          </h3>

          {/* White Rounded Card with QR */}
          <motion.div 
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-[26px] p-4 sm:p-5 border border-[#F8E8EB] flex items-center justify-center max-w-[260px] sm:max-w-[280px] w-full mx-auto"
          >
            <div className="w-48 h-48 sm:w-52 sm:h-52 bg-white flex items-center justify-center overflow-hidden rounded-xl">
              <img 
                src={brideQr} 
                alt={`${brideTitle} QR Code`} 
                className="w-full h-full object-contain select-none"
                referrerPolicy="no-referrer"
              />
            </div>
          </motion.div>

          {/* Bank & Account Details */}
          <div className="space-y-1 pt-1">
            <p 
              className="text-[#B86B77] text-[14px] font-normal tracking-wide"
              style={{ fontFamily: '"Space Mono", monospace' }}
            >
              {brideBank}
            </p>
            
            {/* Account number with click-to-copy convenience */}
            <div 
              onClick={() => handleCopy(brideAccount, 'bride')}
              title={lang === 'VIE' ? "Nhấp để sao chép số tài khoản" : "Click to copy account number"}
              className="group inline-flex items-center justify-center gap-1.5 cursor-pointer hover:opacity-85 transition-opacity"
            >
              <span className="text-[#B86B77] font-mono text-[15px] sm:text-[16px] tracking-wider font-semibold select-all">
                {brideAccount}
              </span>
              <button 
                type="button"
                className="text-[#B86B77]/60 group-hover:text-[#B86B77] transition-colors p-0.5"
                aria-label="Copy account number"
              >
                {copiedAccount === 'bride' ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
                ) : (
                  <Copy className="w-3 h-3" />
                )}
              </button>
            </div>

            {copiedAccount === 'bride' && (
              <p className="text-[11px] text-emerald-700 font-mono tracking-wider animate-fade-in">
                {lang === 'VIE' ? "✓ Đã sao chép số tài khoản" : "✓ Copied to clipboard"}
              </p>
            )}

            <p 
              className="text-[#B86B77] text-[13px] sm:text-[14px] font-bold uppercase tracking-wider"
              style={{ fontFamily: '"Space Mono", monospace' }}
            >
              {brideAccountName}
            </p>
          </div>

          {/* Save QR Button */}
          <button
            type="button"
            onClick={() => handleDownloadQr(brideQr, `co-dau-${brideAccount}`)}
            disabled={downloading === `co-dau-${brideAccount}`}
            className="inline-flex items-center justify-center gap-1.5 px-5 py-1.5 rounded-full bg-[#FDECEE] hover:bg-[#F9DEE2] text-[#B86B77] active:scale-95 transition-all text-xs sm:text-[13px] font-serif font-medium shadow-sm cursor-pointer mt-1"
          >
            <Download className="w-3.5 h-3.5 text-[#B86B77]" />
            <span>{downloading === `co-dau-${brideAccount}` ? (lang === 'VIE' ? "Đang tải..." : "Downloading...") : brideBtnText}</span>
          </button>
        </div>


        {/* ===================== GROOM SECTION ===================== */}
        <div className="flex flex-col items-center text-center space-y-3.5">
          {/* Header Title: Chú Rể - LE DUC ANH */}
          <h3 
            className="text-[#B86B77] font-serif text-base sm:text-lg uppercase tracking-[0.08em] font-normal"
            style={{ fontFamily: '"Crimson Pro", serif' }}
          >
            {groomTitle}
          </h3>

          {/* White Rounded Card with QR */}
          <motion.div 
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-[26px] p-4 sm:p-5 border border-[#F8E8EB] flex items-center justify-center max-w-[260px] sm:max-w-[280px] w-full mx-auto"
          >
            <div className="w-48 h-48 sm:w-52 sm:h-52 bg-white flex items-center justify-center overflow-hidden rounded-xl">
              <img 
                src={groomQr} 
                alt={`${groomTitle} QR Code`} 
                className="w-full h-full object-contain select-none"
                referrerPolicy="no-referrer"
              />
            </div>
          </motion.div>

          {/* Bank & Account Details */}
          <div className="space-y-1 pt-1">
            <p 
              className="text-[#B86B77] text-[14px] sm:text-[15px] font-normal tracking-wide"
              style={{ fontFamily: '"Space Mono", monospace' }}
            >
              {groomBank}
            </p>
            
            {/* Account number with click-to-copy convenience */}
            <div 
              onClick={() => handleCopy(groomAccount, 'groom')}
              title={lang === 'VIE' ? "Nhấp để sao chép số tài khoản" : "Click to copy account number"}
              className="group inline-flex items-center justify-center gap-1.5 cursor-pointer hover:opacity-85 transition-opacity"
            >
              <span className="text-[#B86B77] font-mono text-[15px] sm:text-[16px] tracking-wider font-semibold select-all">
                {groomAccount}
              </span>
              <button 
                type="button"
                className="text-[#B86B77]/60 group-hover:text-[#B86B77] transition-colors p-0.5"
                aria-label="Copy account number"
              >
                {copiedAccount === 'groom' ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
                ) : (
                  <Copy className="w-3 h-3" />
                )}
              </button>
            </div>

            {copiedAccount === 'groom' && (
              <p className="text-[11px] text-emerald-700 font-mono tracking-wider animate-fade-in">
                {lang === 'VIE' ? "✓ Đã sao chép số tài khoản" : "✓ Copied to clipboard"}
              </p>
            )}

            <p 
              className="text-[#B86B77] text-[13px] sm:text-[14px] font-bold uppercase tracking-wider"
              style={{ fontFamily: '"Space Mono", monospace' }}
            >
              {groomAccountName}
            </p>
          </div>

          {/* Save QR Button */}
          <button
            type="button"
            onClick={() => handleDownloadQr(groomQr, `chu-re-${groomAccount}`)}
            disabled={downloading === `chu-re-${groomAccount}`}
            className="inline-flex items-center justify-center gap-1.5 px-5 py-1.5 rounded-full bg-[#FDECEE] hover:bg-[#F9DEE2] text-[#B86B77] active:scale-95 transition-all text-xs sm:text-[13px] font-serif font-medium shadow-sm cursor-pointer mt-1"
          >
            <Download className="w-3.5 h-3.5 text-[#B86B77]" />
            <span>{downloading === `chu-re-${groomAccount}` ? (lang === 'VIE' ? "Đang tải..." : "Downloading...") : groomBtnText}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
