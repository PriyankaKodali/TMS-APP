import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Text, TouchableOpacity, View } from "react-native";
import moment from 'moment';
import { Icon } from "native-base";
import { DatePickerDialog } from 'react-native-datepicker-dialog';



class DateSelector extends Component {
    static propTypes = {
        placeholder: PropTypes.string,
        value: PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.instanceOf(Date)
        ]),
        onChange: PropTypes.func,
        style: PropTypes.object,
        disabled: PropTypes.bool
    };


    constructor(props) {
        super(props);
        var date = moment(this.props.value).isValid() ? moment(this.props.value).format('DD-MM-YYYY') : null;
        this.state = { placeholder: this.props.placeholder, value: date }
    }

    render() {
        return (

            <View>
                <View style={{ height: 45, borderColor: '#ccc', borderWidth: 1, borderRadius: 5 }}>
                    <TouchableOpacity
                        onPress={this.openDatePicker.bind(this)}
                        style={{
                            height: 45,
                            paddingLeft: 16,
                            paddingRight: 16,
                            paddingTop: 6,
                            paddingBottom: 6,
                            width: '100%'
                        }}>
                        {
                            this.state.value ?
                                <View>
                                    <Text style={{ height: 33, lineHeight: 33 }}>{this.state.value}</Text>
                                    <TouchableOpacity style={{
                                        position: "absolute",
                                        right: -10,
                                        zIndex: 10000,
                                        height: 33,
                                    }} onPress={() => this.clearDate()}>
                                        <Icon style={{ color: "red", padding: 0, fontSize: 17, lineHeight: 33 }}
                                            active type="FontAwesome" name="times-circle" />
                                    </TouchableOpacity>
                                </View>
                                :
                                <Text style={{ height: 33, lineHeight: 33, color: '#bbb' }}>{this.state.placeholder}</Text>
                        }
                    </TouchableOpacity>
                    <DatePickerDialog ref="DatePickerDialog" onDatePicked={this.onDatePickedFunction.bind(this)} />
                </View>
            </View>

        );
    }

    clearDate() {
        if (this.props.disabled) {
            return;
        }
        if (this.state.value) {
            this.setState({ value: null }, () => {
                if (typeof this.props.onChange === "function") {
                    this.props.onChange(null)
                }
            });
        }
        else {
            this.DatePickerMainFunctionCall();
        }
    }

    openDatePicker() {
        if (this.props.disabled) {
            return;
        }
        let DateHolder = this.state.DateHolder;
        if (!DateHolder || DateHolder == null) {
            DateHolder = new Date();
            this.setState({
                DateHolder: DateHolder
            });
        }
        //To open the dialog
        this.refs.DatePickerDialog.open({
            date: DateHolder,
        });
    }

    onDatePickedFunction(date) {
        this.setState({
            value: moment(date).format('DD-MM-YYYY')
        }, () => {
            if (typeof this.props.onChange === "function") {
                this.props.onChange(date)
            }

        });
    }

}

export default DateSelector;