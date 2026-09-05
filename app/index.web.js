import { AppRegistry } from 'react-native';
import App from './App';
import appJson from './app.json';

// Inject React Native Web reset CSS styles so root containers expand to full height
const style = document.createElement('style');
style.type = 'text/css';
style.appendChild(document.createTextNode(`
  html, body, #root {
    height: 100%;
    width: 100%;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    background-color: #F8FAF9;
  }
  #root > div {
    height: 100%;
    width: 100%;
    display: flex;
    flex-direction: column;
    flex: 1;
  }
`));
document.head.appendChild(style);

const appName = appJson.name || 'MandiSetu';

AppRegistry.registerComponent(appName, () => App);

AppRegistry.runApplication(appName, {
  initialProps: {},
  rootTag: document.getElementById('root'),
});
