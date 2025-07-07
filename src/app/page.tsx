// app/(dashboard)/page.tsx
import { Layout } from "@/components/layout/layout";
import { ImageGroupsProvider } from "@/components/providers/ImageGroupsContext";
import ImageGallery from "@/components/ui/image-gallery/ImageGallery";

export default function HomePage() {
  return (
    <ImageGroupsProvider>
      <Layout videoSrc="/love_background.mp4">
        <ImageGallery />
      </Layout>
    </ImageGroupsProvider>
  );
}
