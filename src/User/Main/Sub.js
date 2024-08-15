import { useState } from "react";
import { useParams } from "react-router-dom";

export default function Sub() {
  const { no } = useParams();
  const [character, setCharacter] = useState([]);
  const [style, setStyle] = useState([]);
  const [item, setItem] = useState([]);
  const [scrap, setScrap] = useState([]);

  return (
    <>
      <div></div>
    </>
  );
}
