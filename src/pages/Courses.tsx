import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Edit } from "lucide-react";

interface Course {
  id: string;
  name: string;
  holes: number;
  par: number;
  course_rating: number | null;
  slope_rating: number | null;
}

const Courses = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    holes: 18,
    par: 72,
    course_rating: "",
    slope_rating: "",
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

  const { data: courses, isLoading } = useQuery({
    queryKey: ["courses", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Course[];
    },
    enabled: !!user,
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      if (!user) throw new Error("Not authenticated");
      
      const courseData = {
        user_id: user.id,
        name: data.name,
        holes: data.holes,
        par: data.par,
        course_rating: data.course_rating ? parseFloat(data.course_rating) : null,
        slope_rating: data.slope_rating ? parseInt(data.slope_rating) : null,
      };

      const { error } = await supabase.from("courses").insert(courseData);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      toast({ title: "Bane oprettet!", description: "Banen er nu tilføjet til din liste" });
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error: Error) => {
      toast({ title: "Fejl", description: error.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof formData }) => {
      const courseData = {
        name: data.name,
        holes: data.holes,
        par: data.par,
        course_rating: data.course_rating ? parseFloat(data.course_rating) : null,
        slope_rating: data.slope_rating ? parseInt(data.slope_rating) : null,
      };

      const { error } = await supabase.from("courses").update(courseData).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      toast({ title: "Bane opdateret!", description: "Ændringerne er gemt" });
      setIsDialogOpen(false);
      setEditingCourse(null);
      resetForm();
    },
    onError: (error: Error) => {
      toast({ title: "Fejl", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("courses").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      toast({ title: "Bane slettet", description: "Banen er fjernet fra din liste" });
    },
    onError: (error: Error) => {
      toast({ title: "Fejl", description: error.message, variant: "destructive" });
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      holes: 18,
      par: 72,
      course_rating: "",
      slope_rating: "",
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCourse) {
      updateMutation.mutate({ id: editingCourse.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (course: Course) => {
    setEditingCourse(course);
    setFormData({
      name: course.name,
      holes: course.holes,
      par: course.par,
      course_rating: course.course_rating?.toString() || "",
      slope_rating: course.slope_rating?.toString() || "",
    });
    setIsDialogOpen(true);
  };

  const handleDialogChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      setEditingCourse(null);
      resetForm();
    }
  };

  if (!session || !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Mine Baner</h1>
            <p className="text-muted-foreground">Administrer dine golfbaner</p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={handleDialogChange}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Tilføj Bane
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingCourse ? "Rediger Bane" : "Tilføj Ny Bane"}
                </DialogTitle>
                <DialogDescription>
                  Indtast oplysninger om golfbanen
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Banens navn</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="holes">Antal huller</Label>
                    <Input
                      id="holes"
                      type="number"
                      min="1"
                      value={formData.holes}
                      onChange={(e) => setFormData({ ...formData, holes: parseInt(e.target.value) })}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="par">Par</Label>
                    <Input
                      id="par"
                      type="number"
                      min="1"
                      value={formData.par}
                      onChange={(e) => setFormData({ ...formData, par: parseInt(e.target.value) })}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="course_rating">Course Rating (valgfri)</Label>
                  <Input
                    id="course_rating"
                    type="number"
                    step="0.1"
                    value={formData.course_rating}
                    onChange={(e) => setFormData({ ...formData, course_rating: e.target.value })}
                    placeholder="F.eks. 72.5"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="slope_rating">Slope Rating (valgfri)</Label>
                  <Input
                    id="slope_rating"
                    type="number"
                    min="55"
                    max="155"
                    value={formData.slope_rating}
                    onChange={(e) => setFormData({ ...formData, slope_rating: e.target.value })}
                    placeholder="F.eks. 113"
                  />
                </div>

                <div className="flex gap-2">
                  <Button type="submit" className="flex-1">
                    {editingCourse ? "Opdater" : "Opret"}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => handleDialogChange(false)}>
                    Annuller
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <p className="text-center text-muted-foreground py-8">Indlæser...</p>
        ) : courses && courses.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <Card key={course.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{course.name}</span>
                    <div className="flex gap-2">
                      <Button size="sm" variant="ghost" onClick={() => handleEdit(course)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteMutation.mutate(course.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </CardTitle>
                  <CardDescription>
                    {course.holes} huller · Par {course.par}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    {course.course_rating && (
                      <p className="text-muted-foreground">
                        <span className="font-medium">Course Rating:</span> {course.course_rating}
                      </p>
                    )}
                    {course.slope_rating && (
                      <p className="text-muted-foreground">
                        <span className="font-medium">Slope Rating:</span> {course.slope_rating}
                      </p>
                    )}
                    {!course.course_rating && !course.slope_rating && (
                      <p className="text-muted-foreground italic">
                        Ikke-rated bane (simpel beregning)
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground mb-4">
                Du har ikke tilføjet nogen baner endnu
              </p>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Tilføj din første bane
              </Button>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default Courses;
