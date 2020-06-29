///<reference types="../../node_modules/electron/Electron"/>

namespace Main {
  //#region Types and Data
  enum MENU {
    QUIT,
    PROJECT_SAVE,
    PROJECT_OPEN,
    VIEW_NODE_OPEN,
    NODE_DELETE,
    NODE_UPDATE,
    DEVTOOLS_OPEN,
    VIEW_ANIMATION,
    PHYSICS_DEBUG,
    PHYSICS_DEBUG_M1,
    PHYSICS_DEBUG_M2,
    PHYSICS_DEBUG_M3,
    PHYSICS_DEBUG_M4,
    PHYSICS_DEBUG_M5
  }

  const { app, BrowserWindow, Menu, ipcMain } = require("electron");

  let fudge: Electron.BrowserWindow;
  let defaultWidth: number = 800;
  let defaultHeight: number = 600;
  //#endregion

  //#region Events
  app.addListener("ready", createFudge);
  app.addListener("window-all-closed", function (): void {
    console.log("Quit");
    if (process.platform !== "darwin") app.quit();
  });
  app.addListener("activate", function (): void {
    console.log("Activate");
    if (fudge === null) createFudge();
  });

  function send(_window: Electron.BrowserWindow, _message: string, ..._args: unknown[]): void {
    console.log(`Send message ${_message}`);
    _window.webContents.send(_message, _args);
  }
  //#endregion

  //#region Window
  function createFudge(): void {
    console.log("createFudge");
    fudge = addWindow("../Html/Fudge.html");
    const menu: Electron.Menu = Menu.buildFromTemplate(getMenuFudge());
    fudge.setMenu(menu);
  }

  function addWindow(_url: string, width: number = defaultWidth, height: number = defaultHeight): Electron.BrowserWindow {
    let window: Electron.BrowserWindow = new BrowserWindow({
      width: width, height: height, webPreferences: {        // preload: path.join(__dirname, "preload.js"),
        nodeIntegration: true
      }
    });

    window.webContents.openDevTools();
    window.loadFile(_url);

    return window;
  }
  // #endregion

  //#region Menus  

  function menuSelect(_item: Electron.MenuItem, _window: Electron.BrowserWindow, _event: Electron.KeyboardEvent): void {
    console.log(`MenuSelect: Item-id=${MENU[_item.id]}`);
    switch (Number(_item.id)) {
      case MENU.PROJECT_OPEN:
        send(_window, "open", null);
        break;
      case MENU.PROJECT_SAVE:
        send(_window, "save", null);
        break;
      case MENU.VIEW_NODE_OPEN:
        send(_window, "openViewNode", null);
        break;
      case MENU.NODE_UPDATE:
        send(_window, "updateNode", null);
        break;
      case MENU.DEVTOOLS_OPEN:
        _window.webContents.openDevTools();
        break;
      case MENU.VIEW_ANIMATION:
        send(_window, "openAnimationPanel");
        break;
      case MENU.QUIT:
        app.quit();
        break;

      //Physics Debug Menu Options | Marko Fehrenbach, HFU 2020  
      case MENU.PHYSICS_DEBUG:
        send(_window, "togglePhysicsDebugView");
        break;
      case MENU.PHYSICS_DEBUG_M1:
        send(_window, "PhysicsViewMode_1");
        break
      case MENU.PHYSICS_DEBUG_M2:
        send(_window, "PhysicsViewMode_2");
        break
      case MENU.PHYSICS_DEBUG_M3:
        send(_window, "PhysicsViewMode_3");
        break
      case MENU.PHYSICS_DEBUG_M4:
        send(_window, "PhysicsViewMode_4");
        break
      case MENU.PHYSICS_DEBUG_M5:
        send(_window, "PhysicsViewMode_5");
        break
      default:
        break;
    }
  }

  function getMenuFudge(): Electron.MenuItemConstructorOptions[] {
    const menu: Electron.MenuItemConstructorOptions[] = [
      {
        label: "Project", submenu: [
          {
            label: "Save", id: String(MENU.PROJECT_SAVE), click: menuSelect, accelerator: process.platform == "darwin" ? "Command+S" : "Ctrl+S"
          },
          {
            label: "Open", id: String(MENU.PROJECT_OPEN), click: menuSelect, accelerator: process.platform == "darwin" ? "Command+O" : "Ctrl+O"
          },
          {
            label: "Quit", id: String(MENU.QUIT), click: menuSelect, accelerator: process.platform == "darwin" ? "Command+Q" : "Ctrl+Q"
          }
        ]
      },
      {
        label: "View", submenu: [
          {
            label: "Node", id: String(MENU.VIEW_NODE_OPEN), click: menuSelect, accelerator: process.platform == "darwin" ? "Command+N" : "Ctrl+N"
          },
          {
            label: "setRoot(testing)", id: String(MENU.NODE_UPDATE), click: menuSelect, accelerator: process.platform == "darwin" ? "Command+U" : "Ctrl+U"
          },
          {
            label: "Animation", id: String(MENU.VIEW_ANIMATION), click: menuSelect, accelerator: process.platform == "darwin" ? "Command+I" : "Ctrl+I"
          }
        ]
      },
      {
        label: "Debug", submenu: [
          {
            label: "DevTool", id: String(MENU.DEVTOOLS_OPEN), click: menuSelect, accelerator: process.platform == "darwin" ? "F12" : "F12"
          },
          { type: 'separator' },
          {
            label: "Physic Debug View", id: String(MENU.PHYSICS_DEBUG), click: menuSelect, accelerator: "CmdOrCtrl+P"
          }, {
            label: "Physics Debug Mode", 'submenu': [{
              'label': 'Colliders', id: String(MENU.PHYSICS_DEBUG_M1), click: menuSelect
            }, {
              'label': 'Colliders and Joints (Default)', id: String(MENU.PHYSICS_DEBUG_M2), click: menuSelect
            }, {
              'label': 'Bounding Boxes', id: String(MENU.PHYSICS_DEBUG_M3), click: menuSelect
            }, {
              'label': 'Contacts', id: String(MENU.PHYSICS_DEBUG_M4), click: menuSelect
            },
            {
              'label': 'Show Physics Objects ONLY', id: String(MENU.PHYSICS_DEBUG_M5), click: menuSelect
            }]
          },
        ]
      }
    ];
    return menu;
  }
  // #endregion

  function test() {
    console.log("test");
  }
}