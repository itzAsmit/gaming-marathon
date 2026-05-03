"use client";

import { useEffect, useState } from "react";
import ScrollReveal from "@/components/ScrollReveal";
import SectionHeader from "@/components/SectionHeader";
import { TestimonialCarousel } from "@/components/ui/profile-card-testimonial-carousel";
import { fetchPublicData } from "@/lib/fetchPublicData";
import type { Testimonial } from "@/components/ui/profile-card-testimonial-carousel";

interface Player {
  player_id: string;
  name: string;
  portrait_url?: string;
}

export default function CreditsSection() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadTeamData = async () => {
      try {
        setIsLoading(true);
        const players = await fetchPublicData<Player[]>("admin_players");

        // Find Ritesh Dutta (Admin) and Asmit Biswas (Developer)
        const admin = players.find(
          (p) =>
            p.name?.toLowerCase().includes("ritesh") ||
            p.name?.toLowerCase().includes("admin")
        );
        const developer = players.find(
          (p) =>
            p.name?.toLowerCase().includes("asmit") ||
            p.name?.toLowerCase().includes("biswas")
        );

        const teamTestimonials: Testimonial[] = [];

        if (admin && admin.portrait_url) {
          teamTestimonials.push({
            name: admin.name || "Marathon Admin",
            title: "Event Organiser",
            description:
              "The strategic mastermind orchestrating every detail of the marathon. Ensuring seamless coordination, unprecedented engagement, and an unforgettable gaming experience for all participants.",
            imageUrl: admin.portrait_url,
            instagramUrl: "#",
            twitterUrl: "#",
            linkedinUrl: "#",
          });
        }

        if (developer && developer.portrait_url) {
          teamTestimonials.push({
            name: developer.name || "Developer",
            title: "Technical Architect",
            description:
              "Crafted this interactive platform with meticulous precision and unwavering passion. Every feature, animation, and integration reflects dedication to delivering an exceptional user experience.",
            imageUrl: developer.portrait_url,
            instagramUrl: "https://instagram.com/aizenrishiii",
            twitterUrl: "https://x.com/aizenrishiii",
            linkedinUrl: "https://linkedin.com/in/asmit-biswas",
          });
        }

        setTestimonials(teamTestimonials);
      } catch (error) {
        console.error("Failed to load team data:", error);
        // No fallback - only show data from database
        setTestimonials([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadTeamData();
  }, []);

  return (
    <section id="credits" className="relative py-24 px-4">
      <div className="max-w-6xl mx-auto">
        <ScrollReveal>
          <SectionHeader title="CREDITS" accent="THE TEAM" />
        </ScrollReveal>

        {isLoading ? (
          <div className="flex justify-center items-center py-16">
            <div className="animate-pulse text-gray-500">Loading team...</div>
          </div>
        ) : (
          <ScrollReveal delay={0.2}>
            <TestimonialCarousel testimonials={testimonials} />
          </ScrollReveal>
        )}

        {/* Footer */}
        <ScrollReveal delay={0.4}>
          <div
            className="mt-16 text-center border-t pt-8"
            style={{ borderColor: "hsla(var(--gold) / 0.2)" }}
          >
            <p
              className="font-cinzel text-xs tracking-[0.5em]"
              style={{
                color: "hsl(var(--gold) / 0.5)",
                fontFamily: "Cinzel, serif",
              }}
            >
              GAMING MARATHON © 2026 — ALL RIGHTS RESERVED
            </p>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
