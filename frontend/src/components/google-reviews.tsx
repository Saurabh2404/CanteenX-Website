import { useEffect, useRef, useState } from "react";
import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useReducedMotion,
} from "framer-motion";
import { Pause, Play, Star, ArrowUpRight } from "lucide-react";
import type { GoogleReview, GoogleReviews } from "@/types/reviews";
function ReviewCard({ review }: { review: GoogleReview }) {
  return (
    <article className="review-card">
      <div className="review-author">
        {review.photo ? (
          <img
            src={review.photo}
            alt=""
            loading="lazy"
            referrerPolicy="no-referrer"
          />
        ) : (
          <span className="review-avatar">{review.author.slice(0, 1)}</span>
        )}
        <div>
          {review.authorUrl ? (
            <a href={review.authorUrl} target="_blank" rel="noreferrer">
              {review.author}
            </a>
          ) : (
            <strong>{review.author}</strong>
          )}
          <small>{review.relativeTime}</small>
        </div>
        <span className="review-provider">Google Maps</span>
      </div>
      <div
        className="review-stars"
        aria-label={`${review.rating} out of 5 stars`}
      >
        {[1, 2, 3, 4, 5].map((n) => (
          <Star
            key={n}
            size={16}
            fill={n <= review.rating ? "currentColor" : "none"}
          />
        ))}
      </div>
      {review.text ? (
        <p dir="auto">{review.text}</p>
      ) : (
        <p>Rating shared on Google Maps.</p>
      )}
      {review.url && (
        <a
          className="review-source"
          href={review.url}
          target="_blank"
          rel="noreferrer"
        >
          Read on Google Maps <ArrowUpRight size={13} />
        </a>
      )}
    </article>
  );
}
export function GoogleReviewsSection() {
  const [data, setData] = useState<GoogleReviews | null>(null);
  const [failed, setFailed] = useState(false);
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const reduced = useReducedMotion();
  const group = useRef<HTMLDivElement>(null);
  const width = useRef(0);
  const x = useMotionValue(0);
  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/reviews", { cache: "no-store", signal: controller.signal })
      .then((r) => {
        if (!r.ok) throw Error();
        return r.json();
      })
      .then(setData)
      .catch((e) => {
        if (e.name !== "AbortError") setFailed(true);
      });
    return () => controller.abort();
  }, []);
  useEffect(() => {
    if (!group.current) return;
    const observer = new ResizeObserver(([entry]) => {
      width.current =
        entry.borderBoxSize?.[0]?.inlineSize ||
        entry.target.getBoundingClientRect().width;
    });
    observer.observe(group.current);
    return () => observer.disconnect();
  }, [data, reduced]);
  useEffect(() => {
    if (reduced) x.set(0);
  }, [reduced, x]);
  useAnimationFrame((_time, delta) => {
    if (
      reduced ||
      paused ||
      hovered ||
      focused ||
      document.visibilityState !== "visible" ||
      !width.current ||
      !data?.reviews.length
    )
      return;
    const next = x.get() - Math.min(delta, 50) * 0.024;
    x.set(next <= -width.current ? next + width.current : next);
  });
  return (
    <section
      className="section reviews-section"
      id="reviews"
      aria-labelledby="reviews-heading"
    >
      <div className="section-head">
        <div>
          <p className="eyebrow">VOICES FROM OUR COMMUNITY</p>
          <h2 id="reviews-heading">Every visit has a story.</h2>
          <p className="reviews-intro">
            Experiences shared by customers of ARDH SAINIK CANTEEN, Kanti.
          </p>
        </div>
        {data?.status === "ready" && (
          <div className="review-summary">
            <span>Google Maps</span>
            {typeof data.rating === "number" && (
              <strong>
                <Star size={19} fill="currentColor" /> {data.rating.toFixed(1)}{" "}
                <small>/ 5</small>
              </strong>
            )}
            {typeof data.count === "number" && (
              <small>{data.count} customer ratings</small>
            )}
          </div>
        )}
      </div>
      {data?.status === "ready" && data.reviews.length > 0 ? (
        <>
          <div
            className={`reviews-window ${reduced ? "reviews-static" : ""}`}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            onFocusCapture={() => setFocused(true)}
            onBlurCapture={(e) => {
              if (!e.currentTarget.contains(e.relatedTarget)) setFocused(false);
            }}
          >
            <motion.div className="reviews-track" style={{ x }}>
              <div className="reviews-group" ref={group}>
                {data.reviews.map((r) => (
                  <ReviewCard review={r} key={r.id} />
                ))}
              </div>
              {!reduced && (
                <div className="reviews-group" aria-hidden="true" inert>
                  {data.reviews.map((r) => (
                    <ReviewCard review={r} key={`repeat-${r.id}`} />
                  ))}
                </div>
              )}
            </motion.div>
          </div>
          <div className="reviews-actions">
            {!reduced && (
              <button
                className="review-pause"
                onClick={() => setPaused(!paused)}
                aria-pressed={paused}
              >
                {paused ? <Play size={15} /> : <Pause size={15} />}{" "}
                {paused ? "Resume reviews" : "Pause reviews"}
              </button>
            )}
            {data.url && (
              <a
                className="button"
                href={data.url}
                target="_blank"
                rel="noreferrer"
              >
                View all reviews on Google <ArrowUpRight size={17} />
              </a>
            )}
          </div>
          {data.attributions.map((a) =>
            a.url ? (
              <a
                className="review-attribution"
                href={a.url}
                key={a.name}
                target="_blank"
                rel="noreferrer"
              >
                {a.name}
              </a>
            ) : (
              <span className="review-attribution" key={a.name}>
                {a.name}
              </span>
            ),
          )}
        </>
      ) : (
        <div className="reviews-empty">
          <span className="review-empty-mark">“</span>
          <h3>Your experience matters.</h3>
          <p>
            {!data && !failed
              ? "Loading customer reviews…"
              : data?.status === "ready"
                ? "No Google reviews are available yet."
                : "Customer reviews will appear here when our Google listing is connected."}
          </p>
          {data?.url && (
            <a
              className="text-link"
              href={data.url}
              target="_blank"
              rel="noreferrer"
            >
              Visit our Google listing ↗
            </a>
          )}
        </div>
      )}
    </section>
  );
}
