export async function enableNotifications() {
  if (!window.OneSignalDeferred) {
    return { ok: false, message: "OneSignal غير جاهز" };
  }

  try {
    window.OneSignalDeferred.push(function (OneSignal) {
      OneSignal.Notifications.requestPermission();
    });

    return { ok: true, message: "تم طلب تفعيل الإشعارات" };
  } catch (error) {
    console.error(error);
    return { ok: false, message: "فشل تفعيل الإشعارات" };
  }
}
