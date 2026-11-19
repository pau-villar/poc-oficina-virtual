import Phaser from 'phaser';

export class OfficeScene extends Phaser.Scene {
  constructor() { super('OfficeScene'); }

  preload() {
    this.load.image('tiles_office', '/assets/tilesets/pixel_office.png');
    this.load.tilemapTiledJSON('mapa_office', '/assets/maps/oficina.json');
    this.load.spritesheet('george', '/assets/sprites/george.png', { frameWidth: 48, frameHeight: 48 });
  }

  create() {
    const map = this.make.tilemap({ key: 'mapa_office' });
    const tileset = map.addTilesetImage('pixel_office_tiles', 'tiles_office');
    map.createLayer('Terra', tileset, 0, 0);
    this.capaParets = map.createLayer('Parets', tileset, 0, 0);
    this.capaParets?.setCollisionByExclusion([-1]);

    this.zones = [];
    this.monitors = [];
    this.monitorProper = null;

    map.getObjectLayer('Objectes')?.objects.forEach((obj) => {
      const props = this.obtenirPropietats(obj);
      const cx = obj.x + (obj.width || 0) / 2;
      const cy = obj.y + (obj.height || 0) / 2;

      if (props.tipus === 'spawn') {
        this.jugador = this.physics.add.sprite(cx, cy, 'george', 0);
        this.jugador.body.setSize(16, 12);
        this.jugador.body.setOffset(16, 32);
        this.jugador.setCollideWorldBounds(true);
        if (this.capaParets) this.physics.add.collider(this.jugador, this.capaParets);
      }

      if (props.tipus === 'monitor') {
        this.monitors.push({ titol: props.titol || 'Monitor', x: cx, y: cy });
        }

      if (props.tipus === 'zona') {
        const rect = new Phaser.Geom.Rectangle(obj.x, obj.y, obj.width, obj.height);
        this.zones.push({ nom: props.nomSala || 'Sala', rect });
        this.add.rectangle(cx, cy, obj.width, obj.height, 0x10b981, 0.18).setStrokeStyle(1.5, 0x10b981);
        this.add.text(cx, obj.y + 12, props.nomSala || 'Sala', { fontSize: '11px', color: '#a7f3d0' }).setOrigin(0.5);
      }
    });

    this.zonaActual = null;

    // Debug visual (comenta-ho quan ho hagis validat)
    this.physics.world.createDebugGraphic();

    this.direccio = 'avall';
    this.frameQuiets = { avall: 0, esquerra: 1, amunt: 2, dreta: 3 };
    this.etiqueta = this.add.text(this.jugador.x, this.jugador.y - 30, 'George',
      { fontSize: '13px', fontFamily: 'sans-serif', color: '#ffffff', backgroundColor: '#0f172a88' }).setOrigin(0.5);

    this.crearAnimacions();
    this.cursors = this.input.keyboard.createCursorKeys();
    this.teclesWASD = this.input.keyboard.addKeys('W,A,S,D');
    this.teclaShift = this.input.keyboard.addKey('SHIFT');
  }

  crearAnimacions() {
    const dirs = [
      { clau: 'caminar-avall',    frames: [0, 4, 8, 12] },
      { clau: 'caminar-esquerra', frames: [1, 5, 9, 13] },
      { clau: 'caminar-amunt',    frames: [2, 6, 10, 14] },
      { clau: 'caminar-dreta',    frames: [3, 7, 11, 15] }
    ];
    dirs.forEach((d) => {
      this.anims.create({
        key: d.clau,
        frames: this.anims.generateFrameNumbers('george', { frames: d.frames }),
        frameRate: 8,
        repeat: -1
      });
    });
  }

  update() {
  if (!this.jugador) return;
  let vx = 0, vy = 0;
  if (this.cursors.left.isDown || this.teclesWASD.A.isDown)  vx = -1;
  if (this.cursors.right.isDown || this.teclesWASD.D.isDown) vx = 1;
  if (this.cursors.up.isDown || this.teclesWASD.W.isDown)    vy = -1;
  if (this.cursors.down.isDown || this.teclesWASD.S.isDown)  vy = 1;

  const correr = this.teclaShift.isDown;
  const vel = new Phaser.Math.Vector2(vx, vy).normalize().scale(correr ? 260 : 160);
  this.jugador.setVelocity(vel.x, vel.y);
  this.jugador.anims.timeScale = correr ? 1.6 : 1.0;

  if (vx !== 0 || vy !== 0) {
    if (Math.abs(vx) > Math.abs(vy)) this.direccio = vx < 0 ? 'esquerra' : 'dreta';
    else this.direccio = vy < 0 ? 'amunt' : 'avall';
    this.jugador.anims.play(`caminar-${this.direccio}`, true);
  } else {
    this.jugador.anims.stop();
    this.jugador.setFrame(this.frameQuiets[this.direccio]);
  }

  this.etiqueta.setPosition(this.jugador.x, this.jugador.y - 30);
  this.comprovarZones();
  this.comprovarMonitors();
}

  comprovarZones() {
    const peuY = this.jugador.y + 14;
    const trobada = this.zones.find((z) => Phaser.Geom.Rectangle.Contains(z.rect, this.jugador.x, peuY)) || null;
    if (trobada?.nom !== this.zonaActual?.nom) {
      this.zonaActual = trobada;
      this.game.events.emit('canvi-zona', trobada ? { nom: trobada.nom } : null);
    }
  }

  comprovarMonitors() {
    let mesProper = null;
    let distMin = 40; // llindar: < 40 px

    this.monitors.forEach((mon) => {
        const d = Phaser.Math.Distance.Between(this.jugador.x, this.jugador.y, mon.x, mon.y);
        if (d < distMin) { distMin = d; mesProper = mon; }
    });

    // Només emetem quan canvia (evitem 60 events per segon)
    if (mesProper?.titol !== this.monitorProper?.titol) {
        this.monitorProper = mesProper;
        this.game.events.emit('a-prop-monitor', mesProper ? { titol: mesProper.titol } : null);
    }
  }

  obtenirPropietats(obj) {
    const res = {};
    (obj.properties || []).forEach((p) => { res[p.name] = p.value; });
    return res;
  }
}