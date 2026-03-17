"use client";

import React, { useRef, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { CaretLeft, CaretRight } from "@phosphor-icons/react";

interface Game {
  id: string;
  name: string;
  img: string;
  tag: string;
}

interface GameCarouselProps {
  games: Game[];
}

export default function GameCarousel({ games }: GameCarouselProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);

  useGSAP(
    () => {
      if (!containerRef.current) return;

      const cards = cardRefs.current;
      cards.forEach((card, index) => {
        if (!card) return;

        const distance = Math.abs(index - activeIndex);
        const scale = Math.max(0.8, 1 - distance * 0.15);
        const opacity = Math.max(0.4, 1 - distance * 0.4);
        const zIndex = 10 - distance;
        
        // Horizontal offset: spacing between cards
        const offset = (index - activeIndex) * 160; 

        gsap.to(card, {
          x: offset,
          scale: scale,
          opacity: opacity,
          zIndex: zIndex,
          duration: 0.5,
          ease: "power3.out",
        });
      });
    },
    { scope: containerRef, dependencies: [activeIndex] }
  );

  const nextSlide = () => {
    setActiveIndex((prev) => (prev + 1) % games.length);
  };

  const prevSlide = () => {
    setActiveIndex((prev) => (prev - 1 + games.length) % games.length);
  };

  return (
    <div className="relative w-full overflow-hidden py-10 px-4">
      <div 
        ref={containerRef}
        className="relative h-48 flex items-center justify-center"
      >
        {games.map((game, index) => (
          <div
            key={game.id}
            ref={(el) => {
              cardRefs.current[index] = el;
            }}
            className="absolute shrink-0 "
            style={{ width: 140, height: 160 }}
          >
            <Link
              href={`/games/${game.id}`}
              className="relative block w-full h-full rounded-2xl overflow-hidden border border-white/10 shadow-2xl transition-transform active:scale-95"
            >
              <Image
                src={game.img}
                alt={game.name}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
              <div className="absolute bottom-3 left-0 right-0 px-3 text-center">
                <span className="font-bold text-sm text-white block leading-tight truncate">
                  {game.name}
                </span>
                <span className="text-[10px] text-purple-400 font-medium uppercase tracking-wider">
                  {game.tag}
                </span>
              </div>
            </Link>
          </div>
        ))}
      </div>

      {/* Navigation Controls */}
      <div className="mt-8 flex items-center justify-center gap-6">
        <button
          onClick={prevSlide}
          className="p-3 rounded-full bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors active:scale-90"
        >
          <CaretLeft size={20} weight="bold" />
        </button>
        
        {/* Indicators */}
        <div className="flex gap-2">
          {games.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === activeIndex ? "w-6 bg-purple-500" : "w-1.5 bg-white/20"
              }`}
            />
          ))}
        </div>

        <button
          onClick={nextSlide}
          className="p-3 rounded-full bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors active:scale-90"
        >
          <CaretRight size={20} weight="bold" />
        </button>
      </div>
    </div>
  );
}
