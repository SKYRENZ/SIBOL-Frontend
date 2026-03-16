/**
 * Social Media Sharing Utility
 * Handles platform-specific sharing with proper content pre-filling
 */

// Initialize Facebook SDK
export const initializeFacebookSDK = () => {
  if (window.FB) return;

  const script = document.createElement('script');
  script.async = true;
  script.defer = true;
  script.crossOrigin = 'anonymous';
  script.src = 'https://connect.facebook.net/en_US/sdk.js#xfbml=1&version=v18.0';
  document.body.appendChild(script);

  window.fbAsyncInit = function() {
    FB.init({
      appId: '1234567890', // Note: Replace with actual FB App ID from SIBOL
      xfbml: true,
      version: 'v18.0'
    });
  };
};

interface ShareData {
  gameName: string;
  score: number;
  extraStats?: string; // e.g., "with 25 moves" or "with 3x combo"
}

/**
 * Share to Facebook using the Facebook Share Dialog
 * This properly pre-fills the quote/caption in the compose box
 */
export const shareToFacebook = (data: ShareData) => {
  // Initialize Facebook SDK if not already done
  if (!window.FB) {
    initializeFacebookSDK();
  }

  // Wait for FB SDK to load
  setTimeout(() => {
    if (window.FB) {
      const shareText = `🎮 I scored ${data.score} points in ${data.gameName}${data.extraStats ? ` ${data.extraStats}` : ''}! Can you beat my score? 🗑️\n\nJoin me in learning about waste management with SIBOL - turning food waste into energy! 🌱\n\n#SustainableLiving #WasteManagement #SIBOL #GameTime`;

      FB.ui(
        {
          method: 'share',
          href: window.location.href,
          hashtag: '#SIBOL',
          quote: shareText,
          display: 'popup',
        },
        function(response){
          if (response && !response.error_message) {
            console.log('Share successful:', response);
          }
        }
      );
    } else {
      // Fallback if FB SDK fails to load
      fallbackFacebookShare(data);
    }
  }, 500);
};

/**
 * Fallback Facebook sharing method
 */
const fallbackFacebookShare = (data: ShareData) => {
  const shareText = `🎮 I scored ${data.score} points in ${data.gameName}${data.extraStats ? ` ${data.extraStats}` : ''}! Can you beat my score? 🗑️\n\nJoin me in learning about waste management with SIBOL - turning food waste into energy! 🌱\n\n#SustainableLiving #WasteManagement #SIBOL #GameTime`;

  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}&quote=${encodeURIComponent(shareText)}`;
  window.open(facebookUrl, '_blank', 'width=600,height=400');
};

/**
 * Share to Instagram (Web Share API)
 * Note: Instagram doesn't support web sharing directly, so we provide copy-to-clipboard
 */
export const shareToInstagram = (data: ShareData) => {
  const shareText = `🎮 I scored ${data.score} points in ${data.gameName}${data.extraStats ? ` ${data.extraStats}` : ''}! Can you beat my score? 🎴\n\nJoin me in learning about waste management with SIBOL - turning food waste into energy! 🌱\n\n#SustainableLiving #WasteManagement #SIBOL #GameTime #FoodWaste #CleanEnergy`;

  // Copy to clipboard
  navigator.clipboard.writeText(shareText).then(() => {
    alert(`✅ Copied to clipboard!\n\n${shareText}\n\nNow paste it on your Instagram story or post!`);
  }).catch(() => {
    // Fallback if clipboard fails
    alert(`Share on Instagram:\n\n${shareText}\n\nCopy the text above and share it on your Instagram story or post!`);
  });
};

/**
 * Generic Web Share API (for browsers that support it)
 */
export const shareToWeb = (data: ShareData) => {
  if (!navigator.share) {
    alert('Web Share API not supported on this device');
    return;
  }

  const shareText = `🎮 I scored ${data.score} points in ${data.gameName}${data.extraStats ? ` ${data.extraStats}` : ''}! Can you beat my score? 🗑️\n\nJoin me in learning about waste management with SIBOL - turning food waste into energy! 🌱`;

  navigator.share({
    title: 'Check out my SIBOL Game Score!',
    text: shareText,
    url: window.location.href
  }).catch((err) => console.log('Share cancelled or failed:', err));
};

// Type declarations for FB SDK
declare global {
  interface Window {
    FB: any;
    fbAsyncInit: () => void;
  }
}
