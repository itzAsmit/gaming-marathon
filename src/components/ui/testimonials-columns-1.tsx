"use client";
import React from "react";
import { motion } from "motion/react";

const testimonialTextStyle = {
  fontSize: '12px',
  lineHeight: '1.4',
  color: 'var(--foreground)',
  margin: 0,
} as const;

export const TestimonialsColumn = (props: {
  className?: string;
  testimonials: { text: string; image: string; name: string; role: string }[];
  duration?: number;
}) => {
  return (
    <div className={props.className}>
      <motion.div
        animate={{
          translateY: "-50%",
        }}
        transition={{
          duration: props.duration || 10,
          repeat: Infinity,
          ease: "linear",
          repeatType: "loop",
        }}
        className="flex flex-col gap-6 pb-6 bg-background"
      >
        {[
          ...new Array(2).fill(0).map((_, index) => (
            <React.Fragment key={index}>
              {props.testimonials.map(({ text, image, name, role }, i) => (
                <div className="p-10 rounded-3xl shadow-2xl shadow-black/20 max-w-xs w-full bg-background" key={i}>
                  <p style={testimonialTextStyle} className="font-inter">{text}</p>
                  <div className="flex items-center gap-2 mt-5">
                    <img
                      width={40}
                      height={40}
                      src={image}
                      alt={name}
                      className="h-10 w-10 rounded-full object-cover border border-foreground/10 shadow-sm"
                    />
                    <div className="flex flex-col">
                      <div className="font-jura text-sm text-foreground tracking-widest font-bold">{name}</div>
                      <div className="text-xs text-foreground/60 tracking-wider font-inter">{role}</div>                    </div>
                  </div>
                </div>
              ))}
            </React.Fragment>
          )),
        ]}
      </motion.div>
    </div>
  );
};
