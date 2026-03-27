import HeroSection from "../components/sections/HeroSection";
import LeaderboardSection from "@/components/sections/LeaderboardSection";
import LazyMount from "@/components/LazyMount";
import PlayersSection from "@/components/sections/PlayersSection";
import GamesSection from "@/components/sections/GamesSection";
import SpecialItemsSection from "@/components/sections/SpecialItemsSection";
import HallOfFameSection from "@/components/sections/HallOfFameSection";
import CreditsSection from "@/components/sections/CreditsSection";

const Index = () => {
  return (
    <div className="site-shell min-h-[100svh] md:min-h-screen">
      {/* Scrollable content layer */}
      <div className="relative z-10">
        <div className="hero-surface">
          <HeroSection />
        </div>
        <div className="site-section">
          <LeaderboardSection />
        </div>

        {/* Sections below the fold: mount only when user scrolls near them */}
        <LazyMount minHeight="100svh">
          <div className="site-section">
            <PlayersSection />
          </div>
        </LazyMount>
        <LazyMount minHeight="100svh">
          <div className="site-section">
            <GamesSection />
          </div>
        </LazyMount>
        <LazyMount minHeight="90svh">
          <div className="site-section">
            <SpecialItemsSection />
          </div>
        </LazyMount>
        <LazyMount minHeight="100svh">
          <div className="site-section">
            <HallOfFameSection />
          </div>
        </LazyMount>
        <LazyMount minHeight="80svh">
          <div className="site-section">
            <CreditsSection />
          </div>
        </LazyMount>
      </div>
    </div>
  );
};

export default Index;
