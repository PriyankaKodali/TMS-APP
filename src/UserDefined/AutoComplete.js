import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { View, Keyboard, TextInput, FlatList, Text, TouchableOpacity, Modal } from "react-native";
import { Icon, Button } from "native-base";
import MasterStyles from '../../MasterStyles';
import Fuse from 'fuse.js';



class AutoComplete extends Component {
    static propTypes = {
        placeholder: PropTypes.string,
        label: PropTypes.string,
        value: PropTypes.object,
        onSelect: PropTypes.func,
        style: PropTypes.object,
        disabled: PropTypes.bool,
        options: PropTypes.array,
    };


    constructor(props) {
        super(props);
        this.state = {
            placeholder: this.props.placeholder, options: this.props.options, label: this.props.label,
            suggestions: [], selectedOption: this.props.value, textValue: "", modalVisible: false
        }
    }

    componentWillReceiveProps(nextProps, nextState) {
        this.setState({ value: nextProps.value, options: nextProps.options });
    }

    render() {
        return (
            <View style={{ flex: 1 }}>
                <View style={{ height: 45, borderColor: '#ccc', borderWidth: 1, borderRadius: 5, }}>
                    <TouchableOpacity style={{
                        height: 45,
                        paddingLeft: 16,
                        paddingRight: 16,
                        paddingTop: 6,
                        paddingBottom: 6,
                        width: '100%'
                    }} onPress={() => { this.setState({ modalVisible: true }, () => { setTimeout(() => { this.refs.inputTextBox.focus(); }, 1); }); }}>
                        {
                            this.state.selectedOption ?
                                <View>
                                    <Text style={{ height: 33, lineHeight: 33 }}>{this.state.textValue}</Text>
                                    <TouchableOpacity style={{
                                        position: "absolute",
                                        right: -10,
                                        zIndex: 10000,
                                        height: 33,
                                    }} onPress={() => this.clearValue()}>
                                        <Icon style={{ color: "red", padding: 0, fontSize: 17, lineHeight: 33 }}
                                            active type="FontAwesome" name="times-circle" />
                                    </TouchableOpacity>
                                </View>

                                :
                                <Text style={{ height: 33, lineHeight: 33, color: '#bbb' }}>{this.state.placeholder}</Text>
                        }
                    </TouchableOpacity>
                </View>
                <Modal
                    animationType="fade"
                    transparent={false}
                    visible={this.state.modalVisible}
                    onRequestClose={() => {
                    }}>

                    <View style={{ flex: 1, flexDirection: "column", marginTop: 10 }}>
                        <View style={MasterStyles.inputContainer}>
                            <Text style={MasterStyles.label}>{this.state.label}</Text>
                            <TextInput style={MasterStyles.textInput} autoFocus={true}
                                placeholder={this.state.placeholder}
                                value={this.state.textValue}
                                onChangeText={this.onTyping.bind(this)}
                                ref="inputTextBox"
                            />
                        </View>
                        <FlatList
                            style={{
                                borderTopWidth: 1,
                                borderColor: "#cecece",
                                flexGrow: 1
                            }}
                            keyExtractor={(item, index) => Math.random() + item.label}
                            data={this.state.suggestions}
                            renderItem={({ item }) =>
                                <TouchableOpacity
                                    onPress={() => this.onSelect(item)}
                                    style={{ padding: 10, borderWidth: 1, borderTopWidth: 0, borderColor: "#cecece" }}>
                                    <Text>{item.label}</Text>
                                </TouchableOpacity>
                            }
                        />


                        <Button full danger onPress={() => this.setState({ modalVisible: false })}>
                            <Text>Cancel</Text>
                        </Button>
                    </View>
                </Modal>
            </View>
        );
    }

    onTyping(text) {
        this.setState({ textValue: text });
        if (text.length < 3) {
            this.setState({ suggestions: [] });
            return;
        }
        var fuseOptions = {
            keys: ['label'],
        };
        var fuse = new Fuse(this.state.options, fuseOptions);

        this.setState({ suggestions: fuse.search(text) });
    }

    clearValue() {
        this.setState({ selectedOption: null, textValue: "" }, () => {
            this.props.onSelect(null);
        })
    }

    onSelect(item) {
        this.setState({ selectedOption: item, textValue: item.label, suggestions: [], modalVisible: false }, () => {
            Keyboard.dismiss();
            this.props.onSelect(item);
        })
    }
}

export default AutoComplete;


// {
//     this.state.selectedOption ?
//         <TouchableOpacity style={{
//             position: "absolute",
//             right: 0,
//             zIndex: 10000,
//             height: 45,
//             padding: 10,
//         }} onPress={() => this.clearValue()}>
//             <Icon style={{ color: "red", padding: 0, fontSize: 17, lineHeight: 25 }}
//                 active type="FontAwesome" name="times-circle" />
//         </TouchableOpacity>
//         :
//         <View></View>
// }



// {
//     this.state.suggestions.length > 0 ?
//         <View style={{
//             marginLeft: 10,
//             marginRight: 10,
//             position: "absolute",
//             bottom: 0,
//             height: 300,
//             zIndex: 10000,
//             backgroundColor: "#fff",
//         }}>

//         </View>
//         :
//         <View style={{ display: "none" }}></View>
// }