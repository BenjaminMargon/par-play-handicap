import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingDown, TrendingUp, Target, Calendar } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";

interface ScoreWithCourse {
  id: string;
  score: number;
  date: string;
  simple_handicap: number | null;
  score_differential: number | null;
  courses: {
    name: string;
    holes: number;
    par: number;
  };
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (!session) {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const { data: scores, isLoading } = useQuery({
    queryKey: ["scores", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("scores")
        .select(`
          *,
          courses (
            name,
            holes,
            par
          )
        `)
        .eq("user_id", user.id)
        .order("date", { ascending: false })
        .limit(5);

      if (error) throw error;
      return data as ScoreWithCourse[];
    },
    enabled: !!user,
  });

  const { data: allScores } = useQuery({
    queryKey: ["allScores", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("scores")
        .select("date, simple_handicap, score_differential")
        .eq("user_id", user.id)
        .order("date", { ascending: true });

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const { data: stats } = useQuery({
    queryKey: ["stats", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from("scores")
        .select("simple_handicap, score_differential")
        .eq("user_id", user.id)
        .not("simple_handicap", "is", null);

      if (error) throw error;

      if (!data || data.length === 0) return null;

      const handicaps = data
        .map(s => s.simple_handicap || s.score_differential)
        .filter(h => h !== null) as number[];

      const avgHandicap = handicaps.reduce((a, b) => a + b, 0) / handicaps.length;
      const bestHandicap = Math.min(...handicaps);
      const latestHandicap = handicaps[0];

      return {
        avgHandicap: Math.round(avgHandicap * 10) / 10,
        bestHandicap: Math.round(bestHandicap * 10) / 10,
        latestHandicap: Math.round(latestHandicap * 10) / 10,
        totalRounds: data.length,
      };
    },
    enabled: !!user,
  });

  const chartData = allScores?.map((score) => ({
    date: new Date(score.date).toLocaleDateString("da-DK", { day: "2-digit", month: "2-digit" }),
    handicap: Math.round((score.simple_handicap || score.score_differential || 0) * 10) / 10,
  })) || [];

  if (!session || !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
          <p className="text-muted-foreground">Velkommen tilbage! Her er dit overblik</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Aktuelt Handicap</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats?.latestHandicap ?? "—"}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Baseret på seneste runde
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Gennemsnit</CardTitle>
              <TrendingDown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats?.avgHandicap ?? "—"}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Gennemsnitligt handicap
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Bedste</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats?.bestHandicap ?? "—"}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Dit laveste handicap
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Antal Runder</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats?.totalRounds ?? 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Registrerede runder
              </p>
            </CardContent>
          </Card>
        </div>

        {chartData.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Handicap Udvikling</CardTitle>
              <CardDescription>Se hvordan dit handicap har udviklet sig over tid</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  handicap: {
                    label: "Handicap",
                    color: "hsl(var(--primary))",
                  },
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis 
                      dataKey="date" 
                      className="text-xs"
                      tick={{ fill: "hsl(var(--muted-foreground))" }}
                    />
                    <YAxis 
                      className="text-xs"
                      tick={{ fill: "hsl(var(--muted-foreground))" }}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line 
                      type="monotone" 
                      dataKey="handicap" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2}
                      dot={{ fill: "hsl(var(--primary))", r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Seneste Runder</CardTitle>
            <CardDescription>Dine 5 seneste registrerede scores</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-muted-foreground text-center py-4">Indlæser...</p>
            ) : scores && scores.length > 0 ? (
              <div className="space-y-4">
                {scores.map((score) => (
                  <div key={score.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                    <div>
                      <p className="font-medium">{score.courses.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(score.date).toLocaleDateString("da-DK")}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">{score.score} slag</p>
                      <p className="text-sm text-muted-foreground">
                        Handicap: {score.simple_handicap ?? score.score_differential ?? "—"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>Ingen runder registreret endnu</p>
                <p className="text-sm mt-2">Kom i gang ved at tilføje din første score!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Dashboard;
