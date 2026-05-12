import { getProgress } from "./actions";
import StudyFlow from "@/components/StudyFlow";
import ErrorPage from "@/components/ErrorPage";

interface PageProps {
  searchParams: Promise<{ participant_id?: string }>;
}

export default async function Page({ searchParams }: PageProps) {
  const { participant_id } = await searchParams;

  if (!participant_id) {
    return <ErrorPage />;
  }

  const progress = await getProgress(participant_id);

  return (
    <StudyFlow participantId={participant_id} initialProgress={progress} />
  );
}
