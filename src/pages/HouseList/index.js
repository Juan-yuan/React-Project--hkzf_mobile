import React from "react";
import { Flex, Toast } from "antd-mobile";
import {
  List,
  AutoSizer,
  WindowScroller,
  InfiniteLoader,
} from "react-virtualized";
import SearchHeader from "../../components/SearchHeader";
import Filter from "./components/Filter";
import { API } from "../../utils/api";
import HouseItem from "../../components/HouseItem";
import NoHouse from "../../components/NoHouse";
import Sticky from "../../components/Sticky";
import { getCurrentCity } from "../../utils";
import { BASE_URL } from "../../utils/url";
import styles from "./index.module.css";

export default class HouseList extends React.Component {
  state = {
    list: [],
    count: 0,
    isLoading: false,
  };

  label = "";
  value = "";

  filters = {};

  async componentDidMount() {
    this.searchHouseList();
    const { label, value } = await getCurrentCity();
    this.label = label;
    this.value = value;
  }

  async searchHouseList() {
    this.setState({
      isLoading: true,
    });
    //get current city
    Toast.loading("加载中...", 0, null, false);
    const res = await API.get("/houses", {
      params: {
        cityId: this.value,
        ...this.filters,
        start: 1,
        end: 20,
      },
    });
    const { list, count } = res.data.body;
    Toast.hide();
    if (count !== 0) {
      Toast.info(`共找到${count}套房源`, 2, null, false);
    }
    this.setState({
      list,
      count,
      isLoading: false,
    });
  }

  onFilter = (filters) => {
    window.scrollTo(0, 0);
    this.filters = filters;
    this.searchHouseList();
  };

  renderHouseList = ({ key, index, style }) => {
    const { list } = this.state;
    const house = list[index];
    if (!house) {
      return (
        <div key={key} style={style}>
          <p className={styles.loading} />
        </div>
      );
    }
    return (
      <HouseItem
        key={key}
        style={style}
        src={BASE_URL + house.houseImg}
        title={house.title}
        desc={house.desc}
        tags={house.tags}
        price={house.price}
        onClick={() => this.props.history.push(`/detail/${house.houseCode}`)}
      ></HouseItem>
    );
  };

  isRowLoaded = ({ index }) => {
    return !!this.state.list[index];
  };

  loadMoreRows = ({ startIndex, stopIndex }) => {
    //console.log(startIndex, stopIndex);
    return new Promise((resolve) => {
      API.get("/houses", {
        params: {
          cityId: this.value,
          ...this.filters,
          start: startIndex,
          end: stopIndex,
        },
      }).then((res) => {
        this.setState({
          list: [...this.state.list, ...res.data.body.list],
        });
        resolve();
      });
    });
  };

  renderList() {
    const { count, isLoading } = this.state;
    if (count == 0 && !isLoading) {
      return <NoHouse>没有找到房源，请您换个搜索条件吧~</NoHouse>;
    }

    return (
      <InfiniteLoader
        isRowLoaded={this.isRowLoaded}
        loadMoreRows={this.loadMoreRows}
        rowCount={count}
      >
        {({ onRowsRendered, registerChild }) => (
          <WindowScroller>
            {({ height, isScrolling, scrollTop }) => (
              <AutoSizer>
                {({ width }) => (
                  <List
                    onRowsRendered={onRowsRendered}
                    ref={registerChild}
                    autoHeight
                    width={width}
                    height={height}
                    rowCount={count}
                    rowHeight={120}
                    rowRenderer={this.renderHouseList}
                    isScrolling={isScrolling}
                    scrollTop={scrollTop}
                  />
                )}
              </AutoSizer>
            )}
          </WindowScroller>
        )}
      </InfiniteLoader>
    );
  }
  render() {
    const { count } = this.state;
    return (
      <div>
        <Flex className={styles.header}>
          <i
            className="iconfont icon-back"
            onClick={() => this.props.history.go(-1)}
          ></i>
          <SearchHeader cityName={this.label} className={styles.searchHeader} />
        </Flex>

        <Sticky height={40}>
          <Filter onFilter={this.onFilter} />
        </Sticky>

        <div className={styles.houseItems}>{this.renderList()}</div>
      </div>
    );
  }
}
