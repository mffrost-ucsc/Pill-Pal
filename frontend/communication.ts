import { Platform } from 'react-native';
const ServerAddr = Platform.OS == 'ios' ? 'localhost' : '10.0.2.2'
const ServerPort = '5000'
export { ServerAddr, ServerPort }
