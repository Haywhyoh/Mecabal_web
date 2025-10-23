export default function ExampleCard() {
  return (
    <div className="max-w-sm mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="p-6">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-xl">T</span>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Tailwind CSS</h3>
            <p className="text-gray-600">Utility-first CSS framework</p>
          </div>
        </div>
        <div className="mt-4">
          <p className="text-gray-700">
            This card demonstrates various Tailwind CSS classes including:
          </p>
          <ul className="mt-2 space-y-1 text-sm text-gray-600">
            <li>• Responsive design (max-w-sm, mx-auto)</li>
            <li>• Background colors (bg-white, bg-blue-500)</li>
            <li>• Border radius (rounded-xl, rounded-full)</li>
            <li>• Shadows (shadow-lg)</li>
            <li>• Spacing (p-6, mt-4, space-x-4)</li>
            <li>• Typography (text-lg, font-semibold)</li>
          </ul>
        </div>
        <div className="mt-6 flex space-x-3">
          <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
            Primary
          </button>
          <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
            Secondary
          </button>
        </div>
      </div>
    </div>
  );
}
