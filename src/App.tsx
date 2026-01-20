import { UploadForm } from "./components/document/uploadForm/UploadForm";

function App() {
  return (
    <div className="flex-1 flex flex-col justify-center px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Upload Document</h1>

      <UploadForm />
    </div>
  );
}

export default App
