import React from "react";
import { Flex } from "antd-mobile";
import { withRouter } from "react-router-dom";
import PropTypes from "prop-types";
import styles from "./index.module.css";

function SearchHeader({ history, cityName, className }) {
  return (
    <Flex className={className || styles.searchBox}>
      <Flex className={styles.search}>
        <div
          className={styles.location}
          onClick={() => history.push("/citylist")}
        >
          <span className={styles.name}>{cityName}</span>
          <i className="iconfont icon-arrow" />
        </div>

        <div className={styles.form} onClick={() => history.push("/search")}>
          <i className="iconfont icon-seach" />
          <span className={styles.text}>请输入小区或地址</span>
        </div>
      </Flex>
      <i className="iconfont icon-map" onClick={() => history.push("/map")} />
    </Flex>
  );
}

SearchHeader.propTypes = {
  cityName: PropTypes.string.isRequired,
  className: PropTypes.string,
};

export default withRouter(SearchHeader);
