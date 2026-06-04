// Fundación Pescar — Buenos Aires Edition
// ZENSHIN (全進) - Interactive team presentation arcade action game

// Hide dev UI sidebar if running in the parent dashboard iframe
try {
  if (window.parent && window.parent !== window && window.parent.document) {
    const hideSidebar = () => {
      const sidebar = Array.from(window.parent.document.querySelectorAll('div')).find(el => 
        el.classList.contains('w-[280px]') && el.classList.contains('shrink-0')
      );
      if (sidebar) {
        sidebar.style.display = 'none';
      }
    };
    hideSidebar();
    setInterval(hideSidebar, 500);
  }
} catch (_) {}

// Set favicon and title dynamically on both iframe and parent document
try {
  const updateTitleAndFavicon = (doc) => {
    doc.title = "EQUIPO 9 - FUNDACION PESCAR";
    let favicon = doc.querySelector("link[rel~='icon']");
    if (!favicon) {
      favicon = doc.createElement('link');
      favicon.rel = 'icon';
      doc.head.appendChild(favicon);
    }
    const protocol = 'http' + '://';
    const svgNS = protocol + 'www.w3.org/2000/svg';
    favicon.href = `data:image/svg+xml,<svg xmlns=%22${svgNS}%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🚀</text></svg>`;
  };
  updateTitleAndFavicon(document);
  if (window.parent && window.parent.document) {
    updateTitleAndFavicon(window.parent.document);
  }
} catch (_) {}

const GAME_WIDTH = 800;
const GAME_HEIGHT = 600;
const STORAGE_KEY = 'pescar-arcade-zenshin-highscores';

const COLORS = {
  background: 0x0a0a1a,
  neonBlue: 0x4fc3f7,
  neonOrange: 0xff6b35,
  white: 0xffffff,
  darkGray: 0x1a1a2e,
  enemyRed: 0xff5252,
  green: 0x4caf50,
  magenta: 0xe040fb,
  yellow: 0xffd54f,
};

const CABINET_KEYS = {
  P1_U: ['w', 'ArrowUp'],
  P1_D: ['s', 'ArrowDown'],
  P1_L: ['a', 'ArrowLeft'],
  P1_R: ['d', 'ArrowRight'],
  P1_1: ['u', 'z', 'Enter'],
  P1_2: ['i', 'x', 'space'],
  P1_3: ['o'],
  P1_4: ['j'],
  P1_5: ['k'],
  P1_6: ['l'],
  P2_U: ['ArrowUp'],
  P2_D: ['ArrowDown'],
  P2_L: ['ArrowLeft'],
  P2_R: ['ArrowRight'],
  P2_1: ['r'],
  P2_2: ['t'],
  P2_3: ['y'],
  P2_4: ['f'],
  P2_5: ['g'],
  P2_6: ['h'],
  START1: ['Enter', '1', ' '],
  START2: ['2'],
};

const CHARACTERS = [
  {
    name: 'VALENTINA',
    color: '#ff6b35',
    colorHex: 0xff6b35,
    texture: 'valentina',
    role: 'LA NAVEGANTE DE LOS ENIGMAS',
    desc: 'Combina pensamiento logico y creatividad pura para apuntar los canones.',
    fullBio: 'Inicio su entrenamiento de vuelo en los simuladores clasicos de 32 bits, lo que encendio la chispa de su vocacion espacial. Hoy, es la encargada de apuntar los cañones de la nave combinando el rigor del pensamiento logico con rafagas de creatividad pura. Cuando no esta disparandole al Conformismo, escanea los rincones mas oscuros del mapa estelar y pinta las galaxias buscando respuestas a los grandes misterios del universo.'
  },
  {
    name: 'AZUCENA',
    color: '#4fc3f7',
    colorHex: 0x4fc3f7,
    texture: 'azucena',
    role: 'LA CENTINELA DEL EQUILIBRIO',
    desc: 'Guerrera tactica que mantiene el balance perfecto entre cuerpo, mente y codigo.',
    fullBio: 'Una guerrera tactica que mantiene un balance perfecto entre el cuerpo, la mente y el codigo. Utiliza su aguda vision fotografica y artistica para encontrar los puntos debiles del enemigo en el campo de batalla, todo mientras mantiene una postura impecable.'
  },
  {
    name: 'LOURDES',
    color: '#e040fb',
    colorHex: 0xe040fb,
    texture: 'lourdes',
    role: 'LA ORACULO DE LAS CIENCIAS EXACTAS',
    desc: 'Oficial de comunicaciones y principal ingeniera informatica de la nave.',
    fullBio: 'La oficial de comunicaciones y principal ingeniera informatica de la nave. Mientras otros tripulantes se apoyan en la abstraccion del arte, ella prefiere la frialdad tactica de las matematicas y las ciencias exactas para calcular las trayectorias perfectas de los disparos. Fiel defensora de la fauna intergalactica y mantiene sus estadisticas altas a base de energia 100% plant-based.'
  },
  {
    name: 'MARCELO',
    color: '#4caf50',
    colorHex: 0x4caf50,
    texture: 'marcelo',
    role: 'EL INVOCADOR DE LAS NUBES',
    desc: 'Estudiante de sistemas que esboza tacticas complejas de infraestructura.',
    fullBio: 'Un estudiante de sistemas con la mirada puesta en la estratosfera. Armado con su lapiz y un profundo conocimiento de mundos de ciencia ficcion, esboza tacticas complejas de infraestructura antes de desplegarlas en la batalla.'
  },
  {
    name: 'DENISE',
    color: '#ffd54f',
    colorHex: 0xffd54f,
    texture: 'denise',
    role: 'LA ILUSIONISTA DIGITAL',
    desc: 'Fusiona la magia del diseno con la logica del codigo en pantalla.',
    fullBio: 'Una maestra de las artes visuales que actualmente esta desbloqueando el arbol de habilidades de "Desarrolladora". Fusiona la magia del diseno con la logica del codigo para alterar la realidad en pantalla y crear interfaces letales.'
  },
  {
    name: 'IMANOL',
    color: '#ff5252',
    colorHex: 0xff5252,
    texture: 'imanol',
    role: 'EL TACTICO DE VANGUARDIA',
    desc: 'Mente maestra detras del desarrollo del arsenal y las mejoras.',
    fullBio: 'Desde que piso la cabina, su instinto ha sido desarmar y entender cada panel de control de la nave, persiguiendo respuestas hasta en los confines mas lejanos del espacio. Como especialista en Gestion de la Tecnologia, es la mente maestra detras del desarrollo del arsenal y las mejoras del escuadrón. Combina una disciplina de acero forjada en la sala de entrenamiento de gravedad cero con tacticas extraidas de sus extensas lecturas, llevando siempre los motores y al equipo mucho mas alla de sus limites tecnicos.'
  }
];

const NEGATIVE_WORDS = [
  'CONFORMISMO', 'SEDENTARISMO', 'EXCUSAS',
  'INDIVIDUALISMO', 'BUGS CRITICOS'
];

const BOSS_WORDS = [
  'PROCRASTINACION', 'BLOQUEO CREATIVO', 'SINDROME DEL IMPOSTOR'
];

const LETTER_GRID = [
  ['A', 'B', 'C', 'D', 'E', 'F'],
  ['G', 'H', 'I', 'J', 'K', 'L'],
  ['M', 'N', 'O', 'P', 'Q', 'R'],
  ['S', 'T', 'U', 'V', 'W', 'X'],
  ['Y', 'Z', 'DEL', 'END']
];

// Map keyboard to arcade codes
const KEYBOARD_TO_ARCADE = {};
function normalizeIncomingKey(key) {
  if (typeof key !== 'string' || key.length === 0) return '';
  if (key === ' ') return 'space';
  return key.toLowerCase();
}
for (const [arcadeCode, keys] of Object.entries(CABINET_KEYS)) {
  for (const key of keys) {
    KEYBOARD_TO_ARCADE[normalizeIncomingKey(key)] = arcadeCode;
  }
}

// Global controls state tracker
const controls = {
  held: {},
  pressed: {},
  consumePressed(controlCode) {
    if (this.pressed[controlCode]) {
      this.pressed[controlCode] = false;
      return true;
    }
    return false;
  },
  isHeld(controlCode) {
    return !!this.held[controlCode];
  }
};

window.addEventListener('keydown', (event) => {
  const key = normalizeIncomingKey(event.key);
  const arcadeCode = KEYBOARD_TO_ARCADE[key];
  if (arcadeCode) {
    if (!controls.held[arcadeCode]) {
      controls.pressed[arcadeCode] = true;
    }
    controls.held[arcadeCode] = true;
  }
});

window.addEventListener('keyup', (event) => {
  const key = normalizeIncomingKey(event.key);
  const arcadeCode = KEYBOARD_TO_ARCADE[key];
  if (arcadeCode) {
    controls.held[arcadeCode] = false;
  }
});

// Sound and Music Synthesizer Engines using Web Audio API
const SoundEngine = {
  ctx: null,
  init(scene) {
    if (this.ctx) return;
    this.ctx = scene.sound && scene.sound.context ? scene.sound.context : null;
  },
  play(type) {
    try {
      const ctx = this.ctx || (window.AudioContext ? new AudioContext() : null);
      if (!ctx) return;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      const now = ctx.currentTime;

      if (type === 'click') {
        osc.type = 'square';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(400, now + 0.05);
        gain.gain.setValueAtTime(0.04, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
        osc.start(now);
        osc.stop(now + 0.05);
      } else if (type === 'select') {
        osc.type = 'square';
        osc.frequency.setValueAtTime(500, now);
        osc.frequency.exponentialRampToValueAtTime(1000, now + 0.12);
        gain.gain.setValueAtTime(0.06, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
        osc.start(now);
        osc.stop(now + 0.12);
      } else if (type === 'slash') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(1200, now);
        osc.frequency.exponentialRampToValueAtTime(100, now + 0.15);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        osc.start(now);
        osc.stop(now + 0.15);
      } else if (type === 'special') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.linearRampToValueAtTime(800, now + 0.3);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        osc.start(now);
        osc.stop(now + 0.35);
      } else if (type === 'hurt') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.exponentialRampToValueAtTime(40, now + 0.18);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
        osc.start(now);
        osc.stop(now + 0.18);
      } else if (type === 'boss_hurt') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(90, now);
        osc.frequency.exponentialRampToValueAtTime(10, now + 0.4);
        gain.gain.setValueAtTime(0.22, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
        osc.start(now);
        osc.stop(now + 0.4);
      } else if (type === 'powerup') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(261.63, now); // C4
        osc.frequency.setValueAtTime(329.63, now + 0.08); // E4
        osc.frequency.setValueAtTime(392.00, now + 0.16); // G4
        osc.frequency.setValueAtTime(523.25, now + 0.24); // C5
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        osc.start(now);
        osc.stop(now + 0.35);
      }
    } catch (_) { }
  }
};

const MusicEngine = {
  ctx: null,
  nodes: [],
  interval: null,
  init(scene) {
    this.ctx = scene.sound && scene.sound.context ? scene.sound.context : null;
  },
  startAmbient() {
    this.stop();
    try {
      const ctx = this.ctx || (window.AudioContext ? new AudioContext() : null);
      if (!ctx) return;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const master = ctx.createGain();
      master.gain.setValueAtTime(0.06, ctx.currentTime);
      master.connect(ctx.destination);
      this.nodes.push(master);

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(350, ctx.currentTime);
      filter.connect(master);
      this.nodes.push(filter);

      // Low chord (A1, E2, A2)
      const frequencies = [55, 82.41, 110];
      frequencies.forEach(f => {
        const osc = ctx.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(f, ctx.currentTime);
        osc.detune.setValueAtTime(Math.random() * 12 - 6, ctx.currentTime);

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.02, ctx.currentTime);
        osc.connect(gain);
        gain.connect(filter);

        osc.start();
        this.nodes.push(osc);
        this.nodes.push(gain);
      });

      // slow atmospheric notes
      let step = 0;
      const notes = [110, 130.81, 146.83, 164.81, 196, 220];
      this.interval = setInterval(() => {
        try {
          const now = ctx.currentTime;
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = 'triangle';
          osc.frequency.setValueAtTime(notes[(step++) % notes.length], now);

          gain.gain.setValueAtTime(0.012, now);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.4);

          osc.connect(gain);
          gain.connect(master);

          osc.start(now);
          osc.stop(now + 1.5);
        } catch (_) { }
      }, 1600);

    } catch (_) { }
  },
  startGameMusic() {
    this.stop();
    try {
      const ctx = this.ctx || (window.AudioContext ? new AudioContext() : null);
      if (!ctx) return;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const master = ctx.createGain();
      master.gain.setValueAtTime(0.08, ctx.currentTime);
      master.connect(ctx.destination);
      this.nodes.push(master);

      const bassNotes = [55, 55, 65.41, 65.41, 73.42, 73.42, 82.41, 82.41]; // A1, C2, D2, E2
      const leadNotes = [220, 261.63, 293.66, 329.63, 392, 440];

      let tick = 0;
      this.interval = setInterval(() => {
        try {
          const now = ctx.currentTime;

          // Bass hit every 0.3s
          const bassOsc = ctx.createOscillator();
          const bassGain = ctx.createGain();
          bassOsc.type = 'sawtooth';
          bassOsc.frequency.setValueAtTime(bassNotes[Math.floor(tick / 2) % bassNotes.length], now);
          bassGain.gain.setValueAtTime(0.04, now);
          bassGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.25);
          bassOsc.connect(bassGain);
          bassGain.connect(master);
          bassOsc.start(now);
          bassOsc.stop(now + 0.3);

          // Lead hit on odd beats
          if (tick % 4 === 0 || (tick % 6 === 2 && Math.random() > 0.4)) {
            const leadOsc = ctx.createOscillator();
            const leadGain = ctx.createGain();
            leadOsc.type = 'square';
            leadOsc.frequency.setValueAtTime(leadNotes[Math.floor(Math.random() * leadNotes.length)], now);
            leadGain.gain.setValueAtTime(0.015, now);
            leadGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.4);
            leadOsc.connect(leadGain);
            leadGain.connect(master);
            leadOsc.start(now);
            leadOsc.stop(now + 0.45);
          }

          tick++;
        } catch (_) { }
      }, 300);

    } catch (_) { }
  },
  stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
    this.nodes.forEach(node => {
      try {
        node.disconnect();
        if (node.stop) node.stop();
      } catch (_) { }
    });
    this.nodes = [];
  }
};

// Storage system manager with fallback
const Storage = {
  async get() {
    if (window.platanusArcadeStorage) {
      try {
        const res = await window.platanusArcadeStorage.get(STORAGE_KEY);
        return res.found && Array.isArray(res.value) ? res.value.filter(isHighScoreEntry) : [];
      } catch (_) { return []; }
    } else {
      try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw).filter(isHighScoreEntry) : [];
      } catch (_) { return []; }
    }
  },
  async save(scores) {
    if (window.platanusArcadeStorage) {
      try {
        await window.platanusArcadeStorage.set(STORAGE_KEY, scores);
      } catch (_) { }
    } else {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(scores));
      } catch (_) { }
    }
  }
};

function isHighScoreEntry(value) {
  return (
    value &&
    typeof value === 'object' &&
    typeof value.name === 'string' &&
    typeof value.score === 'number' &&
    typeof value.character === 'string'
  );
}

// ------------------------------------------------------------------------
// SCENES
// ------------------------------------------------------------------------

class TitleScene extends Phaser.Scene {
  constructor() {
    super('TitleScene');
  }

  create() {
    // Resume/start audio on first interaction
    this.input.keyboard.on('keydown', () => {
      SoundEngine.init(this);
      MusicEngine.init(this);
      MusicEngine.startAmbient();
    }, this);

    this.add.rectangle(400, 300, 800, 600, 0x0a0a1a);

    // Sakura falling petals particles
    createSakuraTexture(this);
    this.add.particles(0, 0, 'sakura', {
      x: { min: 0, max: 800 },
      y: -10,
      lifespan: 8000,
      speedY: { min: 40, max: 90 },
      speedX: { min: -25, max: 25 },
      scale: { start: 0.5, end: 1.1 },
      alpha: { start: 0.7, end: 0 },
      rotate: { min: 0, max: 360 },
      frequency: 280
    });

    // Glowing Neon Title
    const titleShadow = this.add.text(400, 180, 'ZENSHIN\n全進', {
      fontFamily: 'monospace',
      fontSize: '76px',
      color: '#ff6b35',
      align: 'center',
      fontStyle: 'bold'
    }).setOrigin(0.5).setAlpha(0.6);

    const titleText = this.add.text(400, 180, 'ZENSHIN\n全進', {
      fontFamily: 'monospace',
      fontSize: '74px',
      color: '#4fc3f7',
      align: 'center',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Flicker animation
    this.tweens.add({
      targets: titleShadow,
      alpha: { from: 0.2, to: 0.8 },
      duration: 120,
      yoyo: true,
      repeat: -1,
      repeatDelay: 1800,
    });

    // Team name subtitle
    this.add.text(400, 300, 'EQUIPO 9 - PESCAR', {
      fontFamily: 'monospace',
      fontSize: '22px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Blinking prompt
    const promptText = this.add.text(400, 450, 'PRESIONÁ START PARA COMENZAR', {
      fontFamily: 'monospace',
      fontSize: '18px',
      color: '#4fc3f7',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.tweens.add({
      targets: promptText,
      alpha: 0.2,
      duration: 700,
      yoyo: true,
      repeat: -1
    });
  }

  update() {
    if (controls.consumePressed('START1') || controls.consumePressed('START2') || controls.consumePressed('P1_1')) {
      SoundEngine.init(this);
      MusicEngine.init(this);
      SoundEngine.play('select');
      MusicEngine.startAmbient();

      this.cameras.main.fadeOut(800, 10, 10, 26);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('IntroScene');
      });
    }
  }
}

class IntroScene extends Phaser.Scene {
  constructor() {
    super('IntroScene');
    this.introScreens = [
      {
        title: 'La Tripulación (¿Quiénes somos?)',
        content: 'Una escuadra diversa de cadetes tech compartiendo los controles de la nave. Nos define la curiosidad por entender los sistemas de vuelo, el relajarnos compartiendo arte en las pantallas de la cabina durante los saltos hiperespaciales, y un escudo de apoyo inquebrantable: si las palabras nos acorralan, toda la tripulación concentra el fuego para defendernos.'
      },
      {
        title: 'Coordenadas de Origen (¿De dónde venimos?)',
        content: 'Nuestra nave fue ensamblada con puro esfuerzo obrero. Nos teletransportamos desde distintas bases del sector terrestre (Quilmes, Tortuguitas, Ezeiza, Tapiales y Flores). No empezamos la partida con naves de lujo ni rutas prearmadas; nuestro objetivo es trazar un camino estelar completamente nuevo y ser los primeros de nuestras familias en alcanzar el rango oficial de Profesionales.'
      },
      {
        title: 'Plan de Vuelo (¿A dónde vamos?)',
        content: 'Directo al centro del enjambre de cosas negativas, bien lejos de la zona segura. Volamos con la misión de destruir cada obstáculo hasta graduarnos en tecnología. Para sobrevivir al caos de la pantalla, mantenemos el balance de la nave potenciando nuestros láseres creativos (arte) y manteniendo los reflejos de la tripulación al máximo nivel (fitness). ¡Nadie suelta el botón de disparo hasta ganar!'
      }
    ];
    this.screenIndex = 0;
    this.typingTimer = null;
  }

  create() {
    this.add.rectangle(400, 300, 800, 600, 0x0a0a1a);

    // Tech glowing border box
    const border = this.add.graphics();
    border.lineStyle(2, 0x4fc3f7, 0.6);
    border.strokeRect(50, 50, 700, 500);

    border.fillStyle(0xff6b35, 0.8);
    border.fillRect(48, 48, 6, 6);
    border.fillRect(746, 48, 6, 6);
    border.fillRect(48, 546, 6, 6);
    border.fillRect(746, 546, 6, 6);

    this.titleText = this.add.text(400, 115, '', {
      fontFamily: 'monospace',
      fontSize: '28px',
      color: '#ff6b35',
      fontStyle: 'bold',
      align: 'center'
    }).setOrigin(0.5);

    this.contentText = this.add.text(400, 290, '', {
      fontFamily: 'monospace',
      fontSize: '17px',
      color: '#ffffff',
      align: 'center',
      lineSpacing: 8,
      wordWrap: { width: 620 }
    }).setOrigin(0.5);

    this.footerText = this.add.text(400, 495, 'PRESIONÁ START PARA CONTINUAR', {
      fontFamily: 'monospace',
      fontSize: '14px',
      color: '#4fc3f7'
    }).setOrigin(0.5);

    this.tweens.add({
      targets: this.footerText,
      alpha: 0.3,
      duration: 800,
      yoyo: true,
      repeat: -1
    });

    this.screenIndex = 0;
    this.showScreen();
  }

  showScreen() {
    if (this.screenIndex >= this.introScreens.length) {
      this.cameras.main.fadeOut(800, 10, 10, 26);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('CharacterSelectScene');
      });
      return;
    }

    const data = this.introScreens[this.screenIndex];
    this.titleText.setText(data.title);

    if (this.typingTimer) {
      this.typingTimer.destroy();
    }

    let index = 0;
    this.contentText.setText('');
    const fullText = data.content;

    this.typingTimer = this.time.addEvent({
      delay: 45,
      callback: () => {
        this.contentText.setText(fullText.substring(0, index + 1));
        index++;
      },
      repeat: fullText.length - 1
    });
  }

  update() {
    if (controls.consumePressed('START1') || controls.consumePressed('START2') || controls.consumePressed('P1_1')) {
      SoundEngine.play('click');
      this.screenIndex++;
      this.showScreen();
    }
  }
}

class CharacterSelectScene extends Phaser.Scene {
  constructor() {
    super('CharacterSelectScene');
    this.selectedIndex = 0;
  }

  init(data) {
    if (data && data.selected !== undefined) {
      this.selectedIndex = data.selected;
    }
  }

  create() {
    createCharacterTextures(this);

    this.add.rectangle(400, 300, 800, 600, 0x0a0a1a);

    this.add.text(400, 50, 'CONOCÉ A TU TRIPULACIÓN', {
      fontFamily: 'monospace',
      fontSize: '32px',
      color: '#4fc3f7',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.avatarContainers = [];

    const startX = 200;
    const spacingX = 200;
    const startY = 160;
    const spacingY = 130;

    CHARACTERS.forEach((char, index) => {
      const col = index % 3;
      const row = Math.floor(index / 3);
      const x = startX + col * spacingX;
      const y = startY + row * spacingY;

      const container = this.add.container(x, y);

      const cardBg = this.add.rectangle(0, 0, 160, 110, 0x1a1a2e, 0.9);
      cardBg.setStrokeStyle(2, 0x4fc3f7, 0.5);
      container.add(cardBg);

      const sprite = this.add.sprite(0, -15, char.texture);
      sprite.setScale(1.8);
      container.add(sprite);

      const nameText = this.add.text(0, 25, char.name, {
        fontFamily: 'monospace',
        fontSize: '14px',
        color: '#ffffff',
        fontStyle: 'bold'
      }).setOrigin(0.5);
      container.add(nameText);

      this.avatarContainers.push({
        container,
        cardBg,
        sprite,
        nameText,
        char
      });
    });

    const infoBg = this.add.rectangle(400, 460, 700, 95, 0x1a1a2e, 0.95);
    infoBg.setStrokeStyle(2, 0xff6b35, 0.6);

    this.infoTitle = this.add.text(80, 422, '', {
      fontFamily: 'monospace',
      fontSize: '20px',
      color: '#ff6b35',
      fontStyle: 'bold'
    });

    this.infoDesc = this.add.text(80, 452, '', {
      fontFamily: 'monospace',
      fontSize: '15px',
      color: '#ffffff',
      wordWrap: { width: 640 }
    });

    this.add.text(400, 545, 'NAVEGÁ CON JOYSTICK/WASD — ENTER/BOTÓN 1: VER BIO DETALLADA', {
      fontFamily: 'monospace',
      fontSize: '13px',
      color: '#4fc3f7',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.add.text(400, 570, 'START / BOTÓN 2: COMENZAR MISIÓN EN EQUIPO', {
      fontFamily: 'monospace',
      fontSize: '13px',
      color: '#4caf50',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.updateSelection();
  }

  updateSelection() {
    this.avatarContainers.forEach((item, index) => {
      const active = index === this.selectedIndex;
      if (active) {
        item.cardBg.setFillStyle(0xff6b35, 0.2);
        item.cardBg.setStrokeStyle(3, 0xff6b35, 1);
        item.nameText.setColor('#ff6b35');
        item.container.setScale(1.1);
      } else {
        item.cardBg.setFillStyle(0x1a1a2e, 0.9);
        item.cardBg.setStrokeStyle(2, 0x4fc3f7, 0.5);
        item.nameText.setColor('#ffffff');
        item.container.setScale(1.0);
      }
    });

    const activeChar = CHARACTERS[this.selectedIndex];
    this.infoTitle.setText(activeChar.name);
    this.infoDesc.setText(activeChar.desc);
  }

  update() {
    let changed = false;
    let col = this.selectedIndex % 3;
    let row = Math.floor(this.selectedIndex / 3);

    if (controls.consumePressed('P1_R')) {
      col = (col + 1) % 3;
      changed = true;
    } else if (controls.consumePressed('P1_L')) {
      col = (col - 1 + 3) % 3;
      changed = true;
    } else if (controls.consumePressed('P1_D')) {
      row = (row + 1) % 2;
      changed = true;
    } else if (controls.consumePressed('P1_U')) {
      row = (row - 1 + 2) % 2;
      changed = true;
    }

    if (changed) {
      this.selectedIndex = row * 3 + col;
      SoundEngine.play('click');
      this.updateSelection();
    }

    // P1_1 / Enter: Show bio screen
    if (controls.consumePressed('P1_1')) {
      SoundEngine.play('select');
      this.cameras.main.fadeOut(500, 10, 10, 26);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('CharacterDetailScene', { character: this.selectedIndex });
      });
    }

    // START1 / START2 / P1_2: Begin Mission (start game)
    if (controls.consumePressed('START1') || controls.consumePressed('START2') || controls.consumePressed('P1_2')) {
      SoundEngine.play('select');
      this.cameras.main.fadeOut(800, 10, 10, 26);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('GameScene');
      });
    }
  }
}

class CharacterDetailScene extends Phaser.Scene {
  constructor() {
    super('CharacterDetailScene');
  }

  init(data) {
    this.selectedIndex = data.character !== undefined ? data.character : 0;
    this.charData = CHARACTERS[this.selectedIndex];
  }

  create() {
    this.add.rectangle(400, 300, 800, 600, 0x0a0a1a);

    // Glowing border
    const border = this.add.graphics();
    border.lineStyle(2, this.charData.colorHex, 0.6);
    border.strokeRect(50, 50, 700, 500);

    // Vertical Divider between columns
    const divider = this.add.graphics();
    divider.lineStyle(1.5, this.charData.colorHex, 0.4);
    divider.lineBetween(300, 100, 300, 440);

    // Left Column: Avatar Container
    const avatarContainer = this.add.container(180, 270);
    
    // High-tech profile card background
    const avatarBg = this.add.rectangle(0, 0, 180, 220, 0x1a1a2e, 0.85);
    avatarBg.setStrokeStyle(3, this.charData.colorHex, 1);
    avatarContainer.add(avatarBg);

    // Large retro avatar sprite
    const avatarSprite = this.add.sprite(0, -10, this.charData.texture);
    avatarSprite.setScale(4.5);
    avatarContainer.add(avatarSprite);

    // Scanning laser effect
    const scanLine = this.add.rectangle(0, -105, 174, 3, this.charData.colorHex, 0.6);
    avatarContainer.add(scanLine);
    this.tweens.add({
      targets: scanLine,
      y: 105,
      duration: 2200,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Right Column: Texts
    // Character Name
    this.add.text(330, 110, this.charData.name, {
      fontFamily: 'monospace',
      fontSize: '38px',
      color: this.charData.color,
      fontStyle: 'bold'
    }).setOrigin(0, 0);

    // Character Role
    this.add.text(330, 160, this.charData.role, {
      fontFamily: 'monospace',
      fontSize: '18px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0, 0);

    // Bio/Description
    this.add.text(330, 205, this.charData.fullBio, {
      fontFamily: 'monospace',
      fontSize: '15px',
      color: '#e0e0e0',
      align: 'left',
      wordWrap: { width: 395 },
      lineSpacing: 6
    }).setOrigin(0, 0);

    // Bottom prompt
    const promptText = this.add.text(400, 520, 'PRESIONÁ ENTER o BOTÓN 1 PARA VOLVER', {
      fontFamily: 'monospace',
      fontSize: '15px',
      color: this.charData.color,
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.tweens.add({
      targets: promptText,
      alpha: 0.2,
      duration: 800,
      yoyo: true,
      repeat: -1
    });
  }

  update() {
    if (controls.consumePressed('START1') || controls.consumePressed('START2') || controls.consumePressed('P1_1')) {
      SoundEngine.play('click');
      this.cameras.main.fadeOut(500, 10, 10, 26);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('CharacterSelectScene', { selected: this.selectedIndex });
      });
    }
  }
}

class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
  }

  create() {
    MusicEngine.startGameMusic();

    this.add.rectangle(400, 300, 800, 600, 0x0a0a1a);

    // Parallax background details
    this.bgDetails = [];
    for (let i = 0; i < 40; i++) {
      const x = Phaser.Math.Between(0, 800);
      const y = Phaser.Math.Between(0, 600);
      const size = Phaser.Math.Between(2, 6);
      const alpha = size / 6;
      const rect = this.add.rectangle(x, y, size, size, 0x1a1a2e, alpha);
      this.bgDetails.push(rect);
    }

    // Player Spaceship setup
    createSpaceshipTexture(this);
    this.player = this.physics.add.sprite(400, 300, 'spaceship');
    this.player.setScale(1.4);
    this.player.setCollideWorldBounds(true);
    this.player.hp = 3;
    this.player.score = 0;
    this.player.wave = 1;
    this.player.isHurt = false;
    this.player.lastDir = { x: 0, y: -1 };

    this.nextAttackTime = 0;
    this.specialCooldownTime = 0;

    this.enemies = this.physics.add.group();

    // Prevent completely stacked enemies
    this.physics.add.collider(this.enemies, this.enemies);

    // HUD
    this.hudName = this.add.text(20, 20, 'EQUIPO 9', {
      fontFamily: 'monospace',
      fontSize: '20px',
      color: '#4fc3f7',
      fontStyle: 'bold'
    });

    this.hudScore = this.add.text(200, 20, 'SCORE: 00000', {
      fontFamily: 'monospace',
      fontSize: '20px',
      color: '#ffffff',
      fontStyle: 'bold'
    });

    this.hudWave = this.add.text(420, 20, 'OLA: 1', {
      fontFamily: 'monospace',
      fontSize: '20px',
      color: '#ffffff',
      fontStyle: 'bold'
    });

    this.hudHearts = this.add.text(620, 20, '♥ ♥ ♥', {
      fontFamily: 'monospace',
      fontSize: '20px',
      color: '#ff5252',
      fontStyle: 'bold'
    });

    this.hudSpecial = this.add.text(400, 560, 'ESPECIAL: LISTO', {
      fontFamily: 'monospace',
      fontSize: '14px',
      color: '#4fc3f7',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.waveStatusText = this.add.text(400, 220, '', {
      fontFamily: 'monospace',
      fontSize: '36px',
      color: '#ff6b35',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.waveActive = false;
    this.enemiesSpawned = 0;
    this.enemiesTarget = 0;
    this.isBossWave = false;

    this.updateHud();

    this.time.delayedCall(1000, () => this.startWave());
  }

  update(time, delta) {
    let vx = 0;
    let vy = 0;
    if (controls.isHeld('P1_L')) { vx = -1; }
    if (controls.isHeld('P1_R')) { vx = 1; }
    if (controls.isHeld('P1_U')) { vy = -1; }
    if (controls.isHeld('P1_D')) { vy = 1; }

    const speed = 260;
    if (vx !== 0 || vy !== 0) {
      const angle = Math.atan2(vy, vx);
      this.player.setRotation(angle + Math.PI / 2); // Faces up by default, add PI/2
      this.player.lastDir = { x: Math.cos(angle), y: Math.sin(angle) };

      if (vx !== 0 && vy !== 0) {
        vx *= 0.7071;
        vy *= 0.7071;
      }
    }
    this.player.setVelocity(vx * speed, vy * speed);

    // Parallax update
    this.bgDetails.forEach((rect, i) => {
      const factor = (i % 3 + 1) * 0.05;
      rect.x = (rect.x - this.player.body.velocity.x * factor * 0.016 + 800) % 800;
      rect.y = (rect.y - this.player.body.velocity.y * factor * 0.016 + 600) % 600;
    });

    // Enemy AI tracking player
    this.enemies.getChildren().forEach(enemy => {
      if (enemy.active) {
        const angle = Phaser.Math.Angle.Between(enemy.x, enemy.y, this.player.x, this.player.y);
        enemy.setRotation(0); // Keep readable rotation
        this.physics.velocityFromRotation(angle, enemy.speed, enemy.body.velocity);
      }
    });

    // Input actions
    if (controls.consumePressed('P1_1') && time >= this.nextAttackTime) {
      this.nextAttackTime = time + 250;
      this.triggerNormalAttack();
    }

    if (controls.consumePressed('P1_2') && time >= this.specialCooldownTime) {
      this.specialCooldownTime = time + 5000;
      this.triggerSpecialAttack();
    }

    const timeLeft = Math.ceil((this.specialCooldownTime - time) / 1000);
    if (timeLeft > 0) {
      this.hudSpecial.setText(`ESPECIAL: RECARGANDO (${timeLeft}s)`);
      this.hudSpecial.setColor('#ff6b35');
    } else {
      this.hudSpecial.setText('ESPECIAL: LISTO [BOTÓN 2]');
      this.hudSpecial.setColor('#4fc3f7');
    }

    // Check wave status
    if (this.waveActive) {
      const activeCount = this.enemies.countActive(true);
      if (this.enemiesSpawned >= this.enemiesTarget && activeCount === 0) {
        this.waveActive = false;
        this.endWave();
      }
    }
  }

  triggerNormalAttack() {
    SoundEngine.play('slash');

    const sx = this.player.x + this.player.lastDir.x * 45;
    const sy = this.player.y + this.player.lastDir.y * 45;

    const slashG = this.add.graphics();
    slashG.lineStyle(4, 0x4fc3f7, 1);
    slashG.beginPath();
    const angle = Math.atan2(this.player.lastDir.y, this.player.lastDir.x);
    slashG.arc(this.player.x, this.player.y, 45, angle - 1.2, angle + 1.2);
    slashG.strokePath();

    this.tweens.add({
      targets: slashG,
      alpha: 0,
      duration: 150,
      onComplete: () => slashG.destroy()
    });

    this.enemies.getChildren().forEach(enemy => {
      if (enemy.active) {
        const dist = Phaser.Math.Distance.Between(enemy.x, enemy.y, sx, sy);
        if (dist <= 55) {
          this.damageEnemy(enemy, 1);
        }
      }
    });
  }

  triggerSpecialAttack() {
    SoundEngine.play('special');
    this.cameras.main.shake(200, 0.02);

    const circleG = this.add.graphics();
    circleG.setPosition(this.player.x, this.player.y);
    circleG.lineStyle(4, 0xffffff, 1);
    circleG.strokeCircle(0, 0, 10);

    this.tweens.add({
      targets: circleG,
      scaleX: 12,
      scaleY: 12,
      alpha: 0,
      duration: 350,
      onComplete: () => circleG.destroy()
    });

    this.enemies.getChildren().forEach(enemy => {
      if (enemy.active) {
        const dist = Phaser.Math.Distance.Between(enemy.x, enemy.y, this.player.x, this.player.y);
        if (dist <= 120) {
          this.damageEnemy(enemy, 5);
        }
      }
    });
  }

  damageEnemy(enemy, amount) {
    if (!enemy.active) return;
    enemy.hp -= amount;

    this.tweens.add({
      targets: enemy,
      alpha: 0.1,
      duration: 40,
      yoyo: true,
      repeat: 1
    });

    if (enemy.hp <= 0) {
      this.player.score += enemy.isBoss ? 100 : 10;
      spawnExplosionParticles(this, enemy.x, enemy.y, 0xff5252);
      SoundEngine.play(enemy.isBoss ? 'boss_hurt' : 'hurt');
      enemy.destroy();
      this.updateHud();
    } else {
      if (enemy.isBoss) {
        this.cameras.main.shake(100, 0.01);
      }
      SoundEngine.play('hurt');
    }
  }

  startWave() {
    this.isBossWave = this.player.wave % 3 === 0;
    this.enemiesSpawned = 0;
    this.waveActive = true;

    if (this.isBossWave) {
      this.enemiesTarget = 1;
      this.waveStatusText.setText('¡ATENCIÓN! CRISIS DETECTADA');
      this.waveStatusText.setColor('#ff5252');
      this.waveStatusText.setAlpha(1);

      this.tweens.add({
        targets: this.waveStatusText,
        alpha: 0.2,
        duration: 200,
        yoyo: true,
        repeat: 4,
        onComplete: () => {
          this.waveStatusText.setText('');
          this.spawnBoss();
        }
      });
    } else {
      this.enemiesTarget = 5 + this.player.wave * 2;
      this.waveStatusText.setText(`OLA ${this.player.wave}`);
      this.waveStatusText.setColor('#4fc3f7');
      this.waveStatusText.setAlpha(1);

      this.tweens.add({
        targets: this.waveStatusText,
        alpha: 0,
        duration: 1500,
        delay: 500,
        onComplete: () => {
          this.waveStatusText.setText('');
          this.startSpawningNormalEnemies();
        }
      });
    }
  }

  startSpawningNormalEnemies() {
    this.spawnTimer = this.time.addEvent({
      delay: Math.max(1200 - this.player.wave * 50, 500),
      callback: () => {
        if (this.enemiesSpawned < this.enemiesTarget && this.waveActive) {
          spawnEnemy(this, false);
          this.enemiesSpawned++;
        } else {
          this.spawnTimer.destroy();
        }
      },
      loop: true
    });
  }

  spawnBoss() {
    spawnEnemy(this, true);
    this.enemiesSpawned = 1;
  }

  endWave() {
    SoundEngine.play('powerup');
    this.waveStatusText.setText('¡OLA COMPLETADA!');
    this.waveStatusText.setColor('#4caf50');
    this.waveStatusText.setAlpha(1);

    if (this.player.hp < 3) {
      this.player.hp++;
    }
    this.updateHud();

    this.tweens.add({
      targets: this.waveStatusText,
      alpha: 0,
      duration: 1500,
      delay: 800,
      onComplete: () => {
        this.waveStatusText.setText('');
        this.player.wave++;
        this.updateHud();
        this.time.delayedCall(1000, () => this.startWave());
      }
    });
  }

  updateHud() {
    this.hudScore.setText(`SCORE: ${String(this.player.score).padStart(5, '0')}`);
    this.hudWave.setText(`OLA: ${this.player.wave}`);

    let hpStr = '';
    for (let i = 0; i < 3; i++) {
      hpStr += i < this.player.hp ? '♥ ' : '♡ ';
    }
    this.hudHearts.setText(hpStr);
  }
}

class GameOverScene extends Phaser.Scene {
  constructor() {
    super('GameOverScene');
    this.gridRow = 0;
    this.gridCol = 0;
    this.initials = [];
    this.highScores = [];
    this.scoreSaved = false;
    this.needsInput = false;
  }

  init(data) {
    this.score = data.score !== undefined ? data.score : 0;
    this.characterName = data.character !== undefined ? data.character : 'EQUIPO';
    this.gridRow = 0;
    this.gridCol = 0;
    this.initials = [];
    this.scoreSaved = false;
    this.needsInput = false;
  }

  async create() {
    this.add.rectangle(400, 300, 800, 600, 0x0a0a1a);

    this.add.text(400, 60, 'FIN DEL JUEGO', {
      fontFamily: 'monospace',
      fontSize: '36px',
      color: '#ff5252',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.add.text(400, 110, `PUNTOS: ${this.score}   -   GUERRERO: ${this.characterName}`, {
      fontFamily: 'monospace',
      fontSize: '20px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    const quote = this.add.text(400, 160, '"Transformamos lo negativo en positivo"', {
      fontFamily: 'monospace',
      fontSize: '18px',
      color: '#4fc3f7',
      fontStyle: 'italic bold'
    }).setOrigin(0.5);

    this.tweens.add({
      targets: quote,
      scaleX: 1.05,
      scaleY: 1.05,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    this.add.text(400, 210, 'TABLA DE PUNTOS (TOP 3)', {
      fontFamily: 'monospace',
      fontSize: '16px',
      color: '#ff6b35',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.scoresText = this.add.text(400, 270, 'Cargando puntajes...', {
      fontFamily: 'monospace',
      fontSize: '16px',
      color: '#ffffff',
      align: 'center',
      lineSpacing: 8
    }).setOrigin(0.5);

    this.highScores = await Storage.get();
    this.refreshScoresDisplay();

    if (this.checkIfQualifies(this.score)) {
      this.needsInput = true;
      this.setupNameEntry();
    } else {
      this.setupNoHighscorePrompt();
    }
  }

  checkIfQualifies(score) {
    if (score <= 0) return false;
    return this.highScores.length < 3 || score > this.highScores[this.highScores.length - 1].score;
  }

  refreshScoresDisplay() {
    if (this.highScores.length === 0) {
      this.scoresText.setText('SIN REGISTROS AÚN');
      return;
    }
    const lines = this.highScores.map((h, i) => {
      return `${i + 1}. ${h.name.padEnd(5, ' ')} - ${String(h.score).padStart(5, '0')} Pts (${h.character})`;
    });
    this.scoresText.setText(lines.join('\n'));
  }

  setupNameEntry() {
    this.entryContainer = this.add.container(0, 0);

    const namePrompt = this.add.text(400, 340, '¡NUEVO RÉCORD! INGRESA TUS INICIALES:', {
      fontFamily: 'monospace',
      fontSize: '16px',
      color: '#4fc3f7',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    this.entryContainer.add(namePrompt);

    this.nameDisplayVal = this.add.text(400, 380, '_ _ _', {
      fontFamily: 'monospace',
      fontSize: '28px',
      color: '#ff6b35',
      fontStyle: 'bold',
      letterSpacing: 8
    }).setOrigin(0.5);
    this.entryContainer.add(this.nameDisplayVal);

    this.gridButtons = [];
    const startY = 430;
    const spacingX = 45;
    const spacingY = 32;

    LETTER_GRID.forEach((row, rIdx) => {
      const rowWidth = row.length * spacingX;
      row.forEach((char, cIdx) => {
        const x = 400 - rowWidth / 2 + cIdx * spacingX + spacingX / 2;
        const y = startY + rIdx * spacingY;

        const w = char.length > 1 ? 55 : 32;
        const bg = this.add.rectangle(x, y, w, 24, 0x1a1a2e);
        bg.setStrokeStyle(1, 0x4fc3f7, 0.4);
        this.entryContainer.add(bg);

        const text = this.add.text(x, y, char, {
          fontFamily: 'monospace',
          fontSize: char.length > 1 ? '11px' : '14px',
          color: '#ffffff',
          fontStyle: 'bold'
        }).setOrigin(0.5);
        this.entryContainer.add(text);

        this.gridButtons.push({
          bg,
          text,
          char,
          row: rIdx,
          col: cIdx
        });
      });
    });

    this.updateGridHighlight();
  }

  updateGridHighlight() {
    this.gridButtons.forEach(btn => {
      const active = btn.row === this.gridRow && btn.col === this.gridCol;
      if (active) {
        btn.bg.setFillStyle(0xff6b35, 0.3);
        btn.bg.setStrokeStyle(2, 0xff6b35, 1);
        btn.text.setColor('#ff6b35');
      } else {
        btn.bg.setFillStyle(0x1a1a2e, 1);
        btn.bg.setStrokeStyle(1, 0x4fc3f7, 0.4);
        btn.text.setColor('#ffffff');
      }
    });
  }

  setupNoHighscorePrompt() {
    this.promptText = this.add.text(400, 420, 'PRESIONÁ START PARA VOLVER AL INICIO', {
      fontFamily: 'monospace',
      fontSize: '20px',
      color: '#4fc3f7',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.tweens.add({
      targets: this.promptText,
      alpha: 0.2,
      duration: 600,
      yoyo: true,
      repeat: -1
    });
  }

  update() {
    if (this.needsInput && !this.scoreSaved) {
      let changed = false;
      if (controls.consumePressed('P1_R')) {
        this.gridCol++;
        changed = true;
      } else if (controls.consumePressed('P1_L')) {
        this.gridCol--;
        changed = true;
      } else if (controls.consumePressed('P1_D')) {
        this.gridRow++;
        changed = true;
      } else if (controls.consumePressed('P1_U')) {
        this.gridRow--;
        changed = true;
      }

      if (changed) {
        this.gridRow = Phaser.Math.Wrap(this.gridRow, 0, LETTER_GRID.length);
        const rowLength = LETTER_GRID[this.gridRow].length;
        this.gridCol = Phaser.Math.Wrap(this.gridCol, 0, rowLength);
        SoundEngine.play('click');
        this.updateGridHighlight();
      }

      if (controls.consumePressed('START1') || controls.consumePressed('START2') || controls.consumePressed('P1_1')) {
        SoundEngine.play('select');
        this.handleGridSelection();
      }
    } else {
      if (controls.consumePressed('START1') || controls.consumePressed('START2') || controls.consumePressed('P1_1')) {
        SoundEngine.play('select');
        this.cameras.main.fadeOut(800, 10, 10, 26);
        this.cameras.main.once('camerafadeoutcomplete', () => {
          this.scene.start('TitleScene');
        });
      }
    }
  }

  handleGridSelection() {
    const selectedChar = LETTER_GRID[this.gridRow][this.gridCol];

    if (selectedChar === 'DEL') {
      this.initials.pop();
    } else if (selectedChar === 'END') {
      if (this.initials.length > 0) {
        this.saveHighScore(this.initials.join(''));
      }
    } else {
      if (this.initials.length < 3) {
        this.initials.push(selectedChar);
      }
    }

    let dVal = '';
    for (let i = 0; i < 3; i++) {
      dVal += (i < this.initials.length ? this.initials[i] : '_') + ' ';
    }
    this.nameDisplayVal.setText(dVal.trim());
  }

  async saveHighScore(name) {
    this.scoreSaved = true;
    this.needsInput = false;

    const newEntry = {
      name: name,
      score: this.score,
      character: this.characterName,
      date: new Date().toISOString().slice(0, 10)
    };

    const updated = this.highScores.concat(newEntry)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);

    await Storage.save(updated);
    this.highScores = updated;
    this.refreshScoresDisplay();

    this.entryContainer.destroy();
    this.setupNoHighscorePrompt();
  }
}

// ------------------------------------------------------------------------
// GLOBAL HELPERS & GENERATORS
// ------------------------------------------------------------------------

function createSakuraTexture(scene) {
  if (scene.textures.exists('sakura')) return;
  const g = scene.make.graphics({ x: 0, y: 0, add: false });
  g.fillStyle(0xff6b35, 1);
  g.fillCircle(6, 6, 5);
  g.fillTriangle(6, 0, 2, 6, 10, 6);
  g.generateTexture('sakura', 12, 12);
  g.destroy();
}

function createSpaceshipTexture(scene) {
  if (scene.textures.exists('spaceship')) return;
  const g = scene.make.graphics({ x: 0, y: 0, add: false });
  g.lineStyle(2, 0x4fc3f7, 1);
  g.fillStyle(0x1a1a2e, 0.95);

  g.beginPath();
  g.moveTo(16, 2);
  g.lineTo(30, 26);
  g.lineTo(24, 22);
  g.lineTo(8, 22);
  g.lineTo(2, 26);
  g.closePath();
  g.fillPath();
  g.strokePath();

  g.fillStyle(0xff6b35, 1);
  g.fillTriangle(12, 22, 16, 32, 20, 22);

  g.fillStyle(0x4fc3f7, 1);
  g.fillTriangle(16, 8, 12, 16, 20, 16);

  g.generateTexture('spaceship', 32, 32);
  g.destroy();
}

function createCharacterTextures(scene) {
  const chars = [
    { name: 'valentina', color: 0xff6b35, shape: 'triangle' },
    { name: 'azucena', color: 0x4fc3f7, shape: 'square' },
    { name: 'lourdes', color: 0xe040fb, shape: 'cross' },
    { name: 'marcelo', color: 0x4caf50, shape: 'diamond' },
    { name: 'denise', color: 0xffd54f, shape: 'pentagon' },
    { name: 'imanol', color: 0xff5252, shape: 'hexagon' }
  ];

  chars.forEach(c => {
    if (scene.textures.exists(c.name)) return;
    const g = scene.make.graphics({ x: 0, y: 0, add: false });

    // Head (flesh color)
    g.fillStyle(0xffffff, 1);
    g.fillCircle(16, 10, 8);
    // Hair top
    g.fillStyle(c.color, 1);
    g.fillCircle(16, 6, 6);

    // Body
    g.fillStyle(c.color, 1);
    if (c.shape === 'triangle') {
      g.fillTriangle(16, 16, 6, 32, 26, 32);
    } else if (c.shape === 'square') {
      g.fillRect(8, 18, 16, 14);
    } else if (c.shape === 'cross') {
      g.fillRect(12, 18, 8, 14);
      g.fillRect(6, 22, 20, 6);
    } else if (c.shape === 'diamond') {
      g.fillTriangle(16, 17, 8, 25, 24, 25);
      g.fillTriangle(16, 33, 8, 25, 24, 25);
    } else if (c.shape === 'pentagon') {
      g.fillTriangle(16, 17, 6, 24, 26, 24);
      g.fillRect(6, 24, 20, 8);
    } else if (c.shape === 'hexagon') {
      g.fillTriangle(16, 17, 8, 22, 24, 22);
      g.fillRect(8, 22, 16, 7);
      g.fillTriangle(16, 33, 8, 29, 24, 29);
    }

    // Eyes
    g.fillStyle(0x000000, 1);
    g.fillRect(12, 9, 2, 3);
    g.fillRect(18, 9, 2, 3);

    // Blush
    g.fillStyle(0xff8a80, 0.7);
    g.fillCircle(11, 12, 1.5);
    g.fillCircle(21, 12, 1.5);

    g.generateTexture(c.name, 32, 34);
    g.destroy();
  });
}

function spawnEnemy(scene, isBoss = false) {
  let x, y;
  const edge = Phaser.Math.Between(0, 3);
  if (edge === 0) { // top
    x = Phaser.Math.Between(0, 800);
    y = -30;
  } else if (edge === 1) { // bottom
    x = Phaser.Math.Between(0, 800);
    y = 630;
  } else if (edge === 2) { // left
    x = -30;
    y = Phaser.Math.Between(0, 600);
  } else { // right
    x = 830;
    y = Phaser.Math.Between(0, 600);
  }

  const wordList = isBoss ? BOSS_WORDS : NEGATIVE_WORDS;
  const textVal = wordList[Phaser.Math.Between(0, wordList.length - 1)];

  const enemyText = scene.add.text(x, y, textVal, {
    fontFamily: 'monospace',
    fontSize: isBoss ? '28px' : '15px',
    color: '#ff5252',
    fontStyle: 'bold',
    backgroundColor: '#1a0d0d',
    padding: { x: 6, y: 4 }
  }).setOrigin(0.5);

  enemyText.setStroke('#ff0000', isBoss ? 3 : 1.5);

  scene.physics.add.existing(enemyText);
  enemyText.isBoss = isBoss;
  enemyText.hp = isBoss ? 10 + scene.player.wave * 2 : 1;
  enemyText.speed = isBoss ? 65 + scene.player.wave * 2 : 90 + scene.player.wave * 5;
  enemyText.body.setCollideWorldBounds(false);

  enemyText.body.setSize(enemyText.width, enemyText.height);

  // Contact collision damage
  scene.physics.add.overlap(scene.player, enemyText, () => {
    if (scene.player.isHurt) return;

    scene.player.hp--;
    scene.player.isHurt = true;
    SoundEngine.play('hurt');
    scene.cameras.main.shake(200, 0.02);

    scene.tweens.add({
      targets: scene.player,
      alpha: 0.2,
      duration: 100,
      yoyo: true,
      repeat: 5,
      onComplete: () => {
        scene.player.isHurt = false;
        scene.player.setAlpha(1);
      }
    });

    if (!enemyText.isBoss) {
      spawnExplosionParticles(scene, enemyText.x, enemyText.y, 0xff5252);
      enemyText.destroy();
    } else {
      const angle = Phaser.Math.Angle.Between(scene.player.x, scene.player.y, enemyText.x, enemyText.y);
      enemyText.x += Math.cos(angle) * 60;
      enemyText.y += Math.sin(angle) * 60;
    }

    scene.updateHud();

    if (scene.player.hp <= 0) {
      MusicEngine.stop();
      scene.cameras.main.fadeOut(800, 10, 10, 26);
      scene.cameras.main.once('camerafadeoutcomplete', () => {
        scene.scene.start('GameOverScene', { score: scene.player.score, character: 'TRIPULACION' });
      });
    }
  });

  scene.enemies.add(enemyText);
}

function spawnExplosionParticles(scene, x, y, color) {
  const burst = scene.add.graphics();
  const particles = [];

  for (let i = 0; i < 12; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 120 + 40;
    particles.push({
      x: x,
      y: y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      size: Math.random() * 4 + 2,
      alpha: 1
    });
  }

  const timer = scene.time.addEvent({
    delay: 16,
    callback: () => {
      burst.clear();
      let active = false;
      particles.forEach(p => {
        p.x += p.vx * 0.016;
        p.y += p.vy * 0.016;
        p.alpha -= 0.04;
        if (p.alpha > 0) {
          active = true;
          burst.fillStyle(color, p.alpha);
          burst.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
        }
      });
      if (!active) {
        burst.destroy();
        timer.destroy();
      }
    },
    loop: true
  });
}

// ------------------------------------------------------------------------
// GAME INITIALIZATION
// ------------------------------------------------------------------------

const config = {
  type: Phaser.AUTO,
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  parent: 'game-root',
  backgroundColor: '#0a0a1a',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false,
    },
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
  },
  scene: [TitleScene, IntroScene, CharacterSelectScene, CharacterDetailScene, GameScene, GameOverScene],
};

new Phaser.Game(config);
