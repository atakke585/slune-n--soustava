/// <reference path='./vendor/babylon.d.ts' />

// Canvas
const canvas = document.getElementById('renderCanvas');

// Deklarujeme engine (true pro anti-aliasing)
const engine = new BABYLON.Engine(canvas, true);


function createScene() {
    // Vytváříme scénu
    const scene = new BABYLON.Scene(engine);

    // Vytváříme kameru
    //const camera = new BABYLON.FreeCamera('camera', new BABYLON.Vector3(0,0,-5), scene);
    //const camera = new BABYLON.UniversalCamera('camera', new BABYLON.Vector3(0,0,-5), scene)
    const camera = new BABYLON.FollowCamera('camera', new BABYLON.Vector3(0,25,-25), scene);
    camera.radius = 2;
    camera.attachControl(canvas, true);

    // Vytváříme světlo
    //const light = new BABYLON.HemisphericLight('light', new BABYLON.Vector3(0,1,0), scene);
    const light = new BABYLON.PointLight('light', new BABYLON.Vector3(0,5,0), scene);

    // Vytváříme tvary
    const box = BABYLON.MeshBuilder.CreateBox('box', {
        size: 1
    }, scene);
    box.rotation.x = -2;
    
    camera.lockedTarget = box;


    const sphere = BABYLON.MeshBuilder.CreateSphere('sphere', {
        segments: 20,
        diameter: 2
    }, scene);
    sphere.position = new BABYLON.Vector3(3,0,0);
    //sphere.scaling = new BABYLON.Vector3(0.5,2,0.5);


    const plane = BABYLON.MeshBuilder.CreatePlane('plane', {}, scene);
    plane.position = new BABYLON.Vector3(-3,0,0);

    // Vlastní tvar
    const points = [
        new BABYLON.Vector3 (2,0,0),
        new BABYLON.Vector3 (2,1,1),
        new BABYLON.Vector3 (2,2,1)
    ];
    const lines = BABYLON.MeshBuilder.CreateLines('lines', {
        points
    }, scene)

    // Vytváříme materiál
    const material = new BABYLON.StandardMaterial('material', scene);
    material.diffuseColor = new BABYLON.Color3(1,0,0);
    material.emissiveColor = new BABYLON.Color3(0,1,0);

    const material2 = new BABYLON.StandardMaterial('material2', scene);
    material2.diffuseTexture = new BABYLON.Texture('assets/images/dark_rock.png', scene);

    box.material = material;
    sphere.material = material2;

    return scene;
}

// Scéna
const scene = createScene();

engine.runRenderLoop(() => {
    scene.render();
})