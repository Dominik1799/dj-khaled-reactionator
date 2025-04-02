import GifUpdateCard from "./GifUpdateCard";

export default function GifCardGrid() {
  return (
    <div className="grid grid-cols-2 gap-8 w-full max-w-5xl mx-auto">
        <GifUpdateCard id={1}></GifUpdateCard>
        <GifUpdateCard id={2}></GifUpdateCard>
      </div>
  );
}