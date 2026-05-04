/**
 * @format
 */

import 'react-native-gesture-handler';
import { applyGlobalTypography } from './src/bootstrap/typography';
import { AppRegistry } from 'react-native';
import App from './App';

applyGlobalTypography();
import { name as appName } from './app.json';

AppRegistry.registerComponent(appName, () => App);
