import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Save, Target } from "lucide-react";

interface Course {
  id: string;
  name: string;
  holes: number;
  par: number;
  course_rating: number | null;
  slope_rating: number | null;
}

interface HoleScore {
  hole: number;
  par: number;
  strokes: number | null;
}

const LiveScorecard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [holeScores, setHoleScores] = useState<HoleScore[]>([]);

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

  const { data: courses } = useQuery({
    queryKey: ["courses", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .eq("user_id", user.id)
        .order("name");

      if (error) throw error;
      return data as Course[];
    },
    enabled: !!user,
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!selectedCourse || !user) throw new Error("Missing data");

      const totalStrokes = holeScores.reduce((sum, h) => sum + (h.strokes || 0), 0);
      const filledHoles = holeScores.filter(h => h.strokes !== null).length;

      if (filledHoles === 0) {
        throw new Error("Indtast mindst ét slag");
      }

      if (filledHoles < selectedCourse.holes) {
        throw new Error(`Du skal udfylde alle ${selectedCourse.holes} huller`);
      }

      let scoreData: any = {
        user_id: user.id,
        course_id: selectedCourse.id,
        score: totalStrokes,
        date: new Date().toISOString().split('T')[0],
      };

      // Calculate handicap
      if (selectedCourse.course_rating && selectedCourse.slope_rating) {
        const scoreDifferential = ((totalStrokes - selectedCourse.course_rating) * 113) / selectedCourse.slope_rating;
        scoreData.score_differential = Math.round(scoreDifferential * 10) / 10;
      } else {
        const simpleHandicap = ((totalStrokes - selectedCourse.par) * 18) / selectedCourse.holes;
        scoreData.simple_handicap = Math.round(simpleHandicap * 10) / 10;
      }

      const { error } = await supabase.from("scores").insert([scoreData]);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Score gemt!",
        description: "Din runde er blevet gemt",
      });
      navigate("/dashboard");
    },
    onError: (error: Error) => {
      toast({
        title: "Fejl",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleCourseSelect = (courseId: string) => {
    setSelectedCourseId(courseId);
    const course = courses?.find(c => c.id === courseId);
    if (course) {
      setSelectedCourse(course);
      const parPerHole = Math.round(course.par / course.holes);
      const holes: HoleScore[] = Array.from({ length: course.holes }, (_, i) => ({
        hole: i + 1,
        par: parPerHole,
        strokes: null,
      }));
      setHoleScores(holes);
    }
  };

  const handleStrokeChange = (holeIndex: number, value: string) => {
    const strokes = value === "" ? null : parseInt(value);
    setHoleScores(prev => {
      const updated = [...prev];
      updated[holeIndex] = { ...updated[holeIndex], strokes };
      return updated;
    });
  };

  const totalStrokes = holeScores.reduce((sum, h) => sum + (h.strokes || 0), 0);
  const totalPar = holeScores.reduce((sum, h) => sum + h.par, 0);
  const scoreToPar = totalStrokes - totalPar;

  if (!session || !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Live Scorekort</h1>
          <p className="text-muted-foreground">Indtast dine slag for hvert hul under runden</p>
        </div>

        {!selectedCourse ? (
          <Card>
            <CardHeader>
              <CardTitle>Vælg Bane</CardTitle>
              <CardDescription>Vælg den bane du spiller på</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="course">Bane</Label>
                  <Select value={selectedCourseId} onValueChange={handleCourseSelect}>
                    <SelectTrigger id="course">
                      <SelectValue placeholder="Vælg en bane" />
                    </SelectTrigger>
                    <SelectContent>
                      {courses?.map((course) => (
                        <SelectItem key={course.id} value={course.id}>
                          {course.name} ({course.holes} huller, Par {course.par})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{selectedCourse.name}</span>
                  <Button variant="outline" size="sm" onClick={() => setSelectedCourse(null)}>
                    Skift Bane
                  </Button>
                </CardTitle>
                <CardDescription>
                  {selectedCourse.holes} huller • Par {selectedCourse.par}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold">{totalStrokes}</div>
                    <div className="text-sm text-muted-foreground">Slag i alt</div>
                  </div>
                  <div>
                    <div className={`text-2xl font-bold ${scoreToPar > 0 ? 'text-destructive' : scoreToPar < 0 ? 'text-green-500' : ''}`}>
                      {scoreToPar > 0 ? '+' : ''}{scoreToPar}
                    </div>
                    <div className="text-sm text-muted-foreground">Til par</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 mb-6">
              {holeScores.map((hole, index) => (
                <Card key={hole.hole} className="relative">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-sm font-bold text-primary">{hole.hole}</span>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground">Hul {hole.hole}</div>
                          <div className="text-xs text-muted-foreground">Par {hole.par}</div>
                        </div>
                      </div>
                      {hole.strokes !== null && (
                        <div className={`text-sm font-medium ${
                          hole.strokes > hole.par ? 'text-destructive' : 
                          hole.strokes < hole.par ? 'text-green-500' : 
                          'text-muted-foreground'
                        }`}>
                          {hole.strokes > hole.par ? '+' : ''}{hole.strokes - hole.par}
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="pb-3">
                    <Input
                      type="number"
                      min="1"
                      max="20"
                      placeholder="Slag"
                      value={hole.strokes ?? ""}
                      onChange={(e) => handleStrokeChange(index, e.target.value)}
                      className="text-center text-lg font-bold"
                    />
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="flex justify-end">
              <Button 
                size="lg" 
                onClick={() => saveMutation.mutate()}
                disabled={saveMutation.isPending}
              >
                <Save className="mr-2 h-4 w-4" />
                {saveMutation.isPending ? "Gemmer..." : "Gem Runde"}
              </Button>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default LiveScorecard;
