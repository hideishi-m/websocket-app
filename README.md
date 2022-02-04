# websocketのリバプロをテストするためのアプリ

## 使い方

```
npm install
npm start [key cert]
```

0.0.0.0:8080でlistenするようになるので、

```
pst init --reverseproxy http://127.0.0.1:8080 --websocket
```

でリバプロして、 http://FQDN/ か https://FQDN/ でアクセスする


key certを指定した場合はHTTPSで動作する。

0.0.0.0:8443でlistenするようになるので、

```
pst init --reverseproxy https://127.0.0.1:8443 --websocket
```

でリバプロして、 http://FQDN/ か https://FQDN/ でアクセスする

