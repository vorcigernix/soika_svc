To connect to service you need a token (contact me) and a websocket client. I am using [websocketking][wskinglink]. 
The first mesage to server needs to be a token in plain text form (just token, not token= or something like that).
Response is json, first is 
```
{
  "transmission": "first"
}
```
last is 
```
{
  "transmission": "last"
}
```
You should close the client connection after that.

[wskinglink]: https://websocketking.com/