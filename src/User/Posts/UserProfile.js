import axios from "axios";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

export default function UserProfile() {
  const [userData, setUserData] = useState([]);
  const [followeeData, setFolloweeData] = useState([]);
  const [followerData, setFollowerData] = useState([]);
  const { no } = useParams();

  useEffect(() => {
    userInfo();
    followInfo();
  }, [no]);

  const userInfo = () => {
    axios
      .get(`/posts/user/${no}`)
      .then((res) => setUserData(res.data))
      .catch((err) => console.log(err));
  };

  const followInfo = () => {
    axios
      .get(`/posts/user/follow/${no}`)
      .then((res) => {
        setFolloweeData(res.data.followeeList);
        setFollowerData(res.data.followerList);
      })
      .catch((err) => {
        console.log(err);
      });
  };
  return (
    <div>
      {userData.no}
      <div>
        팔로우{" "}
        <Link
          to={`/user/style/posts/${no}/followList/followee`}
          onClick={followInfo}
        >
          {followeeData.length}
        </Link>
        &emsp; 팔로워{" "}
        <Link
          to={`/user/style/posts/${no}/followList/follower`}
          onClick={followInfo}
        >
          {followerData.length}
        </Link>
      </div>
    </div>
  );
}
