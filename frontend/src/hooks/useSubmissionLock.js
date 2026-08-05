import { useCallback, useRef, useState } from "react";

// A ref is used in addition to state so two very quick clicks cannot start
// separate requests before React has had a chance to re-render the button.
export default function useSubmissionLock() {
  const lockedRef = useRef(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const run = useCallback(async (task) => {
    if (lockedRef.current) return;

    lockedRef.current = true;
    setIsSubmitting(true);
    try {
      return await task();
    } finally {
      lockedRef.current = false;
      setIsSubmitting(false);
    }
  }, []);

  return { isSubmitting, run };
}
