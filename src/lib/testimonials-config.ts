// 1. ADD PLAYER IDs HERE:
// Only players listed in this array will be shown in the testimonials section.
// Make sure to type their exactly player_id from the database.
export const displayedTestimonialPlayerIds = [
  "1",
  "2",
  "3",
  "4",
  "5",
  "01", // added in case your DB uses 01 format
  "02",
  "03",
  "04",
  "05"
];

// 2. ADD QUOTES HERE:
// Map the player_id (left) to their custom quote (right).
// If a player is in the array above but doesn't have a quote here, they get the fallback quote.
export const customQuotes: Record<string, string> = {
  "1": "This marathon has completely redefined competitive gaming for me. The energy here is just unmatched!",
  "2": "I never expected to find such a passionate and welcoming community. Every match is an adrenaline rush.",
  "3": "The level of competition here is insane. It pushes me to my absolute limits every single time.",
  "4": "From the organization to the players, everything is top-tier. Proud to be part of this.",
  "5": "An unforgettable experience! The thrill of climbing the leaderboard keeps me coming back.",
};

// 3. FALLBACK QUOTE:
// Used when a player is in the displayed list, but you forgot to add them to the customQuotes list.
export const fallbackTestimonial = "An incredible marathon experience! I'm ready for the next challenge.";
