import { useRoute } from "wouter";
import WikiPage from "@/components/WikiPage";

export default function WikiArticle() {
  const [, params] = useRoute("/wiki/:id");
  
  if (!params?.id) {
    return null;
  }

  return <WikiPage pageId={params.id} />;
}
