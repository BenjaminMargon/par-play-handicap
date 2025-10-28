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
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Calculator } from "lucide-react";

interface Course {
  id: string;
  name: string;
  holes: number;
  par: number;
  course_rating: number | null;
  slope_rating: number | null;
}

const AddScore = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);

  const [formData, setFormData] = useState({
    course_id: "",
    score: "",
    date: new Date().toISOString().split("T")[0],
  });

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

  const calculateHandicap = (score: number, course: Course) => {
    if (course.course_rating && course.slope_rating) {
      // WHS method
      const scoreDifferential = ((score - course.course_rating) * 113) / course.slope_rating;
      return {
        score_differential: Math.round(scoreDifferential * 100) / 100,
        simple_handicap: null,
      };
    } else {
      // Simple method
      const simpleHandicap = ((score - course.par) * 18) / course.holes;
      return {
        score_differential: null,
        simple_handicap: Math.round(simpleHandicap * 100) / 100,
      };
    }
  };

  const createScoreMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      if (!user) throw new Error("Not authenticated");
      
      const course = courses?.find(c => c.id === data.course_id);
      if (!course) throw new Error("Course not found");

      const handicapData = calculateHandicap(parseInt(data.score), course);

      const scoreData = {
        user_id: user.id,
        course_id: data.course_id,
        score: parseInt(data.score),
        date: data.date,
        ...handicapData,
      };

      const { error } = await supabase.from("scores").insert(scoreData);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["scores"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
      toast({
        title: "Score registreret!",
        description: "Din score og handicap er nu gemt",
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.course_id || !formData.score) {
      toast({
        title: "Manglende information",
        description: "Vælg en bane og indtast din score",
        variant: "destructive",
      });
      return;
    }
    createScoreMutation.mutate(formData);
  };

  const selectedCourse = courses?.find(c => c.id === formData.course_id);
  const previewHandicap = selectedCourse && formData.score
    ? calculateHandicap(parseInt(formData.score), selectedCourse)
    : null;

  if (!session || !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Tilføj Score</h1>
            <p className="text-muted-foreground">Registrer din seneste runde</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Ny Score</CardTitle>
              <CardDescription>
                Udfyld oplysningerne om din runde
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="course">Golfbane</Label>
                  <Select
                    value={formData.course_id}
                    onValueChange={(value) => setFormData({ ...formData, course_id: value })}
                  >
                    <SelectTrigger id="course">
                      <SelectValue placeholder="Vælg en bane" />
                    </SelectTrigger>
                    <SelectContent>
                      {courses && courses.length > 0 ? (
                        courses.map((course) => (
                          <SelectItem key={course.id} value={course.id}>
                            {course.name} ({course.holes} huller, par {course.par})
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="none" disabled>
                          Ingen baner tilgængelige
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  {courses && courses.length === 0 && (
                    <p className="text-sm text-muted-foreground">
                      Du skal først tilføje en bane under "Baner"
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="score">Samlet score (antal slag)</Label>
                  <Input
                    id="score"
                    type="number"
                    min="1"
                    value={formData.score}
                    onChange={(e) => setFormData({ ...formData, score: e.target.value })}
                    placeholder="F.eks. 85"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date">Dato</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                  />
                </div>

                {previewHandicap && (
                  <Card className="bg-accent/50">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Calculator className="h-4 w-4" />
                        Beregnet Handicap
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {previewHandicap.simple_handicap ?? previewHandicap.score_differential}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {selectedCourse?.course_rating && selectedCourse?.slope_rating
                          ? "Beregnet med WHS metode"
                          : "Beregnet med simpel metode"}
                      </p>
                    </CardContent>
                  </Card>
                )}

                <div className="flex gap-2">
                  <Button
                    type="submit"
                    className="flex-1"
                    disabled={createScoreMutation.isPending || !courses || courses.length === 0}
                  >
                    {createScoreMutation.isPending ? "Gemmer..." : "Gem Score"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate("/dashboard")}
                  >
                    Annuller
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {selectedCourse && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-base">Om Beregningen</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-2">
                {selectedCourse.course_rating && selectedCourse.slope_rating ? (
                  <>
                    <p className="font-medium text-foreground">WHS (World Handicap System) Metode</p>
                    <p>
                      Denne bane har Course Rating ({selectedCourse.course_rating}) og Slope Rating ({selectedCourse.slope_rating}), 
                      så vi bruger den officielle WHS formel:
                    </p>
                    <p className="font-mono text-xs bg-muted p-2 rounded">
                      Score Differential = (Score - CR) × 113 / SR
                    </p>
                  </>
                ) : (
                  <>
                    <p className="font-medium text-foreground">Simpel Metode</p>
                    <p>
                      Denne bane har ikke Course/Slope Rating, så vi bruger en simpel skalering til 18 huller:
                    </p>
                    <p className="font-mono text-xs bg-muted p-2 rounded">
                      Handicap = (Score - Par) × 18 / Antal huller
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
};

export default AddScore;
