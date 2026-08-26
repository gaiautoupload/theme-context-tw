const baseUrl = process.env.VLLM_BASE_URL || "http://125.227.151.20:8003/v1";
const model = process.env.VLLM_MODEL_ID || "nvidia/nemotron-3-super";
export async function askVllm(prompt, { temperature = 0.2 } = {}) {
  const res = await fetch(`${baseUrl}/chat/completions`, { method: "POST", headers: { "content-type": "application/json", ...(process.env.VLLM_API_KEY ? { authorization: `Bearer ${process.env.VLLM_API_KEY}` } : {}) }, body: JSON.stringify({ model, temperature, messages: [{ role: "user", content: prompt }] }) });
  if (!res.ok) throw new Error(`vLLM ${res.status}: ${await res.text()}`);
  const json = await res.json(); return json.choices?.[0]?.message?.content || "";
}
