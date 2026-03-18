import React, { useRef, useState } from 'react';
import { X, Facebook, Download, Loader } from 'lucide-react';
import ReactDOM from 'react-dom';
import { ShareCard } from './ShareCard';
import html2canvas from 'html2canvas';
import { uploadToCloudinary } from '../../utils/cloudinaryUpload';

interface SharePreviewProps {
  isOpen: boolean;
  onClose: () => void;
  shareText: string;
  gameName: string;
  score: number;
  moves?: number;
  matchedPairs?: number;
  totalPairs?: number;
  isGameComplete?: boolean;
}

const SharePreview: React.FC<SharePreviewProps> = ({
  isOpen,
  onClose,
  shareText,
  gameName,
  score,
  moves = 0,
  matchedPairs = 0,
  totalPairs = 8,
  isGameComplete = false,
}) => {
  const shareCardRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [imageBlob, setImageBlob] = useState<Blob | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Initialize Facebook SDK function (optional for future use)
  const initializeFacebookSDK = () => {
    // Facebook SDK initialization can be added here if you have a valid App ID
    // For now, we use direct share URL which doesn't require SDK
  };

  // Initialize Facebook SDK on mount
  React.useEffect(() => {
    initializeFacebookSDK();
  }, []);

  const generateShareImage = async () => {
    if (!shareCardRef.current) return;

    setIsGenerating(true);
    try {
      const canvas = await html2canvas(shareCardRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
      });

      canvas.toBlob((blob) => {
        if (blob) {
          setImageBlob(blob);
        }
        setIsGenerating(false);
      }, 'image/png');
    } catch (error) {
      console.error('Failed to generate image:', error);
      setIsGenerating(false);
    }
  };

  React.useEffect(() => {
    if (isOpen && !imageBlob) {
      // Generate image when modal opens
      setTimeout(generateShareImage, 100);
    }
  }, [isOpen, imageBlob]);

  if (!isOpen) return null;

  const handleDownloadImage = () => {
    if (!imageBlob) return;

    const url = URL.createObjectURL(imageBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `sibol-game-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleShareFacebook = async () => {
    if (!imageBlob) return;

    setIsUploading(true);
    try {
      // Upload image to Cloudinary
      const imageUrl = await uploadToCloudinary(imageBlob);
      console.log('Image uploaded to Cloudinary:', imageUrl);

      // Create Facebook share URL with the Cloudinary image URL
      // Facebook will fetch the image and display it in the preview
      const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(imageUrl)}&quote=${encodeURIComponent(shareText)}`;

      // Open Facebook Sharer
      window.open(facebookUrl, '_blank', 'width=600,height=400');

      // Copy caption to clipboard as backup
      await navigator.clipboard.writeText(shareText);

      setIsUploading(false);
      onClose();
    } catch (error) {
      console.error('Share error:', error);
      setIsUploading(false);

      // Fallback: download the image
      handleDownloadImage();
      await navigator.clipboard.writeText(shareText);
    }
  };


  return ReactDOM.createPortal(
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
          <h2 className="text-xl sm:text-2xl font-bold text-[#F57F17]">Share Your Achievement! 🎮</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close preview"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Preview Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {/* Share Card Visual */}
          <div className="mb-6 flex justify-center">
            <div className="w-full max-w-xs rounded-xl overflow-hidden border-2 border-gray-200 shadow-lg bg-gray-100">
              {imageBlob ? (
                <img
                  src={URL.createObjectURL(imageBlob)}
                  alt="Share preview"
                  className="w-full h-auto"
                />
              ) : (
                <div className="w-full aspect-square bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center">
                  {isGenerating ? (
                    <div className="text-center text-white">
                      <div className="animate-spin text-4xl mb-2">🔄</div>
                      <p>Generating image...</p>
                    </div>
                  ) : (
                    <p className="text-white text-center">Generating...</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 sm:p-6 border-t border-gray-200 flex flex-col gap-3">
          <button
            onClick={handleShareFacebook}
            disabled={!imageBlob || isGenerating || isUploading}
            className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors disabled:opacity-50 text-lg"
          >
            {isUploading ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                <span>Uploading...</span>
              </>
            ) : (
              <>
                <Facebook className="w-5 h-5" />
                <span>Share to Facebook</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Hidden ShareCard for rendering */}
      <div style={{ position: 'absolute', left: '-9999px' }}>
        <ShareCard
          ref={shareCardRef}
          score={score}
          moves={moves}
          matchedPairs={matchedPairs}
          totalPairs={totalPairs}
          isGameComplete={isGameComplete}
        />
      </div>
    </div>,
    document.body
  );
};

export default SharePreview;
