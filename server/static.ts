import express, { type Express } from "express";
import fs from "fs";
import path from "path";

// В CJS формате используем только process.cwd() - это безопасно и работает везде

export function serveStatic(app: Express) {
  // Путь к статическим файлам: dist/public (куда собирается vite)
  // В зависимости от того, откуда запускается (source или compiled), путь может быть разный
  // В CJS формате используем process.cwd() для определения корня проекта
  const possiblePaths = [
    path.resolve(process.cwd(), "dist", "public"), // Основной путь - из корня проекта
    path.resolve(process.cwd(), "public"), // Альтернативный путь
  ];

  let distPath: string | null = null;
  for (const possiblePath of possiblePaths) {
    if (fs.existsSync(possiblePath)) {
      distPath = possiblePath;
      break;
    }
  }

  if (!distPath) {
    throw new Error(
      `Could not find the build directory. Checked: ${possiblePaths.join(", ")}. Make sure to run "npm run build" first.`,
    );
  }

  app.use(express.static(distPath));

  // fall through to index.html if the file doesn't exist
  app.use("*", (_req, res) => {
    res.sendFile(path.resolve(distPath!, "index.html"));
  });
}
