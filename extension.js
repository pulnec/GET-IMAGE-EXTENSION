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
  /*
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

          const { largeImageURL } = response.data.hits[0];
          await vscode.env.clipboard.writeText(largeImageURL);
          vscode.window.showInformationMessage(
            "Set URL image set in the Clipboard :) !"
          );
        });
    }
  );
*/

  let disposable2 = vscode.commands.registerCommand(
    "imagegenerator.startImageRequest",
    async function () {
      // Get the active text editor
      const editor = vscode.window.activeTextEditor;

      if (editor) {
        const document = editor.document;
        const selection = editor.selection;
        // Get the word within the selection
        const word = document.getText(selection);
        //validation
        try {
          if (word.includes("@image:")) {
            const part = word.split(":");
            if (part.length === 2) {
              const queryImage = part[1];
              const response = await axios.get(URL(queryImage));
              if (!response.data.hits.length) {
                vscode.window.showInformationMessage(
                  "Hello World from ImageGenerator! " + queryImage
                );
                return false;
              }

              const { largeImageURL } = response.data.hits[0];
              editor.edit((editBuilder) => {
                editBuilder.replace(selection, largeImageURL);
              });
              vscode.window.showInformationMessage("URL Image apply :) !");
            } else {
              throw new Error();
            }
          } else {
            throw new Error();
          }
        } catch (e) {
          vscode.window.showWarningMessage(
            "Command format incorrect please, Ex. @image:find_image_name"
          );
        }
        console.log("wordParse", word);
      }
    }
  );

  context.subscriptions.push(disposable2);
}

// This method is called when your extension is deactivated
function deactivate() {}

module.exports = {
  activate,
  deactivate,
};
