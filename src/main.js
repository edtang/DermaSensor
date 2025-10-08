const {
    dialog,
    app,
    BrowserWindow
} = require('electron')
const {
    webContents
} = require('electron')
const {
    ipcMain
} = require('electron')
const electron = require('electron')
const ipc = electron.ipcMain;
const fs = require('fs')

var win;
var workerWindow;

if (require('electron-squirrel-startup')) { // eslint-disable-line global-require
    app.quit();
}

function createWindow() {

    win = new BrowserWindow({
        width: 1200,
        minWidth: 1200,
        height: 1080,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true,
        },
    })

    win.loadFile('src/index.html')
}

function createWorkerWindow() {
    workerWindow = new BrowserWindow();
    workerWindow.loadURL("file://" + __dirname + "/printerWindow.html");
    workerWindow.hide();

}


function createTab1() {

    win = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            nodeIntegration: true,
            webviewTag: true
        }
    })

    win.loadFile('tab1.html')
}

function createTab2() {

    win = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            nodeIntegration: true,
            webviewTag: true
        }
    })

    win.loadFile('tab1backup.html')
}

//app.whenReady().then(createWindow)
//app.whenReady().then(createTab1)

app.on('ready', function() {
    createWindow();
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow()
    }
})

ipc.on('loadData', (event, args) => {
    let loadPath = "blagh";
    loadPath = dialog.showOpenDialogSync(null, JSONLoadoptions, (path) => {
        console.log(path);
    });

    if (loadPath != undefined) {
        console.log("LOADPATH: " + loadPath);

        fs.readFile(String(loadPath), 'utf-8', (err, data) => {
            if (err) {
                //     alert("An error ocurred reading the file :" + err.message);
                return;
            }

            // Change how to handle the file content
            //      console.log("The file content is : " + data);
            const win = BrowserWindow.fromWebContents(event.sender)
            win.webContents.send('loaded-data', data);
        });

    }


});

ipc.on('saveData', (event, args) => {
    // const win = BrowserWindow.fromWebContents(event.sender)

    //  const contents = win.webContents;
    // console.log("savedata: " + JSON.stringify(args));
    let savePath = "blagh";
    savePath = dialog.showSaveDialogSync(null, JSONoptions, (path) => {
        console.log(path);


    });

    if (savePath != undefined) {

        console.log("savepath " + savePath)
        fs.writeFile(savePath, JSON.stringify(args), (error) => {
            if (error) throw error
            console.log(`Wrote JSON successfully to ${savePath}`)

        });
    }
});

ipc.on('savePDF', (event, args) => {

    let savePath = "blagh";
    savePath = dialog.showSaveDialogSync(null, PDFoptions, (path) => {
        console.log(path);


    });

    if (savePath != undefined) {
        console.log("savepath " + savePath)

        // const pdfPath = '/Users/edtang/Documents/electron/print.pdf';
        // console.log("pdf " + pdfPath);
        const win = BrowserWindow.fromWebContents(event.sender)

        const contents = win.webContents;
        //  contents.reload();



        contents.printToPDF({
            landscape: false,
            pageSize: "Letter",
            printBackground: true
        }).then(data => {
            // const pdfPath = path.join(os.homedir(), 'Desktop', 'temp.pdf')
            const pdfPath = '/Users/edtang/Desktop/test.pdf';
            console.log("PDfpath " + savePath);
            fs.writeFile(savePath, data, (error) => {
                if (error) throw error
                console.log(`Wrote PDF successfully to ${savePath}`)
                win.webContents.send('wrote-pdf', 'wrote-pdf');
            })
        }).catch(error => {
            console.log("ERROR!");
            console.log(`Failed to write PDF to ${savePath}: `, error)
            win.webContents.send('wrote-pdf', 'wrote-pdf');
        })
    } else {
        const win = BrowserWindow.fromWebContents(event.sender)

        const contents = win.webContents;
        win.webContents.send('wrote-pdf', 'wrote-pdf');

    }
});

const PDFoptions = {
    defaultPath: app.getPath('documents') + '/DermaSensor.pdf',
}

const JSONoptions = {
    defaultPath: app.getPath('documents') + '/DermaSensorData.json',
}

const JSONLoadoptions = {

}