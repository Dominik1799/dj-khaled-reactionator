import GifCardGrid from "../components/GifCardGrid";
import GifUpload from "../components/GifUpload";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-4">
      <h1 className="text-4xl font-bold mb-8 text-gray-800">
        DJ-Khaled Reactionator admin panel
      </h1>
      <GifUpload />

      <GifCardGrid />
    </div>
  );
}
