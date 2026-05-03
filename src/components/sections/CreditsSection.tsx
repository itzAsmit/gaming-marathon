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
      <div className="flex space-x-4">
        {links.map(({ icon: Icon, url, label }) => (
          <a
            key={label}
            href={url || "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="w-12 h-12 bg-black rounded-full flex items-center justify-center transition-colors hover:scale-105 cursor-pointer shadow-sm"
            aria-label={label}
          >
            <Icon className="w-5 h-5 text-white" />
          </a>
        ))}
      </div>
    );
  };

  const MemberCard = ({ member }: { member: TeamMember }) => (
    <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-xl w-full">
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          {member.name}
        </h3>
        <p className="text-sm font-medium text-gray-500">
          {member.title}
        </p>
      </div>

      <p className="text-base text-gray-700 leading-relaxed mb-8">
        {member.description}
      </p>

      <SocialLinks member={member} />
    </div>
  );

  return (
    <section id="credits" className="relative py-24 px-4 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <ScrollReveal>
          <SectionHeader title="CREDITS" accent="THE TEAM" />
        </ScrollReveal>

        {isLoading ? (
          <div className="flex justify-center items-center py-24">
            <div className="animate-pulse text-gray-500">Loading team...</div>
          </div>
        ) : (
          <div className="mt-12">
            <div className="flex flex-col gap-16 lg:gap-24">
              {/* Organiser - Image left, Card overlapping right */}
              {organiser && (
                <ScrollReveal delay={0.1}>
                  <motion.div
                    className="flex flex-col lg:flex-row items-center w-full lg:w-[85%] relative lg:-translate-x-12"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                  >
                    <div className="w-[280px] h-[360px] sm:w-[350px] sm:h-[460px] flex-shrink-0 z-0">
                      <div className="w-full h-full rounded-3xl overflow-hidden bg-gray-200 dark:bg-neutral-800">
                        <img
                          src={organiser.imageUrl}
                          alt={organiser.name}
                          className="w-full h-full object-cover"
                          draggable={false}
                        />
                      </div>
                    </div>
                    
                    <div className="z-10 lg:ml-[-60px] mt-[-60px] lg:mt-0 flex-1 w-full max-w-[600px]">
                      <MemberCard member={organiser} />
                    </div>
                  </motion.div>
                </ScrollReveal>
              )}

              {/* Developer - Card overlapping left, Image right */}
              {developer && (
                <ScrollReveal delay={0.2}>
                  <motion.div
                    className="flex flex-col lg:flex-row-reverse items-center w-full lg:w-[85%] ml-auto relative lg:translate-x-12"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                  >
                    <div className="w-[280px] h-[360px] sm:w-[350px] sm:h-[460px] flex-shrink-0 z-0">
                      <div className="w-full h-full rounded-3xl overflow-hidden bg-gray-200 dark:bg-neutral-800">
                        <img
                          src={developer.imageUrl}
                          alt={developer.name}
                          className="w-full h-full object-cover"
                          draggable={false}
                        />
                      </div>
                    </div>
                    
                    <div className="z-10 lg:mr-[-60px] mt-[-60px] lg:mt-0 flex-1 w-full max-w-[600px]">
                      <MemberCard member={developer} />
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
