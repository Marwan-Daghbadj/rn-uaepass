# rn-uaepass (🚫 Under Development 🚫)

## 🚫Note : Please note that all the steps are important.

`rn-uaepass` is a React Native component for integrating UAEPass authentication into your mobile applications. This package simplifies the process of authenticating users using UAEPass, ensuring secure and seamless integration with your app.

## Installation

To install the package, run:

```bash
npm install react-native-webview rn-uaepass
```
```bash
cd ios && pod install
```

## iOS Setup

### 1. Configure Deep Linking

Follow <a href="https://reactnavigation.org/docs/deep-linking/#setup-on-ios" target="_blank">React Navigation Deep Linking Guide</a>

### 2. Update `Info.plist`

Add the following lines to your `Info.plist` file to handle UAEPass URLs:

```xml
<key>LSApplicationQueriesSchemes</key>
<array>
    <string>uaepassstg</string>
    <string>uaepass</string>
</array>
```

Next, add your app’s deep linking scheme:

```xml
<key>CFBundleURLTypes</key>
<array>
    <dict>
        <key>CFBundleURLSchemes</key>
        <array>
            <string>your_app_scheme</string>
        </array>
    </dict>
</array>
```


## Android Setup

### . Update `AndroidManifest.xml`

```xml
<intent-filter android:label="@string/app_name" android:autoVerify="true">
  <action android:name="android.intent.action.VIEW" />
  <category android:name="android.intent.category.DEFAULT" />
  <category android:name="android.intent.category.BROWSABLE" />
  <data android:scheme="your_app_scheme" />
</intent-filter>
```

Replace `your_app_scheme` with your actual your app scheme registered with UAEPass Service.

For better use `your_app_scheme://uaepass` this way the package will handle only the uaepass authentication.


## Usage Example

```javascript
import UAEPass from "rn-uaepass";
import { View, Text, Alert } from "react-native";

<UAEPass
  state="production"
  clientId="your_client_id" // Must be registered in the UAEPass service
  redirectUri="your_app_scheme" // Must be registered in the UAEPass service
  showCloseBtn={true}
  onCode={(code) => {
    Alert.alert("Code", code);
  }}
  onCancel={() => {
    Alert.alert("Cancel", "User cancelled authentication");
  }}
  onError={(error) => {
    Alert.alert("Error", error);
  }}
>
    <View style={styles.container}>
      <Text style={styles.text}>Login with UAEPass!</Text>
    </View>
</UAEPass>

const styles = {
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    fontSize: 18,
    color: "#000",
  },
};

```

## Get Access Token from Code
```javascript
const myHeaders = new Headers();
myHeaders.append("Content-Type", "multipart/form-data");
myHeaders.append("Authorization", `Basic ${password}`);

const requestOptions = {
  method: "POST",
  headers: myHeaders,
  redirect: "follow"
};

fetch(`https://stg-id.uaepass.ae/idshub/token?grant_type=authorization_code&redirect_uri=${redirectUri}&code=${code}`, requestOptions)
  .then((response) => response.text())
  .then((result) => console.log('accessToken', result.access_token))
  .catch((error) => console.error(error));
```
## Get User Details from Access Token 
```javascript
const myHeaders = new Headers();
myHeaders.append("Authorization", `Bearer ${accessToken}`);

const requestOptions = {
  method: "GET",
  headers: myHeaders,
  redirect: "follow"
};

fetch("https://stg-id.uaepass.ae/idshub/userinfo", requestOptions)
  .then((response) => response.text())
  .then((result) => console.log('user details', result))
  .catch((error) => console.error(error));
```

### Production links
```bash
https://id.uaepass.ae/idshub/token
https://id.uaepass.ae/idshub/userinfo
```


<a href="https://docs.uaepass.ae/guides/authentication/web-application" target="_blank">Follow the UAEPass Doc for more information</a>


## Contact

Reach me at <a href="https://www.mar1-dev.com/" target="_blank">https://www.mar1-dev.com/</a>