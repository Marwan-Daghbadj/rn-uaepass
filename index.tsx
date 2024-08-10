import React, { useEffect, useState } from "react";
import { Alert, Linking, Modal, Platform, Pressable, Text } from "react-native";
import { WebView } from "react-native-webview";
import { NativeModules } from "react-native";
const LINKING_ERROR =
  `The package 'rn-uaepass' doesn't seem to be linked. Make sure: \n\n` +
  Platform.select({ ios: "- You have run 'pod install'\n", default: "" }) +
  "- You rebuilt the app after installing the package\n" +
  "- You are not using Expo Go\n";
const RnUaepass = NativeModules.RnUaepass
  ? NativeModules.RnUaepass
  : new Proxy(
      {},
      {
        get() {
          throw new Error(LINKING_ERROR);
        },
      }
    );
console.log(RnUaepass);

// RnUaepass.multiply(1, 2).then((res: number) => {
//   console.log(res);
// });

// export const isAppInstalled = (packageName: string): Promise<boolean> => {
//   return new Promise((resolve, reject) => {
//     RNUAEPass.isAppInstalled(
//       packageName,
//       (result: boolean) => {
//         resolve(result);
//       },
//       (error: any) => {
//         reject(error);
//       }
//     );
//   });
// };
type UAEPassProps = {
  state?: "staging" | "production";
  clientId: string;
  redirectUri: string;
  children: React.ReactNode;
  showCloseBtn: boolean;
  onCode: (code: string) => void;
  onCancel: () => void;
  onError: (error: any) => void;
};
const UAEPass: React.FC<UAEPassProps> = ({
  state,
  clientId,
  redirectUri,
  children,
  showCloseBtn,
  onCode,
  onCancel,
  onError,
}) => {
  let [uri, setUri] = useState("");
  let [visible, setVisible] = useState(false);
  function lunchAuthentication() {
    if (!state)
      return Alert.alert(
        "Please select your app state 'Staging or Production'"
      );
    if (!clientId) return Alert.alert("Please set your clientId");
    if (!redirectUri) return Alert.alert("Please set your redirectUri");
    let authLink = `client_id=${clientId}&redirect_uri=${redirectUri}`;
    switch (state) {
      case "staging":
        Linking.canOpenURL("uaepassstg://")
          .then((supported: boolean) => {
            if (supported)
              setUri(
                `https://stg-id.uaepass.ae/idshub/authorize?${authLink}&response_type=code&acr_values=urn%3Adigitalid%3Aauthentication%3Aflow%3Amobileondevice&scope=urn%3Auae%3Adigitalid%3Aprofile%3Ageneral&state=ShNP22hyl1jUU2RGjTRkpg%3D%3D`
              );
            else
              setUri(
                `https://stg-id.uaepass.ae/idshub/authorize?response_type=code&${authLink}&scope=urn:uae:digitalid:profile:general&state=HnlHOJTkTb66Y5H&acr_values=urn:safelayer:tws:policies:authentication:level:low`
              );
          })
          .catch(() => {
            setUri(
              `https://stg-id.uaepass.ae/idshub/authorize?response_type=code&${authLink}&scope=urn:uae:digitalid:profile:general&state=HnlHOJTkTb66Y5H&acr_values=urn:safelayer:tws:policies:authentication:level:low`
            );
          });
        break;
      case "production":

        // Linking.canOpenURL("uaepass://")
        //   .then((supported: boolean) => {
        //     console.log(supported);

        //     if (supported)
        //       setUri(
        //         `https://id.uaepass.ae/idshub/authorize?${authLink}&response_type=code&acr_values=urn%3Adigitalid%3Aauthentication%3Aflow%3Amobileondevice&scope=urn%3Auae%3Adigitalid%3Aprofile%3Ageneral&state=ShNP22hyl1jUU2RGjTRkpg%3D%3D`
        //       );
        //     else {
        //       setUri(
        //         `https://id.uaepass.ae/idshub/authorize?response_type=code&${authLink}&scope=urn:uae:digitalid:profile:general&state=HnlHOJTkTb66Y5H&acr_values=urn:safelayer:tws:policies:authentication:level:low`
        //       );
        //     }
        //   })
        //   .catch(() => {
        //     setUri(
        //       `https://id.uaepass.ae/idshub/authorize?response_type=code&${authLink}&scope=urn:uae:digitalid:profile:general&state=HnlHOJTkTb66Y5H&acr_values=urn:safelayer:tws:policies:authentication:level:low`
        //     );
        //   });
        break;
    }
    setVisible(true);
  }
  const onShouldStartLoadWithRequest = (nativeEvent: any): boolean => {
    let { url } = nativeEvent;
    if (url.startsWith("uaepass")) {
      if (state == "staging") {
        url = url.replace("uaepass://", "uaepassstg://");
      }
      const uaepassUrl = url;
      const urlParts = uaepassUrl.split("?");
      const baseUrl = urlParts[0];
      const queryParameters = urlParts[1].split("&");
      let successUrl, failureUrl;
      queryParameters.forEach((param: string) => {
        const [key, value] = param.split("=");
        if (key === "successurl") {
          successUrl = value;
        } else if (key === "failureurl") {
          failureUrl = value;
        }
      });
      const modifiedSuccessUrl = `${redirectUri}?url=${successUrl}`;
      const modifiedFailureUrl = `${redirectUri}?url=${failureUrl}`;
      const modifiedUaepassUrl = `${baseUrl}?successurl=${modifiedSuccessUrl}&failureurl=${modifiedFailureUrl}`;
      Linking.openURL(modifiedUaepassUrl)
        .then(() => {})
        .catch((error: any) => {
          onError && onError(error);
        });
      return false;
    }
    if (url.startsWith(redirectUri)) {
      try {
        url
          .split("?")[1]
          .split("&")
          .forEach((param: string) => {
            const [key, value] = param.split("=");
            if (key == "code") {
              setVisible(false);
              return onCode && onCode(value);
            }
            if (value == "cancelledOnApp") {
              setVisible(false);
              return onCancel && onCancel();
            }
            if (value == "CANCELLED_ON_MOBILE") {
              setVisible(false);
              return onCancel && onCancel();
            }
          });
      } catch (error: any) {
        onError && onError(error);
      }
    } else {
      return true;
    }
    return true;
  };
  const handleDeepLink = (event: any) => {
    let { url } = event;
    let newLink = url?.split(`${redirectUri}?url=`)[1];
    setUri(newLink);
  };
  useEffect(() => {
    Linking.addEventListener("url", handleDeepLink);
    return () => {
      try {
        //@ts-ignore
        Linking.removeEventListener("url", handleDeepLink);
      } catch (error) {}
    };
  }, []);
  return (
    <React.Fragment>
      <Pressable onPress={lunchAuthentication}>{children}</Pressable>
      <Modal
        visible={visible}
        presentationStyle="pageSheet"
        animationType="slide"
        style={{ position: "relative" }}
      >
        {showCloseBtn && (
          <Pressable
            style={{
              position: "absolute",
              top: 5,
              right: 5,
              paddingVertical: 10,
              paddingHorizontal: 15,
              zIndex: 1,
            }}
            onPress={(_) => setVisible(false)}
          >
            <Text style={{ fontSize: 30, fontWeight: "bold" }}>X</Text>
          </Pressable>
        )}
        <WebView
          cacheEnabled={false}
          source={{ uri }}
          style={{ flex: 1 }}
          onShouldStartLoadWithRequest={onShouldStartLoadWithRequest}
          originWhitelist={[
            "http://*",
            "https://*",
            "uaepass://*",
            "uaepassstg://*",
            `${redirectUri}*`,
          ]}
        />
      </Modal>
    </React.Fragment>
  );
};

export default UAEPass;
