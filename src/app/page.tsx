import { Layout } from "@/components/layout/layout";
import ImageGallery from "@/components/ui/image-gallery/ImageGallery";

export default function HomePage() {
  return (
    <Layout videoSrc="/love_background.mp4">
      <ImageGallery />
    </Layout>
  );
}
