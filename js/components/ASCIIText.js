import * as THREE from 'three';

const vertexShader = `
varying vec2 vUv;
uniform float uTime;
uniform float uEnableWaves;
uniform bool uDarkMode;

void main() {
  vUv = uv;
  float time = uTime * 3.;
  
  float waveFactor = uEnableWaves;
  
  vec3 transformed = position;
  
  // Gentler waves for dark theme
  if (uDarkMode) {
    transformed.x += sin(time + position.y) * 0.3 * waveFactor;
    transformed.y += cos(time + position.z) * 0.1 * waveFactor;
    transformed.z += sin(time + position.x) * 0.6 * waveFactor;
  } else {
    transformed.x += sin(time + position.y) * 0.5 * waveFactor;
    transformed.y += cos(time + position.z) * 0.15 * waveFactor;
    transformed.z += sin(time + position.x) * waveFactor;
  }
  
  gl_Position = projectionMatrix * modelViewMatrix * vec4(transformed, 1.0);
}
`;

const fragmentShader = `
varying vec2 vUv;
uniform float uTime;
uniform sampler2D uTexture;
uniform bool uDarkMode;

void main() {
  float time = uTime * 0.8; // Slower for dark theme
  vec2 pos = vUv;
  
  // Reduced distortion for dark theme
  float distortionAmount = uDarkMode ? 0.006 : 0.01;
  
  float r = texture2D(uTexture, pos + cos(time * 1.5 + pos.x) * distortionAmount).r;
  float g = texture2D(uTexture, pos + tan(time * 0.4 + pos.x) * distortionAmount).g;
  float b = texture2D(uTexture, pos - cos(time * 1.8 + pos.y) * distortionAmount).b;
  float a = texture2D(uTexture, pos).a;
  
  gl_FragColor = vec4(r, g, b, a);
}
`;

const PX_RATIO = typeof window !== 'undefined' ? window.devicePixelRatio : 1;

class AsciiFilter {
  constructor(renderer, options = {}) {
    this.renderer = renderer;
    this.domElement = document.createElement('div');
    this.domElement.style.position = 'absolute';
    this.domElement.style.top = '0';
    this.domElement.style.left = '0';
    this.domElement.style.width = '100%';
    this.domElement.style.height = '100%';

    this.pre = document.createElement('pre');
    this.domElement.appendChild(this.pre);

    this.canvas = document.createElement('canvas');
    this.context = this.canvas.getContext('2d');
    this.domElement.appendChild(this.canvas);

    this.deg = 0;
    this.invert = options.invert ?? true;
    this.fontSize = options.fontSize ?? 10;
    this.fontFamily = options.fontFamily ?? "'IBM Plex Mono', monospace";
    this.darkMode = options.darkMode ?? true;
    
    // Dark theme character set - more subtle
    this.charset = this.darkMode 
      ? ' .\'`^",:;Il!i~+_-?][}{1)(|/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$'
      : ' .\'`^",:;Il!i~+_-?][}{1)(|/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$';

    this.context.webkitImageSmoothingEnabled = false;
    this.context.mozImageSmoothingEnabled = false;
    this.context.msImageSmoothingEnabled = false;
    this.context.imageSmoothingEnabled = false;

    this.onMouseMove = this.onMouseMove.bind(this);
    document.addEventListener('mousemove', this.onMouseMove);
  }

  setSize(width, height) {
    this.width = width;
    this.height = height;
    this.renderer.setSize(width, height);
    this.reset();

    this.center = { x: width / 2, y: height / 2 };
    this.mouse = { x: this.center.x, y: this.center.y };
  }

  reset() {
    this.context.font = `${this.fontSize}px ${this.fontFamily}`;
    const charWidth = this.context.measureText('M').width;

    this.cols = Math.floor(this.width / (this.fontSize * (charWidth / this.fontSize)));
    this.rows = Math.floor(this.height / this.fontSize);

    this.canvas.width = this.cols;
    this.canvas.height = this.rows;
    
    this.pre.style.fontFamily = this.fontFamily;
    this.pre.style.fontSize = `${this.fontSize}px`;
    this.pre.style.margin = '0';
    this.pre.style.padding = '0';
    this.pre.style.lineHeight = '1em';
    this.pre.style.position = 'absolute';
    this.pre.style.left = '50%';
    this.pre.style.top = '50%';
    this.pre.style.transform = 'translate(-50%, -50%)';
    this.pre.style.zIndex = '9';
    this.pre.style.userSelect = 'none';
    this.pre.style.pointerEvents = 'none';
    
    if (this.darkMode) {
      this.pre.style.background = 'linear-gradient(135deg, #00A8CC 0%, #8B7ED8 50%, #E85A8A 100%)';
      this.pre.style.backgroundAttachment = 'fixed';
      this.pre.style.webkitBackgroundClip = 'text';
      this.pre.style.webkitTextFillColor = 'transparent';
      this.pre.style.backgroundClip = 'text';
      this.pre.style.filter = 'drop-shadow(0 0 10px rgba(0, 168, 204, 0.3))';
    } else {
      this.pre.style.backgroundImage = 'radial-gradient(circle, #ff6188 0%, #fc9867 50%, #ffd866 100%)';
      this.pre.style.backgroundAttachment = 'fixed';
      this.pre.style.webkitTextFillColor = 'transparent';
      this.pre.style.webkitBackgroundClip = 'text';
      this.pre.style.backgroundClip = 'text';
      this.pre.style.mixBlendMode = 'difference';
    }
  }

  render(scene, camera) {
    this.renderer.render(scene, camera);

    const w = this.canvas.width;
    const h = this.canvas.height;
    this.context.clearRect(0, 0, w, h);
    
    if (this.context && w && h) {
      this.context.drawImage(this.renderer.domElement, 0, 0, w, h);
    }

    this.asciify(this.context, w, h);
    this.hue();
  }

  onMouseMove(e) {
    this.mouse = { x: e.clientX * PX_RATIO, y: e.clientY * PX_RATIO };
  }

  get dx() {
    return this.mouse.x - this.center.x;
  }

  get dy() {
    return this.mouse.y - this.center.y;
  }

  hue() {
    const deg = (Math.atan2(this.dy, this.dx) * 180) / Math.PI;
    this.deg += (deg - this.deg) * 0.06; // Slower response for dark theme
    
    if (this.darkMode) {
      // Subtle hue rotation for dark theme
      this.domElement.style.filter = `hue-rotate(${(this.deg * 0.3).toFixed(1)}deg) brightness(1.1)`;
    } else {
      this.domElement.style.filter = `hue-rotate(${this.deg.toFixed(1)}deg)`;
    }
  }

  asciify(ctx, w, h) {
    if (w && h) {
      const imgData = ctx.getImageData(0, 0, w, h).data;
      let str = '';
      
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const i = x * 4 + y * 4 * w;
          const [r, g, b, a] = [imgData[i], imgData[i + 1], imgData[i + 2], imgData[i + 3]];

          if (a === 0) {
            str += ' ';
            continue;
          }

          let gray = (0.3 * r + 0.6 * g + 0.1 * b) / 255;
          
          // Adjust contrast for dark theme
          if (this.darkMode) {
            gray = Math.pow(gray, 0.8); // Gamma correction for better visibility
          }
          
          let idx = Math.floor((1 - gray) * (this.charset.length - 1));
          if (this.invert) idx = this.charset.length - idx - 1;
          str += this.charset[idx];
        }
        str += '\n';
      }
      this.pre.innerHTML = str;
    }
  }

  dispose() {
    document.removeEventListener('mousemove', this.onMouseMove);
    if (this.domElement.parentNode) {
      this.domElement.parentNode.removeChild(this.domElement);
    }
  }
}

class CanvasTxt {
  constructor(txt, options = {}) {
    this.canvas = document.createElement('canvas');
    this.context = this.canvas.getContext('2d');
    this.txt = txt;
    this.fontSize = options.fontSize ?? 180;
    this.fontFamily = options.fontFamily ?? 'IBM Plex Mono';
    this.color = options.color ?? '#FFFFFF';
    this.darkMode = options.darkMode ?? true;

    this.font = `700 ${this.fontSize}px ${this.fontFamily}`;
  }

  resize() {
    this.context.font = this.font;
    const metrics = this.context.measureText(this.txt);

    const textWidth = Math.ceil(metrics.width) + 40;
    const textHeight = Math.ceil(metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent) + 40;

    this.canvas.width = textWidth;
    this.canvas.height = textHeight;
  }

  render() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.context.fillStyle = this.color;
    this.context.font = this.font;

    const metrics = this.context.measureText(this.txt);
    const yPos = 20 + metrics.actualBoundingBoxAscent;

    this.context.fillText(this.txt, 20, yPos);
  }

  get width() {
    return this.canvas.width;
  }

  get height() {
    return this.canvas.height;
  }

  get texture() {
    return this.canvas;
  }
}

class CanvAscii {
  constructor(options, containerElem, width, height) {
    this.textString = options.text ?? 'obtanium';
    this.asciiFontSize = options.asciiFontSize ?? 6;
    this.textFontSize = options.textFontSize ?? 180;
    this.textColor = options.textColor ?? '#FFFFFF';
    this.planeBaseHeight = options.planeBaseHeight ?? 6;
    this.container = containerElem;
    this.width = width;
    this.height = height;
    this.enableWaves = options.enableWaves ?? true;
    this.darkMode = options.darkMode ?? true;

    this.camera = new THREE.PerspectiveCamera(45, this.width / this.height, 1, 1000);
    this.camera.position.z = 25; // Closer for dark theme

    this.scene = new THREE.Scene();
    this.mouse = { x: 0, y: 0 };

    this.onMouseMove = this.onMouseMove.bind(this);

    this.setMesh();
    this.setRenderer();
  }

  setMesh() {
    this.textCanvas = new CanvasTxt(this.textString, {
      fontSize: this.textFontSize,
      fontFamily: 'IBM Plex Mono',
      color: this.textColor,
      darkMode: this.darkMode
    });
    
    this.textCanvas.resize();
    this.textCanvas.render();

    this.texture = new THREE.CanvasTexture(this.textCanvas.texture);
    this.texture.minFilter = THREE.NearestFilter;
    this.texture.magFilter = THREE.NearestFilter;

    const textAspect = this.textCanvas.width / this.textCanvas.height;
    const baseH = this.planeBaseHeight;
    const planeW = baseH * textAspect;
    const planeH = baseH;

    // More segments for smoother waves in dark theme
    this.geometry = new THREE.PlaneGeometry(planeW, planeH, 48, 48);
    this.material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      transparent: true,
      uniforms: {
        uTime: { value: 0 },
        uTexture: { value: this.texture },
        uEnableWaves: { value: this.enableWaves ? 1.0 : 0.0 },
        uDarkMode: { value: this.darkMode }
      }
    });

    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.scene.add(this.mesh);
  }

  setRenderer() {
    this.renderer = new THREE.WebGLRenderer({ 
      antialias: false, 
      alpha: true,
      premultipliedAlpha: false
    });
    
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setClearColor(0x000000, 0);

    this.filter = new AsciiFilter(this.renderer, {
      fontFamily: 'IBM Plex Mono',
      fontSize: this.asciiFontSize,
      invert: true,
      darkMode: this.darkMode
    });

    this.container.appendChild(this.filter.domElement);
    this.setSize(this.width, this.height);

    this.container.addEventListener('mousemove', this.onMouseMove);
    this.container.addEventListener('touchmove', this.onMouseMove);
  }

  setSize(w, h) {
    this.width = w;
    this.height = h;

    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();

    this.filter.setSize(w, h);

    this.center = { x: w / 2, y: h / 2 };
  }

  load() {
    this.animate();
  }

  onMouseMove(evt) {
    const e = evt.touches ? evt.touches[0] : evt;
    const bounds = this.container.getBoundingClientRect();
    const x = e.clientX - bounds.left;
    const y = e.clientY - bounds.top;
    this.mouse = { x, y };
  }

  animate() {
    const animateFrame = () => {
      this.animationFrameId = requestAnimationFrame(animateFrame);
      this.render();
    };
    animateFrame();
  }

  render() {
    const time = new Date().getTime() * 0.0008; // Slower for dark theme

    this.textCanvas.render();
    this.texture.needsUpdate = true;

    this.mesh.material.uniforms.uTime.value = Math.sin(time);

    this.updateRotation();
    this.filter.render(this.scene, this.camera);
  }

  updateRotation() {
    const sensitivity = this.darkMode ? 0.3 : 0.5; // Less sensitive for dark theme
    const x = ((this.mouse.y / this.height) - 0.5) * sensitivity;
    const y = ((this.mouse.x / this.width) - 0.5) * -sensitivity;

    this.mesh.rotation.x += (x - this.mesh.rotation.x) * 0.04; // Smoother
    this.mesh.rotation.y += (y - this.mesh.rotation.y) * 0.04;
  }

  clear() {
    this.scene.traverse(obj => {
      if (obj.isMesh && typeof obj.material === 'object' && obj.material !== null) {
        Object.keys(obj.material).forEach(key => {
          const matProp = obj.material[key];
          if (matProp !== null && typeof matProp === 'object' && typeof matProp.dispose === 'function') {
            matProp.dispose();
          }
        });
        obj.material.dispose();
        obj.geometry.dispose();
      }
    });
    this.scene.clear();
  }

  dispose() {
    cancelAnimationFrame(this.animationFrameId);
    this.filter.dispose();
    this.container.removeEventListener('mousemove', this.onMouseMove);
    this.container.removeEventListener('touchmove', this.onMouseMove);
    this.clear();
    this.renderer.dispose();
  }
}

export class ASCIIText {
  constructor(container, options = {}) {
    this.container = container;
    this.options = {
      text: 'obtanium',
      asciiFontSize: 6,
      textFontSize: 180,
      textColor: '#FFFFFF',
      planeBaseHeight: 6,
      enableWaves: true,
      darkMode: true,
      ...options
    };
    
    this.asciiRef = null;
    this.init();
  }
  
  init() {
    try {
      const { width, height } = this.container.getBoundingClientRect();

      if (width === 0 || height === 0) {
        // Wait for container to have dimensions
        const observer = new IntersectionObserver(
          ([entry]) => {
            if (entry.isIntersecting && entry.boundingClientRect.width > 0 && entry.boundingClientRect.height > 0) {
              const { width: w, height: h } = entry.boundingClientRect;

              this.asciiRef = new CanvAscii(
                this.options,
                this.container,
                w,
                h
              );
              this.asciiRef.load();

              observer.disconnect();
            }
          },
          { threshold: 0.1 }
        );

        observer.observe(this.container);
        return;
      }

      this.asciiRef = new CanvAscii(
        this.options,
        this.container,
        width,
        height
      );
      this.asciiRef.load();

      // Handle resize
      const ro = new ResizeObserver(entries => {
        if (!entries[0] || !this.asciiRef) return;
        const { width: w, height: h } = entries[0].contentRect;
        if (w > 0 && h > 0) {
          this.asciiRef.setSize(w, h);
        }
      });
      ro.observe(this.container);

      // Store for cleanup
      this.resizeObserver = ro;
      
    } catch (error) {
      console.error('ASCIIText initialization failed:', error);
      throw error;
    }
  }
  
  dispose() {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
    
    if (this.asciiRef) {
      this.asciiRef.dispose();
      this.asciiRef = null;
    }
  }
}