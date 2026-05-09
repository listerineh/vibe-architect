/**
 * Main App Component
 * 
 * Root component of the application.
 * Add your global providers and routing here.
 */

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-gray-900">
          Welcome to {{PROJECT_NAME}}
        </h1>
        <p className="mt-4 text-lg text-gray-600">
          {{PROJECT_DESCRIPTION}}
        </p>
        {/* TODO: Add your application content here */}
      </main>
    </div>
  )
}

export default App
