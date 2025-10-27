export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-500 via-red-500 to-pink-600 flex items-center justify-center">
      <div className="text-center space-y-6">
        <div className="flex justify-center mb-8">
          <div className="text-9xl animate-pulse">
            🏃‍♂️
          </div>
        </div>
        <div className="space-y-4">
          <h1 className="text-5xl md:text-6xl font-bold text-white drop-shadow-2xl tracking-tight">
            GoFast Dashboard
          </h1>
          <p className="text-xl md:text-2xl text-white/90 font-medium drop-shadow-lg max-w-md mx-auto">
            Loading your data...
          </p>
        </div>
      </div>
    </div>
  );
}
