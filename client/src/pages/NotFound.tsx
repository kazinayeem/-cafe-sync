export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-red-50 dark:bg-gray-900 px-4 text-center">
      <h1 className="text-5xl font-extrabold text-red-600 dark:text-red-400 mb-4">
        404
      </h1>
      <p className="text-lg text-gray-700 dark:text-gray-300 mb-2">
        Oops! The page you're looking for doesn't exist.
      </p>
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Please check the URL or return to the homepage.
      </p>
    </div>
  );
}
