var WebGLRendering;
(function (WebGLRendering) {
    var ƒ = Fudge;
    window.addEventListener("load", init);
    let uiRectangles = {};
    let canvas;
    let viewPort = new ƒ.Viewport();
    function init() {
        // create asset
        let branch = Scenes.createAxisCross();
        branch.addComponent(new ƒ.ComponentTransform());
        // initialize WebGL and transmit content
        ƒ.WebGLApi.initializeContext();
        ƒ.WebGL.addBranch(branch);
        ƒ.WebGL.recalculateAllNodeTransforms();
        // initialize viewports
        canvas = document.getElementsByTagName("canvas")[0];
        let camera = Scenes.createCamera(new ƒ.Vector3(1, 2, 3));
        let cmpCamera = camera.getComponent(ƒ.ComponentCamera);
        viewPort.initialize(canvas.id, branch, cmpCamera, canvas);
        ƒ.Loop.addEventListener(ƒ.EVENT.ANIMATION_FRAME, animate);
        ƒ.Loop.start();
        function animate(_event) {
            branch.cmpTransform.rotateY(1);
            ƒ.WebGL.recalculateAllNodeTransforms();
            // prepare and draw viewport
            viewPort.prepare();
            viewPort.draw();
        }
        let menu = document.getElementsByTagName("div")[0];
        let uiCamera = new UI.Camera();
        menu.appendChild(uiCamera);
        appendUIRectangle(menu, "WebGLCanvas");
        appendUIRectangle(menu, "WebGLViewport");
        appendUIRectangle(menu, "Source");
        appendUIRectangle(menu, "Destination");
        appendUIRectangle(menu, "DomCanvas");
        appendUIRectangle(menu, "CSSRectangle");
        setAll({ x: 0, y: 0, width: 300, height: 300 });
    }
    function appendUIRectangle(_parent, _name) {
        let uiRectangle = new UI.Rectangle(_name);
        uiRectangle.appendButton("all");
        uiRectangle.addEventListener("click", hndClick);
        uiRectangle.addEventListener("input", hndChange);
        uiRectangle.appendCheckbox("lock");
        _parent.appendChild(uiRectangle);
        uiRectangles[_name] = uiRectangle;
    }
    function hndClick(_event) {
        if (_event.target.tagName != "BUTTON")
            return;
        let current = _event.currentTarget;
        setAll(current.getRect());
    }
    function setAll(_rect) {
        for (let name in uiRectangles) {
            let uiRectangle = uiRectangles[name];
            if (uiRectangle.isLocked())
                continue;
            uiRectangle.setRect(_rect);
            setRect(uiRectangle);
        }
        update();
    }
    function hndChange(_event) {
        let target = _event.currentTarget;
        setRect(target);
    }
    function setRect(_uiRectangle) {
        let rect = _uiRectangle.getRect();
        switch (_uiRectangle.name) {
            case "WebGLCanvas":
                ƒ.WebGL.setCanvasSize(rect.width, rect.height);
                break;
            case "WebGLViewport":
                ƒ.WebGL.setViewportRectangle(rect);
                break;
            case "Source":
                viewPort.rectSource = rect;
                break;
            case "Destination":
                viewPort.rectDestination = rect;
                break;
            case "DomCanvas":
                canvas.width = rect.width;
                canvas.height = rect.height;
                break;
            case "CSSRectangle":
                canvas.style.left = rect.x + "px";
                canvas.style.top = rect.y + "px";
                canvas.style.width = rect.width + "px";
                canvas.style.height = rect.height + "px";
                break;
            default:
                throw (new Error("Invalid name: " + _uiRectangle.name));
        }
        update();
    }
    function update() {
        uiRectangles["WebGLCanvas"].setRect(ƒ.WebGL.getCanvasRect());
        uiRectangles["WebGLViewport"].setRect(ƒ.WebGL.getViewportRectangle());
        uiRectangles["Source"].setRect(viewPort.rectSource);
        uiRectangles["Destination"].setRect(viewPort.rectDestination);
        uiRectangles["DomCanvas"].setRect({ x: 0, y: 0, width: canvas.width, height: canvas.height });
        let client = canvas.getBoundingClientRect();
        uiRectangles["CSSRectangle"].setRect({ x: client.left, y: client.top, width: client.width, height: client.height });
    }
})(WebGLRendering || (WebGLRendering = {}));
//# sourceMappingURL=TestDimensions.js.map