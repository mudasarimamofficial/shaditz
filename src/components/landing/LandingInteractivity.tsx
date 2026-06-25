"use client";

// @memory: de-iframe migration (docs/DE_IFRAME_MIGRATION_PLAN.md)
// Client-side behavior for the inline (de-iframed) landing. Re-implements the
// template's interactive script (loader, custom cursor, scroll-reveal, filter
// buttons, smooth scroll, mobile hamburger) plus the contact-form submit that
// previously lived in the iframe bootstrap's bindContactForm.

import { useEffect } from "react";

type ContactLabels = {
  loadingText?: string;
  successText?: string;
  errorText?: string;
  submitText?: string;
};

export function LandingInteractivity({ contact }: { contact?: ContactLabels }) {
  useEffect(() => {
    const cleanups: Array<() => void> = [];

    // Loader fade (loader is pre-hidden in the template; keep parity).
    const loader = document.getElementById("loader");
    if (loader) {
      const t = window.setTimeout(() => {
        loader.style.transition = "opacity 0.8s";
        loader.style.opacity = "0";
        window.setTimeout(() => {
          loader.style.display = "none";
        }, 800);
      }, 2000);
      cleanups.push(() => window.clearTimeout(t));
    }

    // Custom cursor follow.
    const cur = document.getElementById("cur");
    const cur2 = document.getElementById("cur2");
    if (cur && cur2) {
      let mx = 0, my = 0, cx = 0, cy = 0, raf = 0;
      const onMove = (e: MouseEvent) => {
        mx = e.clientX; my = e.clientY;
        cur.style.left = mx + "px"; cur.style.top = my + "px";
      };
      const anim = () => {
        cx += (mx - cx) * 0.13; cy += (my - cy) * 0.13;
        cur2.style.left = cx + "px"; cur2.style.top = cy + "px";
        raf = requestAnimationFrame(anim);
      };
      document.addEventListener("mousemove", onMove);
      raf = requestAnimationFrame(anim);
      cleanups.push(() => {
        document.removeEventListener("mousemove", onMove);
        cancelAnimationFrame(raf);
      });
    }

    // Scroll reveal.
    const revealItems = Array.from(document.querySelectorAll<HTMLElement>(".reveal"));
    if (revealItems.length) {
      if ("IntersectionObserver" in window) {
        const obs = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry, i) => {
              if (entry.isIntersecting) {
                const el = entry.target as HTMLElement;
                window.setTimeout(() => el.classList.add("visible"), i * 100);
                obs.unobserve(el);
              }
            });
          },
          { threshold: 0.1 },
        );
        revealItems.forEach((el) => obs.observe(el));
        cleanups.push(() => obs.disconnect());
      } else {
        revealItems.forEach((el) => el.classList.add("visible"));
      }
    }

    // Filter buttons.
    const onFilterClick = (e: Event) => {
      const btn = (e.target as HTMLElement)?.closest(".filter-btn");
      if (!btn) return;
      document.querySelectorAll(".filter-btn").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
    };
    document.addEventListener("click", onFilterClick);
    cleanups.push(() => document.removeEventListener("click", onFilterClick));

    // Smooth scroll for in-page anchors.
    const onAnchorClick = (e: Event) => {
      const a = (e.target as HTMLElement)?.closest('a[href^="#"]') as HTMLAnchorElement | null;
      if (!a) return;
      const href = a.getAttribute("href") || "";
      if (href.length < 2) return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth" });
      }
    };
    document.addEventListener("click", onAnchorClick);
    cleanups.push(() => document.removeEventListener("click", onAnchorClick));

    // Mobile hamburger.
    const nav = document.querySelector("nav");
    const toggle = document.querySelector<HTMLButtonElement>(".menu-toggle");
    const links = document.querySelector(".nav-links");
    if (nav && toggle) {
      const close = () => {
        nav.classList.remove("menu-open");
        toggle.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      };
      const onToggle = () => {
        const open = nav.classList.toggle("menu-open");
        toggle.classList.toggle("open", open);
        toggle.setAttribute("aria-expanded", open ? "true" : "false");
      };
      const onLinkClick = (e: Event) => {
        if ((e.target as HTMLElement)?.closest("a")) close();
      };
      const onKey = (e: KeyboardEvent) => {
        if (e.key === "Escape") close();
      };
      toggle.addEventListener("click", onToggle);
      links?.addEventListener("click", onLinkClick);
      document.addEventListener("keydown", onKey);
      cleanups.push(() => {
        toggle.removeEventListener("click", onToggle);
        links?.removeEventListener("click", onLinkClick);
        document.removeEventListener("keydown", onKey);
      });
    }

    // Contact form submit.
    const btn = document.querySelector<HTMLButtonElement>("#contact .fsubmit");
    if (btn && !btn.dataset.submitBound) {
      btn.dataset.submitBound = "1";
      const status = document.createElement("div");
      status.id = "shaditz-form-status";
      status.style.marginTop = "16px";
      status.style.fontSize = "13px";
      status.style.letterSpacing = "1px";
      btn.parentNode?.insertBefore(status, btn.nextSibling);

      const onSubmit = () => {
        const inputs = Array.from(document.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>("#contact .contact-right .fi"));
        const name = inputs[0]?.value.trim() || "";
        const email = inputs[1]?.value.trim() || "";
        const project = inputs[2]?.value.trim() || "";
        const budget = inputs[3]?.value.trim() || "";
        const message = inputs[4]?.value.trim() || "";
        if (!name || !email || !project || !message) {
          status.style.color = "#e8c97a";
          status.textContent = "Please complete all fields.";
          return;
        }
        btn.disabled = true;
        btn.textContent = contact?.loadingText || "Sending...";
        status.textContent = "";
        fetch("/api/leads", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ name, email, business_type: project, revenue: budget, message }),
        })
          .then((r) => {
            if (!r.ok) throw new Error("submit_failed");
            return r.json();
          })
          .then(() => {
            status.style.color = "#e8c97a";
            status.textContent = contact?.successText || "Message sent.";
            inputs.forEach((input) => {
              input.value = "";
            });
          })
          .catch(() => {
            status.style.color = "#e03030";
            status.textContent = contact?.errorText || "Something went wrong. Please try again.";
          })
          .finally(() => {
            btn.disabled = false;
            btn.textContent = contact?.submitText || "Send Message →";
          });
      };
      btn.addEventListener("click", onSubmit);
      cleanups.push(() => btn.removeEventListener("click", onSubmit));
    }

    return () => cleanups.forEach((fn) => fn());
  }, [contact]);

  return null;
}
