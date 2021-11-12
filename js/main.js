/// <reference path='./vendor/babylon.d.ts' />

/*

Kód je open source, vytvořil Jan Váša

Použité zdroje třetích stran:

Textury planet a slunce:
https://www.solarsystemscope.com/textures/
https://solarsystem.nasa.gov/resources/601/uranus-rings-in-false-color/

Skybox:
https://github.com/wwwtyro/space-3d

Babylon.js - 3D WebGL engine:
https://www.babylonjs.com/

*/

// Data planet
const planets = [
    {
        name: 'Merkur',
        distance: 600,
        diameter: 0.048794,
        speed: 4.14,
        rotationSpeed: 0.0172,
        material: './assets/images/merkur.jpg',
        axis: 0.0005,
        ring: false
    },
    {
        name: 'Venuše',
        distance: 1000,
        diameter: 0.12104,
        speed: 1.62,
        rotationSpeed: -0.0041,
        material: './assets/images/venuse.jpg',
        axis: 0.046,
        ring: false
    },
    {
        name: 'Země',
        distance: 1500,
        diameter: 0.12742,
        speed: 1, // Ostatní rychlosti odvozené od této v reálném poměru (ku 365)
        rotationSpeed: 1,
        material: './assets/images/zeme.jpg',
        axis: 0.4091, // V radianech
        ring: false
    },
    {
        name: 'Mars',
        distance: 2200,
        diameter: 0.06779,
        speed: 0.53,
        rotationSpeed: 1,
        material: './assets/images/mars.jpg',
        axis: 0.4396,
        ring: false
    },
    {
        name: 'Jupiter',
        distance: 7800,
        diameter: 1.3982,
        speed: 0.08,
        rotationSpeed: 2.4,
        material: './assets/images/jupiter.jpg',
        axis: 0.0546,
        ring: false
    },
    {
        name: 'Saturn',
        distance: 14200,
        diameter: 1.1646,
        speed: 0.03,
        rotationSpeed: 2.2857,
        material: './assets/images/saturn.jpg',
        axis: 0.4665,
        ring: {
            material: './assets/images/dust.png',
            strenght: 200,
            diameter: 1.1646*1.5,
            color1: [0.55,0.4,0.28,1],
            color2: [0.5,0.45,0.2,0.75]
        }
    },
    {
        name: 'Uran',
        distance: 28700,
        diameter: 0.50724,
        speed: 0.01,
        rotationSpeed: 0.7183,
        material: './assets/images/uran.jpg',
        axis: 1.4352,
        ring: {
            material: './assets/images/dust.png',
            strenght: 10,
            diameter: 1.1646*1.5,
            color1: [0.7,0.7,0.7,0.2],
            color2: [0.5,0.5,0.5,0.1],
        }
    },
    {
        name: 'Neptun',
        distance: 45000,
        diameter: 0.49244,
        speed: 0.006,
        rotationSpeed: 0.6713,
        material: './assets/images/neptun.jpg',
        axis: 0.4943,
        ring: false
    }
    ];

// Canvas
const canvas = document.getElementById('renderCanvas');

// Deklarujeme engine (true pro anti-aliasing)
const engine = new BABYLON.Engine(canvas, true);

function createLight(scene) {
    const light = new BABYLON.HemisphericLight('light', new BABYLON.Vector3(0,1,0), scene);
    light.intensity = 0.25;
    light.groundColor = new BABYLON.Color3(0.25,0,0.5);
}

function setFocus(obj, camera, scene) {
    
    camera.setTarget(obj);
    camera.lowerRadiusLimit = obj.diameter*5;
    camera.upperRadiusLimit = obj.diameter*60;
}

function resetFocus(camera, scene) {
        camera.setTarget(BABYLON.Vector3.Zero());
        camera.lowerRadiusLimit = 20;
        camera.upperRadiusLimit = 80;
}

function createSun(scene) {
    
    // Materiál
    const sunMaterial = new BABYLON.StandardMaterial('sunMaterial', scene);
    sunMaterial.emissiveTexture = new BABYLON.Texture('assets/images/slunce.jpg', scene);
    sunMaterial.diffuseColor = BABYLON.Color3.Black();
    sunMaterial.specularColor = BABYLON.Color3.Black();

    const sun = BABYLON.MeshBuilder.CreateSphere('sun', {segments: 64, diameter:13.927}, scene);
    sun.material = sunMaterial;

    // Glow maska a shader
    const glow = new BABYLON.GlowLayer("glow", scene);
    glow.intensity = 0.6;
    glow.referenceMeshToUseItsOwnMaterial(sun);

    const sunLight = new BABYLON.PointLight('sunLight', BABYLON.Vector3.Zero(), scene);
    sunLight.intensity = 2;
}

function createPlanets(planet, scene) {
    // Renderujeme planety
    for (let i=0; i<planets.length;i++) {
        // Vytvoření materiálu a přiřazení textur
        const planetsMaterial = new BABYLON.StandardMaterial(planets[i].name, scene);
        planetsMaterial.diffuseTexture = new BABYLON.Texture(planets[i].material, scene);
        planetsMaterial.specularColor = new BABYLON.Color3.Black();
        
        // Vytvoření 3D objektu
        planet[i] = BABYLON.MeshBuilder.CreateSphere(planets[i].name, {
            segments: 48, diameter: planets[i].diameter}, scene);
        
        planet[i].material = planetsMaterial;
        planet[i].diameter = planets[i].diameter;

        // Pokud má planeta prstenec, vytvoř prstenec
        if (planets[i].ring) {
            
            /*

            Starý kód - fyzický ring

            const ringMaterial = new BABYLON.StandardMaterial(planets[i].name+"ring", scene);
            ringMaterial.diffuseTexture = new BABYLON.Texture(planets[i].ring.material, scene);
            ringMaterial.specularColor = new BABYLON.Color3.Black();

            let ring = BABYLON.MeshBuilder.CreateTorus(planets[i].name+"ring", {
                diameter: planets[i].diameter*3, thickness: 0.2
            }, scene);
            //ring.rotate(BABYLON.Axis.X, 1.57079633);
            ring.material = ringMaterial;
            ring.setParent(planet[i]);
            
            */

            let ring = '';

            // Pokud již particle systém existuje, zruš ho
            if (ring) {
                ring.dispose();
            }
            
            // Pokud umíme GPU particle systém, použijeme ho
            if (BABYLON.GPUParticleSystem.IsSupported) {
                ring = new BABYLON.GPUParticleSystem(planets[i].name+"ring", { capacity:planets[i].ring.strenght*500 }, scene);
                ring.activeParticleCount = planets[i].ring.strenght*1000;
            } else {
                ring = new BABYLON.ParticleSystem(planets[i].name+"ring", planets[i].ring.strenght*100, scene);
            }

            // Nastavujeme texturu
            ring.particleTexture = new BABYLON.Texture('assets/images/dust.png', scene);
            ring.particleTexture.hasAlpha = true;
            ring.particleTexture.getAlphaFromRGB = true;

            ring.emitter = planet[i];

            ring.color1 = new BABYLON.Color4(
                planets[i].ring.color1[0],
                planets[i].ring.color1[1],
                planets[i].ring.color1[2],
                planets[i].ring.color1[3]);
            ring.color2 = new BABYLON.Color4(
                planets[i].ring.color2[0],
                planets[i].ring.color2[1],
                planets[i].ring.color2[2],
                planets[i].ring.color2[3]);
            ring.colorDead = new BABYLON.Color4(0,0,0,1);

            ring.radius = planets[i].diameter*10;
            ring.minSize = planets[i].diameter*0.01;
            ring.maxSize = planets[i].diameter*0.025;

            ring.minLifeTime = 0.01;
            ring.maxLifeTime = 0.1;

            ring.emitRate = planets[i].ring.strenght*1000;

            ring.createCylinderEmitter(planets[i].ring.diameter , 0.001, planets[i].diameter*3,0);

            ring.minEmitPower = 0.05;
            ring.maxEmitPower = 0.1;
            ring.updateSpeed = 0.005;

            ring.start();
        }

        planet[i].position.x = planets[i].distance / 50;

        // Nastevení rotace kolem Slunce
        planet[i].orbit = {
            radius: planet[i].position.x,
            speed: planets[i].speed / 1000,
            angle: 0
        };

        // Natočení osy planet
        planet[i].rotate(BABYLON.Axis.Z, planets[i].axis);

        // Před každým frame udělej:
        scene.registerBeforeRender(() => {
        
            // Rotace kolem slunce
            planet[i].position.x = planet[i].orbit.radius * Math.sin(planet[i].orbit.angle);
            planet[i].position.z = planet[i].orbit.radius * Math.cos(planet[i].orbit.angle);
            planet[i].orbit.angle += planet[i].orbit.speed;

            planet[i].rotate(BABYLON.Axis.Y, Math.PI * planets[i].rotationSpeed / 100 );
            //console.log(planet[2]);
        })
    }
    return planet;
}

function createSkybox(scene) {
    const skybox = BABYLON.MeshBuilder.CreateBox('skybox', {size: 10000}, scene);
    const skyboxMaterial = new BABYLON.StandardMaterial('skyboxMaterial', scene);
    skyboxMaterial.backFaceCulling = false;
    skyboxMaterial.specularColor = BABYLON.Color3.Black();
    skyboxMaterial.diffuseColor = BABYLON.Color3.Black();

    skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture('./assets/images/skybox/skybox', scene);
    skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;

    // Připojíme skybox ke kameře
    skybox.infiniteDistance = true;

    skybox.material = skyboxMaterial;
}

function createScene() {
    let planet = [];

    function createHud(planet) {
        const HudDiv = document.getElementById('hud');
        for(let i = 0; i < planet.length; i++) {
            HudDiv.innerHTML += `<div class="menu-butt">${planet[i].name}</div>`;
        }
        const hud = document.querySelectorAll('.menu-butt');
        hud.forEach(function(element, index) {
            element.addEventListener('click', function () {
                // Patch pro Slunce =)
                if (index == 0) {resetFocus(camera, scene);}
                else {setFocus(planet[index-1], camera, scene);}
            })
        })
    };

    // Vytváříme scénu

    const scene = new BABYLON.Scene(engine);
    scene.clearColor = BABYLON.Color3.Black();

    // Kamera
    const camera = new BABYLON.ArcRotateCamera('camera',50,0,50, BABYLON.Vector3.Zero(), scene);
    // Ovládání kamery
    camera.attachControl(canvas);

    camera.minZ = 0.1;
    camera.fov = 0.5;
    camera.ellipsoid = new BABYLON.Vector3(0.02,0.02,0.02);

    // Limit pozicí kamery
    camera.lowerRadiusLimit = 20;
    camera.upperRadiusLimit = 80;

    // Světlo
    createLight(scene);

    // Slunce
    createSun(scene);

    // Planety
    createPlanets(planet, scene);

    // Skybox
    createSkybox(scene);

    createHud(planet);

    //setFocus(planet[5], camera);
    
    return scene;
}

// Scéna
const scene = createScene();

engine.runRenderLoop(() => {
    scene.render();
});

window.addEventListener('resize', function() {
    engine.resize();
});