import SearchArea from './components/SearchBox';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <h1 className="text-4xl font-bold mb-8 text-gray-800">DJ-Khaled Reactionator</h1>
      <p className="text-lg text-gray-600 mb-6 text-center">
        Start typing about how are you feeling or what situation you are in and get the ideal gif of DJ-Khaled
      </p>
      <div className="w-8/12">
        <SearchArea />
      </div>
    </div>
  );
}
