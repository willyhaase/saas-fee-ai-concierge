import type { Metadata } from "next";
import styles from "./story.module.css";

export const metadata: Metadata = {
  title: "Wil Concierge Story",
  description: "Animated story page for Wil Concierge.",
};

export default function StoryPage() {
  return (
    <main className={styles.page}>
      <section
        className={styles.story}
        aria-label="Wil Concierge animated story"
      >
        <div className={styles.bg} />
        <div className={styles.vignette} />
        <div className={styles.progress} />

        <section className={styles.brand}>
          <div className={styles.kicker}>Digitaler Gaesteservice</div>
          <h1>Wil Concierge</h1>
          <p>Lokale Antworten fuer Gaeste. Direkt im Chat.</p>
        </section>

        <section className={styles.phone} aria-label="Chat preview">
          <div className={styles.assistant}>
            <div className={styles.avatar}>AI</div>
            <div>
              <strong>Wil</strong>
              <span>online in Saas-Fee</span>
            </div>
          </div>
          <div className={`${styles.bubble} ${styles.b1}`}>
            Was moechten Sie heute erleben?
          </div>
          <div className={`${styles.bubble} ${styles.user} ${styles.b2}`}>
            Dinner, Wetter und Bergbahnen?
          </div>
          <div className={`${styles.bubble} ${styles.b3}`}>
            Ich helfe mit lokalen Empfehlungen.
          </div>
        </section>

        <section className={styles.cards} aria-label="Feature cards">
          <div className={`${styles.card} ${styles.c1}`}>
            <span>⌂</span>Unterkunft
          </div>
          <div className={`${styles.card} ${styles.c2}`}>
            <span>☼</span>Wetter
          </div>
          <div className={`${styles.card} ${styles.c3}`}>
            <span>↟</span>Aktivitaeten
          </div>
          <div className={`${styles.card} ${styles.c4}`}>
            <span>▣</span>Events
          </div>
        </section>

        <div className={styles.closing}>
          Rund um die Uhr. Lokal. Persoenlich gedacht.
        </div>
      </section>
    </main>
  );
}
