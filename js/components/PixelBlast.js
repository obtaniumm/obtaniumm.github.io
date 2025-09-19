import * as THREE from 'three';

const createTouchTexture = () => {
  const size = 64;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('2D context not available');
  
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = false;
  
  const trail = [];
  let last = null;
  const maxAge = 64;
  let radius = 0.1 * size;
  const speed = 1 / maxAge;
  
  const clear = () => {
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };
  
  const drawPoint = p => {
    const pos = { x: p.x * size, y: (1 - p.y) * size };
    let intensity = 1;
    const easeOutSine = t => Math.sin((t * Math.PI) / 2);
    const easeOutQuad = t => -t * (t - 2);
    
    if (p.age < maxAge * 0.3) {
      intensity = easeOutSine(p.age / (maxAge * 0.3));
    } else {
      intensity = easeOutQuad(1 - (p.age - maxAge * 0.3) / (maxAge * 0.7)) || 0;
    }
    
    intensity *= p.force;
    const color = `${((p.vx + 1) / 2) * 200}, ${((p.vy + 1) / 2) * 220}, ${intensity * 255}`;
    const offset = size * 5;
    
    ctx.shadowOffsetX = offset;
    ctx.shadowOffsetY = offset;
    ctx.shadowBlur = radius;
    ctx.shadowColor = `rgba(${color}, ${0.18 * intensity})`;
    ctx.beginPath();
    ctx.fillStyle = 'rgba(0, 168, 204, 1)'; // Dark theme primary color
    ctx.arc(pos.x - offset, pos.y - offset, radius, 0, Math.PI * 2);
    ctx.fill();
  };
  
  const addTouch = norm => {
    let force = 0;
    let vx = 0;
    let vy = 0;
    
    if (last) {
      const dx = norm.x - last.x;
      const dy = norm.y - last.y;
      if (dx === 0 && dy === 0) return;
      
      const dd = dx * dx + dy * dy;
      const d = Math.sqrt(dd);
      vx = dx / (d || 1);
      vy = dy / (d || 1);
      force = Math.min(dd * 8000, 1); // Reduced force for dark theme
    }
    
    last = { x: norm.x, y: norm.y };
    trail.push({ x: norm.x, y: norm.y, age: 0, force, vx, vy });
  };
  
  const update = () => {
    clear();
    
    for (let i = trail.length - 1; i >= 0; i--) {
      const point = trail[i];
      const f = point.force * speed * (1 - point.age / maxAge);
      point.x += point.vx * f;
      point.y += point.vy * f;
      point.age++;
      
      if (point.age > maxAge) {
        trail.splice(i, 1);
      }
    }
    
    for (let i = 0; i < trail.length; i++) {
      drawPoint(trail[i]);
    }
    
    texture.needsUpdate = true;
  };
  
  return {
    canvas,
    texture,
    addTouch,
    update,
    set radiusScale(v) {
      radius = 0.1 * size * v;
    },
    get radiusScale() {
      return radius / (0.1 * size);
    },
    size
  };
};

const SHAPE_MAP = {
  square: 0,
  circle: 1,
  triangle: 2,
  diamond: 3
};

const VERTEX_SRC = `void main() { gl_Position = vec4(position, 1.0); }`;

const FRAGMENT_SRC = `
precision highp float;

uniform vec3  uColor;
uniform vec2  uResolution;
uniform float uTime;
uniform float uPixelSize;
uniform float uScale;
uniform float uDensity;
uniform float uPixelJitter;
uniform int   uEnableRipples;
uniform float uRippleSpeed;
uniform float uRippleThickness;
uniform float uRippleIntensity;
uniform float uEdgeFade;
uniform int   uShapeType;
uniform bool  uDarkMode;

const int SHAPE_SQUARE   = 0;
const int SHAPE_CIRCLE   = 1;
const int SHAPE_TRIANGLE = 2;
const int SHAPE_DIAMOND  = 3;

const int   MAX_CLICKS = 10;

uniform vec2  uClickPos  [MAX_CLICKS];
uniform float uClickTimes[MAX_CLICKS];

out vec4 fragColor;

float Bayer2(vec2 a) {
  a = floor(a);
  return fract(a.x / 2. + a.y * a.y * .75);
}
#define Bayer4(a) (Bayer2(.5*(a))*0.25 + Bayer2(a))
#define Bayer8(a) (Bayer4(.5*(a))*0.25 + Bayer2(a))

#define FBM_OCTAVES     4
#define FBM_LACUNARITY  1.2
#define FBM_GAIN        0.8

float hash11(float n){ return fract(sin(n)*43758.5453); }

float vnoise(vec3 p){
  vec3 ip = floor(p);
  vec3 fp = fract(p);
  float n000 = hash11(dot(ip + vec3(0.0,0.0,0.0), vec3(1.0,57.0,113.0)));
  float n100 = hash11(dot(ip + vec3(1.0,0.0,0.0), vec3(1.0,57.0,113.0)));
  float n010 = hash11(dot(ip + vec3(0.0,1.0,0.0), vec3(1.0,57.0,113.0)));
  float n110 = hash11(dot(ip + vec3(1.0,1.0,0.0), vec3(1.0,57.0,113.0)));
  float n001 = hash11(dot(ip + vec3(0.0,0.0,1.0), vec3(1.0,57.0,113.0)));
  float n101 = hash11(dot(ip + vec3(1.0,0.0,1.0), vec3(1.0,57.0,113.0)));
  float n011 = hash11(dot(ip + vec3(0.0,1.0,1.0), vec3(1.0,57.0,113.0)));
  float n111 = hash11(dot(ip + vec3(1.0,1.0,1.0), vec3(1.0,57.0,113.0)));
  vec3 w = fp*fp*fp*(fp*(fp*6.0-15.0)+10.0);
  float x00 = mix(n000, n100, w.x);
  float x10 = mix(n010, n110, w.x);
  float x01 = mix(n001, n101, w.x);
  float x11 = mix(n011, n111, w.x);
  float y0  = mix(x00, x10, w.y);
  float y1  = mix(x01, x11, w.y);
  return mix(y0, y1, w.z) * 2.0 - 1.0;
}

float fbm2(vec2 uv, float t){
  vec3 p = vec3(uv * uScale, t);
  float amp = 1.0;
  float freq = 1.0;
  float sum = 0.0;
  for (int i = 0; i < FBM_OCTAVES; ++i){
    sum  += amp * vnoise(p * freq);
    freq *= FBM_LACUNARITY;
    amp  *= FBM_GAIN;
  }
  return sum * 0.5 + 0.5;
}

float maskCircle(vec2 p, float cov){
  float r = sqrt(cov) * .22;
  float d = length(p - 0.5) - r;
  float aa = 0.5 * fwidth(d);
  return cov * (1.0 - smoothstep(-aa, aa, d * 2.2));
}

float maskTriangle(vec2 p, vec2 id, float cov){
  bool flip = mod(id.x + id.y, 2.0) > 0.5;
  if (flip) p.x = 1.0 - p.x;
  float r = sqrt(cov);
  float d  = p.y - r*(1.0 - p.x);
  float aa = fwidth(d);
  return cov * clamp(0.5 - d/aa, 0.0, 1.0);
}

float maskDiamond(vec2 p, float cov){
  float r = sqrt(cov) * 0.5;
  return step(abs(p.x - 0.49) + abs(p.y - 0.49), r);
}

void main(){
  float pixelSize = uPixelSize;
  vec2 fragCoord = gl_FragCoord.xy - uResolution * .5;
  float aspectRatio = uResolution.x / uResolution.y;

  vec2 pixelId = floor(fragCoord / pixelSize);
  vec2 pixelUV = fract(fragCoord / pixelSize);

  float cellPixelSize = 6.0 * pixelSize; // Smaller cells for dark theme
  vec2 cellId = floor(fragCoord / cellPixelSize);
  vec2 cellCoord = cellId * cellPixelSize;
  vec2 uv = cellCoord / uResolution * vec2(aspectRatio, 1.0);

  float base = fbm2(uv, uTime * 0.04); // Slower movement for dark theme
  
  // Dark theme adjustments
  if (uDarkMode) {
    base = base * 0.4 - 0.7; // Lower density, more subtle
  } else {
    base = base * 0.5 - 0.65;
  }

  float feed = base + (uDensity - 0.5) * 0.25;

  float speed     = uRippleSpeed;
  float thickness = uRippleThickness;
  const float dampT     = 1.2;
  const float dampR     = 12.0;

  if (uEnableRipples == 1) {
    for (int i = 0; i < MAX_CLICKS; ++i){
      vec2 pos = uClickPos[i];
      if (pos.x < 0.0) continue;
      float cellPixelSize = 6.0 * pixelSize;
      vec2 cuv = (((pos - uResolution * .5 - cellPixelSize * .5) / (uResolution))) * vec2(aspectRatio, 1.0);
      float t = max(uTime - uClickTimes[i], 0.0);
      float r = distance(uv, cuv);
      float waveR = speed * t;
      float ring  = exp(-pow((r - waveR) / thickness, 2.0));
      float atten = exp(-dampT * t) * exp(-dampR * r);
      feed = max(feed, ring * atten * uRippleIntensity);
    }
  }

  float bayer = Bayer8(fragCoord / uPixelSize) - 0.5;
  float bw = step(0.5, feed + bayer);

  float h = fract(sin(dot(floor(fragCoord / uPixelSize), vec2(127.1, 311.7))) * 43758.5453);
  float jitterScale = 1.0 + (h - 0.5) * uPixelJitter;
  float coverage = bw * jitterScale;
  
  float M;
  if      (uShapeType == SHAPE_CIRCLE)   M = maskCircle (pixelUV, coverage);
  else if (uShapeType == SHAPE_TRIANGLE) M = maskTriangle(pixelUV, pixelId, coverage);
  else if (uShapeType == SHAPE_DIAMOND)  M = maskDiamond(pixelUV, coverage);
  else                                   M = coverage;

  if (uEdgeFade > 0.0) {
    vec2 norm = gl_FragCoord.xy / uResolution;
    float edge = min(min(norm.x, norm.y), min(1.0 - norm.x, 1.0 - norm.y));
    float fade = smoothstep(0.0, uEdgeFade, edge);
    M *= fade;
  }

  vec3 color = uColor;
  
  // Dark theme color adjustments
  if (uDarkMode) {
    M *= 0.6; // Reduce overall intensity
    color *= 1.2; // Slightly brighten the color
  }

  fragColor = vec4(color, M);
}
`;

const MAX_CLICKS = 10;

export class PixelBlast {
  constructor(container, options = {}) {
    this.container = container;
    this.options = {
      variant: 'circle',
      pixelSize: 4,
      color: '#00A8CC',
      patternScale: 2.5,
      patternDensity: 0.8,
      liquid: true,
      liquidStrength: 0.08,
      liquidRadius: 0.8,
      pixelSizeJitter: 0.3,
      enableRipples: true,
      rippleIntensityScale: 1.2,
      rippleThickness: 0.08,
      rippleSpeed: 0.3,
      liquidWobbleSpeed: 3,
      speed: 0.4,
      transparent: true,
      edgeFade: 0.35,
      darkMode: true,
      ...options
    };
    
    this.threeRef = null;
    this.init();
  }
  
  init() {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl2', { 
        antialias: false, 
        alpha: true,
        premultipliedAlpha: false
      });
      
      if (!gl) {
        console.warn('WebGL2 not supported');
        return;
      }
      
      const renderer = new THREE.WebGLRenderer({
        canvas,
        context: gl,
        antialias: false,
        alpha: true,
        premultipliedAlpha: false
      });
      
      renderer.domElement.style.width = '100%';
      renderer.domElement.style.height = '100%';
      renderer.domElement.style.position = 'absolute';
      renderer.domElement.style.top = '0';
      renderer.domElement.style.left = '0';
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      
      this.container.appendChild(renderer.domElement);
      
      const uniforms = {
        uResolution: { value: new THREE.Vector2(0, 0) },
        uTime: { value: 0 },
        uColor: { value: new THREE.Color(this.options.color) },
        uClickPos: {
          value: Array.from({ length: MAX_CLICKS }, () => new THREE.Vector2(-1, -1))
        },
        uClickTimes: { value: new Float32Array(MAX_CLICKS) },
        uShapeType: { value: SHAPE_MAP[this.options.variant] ?? 1 },
        uPixelSize: { value: this.options.pixelSize * renderer.getPixelRatio() },
        uScale: { value: this.options.patternScale },
        uDensity: { value: this.options.patternDensity },
        uPixelJitter: { value: this.options.pixelSizeJitter },
        uEnableRipples: { value: this.options.enableRipples ? 1 : 0 },
        uRippleSpeed: { value: this.options.rippleSpeed },
        uRippleThickness: { value: this.options.rippleThickness },
        uRippleIntensity: { value: this.options.rippleIntensityScale },
        uEdgeFade: { value: this.options.edgeFade },
        uDarkMode: { value: this.options.darkMode }
      };
      
      const scene = new THREE.Scene();
      const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
      
      const material = new THREE.ShaderMaterial({
        vertexShader: VERTEX_SRC,
        fragmentShader: FRAGMENT_SRC,
        uniforms,
        transparent: true,
        depthTest: false,
        depthWrite: false
      });
      
      const quadGeom = new THREE.PlaneGeometry(2, 2);
      const quad = new THREE.Mesh(quadGeom, material);
      scene.add(quad);
      
      const clock = new THREE.Clock();
      
      const setSize = () => {
        const w = this.container.clientWidth || 1;
        const h = this.container.clientHeight || 1;
        renderer.setSize(w, h, false);
        uniforms.uResolution.value.set(renderer.domElement.width, renderer.domElement.height);
        uniforms.uPixelSize.value = this.options.pixelSize * renderer.getPixelRatio();
      };
      
      setSize();
      
      const ro = new ResizeObserver(setSize);
      ro.observe(this.container);
      
      const randomFloat = () => {
        if (typeof window !== 'undefined' && window.crypto?.getRandomValues) {
          const u32 = new Uint32Array(1);
          window.crypto.getRandomValues(u32);
          return u32[0] / 0xffffffff;
        }
        return Math.random();
      };
      
      const timeOffset = randomFloat() * 1000;
      
      let touch;
      if (this.options.liquid) {
        touch = createTouchTexture();
        touch.radiusScale = this.options.liquidRadius;
      }
      
      const mapToPixels = e => {
        const rect = renderer.domElement.getBoundingClientRect();
        const scaleX = renderer.domElement.width / rect.width;
        const scaleY = renderer.domElement.height / rect.height;
        const fx = (e.clientX - rect.left) * scaleX;
        const fy = (rect.height - (e.clientY - rect.top)) * scaleY;
        return { fx, fy };
      };
      
      const onPointerDown = e => {
        const { fx, fy } = mapToPixels(e);
        const ix = this.threeRef?.clickIx ?? 0;
        uniforms.uClickPos.value[ix].set(fx, fy);
        uniforms.uClickTimes.value[ix] = uniforms.uTime.value;
        if (this.threeRef) this.threeRef.clickIx = (ix + 1) % MAX_CLICKS;
      };
      
      const onPointerMove = e => {
        if (!touch) return;
        const { fx, fy } = mapToPixels(e);
        const w = renderer.domElement.width;
        const h = renderer.domElement.height;
        touch.addTouch({ x: fx / w, y: fy / h });
      };
      
      renderer.domElement.addEventListener('pointerdown', onPointerDown, { passive: true });
      renderer.domElement.addEventListener('pointermove', onPointerMove, { passive: true });
      
      let raf = 0;
      const animate = () => {
        uniforms.uTime.value = timeOffset + clock.getElapsedTime() * this.options.speed;
        
        if (touch) {
          touch.update();
        }
        
        renderer.render(scene, camera);
        raf = requestAnimationFrame(animate);
      };
      
      raf = requestAnimationFrame(animate);
      
      this.threeRef = {
        renderer,
        scene,
        camera,
        material,
        clock,
        clickIx: 0,
        uniforms,
        resizeObserver: ro,
        raf,
        quad,
        timeOffset,
        touch
      };
      
    } catch (error) {
      console.error('PixelBlast initialization failed:', error);
      throw error;
    }
  }
  
  dispose() {
    if (!this.threeRef) return;
    
    const t = this.threeRef;
    t.resizeObserver?.disconnect();
    cancelAnimationFrame(t.raf);
    t.quad?.geometry.dispose();
    t.material.dispose();
    t.renderer.dispose();
    
    if (t.renderer.domElement.parentElement === this.container) {
      this.container.removeChild(t.renderer.domElement);
    }
    
    this.threeRef = null;
  }
}