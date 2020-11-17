import CANNON from "cannon";
import {
    Color4,
    Color3,
    DirectionalLight,
    Engine,
    FreeCamera,
    Mesh,
    PointLight,
    Scene,
    SphereBuilder,
    StandardMaterial,
    Vector3,
    MeshBuilder,
    Matrix,
    ActionManager,
    ExecuteCodeAction,
    ActionEvent, CannonJSPlugin, PhysicsImpostor
} from "babylonjs";

document.addEventListener("DOMContentLoaded", () => {
    PazlBabl.main();
});


class PazlBabl{
    private tabla: Tabla;

    constructor(scene: Scene) {
        this.tabla = new Tabla(scene);
    }

    static main = () :void => {
        console.log("Pocinjemo...");
        const physicsEnginePlugin = new CannonJSPlugin(true, 10, CANNON);
        const canvas = document.getElementById("igra") as HTMLCanvasElement;    //ovdje cemo da crtamo
        const engine = new Engine(canvas, true);    //ovo nam je cetkica za crtanje
        const scene = new Scene(engine);    //scena ce da sadrzi sve objekte za crtanje
        scene.clearColor = new Color4(0, 0, 1);
        const camera = new FreeCamera("kamera", new Vector3(0, 0, -15), scene);
        new DirectionalLight("svjetlo", new Vector3(0, 0, 15), scene);

        let gravity = new Vector3(0, 0, 0);
        scene.enablePhysics(gravity, physicsEnginePlugin);

        //camera.attachControl(canvas);
        camera.checkCollisions = true;


        engine.runRenderLoop(() => {
            scene.render();
        });

        window.addEventListener("resize", () => {
            engine.resize();
        });

        new PazlBabl(scene);
    }
}

class Tabla{
    private kuglice: Kuglice;
    private top: Top;
    private zidovi: Zidovi;
    constructor(scene: Scene) {
        this.kuglice = new Kuglice(scene)
        this.top = new Top(scene, this.kuglice);
        this.zidovi = new Zidovi(scene);
    }
}

class Kuglice{
    private matrica: Kuglica[][];
    public static KUGLICA = 50;
    public static KOLONA = 10;

    public dajKuglice() : Mesh[]{
        let vrati : Mesh[] = [];
        this.matrica.forEach(x => {
            x.forEach(y => {
                vrati.push(y.kuglica);
            })
        })
        return vrati;
    }

    constructor(scene: Scene) {
        this.matrica = [];
        for(let i=0; i<(Kuglice.KUGLICA/Kuglice.KOLONA); i++){
            this.matrica[i] = [];
            for(let j=0; j<Kuglice.KOLONA; j++) {
                this.matrica[i][j] = new Kuglica((Kuglice.KOLONA*i)+j, i, j, scene);
            }
        }
    }
}

class Kuglica{
    private _kuglica : Mesh;
    private static UDALJENOST = .55;

    get kuglica(){
        return this._kuglica;
    }

    constructor(broj: number, red: number, kolona: number, scene: Scene) {
        let diameter = .5;
        this._kuglica = Mesh.CreateSphere(`kuglica${broj}`, 32, diameter, scene);

        //kolona je 0..10 a
        const pocetakLijevo = -diameter*(Kuglice.KOLONA/2);
        const podigniGoreZa = 4;
        const pocetakGore = -diameter*((Kuglice.KUGLICA/Kuglice.KOLONA)/2)+podigniGoreZa;

        this._kuglica.position = new Vector3(pocetakLijevo+kolona*Kuglica.UDALJENOST, pocetakGore+red*Kuglica.UDALJENOST,0);
    }
}

enum TipZida{
    LIJEVI,
    DESNI
}

class Zidovi{

    constructor(scene: Scene) {
        new Zid(scene, TipZida.LIJEVI);
        new Zid(scene, TipZida.DESNI);
    }
}

class Zid{

    constructor(scene: Scene, tip: TipZida) {
        const zid = MeshBuilder.CreateCylinder("cone", {
            height: 10,
            diameter: .25,
        }, scene)
        zid.checkCollisions = true;
        zid.physicsImpostor = new PhysicsImpostor(zid, PhysicsImpostor.MeshImpostor, {mass:0}, scene);
        switch (tip){
            case TipZida.DESNI:
                zid.position = new Vector3(3,.5,0);
                break;
            case TipZida.LIJEVI:
                zid.position = new Vector3(-3,.5,0);
                break;
        }
    }
}

class Top{
    private kuglica!: Mesh;
    private opaljena = false;
    private top: Mesh;
    private kuglice: Kuglice;

    napraviKuglicu(scene: Scene){
        let diameter = .5;
        const kuglica = Mesh.CreateSphere('topKuglica', 32, diameter, scene);

        const spustiDoljeZa = 4;
        kuglica.position = new Vector3(0, -spustiDoljeZa, 0);
        const mKugla = new StandardMaterial('materijalTopaKuglice', scene);
        mKugla.diffuseColor = new Color3(1,0,0);
        kuglica.material = mKugla;

        kuglica.checkCollisions = true;
        this.kuglica = kuglica;
    }

    constructor(scene: Scene, kuglice: Kuglice) {
        this.kuglice = kuglice;
        this.napraviKuglicu(scene);
        const spustiDoljeZa = 4;
        const top = MeshBuilder.CreateCylinder('top', {
            height: .5,
            diameter: .25,
            diameterTop: 0,
        }, scene);
        const mTop = new StandardMaterial('materijalTopaKuglice', scene);
        mTop.diffuseColor = new Color3(.5,.5,.5);
        top.material = mTop;
        top.position = new Vector3(0, -spustiDoljeZa+.6, 0);

        top.setPivotMatrix(Matrix.Translation(0, .6, 0));   //vrtimo oko pivota ispod topa

        scene.actionManager = new ActionManager(scene);
        scene.actionManager.registerAction(
            new ExecuteCodeAction(
                 ActionManager.OnKeyDownTrigger,
                (evt: ActionEvent) => {
                     const e = evt.sourceEvent as KeyboardEvent;
                     switch (e.key) {
                         case "ArrowLeft":
                            if(top.rotation.z < (Math.PI/2)-.1) {
                                top.rotation.z += .1;
                            }
                            break;
                         case "ArrowRight":
                            if(top.rotation.z > -((Math.PI/2)-.1)) {
                                top.rotation.z -= .1;
                            }
                            break;
                         case " ":
                             if(!this.opaljena) {
                                 this.kuglica.physicsImpostor = new PhysicsImpostor(this.kuglica, PhysicsImpostor.SphereImpostor, {mass: 1}, scene);
                                 this.kuglica.physicsImpostor.applyImpulse(new Vector3(-10 * Math.sin(top.rotation.z), 10 * Math.cos(top.rotation.z), 0), this.kuglica.getAbsolutePosition());

                                 this.kuglica.actionManager = new ActionManager(scene);
                                 this.kuglice.dajKuglice().forEach(m => {
                                     this.kuglica.actionManager?.registerAction(new ExecuteCodeAction(
                                         {
                                             trigger: ActionManager.OnIntersectionEnterTrigger,
                                             parameter: m
                                         },
                                         () => {
                                             m.dispose();
                                         }
                                     ));
                                 });

                                 setTimeout(() => {
                                     this.kuglica.dispose();
                                     this.opaljena = false;
                                     this.napraviKuglicu(scene);
                                 }, 2000);
                                 this.opaljena = true;
                             }
                             break;
                    }
                }
            )
        );

        this.top = top;
    }
}