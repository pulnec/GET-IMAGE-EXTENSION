(function() {

  const vscode = acquireVsCodeApi();

  const elements = /** @type {HTMLElement} */ (document.getElementsByClassName("imageSelect"));

  var myFunction = function() {
    var attribute = this.getAttribute("src");
    vscode.postMessage({
      command: 'setUrl',
      text: attribute
    });
  };

  for (var i = 0; i < elements.length; i++) {
    elements[i].addEventListener('click', myFunction, false);
  }

}());