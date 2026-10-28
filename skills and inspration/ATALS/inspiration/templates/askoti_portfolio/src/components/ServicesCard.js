import React from "react";
import { BaseCard } from "./BaseCard";

export function ServicesCard({ visible }) {
  const services = [
    {
      title: "PERFORMANCE-FIRST FRONTEND",
      accent: "from-blue-500 to-cyan-400",
      desc: "Optimized React & Next.js applications with clean component architecture and SEO-conscious structure."
    },
    {
      title: "FULL-STACK ARCHITECTURE",
      accent: "from-purple-500 to-pink-500",
      desc: "API-driven platforms, secure auth, and scalable backend logic built for high-traffic environments."
    },
    {
      title: "DATA & AUTOMATION",
      accent: "from-green-500 to-emerald-400",
      desc: "Modern storefronts, real-time data interfaces, and automation-driven workflows for business growth."
    }
  ];

  return (
    <group rotation={[0, Math.PI / 2, 0]} position={[0, 3, 0]}>
      <BaseCard visible={visible}>
        <div
          className="
            w-full
            max-w-[170vw] xs:max-w-[94vw]
            md:max-w-7xl lg:max-w-6xl 
            mx-auto
            px-6 md:px-4
            py-4 md:py-4
            flex flex-col items-center md:items-start
            space-y-4 md:space-y-10
          "
        >
          {/* Tactical Header */}
          <div className="w-full relative">
            <div className="hidden md:block absolute -left-4 top-0 bottom-0 w-[2px] bg-gradient-to-b from-blue-500 to-transparent" />
            <h2 className="
              text-4xl xs:text-4xl md:text-5xl
              font-black tracking-tighter leading-none
              bg-gradient-to-r from-white via-white to-white/40
              bg-clip-text text-transparent
              mb-1
            ">
              EXECUTION STRATEGY
            </h2>
            <p className="text-gray-400 text-lg md:text-xl font-light max-w-xl leading-relaxed">
              Engineering web products designed for <span className="text-white font-medium">speed</span>, <span className="text-white font-medium">scalability</span>, and real-world usability.
            </p>
          </div>

          {/* Services List - Premium "Rows" */}
          <div className="w-full flex flex-col space-y-4 md:space-y-4">
            {services.map((s, i) => (
              <div 
                key={i} 
                className="
                  group relative 
                  bg-white/[0.02] hover:bg-white/[0.05]
                  border border-white/5 hover:border-white/20
                  rounded-xl md:rounded-2xl
                  p-2 md:p-1
                  transition-all duration-500
                "
              >
                <div className="flex flex-row items-center md:items-start gap-3 md:gap-8">
                  {/* Digital Index */}
                  <div className="flex flex-col items-center">
                    <span className={`text-2xl md:text-3xl font-black bg-gradient-to-br ${s.accent} bg-clip-text text-transparent opacity-40 group-hover:opacity-100 transition-opacity`}>
                      0{i + 1}
                    </span>
                  </div>
                  
                  <div className="flex flex-col items-center md:items-start text-center md:text-left">
                    <h3 className="text-lg md:text-2xl font-bold mb-1 md:mb-3 tracking-tight text-white group-hover:translate-x-1 transition-transform">
                      {s.title}
                    </h3>
                    <p className="text-gray-200 text-lg md:text-lg font-light leading-snug md:leading-relaxed max-w-1xl">
                      {s.desc}
                    </p>
                  </div>

                  {/* Desktop Hover Indicator */}
                  <div className="hidden md:block ml-auto self-center opacity-0 group-hover:opacity-100 transition-opacity mr-3">
                     <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Status Bar Footer */}
          <div className="w-full flex flex-col md:flex-row justify-between items-center pt-2 md:pt-6 border-t border-white/5 gap-2">
            <p className="text-[13px] md:text-xs uppercase tracking-[0.1em] text-blue-400/80 font-black">
              Clean Code · Scalable Systems · Reliable Delivery
            </p>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
              <span className="text-[15px] md:text-xs font-mono text-white uppercase">Deployment Ready</span>
            </div>
          </div>
        </div>
      </BaseCard>
    </group>
  );
}