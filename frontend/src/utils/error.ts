export function getErrorMessage(err: unknown): string {
  if (!err) return 'Unexpected error';
  if (err instanceof Error) return err.message;
  // axios-like error shape: err.response?.data?.error
  if (typeof err === 'object' && err !== null) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const e = err as any;
    if (e.response && e.response.data && typeof e.response.data.error === 'string') return e.response.data.error;
    if (typeof e.message === 'string') return e.message;
  }
  try {
    return String(err);
  } catch {
    return 'Unexpected error';
  }
}

export default getErrorMessage;
