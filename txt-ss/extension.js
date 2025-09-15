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

                const params={
                  preserve_interword_spaces:'1',
                };

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
                  tessedit_pageseg_mode: Tesseract.PSM.SINGLE_BLOCK,
                  ...params
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





