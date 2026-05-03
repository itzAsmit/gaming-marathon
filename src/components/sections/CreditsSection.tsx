"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import ScrollReveal from "@/components/ScrollReveal";
import SectionHeader from "@/components/SectionHeader";
import { fetchPublicData } from "@/lib/fetchPublicData";
import { Instagram, Twitter, Linkedin } from "lucide-react";

interface Player {
  player_id: string;
  name: string;
  portrait_url?: string;
}

interface TeamMember {
  name: string;
  title: string;
  description: string;
  imageUrl: string;
  role: "organiser" | "developer";
  instagramUrl?: string;
  twitterUrl?: string;
  linkedinUrl?: string;
}

export default function CreditsSection() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadTeamData = async () => {
      try {
        setIsLoading(true);
        const players = await fetchPublicData<Player[]>("admin_players");

        const members: TeamMember[] = [];

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

        if (admin && admin.portrait_url) {
          members.push({
            name: admin.name || "Marathon Admin",
            title: "Event Organiser",
            description:
              "The strategic mastermind orchestrating every detail of the marathon. Ensuring seamless coordination, unprecedented engagement, and an unforgettable gaming experience for all participants.",
            imageUrl: admin.portrait_url,
            role: "organiser",
            instagramUrl: "#",
            twitterUrl: "#",
            linkedinUrl: "#",
          });
        }

        if (developer && developer.portrait_url) {
          members.push({
            name: developer.name || "Developer",
            title: "Technical Architect",
            description:
              "Crafted this interactive platform with meticulous precision and unwavering passion. Every feature, animation, and integration reflects dedication to delivering an exceptional user experience.",
            imageUrl: developer.portrait_url,
            role: "developer",
            instagramUrl: "https://instagram.com/asmittzzz",
            twitterUrl: "https://x.com/aizenrishiii",
            linkedinUrl: "https://linkedin.com/in/asmittzzz",
          });
        }

        setTeamMembers(members);
      } catch (error) {
        console.error("Failed to load team data:", error);
        setTeamMembers([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadTeamData();
  }, []);

  const organiser = teamMembers.find((m) => m.role === "organiser");
  const developer = teamMembers.find((m) => m.role === "developer");

  const SocialLinks = ({ member }: { member: TeamMember }) => {
    const links = [
      { icon: Instagram, url: member.instagramUrl, label: "Instagram" },
      { icon: Twitter, url: member.twitterUrl, label: "Twitter" },
      { icon: Linkedin, url: member.linkedinUrl, label: "LinkedIn" },
    ];

    return (
      <div className="flex space-x-3">
        {links.map(({ icon: Icon, url, label }) => (
          <a
            key={label}
            href={url || "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="w-10 h-10 bg-gray-900 dark:bg-gray-100 rounded-full flex items-center justify-center transition-colors hover:bg-gray-800 dark:hover:bg-gray-200 hover:scale-105"
            aria-label={label}
          >
            <Icon className="w-4 h-4 text-white dark:text-gray-900" />
          </a>
        ))}
      </div>
    );
  };

  const MemberCard = ({ member }: { member: TeamMember }) => (
    <div className="bg-white dark:bg-card rounded-2xl shadow-xl p-6">
      <div className="mb-4">
        <h3 className="text-lg font-cinzel font-bold text-gray-900 dark:text-white mb-1">
          {member.name}
        </h3>
        <p className="text-xs font-medium text-gray-700 dark:text-gray-400">
          {member.title}
        </p>
      </div>

      <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed mb-5">
        {member.description}
      </p>

      <SocialLinks member={member} />
    </div>
  );

  return (
    <section id="credits" className="relative py-24 px-4">
      <div className="max-w-7xl mx-auto">
        <ScrollReveal>
          <SectionHeader title="CREDITS" accent="THE TEAM" />
        </ScrollReveal>

        {isLoading ? (
          <div className="flex justify-center items-center py-24">
            <div className="animate-pulse text-gray-500">Loading team...</div>
          </div>
        ) : (
          <div className="mt-16">
            {/* Team members side-by-side with staggered layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Left: Organiser - Image on left, card on right, positioned higher */}
              {organiser && (
                <ScrollReveal delay={0.1}>
                  <motion.div
                    className="flex flex-col lg:flex-row gap-6 lg:items-start lg:-translate-y-6"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                  >
                    {/* Image - Left */}
                    <div className="w-full lg:w-1/2 relative">
                      <div className="rounded-2xl overflow-hidden shadow-lg">
                        <img
                          src={organiser.imageUrl}
                          alt={organiser.name}
                          className="w-full h-80 lg:h-96 object-cover"
                          draggable={false}
                        />
                      </div>
                    </div>

                    {/* Card - Overlapping Right */}
                    <div className="w-full lg:w-1/2 flex items-start">
                      <div className="-ml-20 lg:-ml-28 z-10 w-full">
                        <MemberCard member={organiser} />
                      </div>
                    </div>
                  </motion.div>
                </ScrollReveal>
              )}

              {/* Right: Developer - Card on left, image on right, positioned lower */}
              {developer && (
                <ScrollReveal delay={0.2}>
                  <motion.div
                    className="flex flex-col lg:flex-row-reverse gap-6 lg:items-end lg:translate-y-6"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                  >
                    {/* Image - Right */}
                    <div className="w-full lg:w-1/2 relative">
                      <div className="rounded-2xl overflow-hidden shadow-lg">
                        <img
                          src={developer.imageUrl}
                          alt={developer.name}
                          className="w-full h-80 lg:h-96 object-cover"
                          draggable={false}
                        />
                      </div>
                    </div>

                    {/* Card - Overlapping Left */}
                    <div className="w-full lg:w-1/2 flex items-end">
                      <div className="-mr-20 lg:-mr-28 z-10 w-full">
                        <MemberCard member={developer} />
                      </div>
                    </div>
                  </motion.div>
                </ScrollReveal>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <ScrollReveal delay={0.4}>
          <div
            className="mt-20 text-center border-t pt-8"
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
