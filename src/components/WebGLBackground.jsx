import { useEffect, useRef } from 'react';
import * as THREE from 'three';

const WebGLBackground = () => {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    console.log('[WebGL] Component mounted, containerRef:', containerRef.current);
    if (!containerRef.current) return;

    console.log('[WebGL] Starting scene setup...');
    // Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      50,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(2, 3, 18);

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({
      alpha: false,
      antialias: true
    });
    renderer.setClearColor(0x000000, 1);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // 캔버스 스타일 확인
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.position = 'absolute';
    renderer.domElement.style.top = '0';
    renderer.domElement.style.left = '0';

    console.log('[WebGL] Renderer size:', renderer.domElement.width, 'x', renderer.domElement.height);
    console.log('[WebGL] Appending canvas to container...');
    containerRef.current.appendChild(renderer.domElement);
    console.log('[WebGL] Canvas appended, children count:', containerRef.current.children.length);
    rendererRef.current = renderer;

    // Stars background
    const starsGeometry = new THREE.BufferGeometry();
    const starsMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 1.5,
      transparent: true,
      opacity: 0.4 // 별 밝기 줄임
    });

    const starsVertices = [];
    for (let i = 0; i < 25000; i++) {
      const x = (Math.random() - 0.5) * 2000;
      const y = (Math.random() - 0.5) * 2000;
      const z = (Math.random() - 0.5) * 2000;
      starsVertices.push(x, y, z);
    }

    starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starsVertices, 3));
    const starField = new THREE.Points(starsGeometry, starsMaterial);
    scene.add(starField);

    // Earth setup
    const earthGeometry = new THREE.SphereGeometry(5, 64, 64);

    // 실제 지구 텍스처 로드
    const textureLoader = new THREE.TextureLoader();

    // 지구 표면 텍스처 (낮)
    const earthTexture = textureLoader.load(
      'https://unpkg.com/three-globe@2.31.1/example/img/earth-day.jpg',
      () => console.log('[WebGL] Earth day texture loaded')
    );

    // 지구 밤 텍스처 (도시 불빛)
    const earthNightTexture = textureLoader.load(
      'https://unpkg.com/three-globe@2.31.1/example/img/earth-night.jpg',
      () => console.log('[WebGL] Earth night texture loaded')
    );

    // 구름 텍스처
    const cloudsTexture = textureLoader.load(
      'https://unpkg.com/three-globe@2.31.1/example/img/earth-topology.png',
      () => console.log('[WebGL] Clouds texture loaded')
    );

    // 지구 재질 (완전 야경 모드 - 도시 불빛만)
    const earthMaterial = new THREE.MeshBasicMaterial({
      map: earthNightTexture, // 밤 텍스처만 사용
      color: new THREE.Color(0x666666), // 어두운 색상으로 전체 밝기 감소
    });

    const earth = new THREE.Mesh(earthGeometry, earthMaterial);
    earth.position.set(0, 0, 0);
    scene.add(earth);

    // 주요 도시 좌표 - 대륙별로 골고루 분포
    const cities = [
      // 동아시아
      { name: 'Seoul', lat: 37.5665, lon: 126.9780, intensity: 1.0 },
      { name: 'Tokyo', lat: 35.6762, lon: 139.6503, intensity: 1.2 },
      { name: 'Osaka', lat: 34.6937, lon: 135.5023, intensity: 0.9 },
      { name: 'Beijing', lat: 39.9042, lon: 116.4074, intensity: 1.1 },
      { name: 'Shanghai', lat: 31.2304, lon: 121.4737, intensity: 1.3 },
      { name: 'Guangzhou', lat: 23.1291, lon: 113.2644, intensity: 0.9 },
      { name: 'Shenzhen', lat: 22.5431, lon: 114.0579, intensity: 1.0 },
      { name: 'Hong Kong', lat: 22.3193, lon: 114.1694, intensity: 1.0 },
      { name: 'Taipei', lat: 25.0330, lon: 121.5654, intensity: 0.8 },
      { name: 'Chongqing', lat: 29.4316, lon: 106.9123, intensity: 0.8 },
      { name: 'Wuhan', lat: 30.5928, lon: 114.3055, intensity: 0.7 },
      { name: 'Chengdu', lat: 30.5728, lon: 104.0668, intensity: 0.7 },

      // 동남아시아
      { name: 'Singapore', lat: 1.3521, lon: 103.8198, intensity: 0.9 },
      { name: 'Bangkok', lat: 13.7563, lon: 100.5018, intensity: 0.9 },
      { name: 'Jakarta', lat: -6.2088, lon: 106.8456, intensity: 0.9 },
      { name: 'Manila', lat: 14.5995, lon: 120.9842, intensity: 0.8 },
      { name: 'Ho Chi Minh', lat: 10.8231, lon: 106.6297, intensity: 0.7 },
      { name: 'Kuala Lumpur', lat: 3.1390, lon: 101.6869, intensity: 0.7 },
      { name: 'Hanoi', lat: 21.0285, lon: 105.8542, intensity: 0.6 },

      // 남아시아
      { name: 'Mumbai', lat: 19.0760, lon: 72.8777, intensity: 1.0 },
      { name: 'Delhi', lat: 28.7041, lon: 77.1025, intensity: 1.1 },
      { name: 'Bangalore', lat: 12.9716, lon: 77.5946, intensity: 0.8 },
      { name: 'Kolkata', lat: 22.5726, lon: 88.3639, intensity: 0.8 },
      { name: 'Chennai', lat: 13.0827, lon: 80.2707, intensity: 0.7 },
      { name: 'Karachi', lat: 24.8607, lon: 67.0011, intensity: 0.9 },
      { name: 'Dhaka', lat: 23.8103, lon: 90.4125, intensity: 0.8 },

      // 중동
      { name: 'Dubai', lat: 25.2048, lon: 55.2708, intensity: 0.9 },
      { name: 'Abu Dhabi', lat: 24.4539, lon: 54.3773, intensity: 0.7 },
      { name: 'Riyadh', lat: 24.7136, lon: 46.6753, intensity: 0.8 },
      { name: 'Istanbul', lat: 41.0082, lon: 28.9784, intensity: 0.9 },
      { name: 'Tehran', lat: 35.6892, lon: 51.3890, intensity: 0.8 },
      { name: 'Tel Aviv', lat: 32.0853, lon: 34.7818, intensity: 0.7 },
      { name: 'Doha', lat: 25.2854, lon: 51.5310, intensity: 0.6 },

      // 유럽 동부
      { name: 'Moscow', lat: 55.7558, lon: 37.6173, intensity: 1.0 },
      { name: 'St Petersburg', lat: 59.9343, lon: 30.3351, intensity: 0.7 },
      { name: 'Warsaw', lat: 52.2297, lon: 21.0122, intensity: 0.7 },
      { name: 'Kiev', lat: 50.4501, lon: 30.5234, intensity: 0.6 },
      { name: 'Bucharest', lat: 44.4268, lon: 26.1025, intensity: 0.6 },

      // 유럽 서부
      { name: 'London', lat: 51.5074, lon: -0.1278, intensity: 1.1 },
      { name: 'Paris', lat: 48.8566, lon: 2.3522, intensity: 1.0 },
      { name: 'Berlin', lat: 52.5200, lon: 13.4050, intensity: 0.8 },
      { name: 'Madrid', lat: 40.4168, lon: -3.7038, intensity: 0.8 },
      { name: 'Rome', lat: 41.9028, lon: 12.4964, intensity: 0.7 },
      { name: 'Amsterdam', lat: 52.3676, lon: 4.9041, intensity: 0.7 },
      { name: 'Brussels', lat: 50.8503, lon: 4.3517, intensity: 0.6 },
      { name: 'Vienna', lat: 48.2082, lon: 16.3738, intensity: 0.7 },
      { name: 'Frankfurt', lat: 50.1109, lon: 8.6821, intensity: 0.8 },
      { name: 'Milan', lat: 45.4642, lon: 9.1900, intensity: 0.7 },
      { name: 'Barcelona', lat: 41.3851, lon: 2.1734, intensity: 0.7 },
      { name: 'Munich', lat: 48.1351, lon: 11.5820, intensity: 0.6 },
      { name: 'Stockholm', lat: 59.3293, lon: 18.0686, intensity: 0.6 },
      { name: 'Copenhagen', lat: 55.6761, lon: 12.5683, intensity: 0.6 },
      { name: 'Oslo', lat: 59.9139, lon: 10.7522, intensity: 0.5 },
      { name: 'Athens', lat: 37.9838, lon: 23.7275, intensity: 0.6 },

      // 북미 - 미국 동부
      { name: 'New York', lat: 40.7128, lon: -74.0060, intensity: 1.3 },
      { name: 'Boston', lat: 42.3601, lon: -71.0589, intensity: 0.8 },
      { name: 'Philadelphia', lat: 39.9526, lon: -75.1652, intensity: 0.8 },
      { name: 'Washington DC', lat: 38.9072, lon: -77.0369, intensity: 0.9 },
      { name: 'Miami', lat: 25.7617, lon: -80.1918, intensity: 0.8 },
      { name: 'Atlanta', lat: 33.7490, lon: -84.3880, intensity: 0.8 },

      // 북미 - 미국 중부
      { name: 'Chicago', lat: 41.8781, lon: -87.6298, intensity: 1.0 },
      { name: 'Dallas', lat: 32.7767, lon: -96.7970, intensity: 0.9 },
      { name: 'Houston', lat: 29.7604, lon: -95.3698, intensity: 0.9 },
      { name: 'Detroit', lat: 42.3314, lon: -83.0458, intensity: 0.7 },

      // 북미 - 미국 서부
      { name: 'Los Angeles', lat: 34.0522, lon: -118.2437, intensity: 1.2 },
      { name: 'San Francisco', lat: 37.7749, lon: -122.4194, intensity: 1.0 },
      { name: 'Seattle', lat: 47.6062, lon: -122.3321, intensity: 0.8 },
      { name: 'San Diego', lat: 32.7157, lon: -117.1611, intensity: 0.7 },
      { name: 'Phoenix', lat: 33.4484, lon: -112.0740, intensity: 0.7 },
      { name: 'Las Vegas', lat: 36.1699, lon: -115.1398, intensity: 0.7 },
      { name: 'Denver', lat: 39.7392, lon: -104.9903, intensity: 0.7 },

      // 캐나다
      { name: 'Toronto', lat: 43.6532, lon: -79.3832, intensity: 0.9 },
      { name: 'Montreal', lat: 45.5017, lon: -73.5673, intensity: 0.8 },
      { name: 'Vancouver', lat: 49.2827, lon: -123.1207, intensity: 0.7 },
      { name: 'Calgary', lat: 51.0447, lon: -114.0719, intensity: 0.6 },

      // 멕시코
      { name: 'Mexico City', lat: 19.4326, lon: -99.1332, intensity: 1.1 },
      { name: 'Guadalajara', lat: 20.6597, lon: -103.3496, intensity: 0.7 },
      { name: 'Monterrey', lat: 25.6866, lon: -100.3161, intensity: 0.7 },

      // 남미
      { name: 'São Paulo', lat: -23.5505, lon: -46.6333, intensity: 1.1 },
      { name: 'Rio de Janeiro', lat: -22.9068, lon: -43.1729, intensity: 0.9 },
      { name: 'Buenos Aires', lat: -34.6037, lon: -58.3816, intensity: 1.0 },
      { name: 'Lima', lat: -12.0464, lon: -77.0428, intensity: 0.8 },
      { name: 'Bogotá', lat: 4.7110, lon: -74.0721, intensity: 0.8 },
      { name: 'Santiago', lat: -33.4489, lon: -70.6693, intensity: 0.8 },
      { name: 'Caracas', lat: 10.4806, lon: -66.9036, intensity: 0.7 },
      { name: 'Brasília', lat: -15.8267, lon: -47.9218, intensity: 0.6 },

      // 아프리카
      { name: 'Cairo', lat: 30.0444, lon: 31.2357, intensity: 0.9 },
      { name: 'Lagos', lat: 6.5244, lon: 3.3792, intensity: 0.8 },
      { name: 'Johannesburg', lat: -26.2041, lon: 28.0473, intensity: 0.8 },
      { name: 'Nairobi', lat: -1.2921, lon: 36.8219, intensity: 0.7 },
      { name: 'Cape Town', lat: -33.9249, lon: 18.4241, intensity: 0.7 },
      { name: 'Casablanca', lat: 33.5731, lon: -7.5898, intensity: 0.7 },
      { name: 'Addis Ababa', lat: 9.0320, lon: 38.7469, intensity: 0.6 },
      { name: 'Kinshasa', lat: -4.4419, lon: 15.2663, intensity: 0.6 },

      // 오세아니아
      { name: 'Sydney', lat: -33.8688, lon: 151.2093, intensity: 0.9 },
      { name: 'Melbourne', lat: -37.8136, lon: 144.9631, intensity: 0.8 },
      { name: 'Brisbane', lat: -27.4698, lon: 153.0251, intensity: 0.7 },
      { name: 'Perth', lat: -31.9505, lon: 115.8605, intensity: 0.6 },
      { name: 'Auckland', lat: -36.8485, lon: 174.7633, intensity: 0.7 },
    ];

    // 위도/경도를 UV 좌표로 변환
    const latLonToUV = (lat, lon) => {
      const u = (lon + 180) / 360;
      const v = 1 - (lat + 90) / 180;
      return { u, v };
    };

    // 유니버셜 스튜디오 오프닝 스타일 - 간단한 반짝이는 도시 불빛
    const cityLightsGeometry = new THREE.BufferGeometry();
    const positions = [];
    const colors = [];
    const sizes = [];

    cities.forEach(city => {
      const numLights = Math.floor(10 + city.intensity * 20);
      const cityRadius = 0.003 + city.intensity * 0.006;

      for (let i = 0; i < numLights; i++) {
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.sqrt(Math.random()) * cityRadius;

        const lat = city.lat + Math.cos(angle) * distance * 60;
        const lon = city.lon + Math.sin(angle) * distance * 60;

        // 3D 좌표 변환
        const phi = (90 - lat) * (Math.PI / 180);
        const theta = (lon + 180) * (Math.PI / 180);
        const radius = 5.02;

        const x = -radius * Math.sin(phi) * Math.cos(theta);
        const y = radius * Math.cos(phi);
        const z = radius * Math.sin(phi) * Math.sin(theta);

        positions.push(x, y, z);

        // 노란빛 ~ 주황빛
        const colorVar = Math.random();
        if (colorVar > 0.7) {
          colors.push(1.0, 1.0, 0.8); // 밝은 노란색
        } else if (colorVar > 0.4) {
          colors.push(1.0, 0.9, 0.5); // 노란색
        } else {
          colors.push(1.0, 0.7, 0.3); // 주황색
        }

        sizes.push(0.5 + Math.random() * 1.5);
      }
    });

    cityLightsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    cityLightsGeometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    cityLightsGeometry.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1));

    const cityLightsMaterial = new THREE.PointsMaterial({
      size: 0.15,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
      map: createGlowTexture()
    });

    function createGlowTexture() {
      const canvas = document.createElement('canvas');
      canvas.width = 32;
      canvas.height = 32;
      const ctx = canvas.getContext('2d');
      const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
      gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
      gradient.addColorStop(0.2, 'rgba(255, 255, 200, 0.8)');
      gradient.addColorStop(0.5, 'rgba(255, 200, 100, 0.3)');
      gradient.addColorStop(1, 'rgba(255, 150, 50, 0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 32, 32);
      const texture = new THREE.CanvasTexture(canvas);
      return texture;
    }

    const cityLights = new THREE.Points(cityLightsGeometry, cityLightsMaterial);
    scene.add(cityLights);

    // 각 도시 내에서 점들끼리 연결 (서울은 서울끼리, 도쿄는 도쿄끼리)
    const linesGroup = new THREE.Group();

    cities.forEach(city => {
      // 각 도시 내의 점들 좌표 저장
      const cityPoints = [];
      const numLights = Math.floor(10 + city.intensity * 20);
      const cityRadius = 0.003 + city.intensity * 0.006;

      for (let i = 0; i < numLights; i++) {
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.sqrt(Math.random()) * cityRadius;

        const lat = city.lat + Math.cos(angle) * distance * 60;
        const lon = city.lon + Math.sin(angle) * distance * 60;

        const phi = (90 - lat) * (Math.PI / 180);
        const theta = (lon + 180) * (Math.PI / 180);
        const radius = 5.02;

        const x = -radius * Math.sin(phi) * Math.cos(theta);
        const y = radius * Math.cos(phi);
        const z = radius * Math.sin(phi) * Math.sin(theta);

        cityPoints.push(new THREE.Vector3(x, y, z));
      }

      // 같은 도시 내의 점들끼리 연결
      cityPoints.forEach((point, idx) => {
        // 각 점에서 가장 가까운 2~3개 점과 연결
        const distances = cityPoints
          .map((p, i) => ({ index: i, dist: point.distanceTo(p) }))
          .filter(d => d.index !== idx)
          .sort((a, b) => a.dist - b.dist)
          .slice(0, 2 + Math.floor(Math.random() * 2)); // 2~3개 연결

        distances.forEach(({ index }) => {
          const lineGeometry = new THREE.BufferGeometry().setFromPoints([
            point,
            cityPoints[index]
          ]);

          const lineMaterial = new THREE.ShaderMaterial({
            uniforms: {},
            vertexShader: `
              varying vec3 vPosition;
              void main() {
                vPosition = position;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
              }
            `,
            fragmentShader: `
              varying vec3 vPosition;
              void main() {
                // 약한 glow 효과
                vec3 glowColor = vec3(1.0, 0.7, 0.3);
                float alpha = 0.4;
                gl_FragColor = vec4(glowColor, alpha);
              }
            `,
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false
          });

          const line = new THREE.Line(lineGeometry, lineMaterial);
          linesGroup.add(line);
        });
      });
    });

    scene.add(linesGroup);

    // 대륙 내 가까운 도시들끼리 연결 (서울-도쿄, 뉴욕-시카고 등)
    const cityConnectionsGroup = new THREE.Group();

    const latLonToVector3 = (lat, lon, radius) => {
      const phi = (90 - lat) * (Math.PI / 180);
      const theta = (lon + 180) * (Math.PI / 180);

      const x = -radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.cos(phi);
      const z = radius * Math.sin(phi) * Math.sin(theta);

      return new THREE.Vector3(x, y, z);
    };

    // 각 도시에서 적당히 가까운 도시들과만 연결
    cities.forEach((city, i) => {
      const cityPos = latLonToVector3(city.lat, city.lon, 5.02);

      // 다른 도시와의 거리 계산
      const nearCities = cities
        .map((otherCity, j) => {
          if (i >= j) return null; // 중복 방지
          const otherPos = latLonToVector3(otherCity.lat, otherCity.lon, 5.02);
          const dist = cityPos.distanceTo(otherPos);
          return { index: j, pos: otherPos, dist };
        })
        .filter(d => d !== null && d.dist < 2.5) // 거리 2.5 이하만 (같은 대륙 정도)
        .sort((a, b) => a.dist - b.dist)
        .slice(0, 2); // 가장 가까운 2개만

      nearCities.forEach(({ pos }) => {
        const lineGeometry = new THREE.BufferGeometry().setFromPoints([
          cityPos,
          pos
        ]);

        const lineMaterial = new THREE.ShaderMaterial({
          uniforms: {},
          vertexShader: `
            varying vec3 vPosition;
            void main() {
              vPosition = position;
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
          `,
          fragmentShader: `
            varying vec3 vPosition;
            void main() {
              // 약한 glow 효과
              vec3 glowColor = vec3(1.0, 0.7, 0.3);
              float alpha = 0.35;
              gl_FragColor = vec4(glowColor, alpha);
            }
          `,
          transparent: true,
          blending: THREE.AdditiveBlending,
          depthWrite: false
        });

        const line = new THREE.Line(lineGeometry, lineMaterial);
        cityConnectionsGroup.add(line);
      });
    });

    scene.add(cityConnectionsGroup);

    // 구름 레이어 제거 (야경 모드에서는 불필요)
    // const cloudsGeometry = new THREE.SphereGeometry(5.05, 64, 64);
    // const cloudsMaterial = new THREE.MeshPhongMaterial({
    //   map: cloudsTexture,
    //   transparent: true,
    //   opacity: 0.08,
    //   depthWrite: false,
    // });
    // const clouds = new THREE.Mesh(cloudsGeometry, cloudsMaterial);
    // scene.add(clouds);

    // Atmosphere glow (야경 모드 - 어두운 대기)
    const atmosphereGeometry = new THREE.SphereGeometry(5.2, 64, 64);
    const atmosphereMaterial = new THREE.ShaderMaterial({
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        void main() {
          float intensity = pow(0.5 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
          gl_FragColor = vec4(0.2, 0.4, 0.8, 1.0) * intensity * 0.2; // 대기광 더욱 어둡게
        }
      `,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      transparent: true
    });
    const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
    scene.add(atmosphere);

    // Lighting - 완전 야경 모드 (조명 최소화)
    const ambientLight = new THREE.AmbientLight(0x000000, 0.0); // 조명 없음
    scene.add(ambientLight);

    // Mouse interaction
    let mouseX = 0;
    let mouseY = 0;
    const handleMouseMove = (event) => {
      mouseX = (event.clientX / window.innerWidth) * 2 - 1;
      mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('mousemove', handleMouseMove);

    // Animation
    let frameCount = 0;
    const animate = () => {
      animationRef.current = requestAnimationFrame(animate);

      if (frameCount === 0) {
        console.log('[WebGL] Animation started');
      }
      frameCount++;

      // Smooth camera movement
      camera.position.x += (mouseX * 4 - camera.position.x + 2) * 0.02;
      camera.position.y += (mouseY * 4 - camera.position.y + 3) * 0.02;
      camera.lookAt(0, 0, 0);

      // Earth rotation (visible speed)
      earth.rotation.y += 0.005;
      cityLights.rotation.y += 0.005; // 도시 불빛도 함께 회전
      linesGroup.rotation.y += 0.005; // 도시 내 연결선도 함께 회전
      cityConnectionsGroup.rotation.y += 0.005; // 도시 간 연결선도 함께 회전

      atmosphere.rotation.y += 0.005;

      // Star rotation
      starField.rotation.y += 0.0003;

      renderer.render(scene, camera);

      if (frameCount === 60) {
        console.log('[WebGL] 60 frames rendered, earth.rotation.y:', earth.rotation.y);
      }
    };
    console.log('[WebGL] Calling animate()...');
    animate();

    // Handle window resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      console.log('[WebGL] Cleanup starting...');
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        console.log('[WebGL] Animation cancelled');
      }
      if (containerRef.current && rendererRef.current && rendererRef.current.domElement) {
        try {
          containerRef.current.removeChild(rendererRef.current.domElement);
          console.log('[WebGL] Canvas removed');
        } catch (e) {
          console.error('[WebGL] Error removing canvas:', e);
        }
      }
      starsGeometry.dispose();
      starsMaterial.dispose();
      earthGeometry.dispose();
      earthMaterial.dispose();
      earthTexture.dispose();
      earthNightTexture.dispose();
      cloudsTexture.dispose();
      atmosphereGeometry.dispose();
      atmosphereMaterial.dispose();
      cityLightsGeometry.dispose();
      cityLightsMaterial.dispose();
      if (cityLightsMaterial.map) cityLightsMaterial.map.dispose();

      // 연결선 cleanup
      linesGroup.children.forEach(line => {
        if (line.geometry) line.geometry.dispose();
        if (line.material) line.material.dispose();
      });

      cityConnectionsGroup.children.forEach(line => {
        if (line.geometry) line.geometry.dispose();
        if (line.material) line.material.dispose();
      });

      renderer.dispose();
      console.log('[WebGL] Cleanup complete');
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: -1,
        background: '#000000',
      }}
    />
  );
};

export default WebGLBackground;
