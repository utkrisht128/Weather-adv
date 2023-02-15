import { React, useState, useEffect } from "react";
import clock from "./Images/clock.png";
import { BsSearch } from "react-icons/bs";
import cloudyDay from "./Images/cloudy-day.png";
import haze from "./Images/haze.png";
import hot from "./Images/hot.png";
import humidity from "./Images/humidity.png";
import rainyDay from "./Images/rainy-day.png";
import schedule from "./Images/schedule.png";
import storm from "./Images/storm.png";
import sun from "./Images/sun (1).png";
import Sun from "./Images/sun.png";
import "./Weather.css";
function Weather() {
  const [input, setInput] = useState("");
  const [search, setSearch] = useState("Delhi");
  const [data, setData] = useState();
  const [id, setId] = useState();
  const [id2, setId2] = useState();
  const [id3, setId3] = useState();
  const [id4, setId4] = useState();
  const [id5, setId5] = useState();
  const [id6, setId6] = useState();
  const [id7, setId7] = useState();
  const [id8, setId8] = useState();
  var [date, setDate] = useState(new Date());
  const handleSubmit = (event) => {
    event.preventDefault();
    setSearch(input);
  };
  useEffect(() => {
    const fetchApi = async () => {
      const key = "e8db7504aa384624ef597dd163feb82f";
      let url = `https://api.openweathermap.org/data/2.5/forecast?q=${search}&units=metric&appid=${key}`;
      const response = await fetch(url);
      const resjson = await response.json();
      setData(resjson);
      console.log(resjson);
      setId(data.list[0].weather[0].id);
      setId2(data.list[1].weather[0].id);
      setId3(data.list[2].weather[0].id);
      setId4(data.list[3].weather[0].id);
      // setId5(data.list[4].weather[0].id);
      setId5(400);
      // setId6(data.list[5].weather[0].id);
      setId6(200);
      setId7(data.list[6].weather[0].id);
      setId8(data.list[7].weather[0].id);
    };
    fetchApi();
  }, [search]);

  useEffect(() => {
    var timer = setInterval(() => setDate(new Date()), 1000);
    return function cleanup() {
      clearInterval(timer);
    };
  });

  return (
    <>
      <section
        className={
          id > 800
            ? "body"
            : id >= 700 && id < 800
            ? "body"
            : id >= 600 && id < 700
            ? "body"
            : id >= 500 && id < 600
            ? "body2"
            : id >= 400 && id < 500
            ? "body2"
            : id >= 300 && id < 400
            ? "body3"
            : id >= 200 && id < 300
            ? "body4"
            : "body"
        }
      >
        <div className="header">
          {/* <h1>Weather</h1> */}
          <form onSubmit={handleSubmit} id="search-form">
            <input
              type="text"
              placeholder="Enter your City"
              id="search-input"
              onChange={(e) => setInput(e.target.value)}
            />
            <button type="submit" id="search-button">
              <BsSearch />
            </button>
          </form>
          <h3 className="loc">{data?.city.name}</h3>
        </div>
        <div id="main">
          <div
            className={
              id > 800
                ? "main-img"
                : id >= 700 && id < 800
                ? "main-img2"
                : id >= 600 && id < 700
                ? "main-img3"
                : id >= 500 && id < 600
                ? "main-img4"
                : id >= 400 && id < 500
                ? "main-img5"
                : id >= 300 && id < 400
                ? "main-img6"
                : id >= 200 && id < 300
                ? "main-img7"
                : "main-img"
            }
          ></div>
          <div id="main-info">
            <div className="stats">
              <img src={hot} alt="Loading" />
              <h4>Temperature:</h4>
              <h4 className="tempval">-</h4>
              <h4>{data?.list[0].main.temp} ℃ </h4>
            </div>
            <div className="stats">
              <img src={storm} alt="Loading" />
              <h4>Wind Speed:</h4>
              <h4 className="wspeed">-</h4>
              <h4>{data?.list[0].wind.speed}m/s</h4>
            </div>
            <div className="stats">
              <img src={humidity} alt="Loading" />
              <h4>Humdity:</h4>
              <h4 className="humid">-</h4>
              <h4>{data?.list[0].main.humidity}%</h4>
            </div>
            <div className="stats">
              <img src={schedule} alt="Loading" />
              <h4>Date:</h4>
              <h4 className="date">{date.toLocaleDateString()}</h4>
            </div>
            <div className="stats">
              <img src={clock} alt="Loading" />
              <h4>Time:</h4>
              <h4 className="time">{date.toLocaleTimeString()}</h4>
            </div>
          </div>
        </div>
        <div className="second-container">
          <div
            className={
              id2 > 800
                ? "days"
                : id2 >= 700 && id2 < 800
                ? "days2"
                : id2 >= 600 && id2 < 700
                ? "days3"
                : id2 >= 500 && id2 < 600
                ? "days4"
                : id2 >= 400 && id2 < 500
                ? "days5"
                : id2 >= 300 && id2 < 400
                ? "days6"
                : id2 >= 200 && id2 < 300
                ? "days7"
                : "days"
            }
          >
            <h4>{data?.list[1].main.temp} ℃</h4>
            <h5 className="dn">Tue</h5>
          </div>
          <div
            className={
              id3 > 800
                ? "days"
                : id3 >= 700 && id3 < 800
                ? "days2"
                : id3 >= 600 && id3 < 700
                ? "days3"
                : id3 >= 500 && id3 < 600
                ? "days4"
                : id3 >= 400 && id3 < 500
                ? "days5"
                : id3 >= 300 && id3 < 400
                ? "days6"
                : id3 >= 200 && id3 < 300
                ? "days7"
                : "days"
            }
          >
            <h4>{data?.list[2].main.temp} ℃</h4>
            <h5 className="dn">Wed</h5>
          </div>
          <div
            className={
              id4 > 800
                ? "days"
                : id4 >= 700 && id4 < 800
                ? "days2"
                : id4 >= 600 && id4 < 700
                ? "days3"
                : id4 >= 500 && id4 < 600
                ? "days4"
                : id4 >= 400 && id4 < 500
                ? "days5"
                : id4 >= 300 && id4 < 400
                ? "days6"
                : id4 >= 200 && id4 < 300
                ? "days7"
                : "days"
            }
          >
            <h4>{data?.list[3].main.temp} ℃</h4>
            <h5 className="dn">Thur</h5>
          </div>
          <div
            className={
              id5 > 800
                ? "days"
                : id5 >= 700 && id5 < 800
                ? "days2"
                : id5 >= 600 && id5 < 700
                ? "days3"
                : id5 >= 500 && id5 < 600
                ? "days4"
                : id5 >= 400 && id5 < 500
                ? "days5"
                : id5 >= 300 && id5 < 400
                ? "days6"
                : id5 >= 200 && id5 < 300
                ? "days7"
                : "days"
            }
          >
            <h4>{data?.list[4].main.temp} ℃</h4>
            <h5 className="dn">Fri</h5>
          </div>
          <div
            className={
              id6 > 800
                ? "days"
                : id6 >= 700 && id6 < 800
                ? "days2"
                : id6 >= 600 && id6 < 700
                ? "days3"
                : id6 >= 500 && id6 < 600
                ? "days4"
                : id6 >= 400 && id6 < 500
                ? "days5"
                : id6 >= 300 && id6 < 400
                ? "days6"
                : id6 >= 200 && id6 < 300
                ? "days7"
                : "days"
            }
          >
            <h4>{data?.list[5].main.temp} ℃</h4>
            <h5 className="dn">Sat</h5>
          </div>
          <div
            className={
              id7 > 800
                ? "days"
                : id7 >= 700 && id7 < 800
                ? "days2"
                : id7 >= 600 && id7 < 700
                ? "days3"
                : id7 >= 500 && id7 < 600
                ? "days4"
                : id7 >= 400 && id7 < 500
                ? "days5"
                : id7 >= 300 && id7 < 400
                ? "days6"
                : id7 >= 200 && id7 < 300
                ? "days7"
                : "days"
            }
          >
            <h4>{data?.list[6].main.temp} ℃</h4>
            <h5 className="dn">Sun</h5>
          </div>
          <div
            className={
              id8 > 800
                ? "days"
                : id8 >= 700 && id8 < 800
                ? "days2"
                : id8 >= 600 && id8 < 700
                ? "days3"
                : id8 >= 500 && id8 < 600
                ? "days4"
                : id8 >= 400 && id8 < 500
                ? "days5"
                : id8 >= 300 && id8 < 400
                ? "days6"
                : id8 >= 200 && id8 < 300
                ? "days7"
                : "days"
            }
          >
            <h4>{data?.list[7].main.temp} ℃</h4>
            <h5 className="dn">Mon</h5>
          </div>
        </div>
      </section>
    </>
  );
}

export default Weather;
