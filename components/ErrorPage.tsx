export default function ErrorPage() {
  return (
    <div className="flex items-center justify-center min-h-screen px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
        <div className="text-5xl mb-4">&#9888;</div>
        <h1 className="text-2xl font-semibold text-gray-900 mb-3">
          Invalid Access
        </h1>
        <p className="text-gray-600 leading-relaxed">
          This study requires a valid participant link. Please use the URL
          provided to you, which should include your participant ID.
        </p>
        <p className="text-gray-400 text-sm mt-6">
          Expected format:{" "}
          <code className="bg-gray-100 px-2 py-0.5 rounded text-xs">
            ?participant_id=YOUR_ID
          </code>
        </p>
      </div>
    </div>
  );
}
