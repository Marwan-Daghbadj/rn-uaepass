import React, { useEffect, useState } from "react";
import { Alert, Linking, Modal, Platform, Pressable, Text } from "react-native";
import { WebView } from "react-native-webview";
import { NativeModules } from "react-native";
const RnUaepass =
  Platform.OS == "android" && NativeModules.RnUaepass
    ? NativeModules.RnUaepass
    : new Proxy(
        {},
        {
          get() {
            throw new Error(
              "Error in the package 'rn-uaepass', please update or contact the developer :( "
            );
          },
        }
      );

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
  async function lunchAuthentication() {
    if (!state || (state !== "staging" && state !== "production")) {
      return Alert.alert(
        "App State",
        "Please select your app state 'Staging or Production'"
      );
    }
    if (!clientId) return Alert.alert("Client ID", "Please set your clientId");
    if (!redirectUri)
      return Alert.alert("Redirect URI", "Please set your redirectUri");
    const authLink = `client_id=${clientId}&redirect_uri=${redirectUri}`;
    const formattedAuthLink = {
      staging: {
        ios: "uaepassstg://",
        android: "ae.uaepass.mainapp.stg",
        installedLink: `https://stg-id.uaepass.ae/idshub/authorize?${authLink}&response_type=code&acr_values=urn%3Adigitalid%3Aauthentication%3Aflow%3Amobileondevice&scope=urn%3Auae%3Adigitalid%3Aprofile%3Ageneral&state=ShNP22hyl1jUU2RGjTRkpg%3D%3D`,
        notInstalledLink: `https://stg-id.uaepass.ae/idshub/authorize?response_type=code&${authLink}&scope=urn:uae:digitalid:profile:general&state=HnlHOJTkTb66Y5H&acr_values=urn:safelayer:tws:policies:authentication:level:low`,
      },
      production: {
        ios: "uaepass://",
        android: "ae.uaepass.mainapp",
        installedLink: `https://id.uaepass.ae/idshub/authorize?${authLink}&response_type=code&acr_values=urn%3Adigitalid%3Aauthentication%3Aflow%3Amobileondevice&scope=urn%3Auae%3Adigitalid%3Aprofile%3Ageneral&state=ShNP22hyl1jUU2RGjTRkpg%3D%3D`,
        notInstalledLink: `https://id.uaepass.ae/idshub/authorize?response_type=code&${authLink}&scope=urn:uae:digitalid:profile:general&state=HnlHOJTkTb66Y5H&acr_values=urn:safelayer:tws:policies:authentication:level:low`,
      },
    };
    try {
      let isInstalled;
      if (Platform.OS === "ios") {
        isInstalled = await Linking.canOpenURL(formattedAuthLink[state].ios);
      } else if (Platform.OS === "android") {
        isInstalled = await RnUaepass.isAppInstalled(
          formattedAuthLink[state].android
        );
      }
      setUri(
        isInstalled
          ? formattedAuthLink[state].installedLink
          : formattedAuthLink[state].notInstalledLink
      );
    } catch (error) {
      setUri(formattedAuthLink[state].notInstalledLink);
    } finally {
      setVisible(true);
    }
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
