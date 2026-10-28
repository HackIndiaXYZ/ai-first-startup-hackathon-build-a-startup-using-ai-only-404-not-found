import React from "react";
import { BaseCard } from "./BaseCard";

export function ProfileCard({ visible }) {
  return (
    <group position={[0, 3, 0]}>
      <BaseCard visible={visible}>
        <div
          className="
            w-full
            flex flex-col md:flex-row
            items-center md:items-center
            justify-center md:justify-between
            gap-8 md:gap-12 lg:gap-16
            py-4 md:py-0
          "
        >
          {/* Photo + subtle interactive glow */}
          <div className="flex-shrink-0 relative group mb-6 md:mb-0">
            <div
              className="
                w-44 h-44 sm:w-52 sm:h-52 md:w-60 md:h-60 lg:w-64 lg:h-64
                rounded-full
                border-4 border-white/15
                bg-gradient-to-br from-blue-500/10 to-purple-500/5
                overflow-hidden
                shadow-[0_0_40px_-10px_rgba(59,130,246,0.4),inset_0_2px_10px_rgba(255,255,255,0.08)]
                transition-all duration-500
                group-hover:scale-105 group-hover:shadow-[0_0_60px_-5px_rgba(59,130,246,0.6)]
                ring-1 ring-white/10
              "
            >
              <img
                src="/k.jpg"
                alt="Kastriot Aliu"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                loading="eager"
              />
            </div>

            {/* Optional soft pulsing ring */}
            <div
              className="
                absolute inset-0 rounded-full
                bg-gradient-to-r from-blue-400/20 via-purple-400/10 to-transparent
                animate-pulse-slow pointer-events-none
                opacity-60 group-hover:opacity-90 transition-opacity
              "
            />
          </div>

          {/* Text content – improved spacing & hierarchy */}
          <div
            className="
              flex-1 flex flex-col
              items-center md:items-start
              text-center md:text-left
              max-w-3xl
            "
          >
            <span
              className="
                text-sm sm:text-base md:text-lg lg:text-lg
                font-semibold tracking-[0.15em]
                text-blue-400/90 uppercase mb-2 md:mb-3
                drop-shadow-sm
              "
            >
              Frontend Specialist · Full-Stack Engineer
            </span>

            <h1
              className="
                text-5xl sm:text-6xl md:text-6xl lg:text-7xl
                font-black tracking-[-0.04em]
                leading-none mb-3 md:mb-4
                bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent
              "
            >
              KASTRIOT ALIU
            </h1>

            {/* Tech pills */}
            <div
              className="
                flex flex-wrap justify-center md:justify-start
                gap-2.5 sm:gap-3 md:gap-4 mb-5 md:mb-6
              "
            >
              {["React", "Next.js", "Node.js", "Python", "Three.js"].map((tech) => (
                <span
                  key={tech}
                  className="
                    px-3.5 py-1.5 text-sm font-medium
                    bg-white/5 backdrop-blur-sm border border-white/10
                    rounded-full text-gray-200
                    shadow-sm hover:bg-white/10 transition-colors
                  "
                >
                  {tech}
                </span>
              ))}
            </div>

            <blockquote
              className="
                text-lg md:text-xl lg:text-2xl
                font-light italic text-gray-200/90
                leading-relaxed mb-6 md:mb-8
                border-l-4 border-blue-500/40 pl-5 md:pl-7
                max-w-prose
                drop-shadow-md
              "
            >
              "I build fast, scalable web applications with clean architecture and real-world performance."
            </blockquote>

            <div
              className="
                flex flex-wrap justify-center md:justify-start
                gap-4 sm:gap-6 text-sm uppercase tracking-wider
                text-gray-400/80 font-medium
              "
            >
              <span>Performance-First</span>
              <span className="hidden sm:inline">•</span>
              <span>API-Driven</span>
              <span className="hidden sm:inline">•</span>
              <span>Clean Code</span>
            </div>
          </div>
        </div>
      </BaseCard>
    </group>
  );
}