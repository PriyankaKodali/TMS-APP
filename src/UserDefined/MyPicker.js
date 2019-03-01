import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { View, Platform } from "react-native";
import { Picker } from "native-base";
import MasterStyles from '../../MasterStyles';



class MyPicker extends Component {
    static propTypes = {
        placeholder: PropTypes.string,
        iosHeader: PropTypes.string,
        value: PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.number
        ]),
        onChange: PropTypes.func,
        style: PropTypes.object,
        disabled: PropTypes.bool,
        options: PropTypes.array
    };


    constructor(props) {
        super(props);
        this.state = { placeholder: this.props.placeholder, value: this.props.value }
    }

    render() {
        return (
            <View style={MasterStyles.picker}>
                {
                    Platform.OS === "ios" ?
                        <Picker style={{ flex: 1 }}
                            mode="dropdown"
                            placeholder={this.props.placeholder}
                            iosHeader={this.props.iosHeader}
                            selectedValue={this.state.value}
                            onValueChange={this.changed.bind(this)}>
                            {
                                this.props.options.map((item) => {
                                    return <Picker.Item key={item.value} label={item.label} value={item.value} />
                                })
                            }
                        </Picker>
                        :
                        <Picker style={{ flex: 1 }}
                            mode="dropdown"
                            placeholder={this.props.placeholder}
                            selectedValue={this.state.value}
                            onValueChange={this.changed.bind(this)}>
                            <Picker.Item label={this.props.placeholder} value={null} />
                            {
                                this.props.options.map((item) => {
                                    return <Picker.Item key={item.value} label={item.label} value={item.value} />
                                })
                            }
                        </Picker>
                }
            </View>
        );
    }

    changed(itemValue, itemIndex) {
        this.setState({ value: itemValue }, () => {
            this.props.onChange(itemValue, itemIndex);
        })
    }
}

export default MyPicker;