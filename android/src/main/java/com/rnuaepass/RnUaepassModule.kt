package com.rn.uaepass;

import android.content.pm.PackageManager;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Promise
class RnUaepassModule(reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext) {

  override fun getName(): String {
    return NAME
  }
  @ReactMethod
  fun isAppInstalled(packageName: String, promise: Promise) {
    try {
        val packageManager = reactApplicationContext.packageManager
        packageManager.getPackageInfo(packageName, PackageManager.GET_ACTIVITIES)
        promise.resolve(true)
    } catch (e: PackageManager.NameNotFoundException) {
        promise.resolve(false)
    } catch (e: Exception) {
        promise.reject("ERROR", "An unexpected error occurred", e)
    }
  }
  companion object {
    const val NAME = "RnUaepass"
  }
}
