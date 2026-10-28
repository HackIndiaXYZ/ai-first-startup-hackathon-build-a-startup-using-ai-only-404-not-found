import React from "react";
import { BaseCard } from "./BaseCard";

export function ProjectsCard({ visible }) {
  const projects = [
    { title: "3D SHOWROOM", stack: "React · Three.js", desc: "Interactive 3D experience with custom shaders." },
    { title: "E-COMMERCE", stack: "Next.js · Node.js", desc: "High-performance storefront with real-time inventory." },
    { title: "DATA DASHBOARD", stack: "Django · Python", desc: "Analytical platform for complex visualization." },
    { title: "SAAS PLATFORM", stack: "TS · Tailwind", desc: "Scalable full-stack app with clean architecture." }
  ];

  return (
    <group rotation={[0, Math.PI, 0]} position={[0, 3, 0]}>
      <BaseCard visible={visible}>
        <div
          className="
            w-full
            max-w-[170vw] xs:max-w-[94vw]
            md:max-w-6xl lg:max-w-6xl 
            mx-auto
            /* Mobile: Tight padding | Desktop: Generous but contained */
            px-5 md:px-6
            py-4 md:py-1
            flex flex-col items-center md:items-start
            /* Mobile: Very small gap | Desktop: Standard spacing */
            space-y-4 md:space-y-8
          "
        >
          {/* Header - Scaled down for mobile to save height */}
          <div className="w-full">
            <h2 className="
              text-4xl xs:text-3xl sm:text-4xl md:text-5xl
              font-black tracking-tighter leading-none
              bg-gradient-to-r from-white to-white/50
              bg-clip-text text-transparent
              mb-1 md:mb-1
            ">
              FIELD OPERATIONS
            </h2>
            <p className="text-blue-400 text-[14px] md:text-sm font-bold uppercase tracking-[0.2em] opacity-80">
              Selected Works · 2023–2026
            </p>
          </div>

          {/* 2x2 Grid - Tightened for mobile */}
          <div className="grid grid-cols-2 gap-3 md:gap-6 w-full">
            {projects.map((project, i) => (
              <div 
                key={i} 
                className="
                  group relative 
                  bg-white/[0.03] backdrop-blur-md 
                  border border-white/10 
                  p-10 xs:p-4 md:p-3 
                  rounded-xl md:rounded-2xl 
                  transition-all duration-500 
                  hover:bg-white/[0.08] hover:border-blue-500/40
                "
              >
                {/* Index - Hidden on small mobile to save space */}
                <span className="hidden xs:block absolute top-2 right-3 text-[12px] md:text-xs font-mono text-gray-600">
                  0{i + 1}
                </span>

                <h3 className="text-md xs:text-base md:text-2xl font-black text-white mb-0.5 md:mb-2 group-hover:text-blue-400 transition-colors">
                  {project.title}
                </h3>
                
                <p className="text-blue-400/90 text-[14px] md:text-xs font-bold uppercase mb-1 md:mb-3">
                  {project.stack}
                </p>
                
                <p className="text-gray-400 text-[13px] xs:text-xs md:text-lg font-light leading-tight md:leading-snug italic line-clamp-2 md:line-clamp-none">
                  {project.desc}
                </p>

                {/* Desktop-only Action Link to keep mobile height low */}
                <div className="hidden md:flex items-center gap-3 mt-4 text-xs font-bold text-gray-500 uppercase tracking-widest group-hover:text-white transition-all">
                  <div className="w-4 h-[1px] bg-white/20 group-hover:w-10 group-hover:bg-blue-400 transition-all duration-500" />
                  <span>Explore</span>
                </div>
              </div>
            ))}
          </div>

          {/* Simple Footer to close the card visually */}
          <div className="w-full pt-2 md:pt-6 border-t border-white/5 flex justify-between items-center opacity-40">
            <span className="text-[14px] md:text-xs font-mono text-white tracking-widest uppercase">System.Ready()</span>
            <span className="text-[14px] md:text-xs font-mono text-white tracking-widest uppercase">Scaleable_v2.0</span>
          </div>
        </div>
      </BaseCard>
    </group>
  );
}