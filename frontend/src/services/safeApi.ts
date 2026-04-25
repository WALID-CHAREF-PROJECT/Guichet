export async function safeFetchData<T>(apiCall: () => Promise<T>, fallbackData: T): Promise<T> {
  try {
    return await apiCall();
  } catch (error) {
    console.warn('Backend unavailable, using fallback', error);
    return fallbackData;
  }
}

export async function safeRun(apiCall: () => Promise<void>): Promise<void> {
  try {
    await apiCall();
  } catch (error) {
    console.warn('Backend unavailable, continuing with local state', error);
  }
}
