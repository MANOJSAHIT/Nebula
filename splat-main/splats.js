window.addEventListener("DOMContentLoaded", async function () {
    const params = new URLSearchParams(window.location.search);
    const category = params.get("category");

    // Define categories and their corresponding splat files
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

    // Ensure the category is valid
    if (!splats[category]) {
        console.error("Invalid category");
        return;
    }

    // Set up the Babylon.js engine and scene
    var canvas = document.getElementById("renderCanvas");
    var engine = new BABYLON.Engine(canvas, true);

    var createScene = async function () {
        var scene = new BABYLON.Scene(engine);
        scene.clearColor = new BABYLON.Color3(0.1, 0.1, 0.1);

        // Create and position a free camera
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

        // Function to load .splat files
        const loadGS = async function () {
            // Dispose the previous model if any
            if (gs) gs.dispose();

            // Load the next .splat based on the current index
            await BABYLON.SceneLoader.ImportMeshAsync(
                null, 
                "https://splatfilesnebula.s3.us-east-1.amazonaws.com/", 
                splats[category][currentIndex], 
                scene
            ).then((result) => {
                gs = result.meshes[0];
            });

            // Adjust camera settings based on the model
            const cameraSettings = [
                { radius: 5, alpha: -0.8 },
                { radius: 5, alpha: 2.9 },
                { radius: 7, alpha: -0.9 },
                { radius: 9, alpha: 0.8 }
            ];

            camera.radius = cameraSettings[currentIndex].radius;
            camera.alpha = cameraSettings[currentIndex].alpha;
        };

        // Load initial model
        await loadGS();

        // GUI setup
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

        // Display loading screen while loading assets
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

    // Create scene and run the render loop
    var scene = await createScene();
    engine.runRenderLoop(function () {
        scene.render();
    });

    window.addEventListener("resize", function () {
        engine.resize();
    });
});
