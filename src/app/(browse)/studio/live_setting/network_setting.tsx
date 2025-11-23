import React, { useEffect, useState } from "react";

const NetworkSetting = () => {
  const [stats, setStats] = useState({
    packet_loss: 0,
    participants: 0,
    live_time: 0,
    rtt: 0,
    bitrat_mbps: 0,
  });

  useEffect(() => {});
  return <div>NetworkSetting</div>;
};

export default NetworkSetting;
