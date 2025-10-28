import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Target, TrendingDown, Trophy, Calculator, BarChart3 } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="absolute inset-0 -z-10" style={{ background: "var(--gradient-hero)", opacity: 0.05 }} />
      
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2 font-semibold text-lg">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Target className="h-5 w-5 text-primary" />
              </div>
              <span>Golf Handicap Tracker</span>
            </div>
            
            <div className="flex gap-2">
              <Button variant="ghost" asChild>
                <Link to="/auth">Log ind</Link>
              </Button>
              <Button asChild>
                <Link to="/auth">Kom i gang</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main>
        <section className="py-20 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-12">
              <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Følg Dit Golf Handicap
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Registrer dine scores, beregn dit handicap og følg din udvikling - 
                både på officielle baner og Pay & Play anlæg
              </p>
              <div className="mt-8">
                <Button size="lg" asChild>
                  <Link to="/auth">Start nu - Det er gratis</Link>
                </Button>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mt-16">
              <Card className="hover:shadow-lg transition-all" style={{ boxShadow: "var(--shadow-card)" }}>
                <CardHeader>
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                    <Trophy className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Administrer Baner</CardTitle>
                  <CardDescription>
                    Opret og gem dine yndlingsbaner med alle relevante oplysninger
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  <ul className="space-y-2">
                    <li>• Pay & Play baner</li>
                    <li>• Officielle DGU-ratede baner</li>
                    <li>• Course og Slope Rating</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-all" style={{ boxShadow: "var(--shadow-card)" }}>
                <CardHeader>
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                    <Calculator className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Automatisk Beregning</CardTitle>
                  <CardDescription>
                    To metoder til præcis handicap beregning
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  <ul className="space-y-2">
                    <li>• Simpel metode til uofficielle baner</li>
                    <li>• WHS metode til ratede baner</li>
                    <li>• Automatisk valg af metode</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-all" style={{ boxShadow: "var(--shadow-card)" }}>
                <CardHeader>
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                    <BarChart3 className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Følg Din Udvikling</CardTitle>
                  <CardDescription>
                    Detaljeret statistik og historik
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  <ul className="space-y-2">
                    <li>• Gennemsnitligt handicap</li>
                    <li>• Bedste og seneste runder</li>
                    <li>• Udvikling over tid</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section className="py-20 px-4 bg-muted/30">
          <div className="container mx-auto max-w-4xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Hvordan Virker Det?</h2>
              <p className="text-muted-foreground">
                Kom i gang på få minutter
              </p>
            </div>

            <div className="space-y-8">
              <div className="flex gap-4 items-start">
                <div className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold flex-shrink-0">
                  1
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Opret en konto</h3>
                  <p className="text-muted-foreground">
                    Registrer dig gratis og kom i gang med at tracke dine runder
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold flex-shrink-0">
                  2
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Tilføj dine baner</h3>
                  <p className="text-muted-foreground">
                    Indtast information om de baner du spiller på - både officielle og uofficielle
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold flex-shrink-0">
                  3
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Registrer dine scores</h3>
                  <p className="text-muted-foreground">
                    Efter hver runde registrerer du din score - handicap beregnes automatisk
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold flex-shrink-0">
                  4
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Følg din udvikling</h3>
                  <p className="text-muted-foreground">
                    Se din statistik, gennemsnit og spor din forbedring over tid
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-12 text-center">
              <Button size="lg" asChild>
                <Link to="/auth">Kom i gang nu</Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="py-20 px-4">
          <div className="container mx-auto max-w-4xl">
            <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">To Beregningsmetoder</CardTitle>
                <CardDescription>Systemet tilpasser sig automatisk til din bane</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h3 className="font-semibold flex items-center gap-2">
                      <TrendingDown className="h-5 w-5 text-primary" />
                      Simpel Metode
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Til Pay & Play og ikke-ratede baner. Skalerer dit resultat til 18-hullers standard.
                    </p>
                    <code className="block text-xs bg-muted p-3 rounded">
                      (Score - Par) × 18 / Antal huller
                    </code>
                  </div>

                  <div className="space-y-3">
                    <h3 className="font-semibold flex items-center gap-2">
                      <Calculator className="h-5 w-5 text-primary" />
                      WHS Metode
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Officiel World Handicap System beregning til DGU-ratede baner.
                    </p>
                    <code className="block text-xs bg-muted p-3 rounded">
                      (Score - CR) × 113 / SR
                    </code>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <footer className="border-t py-8 px-4">
        <div className="container mx-auto text-center text-sm text-muted-foreground">
          <p>Golf Handicap Tracker - Følg dit spil, forbedre din præstation</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
