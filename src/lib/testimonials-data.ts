// Keys match the player_id exactly as they come from Supabase (e.g., "1", "2")
export const defaultTestimonials: Record<string, string> = {
  "1": "This marathon has completely redefined competitive gaming for me. The energy here is just unmatched!",
  "2": "I never expected to find such a passionate and welcoming community. Every match is an adrenaline rush.",
  "3": "The level of competition here is insane. It pushes me to my absolute limits every single time.",
  "4": "From the organization to the players, everything is top-tier. Proud to be part of this.",
  "5": "An unforgettable experience! The thrill of climbing the leaderboard keeps me coming back."
};

// Fallback text if a player isn't in the default list
export const fallbackTestimonial = "An incredible marathon experience! I'm ready for the next challenge.";
