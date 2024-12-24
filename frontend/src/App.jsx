import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [channelName, setChannelName] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchChannel("676afeedb783b21417c73bda");
  }, []);

  async function fetchChannel(id) {
    const res = await fetch(`/api/v1/channels/${id}`);
    const json = await res.json();
    console.log(json);

    setChannelName(json.data.title);
    setLoading(false);
  }

  return <>{loading ? <h1>Loading...</h1> : <h1>{channelName}</h1>}</>;
}

export default App;
