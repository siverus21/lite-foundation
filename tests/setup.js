/** Unit-test environment tweaks (network stub as a fallback). */
globalThis.fetch = async () => new Response('', { status: 200 });
