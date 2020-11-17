import {Engine, Scene, Color4, Mesh, FreeCamera, Vector3, PointLight, Color3, StandardMaterial, MirrorTexture, Plane, Texture} from "babylonjs";

const canvas = document.getElementById("igra") as HTMLCanvasElement;    //ovdje cemo da crtamo

const engine = new Engine(canvas, true);    //ovo nam je cetkica za crtanje

const scene = new Scene(engine);    //scena ce da sadrzi sve objekte za crtanje
scene.ambientColor = new Color3(0, 0, 1);

const ground = Mesh.CreateGround("zemlja", 60, 60, 250, scene);
const mirrorMaterial = new StandardMaterial("ogledalo", scene);
mirrorMaterial.diffuseColor = new Color3(.4,.4,.4);
mirrorMaterial.specularColor = Color3.Black();
const mirrorTexture = new MirrorTexture("mirtex", 1024, scene, true);
mirrorTexture.mirrorPlane = new Plane(0, -1, 0, -2);
mirrorMaterial.reflectionTexture = mirrorTexture;
mirrorMaterial.reflectionTexture.level = .5;
ground.material = mirrorMaterial;

const sfere : Mesh[] = [];
const materijalsfera : StandardMaterial[] = [];

for(let i=0; i<10; i++){
    const sfera = Mesh.CreateSphere(`moja${i}`, 250, 2, scene);
    sfera.position = new Vector3(3*i-9, 2);
    const materijal = new StandardMaterial(`matsfer${i}`, scene);

    //kazemo sta da se oslikava u teksturi - sve sfere trebaju da se oslikavaju
    mirrorTexture.renderList?.push(sfera);  //TODO: ?? direktan pristup listi

    sfera.material = materijal;
    sfere.push(sfera);
    materijalsfera.push(materijal);
}

materijalsfera[0].ambientColor = new Color3(0,.5,0);
materijalsfera[0].diffuseColor = new Color3(0,0,1);
materijalsfera[0].specularColor = new Color3(0,0,0);

materijalsfera[1].ambientColor = new Color3(0,.5,0);
materijalsfera[1].diffuseColor = new Color3(1,0,1);
materijalsfera[1].specularColor = new Color3(0,1,0);
materijalsfera[1].specularPower = 256;

materijalsfera[2].ambientColor = new Color3(0,.5,0);
materijalsfera[2].diffuseColor = new Color3(0,0,0);
materijalsfera[2].emissiveColor = new Color3(0,0,1);

materijalsfera[3].diffuseTexture = new Texture('img/XPhoto.jpg', scene);
materijalsfera[3].emissiveColor = Color3.Green();

materijalsfera[4].diffuseTexture = new Texture('img/XPhoto.jpg', scene);
materijalsfera[4].emissiveColor = Color3.Yellow();

materijalsfera[5].diffuseTexture = new Texture('img/XPhoto.jpg', scene);
materijalsfera[5].emissiveColor = Color3.Red();

materijalsfera[6].ambientColor = new Color3(0,.8,0);
materijalsfera[6].diffuseColor = new Color3(1,0,0);
materijalsfera[6].alpha = .5;

materijalsfera[7].diffuseTexture = new Texture('img/XPhoto.jpg', scene);
materijalsfera[7].diffuseTexture.hasAlpha = false;  //ako je slika .png da li da ukljuci alpha kanal za teksturu
materijalsfera[7].emissiveColor = Color3.Red();

materijalsfera[8].ambientColor = new Color3(0, .3, 0);
materijalsfera[8].bumpTexture = new Texture('img/XPhoto.jpg', scene);
materijalsfera[8].bumpTexture.level = 15;

const camera = new FreeCamera("kamera", new Vector3(5, 5, -30), scene);
camera.attachControl(canvas);   //da bi mogli da kontrolisemo kameru


const light1 = new PointLight("svjetlo", new Vector3(0, 3, 0), scene);
light1.intensity = .5;
light1.diffuse = new Color3(1, .5, .5);
const light2 = new PointLight("svjetlo2", new Vector3(0, 3, -10), scene);
light2.intensity = .5;
light2.diffuse = new Color3(.5, .5, 1);

scene.registerBeforeRender(() => {
    let counter = 0;
    for(let i=0; i<sfere.length; i++){
        sfere[i].position = new Vector3(sfere[i].position.x, sfere[i].position.y,
            2*i * Math.sin((i*counter)/2)
            );
        counter+=.1;
    }
    let tct = materijalsfera[4].diffuseTexture as Texture;
    tct.uOffset += 0.005;
    tct = materijalsfera[5].diffuseTexture as Texture;
    tct.uScale += .03;
});

engine.runRenderLoop(() => {
    scene.render();
});

window.addEventListener("resize", () => {
    engine.resize();
});