const SUBMIT_URL = 'https://script.google.com/macros/s/AKfycbxRPelLVCK1V9UnsCZ0_H82Tsx9qy3dQ7-9Hdz-3WfjQ6Ga6B6xg6oon1GPOF_klAnD/exec'
const SUBMIT_TIMEOUT_MS = 45_000

export async function submitTracingPdf(studentName: string, assignmentName: string, pdfData: string): Promise<boolean> {
  console.log(`[tracing submit] payload size: ${(pdfData.length / 1024).toFixed(0)} KB`)

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), SUBMIT_TIMEOUT_MS)

  try {
    const response = await fetch(SUBMIT_URL, {
      method: 'POST',
      // text/plain avoids a CORS preflight request against Apps Script.
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ studentName, assignmentName, pdfData }),
      signal: controller.signal,
    })

    const result = await response.json().catch((error) => {
      console.error('[tracing submit] response was not valid JSON', error)
      return null
    })
    console.log('[tracing submit] response', result)
    return result?.status === 'success'
  } catch (error) {
    if (controller.signal.aborted) {
      throw new Error(`Submission timed out after ${SUBMIT_TIMEOUT_MS / 1000}s (payload may be too large, or the network is blocking the request).`)
    }
    console.error('[tracing submit] fetch failed', error)
    throw error
  } finally {
    clearTimeout(timeout)
  }
}
