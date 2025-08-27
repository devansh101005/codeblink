// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const Tesseract = require("tesseract.js");
const { exec } = require("child_process");
const os = require("os");
const path = require("path");
const fs=require("fs");

/** 
* @param {vscode.ExtensionContext} context
 */
// function activate(context) {

// 	// Use the console to output diagnostic information (console.log) and errors (console.error)
// 	// This line of code will only be executed once when your extension is activated
// 	console.log('Congratulations, your extension "txt-ss" is now active!');

// 	// The command has been defined in the package.json file
// 	// Now provide the implementation of the command with  registerCommand
// 	// The commandId parameter must match the command field in package.json
// 	const disposable = vscode.commands.registerCommand('txt-ss.helloWorld', function () {
// 		// The code you place here will be executed every time your command is executed

// 		// Display a message box to the user
// 		//vscode.window.showInformationMessage('Hello World from txt-ss!');
//        const editor = vscode.window.activeTextEditor;
//        if (editor) {
//       editor.edit(editBuilder => {
//     editBuilder.insert(editor.selection.active, "Hello from my first extension!");
//   });
// }



// 	});

// 	context.subscriptions.push(disposable);
// }

//Writing that same function with some changes





// function activate(context) {
//     let disposable = vscode.commands.registerCommand('extension.pasteScreenshotText',
// 		async function () {
//         const editor = vscode.window.activeTextEditor;
//          if (!editor) return;

//       const tmpFile = path.join(os.tmpdir(), "vscode_clip.png");
//       exec(
//         `powershell -command "Add-Type -AssemblyName System.Windows.Forms; if ([Windows.Forms.Clipboard]::ContainsImage()) { [Windows.Forms.Clipboard]::GetImage().Save('${tmpFile}'); }"`,
//         (err) => {
//           if (err) {
//             vscode.window.showErrorMessage("No image in clipboard!");
//             return;
//           }

//           vscode.window.showInformationMessage("Running OCR...");


//           Tesseract.recognize(tmpFile, "eng")
//             .then(({ data: { text } }) => {
				
//               editor.edit((editBuilder) => {
//                 editBuilder.insert(editor.selection.active, text);
//               });
// 			   vscode.window.showInformationMessage("OCR complete!");
//             })
//             .catch((err) => {
//               vscode.window.showErrorMessage("OCR failed: " + err.message);
//             });
//         }
//       );
//     }
//   );



    

//     context.subscriptions.push(disposable);
// }



//  function deactivate() {}

//  module.exports = {
//  	activate,
//  	deactivate
//  }





function activate(context) {
  // 1. Create a dedicated Output Channel
  const outputChannel = vscode.window.createOutputChannel("OCR Logs");

  let disposable = vscode.commands.registerCommand(
    "extension.pasteScreenshotText",
    async function () {
      const editor = vscode.window.activeTextEditor;
      if (!editor) return;

      const tmpFile = path.join(os.tmpdir(), "vscode_clip.png");

      exec(
        `powershell -command "Add-Type -AssemblyName System.Windows.Forms; if ([Windows.Forms.Clipboard]::ContainsImage()) { [Windows.Forms.Clipboard]::GetImage().Save('${tmpFile}'); }"`,
        (err) => {
          if (err) {
            vscode.window.showErrorMessage("No image in clipboard!");
            outputChannel.appendLine("[ERROR] No image found in clipboard.");
            return;
          }

          vscode.window.withProgress(
            {
              location: vscode.ProgressLocation.Notification,
              title: "Running OCR on screenshot...",
              cancellable: false,
            },
            async (progress) => {
              progress.report({ increment: 0, message: "Starting OCR..." });
              outputChannel.show(true); // Auto-show logs
              outputChannel.appendLine("=== OCR Process Started ===");
              outputChannel.appendLine("Image file: " + tmpFile);

              try {
                const result = await Tesseract.recognize(tmpFile, "eng", {
                  logger: (m) => {
                    outputChannel.appendLine(`[OCR] ${m.status} (${Math.round(m.progress * 100)}%)`);
                    if (m.status === "recognizing text") {
                      progress.report({
                        increment: m.progress * 100,
                        message: "Recognizing text...",
                      });
                    }
                  },
                });

                const text = result.data.text;
                outputChannel.appendLine("--- Recognized Text ---");
                outputChannel.appendLine(text);
                outputChannel.appendLine("=======================");

                editor.edit((editBuilder) => {
                  editBuilder.insert(editor.selection.active, text);
                });

                vscode.window.showInformationMessage("✅ OCR complete!");
              } catch (err) {
                vscode.window.showErrorMessage("OCR failed: " + err.message);
                outputChannel.appendLine("[ERROR] OCR failed: " + err.message);
              }
            }
          );
        }
      );
    }
  );

  context.subscriptions.push(disposable);
}

function deactivate() {}

module.exports = {
  activate,
  deactivate,
};





