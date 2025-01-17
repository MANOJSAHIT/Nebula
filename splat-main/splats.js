window.addEventListener("DOMContentLoaded", async function () {
    const params = new URLSearchParams(window.location.search);
    const category = params.get("category");
    const splats = {
        transportation: [
            "bicycle.splat", 
            "train.splat", 
            "truck.splat"
        ],
        tourism: [
            "garden.splat", 
            "output.splat", 
            "stump.splat", 
            "treehill.splat"
        ],
        objects: [
            "nike.splat", 
            "plush.splat"
        ]
    };

    let currentIndex = 0;
    let gs;
    if (!splats[category]) {
        console.error("Invalid category");
        return;
    }

    var canvas = document.getElementById("renderCanvas");
    var engine = new BABYLON.Engine(canvas, true);

    var createScene = async function () {
        var scene = new BABYLON.Scene(engine);
        scene.clearColor = new BABYLON.Color3(0.1, 0.1, 0.1);
        var camera = new BABYLON.ArcRotateCamera(
            "camera1", 
            -0.8, 
            1.2, 
            10, 
            new BABYLON.Vector3(0, 0, 0), 
            scene
        );
        camera.wheelPrecision = 100;
        camera.inertia = 0.97;
        camera.attachControl(canvas, true);
        const loadGS = async function () {
            if (gs) gs.dispose();

            await BABYLON.SceneLoader.ImportMeshAsync(
                null, 
                "https://splatfilesnebula.s3.us-east-1.amazonaws.com/", 
                splats[category][currentIndex], 
                scene
            ).then((result) => {
                gs = result.meshes[0];
            });

            const cameraSettings = [
                { radius: 5, alpha: -0.8 },
                { radius: 5, alpha: 2.9 },
                { radius: 7, alpha: -0.9 },
                { radius: 9, alpha: 0.8 }
            ];

            camera.radius = cameraSettings[currentIndex].radius;
            camera.alpha = cameraSettings[currentIndex].alpha;
        };

        await loadGS();

        var guiLayer = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("guiLayer");
        var guiContainer = new BABYLON.GUI.Grid();
        guiContainer.name = "uiGrid";
        guiContainer.addRowDefinition(1, false);
        guiContainer.addColumnDefinition(1 / 3, false);
        guiContainer.addColumnDefinition(1 / 3, false);
        guiContainer.addColumnDefinition(1 / 3, false);
        guiContainer.paddingTop = "50px";
        guiContainer.paddingLeft = "50px";
        guiContainer.paddingRight = "50px";
        guiContainer.paddingBottom = "50px";
        guiLayer.addControl(guiContainer);

        var leftBtn = BABYLON.GUI.Button.CreateImageOnlyButton("left", "https://models.babylonjs.com/Demos/weaponsDemo/textures/leftButton.png");
        leftBtn.width = "55px";
        leftBtn.height = "55px";
        leftBtn.thickness = 0;
        leftBtn.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        leftBtn.onPointerClickObservable.add(() => {
            currentIndex = (currentIndex - 1 + splats[category].length) % splats[category].length;
            loadGS();
        });

        var rightBtn = BABYLON.GUI.Button.CreateImageOnlyButton("right", "https://models.babylonjs.com/Demos/weaponsDemo/textures/rightButton.png");
        rightBtn.width = "55px";
        rightBtn.height = "55px";
        rightBtn.thickness = 0;
        rightBtn.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
        rightBtn.onPointerClickObservable.add(() => {
            currentIndex = (currentIndex + 1) % splats[category].length;
            loadGS();
        });

        guiContainer.addControl(leftBtn, 0, 0);
        guiContainer.addControl(rightBtn, 0, 2);

        engine.displayLoadingUI();
        scene.executeWhenReady(function () {
            engine.hideLoadingUI();
        });

        scene.onBeforeRenderObservable.add(() => {
            camera.beta = Math.min(camera.beta, 1.45);
            camera.radius = Math.max(camera.radius, 3);
            camera.radius = Math.min(camera.radius, 6);
        });

        return scene;
    };
    var scene = await createScene();
    engine.runRenderLoop(function () {
        scene.render();
    });

    window.addEventListener("resize", function () {
        engine.resize();
    });
});
