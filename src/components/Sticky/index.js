import React, { Component, createRef } from "react";
import PropTypes from "prop-types";

import styles from "./index.module.css";

export default class Sticky extends Component {
  placeholder = createRef();
  content = createRef();

  handleScroll = () => {
    const placeholderEl = this.placeholder.current;
    const contentEl = this.content.current;
    const { height } = this.props;

    const { top } = placeholderEl.getBoundingClientRect();
    if (top < 0) {
      contentEl.classList.add(styles.fixed);
      placeholderEl.style.height = `${height}px`;
    } else {
      contentEl.classList.remove(styles.fixed);
      placeholderEl.style.height = "0px";
    }
  };

  componentDidMount() {
    window.addEventListener("scroll", this.handleScroll);
  }

  componentWillUnmount() {
    window.removeEventListener("scroll", this.handleScroll);
  }

  render() {
    return (
      <div>
        <div ref={this.placeholder} />
        <div ref={this.content}>{this.props.children}</div>
      </div>
    );
  }
}

Sticky.propTypes = {
  height: PropTypes.number.isRequired,
};
