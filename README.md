# rn-uaepass

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

## 🚫Before you start

Make sure you have installed both the Production and Staging apps of UAEPass. You can download them from <a href="https://docs.uaepass.ae/resources/staging-apps">https://docs.uaepass.ae/resources/staging-apps</a>

## iOS Setup

### 1. Configure Deep Linking

You'll need to link RCTLinking to your project by following the steps described here. To be able to listen to incoming app links, you'll need to add the following lines to AppDelegate.m in your project:
```javascript
// Add the header at the top of the file:
#import <React/RCTLinkingManager.h>

// Add this inside `@implementation AppDelegate` above `@end`:
- (BOOL)application:(UIApplication *)application
   openURL:(NSURL *)url
   options:(NSDictionary<UIApplicationOpenURLOptionsKey,id> *)options
{
  return [RCTLinkingManager application:application openURL:url options:options];
}
```
If your app is using Universal Links, you'll need to add the following code as well:
```javascript
// Add this inside `@implementation AppDelegate` above `@end`:
- (BOOL)application:(UIApplication *)application continueUserActivity:(nonnull NSUserActivity *)userActivity
 restorationHandler:(nonnull void (^)(NSArray<id<UIUserActivityRestoring>> * _Nullable))restorationHandler
{
 return [RCTLinkingManager application:application
                  continueUserActivity:userActivity
                    restorationHandler:restorationHandler];
}
```
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

### Update `AndroidManifest.xml`

```xml
<application ...>
  <activity ...>
    //other intents
    //app_scheme start
    <intent-filter android:label="@string/app_name" android:autoVerify="true">
      <action android:name="android.intent.action.VIEW" />
      <category android:name="android.intent.category.DEFAULT" />
      <category android:name="android.intent.category.BROWSABLE" />
      <data android:scheme="your_app_scheme" />
    </intent-filter>
  //app_scheme end
  </activity>
</application>
```

Replace `your_app_scheme` with your actual your app scheme registered with UAEPass Service.


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
## Usage Example with Ref

```javascript
import UAEPass from "rn-uaepass";
import React, {useRef} from 'react';
import { Text, Alert, Pressable } from "react-native";



let uaePassRef = useRef();



<Pressable 
lunchAuthentication  onPress={_ => {
   uaePassRef.current?.lunchAuthentication();
   }}
  style={styles.container}>
    <Text style={styles.text}>Login with UAEPass!</Text>
</Pressable>


<UAEPass
  ref={uaePassRef}
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
let basicAuthorization=btoa(`${client_id}:${password}`)
const myHeaders = new Headers();
myHeaders.append("Content-Type", "multipart/form-data");
myHeaders.append("Authorization", `Basic ${basicAuthorization}`);

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

## Useful remarks:
When submitting your request to the UAEPASS authorities, make sure your redirect url is like this : your_app_scheme://uaepass

<a href="https://docs.uaepass.ae/guides/authentication/web-application" target="_blank">Follow the UAEPass Doc for more information</a>



## Disclaimer:
This project is not affiliated with or endorsed by UAE Pass or the government of the United Arab Emirates. It is an independent open-source project created for the purpose of integrating UAE Pass functionality into React Native applications.

## Author
Reach me at <a href="https://www.mar1-dev.com/" target="_blank">https://www.mar1-dev.com/</a>

## Issues
Tell us more about your issue <a href="https://github.com/Marwan-Daghbadj/rn-uaepass/issues/1">here</a>