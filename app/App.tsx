import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

const App: React.FC = () => {
  const { pathname } = useLocation();
  const Comp = useLoadComponent(pathname);
  if (!Comp) return <p>Loading...</p>;
  return <Comp></Comp>;
};

export default App;

function useLoadComponent(path: string) {
  const [Comp, setComp] = useState<null | React.ComponentType>(null);

  useEffect(() => {
    const loadPath = getComponentLoadPath(path);
    console.log("loading", loadPath);
    import(`/proxy-module?path=${loadPath}`).then(({ default: def }) => {
      setComp(() => def);
    });
  }, [path]);

  return Comp;
}

function getComponentLoadPath(path: string) {
  let result = path.replace(/^\/workspace/, "/@content");
  return result;
}
