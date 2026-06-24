'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

const CUBISM_CORE_SRC = '/vendor/live2d/live2dcubismcore.min.js';
const HIYORI_MODEL_SRC = '/live2d/hiyori/Hiyori.model3.json';

type Live2DModelInstance = {
  anchor: { set: (x: number, y?: number) => void };
  height: number;
  scale: { set: (value: number) => void; y: number };
  x: number;
  y: number;
  focus: (x: number, y: number, instant?: boolean) => void;
  motion: (group: string, index?: number, priority?: number) => Promise<boolean>;
  on: (event: 'hit', listener: (hitAreas: string[]) => void) => void;
  destroy: (options?: { children?: boolean; texture?: boolean; baseTexture?: boolean }) => void;
};

type PixiApplication = {
  renderer: { resize: (width: number, height: number) => void };
  stage: { addChild: (child: Live2DModelInstance) => void };
  view: HTMLCanvasElement;
  destroy: (removeView?: boolean, options?: { children?: boolean; texture?: boolean; baseTexture?: boolean }) => void;
};

declare global {
  interface Window {
    PIXI?: unknown;
    Live2DCubismCore?: unknown;
  }
}

let cubismCorePromise: Promise<void> | null = null;

function loadScript(src: string) {
  return new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${src}"]`);
    if (existing) {
      if (existing.dataset.loaded === 'true') {
        resolve();
        return;
      }

      existing.addEventListener('load', () => resolve(), { once: true });
      existing.addEventListener('error', () => reject(new Error(`Failed to load ${src}`)), { once: true });
      return;
    }

    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.dataset.loaded = 'false';
    script.addEventListener(
      'load',
      () => {
        script.dataset.loaded = 'true';
        resolve();
      },
      { once: true },
    );
    script.addEventListener('error', () => reject(new Error(`Failed to load ${src}`)), { once: true });
    document.head.appendChild(script);
  });
}

function loadCubismCore() {
  cubismCorePromise ??= loadScript(CUBISM_CORE_SRC);
  return cubismCorePromise;
}

export function CompanionStage() {
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const appRef = useRef<PixiApplication | null>(null);
  const modelRef = useRef<Live2DModelInstance | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [hasFailed, setHasFailed] = useState(false);

  useEffect(() => {
    let disposed = false;
    let resizeObserver: ResizeObserver | null = null;

    async function setupLive2D() {
      if (!stageRef.current || !canvasRef.current) {
        return;
      }

      try {
        await loadCubismCore();

        const PIXI = await import('pixi.js');
        window.PIXI = PIXI;
        const { Live2DModel, MotionPriority } = await import('pixi-live2d-display/cubism4');
        Live2DModel.registerTicker(PIXI.Ticker);

        const app = new PIXI.Application({
          view: canvasRef.current,
          autoDensity: true,
          backgroundAlpha: 0,
          antialias: true,
          resolution: Math.min(window.devicePixelRatio || 1, 2),
          resizeTo: stageRef.current,
        }) as PixiApplication;

        const model = (await Live2DModel.from(HIYORI_MODEL_SRC, {
          autoInteract: true,
          autoUpdate: true,
        })) as Live2DModelInstance;

        if (disposed) {
          model.destroy({ children: true, texture: true, baseTexture: true });
          app.destroy(true, { children: true, texture: true, baseTexture: true });
          return;
        }

        app.stage.addChild(model);
        appRef.current = app;
        modelRef.current = model;

        const fitModel = () => {
          const stage = stageRef.current;
          if (!stage) {
            return;
          }

          const { width, height } = stage.getBoundingClientRect();
          app.renderer.resize(width, height);

          const baseModelHeight = model.height / (model.scale.y || 1);
          const targetHeight = width < 520
            ? Math.min(height * 0.9, width * 2)
            : Math.min(height * 0.8, width * 2.4);
          const modelScale = targetHeight / baseModelHeight;
          model.scale.set(modelScale);
          model.anchor.set(0.5, 1);
          model.x = width / 2;
          model.y = width < 520 ? height - 14 : height - 18;
        };

        fitModel();
        resizeObserver = new ResizeObserver(fitModel);
        resizeObserver.observe(stageRef.current);

        model.on('hit', (hitAreas) => {
          if (hitAreas.includes('Body')) {
            void model.motion('TapBody', 0, MotionPriority.FORCE);
          }
        });

        void model.motion('Idle', undefined, MotionPriority.IDLE);
        setIsReady(true);
      } catch (error) {
        console.error('Live2D Hiyori failed to load', error);
        setHasFailed(true);
      }
    }

    void setupLive2D();

    return () => {
      disposed = true;
      resizeObserver?.disconnect();
      modelRef.current?.destroy({ children: true, texture: true, baseTexture: true });
      appRef.current?.destroy(true, { children: true, texture: true, baseTexture: true });
      modelRef.current = null;
      appRef.current = null;
    };
  }, []);

  function handlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    const model = modelRef.current;
    if (!model) {
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    model.focus(event.clientX - rect.left, event.clientY - rect.top);
  }

  function handlePointerLeave() {
    const stage = stageRef.current;
    const model = modelRef.current;
    if (!stage || !model) {
      return;
    }

    const { width, height } = stage.getBoundingClientRect();
    model.focus(width / 2, height / 2, true);
  }

  return (
    <div
      ref={stageRef}
      className="companion-stage live2d-stage relative order-first flex min-h-[640px] items-end justify-center md:min-h-[760px] lg:order-none lg:min-h-[980px]"
      onPointerLeave={handlePointerLeave}
      onPointerMove={handlePointerMove}
    >
      <div className="neko-room-glow" />
      <div className="companion-stage__halo" />
      <div className="companion-stage__backlight" />
      <div className="companion-stage__ground" />
      <div className="companion-stage__spark companion-stage__spark--one" />
      <div className="companion-stage__spark companion-stage__spark--two" />
      <canvas
        ref={canvasRef}
        aria-label="Hiyori Momose Live2D companion"
        className={`companion-stage__live2d ${isReady ? 'companion-stage__live2d--ready' : ''}`}
      />
      {(!isReady || hasFailed) && (
        <Image
          src="/assets/companion-lumia-stage-cutout.png"
          alt="Live2D 加载中的备用伙伴立绘"
          width={430}
          height={1060}
          unoptimized
          priority
          className="neko-avatar companion-stage__fallback h-[620px] w-auto max-w-[82vw] object-contain md:h-[820px] lg:h-[900px]"
        />
      )}
      <p className="companion-stage__license">
        Hiyori Momose sample data © Live2D Inc.
      </p>
    </div>
  );
}
