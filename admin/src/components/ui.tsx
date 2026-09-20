import { useState } from "react";
export function Status({
  error,
  message,
}: {
  error?: string;
  message?: string;
}) {
  return (
    <>
      {error && (
        <p role="alert" className="error">
          {error}
        </p>
      )}
      {message && (
        <p role="status" className="success">
          {message}
        </p>
      )}
    </>
  );
}
export function useAction() {
  const [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [message, setMessage] = useState("");
  async function run(action: () => Promise<void>, success = "Changes saved.") {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      await action();
      setMessage(success);
    } catch (e) {
      console.error(e);
      setError(
        "We couldn't complete this request. Please try again. If it continues, sign in again.",
      );
    } finally {
      setBusy(false);
    }
  }
  return { busy, error, message, run, setError };
}
