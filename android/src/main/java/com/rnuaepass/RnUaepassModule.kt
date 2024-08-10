package com.rn.uaepass;

import android.content.pm.PackageManager;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Callback;

class RnUaepassModule(reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext) {

  override fun getName(): String {
    return NAME
  }
  @ReactMethod
  fun isAppInstalled(packageName: String, successCallback: Callback, errorCallback: Callback) {
      try {
          val packageManager = reactApplicationContext.packageManager
          packageManager.getPackageInfo(packageName, PackageManager.GET_ACTIVITIES)
          successCallback.invoke(true)
      } catch (e: PackageManager.NameNotFoundException) {
          successCallback.invoke(false)
      }
  }
  companion object {
    const val NAME = "RnUaepass"
  }
}
