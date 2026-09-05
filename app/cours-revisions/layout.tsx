import CourseProgressTracker from "@/components/CourseProgressTracker";

export default function CoursRevisionsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <CourseProgressTracker />
    </>
  );
}
