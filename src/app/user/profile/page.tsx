import { Layout } from "@/components/layout/layout";

export default function ProfilePage() {
  return (
    <Layout videoSrc="/love_background.mp4">
      <div className="content-card-light dark:content-card-dark rounded-lg p-6 shadow-2xl">
        <h1 className="text-3xl font-bold text-white dark:text-slate-100 mb-4">
          Profile
        </h1>
        <div className="space-y-4">
          <div className="bg-slate-800/50 rounded-lg p-4">
            <h2 className="text-xl font-semibold text-pink-300 mb-2">
              Personal Information
            </h2>
            <div className="text-slate-300 space-y-2">
              <p><span className="font-medium">Name:</span> Your Love</p>
              <p><span className="font-medium">Email:</span> love@memory.com</p>
              <p><span className="font-medium">Created:</span> January 2024</p>
            </div>
          </div>
          
          <div className="bg-slate-800/50 rounded-lg p-4">
            <h2 className="text-xl font-semibold text-pink-300 mb-2">
              Statistics
            </h2>
            <div className="text-slate-300 space-y-2">
              <p><span className="font-medium">Total Photos:</span> 127</p>
              <p><span className="font-medium">Favorite Photos:</span> 23</p>
              <p><span className="font-medium">Albums Created:</span> 5</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
