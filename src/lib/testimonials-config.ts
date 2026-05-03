// 1. ADD QUOTES HERE:
// Map the player_id exactly as shown in your database (e.g. "1", "01") to their custom quote.
export const customQuotes: Record<string, string> = {
  "1": "This marathon has completely redefined competitive gaming for me. The energy here is just unmatched!",
  "2": "I never expected to find such a passionate and welcoming community. Every match is an adrenaline rush.",
  "3": "The level of competition here is insane. It pushes me to my absolute limits every single time.",
  "4": "From the organization to the players, everything is top-tier. Proud to be part of this.",
  "5": "An unforgettable experience! The thrill of climbing the leaderboard keeps me coming back.",
  "01": "This marathon has completely redefined competitive gaming for me. The energy here is just unmatched!",
  "02": "I never expected to find such a passionate and welcoming community. Every match is an adrenaline rush.",
  "03": "The level of competition here is insane. It pushes me to my absolute limits every single time.",
  "04": "From the organization to the players, everything is top-tier. Proud to be part of this.",
  "05": "An unforgettable experience! The thrill of climbing the leaderboard keeps me coming back.",
};

// 2. FALLBACK QUOTE:
// Used when an active player does not have a quote listed above.
export const fallbackTestimonial = "An incredible marathon experience! I'm ready for the next challenge.";
