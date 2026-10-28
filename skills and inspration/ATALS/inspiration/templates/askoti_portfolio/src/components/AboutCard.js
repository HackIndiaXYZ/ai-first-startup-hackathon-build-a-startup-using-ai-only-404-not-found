import React from "react";
import { BaseCard } from "./BaseCard";

export function AboutCard({ visible }) {
  return (
    <group rotation={[0, -Math.PI / 2, 0]} position={[0, 3, 0]}>
      <BaseCard visible={visible}>
        <div
          className="
            w-full
            max-w-[170vw] xs:max-w-[94vw]
            /* Desktop Constrain: prevents the text from stretching too wide */
            md:max-w-5xl lg:max-w-6xl 
            mx-auto
            px-6 md:px-12
            /* Vertical padding: reduced on desktop to prevent overflow */
            py-6 md:py-10 lg:py-12
            flex flex-col items-center md:items-start
            text-center md:text-left
            /* Spacing between sections */
            space-y-6 md:space-y-10
          "
        >
          {/* Heading */}
          <div className="w-full">
            <h2
              className="
                text-4xl xs:text-4xl sm:text-5xl 
                /* Fixed Desktop Size: 6xl is big enough to be bold but won't overflow */
                md:text-6xl lg:text-7xl
                font-black tracking-tighter leading-[0.9]
                bg-gradient-to-r from-white via-blue-50 to-purple-100/80
                bg-clip-text text-transparent
                mb-2 md:mb-4
              "
            >
              ENGINEERING APPROACH
            </h2>

            <p
              className="
                text-gray-200/90
                text-lg sm:text-lg md:text-xl
                leading-relaxed font-light
                max-w-2xl
                mx-auto md:mx-0
              "
            >
              I craft high-performance, scalable web systems engineered for speed today
              and maintainability tomorrow.
            </p>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-2 gap-4 md:gap-8 w-full relative">
            {/* Frontend */}
            <div className="
              relative bg-white/5 backdrop-blur-xl border border-blue-500/20 
              rounded-2xl p-5 md:p-8 lg:p-10
              transition-transform hover:-translate-y-1
            ">
              <h3 className="text-3xl md:text-3xl lg:text-3xl font-black text-white mb-2">
                Frontend
              </h3>
              <p className="text-blue-400 font-bold text-md md:text-base lg:text-lg mb-2 uppercase tracking-tight">
                React · Next.js · Tailwind · Three.js
              </p>
              <p className="text-gray-300 text-lg md:text-base lg:text-lg font-light italic leading-snug">
                Pixel-perfect interfaces. Smooth animations. Component systems built to scale.
              </p>
            </div>

            {/* Backend */}
            <div className="
              relative bg-white/5 backdrop-blur-xl border border-green-500/20 
              rounded-2xl p-5 md:p-8 lg:p-10
              transition-transform hover:-translate-y-1
            ">
              <h3 className="text-3xl md:text-3xl lg:text-3xl font-black text-white mb-2">
                Backend
              </h3>
              <p className="text-green-400 font-bold text-md md:text-base lg:text-lg mb-2 uppercase tracking-tight">
                Node.js · Python · APIs · DBs
              </p>
              <p className="text-gray-300 text-lg md:text-base lg:text-lg font-light italic leading-snug">
                Secure, efficient services. Clean logic. Systems designed to grow.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="w-full pt-4 md:pt-8 border-t border-white/10 flex flex-col items-center space-y-2">
            <p className="text-pink-400/90 font-bold text-md md:text-lg tracking-widest uppercase">
              Git · Docker · Testing · CI/CD
            </p>
            <div className="flex gap-4 text-[14px] md:text-xs uppercase tracking-[0.3em] text-gray-500 font-bold">
              <span>Clean Architecture</span>
              <span className="hidden md:inline">•</span>
              <span>Performance Driven</span>
            </div>
          </div>
        </div>
      </BaseCard>
    </group>
  );
}