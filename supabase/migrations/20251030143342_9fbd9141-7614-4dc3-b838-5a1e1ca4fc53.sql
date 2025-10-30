-- Create table for active/in-progress rounds
CREATE TABLE public.active_rounds (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  course_id UUID NOT NULL,
  course_name TEXT NOT NULL,
  course_holes INTEGER NOT NULL,
  course_par INTEGER NOT NULL,
  hole_scores JSONB NOT NULL DEFAULT '[]'::jsonb,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.active_rounds ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view own active rounds" 
ON public.active_rounds 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own active rounds" 
ON public.active_rounds 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own active rounds" 
ON public.active_rounds 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own active rounds" 
ON public.active_rounds 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_active_rounds_updated_at
BEFORE UPDATE ON public.active_rounds
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();