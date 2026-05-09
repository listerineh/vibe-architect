/**
 * Example Feature Component
 * 
 * This is a template for feature-based architecture.
 * Each feature should be self-contained with its own components, hooks, and logic.
 * 
 * Structure:
 * - features/
 *   - example/
 *     - ExampleFeature.jsx (main component)
 *     - hooks/ (feature-specific hooks)
 *     - components/ (feature-specific components)
 *     - utils.js (feature-specific utilities)
 */

export function ExampleFeature({ title = 'Example Feature' }) {
  return (
    <div className="p-6 border border-gray-200 rounded-lg">
      <h2 className="text-2xl font-bold mb-4">{title}</h2>
      <p className="text-gray-600">
        This is an example feature component. Replace this with your actual feature implementation.
      </p>
      <div className="mt-4 space-y-2">
        <p className="text-sm text-gray-500">
          <strong>Tip:</strong> Organize related components, hooks, and utilities within this feature folder.
        </p>
        <p className="text-sm text-gray-500">
          <strong>Best Practice:</strong> Keep features independent and reusable across your application.
        </p>
      </div>
    </div>
  );
}
