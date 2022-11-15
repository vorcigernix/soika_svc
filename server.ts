import { serve } from "https://deno.land/std/http/mod.ts";

const header = { "Content-type": "app/json" };
function logError(msg: string) {
  console.log(msg);
  Deno.exit(1);
}
function handleConnected() {
  console.log("Client connected");
}

async function handleMessage(ws: WebSocket, data: string) {
  //client needs to send this token, should be improved
  if (data != "MDEyOk9yZ2FuaXphdGlvbjQyMDQ4OTE1") {
    console.log("bad token");
    return ws.close();
  }

  ws.send(JSON.stringify({ transmission: "first" }));
  const responseOne = await fetch("https://api.github.com/users/denoland");
  let txData = await responseOne.json();
  ws.send(JSON.stringify(txData));
  const responsePrompter = await fetch(
    "https://api.chainprompter.com/chainId/1/txData",
    {
      method: "POST",
      body: JSON.stringify({
        "to": "0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45",
        "data":
          "0x5ae401dc000000000000000000000000000000000000000000000000000000006370b5b700000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000e404e45aaf000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc20000000000000000000000006b175474e89094c44da98b954eedeac495271d0f00000000000000000000000000000000000000000000000000000000000001f40000000000000000000000007c37d94a2ab4a7d6abb1df19d3be6c6629b554cb000000000000000000000000000000000000000000000000016345785d8a0000000000000000000000000000000000000000000000000006b50027a13825ca7d000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
      }),
    },
  );
  txData = await responsePrompter.text();
  ws.send(JSON.stringify(txData));
  ws.send(JSON.stringify({ transmission: "last" }));
  return ws.close();
}
function handleError(e: Event | ErrorEvent) {
  console.log(e instanceof ErrorEvent ? e.message : e.type);
}
function reqHandler(req: Request) {
  if (req.headers.get("upgrade") != "websocket") {
    return new Response(null, { status: 501 });
  }
  const { socket: ws, response } = Deno.upgradeWebSocket(req);
  ws.onopen = () => handleConnected();
  ws.onmessage = (m) => handleMessage(ws, m.data);
  ws.onclose = () => logError("Disconnected from client ...");
  ws.onerror = (e) => handleError(e);
  return response;
}
console.log("Waiting for client ...");
serve(reqHandler, { port: 8000 });
