import "./globals.css";

export const metadata = {
  title: "sitkaz.kz — учим казахский",
  description: "Мини-приложение для изучения казахского языка: уроки, карточки и квизы.",
  manifest: "/manifest.json",
};

export const viewport = {
  themeColor: "#00a3a3",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }) {
  return (
    <html lang="ru">
      <head>
        {/* Telegram Mini App SDK — приложение работает и внутри Telegram, и в браузере */}
        <script src="https://telegram.org/js/telegram-web-app.js" async />
      </head>
      <body>{children}</body>
    </html>
  );
}
