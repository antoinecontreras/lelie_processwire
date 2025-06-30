class CanvasManager {
  constructor(d) {
    this.p5 = new p5((p) => {
      this.textures = [];
      this.textures_org = [];
      this.textures_dir = {
        left: [],
        right: [],
      };
      this.s = {
        texMax: undefined,
        raw: 0,
        draw: true,
        current: 0,
        lastStep: 0,
        delta: -4,
        visualEl: { idx: 0, proj: undefined },
        isAnimating: false,
        currentSide: null,
        prevHoverTunnel: null,
        prevOpenTunnel: null,
        inVolet: false,
        clickMode: false,
        lProj: document.querySelector(".scene>.ptitle.l-project"),
        rProj: document.querySelector(".scene>.ptitle.r-project"),
        d: d,
      };
      const styleDatas = [
        ["pointer-events", "none"],
        // ["image-rendering", "pixelated"],
        ["image-rendering", "initial"],
        ["z-index", "0"],
        ["border-radius", "1.4rem"],
      ];
      this.s.prevOpenTunnel = null;
      // console.log(data);
      // Object.values(d.data).forEach((item, index) => {
      //   const imagePath = Object.values(item)[0];
      //   this.textures.push(p.loadImage(imagePath));
      // });
      Object.values(d.projectImages).forEach((item) => {
        item.images.forEach((img, index) => {
          const texture = p.loadImage(img);
          console.log(texture.width);

          if (item.position === "left") {
            this.textures_dir.left.push({
              texture: texture,
              projectName: item.name,
              id: item.id,
              imageIndex: index,
            });
          } else if (item.position === "right") {
            this.textures_dir.right.push({
              texture: texture,
              projectName: item.name,
              id: item.id,
              imageIndex: index,
            });
          }
        });
      });

      // Object.values(d.projectImages).forEach((item, index) => {

      //   const texs = item.images
      //     ? item.images
      //         .map((img) => {
      //           const loadedImg = p.loadImage(img);
      //           if (!loadedImg) console.warn("Failed to load image:", img);
      //           return loadedImg;
      //         })
      //         .filter((img) => img !== null)
      //     : [];

      //   const data = {
      //     tex: texs,
      //     position: item.position,
      //   };
      //   this.textures_org.push(data);
      // });

      // console.log(d);
      // console.log( this.textures.length);

      p.setup = () => {
        this.canvas = p.createCanvas(
          window.innerWidth,
          window.innerHeight,
          p.WEBGL
        );
        const sceneEl = document.querySelector(".canvas-container");
        this.canvas.parent(sceneEl);

        this.preloadAndSetup(p);
        styleDatas.forEach((styleData) => {
          this.canvas.style(styleData[0], styleData[1]);
        });

        p.clear();
        p.pixelDensity(1.2);
        p.noLoop();
        this.triangleTextures = this.buildTriangleTextures(p, 0.5);
        this.mergedTri = this.buildMergedTriangle(
          p,
          this.triangleTextures,
          this.applyRoundedMask.bind(this, p)
        );

        this.sw = window.innerWidth;
        this.sh = window.innerHeight;

        // this.sh = 1204;

        this.s.isAnimating = false;
        this.s.base = this.s.raw * (this.sw / 3000);
        this.s.scale = this.sw / 3000;
        // this.c = this._initCamera(p);
        this.s.texMax = Math.max(
          this.textures_dir.left.length,
          this.textures_dir.right.length
        );
        this.s.visualEl.idx = this.s.texMax - 1;

        p.push();
        p.fill(0);

        p.rect(-this.sw / 2, -this.sh / 2, 200, 200);
        p.pop();
        // this.panelOffset = (this.textures.length - 1) ;
        addScreenPositionFunction(p);
        this._updateVoletsConfig();

        this.tunnels = Array.from({ length: this.s.texMax }, (_, index) => {
          return this.VOLETS_CFG.map((cfg) => {
            cfg.ancer = cfg.angle > 0 ? 0 : cfg.wall;
            let tex;
            let nameProject = undefined;

            if (cfg.texKind === "merged") {
              tex = this.mergedTri;
            } else {
              // Create colored rectangle texture
              const ratio = 0.3;
              let g = p.createGraphics(this.sw*ratio, this.sh*ratio);
              g.background(255, 0, 0); // Red background

              // console.log(this.textures_dir);
              if (cfg.angle == 90) {
                tex = this.textures_dir.left[index]?.texture || g;
                nameProject =
                  this.textures_dir.left[index]?.projectName || undefined;
              } else if (cfg.angle == -90) {
                tex = this.textures_dir.right[index]?.texture || g;
                nameProject =
                  this.textures_dir.right[index]?.projectName || undefined;
              }
            }

            return new Volet(p, tex, {
              ...cfg,
              w: this.sw,
              h: this.sh,
              z: 0,
              name: nameProject,
            });
          });
        });

        // console.log(test);
        this.s.prevHoverTunnel = this.tunnels[this.s.texMax - 1];
        // console.log(this.s.prevHoverTunnel);
        this._enterTunnel(this.s.prevHoverTunnel);
        this.s.scrollFrame = this.tunnels[this.tunnels.length - 1];
        const pNames = this.getCurrentProject(this.s.visualEl, p);
        if (pNames) this._getTitle(pNames);
      };

      p.draw = this._draw.bind(this, p);

      p.windowResized = () => {
        p.resizeCanvas(window.innerWidth, window.innerHeight);
        // this.s.scale = this.sw / 3000;
        this.drawTunnel();
      };
    });
  }
  _draw() {
    if (!this.s.draw) return;
    const p = this.p5;
    p.clear();
    p.noStroke();

    const corners = this.drawTunnel(p);
    if (this.s.inVolet && !this.s.clickMode) {
      const mapX = p.map(p.mouseX, 0, this.sw, -this.sw / 2, this.sw / 2);

      for (let i = 0; i < corners.length; i++) {
        const leftSide = corners[i][0];
        const rightSide = corners[i][1];
        if (!leftSide && !rightSide) continue;

        const side = this.s.inVolet === "left" ? leftSide : rightSide;
        const isInSide =
          mapX >= Math.min(side.p1, side.p2) &&
          mapX <= Math.max(side.p1, side.p2);

        if (isInSide) {
          const newIndex = this.s.texMax - 1 - i;
          if (this.s.current !== newIndex) {
            this.tunnels.forEach((tunnel) => {
              tunnel
                .filter((volet) => volet.isOpen)
                .forEach((volet) => volet.close());
              this.s.draw = true;
            });
            this.s.current = newIndex;
          }

          this.currentTunnel =
            this.tunnels[i][this.s.inVolet === "left" ? 0 : 1];
          this._openTunnel(this.currentTunnel);
        } else {
          this.tunnels[i].find((e) => e.cfg.texKind === "merged").focus();
        }
      }
    }

    if (!this._animationsRunning()) {
      this.s.prevOpenTunnel = this.currentTunnel;
      this.s.draw = false;
      this.s.isAnimating = false;
    }
  }

  // ouvre un tableau de Volets “frame” à l’angle normal
  _openTunnel(frame) {
    const delta = frame.cfg.angle < 0 ? -this.s.delta : +this.s.delta;
    frame.open(delta);
  }
  setupMouseMove(p) {
    p.mouseMoved = () => {
      if (this.s.clickMode) return;

      const w = p.width,
        h = p.height,
        cx = w / 2,
        cy = h / 2,
        mx = p.mouseX,
        my = p.mouseY,
        triG = [
          { x: 0, y: 0 },
          { x: cx, y: cy },
          { x: 0, y: h },
        ],
        triD = [
          { x: w, y: 0 },
          { x: cx, y: cy },
          { x: w, y: h },
        ];

      const isInLeftTriangle = this.pointInPolygon(mx, my, triG);
      const isInRightTriangle = this.pointInPolygon(mx, my, triD);
      this.s.inVolet = isInLeftTriangle
        ? "left"
        : isInRightTriangle
        ? "right"
        : false;
      if (this.s.inVolet) {
        if(this.s.inVolet =="left") {
          this.s.lProj.classList.add("active");
          this.s.rProj.classList.remove("active");
        } else {
          this.s.rProj.classList.add("active");
          this.s.lProj.classList.remove("active");
        }
        this.s.draw = true;
        this.p5.loop();
      } else {
        this.s.lProj.classList.remove("active");
        this.s.rProj.classList.remove("active");
        if (Array.isArray(this.tunnels)) {
          this.tunnels.forEach((volet) => {
            volet
              .filter((frame) => frame.isOpen == true)
              .forEach((frame) => {
                frame.close();
              });
          });
        }
        this.p5.noLoop();
      }
    };
  }
  setupMouseClicked(p) {
    p.mouseClicked = (e) => {
      if (!this.s.inVolet || e.target.id !== "canvasForHTML") return;
      const { s, tunnels, textures } = this;
      s.scrollFrame = tunnels[s.visualEl.idx];

      s.prevHoverTunnel = s.scrollFrame;

      s.raw = (s.current * this.sw) / 2 / s.scale;
      s.base = s.raw * s.scale;
      s.draw = true;

      // console.log(s.visualEl.idx);
      s.visualEl.idx = this.s.texMax - 1 - s.current;

      this.currentTunnel.focus();

      if (!s.clickMode && Math.round(this.currentTunnel.cfg.z) === 0) {
        this.currentTunnel.isClicked(90);
        s.clickMode = true;
      } else s.clickMode = false;


        
      // console.log(this.currentTunnel, s.current );
      const pNames = this.getCurrentProject(this.s.visualEl, p);
      if (pNames) {
        this._getTitle(pNames);
        this.s.pNames = pNames;
      }
      if (this.s.clickMode) this._toggleTitle();
    };
  }
  _getTitle(names) {
    this.s.rProj.textContent = names.r;
    this.s.lProj.textContent = names.l;
  }
  _toggleTitle() {
    if (this.s.clickMode) {
      if (this.p5.mouseX < this.p5.width / 2) {
        this.s.rProj.style.visibility = "hidden";
      } else {
        this.s.lProj.style.visibility = "hidden";
      }
    } else {
      this.s.lProj.style.visibility = "visible";
      this.s.rProj.style.visibility = "visible";
    }
  }
  _enterTunnel(frames) {
    frames.filter((v) => v.cfg.texKind === "frame");
    frames.forEach((v) => {
      v.focus();
    });
  }
  setupWheel(p) {
    let wheelTimeout;
    window.addEventListener(
      "wheel",
      (e) => {
        if (this.s.clickMode) return;
        e.preventDefault();
        this.p5.loop();

        // Clear previous timeout
        clearTimeout(wheelTimeout);

        // Mise à jour du raw, base et draw
        this.s.raw = Math.max(0, this.s.raw + e.deltaY);
        this.s.base = this.s.raw * this.s.scale;
        this.s.draw = true;

        // Calcul du nouvel index et clamp
        const step = Math.floor((this.s.base / this.sw) * 2);
        const clamped = Math.max(0, Math.min(this.s.texMax - 1, step));

        if (clamped !== this.s.current) {
          this.s.prevHoverTunnel
            .filter((volet) => volet.cfg.texKind == "frame")
            .forEach((volet) => {
              volet.close();
              volet.sleep();
            });

          this.s.current = clamped;
          this.s.visualEl.idx = this.s.texMax - 1 - clamped;
          this.s.scrollFrame = this.tunnels[this.s.visualEl.idx];

          this._enterTunnel(this.s.scrollFrame);
          const pNames = this.getCurrentProject(this.s.visualEl, p);
          if (pNames) this._getTitle(pNames);
          this.s.prevHoverTunnel = this.s.scrollFrame;
        }

        // Set timeout to detect when scrolling stops
        wheelTimeout = setTimeout(() => {
          console.log("Scrolling finished");
          // Add your code here for when scrolling ends
          this.p5.noLoop();
        }, 150); // Adjust timeout value as needed
      },
      { passive: false }
    );
  }
  getCurrentProject(el, p) {
    // const proj =  el.proj
    // console.log(this.s.scrollFrame);
    if (!this.s.scrollFrame) return;
    const titles = {
      l: this.s.scrollFrame[0].cfg.name,
      r: this.s.scrollFrame[1].cfg.name,
    };
    // const dir =
    //   p.mouseX < p.width / 2 ? this.s.scrollFrame[0] : this.s.scrollFrame[1];
    return titles;
  }
  _animationsRunning() {
    return this.tunnels.some((tunnel) =>
      tunnel.some(
        (volet) =>
          Math.abs(volet.cfg.angle - volet.targetAngle) > 0.1 ||
          Math.abs(volet.style.opacity - volet.style.targetOpacity) > 1
      )
    );
  }
  drawTunnel(p) {
    const vols = [];
    const halfSw = this.sw / 2;
    const halfSh = this.sh / 2;

    for (let idx = 0; idx < this.tunnels.length; idx++) {
      const voletList = this.tunnels[idx];
      const z = this.s.base - ((this.s.texMax - 1 - idx) * this.sw) / 2;

      if (z < halfSw) {
        let vol = [];
        for (const volet of voletList) {
          volet.cfg.z = z;
          volet.draw();

          const angle = volet.initialAngle;
          if (angle !== -90 && angle !== 90) continue;

          const isLeftSide = angle === 90;
          // console.log(volet.cfg.ancer, volet.cfg.w);
          const x = isLeftSide ? 0 : volet.cfg.w;

          // console.log(z);
          const p1 =
            z > 0
              ? { x: isLeftSide ? -halfSw : halfSw, y: -halfSh }
              : p.screenPosition(x, 0, 0);

          const p2 = p.screenPosition(
            // x + (isLeftSide ? volet.cfg.w/2 : -volet.cfg.w),
            x + (isLeftSide ? halfSw : -halfSw),
            20,
            0
          );

          vol.push({ p1: p1.x, p2: p2.x });
        }

        vols.push(vol);
      }
    }
    return vols;
  }

  pointInPolygon(x, y, poly) {
    let inside = false;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      const xi = poly[i].x,
        yi = poly[i].y;
      const xj = poly[j].x,
        yj = poly[j].y;
      const intersect =
        yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
      if (intersect) inside = !inside;
    }

    return inside;
  }

  // _initCamera(p) {
  //   const c = {
  //     // foxy: p.radians(p.height / 16.27),
  //     foxy: p.radians(p.height / 16.27),
  //     cam: p.createCamera(),
  //   };
  //   // c.cam.perspective(c.foxy, p.width / p.height, 0.1, 50000);
  //   c.cam.perspective(c.foxy, p.width / p.height, 0.1, 50000);
  //   return c;
  // }

  _updateVoletsConfig() {
    this.VOLETS_CFG = [
      {
        texKind: "frame",
        x: 0,
        y: this.sh / 2,
        wall: this.sw / 2,
        angle: 90,
        swapUV: false,
      },
      {
        texKind: "frame",
        x: this.sw,
        y: 0,
        wall: this.sw / 2,
        angle: -90,
        swapUV: false,
      },
      {
        texKind: "merged",
        x: this.sw,
        y: this.sh,
        angle: 0,
        swapUV: false,
      },
    ];
  }

  buildTriangleTextures(p, depth = 0.5) {
    const w = p.width,
      h = p.height;
    const vf = 0.5,
      apexFactor = 0.5;
    const out = [];
    const configs = [
      [w, h, null],
      [h, w, 0],
      [h, w, 1],
    ];

    for (const [W, H, side] of configs) {
      const g = p.createGraphics(W, H, p.P2D);
      const ctx = g.elt.getContext("2d");
      ctx.clearRect(0, 0, W, H);

      const gradV = ctx.createLinearGradient(0, H * apexFactor, 0, H);
      gradV.addColorStop(depth, "rgba(0,0,0,0)");
      gradV.addColorStop(1, "rgba(0,0,0,0.65)");
      ctx.fillStyle = gradV;
      this.drawTriangleShape(ctx, W, H);

      if (side !== null) {
        const startX = H * (0.5 + (side === 0 ? -vf : vf));
        const endX = side === 0 ? H : 0;
        const gradH = ctx.createLinearGradient(startX, 0, endX, 0);
        gradH.addColorStop(0, "rgba(0,0,0,0)");
        gradH.addColorStop(1, "rgba(255,255,255,1)");
        ctx.globalCompositeOperation = "destination-in";
        ctx.fillStyle = gradH;
        this.drawTriangleShape(ctx, W, H);
        ctx.globalCompositeOperation = "source-over";
      }

      out.push(g);
    }

    return out;
  }

  drawTriangleShape(ctx, w, h) {
    const apexFactor = 0.5;
    ctx.beginPath();
    ctx.moveTo(0, h);
    ctx.lineTo(w, h);
    ctx.lineTo(w / 2, h * apexFactor);
    ctx.closePath();
    ctx.fill();
  }

  applyRoundedMask(p, img, relR = 0.023) {
    const w = img.width;
    const h = img.height;

    const r = Math.min(w, h) * relR;

    const m = p.createGraphics(w, h);
    m.clear();
    m.noStroke();
    m.fill(255);

    m.beginShape();
    m.vertex(r, 0);
    m.vertex(w - r, 0);
    m.quadraticVertex(w, 0, w, r);
    m.vertex(w, h - r);
    m.quadraticVertex(w, h, w - r, h);
    m.vertex(r, h);
    m.quadraticVertex(0, h, 0, h - r);
    m.vertex(0, r);
    m.quadraticVertex(0, 0, r, 0);
    m.endShape(p.CLOSE);

    img.mask(m);
    return img;
  }
  buildMergedTriangle(p, tris, maskFn) {
    const w = p.width;
    const h = p.height;

    const m = p.createGraphics(w, h, p.P2D);
    m.hide();
    m.clear();
    m.imageMode(p.CENTER);

    m.push();
    m.translate(w / 2, h / 2);
    m.image(tris[0], 0, 0);
    m.pop();

    m.push();
    m.translate(w / 2, h / 2);
    m.rotate(p.HALF_PI);
    m.image(tris[1], 0, 0);
    m.pop();

    m.push();
    m.translate(w / 2, h / 2);
    m.rotate(-p.HALF_PI);
    m.image(tris[2], 0, 0);
    m.pop();

    const mergedImg = m.get();

    return maskFn(mergedImg);
  }

  preloadAndSetup(p) {
    // ton preload, setup, etc.
    this.setupMouseMove(p);
    this.setupMouseClicked(p);
    this.setupWheel(p);
  }
}
