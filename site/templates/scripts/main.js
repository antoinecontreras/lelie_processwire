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
    const target = getProjets(dom, CANVAS_LAYER);
    target.scrollTo({ top: 0, behavior: "instant" });
    // target.scrollTo({ top: 0, behavior: "instant" });
    CANVAS_LAYER.s.clickMode = false;
    dom.pages.forEach((el) => el.classList.remove("scrollMode"));
    CANVAS_LAYER.s.draw = true;
    CANVAS_LAYER._draw();

    CANVAS_LAYER._toggleTitle();
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

      const target = getProjets(dom, CANVAS_LAYER);
      // if (clickMode && e.target.classList.contains("canvas-container")) {
      if (clickMode && e.target.classList.contains("canvas-container")) {
        target.classList.add("scrollMode");
        if (target) replaceCanvas(target);
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
  getProjets = (dom, CANVAS_LAYER) => {
    console.log(CANVAS_LAYER.s.visualEl.idx);
    const currentValues = Object.values(d.data[CANVAS_LAYER.s.visualEl.idx])[0];
    // console.log(currentValues, dom.sortedDataArray);
    const checkProj = dom.sortedDataArray.find((el) =>
      el.images.includes(currentValues)
    );
    const target = document.querySelector(
      `.projects .project#${checkProj.projectName}`
    );
    return target;
  };
}
// })();
