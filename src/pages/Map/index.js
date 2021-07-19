import React, { Component } from "react";
import { Link } from "react-router-dom";
import NavHeader from "../../components/NavHeader";
import { BASE_URL } from "../../utils/url";
import { API } from "../../utils/api";
import { Toast } from "antd-mobile";
import HouseItem from "../../components/HouseItem";
import styles from "./index.module.css";

const BMap = window.BMapGL;
const labelStyle = {
  cursor: "pointer",
  border: "0px solid rgb(255,0,0)",
  padding: "0px",
  whiteSpace: "nowrap",
  fontSize: "12px",
  color: "rgb(255,255,255)",
  textAlign: "center",
};
export default class Map extends Component {
  state = {
    housesList: [],
    isShowList: false,
  };
  componentDidMount() {
    this.initMap();
  }

  initMap() {
    const { label, value } = JSON.parse(localStorage.getItem("hkzf_city"));

    const map = new BMap.Map("container");
    this.map = map;
    const myGeo = new BMap.Geocoder();
    myGeo.getPoint(
      label,
      async (point) => {
        if (point) {
          map.centerAndZoom(point, 11);
          //map.addOverlay(new BMap.Marker(point));
          map.addControl(new BMap.NavigationControl());
          map.addControl(new BMap.ScaleControl());

          this.renderOverlays(value);
          /* const res = await axios.get(
            `http://localhost:8080/area/map?id=${value}`
          );
          res.data.body.forEach((item) => {
            const {
              label: areaName,
              count,
              value,
              coord: { longitude, latitude },
            } = item;

            const areaPoint = new BMap.Point(longitude, latitude);
            const label = new BMap.Label("", {
              position: areaPoint,
              offset: new BMap.Size(35, -35),
            });

            label.id = value;

            label.setContent(`
            <div class="${styles.bubble}">
              <p class="${styles.name}">${areaName}</p>
              <p>${count}套</p>
            </div>
            `);

            label.setStyle(labelStyle);
            label.addEventListener("click", () => {
              console.log("房源被点击了", label.id);
              map.centerAndZoom(areaPoint, 13);

              setTimeout(() => {
                map.clearOverlays();
              }, 0);
            });
            map.addOverlay(label);
          }); */
        }
      },
      label
    );
    map.addEventListener("movestart", () => {
      if (this.state.isShowList) {
        this.setState({
          isShowList: false,
        });
      }
    });
  }
  async renderOverlays(id) {
    try {
      Toast.loading("加载中...", 0, null, false);
      const res = await API.get(`/area/map?id=${id}`);
      const data = res.data.body;

      Toast.hide();
      const { nextZoom, type } = this.getTypeAndAoom();

      data.forEach((item) => {
        this.createOverlays(item, nextZoom, type);
      });
    } catch (e) {
      Toast.hide();
    }
  }

  getTypeAndAoom() {
    const zoom = this.map.getZoom();
    let nextZoom, type;

    if (zoom >= 10 && zoom < 12) {
      nextZoom = 13;
      type = "circle";
    } else if (zoom >= 12 && zoom < 14) {
      nextZoom = 15;
      type = "circle";
    } else if (zoom >= 14 && zoom < 16) {
      type = "rect";
    }

    return {
      nextZoom,
      type,
    };
  }

  createOverlays(data, zoom, type) {
    const {
      label: areaName,
      count,
      value,
      coord: { longitude, latitude },
    } = data;

    const areaPoint = new BMap.Point(longitude, latitude);
    if (type === "circle") {
      this.createCircle(areaPoint, areaName, count, value, zoom);
    } else {
      this.createRect(areaPoint, areaName, count, value);
    }
  }

  createCircle(point, name, count, id, zoom) {
    const label = new BMap.Label("", {
      position: point,
      offset: new BMap.Size(-35, -35),
    });

    label.id = id;

    label.setContent(`
    <div class="${styles.bubble}">
      <p class="${styles.name}">${name}</p>
      <p>${count}套</p>
    </div>
    `);

    label.setStyle(labelStyle);
    label.addEventListener("click", () => {
      this.renderOverlays(id);
      this.map.centerAndZoom(point, zoom);

      setTimeout(() => {
        this.map.clearOverlays();
      }, 0);
    });
    this.map.addOverlay(label);
  }

  createRect(point, name, count, id) {
    const label = new BMap.Label("", {
      position: point,
      offset: new BMap.Size(-50, -28),
    });

    label.id = id;

    label.setContent(`
    <div class="${styles.rect}">
      <span class="${styles.housename}">${name}</span>
      <span class="${styles.housenum}">${count}套</span>
      <i class="${styles.arrow}"></i>
    </div>
    `);

    label.setStyle(labelStyle);
    label.addEventListener("click", (e) => {
      this.getHousesList(id);
    });
    this.map.addOverlay(label);
  }

  async getHousesList(id) {
    try {
      Toast.loading("加载中...", 0, null, false);
      const res = await API.get(`/houses?cityId=${id}`);
      Toast.hide();
      this.setState({
        housesList: res.data.body.list,
        isShowList: true,
      });
    } catch (e) {
      Toast.hide();
    }
  }

  render() {
    return (
      <div className={styles.map}>
        <NavHeader>地图找房</NavHeader>
        <div className={styles.container} id="container" />

        <div
          className={[
            styles.houseList,
            this.state.isShowList ? styles.show : " ",
          ].join(" ")}
        >
          <div className={styles.titleWrap}>
            <h1 className={styles.listTitle}>房屋列表</h1>
            <Link className={styles.titleMore} to="/home/list">
              更多房源
            </Link>
          </div>

          <div className={styles.houseItems}>
            {this.state.housesList.map((item) => (
              <HouseItem
                key={item.houseCode}
                src={BASE_URL + item.houseImg}
                title={item.title}
                desc={item.desc}
                tags={item.tags}
                price={item.price}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }
}
