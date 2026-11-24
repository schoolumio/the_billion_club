"use client";
import { startTransition, type FormEvent } from "react";

/**
 * React 19 resets uncontrolled forms after every action, which wipes what a
 * person typed when validation fails. Submitting through this handler keeps
 * their input, includes the clicked submit button, and still works without
 * JavaScript because the form keeps its `action` for progressive enhancement.
 */
export function keepValues(dispatch: (fd: FormData) => void) {
  return (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget, (e.nativeEvent as SubmitEvent).submitter as HTMLElement | null);
    startTransition(() => dispatch(fd));
  };
}
