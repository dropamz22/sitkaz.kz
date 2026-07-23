import "./globals.css";

export const metadata = {
  title: "sitkaz.kz — учим казахский",
  description: "Мини-приложение для изучения казахского языка: уроки, карточки и квизы.",
  manifest: "/manifest.json",
};

export const viewport = {
  themeColor: "#f7f9ff",
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
        {/* Шрифты дизайн-системы: Plus Jakarta Sans + JetBrains Mono */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Quicksand:wght@400;500;600;700&family=Nunito+Sans:wght@400;600;700;800&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,400..700,0..1,0&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
