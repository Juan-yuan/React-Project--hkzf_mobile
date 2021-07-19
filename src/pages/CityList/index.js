import React from "react";
import { Toast } from "antd-mobile";
import axios from "axios";
import { getCurrentCity } from "../../utils";
import { List, AutoSizer } from "react-virtualized";
import NavHeader from "../../components/NavHeader";
import styles from "./index.module.css";
import "react-virtualized/styles.css";

const formatCityData = (list) => {
  const cityList = {};

  list.forEach((item) => {
    const first = item.short.substr(0, 1);
    //console.log(first);
    if (cityList[first]) {
      cityList[first].push(item);
    } else {
      cityList[first] = [item];
    }
  });

  const cityIndex = Object.keys(cityList).sort();

  return {
    cityList,
    cityIndex,
  };
};

const TITLE_HEIGHT = 36;
const NAME_HEIGH = 50;
const HOUSE_CITY = ["北京", "上海", "广州", "深圳"];

const formatCityIndex = (letter) => {
  switch (letter) {
    case "#":
      return "当前定位";
    case "hot":
      return "热门城市";
    default:
      return letter.toUpperCase("");
  }
};

export default class CityList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      cityList: {},
      cityIndex: [],
      activeIndex: 0,
    };
    this.cityListComponent = React.createRef();
  }

  async componentDidMount() {
    await this.getCityList();
    this.cityListComponent.current.measureAllRows();
  }

  changeCity({ label, value }) {
    if (HOUSE_CITY.indexOf(label) > -1) {
      localStorage.setItem("hkzf_city", JSON.stringify({ label, value }));
      this.props.history.go(-1);
    } else {
      Toast.info("该城市暂无房源", 1, null, false);
    }
  }

  rowRenderer = ({ key, index, isScrolling, isVisible, style }) => {
    const { cityIndex, cityList } = this.state;
    const letter = cityIndex[index];

    return (
      <div key={key} style={style} className={styles.city}>
        <div className={styles.title}>{formatCityIndex(letter)}</div>
        {cityList[letter].map((item) => (
          <div
            className={styles.name}
            key={item.value}
            onClick={() => this.changeCity(item)}
          >
            {item.label}
          </div>
        ))}
      </div>
    );
  };

  renderCityIndex() {
    const { cityIndex } = this.state;
    const { activeIndex } = this.state;
    return cityIndex.map((item, index) => (
      <li
        className={styles.city_index_item}
        key={item}
        onClick={() => {
          this.cityListComponent.current.scrollToRow(index);
        }}
      >
        <span className={activeIndex === index ? "index_active" : ""}>
          {item === "hot" ? "热" : item.toUpperCase()}
        </span>
      </li>
    ));
  }

  async getCityList() {
    const res = await axios.get("http://localhost:8080/area/city?level=1");
    //console.log(res);
    const { cityList, cityIndex } = formatCityData(res.data.body);

    const hotRes = await axios.get("http://localhost:8080/area/hot");
    cityList["hot"] = hotRes.data.body;
    cityIndex.unshift("hot");
    const curCity = await getCurrentCity();

    cityList["#"] = [curCity];
    cityIndex.unshift("#");
    //console.log(cityList, cityIndex, curCity);
    this.setState({
      cityList,
      cityIndex,
    });
  }

  getRowHeight = ({ index }) => {
    const { cityList, cityIndex } = this.state;
    return TITLE_HEIGHT + cityList[cityIndex[index]].length * NAME_HEIGH;
  };

  onRowsRendered = ({ startIndex }) => {
    console.log("startIndex", startIndex);
    if (this.state.activeIndex !== startIndex) {
      this.setState({
        activeIndex: startIndex,
      });
    }
  };

  render() {
    return (
      <div className={styles.city_list}>
        <NavHeader className={styles.new_bar}>城市选择</NavHeader>
        <AutoSizer>
          {({ width, height }) => (
            <List
              ref={this.cityListComponent}
              width={width}
              height={height}
              rowCount={this.state.cityIndex.length}
              rowHeight={this.getRowHeight}
              rowRenderer={this.rowRenderer}
              onRowsRendered={this.onRowsRendered}
              scrollToAlignment="start"
            />
          )}
        </AutoSizer>

        <ul className={styles.city_index}>{this.renderCityIndex()}</ul>
      </div>
    );
  }
}
