import React from "react";
import styles from "./Loading.module.scss";

export interface LoadingProps {
  /** Display mode - fullscreen, overlay, or inline */
  mode?: "fullscreen" | "overlay" | "inline";
  /** Size of the loading animation */
  size?: "small" | "medium" | "large";
  /** Loading text to display */
  text?: string;
  /** Additional subtext */
  subtext?: string;
  /** Show progress bar */
  showProgress?: boolean;
  /** Additional CSS class */
  className?: string;
}

// Generate cog wheel teeth path
const generateCogPath = (radius: number, teeth: number = 12) => {
  const innerRadius = radius * 0.7;
  const toothDepth = radius * 0.15;
  const angleStep = (2 * Math.PI) / teeth;

  let path = "";

  for (let i = 0; i < teeth; i++) {
    const angle1 = i * angleStep;
    const angle2 = angle1 + angleStep * 0.4;
    const angle3 = angle1 + angleStep * 0.6;
    const angle4 = (i + 1) * angleStep;

    const outerX1 = Math.cos(angle1) * radius;
    const outerY1 = Math.sin(angle1) * radius;
    const toothX1 = Math.cos(angle2) * (radius + toothDepth);
    const toothY1 = Math.sin(angle2) * (radius + toothDepth);
    const toothX2 = Math.cos(angle3) * (radius + toothDepth);
    const toothY2 = Math.sin(angle3) * (radius + toothDepth);
    const outerX2 = Math.cos(angle4) * radius;
    const outerY2 = Math.sin(angle4) * radius;

    if (i === 0) {
      path += `M ${outerX1} ${outerY1} `;
    }

    path += `L ${toothX1} ${toothY1} L ${toothX2} ${toothY2} L ${outerX2} ${outerY2} `;
  }

  path += "Z";

  // Add inner circle
  path += ` M ${innerRadius} 0 `;
  path += `A ${innerRadius} ${innerRadius} 0 1 0 ${-innerRadius} 0 `;
  path += `A ${innerRadius} ${innerRadius} 0 1 0 ${innerRadius} 0 Z`;

  return path;
};

interface CogProps {
  className?: string;
  radius: number;
  teeth?: number;
}

const Cog: React.FC<CogProps> = ({ className, radius, teeth = 12 }) => {
  const size = radius * 2 + 20; // Add padding for teeth
  const center = size / 2;

  return (
    <div className={className}>
      <svg
        className={styles.cogSvg}
        viewBox={`0 0 ${size} ${size}`}
        xmlns="http://www.w3.org/2000/svg"
      >
        <g transform={`translate(${center}, ${center})`}>
          <path d={generateCogPath(radius, teeth)} />
        </g>
      </svg>
    </div>
  );
};

/**
 * Loading component with animated cog wheel
 * Can be used as fullscreen loader, overlay, or inline
 */
export const Loading: React.FC<LoadingProps> = ({
  mode = "inline",
  size = "medium",
  text = "Loading...",
  subtext,
  showProgress = false,
  className,
}) => {
  return (
    <div
      className={`${styles.loading} ${styles[mode]} ${className || ""}`}
      role="status"
      aria-live="polite"
      aria-label={text}
    >
      <div className={`${styles.container} ${styles[size]}`}>
        <div className={styles.cogContainer}>
          {/* Background glow */}
          <div className={styles.glow} />

          {/* Large cog */}
          <Cog
            className={`${styles.cog} ${styles.large}`}
            radius={50}
            teeth={12}
          />

          {/* Medium cog */}
          <Cog
            className={`${styles.cog} ${styles.medium}`}
            radius={35}
            teeth={10}
          />

          {/* Small cog */}
          <Cog
            className={`${styles.cog} ${styles.small}`}
            radius={22}
            teeth={8}
          />

          {/* Center pulse circle */}
          <div className={styles.centerCircle} />

          {/* Orbiting particles */}
          <div className={styles.particles}>
            <div className={styles.particle} />
            <div className={styles.particle} />
            <div className={styles.particle} />
            <div className={styles.particle} />
          </div>
        </div>

        {text && <div className={styles.text}>{text}</div>}
        {subtext && <div className={styles.subtext}>{subtext}</div>}

        {showProgress && (
          <div className={styles.progress}>
            <div className={styles.progressBar} />
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Simple spinner for inline use
 */
export const LoadingSpinner: React.FC<{
  size?: "small" | "medium" | "large";
  className?: string;
}> = ({ size = "small", className }) => {
  return <Loading mode="inline" size={size} text="" className={className} />;
};

/**
 * Fullscreen loading overlay
 */
export const LoadingScreen: React.FC<{
  text?: string;
  subtext?: string;
}> = ({ text = "Loading...", subtext }) => {
  return (
    <Loading
      mode="fullscreen"
      size="large"
      text={text}
      subtext={subtext}
      showProgress
    />
  );
};
