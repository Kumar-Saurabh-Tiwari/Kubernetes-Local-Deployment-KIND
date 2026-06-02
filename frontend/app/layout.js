import "./globals.css";

export const metadata = {
  title: "Groq Playground",
  description: "Chat with a Groq-backed API running on Kubernetes"
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <div className="page">
          {children}
        </div>
      </body>
    </html>
  );
}
