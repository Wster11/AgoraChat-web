import offlineImg from "../assets/Offline.png";
import onlineIcon from "../assets/Online.png";
import busyIcon from "../assets/Busy.png";
import donotdisturbIcon from "../assets/Do_not_Disturb.png";
import customIcon from "../assets/custom.png";
import leaveIcon from "../assets/leave.png";

const presenceList = [
  {
    id: 1,
    title: "Online",
    checked: false,
    img: onlineIcon,
    subTitle: "Online"
  },
  {
    id: 100,
    title: "Busy",
    checked: false,
    img: busyIcon,
    subTitle: "Busy"
  },
  {
    id: 101,
    title: "Do Not Disturb",
    checked: false,
    img: donotdisturbIcon,
    subTitle: "Do Not Disturb"
  },
  {
    id: 102,
    title: "Away",
    checked: false,
    img: leaveIcon,
    subTitle: "Away"
  },
  {
    id: 103,
    title: "Custom Status",
    checked: false,
    img: customIcon,
    subTitle: "Custom Status"
  },
  {
    id: 0,
    title: "Offline",
    checked: false,
    img: offlineImg,
    subTitle: "Offline"
  }
];

const presenceStatus = presenceList.reduce((acc, cur) => {
  acc[cur.subTitle] = cur.img;
  return acc;
}, {});

export { presenceList, presenceStatus };
