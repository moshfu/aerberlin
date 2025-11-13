import { siteConfig } from "@/config/site";
import { HomeBodyFlag } from "@/components/layout/home-body-flag";
import { SpinningMark } from "@/components/motion/spinning-mark";

const MARQUEE_TEXT = "aerberlinaerberlinaerberlinaerberlinaerberlinaerberlinaerberlinaerberlinaerberlinaerberlinaerberlinaerberlinaerberlinaerberlinaerberlinaerberlinaerberlinaerberlinaerberlinaerberlin";

export default async function HomePage() {
  return (
    <div className="aer-root">
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
              <animate attributeName="baseFrequency" dur="7s" values="0.006;0.01;0.006" repeatCount="indefinite" />
            </feTurbulence>
            <feDisplacementMap in="SourceGraphic" in2="warp" scale="18" />
          </filter>
        </defs>
      </svg>

      <div className="aer-background" aria-hidden="true">
        <div className="aer-bg-overlay" />
        <div className="aer-vhs-overlay" />
      </div>

      <div className="aer-content">
        {siteConfig.brand.logo ? (
          <SpinningMark
            size={720}
            orbitScale={0.85}
            className="aer-logo aer-logo--home"
            imageSrc={siteConfig.brand.logo}
            imageAlt={`${siteConfig.name} logo`}
          />
        ) : null}

        <div className="aer-marquee-shell" aria-hidden="true">
          <div className="aer-marquee-row aer-marquee-row--top">
            <div className="aer-marquee aer-marquee--reverse">
              <span>{MARQUEE_TEXT}</span>
              <span>{MARQUEE_TEXT}</span>
            </div>
          </div>
          <div className="aer-marquee-row aer-marquee-row--main">
            <div className="aer-marquee">
              <span>{MARQUEE_TEXT}</span>
              <span>{MARQUEE_TEXT}</span>
            </div>
          </div>
          <div className="aer-marquee-row aer-marquee-row--bottom">
            <div className="aer-marquee aer-marquee--reverse">
              <span>{MARQUEE_TEXT}</span>
              <span>{MARQUEE_TEXT}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
