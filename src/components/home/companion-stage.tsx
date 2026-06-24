'use client';

import Image from 'next/image';
import type { CSSProperties, PointerEvent } from 'react';

const stageDefaults = {
  '--stage-far-x': '0px',
  '--stage-far-y': '0px',
  '--stage-mid-x': '0px',
  '--stage-mid-y': '0px',
  '--stage-near-x': '0px',
  '--stage-near-y': '0px',
  '--stage-tilt-x': '0deg',
  '--stage-tilt-y': '0deg',
  '--stage-shine-x': '50%',
  '--stage-shine-y': '22%',
} as CSSProperties;

export function CompanionStage() {
  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;

    event.currentTarget.style.setProperty('--stage-far-x', `${x * -18}px`);
    event.currentTarget.style.setProperty('--stage-far-y', `${y * -10}px`);
    event.currentTarget.style.setProperty('--stage-mid-x', `${x * 14}px`);
    event.currentTarget.style.setProperty('--stage-mid-y', `${y * 8}px`);
    event.currentTarget.style.setProperty('--stage-near-x', `${x * 26}px`);
    event.currentTarget.style.setProperty('--stage-near-y', `${y * 14}px`);
    event.currentTarget.style.setProperty('--stage-tilt-x', `${y * -4}deg`);
    event.currentTarget.style.setProperty('--stage-tilt-y', `${x * 6}deg`);
    event.currentTarget.style.setProperty('--stage-shine-x', `${50 + x * 22}%`);
    event.currentTarget.style.setProperty('--stage-shine-y', `${22 + y * 14}%`);
  }

  function handlePointerLeave(event: PointerEvent<HTMLDivElement>) {
    Object.entries(stageDefaults).forEach(([key, value]) => {
      event.currentTarget.style.setProperty(key, String(value));
    });
  }

  return (
    <div
      className="companion-stage relative order-first flex min-h-[640px] items-end justify-center md:min-h-[760px] lg:order-none lg:min-h-[980px]"
      onPointerLeave={handlePointerLeave}
      onPointerMove={handlePointerMove}
      style={stageDefaults}
    >
      <div className="neko-room-glow" />
      <div className="companion-stage__halo" />
      <div className="companion-stage__backlight" />
      <div className="companion-stage__ground" />
      <div className="companion-stage__spark companion-stage__spark--one" />
      <div className="companion-stage__spark companion-stage__spark--two" />
      <div className="companion-stage__portrait">
        <Image
          src="/assets/companion-lumia-stage-cutout.png"
          alt="Lumia 养成伙伴"
          width={430}
          height={1060}
          unoptimized
          priority
          className="neko-avatar companion-stage__avatar h-[620px] w-auto max-w-[82vw] object-contain md:h-[820px] lg:h-[900px]"
        />
      </div>
    </div>
  );
}
