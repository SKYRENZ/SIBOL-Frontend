/** * Social Media Sharing Utility
 * Handles platform-specific sharing with template-based posts
 */

interface ShareData {
  gameName: string;
  score: number;
  extraStats?: string; // e.g., "with 25 moves" or "with 3x combo"
  isGameComplete?: boolean; // true if game is finished, false for mid-game
}

/**
 * Template for mid-game sharing
 */
export const getMidGameTemplate = (data: ShareData): string => {
  return `🎮 I'm playing the Matching Game on SIBOL! 🗑️

Can you beat my current score of ${data.score} points?${data.extraStats ? ` I'm already ${data.extraStats}! 💪` : ''}

Join me in learning about sustainable waste management while having fun! 🌱

🔗 Play now and test your memory skills while helping save the planet!

#SIBOL #WasteToEnergy #SustainableLiving #GameTime #FoodWaste #CleanEnergy #CommunityFirst`;
};

/**
 * Template for post-game sharing (completed)
 */
export const getPostGameTemplate = (data: ShareData): string => {
  const motivationalMessages = [
    "I crushed the Matching Game on SIBOL! 🎉",
    "I mastered the Matching Game on SIBOL! 🏆",
    "Check out my winning streak on SIBOL! 🚀",
    "I dominated the Matching Game on SIBOL! 💯"
  ];

  const randomMessage = motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)];

  return `${randomMessage}

Final Score: ${data.score} points 🏅
${data.extraStats ? `Performance: ${data.extraStats}` : ''}

SIBOL transforms food waste into renewable energy for our community! ♻️ Learn how you can contribute to a sustainable future while earning rewards.

🌍 Every action counts - join thousands of Filipinos making a difference!
🎮 Play games, learn about waste management, and help save the planet 🌱

#SIBOL #SustainableDevelopment #WasteToEnergy #CleanEnergy #CommunityAction #Philippines #GreenLiving #GamersForChange #FoodWaste #Renewable`;
};

/**
 * Share to Facebook using URL-based sharing
 * No SDK required - direct URL share dialog
 */
export const shareToFacebook = (data: ShareData) => {
  const shareText = data.isGameComplete
    ? getPostGameTemplate(data)
    : getMidGameTemplate(data);

  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}&quote=${encodeURIComponent(shareText)}`;
  window.open(facebookUrl, '_blank', 'width=600,height=400');
};

/**
 * Share to Instagram (copy-to-clipboard)
 * Note: Instagram doesn't support web sharing directly, so we provide copy-to-clipboard
 */
export const shareToInstagram = (data: ShareData) => {
  const shareText = data.isGameComplete
    ? getPostGameTemplate(data)
    : getMidGameTemplate(data);

  // Copy to clipboard
  navigator.clipboard.writeText(shareText).then(() => {
    alert(`✅ Copied to clipboard!\n\nNow paste it on your Instagram story or post!`);
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
