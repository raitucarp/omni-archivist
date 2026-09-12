import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';

export const metadata: Metadata = {
  title: 'Omni Archivist — Deep-Time Speculative Anthology',
  description: 'An autonomous chronicle of speculative futures, hard science fiction, and cosmic anomalies across the Human Era (12026 HE).',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cinzel:wght@500;700;900&family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Inter:wght@300;400;500;600;700&family=Literata:ital,opsz,wght@0,7..72,400;0,7..72,500;0,7..72,600;0,7..72,700;1,7..72,400;1,7..72,600&family=Space+Grotesk:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-background text-foreground antialiased font-ui selection:bg-[#ee9b00]/30 selection:text-foreground">
        <ThemeProvider
          attribute="data-theme"
          defaultTheme="dark"
          enableSystem={false}
        >
          {/* Ambient Glow */}
          <div className="fixed top-0 left-0 right-0 h-[600px] bg-[radial-gradient(circle_at_50%_0%,rgba(10,147,150,0.2),rgba(238,155,0,0.12)_35%,rgba(155,34,38,0.08)_65%,transparent_80%)] pointer-events-none z-0" />
          
          <div className="relative z-10 flex min-h-screen flex-col">
            {children}
            
            <footer className="mt-auto border-t border-border/80 bg-card/60 py-10 px-4 sm:px-6">
              <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground font-mono">
                <div className="flex items-center gap-2">
                  <span className="text-[#ee9b00]">◈</span>
                  <span className="font-bold text-foreground font-brand tracking-wider">OMNI ARCHIVIST</span>
                  <span>• Epoch 12026 HE</span>
                </div>
                <div>Curated via Autonomous Speculative Semiotics</div>
              </div>
            </footer>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
