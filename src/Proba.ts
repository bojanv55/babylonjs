import {Engine,Scene,Vector3,Mesh,ArcRotateCamera,HemisphericLight,MeshBuilder} from "babylonjs";

const canvas = document.getElementById("moj") as HTMLCanvasElement;
const engine = new Engine(canvas, true);
function createScene(): Scene {
    const scene: Scene = new Scene(engine);
    const camera: ArcRotateCamera = new ArcRotateCamera("Camera", Math.PI / 2, Math.PI / 2, 8, Vector3.Zero(), scene);
    camera.attachControl(canvas, true);
    const light1: HemisphericLight = new HemisphericLight("light1", new Vector3(1, 1, 0), scene);
    const sphere: Mesh = MeshBuilder.CreateSphere("sphere", { diameter: 1 }, scene);
    return scene;
}
const scene: Scene = createScene();
engine.runRenderLoop(() => {
    scene.render();
});
