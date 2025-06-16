// Example JS file
// ui.js
// Version ultra-simple: instanciation de CanvasManager et gestion basique du click-mode via CustomEvents

// (function () {
//   // Helper pour DOMContentLoaded
//   function ready(fn) {
//     if (document.readyState !== "loading") {
//       fn();
//     } else {
//       document.addEventListener("DOMContentLoaded", fn);
//     }
//   }

function ready(d) {
  // 1. Instanciation du CanvasManager
  let CANVAS_LAYER = new CanvasManager(d);

  let dom = {
    scene: document.querySelector(".scene"),
    pj: document.querySelector("div.projects"),
    pages: document.querySelectorAll("div.projects >.project"),
    canvas: document.querySelector("#canvasForHTML"),
    back: document.querySelector("span#back"),
    baseScroll: 0,
    sortedData: sortedData,
    sortedDataArray: sortedDataArray,
    videoContainers: document.querySelectorAll(".p_video"),
  };
  dom.pj.classList.remove("loading");
  dom.back.addEventListener("click", (e) => {
    dom.pj.classList.remove("focus");
    CANVAS_LAYER.p5.loop();
    // CANVAS_LAYER.tunnels.forEach((volet) => {
    // volet;
    // .filter((frame) => frame.isOpen == true)
    // .forEach((frame) => {
    //   frame.close();
    // });
    // });
    const target = getProjets(e, dom, CANVAS_LAYER);
    target.scrollTo({ top: 0, behavior: "instant" });
    // target.scrollTo({ top: 0, behavior: "instant" });
    CANVAS_LAYER.s.clickMode = false;
    dom.pages.forEach((el) => el.classList.remove("scrollMode"));
    CANVAS_LAYER.s.draw = true;
    CANVAS_LAYER._draw();

    CANVAS_LAYER._toggleTitle();
  });

  // document.querySelectorAll(".expandButton").forEach(button => {
  //     button.addEventListener("click", function () {
  //       const container = button.closest(".p_video");
  //       container.classList.add("expanded");
  //       container.querySelector("video").play();
  //       container.querySelector(".closeExpand").style.display = "block";
  //     });
  //   });

  //   document.querySelectorAll(".closeExpand").forEach(btn => {
  //     btn.addEventListener("click", function () {
  //       const container = btn.closest(".p_video");
  //       container.classList.remove("expanded");
  //       btn.style.display = "none";
  //     });
  //   });

  // Get all video containers

  // For each video container, set up its controls
  dom.videoContainers.forEach((container) => {
    const video = container.querySelector("video");
    // Skip if no video element found
    if (!video) return;

    const playButtons = container.querySelectorAll(".playToggle");
    const expandButton = container.querySelector(".expandToggle");
    const closeButton = container.querySelector(".closeExpand");

    // Play/Pause controls
    // Video hover interaction for previews

    // const imageContents = container.querySelectorAll('.images_preview .image_content');

    // console.log(previewImages);
    // console.log('Found contents:', imageContents.length);

    // previewImages.forEach((preview, index) => {
    //   preview.addEventListener('mouseenter', (e) => {
    //     console.log("Mouseenter triggered on", e.target);
    //   // Hide all images first
    //   imageContents.forEach(img => img.style.display = 'none');
    //   // Show the corresponding image
    //   if (imageContents[index]) {
    //     imageContents[index].style.display = 'block';
    //   }
    //   });

    //   preview.addEventListener('mouseleave', () => {
    //   // Show first image on mouseleave
    //   imageContents.forEach((img, i) => {
    //     img.style.display = i === 0 ? 'block' : 'none';
    //   });
    //   });
    // });
    playButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        // Update button states within this container only
        container
          .querySelectorAll(".playToggle")
          .forEach((b) => (b.dataset.state = "inactive"));
        btn.dataset.state = "active";

        if (btn.dataset.role === "play") {
          video.play();
        } else {
          video.pause();
        }
      });
    });

    // Expand button
    expandButton?.addEventListener("click", () => {
      expandButton.dataset.state = "active";
      closeButton.dataset.state = "inactive";
      container.classList.add("expanded");
    });

    // Close button
    closeButton?.addEventListener("click", () => {
      closeButton.dataset.state = "active";
      expandButton.dataset.state = "inactive";
      container.classList.remove("expanded");

      const scrollTarget = container.closest(".project.scrollMode");
      if (scrollTarget) {
        const height = scrollTarget.scrollHeight;
        scrollTarget.scrollTo({ top: height, behavior: "auto" });
      }
    });
  });

  dom.pj.addEventListener("scroll", (e) => {
    if (dom.baseScroll >= e.target.scrollTop) {
      // dom.pj.classList.remove("focus");
      // dom.pj.style.overflowY = "hidden";

      e.preventDefault();

      // e.target.scrollTo({
      //   top: dom.baseScroll,
      //   behavior: "smooth",
      // });
    }
  });
  dom.pj.addEventListener("scrollend", (e) => {
    // console.log("scrollend");
    //  e.target.scrollTo({
    //       top: dom.baseScroll,
    //       behavior: "instant",
    //     });
    // dom.pj.style.overflowY = "scroll";
  });

  document.addEventListener("click", (e) => {
    const event = e; // Capture the event
    setTimeout(() => {
      // Remove the event parameter from setTimeout

      let clickMode = CANVAS_LAYER.s.clickMode;

      const target = getProjets(e, dom, CANVAS_LAYER, e);
      // if (clickMode && e.target.classList.contains("canvas-container")) {
      if (clickMode && e.target.classList.contains("canvas-container")) {
        target.classList.add("scrollMode");

        if (target) replaceCanvas(target);
        const imageContents = target.querySelectorAll(".int_preview");
        const previewImages = [...target.querySelectorAll(".images_preview .image_content")];

        if (imageContents.length && previewImages.length) {
          const handleHover = (e) => {
            const index = [...imageContents].indexOf(e.target);
            if (index >= 0) {
              previewImages[index].style.display = e.type === 'mouseenter' ? 'block' : 'none';
            }
          };

          target.addEventListener('mouseenter', handleHover, true);
          target.addEventListener('mouseleave', handleHover, true);
        }
        
        dom.pj.classList.add("focus");
        CANVAS_LAYER.p5.noLoop();

        return;
      }

      if (event.target == dom.canvas) {
        target.scrollTo({ top: 0, behavior: "instant" });

        dom.pages.forEach((el) => el.classList.remove("scrollMode"));
        dom.pj.scrollIntoView(dom.baseScroll);
      }
    }, 400);
  });

  // document.addEventListener("")
  replaceCanvas = (target) => {
    const targetParent = target.parentNode;
    targetParent.insertBefore(dom.canvas, target);
    dom.canvas.scrollIntoView({ behavior: "instant", block: "center" });
    const canvasRect = dom.canvas.getBoundingClientRect();
    const parentRect = dom.pj.getBoundingClientRect();
    dom.baseScroll = canvasRect.top - parentRect.top + dom.pj.scrollTop;
  };
  getProjets = (e, dom, CANVAS_LAYER) => {
    // console.log(CANVAS_LAYER.s.visualEl.idx);
    let dir = null;
    if (e.clientX < window.innerWidth / 2) {
      dir = CANVAS_LAYER.s.pNames.l;
    } else {
      dir = CANVAS_LAYER.s.pNames.r;
    }
    // console.log(dir);
    // const currentValues = Object.values(d.data[CANVAS_LAYER.s.visualEl.idx])[0];
    // // console.log(currentValues, dom.sortedDataArray);
    // const checkProj = dom.sortedDataArray.find((el) =>
    //   el.images.includes(currentValues)
    // );
    const target = document.querySelector(`.projects .project#${dir}`);
    return target;
  };
}
// })();
