import { useEffect } from "react";
import { useLocation } from "react-router-dom";

interface MetaProps {
  title: string;
  description?: string;
}

// Custom hook to update page title and description
export default function usePageMeta({ title, description }: MetaProps) {
  const location = useLocation();

  useEffect(() => {
    document.title = `${title} | Task Tracker`;

    // Create meta description if not present
    if (description) {
      let metaDesc = document.querySelector('meta[name="description"]');

      if (!metaDesc) {
        metaDesc = document.createElement("meta");
        metaDesc.setAttribute("name", "description");
        document.head.appendChild(metaDesc);
      }

      metaDesc.setAttribute("content", description);
    }
  }, [title, description, location.pathname]);
}
