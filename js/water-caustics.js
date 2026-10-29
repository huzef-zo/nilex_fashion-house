/**
 * =========================================================================
 * NILEX FASHIONHOUSE - REALISTIC WATER CAUSTICS BACKGROUND (WEBGL)
 * Slogan: "Flow like the nile"
 * =========================================================================
 */

(function () {
    let gl = null;
    let canvas = null;
    let program = null;
    let animationFrameId = null;
    let isRunning = false;
    let isPaused = false;

    let timeLocation = null;
    let resolutionLocation = null;

    let startTime = 0;
    let lastFrameTime = 0;
    let frameCount = 0;
    let perfCheckDone = false;

    let cssWidth = 0;
    let cssHeight = 0;

    const isTouchMobile = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || (window.innerWidth <= 768);
    const targetFPS = isTouchMobile ? 30 : 60;
    const frameInterval = isTouchMobile ? (1000 / 30) : 0;

    const vertexShaderSource = `
        attribute vec2 a_position;
        void main() {
            gl_Position = vec4(a_position, 0.0, 1.0);
        }
    `;

    function buildFragmentShaderSource(octaves) {
        return `
            precision mediump float;

            uniform vec2 u_resolution;
            uniform float u_time;

            void main() {
                vec2 st = gl_FragCoord.xy / u_resolution.xy;
                vec2 p = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / min(u_resolution.x, u_resolution.y);

                // Deep navy base background gradient matching brand palette (#040a12 to #0e2338)
                vec3 colDeep = vec3(0.015, 0.039, 0.071);
                vec3 colMid  = vec3(0.055, 0.137, 0.220);
                vec3 baseCol = mix(colDeep, colMid, st.y * 0.85 + 0.08);

                vec2 q = p * 3.8;
                float t = u_time * 0.09; // Slow, calm movement

                float c = 0.0;
                float weight = 1.0;
                float totalWeight = 0.0;

                // Tiling water-caustic pattern with domain-warped sine/cosine interference
                for (int i = 0; i < ${octaves}; i++) {
                    float fi = float(i);
                    vec2 shift = vec2(sin(t * 0.45 + fi * 1.7), cos(t * 0.35 + fi * 2.3)) * 0.55;
                    vec2 v = q + shift;

                    v += vec2(
                        sin(v.y * 1.7 + t * 0.6),
                        cos(v.x * 1.7 - t * 0.5)
                    ) * 0.4;

                    float field = length(sin(v * 2.1 + vec2(cos(t * 0.25 + v.y), sin(t * 0.25 + v.x))));
                    float filament = 0.016 / (field * field + 0.011);

                    c += filament * weight;
                    totalWeight += weight;

                    q *= 1.75;
                    weight *= 0.52;
                }

                c = c / totalWeight;

                // Gentle slow brightness drift
                float drift = 0.88 + 0.12 * sin(u_time * 0.12);
                c *= drift;

                // Soft vignette (darker toward edges and top header)
                vec2 vUv = st * (1.0 - st.yx);
                float vig = vUv.x * vUv.y * 15.0;
                vig = clamp(pow(vig, 0.28), 0.25, 1.0);
                float topFade = smoothstep(0.0, 0.20, st.y) * 0.35 + 0.65;
                float vignette = vig * topFade;

                // Brand colors: cyan highlights (#38bdf8), faint gold tint (#d4af37) on brightest filaments
                vec3 cyanHighlight = vec3(0.22, 0.74, 0.97) * c * 0.9;
                float goldPeak = smoothstep(0.38, 0.85, c);
                vec3 goldHighlight = vec3(0.83, 0.68, 0.21) * goldPeak * 0.45;

                // Additive blending over deep navy base
                vec3 finalColor = baseCol + cyanHighlight + goldHighlight;
                finalColor *= vignette;

                gl_FragColor = vec4(finalColor, 1.0);
            }
        `;
    }

    function createShader(glCtx, type, source) {
        const shader = glCtx.createShader(type);
        glCtx.shaderSource(shader, source);
        glCtx.compileShader(shader);
        if (!glCtx.getShaderParameter(shader, glCtx.COMPILE_STATUS)) {
            console.warn('WebGL Shader Compile Error:', glCtx.getShaderInfoLog(shader));
            glCtx.deleteShader(shader);
            return null;
        }
        return shader;
    }

    function createProgram(glCtx, vShader, fShader) {
        const prog = glCtx.createProgram();
        glCtx.attachShader(prog, vShader);
        glCtx.attachShader(prog, fShader);
        glCtx.linkProgram(prog);
        if (!glCtx.getProgramParameter(prog, glCtx.LINK_STATUS)) {
            console.warn('WebGL Program Link Error:', glCtx.getProgramInfoLog(prog));
            glCtx.deleteProgram(prog);
            return null;
        }
        return prog;
    }

    function resizeBufferIfNeeded(force = false) {
        if (!canvas || !gl) return;

        const w = window.innerWidth;
        const h = window.innerHeight;

        // Do not re-init on small height resizes caused by mobile address bar toggling
        if (!force && cssWidth === w && Math.abs(cssHeight - h) <= 80) {
            return;
        }

        cssWidth = w;
        cssHeight = h;

        // Render at reduced resolution (~0.55 scale, dpr capped at 1)
        const scale = 0.55;
        const renderWidth = Math.max(1, Math.floor(w * scale));
        const renderHeight = Math.max(1, Math.floor(h * scale));

        canvas.width = renderWidth;
        canvas.height = renderHeight;

        gl.viewport(0, 0, renderWidth, renderHeight);
    }

    function stopWebGLAndFallback() {
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
        }
        isRunning = false;

        if (canvas) {
            canvas.style.display = 'none';
        }

        const riverCanvas = document.getElementById('river-canvas');
        if (riverCanvas) {
            riverCanvas.style.display = 'block';
        }

        if (typeof window.initRiverCanvas === 'function') {
            window.initRiverCanvas();
        }
    }

    function renderFrame(now) {
        if (!isRunning || isPaused || !gl || !program) return;

        // Throttling for 30fps on mobile
        if (frameInterval > 0) {
            const elapsed = now - lastFrameTime;
            if (elapsed < frameInterval) {
                animationFrameId = requestAnimationFrame(renderFrame);
                return;
            }
            lastFrameTime = now - (elapsed % frameInterval);
        } else {
            lastFrameTime = now;
        }

        const currentTimeSec = (now - startTime) * 0.001;

        gl.uniform1f(timeLocation, currentTimeSec);
        gl.uniform2f(resolutionLocation, canvas.width, canvas.height);

        gl.drawArrays(gl.TRIANGLES, 0, 6);

        frameCount++;

        // Performance check over the first ~2 seconds
        if (!perfCheckDone && currentTimeSec >= 2.0) {
            perfCheckDone = true;
            const avgFPS = frameCount / currentTimeSec;
            if (avgFPS < 24) {
                // Effective FPS too low -> fallback silently to 2D canvas
                stopWebGLAndFallback();
                return;
            }
        }

        animationFrameId = requestAnimationFrame(renderFrame);
    }

    function handleVisibilityChange() {
        if (document.hidden) {
            isPaused = true;
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
                animationFrameId = null;
            }
        } else {
            if (isRunning && isPaused) {
                isPaused = false;
                lastFrameTime = performance.now();
                animationFrameId = requestAnimationFrame(renderFrame);
            }
        }
    }

    function handleResize() {
        resizeBufferIfNeeded(false);
    }

    function handleContextLost(e) {
        e.preventDefault();
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
        }
        isRunning = false;
    }

    function handleContextRestored() {
        if (initWebGL()) {
            startLoop();
        } else {
            stopWebGLAndFallback();
        }
    }

    function initWebGL() {
        canvas = document.getElementById('water-canvas');
        if (!canvas) return false;

        gl = canvas.getContext('webgl', { alpha: false, depth: false, antialias: false, preserveDrawingBuffer: false }) ||
             canvas.getContext('experimental-webgl', { alpha: false, depth: false, antialias: false, preserveDrawingBuffer: false });

        if (!gl) return false;

        const octaves = isTouchMobile ? 2 : 3;
        const vShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
        const fShader = createShader(gl, gl.FRAGMENT_SHADER, buildFragmentShaderSource(octaves));

        if (!vShader || !fShader) return false;

        program = createProgram(gl, vShader, fShader);
        if (!program) return false;

        gl.useProgram(program);

        // Quad setup (-1, -1) to (1, 1)
        const positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
            -1.0, -1.0,
             1.0, -1.0,
            -1.0,  1.0,
            -1.0,  1.0,
             1.0, -1.0,
             1.0,  1.0,
        ]), gl.STATIC_DRAW);

        const positionLocation = gl.getAttribLocation(program, 'a_position');
        gl.enableVertexAttribArray(positionLocation);
        gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

        timeLocation = gl.getUniformLocation(program, 'u_time');
        resolutionLocation = gl.getUniformLocation(program, 'u_resolution');

        resizeBufferIfNeeded(true);

        return true;
    }

    function startLoop() {
        // Reduced motion check
        const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        if (prefersReducedMotion) {
            // Render a single static frame at time 0
            gl.uniform1f(timeLocation, 0.0);
            gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
            gl.drawArrays(gl.TRIANGLES, 0, 6);
            isRunning = true;
            return true;
        }

        startTime = performance.now();
        lastFrameTime = startTime;
        frameCount = 0;
        perfCheckDone = false;
        isRunning = true;
        isPaused = false;

        animationFrameId = requestAnimationFrame(renderFrame);

        window.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('resize', handleResize);
        canvas.addEventListener('webglcontextlost', handleContextLost, false);
        canvas.addEventListener('webglcontextrestored', handleContextRestored, false);

        return true;
    }

    window.initWaterCaustics = function () {
        if (initWebGL()) {
            return startLoop();
        } else {
            return false;
        }
    };
})();
