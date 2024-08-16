import axios from "axios";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

export default function Scrap() {
  const { no } = useParams();
  const [scrapList, setScrapList] = useState([]);

  const refresh = () => {
    getScrapList();
  };

  const getScrapList = () => {
    axios
      .get(`/myScrapPage/${no}`)
      .then((res) => setScrapList(res.data))
      .catch((err) => {
        console.log(err);
      });
  };

  useEffect(() => {
    refresh();
  }, []);

  return (
    <div>
      {scrapList.map((sl) => (
        <div key={sl.no}>
          <Link to={`/user/main/sub/${sl.no}`}>
            {sl.name}
            {sl.pic}
          </Link>
        </div>
      ))}
    </div>
  );
}
