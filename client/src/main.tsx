import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { initTelegramWebApp } from "./lib/telegram";

// Инициализация Telegram WebApp
if (typeof window !== 'undefined') {
  try {
    initTelegramWebApp();
  } catch (error) {
    console.error('Telegram WebApp initialization error:', error);
  }
}

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element not found");
}

try {
  const root = createRoot(rootElement);
  root.render(<App />);
} catch (error) {
  console.error('Failed to render app:', error);
  rootElement.innerHTML = `
    <div style="display: flex; align-items: center; justify-content: center; min-height: 100vh; padding: 20px; text-align: center; font-family: system-ui, -apple-system, sans-serif;">
      <div>
        <h1 style="font-size: 24px; margin-bottom: 16px;">Ошибка загрузки приложения</h1>
        <p style="color: #666; margin-bottom: 24px;">Пожалуйста, обновите страницу или обратитесь в поддержку.</p>
        <button onclick="window.location.reload()" style="padding: 12px 24px; background: #1a5c41; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 16px;">
          Обновить страницу
        </button>
        <details style="margin-top: 20px; text-align: left;">
          <summary style="cursor: pointer; color: #666;">Подробности ошибки</summary>
          <pre style="margin-top: 8px; padding: 12px; background: #f5f5f5; border-radius: 4px; overflow: auto; font-size: 12px;">${String(error)}</pre>
        </details>
      </div>
    </div>
  `;
}
