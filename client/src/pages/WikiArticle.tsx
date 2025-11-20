import { useRoute } from "wouter";
import WikiPage from "@/components/WikiPage";

export default function WikiArticle() {
  const [, params] = useRoute("/topics/:topicId/wiki/:id");
  
  if (!params?.id || !params?.topicId) {
    return null;
  }

  return <WikiPage pageId={params.id} topicId={params.topicId} />;
}
