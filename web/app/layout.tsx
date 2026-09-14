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
          href="https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=Space+Grotesk:wght@400;500;600;700&family=Literata:ital,opsz,wght@0,7..72,400;0,7..72,500;0,7..72,600;0,7..72,700;1,7..72,400;1,7..72,600&family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-background text-foreground antialiased font-ui selection:bg-[#ee9b00]/30 selection:text-foreground">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
        >
          <div className="relative z-10 flex min-h-screen flex-col">
            {children}
            
            <footer className="mt-auto border-t border-border/80 bg-card/60 py-10 px-4 sm:px-6">
              <div className="max-w-6xl mx-auto flex flex-col gap-6 text-xs text-muted-foreground font-mono">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-[#ee9b00]">◈</span>
                    <span className="font-bold text-foreground font-brand tracking-wider">OMNI ARCHIVIST</span>
                    <span>• Epoch 12026 HE</span>
                  </div>

                  <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 font-ui text-sm">
                    <a
                      href="/"
                      className="hover:text-foreground transition-colors"
                    >
                      Anthology
                    </a>
                    <a
                      href="/about/"
                      className="hover:text-foreground transition-colors font-semibold text-foreground/90"
                    >
                      About
                    </a>
                    <a
                      href="https://ko-fi.com/raitucarp"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#bb3e03] dark:text-[#ee9b00] hover:underline font-bold transition-colors inline-flex items-center gap-1"
                    >
                      <span>Support on Ko-fi</span>
                    </a>
                    <a
                      href="https://github.com/raitucarp"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-foreground transition-colors"
                    >
                      GitHub
                    </a>
                    <a
                      href="https://raitucarp.name"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-foreground transition-colors"
                    >
                      raitucarp.name
                    </a>
                  </div>
                </div>

                <div className="border-t border-border/40 pt-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
                  <div>Curated via Autonomous Speculative Semiotics by Ribhararnus Pracutiar</div>
                  <div>Built with Go, Genkit, Gemini, gown &amp; Next.js</div>
                </div>
              </div>
            </footer>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
