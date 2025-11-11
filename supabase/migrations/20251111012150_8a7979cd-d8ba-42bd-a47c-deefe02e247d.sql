-- Fix missing INSERT policy on profiles table
CREATE POLICY "Users can insert their own profile"
ON public.profiles 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = id);