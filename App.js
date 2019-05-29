import React from 'react';
import { createDrawerNavigator, createStackNavigator } from 'react-navigation';
import { Root, Spinner } from 'native-base';
import SideBar from './SideBar';
import { isLoggedIn } from './MyAjax';
 
//Import all Screens Here
import Attendance from './src/Attendance.js';
import Dashboard from './src/Dashboard.js';
import Login from './src/Login.js';
import Logout from './src/Logout.js';
import TaskDetail from './src/TaskDetail.js';
import TaskList from './src/TaskList.js';
import StockForProject from './src/Stock/StockForProject';
import StockRequests from './src/Stock/StockRequests';
import StockRequestDetail from './src/Stock/StockRequestDetail';
import StockRequestView from './src/Stock/StockRequestView';
import MyReport from './src/MyReport.js';
import TopPerformers from './src/TopPerformers';

var RootStack = createDrawerNavigator({
  Attendance: {
    screen: Attendance,
  },
  Dashboard: {
    screen: Dashboard,
  },
  TaskDetail: {
    screen: TaskDetail
  },
  TaskList: {
    screen: TaskList
  },
  StockForProject: {
    screen: StockForProject
  },
  StockRequestView: {
    screen: StockRequestView
  },
  StockRequests: {
    screen: StockRequests
  },
  StockRequestDetail: {
    screen: StockRequestDetail
  },
  MyReport: {
    screen: MyReport
  },
  TopPerformers:{
    screen: TopPerformers
  },
  Logout: {
    screen: Logout,
  }
},
  {
    initialRouteName: 'TaskList',
    contentComponent: props => <SideBar {...props} />,
    headerMode: 'none'
  });

var AppNavigator = createStackNavigator({

  Drawer: { screen: RootStack },
  Login: {
    screen: Login,
    navigationOptions: {
      gesturesEnabled: false,
    }
  }
},
  {
    initialRouteName: "Login",
    headerMode: "none"
  });


class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = { loading: true, IsLoggedIn: isLoggedIn() };
  }

  componentWillMount() {
    this.ChangeLoginStatus();
  }

  ChangeLoginStatus() {
    this.setState({ IsLoggedIn: isLoggedIn() }, () => { this.setState({ loading: false }); });
  }

  render() {
    if (this.state.loading) {
      return (
        <Root>
          <Spinner color='#03a9f4' />
        </Root>
      );
    }
    return (
      <Root>
        <AppNavigator />
      </Root>
    );
  }
}


export default App
