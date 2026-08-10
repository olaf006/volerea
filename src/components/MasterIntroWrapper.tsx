"use client";

import { useState } from "react";
import IntroVideo from "@/components/IntroVideo";

export default function MasterIntroWrapper({
  showIntro,
  children,
}: {
  showIntro: boolean;
  children: React.ReactNode;
}) {
  const [done, setDone] = useState(!showIntro);

  if (!done) {
    return <IntroVideo onFinished={() => setDone(true)} />;
  }

  return <>{children}</>;
}
