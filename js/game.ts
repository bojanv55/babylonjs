import CANNON from "cannon";
import {FollowCamera, Engine, Scene, Color4, Mesh, FreeCamera, Vector3, DirectionalLight, Color3, GroundMesh, StandardMaterial, Texture,
    MeshBuilder, SceneLoader, AbstractMesh, Skeleton, VertexData, CannonJSPlugin, PhysicsImpostor, ActionManager,
    ExecuteCodeAction} from "babylonjs";

const physicsEnginePlugin = new CannonJSPlugin(true, 10, CANNON);

const canvas = document.getElementById("igra") as HTMLCanvasElement;    //ovdje cemo da crtamo

const engine = new Engine(canvas, true);    //ovo nam je cetkica za crtanje

const scene = new Scene(engine);    //scena ce da sadrzi sve objekte za crtanje
scene.clearColor = new Color4(0, 0, 1);
let gravity = new Vector3(0, -9.81, 0);
scene.enablePhysics(gravity, physicsEnginePlugin);

const onGroundCreated = (x: GroundMesh) => {
    const groundMaterial = new StandardMaterial("gm", scene);
    groundMaterial.diffuseTexture = new Texture("img/trava.jpg", scene);
    //(groundMaterial.diffuseTexture as Texture).uScale = 5;
    x.material = groundMaterial;
    x.checkCollisions = true;

    x.physicsImpostor = new PhysicsImpostor(x, PhysicsImpostor.HeightmapImpostor, {mass:0}, scene);
};

const ground = Mesh.CreateGroundFromHeightMap("zemlja", "img/hmap.png",
    1000, 1000, 20, 0, 100, scene, false, onGroundCreated);

const camera = new FreeCamera("kamera", new Vector3(0, 3, -1), scene);
camera.attachControl(canvas);   //da bi mogli da kontrolisemo kameru

camera.ellipsoid = new Vector3(1, 1, 1);
scene.collisionsEnabled = true;
camera.checkCollisions = true; //da ne mozemo da prolazimo kroz zemlju
camera.applyGravity = true; //da ne mozemo da odemo od zemlje

camera.keysUp.push('w'.charCodeAt(0));
camera.keysUp.push('W'.charCodeAt(0));
camera.keysDown.push('s'.charCodeAt(0));
camera.keysDown.push('S'.charCodeAt(0));
camera.keysLeft.push('a'.charCodeAt(0));
camera.keysLeft.push('A'.charCodeAt(0));
camera.keysRight.push('d'.charCodeAt(0));
camera.keysRight.push('D'.charCodeAt(0));


let alreadyLocked = false;

scene.onPointerDown = () => {
    if(!alreadyLocked) {
        console.log("nije bilo lok!");
        canvas.requestPointerLock();
    }
};

document.addEventListener("pointerlockchange", () => {
   alreadyLocked = document.pointerLockElement!==null;
});

const light = new DirectionalLight("svjetlo", new Vector3(-.1, -1, 0), scene);
light.intensity = 1;
light.diffuse = new Color3(0, 1, 0);


const tank = MeshBuilder.CreateBox("HeroTank", {height: 1, depth: 6, width: 6}, scene)
const tankMaterial = new StandardMaterial("matt", scene);
tankMaterial.diffuseColor = Color3.Red();
tankMaterial.emissiveColor = Color3.Blue();
tank.material = tankMaterial;
tank.position.z += 10;
tank.position.y += 2;


const fc = new FollowCamera("tfc", tank.position, scene, tank);
fc.radius = 20;
fc.heightOffset = 4;
fc.rotationOffset = 180;
fc.cameraAcceleration = .5;
fc.maxCameraSpeed = 50;

scene.activeCamera = fc;

let mn = 0;
let mr = 0;
let b = false;

let frontVector = new Vector3(0,0,1);

function opali(){
    if(b){
       let kugla = Mesh.CreateSphere("kugla", 32, 2, scene);
        let tenk = scene.getMeshByName("HeroTank") as Mesh;
        let pos = tenk.position;
        kugla.position = new Vector3(pos.x, pos.y + 1, pos.z);
        kugla.position.addInPlace(frontVector.multiplyByFloats(5,5,5));

        kugla.physicsImpostor = new PhysicsImpostor(kugla, PhysicsImpostor.SphereImpostor, {mass:1}, scene);
        let fV = frontVector;
        kugla.applyImpulse(new Vector3(fV.x * 100,(fV.y+.1) * 100,fV.z * 100), kugla.getAbsolutePosition());

        kugla.actionManager = new ActionManager(scene);
        DUDZ.forEach(d => {

            kugla.actionManager?.registerAction(new ExecuteCodeAction(
                {
                    trigger: ActionManager.OnIntersectionEnterTrigger,
                    parameter: d.dm
                },
                () => {
                    //console.log("EKSE");
                    d.dm.dispose();
                }
            ));

        });


        setTimeout(() => {
            kugla.dispose();
        }, 4000)
    }
}

engine.runRenderLoop(() => {

    let yM = 0;
    if(tank.position.y > 2){
        yM = -2;
    }

    opali();

    let speed = 2;

    switch (mn){
        case 1:
            tank.moveWithCollisions(frontVector.multiplyByFloats(speed, speed, speed));
            break;
        case -1:
            tank.moveWithCollisions(frontVector.multiplyByFloats(-1*speed, -1*speed, -1*speed));
            break;
    }
    switch (mr){
        case -1:
            tank.rotation.y -= .1;  //rotacija oko y ose
            frontVector = new Vector3(Math.sin(tank.rotation.y),0,Math.cos(tank.rotation.y))
            break;
        case 1:
            tank.rotation.y += .1; //rotacija oko y ose
            frontVector = new Vector3(Math.sin(tank.rotation.y),0,Math.cos(tank.rotation.y))
            break;
    }

    mn=0;
    mr=0;
    b = false;

    //dud
    if(DUDZ)
        DUDZ.forEach(x => x.move());


    scene.render();
});

class DUD{

    constructor(public dm : AbstractMesh, private brzina: number) {

    }


    move() {
        let tenk = scene.getMeshByName("HeroTank") as Mesh;
        let smjer = tenk.position.subtract(this.dm.position);
        let razmak = smjer.length();
        let dir = smjer.normalize();
        let alpha = Math.atan2(-1 * dir.x, -1 * dir.z);
        this.dm.rotation.y = alpha;
        if(razmak>5)
            this.dm.moveWithCollisions(dir.multiplyByFloats(this.brzina,this.brzina,this.brzina));
    }
}

const DUDZ : DUD[] = [];


//import DUUUDE
SceneLoader.ImportMesh("him", "img/dude/", "dude.babylon", scene, (nm, ps, sk) => {
    nm[0].position = new Vector3(0,0,5);
    nm[0].name = "dud";
    scene.beginAnimation(sk[0], 0, 120, true, 1.0);
    nm[0].scaling = new Vector3(.1 ,.1 ,.1);

    nm[0].showBoundingBox = true;

    let h1 = new DUD(nm[0], .1);
    DUDZ.push(h1);

    for (let i = 0; i < 10; i++) { // 10 clones
        var xrand = Math.floor(Math.random() * 501) - 250;
        var zrand = Math.floor(Math.random() * 501) - 250;
        var c = [];
        for (let j = 1; j < nm.length; j++) {
            c[j] = nm[j].clone("c" + j, null) as AbstractMesh;
            c[j].position = new Vector3(xrand, 0, zrand);
            c[j].skeleton = nm[j].skeleton?.clone("skelec_" + j) as Skeleton;
            scene.beginAnimation(c[j].skeleton, 0, 120, true, 1.0);

            DUDZ.push(new DUD(c[j], .1));
        }
    }
});

window.addEventListener("resize", () => {
    engine.resize();
});

document.addEventListener("keydown", (e: KeyboardEvent) => {
    if(e.key == 'w' || e.key == 'W'){
        mn=1;
    }
    if(e.key == 's' || e.key == 'S'){
        mn=-1;
    }
    if(e.key == 'a' || e.key == 'A'){
        mr=-1;
    }
    if(e.key == 'd' || e.key == 'D'){
        mr=1;
    }
    if(e.key == 'b' || e.key == 'B'){
        b = true;
    }
});



class One{
    private readonly _a : number;

    get mojeA(): number{
        return this._a;
    }

    private constructor(a: number) {
        this._a = a;
    }

    static Builder = class {
        private _a: number = 0;

        withA(a: number): One.Builder{
            this._a = a;
            return this;
        }

        build(){
            return new One(this._a);
        }
    }
}
export namespace One{
    export type Builder = InstanceType<typeof One.Builder>;
}


const one = new One.Builder().withA(123).build();
console.log(one.mojeA);