# txt-ss

A VS Code extension that lets you **paste text directly from screenshots** using OCR (powered by `tesseract.js`).

## Features

- Take a screenshot, paste it into VS Code, and the text will be extracted automatically.
- Supports multiple OCR languages (default: English).
- Configurable OCR language via `ocr.language` in VS Code settings.
- Debug logs in the Output channel.

## Commands

- **Paste Screenshot as Text** (`txt-ss.pasteScreenshotText`)  
  Extracts text from a screenshot and pastes it into the active editor.

## Extension Settings

This extension contributes the following setting:

* `ocr.language`: OCR language code (`eng`, `deu`, `fra`, etc.).

## Requirements

- Windows (Linux/Mac support coming soon).
- Node.js 16+.
- [Tesseract.js](https://github.com/naptha/tesseract.js) (already bundled).

## Release Notes

### 0.0.1
- Initial release of txt-ss

