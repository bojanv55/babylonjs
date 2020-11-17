import {Engine, Scene, Color4, Mesh, FreeCamera, Vector3, PointLight, Color3} from "babylonjs";

const canvas = document.getElementById("igra") as HTMLCanvasElement;    //ovdje cemo da crtamo

const engine = new Engine(canvas, true);    //ovo nam je cetkica za crtanje

const scene = new Scene(engine);    //scena ce da sadrzi sve objekte za crtanje
scene.clearColor = new Color4(0, 0, 1);

const sphere = Mesh.CreateSphere("sfera", 32, 2, scene);
const ground = Mesh.CreateGround("zemlja", 20, 20, 50, scene);

const camera = new FreeCamera("kamera", new Vector3(0, 1, -10), scene);
camera.attachControl(canvas);   //da bi mogli da kontrolisemo kameru
const light = new PointLight("svjetlo", new Vector3(0, 10, 0), scene);
light.intensity = .5;
light.diffuse = new Color3(0, 1, 0);

engine.runRenderLoop(() => {
    scene.render();
});

window.addEventListener("resize", () => {
    engine.resize();
});