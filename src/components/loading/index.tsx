export function Loading() {
  return (
    <div className="h-full flex items-center justify-center flex-col text-center">
      <div className="flex gap-2 mt-4">
        <span className="w-2 h-2 rounded-full bg-sky-500 animate-jump [animation-delay:0.2s]"></span>
        <span className="w-2 h-2 rounded-full bg-red-500 animate-jump [animation-delay:0.4s]"></span>
        <span className="w-2 h-2 rounded-full bg-yellow-500 animate-jump [animation-delay:0.6s]"></span>
        <span className="w-2 h-2 rounded-full bg-blue-500 animate-jump [animation-delay:0.8s]"></span>
      </div>
    </div>
  );
}
