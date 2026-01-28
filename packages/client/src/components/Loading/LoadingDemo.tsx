import React, { useState } from "react";
import { Loading, LoadingSpinner, LoadingScreen } from "@/components/Loading";
import styles from "./Loading.module.scss";

export const LoadingDemo: React.FC = () => {
  const [showFullscreen, setShowFullscreen] = useState(false);

  return (
    <div className={styles.demo}>
      <div className={styles.container}>
        <h1 className={styles.title}>Loading Component Demo</h1>

        {/* Fullscreen Demo */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Fullscreen Loading</h2>
          <button
            className={styles.button}
            onClick={() => setShowFullscreen(true)}
          >
            Show Fullscreen Loader
          </button>
          {showFullscreen && (
            <div onClick={() => setShowFullscreen(false)}>
              <LoadingScreen
                text="Loading your content..."
                subtext="This may take a few moments"
              />
            </div>
          )}
        </section>

        {/* Size Variants */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Size Variants</h2>
          <div className={styles.grid}>
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>Small</h3>
              <Loading size="small" text="Loading..." />
            </div>
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>Medium (Default)</h3>
              <Loading size="medium" text="Loading..." />
            </div>
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>Large</h3>
              <Loading size="large" text="Loading..." />
            </div>
          </div>
        </section>

        {/* With Progress Bar */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>With Progress Bar</h2>
          <div className={styles.card}>
            <Loading
              size="medium"
              text="Processing your request..."
              subtext="Please wait while we prepare your data"
              showProgress
            />
          </div>
        </section>

        {/* Inline Spinner */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Inline Spinner (No Text)</h2>
          <div className={styles.inlineDemo}>
            <LoadingSpinner size="small" />
            <span>Loading content...</span>
          </div>
        </section>

        {/* Overlay Mode */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Overlay Mode</h2>
          <div className={styles.overlayDemo}>
            <div className={styles.overlayContent}>
              <h3>Some Content</h3>
              <p>This content is behind the loading overlay</p>
              <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
                eiusmod tempor incididunt ut labore et dolore magna aliqua.
              </p>
            </div>
            <Loading mode="overlay" size="medium" text="Loading data..." />
          </div>
        </section>

        {/* Use Cases */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Common Use Cases</h2>
          <div className={styles.useCases}>
            <div className={styles.useCase}>
              <h4>Button with Spinner</h4>
              <button className={styles.loadingButton}>
                <LoadingSpinner size="small" />
                Processing...
              </button>
            </div>
            <div className={styles.useCase}>
              <h4>Card Loading State</h4>
              <div className={styles.loadingCard}>
                <Loading size="small" text="Fetching data..." />
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
