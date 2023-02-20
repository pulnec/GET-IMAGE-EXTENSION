// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require("vscode");
const axios = require("axios");

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
  const API_KEY = "33754791-b848fd4fcd1ab20869d84af65";
  const URL = (value) =>
    "https://pixabay.com/api/?key=" +
    API_KEY +
    "&q=" +
    encodeURIComponent(value);

  let disposable = vscode.commands.registerCommand(
    "imagegenerator.startImageRequest",
    function () {
      vscode.window
        .showInputBox({ prompt: "What image are you looking for ?" })
        .then(async (value) => {
          const response = await axios.get(URL(value));
          if (!response.data.hits.length) {
            vscode.window.showInformationMessage(
              "Hello World from ImageGenerator! " + value
            );
            return false;
          }

          const panel = vscode.window.createWebviewPanel(
            'imagegenerator',
            'Lista de Imagenes',
            vscode.ViewColumn.Two,
            getWebviewOptions(context.extensionUri)
          );

          panel.webview.onDidReceiveMessage(
            message => {
              switch (message.command) {
                case 'alert':
                  vscode.window.showErrorMessage(message.text)
                case 'setUrl':
                  vscode.env.clipboard.writeText(message.text)
                  vscode.window.showInformationMessage('URL copiada en portapapeles')
                  panel.dispose()
                return;
              }
            },
            null,
            []
          );

          panel.webview.html = getHtmlForWebview(panel.webview,response.data.hits)

        });
    }
  );

  const getHtmlForWebview = (webview,list) => {
    const extensionUri = context.extensionUri
		// Local path to main script run in the webview
		const scriptPathOnDisk = vscode.Uri.joinPath(extensionUri, './media', 'main.js');

		// And the uri we use to load this script in the webview
		const scriptUri = webview.asWebviewUri(scriptPathOnDisk);

		// Local path to css styles
		const styleResetPath = vscode.Uri.joinPath(extensionUri, './media', 'reset.css');
		const stylesPathMainPath = vscode.Uri.joinPath(extensionUri, './media', 'vscode.css');

		// Uri to load styles into webview
		const stylesResetUri = webview.asWebviewUri(styleResetPath);
		const stylesMainUri = webview.asWebviewUri(stylesPathMainPath);

		// Use a nonce to only allow specific scripts to be run
		const nonce = getNonce();
    const strImg = list.reduce((stringImg,img) => {
      return `
        <img 
          class="imageSelect"
          src="${img.previewURL}" 
          alt="${img.tags}" 
          data-id:"${img.id}" 
          width="200" height="200" 
        /></br> `+stringImg
    },"")

		return `<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">
				<!--
					Use a content security policy to only allow loading images from https or from our extension directory,
					and only allow scripts that have a specific nonce.
				-->
				<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; img-src ${webview.cspSource} https:; script-src 'nonce-${nonce}';">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<link href="${stylesResetUri}" rel="stylesheet">
				<link href="${stylesMainUri}" rel="stylesheet">
				<title>Listado de Imagenes</title>
			</head>
			<body>
        <div>
          ${strImg}
        </div>
				<script nonce="${nonce}" src="${scriptUri}"></script>
			</body>
			</html>`;
	}

  context.subscriptions.push(disposable)
}

const getNonce = () => {
	let text = '';
	const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	for (let i = 0; i < 32; i++) {
		text += possible.charAt(Math.floor(Math.random() * possible.length));
	}
	return text;
}

const getWebviewOptions = (extensionUri) => {
	return {
		// Enable javascript in the webview
		enableScripts: true,

		// And restrict the webview to only loading content from our extension's `media` directory.
		localResourceRoots: [vscode.Uri.joinPath(extensionUri, 'media')]
	};
}

// This method is called when your extension is deactivated
function deactivate() {}

module.exports = {
  activate,
  deactivate,
};
