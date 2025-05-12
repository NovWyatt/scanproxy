export default function handler(req, res) {
  // Danh sách các nguồn proxy công khai
  const sources = [
    {
      name: "Free-Proxy-List.net (HTTPS)",
      url: "https://free-proxy-list.net/",
      id: 1,
    },
    {
      name: "SSLProxies.org (HTTPS)",
      url: "https://www.sslproxies.org/",
      id: 2,
    },
    { name: "US Proxy List", url: "https://www.us-proxy.org/", id: 3 },
    {
      name: "UK Proxy List",
      url: "https://free-proxy-list.net/uk-proxy.html",
      id: 4,
    },
    {
      name: "Proxy-List.download (HTTPS API)",
      url: "https://www.proxy-list.download/api/v1/get?type=https",
      id: 5,
    },
    {
      name: "Proxy-List.download (HTTP API)",
      url: "https://www.proxy-list.download/api/v1/get?type=http",
      id: 6,
    },
    {
      name: "TheSpeedX Github (HTTP)",
      url: "https://raw.githubusercontent.com/TheSpeedX/PROXY-List/master/http.txt",
      id: 7,
    },
    {
      name: "ShiftyTR Github (HTTPS)",
      url: "https://raw.githubusercontent.com/ShiftyTR/Proxy-List/master/https.txt",
      id: 8,
    },
    {
      name: "Monosans Github",
      url: "https://raw.githubusercontent.com/monosans/proxy-list/main/proxies/http.txt",
      id: 9,
    },
    {
      name: "HyperBeats Github",
      url: "https://raw.githubusercontent.com/hyperbeats/proxy-list/main/https.txt",
      id: 10,
    },
  ];

  res.status(200).json(sources);
}
