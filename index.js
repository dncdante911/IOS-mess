// ⚠️ ПЕРВЫМ ИМПОРТОМ, ДО ВСЕГО ОСТАЛЬНОГО.
//
// В Hermes (движок JS в React Native) нет ни crypto.getRandomValues, ни
// crypto.subtle — в отличие от браузера и Electron, где работает
// windows-messenger. Библиотеки @noble/*, на которых держится весь E2EE,
// берут случайность именно из crypto.getRandomValues: без полифилла первая же
// генерация ключа падает с "crypto.getRandomValues must be defined", причём
// не при сборке, а в рантайме — на живом устройстве.
//
// react-native-get-random-values подставляет нативную реализацию (SecRandom на
// iOS) в globalThis.crypto. Импорт обязан стоять раньше любого кода, который
// может дёрнуть криптографию: раньше App, раньше сторов, раньше сервисов.
import 'react-native-get-random-values';

import { registerRootComponent } from 'expo';
import App from './App';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately.
registerRootComponent(App);
