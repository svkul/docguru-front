import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'

import { UploadForm } from "./components/document/uploadForm/UploadForm";

const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex-1 flex flex-col justify-center px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">Upload Document</h1>

        <UploadForm />
      </div>
    </QueryClientProvider>
  );
}

export default App
