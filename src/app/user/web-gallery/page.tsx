// app/(dashboard)/page.tsx
import { Layout } from "@/components/layout/layout";
import WebGallery from "@/components/ui/web-gallery/WebGallery";

export default function HomePage() {
  return (
    <Layout videoSrc="/love_background.mp4">
      <WebGallery />
    </Layout>
  );
}
