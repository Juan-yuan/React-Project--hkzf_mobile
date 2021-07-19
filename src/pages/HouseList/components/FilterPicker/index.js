import React, { Component } from "react";

import { PickerView } from "antd-mobile";

import FilterFooter from "../../../../components/FilterFooter";

export default class FilterPicker extends Component {
  state = {
    value: this.props.defaultValue,
  };
  render() {
    const { onCancel, onSave, data, cols, type } = this.props;
    const { value } = this.state;
    return (
      <>
        <PickerView
          data={data}
          value={value}
          cols={cols}
          onChange={(val) => {
            this.setState({
              value: val,
            });
          }}
        />

        <FilterFooter
          onCancel={() => onCancel(type)}
          onOk={() => onSave(type, value)}
        />
      </>
    );
  }
}
