import VideoBackground from "@/components/VideoBackground";
import HeroSection from "@/components/sections/HeroSection";
import LeaderboardSection from "@/components/sections/LeaderboardSection";
import LazyMount from "@/components/LazyMount";
import PlayersSection from "@/components/sections/PlayersSection";
import GamesSection from "@/components/sections/GamesSection";
import SpecialItemsSection from "@/components/sections/SpecialItemsSection";
import HallOfFameSection from "@/components/sections/HallOfFameSection";
import CreditsSection from "@/components/sections/CreditsSection";

const Index = () => {
  return (
    <div className="relative min-h-[100svh] md:min-h-screen" style={{ background: "hsl(var(--brown-deep))" }}>
      <VideoBackground />

      {/* Scrollable content layer */}
      <div className="relative z-10">
        <HeroSection />
        <LeaderboardSection />

        {/* Sections below the fold: mount only when user scrolls near them */}
        <LazyMount>
          <PlayersSection />
        </LazyMount>
        <LazyMount>
          <GamesSection />
        </LazyMount>
        <LazyMount>
          <SpecialItemsSection />
        </LazyMount>
        <LazyMount>
          <HallOfFameSection />
        </LazyMount>
        <LazyMount>
          <CreditsSection />
        </LazyMount>
      </div>
    </div>
  );
};

export default Index;
