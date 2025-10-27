import { ReactNode } from "react";
import { HomeBodyFlag } from "@/components/layout/home-body-flag";
import { cn } from "@/lib/utils";

interface SubpageFrameProps {
  title: string;
  children: ReactNode;
  eyebrow?: string;
  description?: ReactNode;
  marqueeText?: string;
  actions?: ReactNode;
  meta?: ReactNode;
  footnote?: ReactNode;
  className?: string;
}

export function SubpageFrame({
  title,
  eyebrow,
  description,
  marqueeText,
  actions,
  meta,
  footnote,
  className,
  children,
}: SubpageFrameProps) {
  const text = (marqueeText ?? `${title} — ${title} — ${title}`).toUpperCase();

  return (
    <div className={cn("aer-root", className)}>
      <HomeBodyFlag />
      <svg aria-hidden="true" focusable="false" className="aer-noise-defs">
        <defs>
          <filter id="aer-noise">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" />
            <feColorMatrix type="saturate" values="0" />
            <feBlend mode="multiply" in="SourceGraphic" />
          </filter>
          <filter id="aer-bloom">
            <feGaussianBlur stdDeviation="3" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="aer-marquee-warp">
            <feTurbulence type="fractalNoise" baseFrequency="0.006" numOctaves="2" seed="6" result="warp">
              <animate
                attributeName="baseFrequency"
                dur="7s"
                values="0.006;0.01;0.006"
                repeatCount="indefinite"
              />
            </feTurbulence>
            <feDisplacementMap in="SourceGraphic" in2="warp" scale="18" />
          </filter>
        </defs>
      </svg>

      <div className="aer-background" aria-hidden="true">
        <div className="aer-bg-overlay" />
        <div className="aer-vhs-overlay" />
      </div>

      <div className="aer-content aer-content--subpage">
        <div className="aer-subpage">
          <div className="aer-subpage__inner">
            <header className="aer-subpage__header">
              <div className="aer-subpage__title-block">
                {eyebrow ? <span className="aer-subpage__eyebrow">{eyebrow}</span> : null}
                <h1 className="aer-subpage__title">{title}</h1>
                {description ? <div className="aer-subpage__lede">{description}</div> : null}
              </div>
              {(actions || meta) && (
                <div className="aer-subpage__meta">
                  {actions ? <div className="aer-subpage__actions">{actions}</div> : null}
                  {meta ? <div className="aer-subpage__aside">{meta}</div> : null}
                </div>
              )}
            </header>

            <div className="aer-subpage__body">{children}</div>

            {footnote ? <footer className="aer-subpage__footer">{footnote}</footer> : null}
          </div>
        </div>

        <div className="aer-marquee-shell" aria-hidden="true">
          <div className="aer-marquee-row aer-marquee-row--top">
            <div className="aer-marquee aer-marquee--reverse">
              <span>{text}</span>
              <span>{text}</span>
            </div>
          </div>
          <div className="aer-marquee-row aer-marquee-row--main">
            <div className="aer-marquee">
              <span>{text}</span>
              <span>{text}</span>
            </div>
          </div>
          <div className="aer-marquee-row aer-marquee-row--bottom">
            <div className="aer-marquee aer-marquee--reverse">
              <span>{text}</span>
              <span>{text}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
