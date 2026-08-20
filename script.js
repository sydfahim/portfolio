const root = document.documentElement;
    const nav = document.querySelector(".nav");
    const navToggle = document.querySelector(".nav__toggle");
    const navLinks = document.querySelector(".nav__links");
    const splitTargets = document.querySelectorAll(".split-text");
    const blurTargets = document.querySelectorAll(".blur-text");
    const pixelCanvas = document.querySelector(".pixel-blast");
    const squareCursor = document.querySelector(".square-cursor");
    const heroStack = document.querySelector(".hero-stack");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const canUseSquareCursor = window.matchMedia("(hover: hover) and (pointer: fine)").matches && !reducedMotion;

    if (squareCursor && canUseSquareCursor) {
      document.body.classList.add("has-square-cursor");

      window.addEventListener("pointermove", (event) => {
        squareCursor.classList.add("is-visible");
        squareCursor.style.transform = `translate3d(${event.clientX}px, ${event.clientY}px, 0)`;
      }, { passive: true });

      document.addEventListener("pointerleave", () => {
        squareCursor.classList.remove("is-visible");
      });
    }

    splitTargets.forEach((target) => {
      const words = target.textContent.trim().split(/\s+/);
      const accentWords = new Set((target.dataset.accentWords || "").toLowerCase().split(/\s+/).filter(Boolean));
      target.textContent = "";
      let lineGroup = target;
      words.forEach((word, index) => {
        if (word === "|") {
          target.append(document.createElement("br"));
          lineGroup = document.createElement("span");
          lineGroup.className = "split-line split-line--nowrap";
          target.append(lineGroup);
          return;
        }
        const normalizedWord = word.toLowerCase().replace(/[^a-z0-9]/g, "");
        const span = document.createElement("span");
        span.className = "split-word";
        if (accentWords.has(normalizedWord)) span.classList.add("split-word--accent");
        span.style.setProperty("--i", index);
        span.textContent = word;
        lineGroup.append(span, " ");
      });
    });

    blurTargets.forEach((target) => {
      if (target.matches("h1")) {
        target.querySelectorAll(".hero__name-line").forEach((line) => {
          const chars = [...line.textContent];
          line.textContent = "";
          chars.forEach((char, index) => {
            if (char === " ") {
              const space = document.createElement("span");
              space.className = "blur-space";
              space.textContent = " ";
              line.append(space);
              return;
            }
            const span = document.createElement("span");
            span.className = "blur-letter";
            span.style.setProperty("--i", index);
            span.textContent = char;
            line.append(span);
          });
        });
        return;
      }

      const walker = document.createTreeWalker(target, NodeFilter.SHOW_TEXT);
      const textNodes = [];
      while (walker.nextNode()) textNodes.push(walker.currentNode);
      let index = 0;

      textNodes.forEach((node) => {
        const fragment = document.createDocumentFragment();
        [...node.textContent].forEach((char) => {
          if (char === " ") {
            fragment.append(" ");
            return;
          }

          const span = document.createElement("span");
          span.className = "blur-letter";
          span.style.setProperty("--i", index);
          span.textContent = char;
          fragment.append(span);
          index += 1;
        });
        node.replaceWith(fragment);
      });
    });

    const closeNav = () => {
      if (!nav || !navToggle) return;
      nav.classList.remove("is-open");
      navToggle.setAttribute("aria-expanded", "false");
      navLinks?.setAttribute("aria-hidden", "true");
    };

    navToggle?.addEventListener("click", () => {
      const willOpen = !nav?.classList.contains("is-open");
      nav?.classList.toggle("is-open", willOpen);
      navToggle.setAttribute("aria-expanded", String(willOpen));
      navLinks?.setAttribute("aria-hidden", String(!willOpen));
    });

    navLinks?.addEventListener("click", (event) => {
      if (event.target instanceof HTMLAnchorElement) closeNav();
    });

    document.addEventListener("click", (event) => {
      if (!nav?.classList.contains("is-open")) return;
      if (event.target instanceof Node && nav.contains(event.target)) return;
      closeNav();
    });

    window.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeNav();
      if (event.key === "Escape") closeProjectModal?.();
      if (event.key === "Escape") closeContactModal?.();
    });

    const heroStackBlurQuery = window.matchMedia("(min-width: 641px)");

    const updateSpine = () => {
      const scrollable = document.body.scrollHeight - window.innerHeight;
      const progress = scrollable > 0 ? window.scrollY / scrollable : 0;
      root.style.setProperty("--progress", `${Math.max(3, progress * 100)}%`);
      root.style.setProperty("--dot", `${84 + progress * (window.innerHeight - 134)}px`);
    };

    const updateHeroStackBlur = () => {
      if (!heroStack || reducedMotion) return;

      if (!heroStackBlurQuery.matches) {
        heroStack.style.setProperty("--hero-stack-blur", "0px");
        heroStack.style.setProperty("--hero-stack-scale", "1");
        return;
      }

      const rect = heroStack.getBoundingClientRect();
      const progress = Math.max(0, Math.min(1, -rect.top / window.innerHeight));
      heroStack.style.setProperty("--hero-stack-blur", `${(progress * 13).toFixed(2)}px`);
      // Scale from 1 down to 0.88 as the hero scrolls out — this is the piece
      // that was missing. Blur alone reads as a flat fade; pairing it with a
      // shrink is what makes the stack feel like it's physically receding.
      heroStack.style.setProperty("--hero-stack-scale", (1 - progress * 0.12).toFixed(4));
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add("is-visible");
      });
    }, { threshold: 0.14, rootMargin: "0px 0px -52px" });

    document.querySelectorAll(".reveal").forEach((item) => observer.observe(item));
    document.querySelectorAll(".case__visual").forEach((visual) => {
      visual.addEventListener("pointermove", (event) => {
        const rect = visual.getBoundingClientRect();
        visual.style.setProperty("--mx", `${event.clientX - rect.left}px`);
        visual.style.setProperty("--my", `${event.clientY - rect.top}px`);
      });
    });

    const portfolioFilters = document.querySelectorAll(".portfolio-filter");
    const portfolioCards = document.querySelectorAll(".portfolio-card");
    const serviceItems = document.querySelectorAll(".service-item");
    const serviceImage = document.querySelector(".service-visual__image");
    const serviceVisual = document.querySelector(".service-visual");
    const serviceVisualIndex = document.querySelector(".service-visual__index");
    const serviceVisualTitle = document.querySelector(".service-visual__title");
    const parallaxItems = [...document.querySelectorAll("[data-parallax]")];
    const scrollLiftItems = [...document.querySelectorAll(".section > .wrap")]
      .filter((item) => !item.querySelector(".portrait, .process__sticky"));

    scrollLiftItems.forEach((item) => item.classList.add("scroll-lift"));

    const FILTER_OUT_MS = 300;
    const FLIP_MOVE_MS = 520;

    const getCardRects = (cards) => {
      const rects = new Map();
      cards.forEach((card) => {
        rects.set(card, card.getBoundingClientRect());
      });
      return rects;
    };
    let isPortfolioFiltering = false;

    portfolioFilters.forEach((filter) => {
      filter.addEventListener("click", () => {
        if (filter.classList.contains("is-active") || isPortfolioFiltering) return;

        const category = filter.dataset.filter || "all";

        portfolioFilters.forEach((item) => {
          item.classList.toggle("is-active", item === filter);
        });

        if (reducedMotion) {
          portfolioCards.forEach((card) => {
            const shouldShow = category === "all" || card.dataset.category === category;
            card.classList.toggle("is-hidden", !shouldShow);
          });
          return;
        }

        isPortfolioFiltering = true;
        const cards = [...portfolioCards];
        const leavingCards = cards.filter((card) => {
          const isVisible = !card.classList.contains("is-hidden");
          const willShow = category === "all" || card.dataset.category === category;
          return isVisible && !willShow;
        });
        const stayingCards = cards.filter((card) => {
          const isVisible = !card.classList.contains("is-hidden");
          const willShow = category === "all" || card.dataset.category === category;
          return isVisible && willShow;
        });
        const enteringCards = cards.filter((card) => {
          const isVisible = !card.classList.contains("is-hidden");
          const willShow = category === "all" || card.dataset.category === category;
          return !isVisible && willShow;
        });
        const firstRects = getCardRects(stayingCards);

        leavingCards.forEach((card) => {
          card.classList.add("is-filtering-out");
        });

        window.setTimeout(() => {
          leavingCards.forEach((card) => {
            card.classList.add("is-hidden");
            card.classList.remove("is-filtering-out");
          });
          enteringCards.forEach((card) => {
            card.classList.remove("is-hidden");
            card.classList.add("is-entering");
          });

          const lastRects = getCardRects(stayingCards);

          stayingCards.forEach((card) => {
            const first = firstRects.get(card);
            const last = lastRects.get(card);
            if (!first || !last) return;

            const deltaX = first.left - last.left;
            const deltaY = first.top - last.top;

            if (deltaX || deltaY) {
              card.style.transition = "none";
              card.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
            }
          });

          void document.body.offsetHeight;

          requestAnimationFrame(() => {
            stayingCards.forEach((card) => {
              card.classList.add("is-flip-moving");
              card.style.transition = "";
              card.style.transform = "";
            });

            enteringCards.forEach((card) => {
              card.classList.remove("is-entering");
            });

            window.setTimeout(() => {
              stayingCards.forEach((card) => {
                card.classList.remove("is-flip-moving");
              });
              isPortfolioFiltering = false;
            }, FLIP_MOVE_MS);
          });
        }, leavingCards.length ? FILTER_OUT_MS : 0);
      });
    });

    const projectLinkFields = [
      ["github", "GitHub"],
      ["liveDemo", "Live Demo"],
      ["caseStudy", "Case Study"],
      ["figma", "Figma Prototype"]
    ];

    const projectModal = document.createElement("div");
    projectModal.className = "project-modal";
    projectModal.setAttribute("role", "dialog");
    projectModal.setAttribute("aria-modal", "true");
    projectModal.setAttribute("aria-hidden", "true");
    projectModal.innerHTML = `
      <div class="project-modal__panel" role="document">
        <button class="project-modal__close" type="button" aria-label="Close project preview">&times;</button>
        <img class="project-modal__image" alt="">
        <div class="project-modal__content">
          <h3 class="project-modal__title"></h3>
          <p class="project-modal__description"></p>
          <div class="project-modal__actions" aria-label="Project links"></div>
        </div>
      </div>
    `;
    document.body.append(projectModal);

    const modalImage = projectModal.querySelector(".project-modal__image");
    const modalTitle = projectModal.querySelector(".project-modal__title");
    const modalDescription = projectModal.querySelector(".project-modal__description");
    const modalActions = projectModal.querySelector(".project-modal__actions");
    const modalClose = projectModal.querySelector(".project-modal__close");
    let lastFocusedProject = null;

    const openProjectModal = (card) => {
      const image = card.querySelector(".portfolio-image");
      const title = card.dataset.title || card.querySelector(".portfolio-info h3")?.textContent.trim() || "Project";
      const summary = card.dataset.desc || card.querySelector(".portfolio-info p")?.textContent.trim() || "";
      const modalImageSource = card.dataset.image || image?.currentSrc || image?.src || "";

      lastFocusedProject = card;
      modalTitle.textContent = title;
      modalDescription.textContent = summary;
      modalImage.src = modalImageSource;
      modalImage.alt = image?.alt || `${title} preview`;
      modalActions.textContent = "";
      modalActions.hidden = true;

      projectLinkFields.forEach(([key, label]) => {
        const href = card.dataset[key];
        if (!href) return;

        const link = document.createElement("a");
        link.href = href;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.className = "project-modal__link";
        link.textContent = label;
        modalActions.append(link);
        modalActions.hidden = false;
      });

      projectModal.classList.add("is-open");
      projectModal.setAttribute("aria-hidden", "false");
      document.body.classList.add("modal-open");
      modalClose.focus({ preventScroll: true });
    };

    const closeProjectModal = () => {
      if (!projectModal.classList.contains("is-open")) return;
      projectModal.classList.remove("is-open");
      projectModal.setAttribute("aria-hidden", "true");
      document.body.classList.remove("modal-open");
      lastFocusedProject?.focus({ preventScroll: true });
    };

    portfolioCards.forEach((card) => {
      const title = card.querySelector(".portfolio-info h3")?.textContent.trim() || "project";
      card.setAttribute("role", "button");
      card.setAttribute("aria-label", `Open ${title} preview`);

      card.addEventListener("click", () => openProjectModal(card));
      card.addEventListener("keydown", (event) => {
        if (event.key !== "Enter" && event.key !== " ") return;
        event.preventDefault();
        openProjectModal(card);
      });
    });

    modalClose?.addEventListener("click", closeProjectModal);
    projectModal.addEventListener("click", (event) => {
      if (event.target === projectModal) closeProjectModal();
    });

    const contactModal = document.getElementById("contactModal");
    const startProjectBtn = document.getElementById("startProjectBtn");
    const contactModalClose = contactModal?.querySelector(".contact-modal__close");
    const contactForm = document.getElementById("contactForm");
    const contactStatus = contactForm?.querySelector(".contact-modal__status");

    const openContactModal = () => {
      contactModal?.classList.add("is-open");
      contactModal?.setAttribute("aria-hidden", "false");
      document.body.classList.add("modal-open");
      contactModal?.querySelector("input")?.focus({ preventScroll: true });
    };

    const closeContactModal = () => {
      if (!contactModal?.classList.contains("is-open")) return;
      contactModal.classList.remove("is-open");
      contactModal.setAttribute("aria-hidden", "true");
      document.body.classList.remove("modal-open");
      startProjectBtn?.focus({ preventScroll: true });
    };

    startProjectBtn?.addEventListener("click", openContactModal);

    // Nav "Start a project" link points at the footer button by id (for a
    // no-JS fallback that still scrolls there), but the actual intent is a
    // one-click path to the form from anywhere on the site — so intercept it
    // and open the modal directly instead of just scrolling to the button.
    document.querySelectorAll('a[href="#startProjectBtn"]').forEach((link) => {
      link.addEventListener("click", (event) => {
        event.preventDefault();
        closeNav();
        openContactModal();
      });
    });

    contactModalClose?.addEventListener("click", closeContactModal);
    contactModal?.addEventListener("click", (event) => {
      if (event.target === contactModal) closeContactModal();
    });

    contactForm?.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (contactStatus) contactStatus.textContent = "Sending...";

      try {
        const response = await fetch(contactForm.action, {
          method: "POST",
          headers: { Accept: "application/json" },
          body: new FormData(contactForm)
        });

        if (contactStatus) {
          contactStatus.textContent = response.ok
            ? "Sent - I'll be in touch soon."
            : "Something went wrong. Email me directly instead.";
        }
        if (response.ok) contactForm.reset();
      } catch {
        if (contactStatus) contactStatus.textContent = "Something went wrong. Email me directly instead.";
      }
    });

    let activeServiceIndex = 0;
    const activateService = (item) => {
      if (!(item instanceof HTMLElement) || !serviceImage) return;
      const nextIndex = [...serviceItems].indexOf(item);
      if (nextIndex >= 0) activeServiceIndex = nextIndex;

      serviceItems.forEach((service) => {
        service.classList.toggle("is-active", service === item);
      });

      const nextImage = item.dataset.image;
      const nextTitle = item.dataset.title || item.textContent.trim();
      const nextVisualIndex = item.dataset.index || "";

      if (serviceVisualIndex) serviceVisualIndex.textContent = nextVisualIndex;
      if (serviceVisualTitle) {
        const [firstWord, ...restWords] = nextTitle.split(" ");
        serviceVisualTitle.textContent = "";
        const accent = document.createElement("span");
        accent.className = "service-visual__title-accent";
        accent.textContent = firstWord;
        serviceVisualTitle.append(accent, restWords.length ? ` ${restWords.join(" ")}` : "");
      }

      if (!nextImage || serviceImage.getAttribute("src") === nextImage) return;

      const imageLoader = new Image();
      imageLoader.decoding = "async";
      imageLoader.onload = () => {
        serviceImage.setAttribute("src", nextImage);
        serviceImage.setAttribute("alt", item.dataset.alt || nextTitle || "");
      };
      imageLoader.src = nextImage;
    };

    serviceItems.forEach((item) => {
      item.addEventListener("mouseenter", () => activateService(item));
      item.addEventListener("focus", () => activateService(item));
      item.addEventListener("click", () => activateService(item));
    });

    [...serviceItems].map((item) => item.dataset.image).filter(Boolean).forEach((src) => {
      const preload = new Image();
      preload.decoding = "async";
      preload.src = src;
    });

    const makeSpark = (x, y) => {
      const spark = document.createElement("span");
      spark.className = "click-spark";
      spark.style.transform = `translate(${x}px, ${y}px)`;

      for (let i = 0; i < 8; i += 1) {
        const line = document.createElement("span");
        line.className = "spark-line";
        line.style.setProperty("--angle", `${i * 45}deg`);
        spark.append(line);
      }

      document.body.append(spark);
      window.setTimeout(() => spark.remove(), 620);
    };

    window.addEventListener("click", (event) => {
      if (reducedMotion || !canUseSquareCursor) return;
      makeSpark(event.clientX, event.clientY);
    });

    const createScrollMotion = () => {
      if (reducedMotion) return;
      if (parallaxItems.length === 0 && scrollLiftItems.length === 0) return;

      const motionItems = [...parallaxItems, ...scrollLiftItems].map((item) => ({
        item,
        y: 0,
        lift: 0
      }));

      const updateScrollMotion = () => {
        const viewportCenter = window.innerHeight / 2;

        motionItems.forEach((entry) => {
          const { item } = entry;
          const rect = item.getBoundingClientRect();

          const itemCenter = rect.top + rect.height / 2;
          const distance = itemCenter - viewportCenter;

          if (item.hasAttribute("data-parallax")) {
            const speed = Number.parseFloat(item.dataset.parallaxSpeed || "0.08");
            const scale = Number.parseFloat(item.dataset.parallaxScale || "1");
            const targetY = Math.max(-165, Math.min(165, distance * speed));

            entry.y += (targetY - entry.y) * 0.075;
            item.style.setProperty("--parallax-y", `${entry.y.toFixed(2)}px`);
            item.style.setProperty("--parallax-scale", String(scale));
          }

          if (item.classList.contains("scroll-lift")) {
            const targetLift = Math.max(-58, Math.min(58, distance * -0.035));
            entry.lift += (targetLift - entry.lift) * 0.065;
            item.style.setProperty("--scroll-lift-y", `${entry.lift.toFixed(2)}px`);
          }
        });

        requestAnimationFrame(updateScrollMotion);
      };

      updateScrollMotion();
    };

    const startPixelBlast = () => {
      if (!pixelCanvas || reducedMotion) return;

      const context = pixelCanvas.getContext("2d");
      const colors = ["rgba(215,25,32,.34)", "rgba(255,255,255,.18)", "rgba(255,255,255,.06)"];
      let width = 0;
      let height = 0;
      let pixels = [];

      const resize = () => {
        const ratio = Math.min(window.devicePixelRatio || 1, 2);
        const rect = pixelCanvas.getBoundingClientRect();
        width = rect.width;
        height = rect.height;
        pixelCanvas.width = Math.max(1, Math.floor(width * ratio));
        pixelCanvas.height = Math.max(1, Math.floor(height * ratio));
        context.setTransform(ratio, 0, 0, ratio, 0, 0);
        pixels = Array.from({ length: 72 }, () => ({
          x: width * (.46 + (Math.random() - .5) * .18),
          y: height * (.48 + (Math.random() - .5) * .22),
          size: 2 + Math.random() * 7,
          vx: (Math.random() - .5) * .42,
          vy: (Math.random() - .5) * .34,
          alpha: .22 + Math.random() * .42,
          color: colors[Math.floor(Math.random() * colors.length)]
        }));
      };

      const draw = () => {
        context.clearRect(0, 0, width, height);
        pixels.forEach((pixel) => {
          pixel.x += pixel.vx;
          pixel.y += pixel.vy;
          pixel.alpha *= .996;

          if (pixel.x < -20 || pixel.x > width + 20 || pixel.y < -20 || pixel.y > height + 20 || pixel.alpha < .08) {
            pixel.x = width * (.46 + (Math.random() - .5) * .16);
            pixel.y = height * (.48 + (Math.random() - .5) * .18);
            pixel.alpha = .22 + Math.random() * .42;
          }

          context.globalAlpha = pixel.alpha;
          context.fillStyle = pixel.color;
          context.fillRect(pixel.x, pixel.y, pixel.size, pixel.size);
        });
        context.globalAlpha = 1;
        requestAnimationFrame(draw);
      };

      resize();
      draw();
      window.addEventListener("resize", resize);
    };

    startPixelBlast();
    createScrollMotion();
    updateSpine();
    updateHeroStackBlur();
    window.addEventListener("resize", updateSpine);
    window.addEventListener("resize", updateHeroStackBlur);

    // Single batched scroll handler — one rAF tick per scroll burst instead of
    // three independent listeners each doing their own getBoundingClientRect() reads.
    // This is what was causing the scroll hiccup/stutter.
    let scrollTicking = false;
    const onScroll = () => {
      if (scrollTicking) return;
      scrollTicking = true;
      requestAnimationFrame(() => {
        updateSpine();
        updateHeroStackBlur();
        scrollTicking = false;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });