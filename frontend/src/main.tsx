import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import "./index.css";
import './css/navbar.css'
import App from "./App";
import { UserProvider } from "./contexts/UserContext";
import { ErrorBoundary } from 'react-error-boundary';

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

function ErrorFallback({ error, resetErrorBoundary }: {
  error: {message: string};
  resetErrorBoundary: any;
}) {
  return (
    <div role="alert">
      <pre>{error.message}</pre>
    </div>
  );
}

root.render(
  <ErrorBoundary FallbackComponent={ErrorFallback}>
    <UserProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </UserProvider>
  </ErrorBoundary>
);
